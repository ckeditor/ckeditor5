/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ViewText from './text.js';
import ViewElement from './element.js';
import ViewPosition from './position.js';
import { INLINE_FILLER, INLINE_FILLER_LENGTH, startsWithFiller, isInlineFiller, isBlockFiller } from './filler.js';

import mix from '../../utils/mix.js';
import diff from '../../utils/diff.js';
import insertAt from '../../utils/dom/insertat.js';
import remove from '../../utils/dom/remove.js';
import ObservableMixin from '../../utils/observablemixin.js';
import CKEditorError from '../../utils/ckeditorerror.js';

/* global Range */

/**
 * Renderer updates DOM structure and selection, to make them a reflection of the view structure and selection.
 *
 * View nodes which may need to be rendered needs to be {@link engine.view.Renderer#markToSync marked}.
 * Then, on {@link engine.view.Renderer#render render}, renderer compares the view nodes with the DOM nodes
 * in order to check which ones really need to be refreshed. Finally, it creates DOM nodes from these view nodes,
 * {@link engine.view.DomConverter#bindElements binds} them and inserts into the DOM tree.
 *
 * Every time {@link engine.view.Renderer#render render} is called, renderer additionally checks if
 * {@link engine.view.Renderer#selection selection} needs update and updates it if so.
 *
 * Renderer uses {@link engine.view.DomConverter} to transform and bind nodes.
 *
 * @memberOf engine.view
 */
export default class Renderer {
	/**
	 * Creates a renderer instance.
	 *
	 * @param {engine.view.DomConverter} domConverter Converter instance.
	 * @param {engine.view.Selection} selection View selection.
	 */
	constructor( domConverter, selection ) {
		/**
		 * Set of DOM Documents instances.
		 *
		 * @member {Set.<Document>} engine.view.Renderer#domDocuments
		 */
		this.domDocuments = new Set();

		/**
		 * Converter instance.
		 *
		 * @readonly
		 * @member {engine.view.DomConverter} engine.view.Renderer#domConverter
		 */
		this.domConverter = domConverter;

		/**
		 * Set of nodes which attributes changed and may need to be rendered.
		 *
		 * @readonly
		 * @member {Set.<engine.view.Node>} engine.view.Renderer#markedAttributes
		 */
		this.markedAttributes = new Set();

		/**
		 * Set of elements which child lists changed and may need to be rendered.
		 *
		 * @readonly
		 * @member {Set.<engine.view.Node>} engine.view.Renderer#markedChildren
		 */
		this.markedChildren = new Set();

		/**
		 * Set of text nodes which text data changed and may need to be rendered.
		 *
		 * @readonly
		 * @member {Set.<engine.view.Node>} engine.view.Renderer#markedTexts
		 */
		this.markedTexts = new Set();

		/**
		 * View selection. Renderer updates DOM Selection to make it match this one.
		 *
		 * @readonly
		 * @member {engine.view.Selection} engine.view.Renderer#selection
		 */
		this.selection = selection;

		/**
		 * TODO
		 *
		 * @private
		 * @member {Text} engine.view.Renderer#_inlineFiller
		 */
		this._inlineFiller = null;

		/**
		 * Indicates if view document is focused and selection can be rendered. Selection will not be rendered if
		 * this is set to `false`.
		 *
		 * @member {Boolean} engine.view.Renderer#isFocused
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
	 * @see engine.view.Renderer#markedAttributes
	 * @see engine.view.Renderer#markedChildren
	 * @see engine.view.Renderer#markedTexts
	 *
	 * @param {engine.view.ChangeType} type Type of the change.
	 * @param {engine.view.Node} node Node to be marked.
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
	 * Render method checks {@link engine.view.Renderer#markedAttributes},
	 * {@link engine.view.Renderer#markedChildren} and {@link engine.view.Renderer#markedTexts} and updates all
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
	 * {@link engine.view.DomConverter#getCorrespondingDomText corresponding DOM text}. The change will be handled
	 * in the parent element.
	 *
	 * For elements, which child lists have changed, it calculates a {@link diff} and adds or removes children which have changed.
	 *
	 * Rendering also handles {@link engine.view.filler fillers}. Especially, it checks if the inline filler is needed
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
		// Othewise, if it's needed, set it at the selection position.
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

		this._setInlineFillerPosition( inlineFillerPosition );
	}

	_setInlineFillerPosition( fillerPosition ) {
		if ( !fillerPosition ) {
			this._inlineFiller = null;

			return;
		}

		const domPosition = this.domConverter.viewPositionToDom( fillerPosition );

		if ( !domPosition || !startsWithFiller( domPosition.parent ) ) {
			throw new CKEditorError( 'view-renderer-cannot-find-filler' );
		}

		this._inlineFiller = domPosition.parent;
	}

	_getInlineFillerPosition() {
		const firstPos = this.selection.getFirstPosition();

		if ( firstPos.parent  instanceof ViewText ) {
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

		const { parent: domParent } = this.domConverter.viewPositionToDom( this.selection.getFirstPosition() );

		if ( this.domConverter.isText( domParent ) && startsWithFiller( domParent ) ) {
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
			 * TODO
			 */
			throw new CKEditorError( 'todo: TODO' );
		}

		if ( isInlineFiller( domFillerNode ) ) {
			domFillerNode.parentNode.removeChild( domFillerNode );
		} else {
			domFillerNode.data = domFillerNode.data.substr( INLINE_FILLER_LENGTH );
		}

		this._inlineFiller = null;
	}

	/**
	 * Checks if the inline {@link engine.view.filler filler} should be added.
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

		if ( !( selectionParent instanceof ViewElement ) ) {
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
	 * @param {engine.view.Text} viewText View text to update.
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
	 * @param {engine.view.Element} viewElement View element to update.
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
	 * @param {engine.view.Element} viewElement View element to update.
	 */
	_updateChildren( viewElement, options ) {
		const domConverter = this.domConverter;
		const domElement = domConverter.getCorrespondingDom( viewElement );
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
		const domRange = new Range();
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
