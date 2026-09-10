/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/getselection
 */

import { toArray, type ArrayOrItem } from '../toarray.js';
import { isNativeShadowRoot } from './isshadowroot.js';
import { isDomSelectionBackward } from './isdomselectionbackward.js';
import { isComment } from './iscomment.js';
import { isText } from './istext.js';

/**
 * Returns the selection of the tree the given node lives in.
 *
 * Use it instead of `window.getSelection()`, which cannot see into a shadow root: its `anchorNode` and
 * `focusNode` point at the host of the tree, not at the nodes selected inside it.
 *
 * Pass the node the selection is read for, usually an editable. Pass several nodes to cover several editables
 * at once. A node in the light DOM gives the document selection, unchanged. Works with open and closed shadow
 * roots.
 *
 * The result behaves like a `Selection` – the part of one the editor uses – so read it and change it the same
 * way. It is `null` when there is no selection to read: a detached node, or a document with no window.
 *
 * One thing this helper cannot fix. In Safari and Chromium browsers, a selection made with the mouse inside a
 * shadow root reports no direction, so a backward selection may look forward. Chromium is asked through its own
 * API where possible. Safari has none.
 *
 * @param nodeOrNodes The node (or nodes) whose tree's selection should be returned.
 */
export function getSelection( nodeOrNodes: ArrayOrItem<Node> ): Selection | ShadowSelection | null {
	const nodes = toArray( nodeOrNodes );

	if ( !nodes.length ) {
		return null;
	}

	const shadowRoots = new Set<ShadowRoot>();

	// Collected here rather than checked at each use below, so everything downstream – the composed ranges,
	// the direction lookup, the older-Chromium fallback – inherits the filter. A synthetic root is left out
	// on purpose: it cannot be passed to `getComposedRanges()` and its `getSelection()` throws, and dropping
	// it lands on the light-DOM path at the end, which reads the right nodes for such a root anyway.
	for ( const node of nodes ) {
		const treeRoot = node.getRootNode();

		if ( isNativeShadowRoot( treeRoot ) ) {
			shadowRoots.add( treeRoot );
		}
	}

	if ( shadowRoots.size ) {
		const [ firstShadowRoot ] = shadowRoots;

		// A document with no browsing context (for example one created by `DOMParser`) has no window and
		// therefore no selection, consistent with the light-DOM path below.
		const domWindow = firstShadowRoot.ownerDocument.defaultView;

		if ( !domWindow ) {
			return null;
		}

		const domSelection = domWindow.getSelection() as ComposedSelection | null;

		// The document selection retargets shadow nodes to the host, but `getComposedRanges()`
		// returns ranges that pierce the provided shadow roots. Chrome and Edge 137+, Firefox 142+ and
		// Safari 17+ have it – Baseline since August 2025.
		if ( domSelection && typeof domSelection.getComposedRanges == 'function' ) {
			return new ShadowSelection( domSelection, Array.from( shadowRoots ) );
		}

		// Older Chromium (before `getComposedRanges()` in Chrome and Edge 137): the non-standard,
		// Chromium-only `ShadowRoot#getSelection()` returns a shadow-scoped selection with shadow-piercing
		// `anchorNode`/`focusNode`, reliable for user selections where the document-level selection
		// retargets and its `direction` is `'none'`.
		for ( const shadowRoot of shadowRoots ) {
			const shadowRootSelection = shadowRoot as ShadowRootWithSelection;

			if ( typeof shadowRootSelection.getSelection == 'function' ) {
				const selection = shadowRootSelection.getSelection();

				// Use the shadow-scoped selection only if it is anchored to the given shadow root.
				if ( selection?.anchorNode ) {
					return selection;
				}
			}
		}

		// Older Firefox (and any other engine without the APIs above): the document selection already
		// reaches into the shadow tree.
		return domSelection;
	}

	// Light DOM. The selection comes from the first node attached to a document with a browsing context;
	// a fully detached set (or a document with no browsing context) has none.
	for ( const node of nodes ) {
		if ( !node.isConnected ) {
			continue;
		}

		const domWindow = node.ownerDocument?.defaultView;

		if ( domWindow ) {
			return domWindow.getSelection();
		}
	}

	return null;
}

/**
 * A `Selection` view over the composed ranges of a set of shadow roots. Read accessors are resolved live
 * from the composed ranges on each access, so the view stays in sync with the underlying document selection;
 * selection mutations are delegated to it. Only the subset of the `Selection` interface consumed by the
 * editor is implemented, so `getSelection()` returns it alongside the native `Selection`.
 */
export class ShadowSelection {
	/**
	 * The underlying document-level selection that mutations are delegated to and composed ranges read
	 * from.
	 */
	private readonly _domSelection: ComposedSelection;

	/**
	 * The shadow roots the composed ranges are resolved against.
	 */
	private readonly _shadowRoots: Array<ShadowRoot>;

	/**
	 * Whether the engine only accepts the legacy rest-parameter form of `getComposedRanges()`. This is
	 * a fixed property of the engine, so it is detected once (the first call throws on the dictionary
	 * form) and cached for all instances, keeping the exception off the selection-read hot path.
	 */
	private static _useLegacyComposedRanges = false;

	/**
	 * @internal
	 */
	constructor( domSelection: Selection, shadowRoots: Array<ShadowRoot> ) {
		this._domSelection = domSelection as ComposedSelection;
		this._shadowRoots = shadowRoots;
	}

	public get rangeCount(): number {
		return this._getRanges().length;
	}

	public get isCollapsed(): boolean {
		const ranges = this._getRanges();

		return !ranges.length || ranges[ 0 ].collapsed;
	}

	public get anchorNode(): Node | null {
		return this._getEndpoint( 'anchor' ).node;
	}

	public get anchorOffset(): number {
		return this._getEndpoint( 'anchor' ).offset;
	}

	public get focusNode(): Node | null {
		return this._getEndpoint( 'focus' ).node;
	}

	public get focusOffset(): number {
		return this._getEndpoint( 'focus' ).offset;
	}

	/**
	 * The direction of the selection, resolved against the tree the first composed range lives in. It is
	 * already computed to orient the anchor and focus endpoints, so exposing it lets consumers read the
	 * orientation directly instead of re-deriving it from the endpoints.
	 */
	public get direction(): 'forward' | 'backward' | 'none' {
		const ranges = this._getRanges();

		if ( !ranges.length ) {
			return 'none';
		}

		return this._getDirection( ranges[ 0 ].startContainer.getRootNode() ) as 'forward' | 'backward' | 'none';
	}

	public getRangeAt( index: number ): Range {
		const staticRange = this._getRanges()[ index ];

		// Match native `Selection#getRangeAt()`, which throws for an out-of-range index instead of
		// returning `undefined` (which would later throw an opaque `TypeError`).
		if ( !staticRange ) {
			throw new DOMException( `Index ${ index } is out of range.`, 'IndexSizeError' );
		}

		const range = this._shadowRoots[ 0 ].ownerDocument.createRange();

		range.setStart( staticRange.startContainer, staticRange.startOffset );
		range.setEnd( staticRange.endContainer, staticRange.endOffset );

		return range;
	}

	// Selection mutations operate on the real underlying selection.

	public removeAllRanges(): void {
		this._domSelection.removeAllRanges();
	}

	public addRange( range: Range ): void {
		this._domSelection.addRange( range );
	}

	public collapse( node: Node | null, offset?: number ): void {
		this._domSelection.collapse( node, offset );
	}

	public extend( node: Node, offset?: number ): void {
		this._domSelection.extend( node, offset );
	}

	public setBaseAndExtent( anchorNode: Node, anchorOffset: number, focusNode: Node, focusOffset: number ): void {
		this._domSelection.setBaseAndExtent( anchorNode, anchorOffset, focusNode, focusOffset );
	}

	/**
	 * The composed ranges fully contained in one of the trees on the path from the given nodes to the
	 * document, in document order (start before end).
	 *
	 * Only ranges whose both endpoints resolve into the same tree can be represented as a live, single-tree
	 * `Range`. A range crossing a shadow boundary is therefore dropped, and so is one resolving into an
	 * unrelated tree, rather than surfacing foreign nodes. The document itself is one of those trees: it is
	 * where every node ends up when walking out of its shadow roots, and it is where a selection made in a
	 * sibling light-DOM editable lives, so such a selection is kept rather than dropped.
	 *
	 * A range with an endpoint outside its container is dropped as well, see `isOffsetInNode()` below.
	 */
	private _getRanges(): Array<StaticRange> {
		const domDocument = this._shadowRoots[ 0 ].ownerDocument;

		return this._getComposedRanges().filter( range => {
			const rootNode = range.startContainer.getRootNode();

			// Only a range with both endpoints in one tree can be represented as a live `Range`.
			if ( rootNode != range.endContainer.getRootNode() ) {
				return false;
			}

			// And that tree has to be one of the trees this selection resolves against.
			if ( rootNode != domDocument && !this._shadowRoots.includes( rootNode as ShadowRoot ) ) {
				return false;
			}

			// Both endpoints have to be positions their containers can hold.
			return (
				isOffsetInNode( range.startContainer, range.startOffset ) &&
				isOffsetInNode( range.endContainer, range.endOffset )
			);
		} );
	}

	/**
	 * The raw composed ranges reported for the shadow roots by the underlying selection.
	 */
	private _getComposedRanges(): Array<StaticRange> {
		const domSelection = this._domSelection;
		const shadowRoots = this._shadowRoots;

		// The current spec (and current engines) take an options dictionary. Safari 17 / 17.1 shipped
		// `getComposedRanges()` with the legacy rest-parameter signature, which throws on a dictionary
		// argument. Once that has been detected, call the legacy form directly rather than throwing on
		// every read.
		if ( ShadowSelection._useLegacyComposedRanges ) {
			return domSelection.getComposedRanges!( ...shadowRoots as any );
		}

		try {
			return domSelection.getComposedRanges!( { shadowRoots } );
		} catch {
			ShadowSelection._useLegacyComposedRanges = true;

			return domSelection.getComposedRanges!( ...shadowRoots as any );
		}
	}

	/**
	 * The direction of the underlying selection, preferring the one reported by Blink's shadow-scoped
	 * selection, which stays meaningful for a mouse selection made inside a shadow root.
	 */
	private _getDirection( rootNode: Node ): string {
		// The standard document-level selection is of no use for the direction here: it retargets a
		// selection made inside a shadow root to the host, and reports its `direction` as `'none'` for a
		// mouse selection there. Blink's non-standard `ShadowRoot#getSelection()` returns a shadow-scoped
		// selection whose `direction` and shadow-piercing anchor and focus stay meaningful inside the tree,
		// so it is the only source that can tell a forward selection from a backward one in that case.
		const shadowRootSelection = ( rootNode as ShadowRootWithSelection ).getSelection?.() as ComposedSelection | null;

		if ( shadowRootSelection ) {
			// Blink usually reports a usable direction here, even for a mouse selection made inside a shadow root.
			if ( shadowRootSelection.direction && shadowRootSelection.direction != 'none' ) {
				return shadowRootSelection.direction;
			}

			// When it reports `'none'` instead, the orientation is recovered geometrically from the
			// shadow-piercing anchor and focus of the shadow-scoped selection.
			if ( shadowRootSelection.anchorNode ) {
				return isDomSelectionBackward( shadowRootSelection ) ? 'backward' : 'forward';
			}
		}

		return this._domSelection.direction ?? 'forward';
	}

	/**
	 * The anchor or focus endpoint of the first composed range.
	 *
	 * `getComposedRanges()` returns ranges in document order (start before end); the anchor/focus
	 * orientation therefore has to come from `Selection#direction`. Known limitation: WebKit and Blink
	 * report `direction` as `'none'` for a selection made *with the mouse* inside a shadow root (a
	 * keyboard selection reports it correctly). Blink's shadow-scoped selection still knows the direction
	 * in that case, so it is consulted first; it is of no use for the ranges themselves, as it covers
	 * a single tree only. Safari has no such API, so its mouse selections fall back to forward.
	 */
	private _getEndpoint( endpoint: 'anchor' | 'focus' ): { node: Node | null; offset: number } {
		const ranges = this._getRanges();

		if ( !ranges.length ) {
			return { node: null, offset: 0 };
		}

		const range = ranges[ 0 ];
		const isBackward = this._getDirection( range.startContainer.getRootNode() ) == 'backward';
		const atStart = endpoint == 'anchor' ? !isBackward : isBackward;

		return atStart ?
			{ node: range.startContainer, offset: range.startOffset } :
			{ node: range.endContainer, offset: range.endOffset };
	}
}

/**
 * Whether the offset is a position the container can actually hold: within its text for a character-data
 * node, within its children for any other node.
 *
 * Unlike a `Range`, a `StaticRange` is not validated, so the offsets `getComposedRanges()` returns may
 * point past the end of their containers. Safari can report a range describing the tree as it was before
 * the last DOM mutation, so an offset can outlive the children it pointed at, for example while rendering
 * a change that removed the last child of a container. Such an endpoint has no position to resolve to and
 * cannot be turned into a `Range` (which validates and throws an `IndexSizeError`), so the whole range is
 * left out rather than reported as an out-of-bounds position.
 */
function isOffsetInNode( node: Node, offset: number ): boolean {
	// The offsets of a `StaticRange` are unsigned, so only the upper bound can be exceeded.
	const length = isText( node ) || isComment( node ) ? node.length : node.childNodes.length;

	return offset <= length;
}

/**
 * The standards-track `Selection` additions not yet reflected in the DOM typings shipped with the
 * project's TypeScript version.
 */
type ComposedSelection = Selection & {
	direction?: 'forward' | 'backward' | 'none';
	getComposedRanges?( options?: { shadowRoots?: Array<ShadowRoot> } ): Array<StaticRange>;
};

/**
 * The non-standard, Blink-only selection accessor on `ShadowRoot`.
 */
type ShadowRootWithSelection = ShadowRoot & {
	getSelection?(): Selection | null;
};
