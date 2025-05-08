/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/view/renderer
 */

import ViewText from './text.js';
import ViewPosition from './position.js';
import { INLINE_FILLER, INLINE_FILLER_LENGTH, startsWithFiller, isInlineFiller } from './filler.js';

import {
	CKEditorError,
	ObservableMixin,
	diff,
	env,
	fastDiff,
	insertAt,
	isComment,
	isNode,
	isText,
	remove,
	indexOf,
	type DiffResult,
	type ObservableChangeEvent
} from '@ckeditor/ckeditor5-utils';

import type { ChangeType } from './document.js';
import type DocumentSelection from './documentselection.js';
import type DomConverter from './domconverter.js';
import type ViewElement from './element.js';
import type ViewNode from './node.js';

// @if CK_DEBUG_TYPING // const { _buildLogMessage } = require( '../dev-utils/utils.js' );

import '../../theme/renderer.css';

type DomText = globalThis.Text;
type DomNode = globalThis.Node;
type DomDocument = globalThis.Document;
type DomElement = globalThis.HTMLElement;
type DomSelection = globalThis.Selection;

/**
 * Renderer is responsible for updating the DOM structure and the DOM selection based on
 * the {@link module:engine/view/renderer~Renderer#markToSync information about updated view nodes}.
 * In other words, it renders the view to the DOM.
 *
 * Its main responsibility is to make only the necessary, minimal changes to the DOM. However, unlike in many
 * virtual DOM implementations, the primary reason for doing minimal changes is not the performance but ensuring
 * that native editing features such as text composition, autocompletion, spell checking, selection's x-index are
 * affected as little as possible.
 *
 * Renderer uses {@link module:engine/view/domconverter~DomConverter} to transform view nodes and positions
 * to and from the DOM.
 */
export default class Renderer extends /* #__PURE__ */ ObservableMixin() {
	/**
	 * Set of DOM Documents instances.
	 */
	public readonly domDocuments: Set<DomDocument> = new Set();

	/**
	 * Converter instance.
	 */
	public readonly domConverter: DomConverter;

	/**
	 * Set of nodes which attributes changed and may need to be rendered.
	 */
	public readonly markedAttributes: Set<ViewElement> = new Set();

	/**
	 * Set of elements which child lists changed and may need to be rendered.
	 */
	public readonly markedChildren: Set<ViewElement> = new Set();

	/**
	 * Set of text nodes which text data changed and may need to be rendered.
	 */
	public readonly markedTexts: Set<ViewNode> = new Set();

	/**
	 * View selection. Renderer updates DOM selection based on the view selection.
	 */
	public readonly selection: DocumentSelection;

	/**
	 * Indicates if the view document is focused and selection can be rendered. Selection will not be rendered if
	 * this is set to `false`.
	 *
	 * @observable
	 */
	declare public readonly isFocused: boolean;

	/**
	 * Indicates whether the user is making a selection in the document (e.g. holding the mouse button and moving the cursor).
	 * When they stop selecting, the property goes back to `false`.
	 *
	 * Note: In some browsers, the renderer will stop rendering the selection and inline fillers while the user is making
	 * a selection to avoid glitches in DOM selection
	 * (https://github.com/ckeditor/ckeditor5/issues/10562, https://github.com/ckeditor/ckeditor5/issues/10723).
	 *
	 * @observable
	 */
	declare public readonly isSelecting: boolean;

	/**
	 * True if composition is in progress inside the document.
	 *
	 * This property is bound to the {@link module:engine/view/document~Document#isComposing `Document#isComposing`} property.
	 *
	 * @observable
	 */
	declare public readonly isComposing: boolean;

	/**
	 * The text node in which the inline filler was rendered.
	 */
	private _inlineFiller: DomText | null = null;

	/**
	 * DOM element containing fake selection.
	 */
	private _fakeSelectionContainer: DomElement | null = null;

	/**
	 * Creates a renderer instance.
	 *
	 * @param domConverter Converter instance.
	 * @param selection View selection.
	 */
	constructor( domConverter: DomConverter, selection: DocumentSelection ) {
		super();

		this.domConverter = domConverter;
		this.selection = selection;

		this.set( 'isFocused', false );
		this.set( 'isSelecting', false );
		this.set( 'isComposing', false );

		// Rendering the selection and inline filler manipulation should be postponed in (non-Android) Blink until the user finishes
		// creating the selection in DOM to avoid accidental selection collapsing
		// (https://github.com/ckeditor/ckeditor5/issues/10562, https://github.com/ckeditor/ckeditor5/issues/10723).
		// When the user stops selecting, all pending changes should be rendered ASAP, though.
		if ( env.isBlink && !env.isAndroid ) {
			this.on<ObservableChangeEvent>( 'change:isSelecting', () => {
				if ( !this.isSelecting ) {
					this.render();
				}
			} );
		}
	}

	/**
	 * Marks a view node to be updated in the DOM by {@link #render `render()`}.
	 *
	 * Note that only view nodes whose parents have corresponding DOM elements need to be marked to be synchronized.
	 *
	 * @see #markedAttributes
	 * @see #markedChildren
	 * @see #markedTexts
	 *
	 * @param type Type of the change.
	 * @param node ViewNode to be marked.
	 */
	public markToSync( type: ChangeType, node: ViewNode ): void {
		if ( type === 'text' ) {
			if ( this.domConverter.mapViewToDom( node.parent! ) ) {
				this.markedTexts.add( node );
			}
		} else {
			// If the node has no DOM element it is not rendered yet,
			// its children/attributes do not need to be marked to be sync.
			if ( !this.domConverter.mapViewToDom( node as ViewElement ) ) {
				return;
			}

			if ( type === 'attributes' ) {
				this.markedAttributes.add( node as ViewElement );
			} else if ( type === 'children' ) {
				this.markedChildren.add( node as ViewElement );
			} else {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const unreachable: never = type;

				/**
				 * Unknown type passed to Renderer.markToSync.
				 *
				 * @error view-renderer-unknown-type
				 */
				throw new CKEditorError( 'view-renderer-unknown-type', this );
			}
		}
	}

	/**
	 * Renders all buffered changes ({@link #markedAttributes}, {@link #markedChildren} and {@link #markedTexts}) and
	 * the current view selection (if needed) to the DOM by applying a minimal set of changes to it.
	 *
	 * Renderer tries not to break the text composition (e.g. IME) and x-index of the selection,
	 * so it does as little as it is needed to update the DOM.
	 *
	 * Renderer also handles {@link module:engine/view/filler fillers}. Especially, it checks if the inline filler is needed
	 * at the selection position and adds or removes it. To prevent breaking text composition inline filler will not be
	 * removed as long as the selection is in the text node which needed it at first.
	 */
	public render(): void {
		// Ignore rendering while in the composition mode. Composition events are not cancellable and browser will modify the DOM tree.
		// All marked elements, attributes, etc. will wait until next render after the composition ends.
		// On Android composition events are immediately applied to the model, so we don't need to skip rendering,
		// and we should not do it because the difference between view and DOM could lead to position mapping problems.
		if ( this.isComposing && !env.isAndroid ) {
			// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
			// @if CK_DEBUG_TYPING // 	console.info( ..._buildLogMessage( this, 'Renderer',
			// @if CK_DEBUG_TYPING // 		'%cRendering aborted while isComposing.',
			// @if CK_DEBUG_TYPING // 		'font-style: italic'
			// @if CK_DEBUG_TYPING // 	) );
			// @if CK_DEBUG_TYPING // }

			return;
		}

		// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
		// @if CK_DEBUG_TYPING // 	console.group( ..._buildLogMessage( this, 'Renderer',
		// @if CK_DEBUG_TYPING // 		'%cRendering',
		// @if CK_DEBUG_TYPING // 		'font-weight: bold'
		// @if CK_DEBUG_TYPING // 	) );
		// @if CK_DEBUG_TYPING // }

		let inlineFillerPosition: ViewPosition | null = null;
		const isInlineFillerRenderingPossible = env.isBlink && !env.isAndroid ? !this.isSelecting : true;

		// Refresh mappings.
		for ( const element of this.markedChildren ) {
			this._updateChildrenMappings( element );
		}

		// Don't manipulate inline fillers while the selection is being made in (non-Android) Blink to prevent accidental
		// DOM selection collapsing
		// (https://github.com/ckeditor/ckeditor5/issues/10562, https://github.com/ckeditor/ckeditor5/issues/10723).
		if ( isInlineFillerRenderingPossible ) {
			// There was inline filler rendered in the DOM but it's not
			// at the selection position any more, so we can remove it
			// (cause even if it's needed, it must be placed in another location).
			if ( this._inlineFiller && !this._isSelectionInInlineFiller() ) {
				this._removeInlineFiller();
			}

			// If we've got the filler, let's try to guess its position in the view.
			if ( this._inlineFiller ) {
				inlineFillerPosition = this._getInlineFillerPosition();
			}
			// Otherwise, if it's needed, create it at the selection position.
			else if ( this._needsInlineFillerAtSelection() ) {
				inlineFillerPosition = this.selection.getFirstPosition()!;

				// Do not use `markToSync` so it will be added even if the parent is already added.
				this.markedChildren.add( inlineFillerPosition.parent as ViewElement );
			}
		}
		// Make sure the inline filler has any parent, so it can be mapped to view position by DomConverter.
		else if ( this._inlineFiller && this._inlineFiller.parentNode ) {
			// While the user is making selection, preserve the inline filler at its original position.
			inlineFillerPosition = this.domConverter.domPositionToView( this._inlineFiller )!;

			// While down-casting the document selection attributes, all existing empty
			// attribute elements (for selection position) are removed from the view and DOM,
			// so make sure that we were able to map filler position.
			// https://github.com/ckeditor/ckeditor5/issues/12026
			if ( inlineFillerPosition && inlineFillerPosition.parent.is( '$text' ) ) {
				// The inline filler position is expected to be before the text node.
				inlineFillerPosition = ViewPosition._createBefore( inlineFillerPosition.parent );
			}
		}

		for ( const element of this.markedAttributes ) {
			this._updateAttrs( element );
		}

		for ( const element of this.markedChildren ) {
			this._updateChildren( element, { inlineFillerPosition } );
		}

		for ( const node of this.markedTexts ) {
			if ( !this.markedChildren.has( node.parent as ViewElement ) && this.domConverter.mapViewToDom( node.parent as ViewElement ) ) {
				this._updateText( node as ViewText, { inlineFillerPosition } );
			}
		}

		// * Check whether the inline filler is required and where it really is in the DOM.
		//   At this point in most cases it will be in the DOM, but there are exceptions.
		//   For example, if the inline filler was deep in the created DOM structure, it will not be created.
		//   Similarly, if it was removed at the beginning of this function and then neither text nor children were updated,
		//   it will not be present. Fix those and similar scenarios.
		// * Don't manipulate inline fillers while the selection is being made in (non-Android) Blink to prevent accidental
		//   DOM selection collapsing
		//   (https://github.com/ckeditor/ckeditor5/issues/10562, https://github.com/ckeditor/ckeditor5/issues/10723).
		if ( isInlineFillerRenderingPossible ) {
			if ( inlineFillerPosition ) {
				const fillerDomPosition = this.domConverter.viewPositionToDom( inlineFillerPosition )!;
				const domDocument = fillerDomPosition.parent.ownerDocument!;

				if ( !startsWithFiller( fillerDomPosition.parent ) ) {
					// Filler has not been created at filler position. Create it now.
					this._inlineFiller = addInlineFiller( domDocument, fillerDomPosition.parent, fillerDomPosition.offset );
				} else {
					// Filler has been found, save it.
					this._inlineFiller = fillerDomPosition.parent as DomText;
				}
			} else {
				// There is no filler needed.
				this._inlineFiller = null;
			}
		}

		// First focus the new editing host, then update the selection.
		// Otherwise, FF may throw an error (https://github.com/ckeditor/ckeditor5/issues/721).
		this._updateFocus();
		this._updateSelection();

		this.domConverter._clearTemporaryCustomProperties();

		this.markedTexts.clear();
		this.markedAttributes.clear();
		this.markedChildren.clear();

		// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
		// @if CK_DEBUG_TYPING // 	console.groupEnd();
		// @if CK_DEBUG_TYPING // }
	}

	/**
	 * Updates mappings of view element's children.
	 *
	 * Children that were replaced in the view structure by similar elements (same tag name) are treated as 'replaced'.
	 * This means that their mappings can be updated so the new view elements are mapped to the existing DOM elements.
	 * Thanks to that these elements do not need to be re-rendered completely.
	 *
	 * @param viewElement The view element whose children mappings will be updated.
	 */
	private _updateChildrenMappings( viewElement: ViewElement ): void {
		const domElement = this.domConverter.mapViewToDom( viewElement );

		if ( !domElement ) {
			// If there is no `domElement` it means that it was already removed from DOM and there is no need to process it.
			return;
		}

		// Removing nodes from the DOM as we iterate can cause `actualDomChildren`
		// (which is a live-updating `NodeList`) to get out of sync with the
		// indices that we compute as we iterate over `actions`.
		// This would produce incorrect element mappings.
		//
		// Converting live list to an array to make the list static.
		const actualDomChildren = Array.from(
			domElement.childNodes
		);
		const expectedDomChildren = Array.from(
			this.domConverter.viewChildrenToDom( viewElement, { withChildren: false } )
		);
		const diff = this._diffNodeLists( actualDomChildren, expectedDomChildren );
		const actions = this._findUpdateActions( diff, actualDomChildren, expectedDomChildren, areSimilarElements );

		if ( actions.indexOf( 'update' ) !== -1 ) {
			const counter = { equal: 0, insert: 0, delete: 0 };

			for ( const action of actions ) {
				if ( action === 'update' ) {
					const insertIndex = counter.equal + counter.insert;
					const deleteIndex = counter.equal + counter.delete;
					const viewChild = viewElement.getChild( insertIndex );

					// UIElement and RawElement are special cases. Their children are not stored in a view (#799)
					// so we cannot use them with replacing flow (since they use view children during rendering
					// which will always result in rendering empty elements).
					if ( viewChild && !viewChild.is( 'uiElement' ) && !viewChild.is( 'rawElement' ) ) {
						this._updateElementMappings( viewChild as ViewElement, actualDomChildren[ deleteIndex ] as DomElement );
					}

					remove( expectedDomChildren[ insertIndex ] );
					counter.equal++;
				} else {
					counter[ action ]++;
				}
			}
		}
	}

	/**
	 * Updates mappings of a given view element.
	 *
	 * @param viewElement The view element whose mappings will be updated.
	 * @param domElement The DOM element representing the given view element.
	 */
	private _updateElementMappings( viewElement: ViewElement, domElement: DomElement ): void {
		// Remap 'DomConverter' bindings.
		this.domConverter.unbindDomElement( domElement );
		this.domConverter.bindElements( domElement, viewElement );

		// View element may have children which needs to be updated, but are not marked, mark them to update.
		this.markedChildren.add( viewElement );

		// Because we replace new view element mapping with the existing one, the corresponding DOM element
		// will not be rerendered. The new view element may have different attributes than the previous one.
		// Since its corresponding DOM element will not be rerendered, new attributes will not be added
		// to the DOM, so we need to mark it here to make sure its attributes gets updated. See #1427 for more
		// detailed case study.
		// Also there are cases where replaced element is removed from the view structure and then has
		// its attributes changed or removed. In such cases the element will not be present in `markedAttributes`
		// and also may be the same (`element.isSimilar()`) as the reused element not having its attributes updated.
		// To prevent such situations we always mark reused element to have its attributes rerenderd (#1560).
		this.markedAttributes.add( viewElement );
	}

	/**
	 * Gets the position of the inline filler based on the current selection.
	 * Here, we assume that we know that the filler is needed and
	 * {@link #_isSelectionInInlineFiller is at the selection position}, and, since it is needed,
	 * it is somewhere at the selection position.
	 *
	 * Note: The filler position cannot be restored based on the filler's DOM text node, because
	 * when this method is called (before rendering), the bindings will often be broken. View-to-DOM
	 * bindings are only dependable after rendering.
	 */
	private _getInlineFillerPosition(): ViewPosition {
		const firstPos = this.selection.getFirstPosition()!;

		if ( firstPos.parent.is( '$text' ) ) {
			return ViewPosition._createBefore( firstPos.parent );
		} else {
			return firstPos;
		}
	}

	/**
	 * Returns `true` if the selection has not left the inline filler's text node.
	 * If it is `true`, it means that the filler had been added for a reason and the selection did not
	 * leave the filler's text node. For example, the user can be in the middle of a composition so it should not be touched.
	 *
	 * @returns `true` if the inline filler and selection are in the same place.
	 */
	private _isSelectionInInlineFiller(): boolean {
		if ( this.selection.rangeCount != 1 || !this.selection.isCollapsed ) {
			return false;
		}

		// Note, we can't check if selection's position equals position of the
		// this._inlineFiller node, because of #663. We may not be able to calculate
		// the filler's position in the view at this stage.
		// Instead, we check it the other way – whether selection is anchored in
		// that text node or next to it.

		// Possible options are:
		// "FILLER{}"
		// "FILLERadded-text{}"
		const selectionPosition = this.selection.getFirstPosition()!;
		const position = this.domConverter.viewPositionToDom( selectionPosition );

		if ( position && isText( position.parent ) && startsWithFiller( position.parent ) ) {
			return true;
		}

		return false;
	}

	/**
	 * Removes the inline filler.
	 */
	private _removeInlineFiller(): void {
		const domFillerNode = this._inlineFiller!;

		// Something weird happened and the stored node doesn't contain the filler's text.
		if ( !startsWithFiller( domFillerNode ) ) {
			// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
			// @if CK_DEBUG_TYPING // 	console.log( ..._buildLogMessage( this, 'Renderer',
			// @if CK_DEBUG_TYPING // 		'Inline filler node: ' +
			// @if CK_DEBUG_TYPING // 		`%c${ _escapeTextNodeData( domFillerNode.data ) }%c (${ domFillerNode.data.length })`,
			// @if CK_DEBUG_TYPING // 		'color: blue',
			// @if CK_DEBUG_TYPING // 		''
			// @if CK_DEBUG_TYPING // 	) );
			// @if CK_DEBUG_TYPING // }

			/**
			 * The inline filler node was lost. Most likely, something overwrote the filler text node
			 * in the DOM.
			 *
			 * @error view-renderer-filler-was-lost
			 */
			throw new CKEditorError( 'view-renderer-filler-was-lost', this );
		}

		if ( isInlineFiller( domFillerNode ) ) {
			domFillerNode.remove();
		} else {
			domFillerNode.data = domFillerNode.data.substr( INLINE_FILLER_LENGTH );
		}

		this._inlineFiller = null;
	}

	/**
	 * Checks if the inline {@link module:engine/view/filler filler} should be added.
	 *
	 * @returns `true` if the inline filler should be added.
	 */
	private _needsInlineFillerAtSelection(): boolean {
		if ( this.selection.rangeCount != 1 || !this.selection.isCollapsed ) {
			return false;
		}

		const selectionPosition = this.selection.getFirstPosition()!;
		const selectionParent = selectionPosition.parent;
		const selectionOffset = selectionPosition.offset;

		// If there is no DOM root we do not care about fillers.
		if ( !this.domConverter.mapViewToDom( selectionParent.root ) ) {
			return false;
		}

		if ( !( selectionParent.is( 'element' ) ) ) {
			return false;
		}

		// Prevent adding inline filler inside elements with contenteditable=false.
		// https://github.com/ckeditor/ckeditor5-engine/issues/1170
		if ( !isEditable( selectionParent ) ) {
			return false;
		}

		const nodeBefore = selectionPosition.nodeBefore;
		const nodeAfter = selectionPosition.nodeAfter;

		if ( nodeBefore instanceof ViewText || nodeAfter instanceof ViewText ) {
			return false;
		}

		// We have block filler, we do not need inline one.
		if ( selectionOffset === selectionParent.getFillerOffset!() && ( !nodeBefore || !nodeBefore.is( 'element', 'br' ) ) ) {
			return false;
		}

		// Do not use inline filler while typing outside inline elements on Android.
		// The deleteContentBackward would remove part of the inline filler instead of removing last letter in a link.
		if ( env.isAndroid && ( nodeBefore || nodeAfter ) ) {
			return false;
		}

		return true;
	}

	/**
	 * Checks if text needs to be updated and possibly updates it.
	 *
	 * @param viewText View text to update.
	 * @param options.inlineFillerPosition The position where the inline filler should be rendered.
	 */
	private _updateText( viewText: ViewText, options: { inlineFillerPosition?: ViewPosition | null } ) {
		const domText = this.domConverter.findCorrespondingDomText( viewText )!;
		const newDomText = this.domConverter.viewToDom( viewText );

		let expectedText = newDomText.data;
		const filler = options.inlineFillerPosition;

		if ( filler && filler.parent == viewText.parent && filler.offset == viewText.index ) {
			expectedText = INLINE_FILLER + expectedText;
		}

		// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
		// @if CK_DEBUG_TYPING // 	console.group( ..._buildLogMessage( this, 'Renderer',
		// @if CK_DEBUG_TYPING // 		'%cUpdate text',
		// @if CK_DEBUG_TYPING // 		'font-weight: normal'
		// @if CK_DEBUG_TYPING // 	) );
		// @if CK_DEBUG_TYPING // }

		this._updateTextNode( domText, expectedText );

		// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
		// @if CK_DEBUG_TYPING // 	console.groupEnd();
		// @if CK_DEBUG_TYPING // }
	}

	/**
	 * Checks if attribute list needs to be updated and possibly updates it.
	 *
	 * @param viewElement The view element to update.
	 */
	private _updateAttrs( viewElement: ViewElement ): void {
		const domElement = this.domConverter.mapViewToDom( viewElement );

		if ( !domElement ) {
			// If there is no `domElement` it means that 'viewElement' is outdated as its mapping was updated
			// in 'this._updateChildrenMappings()'. There is no need to process it as new view element which
			// replaced old 'viewElement' mapping was also added to 'this.markedAttributes'
			// in 'this._updateChildrenMappings()' so it will be processed separately.
			return;
		}

		// Remove attributes from DOM elements if they do not exist in the view.
		//
		// Note: It is important to first remove DOM attributes and then set new ones, because some view attributes may be renamed
		// as they are set on DOM (due to unsafe attributes handling). If we set the view attribute first, and then remove
		// non-existing DOM attributes, then we would remove the attribute that we just set.
		//
		// Note: The domElement.attributes is a live collection, so we need to convert it to an array to avoid issues.
		for ( const domAttr of Array.from( ( domElement as DomElement ).attributes ) ) {
			const key = domAttr.name;

			// All other attributes not present in the DOM should be removed.
			if ( !viewElement.hasAttribute( key ) ) {
				this.domConverter.removeDomElementAttribute( domElement as DomElement, key );
			}
		}

		// Add or overwrite attributes.
		for ( const key of viewElement.getAttributeKeys() ) {
			this.domConverter.setDomElementAttribute( domElement as DomElement, key, viewElement.getAttribute( key )!, viewElement );
		}
	}

	/**
	 * Checks if elements child list needs to be updated and possibly updates it.
	 *
	 * Note that on Android, to reduce the risk of composition breaks, it tries to update data of an existing
	 * child text nodes instead of replacing them completely.
	 *
	 * @param viewElement View element to update.
	 * @param options.inlineFillerPosition The position where the inline filler should be rendered.
	 */
	private _updateChildren( viewElement: ViewElement, options: { inlineFillerPosition: ViewPosition | null } ) {
		const domElement = this.domConverter.mapViewToDom( viewElement );

		if ( !domElement ) {
			// If there is no `domElement` it means that it was already removed from DOM.
			// There is no need to process it. It will be processed when re-inserted.
			return;
		}

		// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
		// @if CK_DEBUG_TYPING // 	console.group( ..._buildLogMessage( this, 'Renderer',
		// @if CK_DEBUG_TYPING // 		'%cUpdate children',
		// @if CK_DEBUG_TYPING // 		'font-weight: normal'
		// @if CK_DEBUG_TYPING // 	) );
		// @if CK_DEBUG_TYPING // }

		// IME on Android inserts a new text node while typing after a link
		// instead of updating an existing text node that follows the link.
		// We must normalize those text nodes so the diff won't get confused.
		// https://github.com/ckeditor/ckeditor5/issues/12574.
		if ( env.isAndroid ) {
			let previousDomNode = null;

			for ( const domNode of Array.from( domElement.childNodes ) ) {
				if ( previousDomNode && isText( previousDomNode ) && isText( domNode ) ) {
					domElement.normalize();

					break;
				}

				previousDomNode = domNode;
			}
		}

		const inlineFillerPosition = options.inlineFillerPosition;
		const actualDomChildren = domElement.childNodes;
		const expectedDomChildren = Array.from(
			this.domConverter.viewChildrenToDom( viewElement, { bind: true } )
		);

		// Inline filler element has to be created as it is present in the DOM, but not in the view. It is required
		// during diffing so text nodes could be compared correctly and also during rendering to maintain
		// proper order and indexes while updating the DOM.
		if ( inlineFillerPosition && inlineFillerPosition.parent === viewElement ) {
			addInlineFiller( ( domElement as DomElement ).ownerDocument, expectedDomChildren, inlineFillerPosition.offset );
		}

		const diff = this._diffNodeLists( actualDomChildren, expectedDomChildren );

		// We need to make sure that we update the existing text node and not replace it with another one.
		// The composition and different "language" browser extensions are fragile to text node being completely replaced.
		const actions = this._findUpdateActions( diff, actualDomChildren, expectedDomChildren, areTextNodes );

		// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping && actions.every( a => a == 'equal' ) ) {
		// @if CK_DEBUG_TYPING // 	console.info( ..._buildLogMessage( this, 'Renderer',
		// @if CK_DEBUG_TYPING // 		'%cNothing to update.',
		// @if CK_DEBUG_TYPING // 		'font-style: italic'
		// @if CK_DEBUG_TYPING // 	) );
		// @if CK_DEBUG_TYPING // }

		let i = 0;
		const nodesToUnbind: Set<DomNode> = new Set();

		// Handle deletions first.
		// This is to prevent a situation where an element that already exists in `actualDomChildren` is inserted at a different
		// index in `actualDomChildren`. Since `actualDomChildren` is a `NodeList`, this works like move, not like an insert,
		// and it disrupts the whole algorithm. See https://github.com/ckeditor/ckeditor5/issues/6367.
		//
		// It doesn't matter in what order we remove or add nodes, as long as we remove and add correct nodes at correct indexes.
		for ( const action of actions ) {
			if ( action === 'delete' ) {
				// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
				// @if CK_DEBUG_TYPING //	const node = actualDomChildren[ i ];
				// @if CK_DEBUG_TYPING // 	if ( isText( node ) ) {
				// @if CK_DEBUG_TYPING // 		console.info( ..._buildLogMessage( this, 'Renderer',
				// @if CK_DEBUG_TYPING // 			'%cRemove text node' +
				// @if CK_DEBUG_TYPING // 			`${ this.isComposing ? ' while composing (may break composition)' : '' }: ` +
				// @if CK_DEBUG_TYPING // 			`%c${ _escapeTextNodeData( node.data ) }%c (${ node.data.length })`,
				// @if CK_DEBUG_TYPING // 			this.isComposing ? 'color: red; font-weight: bold' : '',
				// @if CK_DEBUG_TYPING // 			'color: blue', ''
				// @if CK_DEBUG_TYPING // 		) );
				// @if CK_DEBUG_TYPING // 	} else {
				// @if CK_DEBUG_TYPING // 		console.info( ..._buildLogMessage( this, 'Renderer',
				// @if CK_DEBUG_TYPING // 			'%cRemove element' +
				// @if CK_DEBUG_TYPING // 			`${ this.isComposing ? ' while composing (may break composition)' : '' }: `,
				// @if CK_DEBUG_TYPING // 			this.isComposing ? 'color: red; font-weight: bold' : '',
				// @if CK_DEBUG_TYPING // 			node
				// @if CK_DEBUG_TYPING // 		) );
				// @if CK_DEBUG_TYPING // 	}
				// @if CK_DEBUG_TYPING // }

				nodesToUnbind.add( actualDomChildren[ i ] as DomElement );
				remove( actualDomChildren[ i ] );
			} else if ( action === 'equal' || action === 'update' ) {
				i++;
			}
		}

		i = 0;

		for ( const action of actions ) {
			if ( action === 'insert' ) {
				// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
				// @if CK_DEBUG_TYPING //	const node = expectedDomChildren[ i ];
				// @if CK_DEBUG_TYPING //	if ( isText( node ) ) {
				// @if CK_DEBUG_TYPING //		console.info( ..._buildLogMessage( this, 'Renderer',
				// @if CK_DEBUG_TYPING //			'%cInsert text node' +
				// @if CK_DEBUG_TYPING //			`${ this.isComposing ? ' while composing (may break composition)' : '' }: ` +
				// @if CK_DEBUG_TYPING //			`%c${ _escapeTextNodeData( node.data ) }%c (${ node.data.length })`,
				// @if CK_DEBUG_TYPING //			this.isComposing ? 'color: red; font-weight: bold' : '',
				// @if CK_DEBUG_TYPING //			'color: blue',
				// @if CK_DEBUG_TYPING //			''
				// @if CK_DEBUG_TYPING //		) );
				// @if CK_DEBUG_TYPING //	} else {
				// @if CK_DEBUG_TYPING //		console.info( ..._buildLogMessage( this, 'Renderer',
				// @if CK_DEBUG_TYPING //			'%cInsert element:',
				// @if CK_DEBUG_TYPING //			'font-weight: normal',
				// @if CK_DEBUG_TYPING //			node
				// @if CK_DEBUG_TYPING //		) );
				// @if CK_DEBUG_TYPING //	}
				// @if CK_DEBUG_TYPING // }

				insertAt( domElement as DomElement, i, expectedDomChildren[ i ] );
				i++;
			}
			// Update the existing text node data.
			else if ( action === 'update' ) {
				this._updateTextNode( actualDomChildren[ i ] as DomText, ( expectedDomChildren[ i ] as DomText ).data );
				i++;
			} else if ( action === 'equal' ) {
				// Force updating text nodes inside elements which did not change and do not need to be re-rendered (#1125).
				// Do it here (not in the loop above) because only after insertions the `i` index is correct.
				this._markDescendantTextToSync( this.domConverter.domToView( expectedDomChildren[ i ] ) as any );
				i++;
			}
		}

		// Unbind removed nodes. When node does not have a parent it means that it was removed from DOM tree during
		// comparison with the expected DOM. We don't need to check child nodes, because if child node was reinserted,
		// it was moved to DOM tree out of the removed node.
		for ( const node of nodesToUnbind ) {
			if ( !node.parentNode ) {
				this.domConverter.unbindDomElement( node as DomElement );
			}
		}

		// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
		// @if CK_DEBUG_TYPING // 	console.groupEnd();
		// @if CK_DEBUG_TYPING // }
	}

	/**
	 * Shorthand for diffing two arrays or node lists of DOM nodes.
	 *
	 * @param actualDomChildren Actual DOM children
	 * @param expectedDomChildren Expected DOM children.
	 * @returns The list of actions based on the {@link module:utils/diff~diff} function.
	 */
	private _diffNodeLists( actualDomChildren: Array<DomNode> | NodeList, expectedDomChildren: Array<DomNode> | NodeList ) {
		actualDomChildren = filterOutFakeSelectionContainer( actualDomChildren, this._fakeSelectionContainer );

		return diff( actualDomChildren, expectedDomChildren, sameNodes.bind( null, this.domConverter ) );
	}

	/**
	 * Finds DOM nodes that were replaced with the similar nodes (same tag name) in the view. All nodes are compared
	 * within one `insert`/`delete` action group, for example:
	 *
	 * ```
	 * Actual DOM:		<p><b>Foo</b>Bar<i>Baz</i><b>Bax</b></p>
	 * Expected DOM:	<p>Bar<b>123</b><i>Baz</i><b>456</b></p>
	 * Input actions:	[ insert, insert, delete, delete, equal, insert, delete ]
	 * Output actions:	[ insert, replace, delete, equal, replace ]
	 * ```
	 *
	 * @param actions Actions array which is a result of the {@link module:utils/diff~diff} function.
	 * @param actualDom Actual DOM children
	 * @param expectedDom Expected DOM children.
	 * @param comparator A comparator function that should return `true` if the given node should be reused
	 * (either by the update of a text node data or an element children list for similar elements).
	 * @returns Actions array modified with the `update` actions.
	 */
	private _findUpdateActions(
		actions: Array<DiffResult>,
		actualDom: Array<DomNode> | NodeList,
		expectedDom: Array<DomNode>,
		comparator: ( a: DomNode, b: DomNode ) => boolean
	): Array<DiffResult | 'update'> {
		// If there is no both 'insert' and 'delete' actions, no need to check for replaced elements.
		if ( actions.indexOf( 'insert' ) === -1 || actions.indexOf( 'delete' ) === -1 ) {
			return actions;
		}

		let newActions: Array<DiffResult | 'update'> = [];
		let actualSlice = [];
		let expectedSlice = [];

		const counter = { equal: 0, insert: 0, delete: 0 };

		for ( const action of actions ) {
			if ( action === 'insert' ) {
				expectedSlice.push( expectedDom[ counter.equal + counter.insert ] );
			} else if ( action === 'delete' ) {
				actualSlice.push( actualDom[ counter.equal + counter.delete ] );
			} else { // equal
				newActions = newActions.concat(
					diff( actualSlice, expectedSlice, comparator )
						.map( action => action === 'equal' ? 'update' : action )
				);

				newActions.push( 'equal' );

				// Reset stored elements on 'equal'.
				actualSlice = [];
				expectedSlice = [];
			}
			counter[ action ]++;
		}

		return newActions.concat(
			diff( actualSlice, expectedSlice, comparator )
				.map( action => action === 'equal' ? 'update' : action )
		);
	}

	/**
	 * Checks if text needs to be updated and possibly updates it by removing and inserting only parts
	 * of the data from the existing text node to reduce impact on the IME composition.
	 *
	 * @param domText DOM text node to update.
	 * @param expectedText The expected data of a text node.
	 */
	private _updateTextNode( domText: DomText, expectedText: string ): void {
		const actualText = domText.data;

		if ( actualText == expectedText ) {
			// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
			// @if CK_DEBUG_TYPING // 	console.info( ..._buildLogMessage( this, 'Renderer',
			// @if CK_DEBUG_TYPING // 		'%cText node does not need update:%c ' +
			// @if CK_DEBUG_TYPING // 		`${ _escapeTextNodeData( actualText ) }%c (${ actualText.length })`,
			// @if CK_DEBUG_TYPING // 		'font-style: italic',
			// @if CK_DEBUG_TYPING // 		'color: blue',
			// @if CK_DEBUG_TYPING // 		''
			// @if CK_DEBUG_TYPING // 	) );
			// @if CK_DEBUG_TYPING // }

			return;
		}

		// Our approach to interleaving space character with NBSP might differ with the one implemented by the browser.
		// Avoid modifying the text node in the DOM if only NBSPs and spaces are interchanged.
		// We should avoid DOM modifications while composing to avoid breakage of composition.
		// See: https://github.com/ckeditor/ckeditor5/issues/13994.
		if ( env.isAndroid && this.isComposing && actualText.replace( /\u00A0/g, ' ' ) == expectedText.replace( /\u00A0/g, ' ' ) ) {
			// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
			// @if CK_DEBUG_TYPING // 	console.info( ..._buildLogMessage( this, 'Renderer',
			// @if CK_DEBUG_TYPING // 		'%cText node ignore NBSP changes while composing: ' +
			// @if CK_DEBUG_TYPING // 		`%c${ _escapeTextNodeData( actualText ) }%c (${ actualText.length }) -> ` +
			// @if CK_DEBUG_TYPING // 		`%c${ _escapeTextNodeData( expectedText ) }%c (${ expectedText.length })`,
			// @if CK_DEBUG_TYPING // 		'font-style: italic',
			// @if CK_DEBUG_TYPING // 		'color: blue',
			// @if CK_DEBUG_TYPING // 		'',
			// @if CK_DEBUG_TYPING // 		'color: blue',
			// @if CK_DEBUG_TYPING // 		''
			// @if CK_DEBUG_TYPING // 	) );
			// @if CK_DEBUG_TYPING // }

			return;
		}

		// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
		// @if CK_DEBUG_TYPING // 	console.info( ..._buildLogMessage( this, 'Renderer',
		// @if CK_DEBUG_TYPING // 		'%cUpdate text node' +
		// @if CK_DEBUG_TYPING // 		`${ this.isComposing ? ' while composing (may break composition)' : '' }: ` +
		// @if CK_DEBUG_TYPING // 		`%c${ _escapeTextNodeData( actualText ) }%c (${ actualText.length }) -> ` +
		// @if CK_DEBUG_TYPING // 		`%c${ _escapeTextNodeData( expectedText ) }%c (${ expectedText.length })`,
		// @if CK_DEBUG_TYPING // 		this.isComposing ? 'color: red; font-weight: bold' : '',
		// @if CK_DEBUG_TYPING // 		'color: blue',
		// @if CK_DEBUG_TYPING // 		'',
		// @if CK_DEBUG_TYPING // 		'color: blue',
		// @if CK_DEBUG_TYPING // 		''
		// @if CK_DEBUG_TYPING // 	) );
		// @if CK_DEBUG_TYPING // }

		this._updateTextNodeInternal( domText, expectedText );
	}

	/**
	 * Part of the `_updateTextNode` method extracted for easier testing.
	 */
	private _updateTextNodeInternal( domText: DomText, expectedText: string ): void {
		const actions = fastDiff( domText.data, expectedText );

		for ( const action of actions ) {
			if ( action.type === 'insert' ) {
				domText.insertData( action.index, action.values.join( '' ) );
			} else { // 'delete'
				domText.deleteData( action.index, action.howMany );
			}
		}
	}

	/**
	 * Marks text nodes to be synchronized.
	 *
	 * If a text node is passed, it will be marked. If an element is passed, all descendant text nodes inside it will be marked.
	 *
	 * @param viewNode View node to sync.
	 */
	private _markDescendantTextToSync( viewNode: ViewNode | undefined ): void {
		if ( !viewNode ) {
			return;
		}

		if ( viewNode.is( '$text' ) ) {
			this.markedTexts.add( viewNode );
		} else if ( viewNode.is( 'element' ) ) {
			for ( const child of viewNode.getChildren() ) {
				this._markDescendantTextToSync( child );
			}
		}
	}

	/**
	 * Checks if the selection needs to be updated and possibly updates it.
	 */
	private _updateSelection(): void {
		// Block updating DOM selection in (non-Android) Blink while the user is selecting to prevent accidental selection collapsing.
		// Note: Structural changes in DOM must trigger selection rendering, though. Nodes the selection was anchored
		// to, may disappear in DOM which would break the selection (e.g. in real-time collaboration scenarios).
		// https://github.com/ckeditor/ckeditor5/issues/10562, https://github.com/ckeditor/ckeditor5/issues/10723
		if ( env.isBlink && !env.isAndroid && this.isSelecting && !this.markedChildren.size ) {
			return;
		}

		// If there is no selection - remove DOM and fake selections.
		if ( this.selection.rangeCount === 0 ) {
			// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
			// @if CK_DEBUG_TYPING // 	console.info( ..._buildLogMessage( this, 'Renderer',
			// @if CK_DEBUG_TYPING // 		'Update DOM selection: remove all ranges'
			// @if CK_DEBUG_TYPING // 	) );
			// @if CK_DEBUG_TYPING // }

			this._removeDomSelection();
			this._removeFakeSelection();

			return;
		}

		const domEditable = this.domConverter.mapViewToDom( this.selection.editableElement! );

		// Do not update DOM selection if there is no focus, or there is no DOM element corresponding to selection's editable element.
		if ( !this.isFocused || !domEditable ) {
			// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
			// @if CK_DEBUG_TYPING // 	console.info( ..._buildLogMessage( this, 'Renderer',
			// @if CK_DEBUG_TYPING // 		'Skip updating DOM selection:',
			// @if CK_DEBUG_TYPING // 		`isFocused: ${ this.isFocused }, hasDomEditable: ${ !!domEditable }`
			// @if CK_DEBUG_TYPING // 	) );
			// @if CK_DEBUG_TYPING // }

			// But if there was a fake selection, and it is not fake anymore - remove it as it can map to no longer existing widget.
			// See https://github.com/ckeditor/ckeditor5/issues/18123.
			if ( !this.selection.isFake && this._fakeSelectionContainer && this._fakeSelectionContainer.isConnected ) {
				// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
				// @if CK_DEBUG_TYPING // 	console.info( ..._buildLogMessage( this, 'Renderer',
				// @if CK_DEBUG_TYPING // 		'Remove fake selection (not focused editable)'
				// @if CK_DEBUG_TYPING // 	) );
				// @if CK_DEBUG_TYPING // }

				this._removeFakeSelection();
			}

			return;
		}

		// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
		// @if CK_DEBUG_TYPING // 	console.info( ..._buildLogMessage( this, 'Renderer',
		// @if CK_DEBUG_TYPING // 		'Update DOM selection'
		// @if CK_DEBUG_TYPING // 	) );
		// @if CK_DEBUG_TYPING // }

		// Render fake selection - create the fake selection container (if needed) and move DOM selection to it.
		if ( this.selection.isFake ) {
			this._updateFakeSelection( domEditable );
		}
		// There was a fake selection so remove it and update the DOM selection.
		// This is especially important on Android because otherwise IME will try to compose over the fake selection container.
		else if ( this._fakeSelectionContainer && this._fakeSelectionContainer.isConnected ) {
			this._removeFakeSelection();
			this._updateDomSelection( domEditable );
		}
		// Update the DOM selection in case of a plain selection change (no fake selection is involved).
		// On non-Android the whole rendering is disabled in composition mode (including DOM selection update),
		// but updating DOM selection should be also disabled on Android if in the middle of the composition
		// (to not interrupt it).
		else if ( !( this.isComposing && env.isAndroid ) ) {
			this._updateDomSelection( domEditable );
		}
	}

	/**
	 * Updates the fake selection.
	 *
	 * @param domEditable A valid DOM editable where the fake selection container should be added.
	 */
	private _updateFakeSelection( domEditable: DomElement ): void {
		const domDocument = domEditable.ownerDocument;

		if ( !this._fakeSelectionContainer ) {
			this._fakeSelectionContainer = createFakeSelectionContainer( domDocument );
		}

		const container = this._fakeSelectionContainer;

		// Bind fake selection container with the current selection *position*.
		this.domConverter.bindFakeSelection( container, this.selection );

		if ( !this._fakeSelectionNeedsUpdate( domEditable ) ) {
			return;
		}

		if ( !container.parentElement || container.parentElement != domEditable ) {
			domEditable.appendChild( container );
		}

		container.textContent = this.selection.fakeSelectionLabel || '\u00A0';

		// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
		// @if CK_DEBUG_TYPING // 	console.info( ..._buildLogMessage( this, 'Renderer',
		// @if CK_DEBUG_TYPING // 		'Set DOM fake selection'
		// @if CK_DEBUG_TYPING // 	) );
		// @if CK_DEBUG_TYPING // }

		const domSelection = domDocument.getSelection()!;
		const domRange = domDocument.createRange();

		domSelection.removeAllRanges();
		domRange.selectNodeContents( container );
		domSelection.addRange( domRange );
	}

	/**
	 * Updates the DOM selection.
	 *
	 * @param domEditable A valid DOM editable where the DOM selection should be rendered.
	 */
	private _updateDomSelection( domEditable: DomElement ) {
		const domSelection = domEditable.ownerDocument.defaultView!.getSelection()!;

		// Let's check whether DOM selection needs updating at all.
		if ( !this._domSelectionNeedsUpdate( domSelection ) ) {
			// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
			// @if CK_DEBUG_TYPING // 	console.info( ..._buildLogMessage( this, 'Renderer',
			// @if CK_DEBUG_TYPING // 		'%cDOM selection is already correct',
			// @if CK_DEBUG_TYPING // 		'font-style: italic;'
			// @if CK_DEBUG_TYPING // 	) );
			// @if CK_DEBUG_TYPING // }

			return;
		}

		// Multi-range selection is not available in most browsers, and, at least in Chrome, trying to
		// set such selection, that is not continuous, throws an error. Because of that, we will just use anchor
		// and focus of view selection.
		// Since we are not supporting multi-range selection, we also do not need to check if proper editable is
		// selected. If there is any editable selected, it is okay (editable is taken from selection anchor).
		const anchor = this.domConverter.viewPositionToDom( this.selection.anchor! )!;
		const focus = this.domConverter.viewPositionToDom( this.selection.focus! )!;

		// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
		// @if CK_DEBUG_TYPING // 	console.info( ..._buildLogMessage( this, 'Renderer',
		// @if CK_DEBUG_TYPING // 		'Update DOM selection:',
		// @if CK_DEBUG_TYPING // 		anchor,
		// @if CK_DEBUG_TYPING // 		focus
		// @if CK_DEBUG_TYPING // 	) );
		// @if CK_DEBUG_TYPING // }

		domSelection.setBaseAndExtent( anchor.parent, anchor.offset, focus.parent, focus.offset );

		// Firefox–specific hack (https://github.com/ckeditor/ckeditor5-engine/issues/1439).
		if ( env.isGecko ) {
			fixGeckoSelectionAfterBr( focus, domSelection );
		}
	}

	/**
	 * Checks whether a given DOM selection needs to be updated.
	 *
	 * @param domSelection The DOM selection to check.
	 */
	private _domSelectionNeedsUpdate( domSelection: Selection ): boolean {
		if ( !this.domConverter.isDomSelectionCorrect( domSelection ) ) {
			// Current DOM selection is in incorrect position. We need to update it.
			return true;
		}

		const oldViewSelection = domSelection && this.domConverter.domSelectionToView( domSelection );

		if ( oldViewSelection && this.selection.isEqual( oldViewSelection ) ) {
			return false;
		}

		// If selection is not collapsed, it does not need to be updated if it is similar.
		if ( !this.selection.isCollapsed && this.selection.isSimilar( oldViewSelection ) ) {
			// Selection did not changed and is correct, do not update.
			return false;
		}

		// Selections are not similar.
		return true;
	}

	/**
	 * Checks whether the fake selection needs to be updated.
	 *
	 * @param domEditable A valid DOM editable where a new fake selection container should be added.
	 */
	private _fakeSelectionNeedsUpdate( domEditable: DomElement ): boolean {
		const container = this._fakeSelectionContainer;
		const domSelection = domEditable.ownerDocument.getSelection()!;

		// Fake selection needs to be updated if there's no fake selection container, or the container currently sits
		// in a different root.
		if ( !container || container.parentElement !== domEditable ) {
			return true;
		}

		// Make sure that the selection actually is within the fake selection.
		if ( domSelection.anchorNode !== container && !container.contains( domSelection.anchorNode ) ) {
			return true;
		}

		return container.textContent !== this.selection.fakeSelectionLabel;
	}

	/**
	 * Removes the DOM selection.
	 */
	private _removeDomSelection(): void {
		for ( const doc of this.domDocuments ) {
			const domSelection = doc.getSelection()!;

			if ( domSelection.rangeCount ) {
				const activeDomElement = doc.activeElement!;
				const viewElement = this.domConverter.mapDomToView( activeDomElement as DomElement );

				if ( activeDomElement && viewElement ) {
					domSelection.removeAllRanges();
				}
			}
		}
	}

	/**
	 * Removes the fake selection.
	 */
	private _removeFakeSelection(): void {
		const container = this._fakeSelectionContainer;

		if ( container ) {
			container.remove();
		}
	}

	/**
	 * Checks if focus needs to be updated and possibly updates it.
	 */
	private _updateFocus(): void {
		// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
		// @if CK_DEBUG_TYPING // 	console.group( ..._buildLogMessage( this, 'Renderer',
		// @if CK_DEBUG_TYPING // 		`update focus: ${ this.isFocused ? 'focused' : 'not focused' }`
		// @if CK_DEBUG_TYPING // 	) );
		// @if CK_DEBUG_TYPING // }

		if ( this.isFocused ) {
			const editable = this.selection.editableElement;

			// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
			// @if CK_DEBUG_TYPING // 	console.info( ..._buildLogMessage( this, 'Renderer',
			// @if CK_DEBUG_TYPING // 		'focus editable:',
			// @if CK_DEBUG_TYPING // 		{ editable }
			// @if CK_DEBUG_TYPING // 	) );
			// @if CK_DEBUG_TYPING // }

			if ( editable ) {
				this.domConverter.focus( editable );
			}
		}

		// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
		// @if CK_DEBUG_TYPING // 	console.groupEnd();
		// @if CK_DEBUG_TYPING // }
	}
}

/**
 * Checks if provided element is editable.
 */
function isEditable( element: ViewElement ): boolean {
	if ( element.getAttribute( 'contenteditable' ) == 'false' ) {
		return false;
	}

	const parent = element.findAncestor( element => element.hasAttribute( 'contenteditable' ) );

	return !parent || parent.getAttribute( 'contenteditable' ) == 'true';
}

/**
 * Adds inline filler at a given position.
 *
 * The position can be given as an array of DOM nodes and an offset in that array,
 * or a DOM parent element and an offset in that element.
 *
 * @returns The DOM text node that contains an inline filler.
 */
function addInlineFiller( domDocument: DomDocument, domParentOrArray: DomNode | Array<DomNode>, offset: number ): DomText {
	const childNodes = domParentOrArray instanceof Array ? domParentOrArray : domParentOrArray.childNodes;
	const nodeAfterFiller = childNodes[ offset ];

	if ( isText( nodeAfterFiller ) ) {
		nodeAfterFiller.data = INLINE_FILLER + nodeAfterFiller.data;

		return nodeAfterFiller;
	} else {
		const fillerNode = domDocument.createTextNode( INLINE_FILLER );

		if ( Array.isArray( domParentOrArray ) ) {
			( childNodes as Array<DomNode> ).splice( offset, 0, fillerNode );
		} else {
			insertAt( domParentOrArray as DomElement, offset, fillerNode );
		}

		return fillerNode;
	}
}

/**
 * Whether two DOM nodes should be considered as similar.
 * Nodes are considered similar if they have the same tag name.
 */
function areSimilarElements( node1: DomNode, node2: DomNode ): boolean {
	return isNode( node1 ) && isNode( node2 ) &&
		!isText( node1 ) && !isText( node2 ) &&
		!isComment( node1 ) && !isComment( node2 ) &&
		( node1 as DomElement ).tagName.toLowerCase() === ( node2 as DomElement ).tagName.toLowerCase();
}

/**
 * Whether two DOM nodes are text nodes.
 */
function areTextNodes( node1: DomNode, node2: DomNode ): boolean {
	return isNode( node1 ) && isNode( node2 ) &&
		isText( node1 ) && isText( node2 );
}

/**
 * Whether two dom nodes should be considered as the same.
 * Two nodes which are considered the same are:
 *
 * * Text nodes with the same text.
 * * Element nodes represented by the same object.
 * * Two block filler elements.
 *
 * @param blockFillerMode Block filler mode, see {@link module:engine/view/domconverter~DomConverter#blockFillerMode}.
 */
function sameNodes( domConverter: DomConverter, actualDomChild: DomNode, expectedDomChild: DomNode ): boolean {
	// Elements.
	if ( actualDomChild === expectedDomChild ) {
		return true;
	}
	// Texts.
	else if ( isText( actualDomChild ) && isText( expectedDomChild ) ) {
		return actualDomChild.data === expectedDomChild.data;
	}
	// Block fillers.
	else if ( domConverter.isBlockFiller( actualDomChild ) &&
		domConverter.isBlockFiller( expectedDomChild ) ) {
		return true;
	}

	// Not matching types.
	return false;
}

/**
 * The following is a Firefox–specific hack (https://github.com/ckeditor/ckeditor5-engine/issues/1439).
 * When the native DOM selection is at the end of the block and preceded by <br /> e.g.
 *
 * ```html
 * <p>foo<br/>[]</p>
 * ```
 *
 * which happens a lot when using the soft line break, the browser fails to (visually) move the
 * caret to the new line. A quick fix is as simple as force–refreshing the selection with the same range.
 */
function fixGeckoSelectionAfterBr( focus: ReturnType<DomConverter[ 'viewPositionToDom' ]>, domSelection: DomSelection ) {
	let parent = focus!.parent;
	let offset = focus!.offset;

	if ( isText( parent ) && isInlineFiller( parent ) ) {
		offset = indexOf( parent ) + 1;
		parent = parent.parentNode!;
	}

	// This fix works only when the focus point is at the very end of an element.
	// There is no point in running it in cases unrelated to the browser bug.
	if ( parent.nodeType != Node.ELEMENT_NODE || offset != parent.childNodes.length - 1 ) {
		return;
	}

	const childAtOffset = parent.childNodes[ offset ];

	// To stay on the safe side, the fix being as specific as possible, it targets only the
	// selection which is at the very end of the element and preceded by <br />.
	if ( childAtOffset && ( childAtOffset as DomElement ).tagName == 'BR' ) {
		domSelection.addRange( domSelection.getRangeAt( 0 ) );
	}
}

function filterOutFakeSelectionContainer( domChildList: Array<DomNode> | NodeList, fakeSelectionContainer: DomElement | null ) {
	const childList = Array.from( domChildList );

	if ( childList.length == 0 || !fakeSelectionContainer ) {
		return childList;
	}

	const last = childList[ childList.length - 1 ];

	if ( last == fakeSelectionContainer ) {
		childList.pop();
	}

	return childList;
}

/**
 * Creates a fake selection container for a given document.
 */
function createFakeSelectionContainer( domDocument: DomDocument ): DomElement {
	const container = domDocument.createElement( 'div' );

	container.className = 'ck-fake-selection-container';

	Object.assign( container.style, {
		position: 'fixed',
		top: 0,
		left: '-9999px',
		// See https://github.com/ckeditor/ckeditor5/issues/752.
		width: '42px'
	} );

	// Fill it with a text node so we can update it later.
	container.textContent = '\u00A0';

	return container;
}

// @if CK_DEBUG_TYPING // function _escapeTextNodeData( text ) {
// @if CK_DEBUG_TYPING // 	const escapedText = text
// @if CK_DEBUG_TYPING // 		.replace( /&/g, '&amp;' )
// @if CK_DEBUG_TYPING // 		.replace( /\u00A0/g, '&nbsp;' )
// @if CK_DEBUG_TYPING // 		.replace( /\u2060/g, '&NoBreak;' );
// @if CK_DEBUG_TYPING //
// @if CK_DEBUG_TYPING // 	return `"${ escapedText }"`;
// @if CK_DEBUG_TYPING // }
