/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import diff from '../../utils/diff.js';
import ViewText from './text.js';

import ViewElement from './element.js';
>>>>>>> 3849f41... Move render methods.
import { INLINE_FILLER, INLINE_FILLER_SIZE } from './domconverter.js';

import diff from '../utils-diff.js';

import CKEditorError from '../../utils/ckeditorerror.js';
import EmitterMixin from '../../utils/emittermixin.js';
import { keyNames } from '../../utils/keyboard.js';

/**
 * Renderer updates DOM tree, to make it a reflection of the view tree. Changed nodes need to be
 * {@link engine.treeView.Renderer#markToSync marked} to be rendered. Then, on {@link engine.treeView.Renderer#render render}, renderer
 * ensure they need to be refreshed and creates DOM nodes from view nodes,
 * {@link engine.treeView.DomConverter#bindElements bind} them and insert into DOM tree. Renderer use {@link engine.treeView.DomConverter}
 * to transform and bind nodes.
 *
 * @memberOf engine.treeView
 */
export default class Renderer {
	/**
	 * Creates a renderer instance.
	 *
	 * @param {engine.treeView.DomConverter} domConverter Converter instance.
	 */
	constructor( treeView ) {
		/**
		 * Converter instance.
		 *
		 * @readonly
		 * @member {engine.treeView.DomConverter} engine.treeView.Renderer#domConverter
		 */
		this.domConverter = treeView.domConverter;

		/**
		 * Set of nodes which attributes changed and may need to be rendered.
		 *
		 * @readonly
		 * @member {Set.<engine.treeView.Node>} engine.treeView.Renderer#markedAttributes
		 */
		this.markedAttributes = new Set();

		/**
		 * Set of elements which child lists changed and may need to be rendered.
		 *
		 * @readonly
		 * @member {Set.<engine.treeView.Node>} engine.treeView.Renderer#markedChildren
		 */
		this.markedChildren = new Set();

		/**
		 * Set of text nodes which text data changed and may need to be rendered.
		 *
		 * @readonly
		 * @member {Set.<engine.treeView.Node>} engine.treeView.Renderer#markedTexts
		 */
		this.markedTexts = new Set();

		this.selection = treeView.selection;

		/**
		 * Position of the inline filler. It should always be put BEFORE the text which contains filler.
		 *
		 * @private
		 * @readonly
		 * @type {engine.treeView.Position}
		 */
		this._inlineFillerPosition = null;

		this._domSelectionWindow = null;

		this._listener = Object.create( EmitterMixin );

		this._listener.listenTo( treeView, 'keydown', ( data ) => {
			if ( data.keyCode != keyNames.arrowleft || !this._isInlineFillerAtSelection() ) {
				return;
			}

			const selectionPosition = this.selection.getFirstPosition();

			if ( selectionPosition.offset != INLINE_FILLER_SIZE ) {
				return;
			}

			const domParent = this.domConverter( selectionPosition.parent );

			// Damn iframe! I can not use global window, so element -> document -> window -> selection
			const domSelection = domParent.ownerDocument.defaultView.getSelection();

			const domRange = new Range();
			domRange.setStart( domParent.parent, 0 );
			domRange.collapse( true );
			domSelection.removeAllRanges();
			domSelection.addRange( domRange );
		} );
	}

	/**
	 * Mark node to be synchronized.
	 *
	 * Note that only view nodes which parents have corresponding DOM elements need to be marked to be synchronized.
	 *
	 * @see engine.treeView.Renderer#markedAttributes
	 * @see engine.treeView.Renderer#markedChildren
	 * @see engine.treeView.Renderer#markedTexts
	 *
	 * @param {engine.treeView.ChangeType} type Type of the change.
	 * @param {engine.treeView.Node} node Node to be marked.
	 */
	markToSync( type, node ) {
		if ( type === 'TEXT' ) {
			if ( this.domConverter.getCorrespondingDom( node.parent ) ) {
				this.markedTexts.add( node );
			}
		} else {
			// If the node has no DOM element it is not rendered yet,
			// its children/attributes do not need to be marked to be sync.
			if ( !this.domConverter.getCorrespondingDom( node ) ) {
				return;
			}

			if ( type === 'ATTRIBUTES' ) {
				this.markedAttributes.add( node );
			} else if ( type === 'CHILDREN' ) {
				this.markedChildren.add( node );
			} else {
				/**
				 * Unknown type passed to Renderer.markToSync.
				 *
				 * @error renderer-unknown-type
				 */
				throw new CKEditorError( 'renderer-unknown-type: Unknown type passed to Renderer.markToSync.' );
			}
		}
	}

	/**
	 * Render method check {@link engine.treeView.Renderer#markedAttributes}, {@link engine.treeView.Renderer#markedChildren} and
	 * {@link engine.treeView.Renderer#markedTexts} and updated all nodes which needs to be updated. Then it clear all three
	 * sets.
	 *
	 * Renderer try not to break IME, so it do as little as it is possible to update DOM.
	 *
	 * For attributes it adds new attributes to DOM elements, update attributes with different values and remove
	 * attributes which does not exists in the view element.
	 *
	 * For text nodes it update the text string if it is different. Note that if parent element is marked as an element
	 * which changed child list, text node update will not be done, because it may not be possible do find a
	 * {@link engine.treeView.DomConverter#getCorrespondingDomText corresponding DOM text}. The change will be handled in the
	 * parent element.
	 *
	 * For nodes which changed child list it calculates a {@link diff} and add or removed nodes which changed.
	 */
	render() {
		const domConverter = this.domConverter;
		const selection = this.selection;

		if ( !this._isInlineFillerAtSelection() ) {
			this._removeInlineFiller();

			if ( this._needAddInlineFiller() ) {
				this._inlineFillerPosition = selection.getFirstPosition();
			} else {
				this._inlineFillerPosition = null;
			}
		}

		for ( let node of this.markedTexts ) {
			if ( !this.markedChildren.has( node.parent ) && domConverter.getCorrespondingDom( node.parent ) ) {
				this._updateText( node );
			}
		}

		for ( let element of this.markedAttributes ) {
			this._updateAttrs( element );
		}

		for ( let element of this.markedChildren ) {
			this._updateChildren( element );
		}

		this._updateSelection();

		this.markedTexts.clear();
		this.markedAttributes.clear();
		this.markedChildren.clear();
	}

	_isInlineFillerAtSelection() {
		if ( this.selection.rangeCount() != 1 || !this.selection.isCollapsed() ) {
			return false;
		}

		const selectionPosition = this.selection.getFirstPosition();
		const fillerPosition = this._inlineFillerPosition;

		if ( !fillerPosition ) {
			return false;
		}

		if ( fillerPosition.isEqual( selectionPosition )  ) {
			return true;
		}

		if ( selectionPosition.parent instanceof ViewText ) {
			if ( fillerPosition.isEqual( selectionPosition.parent.positionBefore() ) ) {
				return true;
			}
		}

		return false;
	}

	_removeInlineFiller() {
		const domPosition = this.domConverter.viewPositionToDom( this._inlineFillerPosition );
		const domText = domPosition.parent.childNodes[ domPosition.offset ];

		if ( !this.domConverter.startsWithFiller( domText ) ) {
			/**
			 * No inline filler on expected position.
			 *
			 * @error renderer-render-no-inline-filler.
			 */
			throw new CKEditorError( 'renderer-render-no-inline-filler: No inline filler on expected position.' );
		}

		if ( this.domConverter.isInlineFiller( domText ) ) {
			domPosition.parent.removeChild( domText );
		} else {
			domText.data = domText.data.substr( INLINE_FILLER_SIZE );
		}
	}

	_needAddInlineFiller() {
		if ( this.selection.rangeCount() != 1 || !this.selection.isCollapsed() ) {
			return false;
		}

		const selectionPosition = this.selection.getFirstPosition();
		const selectionParent = selectionPosition.parent;
		const selectionOffset = selectionPosition.offset;

		if ( !( selectionParent instanceof ViewElement ) ) {
			return false;
		}

		// We have block filler, we do not need inline one.
		if ( selectionOffset === selectionParent.needsFiller() ) {
			return false;
		}

		const nodeBefore = selectionPosition.nodeBefore();
		const nodeAfter = selectionPosition.nodeAfter();

		if ( nodeBefore instanceof ViewText || nodeAfter instanceof ViewText ) {
			return false;
		}

		return true;
	}

	_updateText( viewText ) {
		const domText = this.domConverter.getCorrespondingDom( viewText );

		const actualText = domText.data;
		let expectedText = viewText.data;

		const filler = this._inlineFillerPosition;

		if ( filler.parent == viewText.parent && filler.offset == viewText.offset ) {
			expectedText = INLINE_FILLER + expectedText;
		}

		if ( actualText != expectedText ) {
			domText.data = expectedText;
		}
	}

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

	_updateChildren( viewElement ) {
		const domConverter = this.domConverter;
		const domElement = domConverter.getCorrespondingDom( viewElement );
		const domDocument = domElement.ownerDocument;

		const filler = this._inlineFillerPosition;

		const actualDomChildren = domElement.childNodes;
		const expectedDomChildren = Array.from( domConverter.viewChildrenToDom( viewElement, domDocument ) );

		if ( filler.parent == viewElement ) {
			expectedDomChildren.splice( filler.offset, 0, domDocument.createTextNode( INLINE_FILLER ) );
		}

		const actions = diff( actualDomChildren, expectedDomChildren, sameNodes );

		let i = 0;

		for ( let action of actions ) {
			if ( action === 'INSERT' ) {
				domElement.insertBefore( expectedDomChildren[ i ], actualDomChildren[ i ] || null );
				i++;
			} else if ( action === 'DELETE' ) {
				domElement.removeChild( actualDomChildren[ i ] );
			} else { // 'EQUAL'
				i++;
			}
		}

		function sameNodes( actualDomChild, expectedDomChild ) {
			// Elements.
			if ( actualDomChild === expectedDomChild ) {
				return true;
			}
			// Texts.
			else if ( actualDomChild instanceof Text && expectedDomChild instanceof Text ) {
				return actualDomChild.data === expectedDomChild.data;
			}
			// Block fillers.
			else if ( domConverter.isBlockFiller( actualDomChild ) && domConverter.isBlockFiller( expectedDomChild ) ) {
				return true;
			}

			// Not matching types.
			return false;
		}
	}

	_updateSelection() {
		const domSelection = this._domSelectionWindow && this._domSelectionWindow.getSelection();
		const oldViewSelection = domSelection && this.domConverter.domSelectionToView( domSelection );

		if ( ( !oldViewSelection && !this.selection.rangeCount ) || this.selection.isEqual( oldViewSelection ) ) {
			return;
		}

		if ( domSelection ) {
			domSelection.removeAllRanges();
		}

		for ( let range of this.selection.getRanges() ) {
			const domRangeStart = this.domConverter.viewPositionToDom( range.start );
			const domRangeEnd = this.domConverter.viewPositionToDom( range.end );

			const domRange = new Range();
			domRange.setStart( domRangeStart.parent, domRangeStart.offset );
			domRange.setEnd( domRangeEnd.parent, domRangeEnd.offset );
			domSelection.addRange( range );
		}

		if ( this.selection.rangeCount ) {
			// Get window for selection: Selection -> Range -> element -> document -> window.
			this._domSelectionWindow = domSelection.getRangeAt( 0 ).startContainer.ownerDocument.defaultView;
		} else {
			this._domSelectionWindow = null;
		}
	}
}
