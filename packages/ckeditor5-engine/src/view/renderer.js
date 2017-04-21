/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/view/renderer
 */

import ViewText from './text';
import ViewPosition from './position';
import Selection from './selection';
import { INLINE_FILLER, INLINE_FILLER_LENGTH, startsWithFiller, isInlineFiller, isBlockFiller } from './filler';

import mix from '@ckeditor/ckeditor5-utils/src/mix';
import diff from '@ckeditor/ckeditor5-utils/src/diff';
import insertAt from '@ckeditor/ckeditor5-utils/src/dom/insertat';
import remove from '@ckeditor/ckeditor5-utils/src/dom/remove';
import log from '@ckeditor/ckeditor5-utils/src/log';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * Renderer updates DOM structure and selection, to make them a reflection of the view structure and selection.
 *
 * View nodes which may need to be rendered needs to be {@link module:engine/view/renderer~Renderer#markToSync marked}.
 * Then, on {@link module:engine/view/renderer~Renderer#render render}, renderer compares the view nodes with the DOM nodes
 * in order to check which ones really need to be refreshed. Finally, it creates DOM nodes from these view nodes,
 * {@link module:engine/view/domconverter~DomConverter#bindElements binds} them and inserts into the DOM tree.
 *
 * Every time {@link module:engine/view/renderer~Renderer#render render} is called, renderer additionally checks if
 * {@link module:engine/view/renderer~Renderer#selection selection} needs update and updates it if so.
 *
 * Renderer uses {@link module:engine/view/domconverter~DomConverter} to transform and bind nodes.
 */
export default class Renderer {
	/**
	 * Creates a renderer instance.
	 *
	 * @param {module:engine/view/domconverter~DomConverter} domConverter Converter instance.
	 * @param {module:engine/view/selection~Selection} selection View selection.
	 */
	constructor( domConverter, selection ) {
		/**
		 * Set of DOM Documents instances.
		 *
		 * @member {Set.<Document>}
		 */
		this.domDocuments = new Set();

		/**
		 * Converter instance.
		 *
		 * @readonly
		 * @member {module:engine/view/domconverter~DomConverter}
		 */
		this.domConverter = domConverter;

		/**
		 * Set of nodes which attributes changed and may need to be rendered.
		 *
		 * @readonly
		 * @member {Set.<module:engine/view/node~Node>}
		 */
		this.markedAttributes = new Set();

		/**
		 * Set of elements which child lists changed and may need to be rendered.
		 *
		 * @readonly
		 * @member {Set.<module:engine/view/node~Node>}
		 */
		this.markedChildren = new Set();

		/**
		 * Set of text nodes which text data changed and may need to be rendered.
		 *
		 * @readonly
		 * @member {Set.<module:engine/view/node~Node>}
		 */
		this.markedTexts = new Set();

		/**
		 * View selection. Renderer updates DOM Selection to make it match this one.
		 *
		 * @readonly
		 * @member {module:engine/view/selection~Selection}
		 */
		this.selection = selection;

		/**
		 * The text node in which the inline filler was rendered.
		 *
		 * @private
		 * @member {Text}
		 */
		this._inlineFiller = null;

		/**
		 * Indicates if view document is focused and selection can be rendered. Selection will not be rendered if
		 * this is set to `false`.
		 *
		 * @member {Boolean}
		 */
		this.isFocused = false;

		/**
		 * DOM element containing fake selection.
		 *
		 * @private
		 * @type {null|HTMLElement}
		 */
		this._fakeSelectionContainer = null;
	}

	/**
	 * Mark node to be synchronized.
	 *
	 * Note that only view nodes which parents have corresponding DOM elements need to be marked to be synchronized.
	 *
	 * @see #markedAttributes
	 * @see #markedChildren
	 * @see #markedTexts
	 *
	 * @param {module:engine/view/document~ChangeType} type Type of the change.
	 * @param {module:engine/view/node~Node} node Node to be marked.
	 */
	markToSync( type, node ) {
		if ( type === 'text' ) {
			if ( this.domConverter.getCorrespondingDom( node.parent ) ) {
				this.markedTexts.add( node );
			}
		} else {
			// If the node has no DOM element it is not rendered yet,
			// its children/attributes do not need to be marked to be sync.
			if ( !this.domConverter.getCorrespondingDom( node ) ) {
				return;
			}

			if ( type === 'attributes' ) {
				this.markedAttributes.add( node );
			} else if ( type === 'children' ) {
				this.markedChildren.add( node );
			} else {
				/**
				 * Unknown type passed to Renderer.markToSync.
				 *
				 * @error renderer-unknown-type
				 */
				throw new CKEditorError( 'view-renderer-unknown-type: Unknown type passed to Renderer.markToSync.' );
			}
		}
	}

	/**
	 * Render method checks {@link #markedAttributes},
	 * {@link #markedChildren} and {@link #markedTexts} and updates all
	 * nodes which need to be updated. Then it clears all three sets. Also, every time render is called it compares and
	 * if needed updates the selection.
	 *
	 * Renderer tries not to break text composition (e.g. IME) and x-index of the selection,
	 * so it does as little as it is needed to update the DOM.
	 *
	 * For attributes it adds new attributes to DOM elements, updates values and removes
	 * attributes which do not exist in the view element.
	 *
	 * For text nodes it updates the text string if it is different. Note that if parent element is marked as an element
	 * which changed child list, text node update will not be done, because it may not be possible do find a
	 * {@link module:engine/view/domconverter~DomConverter#getCorrespondingDomText corresponding DOM text}. The change will be handled
	 * in the parent element.
	 *
	 * For elements, which child lists have changed, it calculates a {@link module:utils/diff~diff} and adds or removes children which have
	 * changed.
	 *
	 * Rendering also handles {@link module:engine/view/filler fillers}. Especially, it checks if the inline filler is needed
	 * at selection position and adds or removes it. To prevent breaking text composition inline filler will not be
	 * removed as long selection is in the text node which needed it at first.
	 */
	render() {
		let inlineFillerPosition;

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
		// Othewise, if it's needed, create it at the selection position.
		else if ( this._needsInlineFillerAtSelection() ) {
			inlineFillerPosition = this.selection.getFirstPosition();

			// Do not use `markToSync` so it will be added even if the parent is already added.
			this.markedChildren.add( inlineFillerPosition.parent );
		}

		for ( let node of this.markedTexts ) {
			if ( !this.markedChildren.has( node.parent ) && this.domConverter.getCorrespondingDom( node.parent ) ) {
				this._updateText( node, { inlineFillerPosition } );
			}
		}

		for ( let element of this.markedAttributes ) {
			this._updateAttrs( element );
		}

		for ( let element of this.markedChildren ) {
			this._updateChildren( element, { inlineFillerPosition } );
		}

		this._updateSelection();
		this._updateFocus();

		this.markedTexts.clear();
		this.markedAttributes.clear();
		this.markedChildren.clear();

		// Remember the filler by its node.
		this._inlineFiller = this._getInlineFillerNode( inlineFillerPosition );
	}

	/**
	 * Gets the text node in which the inline filler is kept.
	 *
	 * @private
	 * @param {module:engine/view/position~Position} fillerPosition The position on which the filler is needed in the view.
	 * @returns {Text} The text node with the filler.
	 */
	_getInlineFillerNode( fillerPosition ) {
		if ( !fillerPosition ) {
			this._inlineFiller = null;

			return;
		}

		const domPosition = this.domConverter.viewPositionToDom( fillerPosition );

		/* istanbul ignore if */
		if ( !domPosition || !startsWithFiller( domPosition.parent ) ) {
			/**
			 * Cannot find filler node by its position.
			 *
			 * @error view-renderer-cannot-find-filler
			 */
			throw new CKEditorError( 'view-renderer-cannot-find-filler: Cannot find filler node by its position.' );
		}

		return domPosition.parent;
	}

	/**
	 * Gets the position of the inline filler based on the current selection.
	 * Here, we assume that we know that the filler is needed and
	 * {@link #_isSelectionInInlineFiller is at the selection position}, and, since it's needed,
	 * it's somewhere at the selection postion.
	 *
	 * Note: we cannot restore the filler position based on the filler's DOM text node, because
	 * when this method is called (before rendering) the bindings will often be broken. View to DOM
	 * bindings are only dependable after rendering.
	 *
	 * @private
	 * @returns {module:engine/view/position~Position}
	 */
	_getInlineFillerPosition() {
		const firstPos = this.selection.getFirstPosition();

		if ( firstPos.parent.is( 'text' ) ) {
			return ViewPosition.createBefore( this.selection.getFirstPosition().parent );
		} else {
			return firstPos;
		}
	}

	/**
	 * Returns `true` if the selection hasn't left the inline filler's text node.
	 * If it is `true` it means that the filler had been added for a reason and the selection does not
	 * left the filler's text node. E.g. the user can be in the middle of a composition so it should not be touched.
	 *
	 * @private
	 * @returns {Boolean} True if the inline filler and selection are in the same place.
	 */
	_isSelectionInInlineFiller() {
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
		const selectionPosition = this.selection.getFirstPosition();
		const position = this.domConverter.viewPositionToDom( selectionPosition );

		if ( position && this.domConverter.isText( position.parent ) && startsWithFiller( position.parent ) ) {
			return true;
		}

		return false;
	}

	/**
	 * Removes the inline filler.
	 *
	 * @private
	 */
	_removeInlineFiller() {
		const domFillerNode = this._inlineFiller;

		// Something weird happened and the stored node doesn't contain the filler's text.
		if ( !startsWithFiller( domFillerNode ) ) {
			/**
			 * The inline filler node was lost. Most likely, something overwrote the filler text node
			 * in the DOM.
			 *
			 * @error view-renderer-filler-was-lost
			 */
			throw new CKEditorError( 'view-renderer-filler-was-lost: The inline filler node was lost.' );
		}

		if ( isInlineFiller( domFillerNode ) ) {
			domFillerNode.parentNode.removeChild( domFillerNode );
		} else {
			domFillerNode.data = domFillerNode.data.substr( INLINE_FILLER_LENGTH );
		}

		this._inlineFiller = null;
	}

	/**
	 * Checks if the inline {@link module:engine/view/filler filler} should be added.
	 *
	 * @private
	 * @returns {Boolean} True if the inline fillers should be added.
	 */
	_needsInlineFillerAtSelection() {
		if ( this.selection.rangeCount != 1 || !this.selection.isCollapsed ) {
			return false;
		}

		const selectionPosition = this.selection.getFirstPosition();
		const selectionParent = selectionPosition.parent;
		const selectionOffset = selectionPosition.offset;

		// If there is no DOM root we do not care about fillers.
		if ( !this.domConverter.getCorrespondingDomElement( selectionParent.root ) ) {
			return false;
		}

		if ( !( selectionParent.is( 'element' ) ) ) {
			return false;
		}

		// We have block filler, we do not need inline one.
		if ( selectionOffset === selectionParent.getFillerOffset() ) {
			return false;
		}

		const nodeBefore = selectionPosition.nodeBefore;
		const nodeAfter = selectionPosition.nodeAfter;

		if ( nodeBefore instanceof ViewText || nodeAfter instanceof ViewText ) {
			return false;
		}

		return true;
	}

	/**
	 * Checks if text needs to be updated and possibly updates it.
	 *
	 * @private
	 * @param {module:engine/view/text~Text} viewText View text to update.
	 * @param {Object} options
	 * @param {module:engine/view/position~Position} options.inlineFillerPosition The position on which the inline
	 * filler should be rendered.
	 */
	_updateText( viewText, options ) {
		const domText = this.domConverter.getCorrespondingDom( viewText );
		const newDomText = this.domConverter.viewToDom( viewText, domText.ownerDocument );

		const actualText = domText.data;
		let expectedText = newDomText.data;

		const filler = options.inlineFillerPosition;

		if ( filler && filler.parent == viewText.parent && filler.offset == viewText.index ) {
			expectedText = INLINE_FILLER + expectedText;
		}

		if ( actualText != expectedText ) {
			domText.data = expectedText;
		}
	}

	/**
	 * Checks if attributes list needs to be updated and possibly updates it.
	 *
	 * @private
	 * @param {module:engine/view/element~Element} viewElement View element to update.
	 */
	_updateAttrs( viewElement ) {
		const domElement = this.domConverter.getCorrespondingDom( viewElement );
		const domAttrKeys = Array.from( domElement.attributes ).map( attr => attr.name );
		const viewAttrKeys = viewElement.getAttributeKeys();

		// Add or overwrite attributes.
		for ( let key of viewAttrKeys ) {
			domElement.setAttribute( key, viewElement.getAttribute( key ) );
		}

		// Remove from DOM attributes which do not exists in the view.
		for ( let key of domAttrKeys ) {
			if ( !viewElement.hasAttribute( key ) ) {
				domElement.removeAttribute( key );
			}
		}
	}

	/**
	 * Checks if elements child list needs to be updated and possibly updates it.
	 *
	 * @private
	 * @param {module:engine/view/element~Element} viewElement View element to update.
	 * @param {Object} options
	 * @param {module:engine/view/position~Position} options.inlineFillerPosition The position on which the inline
	 * filler should be rendered.
	 */
	_updateChildren( viewElement, options ) {
		const domConverter = this.domConverter;
		const domElement = domConverter.getCorrespondingDom( viewElement );

		if ( !domElement ) {
			// If there is no `domElement` it means that it was already removed from DOM.
			// There is no need to update it. It will be updated when re-inserted.
			return;
		}

		const domDocument = domElement.ownerDocument;

		const filler = options.inlineFillerPosition;

		const actualDomChildren = domElement.childNodes;
		const expectedDomChildren = Array.from( domConverter.viewChildrenToDom( viewElement, domDocument, { bind: true } ) );

		if ( filler && filler.parent == viewElement ) {
			const expectedNodeAfterFiller = expectedDomChildren[ filler.offset ];

			if ( this.domConverter.isText( expectedNodeAfterFiller ) ) {
				expectedNodeAfterFiller.data = INLINE_FILLER + expectedNodeAfterFiller.data;
			} else {
				expectedDomChildren.splice( filler.offset, 0, domDocument.createTextNode( INLINE_FILLER ) );
			}
		}

		const actions = diff( actualDomChildren, expectedDomChildren, sameNodes );

		let i = 0;

		for ( let action of actions ) {
			if ( action === 'insert' ) {
				insertAt( domElement, i, expectedDomChildren[ i ] );
				i++;
			} else if ( action === 'delete' ) {
				// Whenever element is removed from DOM, unbind it and all of its children.
				this.domConverter.unbindDomElement( actualDomChildren[ i ] );
				remove( actualDomChildren[ i ] );
			} else { // 'equal'
				i++;
			}
		}

		function sameNodes( actualDomChild, expectedDomChild ) {
			// Elements.
			if ( actualDomChild === expectedDomChild ) {
				return true;
			}
			// Texts.
			else if ( domConverter.isText( actualDomChild ) && domConverter.isText( expectedDomChild ) ) {
				return actualDomChild.data === expectedDomChild.data;
			}
			// Block fillers.
			else if ( isBlockFiller( actualDomChild, domConverter.blockFiller ) &&
				isBlockFiller( expectedDomChild, domConverter.blockFiller ) ) {
				return true;
			}

			// Not matching types.
			return false;
		}
	}

	/**
	 * Checks if selection needs to be updated and possibly updates it.
	 *
	 * @private
	 */
	_updateSelection() {
		// If there is no selection - remove DOM and fake selections.
		if ( this.selection.rangeCount === 0 ) {
			this._removeDomSelection();
			this._removeFakeSelection();

			return;
		}

		const domRoot = this.domConverter.getCorrespondingDomElement( this.selection.editableElement );

		// Do nothing if there is no focus, or there is no DOM element corresponding to selection's editable element.
		if ( !this.isFocused || !domRoot ) {
			return;
		}

		// Render selection.
		if ( this.selection.isFake ) {
			this._updateFakeSelection( domRoot );
		} else {
			this._removeFakeSelection();
			this._updateDomSelection( domRoot );
		}
	}

	/**
	 * Updates fake selection.
	 *
	 * @private
	 * @param {HTMLElement} domRoot Valid DOM root where fake selection container should be added.
	 */
	_updateFakeSelection( domRoot ) {
		const domDocument = domRoot.ownerDocument;

		// Create fake selection container if one does not exist.
		if ( !this._fakeSelectionContainer ) {
			this._fakeSelectionContainer = domDocument.createElement( 'div' );
			this._fakeSelectionContainer.style.position = 'fixed';
			this._fakeSelectionContainer.style.top = 0;
			this._fakeSelectionContainer.style.left = '-9999px';
			this._fakeSelectionContainer.appendChild( domDocument.createTextNode( '\u00A0' ) );
		}

		// Add fake container if not already added.
		if ( !this._fakeSelectionContainer.parentElement ) {
			domRoot.appendChild( this._fakeSelectionContainer );
		}

		// Update contents.
		const content = this.selection.fakeSelectionLabel || '\u00A0';
		this._fakeSelectionContainer.firstChild.data = content;

		// Update selection.
		const domSelection = domDocument.getSelection();
		domSelection.removeAllRanges();

		const domRange = domDocument.createRange();
		domRange.selectNodeContents( this._fakeSelectionContainer );
		domSelection.addRange( domRange );

		// Bind fake selection container with current selection.
		this.domConverter.bindFakeSelection( this._fakeSelectionContainer, this.selection );
	}

	/**
	 * Updates DOM selection.
	 *
	 * @private
	 * @param {HTMLElement} domRoot Valid DOM root where DOM selection should be rendered.
	 */
	_updateDomSelection( domRoot ) {
		const domSelection = domRoot.ownerDocument.defaultView.getSelection();
		const oldViewSelection = domSelection && this.domConverter.domSelectionToView( domSelection );

		if ( oldViewSelection && this.selection.isEqual( oldViewSelection ) ) {
			return;
		}

		if ( oldViewSelection && areSimilarSelections( oldViewSelection, this.selection ) ) {
			const data = {
				oldSelection: oldViewSelection,
				currentSelection: this.selection
			};

			log.warn( 'renderer-skipped-selection-rendering: The selection was not rendered due to its similarity to the current one.', data );

			return;
		}

		// Multi-range selection is not available in most browsers, and, at least in Chrome, trying to
		// set such selection, that is not continuous, throws an error. Because of that, we will just use anchor
		// and focus of view selection.
		// Since we are not supporting multi-range selection, we also do not need to check if proper editable is
		// selected. If there is any editable selected, it is okay (editable is taken from selection anchor).
		const anchor = this.domConverter.viewPositionToDom( this.selection.anchor );
		const focus = this.domConverter.viewPositionToDom( this.selection.focus );

		domSelection.collapse( anchor.parent, anchor.offset );
		domSelection.extend( focus.parent, focus.offset );
	}

	/**
	 * Removes DOM selection.
	 *
	 * @private
	 */
	_removeDomSelection() {
		for ( let doc of this.domDocuments ) {
			const domSelection = doc.getSelection();

			if ( domSelection.rangeCount ) {
				const activeDomElement = doc.activeElement;
				const viewElement = this.domConverter.getCorrespondingViewElement( activeDomElement );

				if ( activeDomElement && viewElement ) {
					doc.getSelection().removeAllRanges();
				}
			}
		}
	}

	/**
	 * Removes fake selection.
	 *
	 * @private
	 */
	_removeFakeSelection() {
		const container = this._fakeSelectionContainer;

		if ( container ) {
			container.remove();
		}
	}

	/**
	 * Checks if focus needs to be updated and possibly updates it.
	 *
	 * @private
	 */
	_updateFocus() {
		if ( this.isFocused ) {
			const editable = this.selection.editableElement;

			if ( editable ) {
				this.domConverter.focus( editable );
			}
		}
	}
}

mix( Renderer, ObservableMixin );

// Checks if two given selections are similar. Selections are considered similar if they are non-collapsed
// and their trimmed (see {@link #_trimSelection}) representations are equal.
//
// @private
// @param {module:engine/view/selection~Selection} selection1
// @param {module:engine/view/selection~Selection} selection2
// @returns {Boolean}
function areSimilarSelections( selection1, selection2 ) {
	return !selection1.isCollapsed && trimSelection( selection1 ).isEqual( trimSelection( selection2 ) );
}

// Creates a copy of a given selection with all of its ranges
// trimmed (see {@link module:engine/view/range~Range#getTrimmed getTrimmed}).
//
// @private
// @param {module:engine/view/selection~Selection} selection
// @returns {module:engine/view/selection~Selection} Selection copy with all ranges trimmed.
function trimSelection( selection ) {
	const newSelection = Selection.createFromSelection( selection );
	const ranges = newSelection.getRanges();

	let trimmedRanges = [];

	for ( let range of ranges ) {
		trimmedRanges.push( range.getTrimmed() );
	}

	newSelection.setRanges( trimmedRanges, newSelection.isBackward );

	return newSelection;
}
