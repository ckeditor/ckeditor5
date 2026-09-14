/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/getpositionedancestor
 */

import { getLayoutParentElement } from './getlayoutparentelement.js';
import { getParentElement } from './getparentelement.js';

/**
 * Returns the element the given one is laid out against while absolutely positioned – the element whose padding
 * box its `top` and `left` are relative to. Returns `null` when there is nothing to compensate for: the element
 * is laid out against the initial containing block, is `position: fixed`, or is not rendered at all.
 *
 * Use it when turning a position measured against the viewport into the `top` and `left` to set on an absolutely
 * positioned element, by subtracting the returned element's padding-box offset – the way
 * {@link module:utils/dom/rect~Rect#toAbsoluteRect} and {@link module:utils/dom/position~getOptimalPosition} do.
 *
 * The layout-aware counterpart of `Element#offsetParent`, and what to reach for instead of it: this one follows
 * the **flattened tree**, the one the browser lays out, so it stays right for slotted content – an editor slotted
 * into a container component – where `offsetParent` names an element that does not lay that content out. Falls
 * back to `offsetParent` for slotted content inside a closed root, whose slot the DOM standard does not expose.
 *
 * @param element The native DOM element to be checked.
 */
export function getPositionedAncestor( element?: HTMLElement ): HTMLElement | null {
	if ( !element || !element.isConnected ) {
		return null;
	}

	// `offsetParent` is exactly right about *which* element establishes a containing block: a non-`static`
	// `position`, but also `transform`, `filter`, `perspective`, containment and the rest, and `<td>`/`<table>`.
	// What it is not right about is *where it looks*: it walks the node tree, and assigning a node to a `<slot>`
	// does not move it, so for slotted content it names an element that does not lay that content out and skips
	// the shadow tree that does. So it is asked, and its answer taken only where the flattened tree agrees.
	const offsetParent = element.offsetParent;

	// No `offsetParent` at all: the element is `position: fixed`, so it is laid out against the viewport, or it
	// is not rendered. Neither has an ancestor to be relative to.
	if ( !offsetParent ) {
		return null;
	}

	// Whichever of the two comes first on the way out decides whether the browser's answer can be used: a slot
	// closer than `offsetParent` means the flattened tree parts ways with the node tree before that answer is
	// reached, so it describes the wrong branch.
	const slot = findSlotCloserThan( element, offsetParent );

	if ( !slot ) {
		// `offsetParent` names `<body>` for two different reasons: either the body really is what lays the
		// element out (it is positioned, transformed, and so on), or nothing lays it out and `<body>` is just
		// the fallback the spec returns – a static body does not lay out its absolutely positioned children,
		// the initial containing block does. Only the second case is `null`, so ask the body which one it is.
		if ( offsetParent === offsetParent.ownerDocument.body && !isContainingBlock( offsetParent ) ) {
			return null;
		}

		return offsetParent as HTMLElement;
	}

	// Past the slot the browser's answer no longer applies, so the elements rendering the content are judged
	// here. A component can pass its own slot down into another one's, so this is a chain, and every slot on it
	// is a candidate: one styled to have a box lays the content out itself, while the `display: contents`
	// default leaves it unable to.
	let candidate: Element = slot;

	// A slot renders inside a shadow root, so it always has a layout parent: the slot it is itself assigned to,
	// or the element or shadow host above it.
	while ( candidate.localName === 'slot' && !isContainingBlock( candidate ) ) {
		candidate = getLayoutParentElement( candidate )!;
	}

	if ( isContainingBlock( candidate ) ) {
		return candidate as HTMLElement;
	}

	// An ordinary element again, so start over from it and let the browser answer for what lies above. Each
	// step out is strictly further from `element`, so this bottoms out at the document.
	return getPositionedAncestor( candidate as HTMLElement );
}

/**
 * Walks outwards from the given node looking for the slot it is assigned to, and stops once `offsetParent` is
 * reached – so the result tells which of the two is nearer. A slot means the node tree and the flattened tree
 * part ways first; `null` means they agree all the way to `offsetParent`.
 */
function findSlotCloserThan( node: Element, offsetParent: Element ): HTMLSlotElement | null {
	let current: Element | null = node;

	// `offsetParent` is a node-tree ancestor of the element, so the walk always reaches it.
	while ( current && current !== offsetParent ) {
		// An assigned node renders inside its slot, and that hop is where the walk leaves the node tree.
		if ( current.assignedSlot ) {
			return current.assignedSlot;
		}

		current = getParentElement( current );
	}

	return null;
}

/**
 * `contain` values that include layout or paint containment, either of which makes an element the containing
 * block of its absolutely positioned descendants. `size` alone does not.
 */
const CONTAINING_BLOCK_CONTAIN = /\b(?:layout|paint|strict|content)\b/;

/**
 * `will-change` values naming a property that establishes a containing block on its own. `filter` also matches
 * `backdrop-filter`, which is intended.
 */
const CONTAINING_BLOCK_WILL_CHANGE = /\b(?:transform|perspective|filter|contain)\b/;

/**
 * Whether the given element is the containing block of its absolutely positioned descendants.
 *
 * Needed where `offsetParent` cannot answer: the slot a node is assigned to and the element above it, which it
 * cannot be asked about at all – it answers what lies *above* an element, never whether the element itself
 * qualifies – and `<body>`, which it also names when nothing above the element establishes a containing block.
 * The property list is what Chrome establishes a containing block for, verified against `offsetParent`, which
 * agrees with the rendered result in every one of these cases.
 */
function isContainingBlock( element: Element ): boolean {
	const styles = element.ownerDocument.defaultView!.getComputedStyle( element );

	// No box, no containing block – `position` and the rest have no effect on a `display: contents` element.
	// A `display: none` one never gets here: the content it would render is unrendered too, and answered above.
	if ( styles.display === 'contents' ) {
		return false;
	}

	if ( styles.position !== 'static' ) {
		return true;
	}

	return isNonInitial( styles.transform, 'none' ) ||
		isNonInitial( styles.translate, 'none' ) ||
		isNonInitial( styles.rotate, 'none' ) ||
		isNonInitial( styles.scale, 'none' ) ||
		isNonInitial( styles.perspective, 'none' ) ||
		isNonInitial( styles.filter, 'none' ) ||
		isNonInitial( styles.backdropFilter, 'none' ) ||
		isNonInitial( styles.contentVisibility, 'visible' ) ||
		CONTAINING_BLOCK_CONTAIN.test( styles.contain ) ||
		CONTAINING_BLOCK_WILL_CHANGE.test( styles.willChange );
}

/**
 * Whether a computed value is something other than the property's initial value, which is what makes the
 * property establish a containing block.
 *
 * A property the browser does not know has no computed value at all, and the comparison alone would read that
 * as a value unlike the initial one. Something unsupported establishes nothing, so it answers `false` instead.
 */
function isNonInitial( value: string | undefined, initialValue: string ): boolean {
	return !!value && value !== initialValue;
}
