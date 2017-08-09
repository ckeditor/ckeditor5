/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/view/renderer
 */

import ViewText from './text';
import ViewPosition from './position';
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
 * Then, on {@link module:engine/view/renderer~Renderer#render render}, renderer compares view nodes with DOM nodes
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
		 * View selection. Renderer updates DOM selection based on the view selection.
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
		 * Indicates if the view document is focused and selection can be rendered. Selection will not be rendered if
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
			if ( this.domConverter.mapViewToDom( node.parent ) ) {
				this.markedTexts.add( node );
			}
		} else {
			// If the node has no DOM element it is not rendered yet,
			// its children/attributes do not need to be marked to be sync.
			if ( !this.domConverter.mapViewToDom( node ) ) {
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
	 * which changed child list, text node update will not be done, because it may not be possible to
	 * {@link module:engine/view/domconverter~DomConverter#findCorrespondingDomText find a corresponding DOM text}.
	 * The change will be handled in the parent element.
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
		// Otherwise, if it's needed, create it at the selection position.
		else if ( this._needsInlineFillerAtSelection() ) {
			inlineFillerPosition = this.selection.getFirstPosition();

			// Do not use `markToSync` so it will be added even if the parent is already added.
			this.markedChildren.add( inlineFillerPosition.parent );
		}

		for ( const node of this.markedTexts ) {
			if ( !this.markedChildren.has( node.parent ) && this.domConverter.mapViewToDom( node.parent ) ) {
				this._updateText( node, { inlineFillerPosition } );
			}
		}

		for ( const element of this.markedAttributes ) {
			this._updateAttrs( element );
		}

		for ( const element of this.markedChildren ) {
			this._updateChildren( element, { inlineFillerPosition } );
		}

		// Check whether the inline filler is required and where it really is in the DOM.
		// At this point in most cases it will be in the DOM, but there are exceptions.
		// For example, if the inline filler was deep in the created DOM structure, it will not be created.
		// Similarly, if it was removed at the beginning of this function and then neither text nor children were updated,
		// it will not be present.
		// Fix those and similar scenarios.
		if ( inlineFillerPosition ) {
			const fillerDomPosition = this.domConverter.viewPositionToDom( inlineFillerPosition );
			const domDocument = fillerDomPosition.parent.ownerDocument;

			if ( !startsWithFiller( fillerDomPosition.parent ) ) {
				// Filler has not been created at filler position. Create it now.
				this._inlineFiller = this._addInlineFiller( domDocument, fillerDomPosition.parent, fillerDomPosition.offset );
			} else {
				// Filler has been found, save it.
				this._inlineFiller = fillerDomPosition.parent;
			}
		} else {
			// There is no filler needed.
			this._inlineFiller = null;
		}

		this._updateSelection();
		this._updateFocus();

		this.markedTexts.clear();
		this.markedAttributes.clear();
		this.markedChildren.clear();
	}

	/**
	 * Adds inline filler at given position.
	 *
	 * The position can be given as an array of DOM nodes and an offset in that array,
	 * or a DOM parent element and offset in that element.
	 *
	 * @private
	 * @param {Document} domDocument
	 * @param {Element|Array.<Node>} domParentOrArray
	 * @param {Number} offset
	 * @returns {Text} The DOM text node that contains inline filler.
	 */
	_addInlineFiller( domDocument, domParentOrArray, offset ) {
		const childNodes = domParentOrArray instanceof Array ? domParentOrArray : domParentOrArray.childNodes;
		const nodeAfterFiller = childNodes[ offset ];

		if ( this.domConverter.isText( nodeAfterFiller ) ) {
			nodeAfterFiller.data = INLINE_FILLER + nodeAfterFiller.data;

			return nodeAfterFiller;
		} else {
			const fillerNode = domDocument.createTextNode( INLINE_FILLER );

			if ( Array.isArray( domParentOrArray ) ) {
				childNodes.splice( offset, 0, fillerNode );
			} else {
				insertAt( domParentOrArray, offset, fillerNode );
			}

			return fillerNode;
		}
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
		if ( !this.domConverter.mapViewToDom( selectionParent.root ) ) {
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
		const domText = this.domConverter.findCorrespondingDomText( viewText );
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
		const domElement = this.domConverter.mapViewToDom( viewElement );
		const domAttrKeys = Array.from( domElement.attributes ).map( attr => attr.name );
		const viewAttrKeys = viewElement.getAttributeKeys();

		// Add or overwrite attributes.
		for ( const key of viewAttrKeys ) {
			domElement.setAttribute( key, viewElement.getAttribute( key ) );
		}

		// Remove from DOM attributes which do not exists in the view.
		for ( const key of domAttrKeys ) {
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
		const domElement = domConverter.mapViewToDom( viewElement );

		if ( !domElement ) {
			// If there is no `domElement` it means that it was already removed from DOM.
			// There is no need to update it. It will be updated when re-inserted.
			return;
		}

		const domDocument = domElement.ownerDocument;
		const filler = options.inlineFillerPosition;
		const actualDomChildren = domElement.childNodes;
		const expectedDomChildren = Array.from( domConverter.viewChildrenToDom( viewElement, domDocument, { bind: true } ) );

		// Inline filler element has to be created during children update because we need it to diff actual dom
		// elements with expected dom elements. We need inline filler in expected dom elements so we won't re-render
		// text node if it is not necessary.
		if ( filler && filler.parent == viewElement ) {
			this._addInlineFiller( domDocument, expectedDomChildren, filler.offset );
		}

		const actions = diff( actualDomChildren, expectedDomChildren, sameNodes );

		let i = 0;
		const nodesToUnbind = new Set();

		for ( const action of actions ) {
			if ( action === 'insert' ) {
				insertAt( domElement, i, expectedDomChildren[ i ] );
				i++;
			} else if ( action === 'delete' ) {
				nodesToUnbind.add( actualDomChildren[ i ] );
				remove( actualDomChildren[ i ] );
			} else { // 'equal'
				i++;
			}
		}

		// Unbind removed nodes. When node does not have a parent it means that it was removed from DOM tree during
		// comparision with the expected DOM. We don't need to check child nodes, because if child node was reinserted,
		// it was moved to DOM tree out of the removed node.
		for ( const node of nodesToUnbind ) {
			if ( !node.parentNode ) {
				this.domConverter.unbindDomElement( node );
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

		const domRoot = this.domConverter.mapViewToDom( this.selection.editableElement );

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

		// Let's check whether DOM selection needs updating at all.
		if ( !this._domSelectionNeedsUpdate( domSelection ) ) {
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
	 * Checks whether given DOM selection needs to be updated.
	 *
	 * @private
	 * @param {Selection} domSelection DOM selection to check.
	 * @returns {Boolean}
	 */
	_domSelectionNeedsUpdate( domSelection ) {
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
			const data = {
				oldSelection: oldViewSelection,
				currentSelection: this.selection
			};

			log.warn(
				'renderer-skipped-selection-rendering: The selection was not rendered due to its similarity to the current one.',
				data
			);

			// Selection did not changed and is correct, do not update.
			return false;
		}

		// Selections are not similar.
		return true;
	}

	/**
	 * Removes DOM selection.
	 *
	 * @private
	 */
	_removeDomSelection() {
		for ( const doc of this.domDocuments ) {
			const domSelection = doc.getSelection();

			if ( domSelection.rangeCount ) {
				const activeDomElement = doc.activeElement;
				const viewElement = this.domConverter.mapDomToView( activeDomElement );

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
