/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/view/domconverter
 */

/* globals document, Node, NodeFilter */

import ViewText from './text';
import ViewElement from './element';
import ViewPosition from './position';
import ViewRange from './range';
import ViewSelection from './selection';
import ViewDocumentFragment from './documentfragment';
import ViewTreeWalker from './treewalker';
import { BR_FILLER, INLINE_FILLER_LENGTH, isBlockFiller, isInlineFiller, startsWithFiller, getDataWithoutFiller } from './filler';

import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import indexOf from '@ckeditor/ckeditor5-utils/src/dom/indexof';
import getAncestors from '@ckeditor/ckeditor5-utils/src/dom/getancestors';
import getCommonAncestor from '@ckeditor/ckeditor5-utils/src/dom/getcommonancestor';

/**
 * DomConverter is a set of tools to do transformations between DOM nodes and view nodes. It also handles
 * {@link module:engine/view/domconverter~DomConverter#bindElements binding} these nodes.
 *
 * DomConverter does not check which nodes should be rendered (use {@link module:engine/view/renderer~Renderer}), does not keep a
 * state of a tree nor keeps synchronization between tree view and DOM tree (use {@link module:engine/view/document~Document}).
 *
 * DomConverter keeps DOM elements to View element bindings, so when the converter will be destroyed, the binding will
 * be lost. Two converters will keep separate binding maps, so one tree view can be bound with two DOM trees.
 */
export default class DomConverter {
	/**
	 * Creates DOM converter.
	 *
	 * @param {Object} options Object with configuration options.
	 * @param {Function} [options.blockFiller=module:engine/view/filler~BR_FILLER] Block filler creator.
	 */
	constructor( options = {} ) {
		// Using WeakMap prevent memory leaks: when the converter will be destroyed all referenced between View and DOM
		// will be removed. Also because it is a *Weak*Map when both view and DOM elements will be removed referenced
		// will be also removed, isn't it brilliant?
		//
		// Yes, PJ. It is.
		//
		// You guys so smart.
		//
		// I've been here. Seen stuff. Afraid of code now.

		/**
		 * Block {@link module:engine/view/filler filler} creator, which is used to create all block fillers during the
		 * view to DOM conversion and to recognize block fillers during the DOM to view conversion.
		 *
		 * @readonly
		 * @member {Function} module:engine/view/domconverter~DomConverter#blockFiller
		 */
		this.blockFiller = options.blockFiller || BR_FILLER;

		/**
		 * Tag names of DOM `Element`s which are considered pre-formatted elements.
		 *
		 * @member {Array.<String>} module:engine/view/domconverter~DomConverter#preElements
		 */
		this.preElements = [ 'pre' ];

		/**
		 * Tag names of DOM `Element`s which are considered block elements.
		 *
		 * @member {Array.<String>} module:engine/view/domconverter~DomConverter#blockElements
		 */
		this.blockElements = [ 'p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ];

		/**
		 * DOM to View mapping.
		 *
		 * @private
		 * @member {WeakMap} module:engine/view/domconverter~DomConverter#_domToViewMapping
		 */
		this._domToViewMapping = new WeakMap();

		/**
		 * View to DOM mapping.
		 *
		 * @private
		 * @member {WeakMap} module:engine/view/domconverter~DomConverter#_viewToDomMapping
		 */
		this._viewToDomMapping = new WeakMap();

		/**
		 * Holds mapping between fake selection containers and corresponding view selections.
		 *
		 * @private
		 * @member {WeakMap} module:engine/view/domconverter~DomConverter#_fakeSelectionMapping
		 */
		this._fakeSelectionMapping = new WeakMap();
	}

	/**
	 * Binds given DOM element that represents fake selection to {@link module:engine/view/selection~Selection view selection}.
	 * View selection copy is stored and can be retrieved by {@link module:engine/view/domconverter~DomConverter#fakeSelectionToView}
	 * method.
	 *
	 * @param {HTMLElement} domElement
	 * @param {module:engine/view/selection~Selection} viewSelection
	 */
	bindFakeSelection( domElement, viewSelection ) {
		this._fakeSelectionMapping.set( domElement, ViewSelection.createFromSelection( viewSelection ) );
	}

	/**
	 * Returns {@link module:engine/view/selection~Selection view selection} instance corresponding to given DOM element that represents
	 * fake selection. Returns `undefined` if binding to given DOM element does not exists.
	 *
	 * @param {HTMLElement} domElement
	 * @returns {module:engine/view/selection~Selection|undefined}
	 */
	fakeSelectionToView( domElement ) {
		return this._fakeSelectionMapping.get( domElement );
	}

	/**
	 * Binds DOM and View elements, so it will be possible to get corresponding elements using
	 * {@link module:engine/view/domconverter~DomConverter#getCorrespondingViewElement getCorrespondingViewElement} and
	 * {@link module:engine/view/domconverter~DomConverter#mapViewToDom mapViewToDom}.
	 *
	 * @param {HTMLElement} domElement DOM element to bind.
	 * @param {module:engine/view/element~Element} viewElement View element to bind.
	 */
	bindElements( domElement, viewElement ) {
		this._domToViewMapping.set( domElement, viewElement );
		this._viewToDomMapping.set( viewElement, domElement );
	}

	/**
	 * Unbinds given `domElement` from the view element it was bound to. Unbinding is deep, meaning that all children of
	 * `domElement` will be unbound too.
	 *
	 * @param {HTMLElement} domElement DOM element to unbind.
	 */
	unbindDomElement( domElement ) {
		const viewElement = this._domToViewMapping.get( domElement );

		if ( viewElement ) {
			this._domToViewMapping.delete( domElement );
			this._viewToDomMapping.delete( viewElement );

			// Use Array.from because of MS Edge (#923).
			for ( const child of Array.from( domElement.childNodes ) ) {
				this.unbindDomElement( child );
			}
		}
	}

	/**
	 * Binds DOM and View document fragments, so it will be possible to get corresponding document fragments using
	 * {@link module:engine/view/domconverter~DomConverter#getCorrespondingViewDocumentFragment getCorrespondingViewDocumentFragment} and
	 * {@link module:engine/view/domconverter~DomConverter#mapViewToDom mapViewToDom}.
	 *
	 * @param {DocumentFragment} domFragment DOM document fragment to bind.
	 * @param {module:engine/view/documentfragment~DocumentFragment} viewFragment View document fragment to bind.
	 */
	bindDocumentFragments( domFragment, viewFragment ) {
		this._domToViewMapping.set( domFragment, viewFragment );
		this._viewToDomMapping.set( viewFragment, domFragment );
	}

	/**
	 * Converts view to DOM. For all text nodes, not bound elements and document fragments new items will
	 * be created. For bound elements and document fragments function will return corresponding items.
	 *
	 * @param {module:engine/view/node~Node|module:engine/view/documentfragment~DocumentFragment} viewNode View node or document fragment to
	 * transform.
	 * @param {Document} domDocument Document which will be used to create DOM nodes.
	 * @param {Object} [options] Conversion options.
	 * @param {Boolean} [options.bind=false] Determines whether new elements will be bound.
	 * @param {Boolean} [options.withChildren=true] If true node's and document fragment's children  will be converted too.
	 * @returns {Node|DocumentFragment} Converted node or DocumentFragment.
	 */
	viewToDom( viewNode, domDocument, options = {} ) {
		if ( viewNode.is( 'text' ) ) {
			const textData = this._processDataFromViewText( viewNode );

			return domDocument.createTextNode( textData );
		} else {
			if ( this.mapViewToDom( viewNode ) ) {
				return this.mapViewToDom( viewNode );
			}

			let domElement;

			if ( viewNode.is( 'documentFragment' ) ) {
				// Create DOM document fragment.
				domElement = domDocument.createDocumentFragment();

				if ( options.bind ) {
					this.bindDocumentFragments( domElement, viewNode );
				}
			} else if ( viewNode.is( 'uiElement' ) ) {
				// UIElement has it's own render() method.
				// https://github.com/ckeditor/ckeditor5-engine/issues/799
				domElement = viewNode.render( domDocument );

				if ( options.bind ) {
					this.bindElements( domElement, viewNode );
				}

				return domElement;
			} else {
				// Create DOM element.
				domElement = domDocument.createElement( viewNode.name );

				if ( options.bind ) {
					this.bindElements( domElement, viewNode );
				}

				// Copy element's attributes.
				for ( const key of viewNode.getAttributeKeys() ) {
					domElement.setAttribute( key, viewNode.getAttribute( key ) );
				}
			}

			if ( options.withChildren || options.withChildren === undefined ) {
				for ( const child of this.viewChildrenToDom( viewNode, domDocument, options ) ) {
					domElement.appendChild( child );
				}
			}

			return domElement;
		}
	}

	/**
	 * Converts children of the view element to DOM using {@link module:engine/view/domconverter~DomConverter#viewToDom} method.
	 * Additionally this method adds block {@link module:engine/view/filler filler} to the list of children, if needed.
	 *
	 * @param {module:engine/view/element~Element|module:engine/view/documentfragment~DocumentFragment} viewElement Parent view element.
	 * @param {Document} domDocument Document which will be used to create DOM nodes.
	 * @param {Object} options See {@link module:engine/view/domconverter~DomConverter#viewToDom} options parameter.
	 * @returns {Iterable.<Node>} DOM nodes.
	 */
	* viewChildrenToDom( viewElement, domDocument, options = {} ) {
		const fillerPositionOffset = viewElement.getFillerOffset && viewElement.getFillerOffset();
		let offset = 0;

		for ( const childView of viewElement.getChildren() ) {
			if ( fillerPositionOffset === offset ) {
				yield this.blockFiller( domDocument );
			}

			yield this.viewToDom( childView, domDocument, options );

			offset++;
		}

		if ( fillerPositionOffset === offset ) {
			yield this.blockFiller( domDocument );
		}
	}

	/**
	 * Converts view {@link module:engine/view/range~Range} to DOM range.
	 * Inline and block {@link module:engine/view/filler fillers} are handled during the conversion.
	 *
	 * @param {module:engine/view/range~Range} viewRange View range.
	 * @returns {Range} DOM range.
	 */
	viewRangeToDom( viewRange ) {
		const domStart = this.viewPositionToDom( viewRange.start );
		const domEnd = this.viewPositionToDom( viewRange.end );

		const domRange = document.createRange();
		domRange.setStart( domStart.parent, domStart.offset );
		domRange.setEnd( domEnd.parent, domEnd.offset );

		return domRange;
	}

	/**
	 * Converts view {@link module:engine/view/position~Position} to DOM parent and offset.
	 *
	 * Inline and block {@link module:engine/view/filler fillers} are handled during the conversion.
	 * If the converted position is directly before inline filler it is moved inside the filler.
	 *
	 * @param {module:engine/view/position~Position} viewPosition View position.
	 * @returns {Object|null} position DOM position or `null` if view position could not be converted to DOM.
	 * @returns {Node} position.parent DOM position parent.
	 * @returns {Number} position.offset DOM position offset.
	 */
	viewPositionToDom( viewPosition ) {
		const viewParent = viewPosition.parent;

		if ( viewParent.is( 'text' ) ) {
			const domParent = this.findCorrespondingDomText( viewParent );

			if ( !domParent ) {
				// Position is in a view text node that has not been rendered to DOM yet.
				return null;
			}

			let offset = viewPosition.offset;

			if ( startsWithFiller( domParent ) ) {
				offset += INLINE_FILLER_LENGTH;
			}

			return { parent: domParent, offset };
		} else {
			// viewParent is instance of ViewElement.
			let domParent, domBefore, domAfter;

			if ( viewPosition.offset === 0 ) {
				domParent = this.mapViewToDom( viewParent );

				if ( !domParent ) {
					// Position is in a view element that has not been rendered to DOM yet.
					return null;
				}

				domAfter = domParent.childNodes[ 0 ];
			} else {
				const nodeBefore = viewPosition.nodeBefore;

				domBefore = nodeBefore.is( 'text' ) ?
					this.findCorrespondingDomText( nodeBefore ) :
					this.mapViewToDom( viewPosition.nodeBefore );

				if ( !domBefore ) {
					// Position is after a view element that has not been rendered to DOM yet.
					return null;
				}

				domParent = domBefore.parentNode;
				domAfter = domBefore.nextSibling;
			}

			// If there is an inline filler at position return position inside the filler. We should never return
			// the position before the inline filler.
			if ( this.isText( domAfter ) && startsWithFiller( domAfter ) ) {
				return { parent: domAfter, offset: INLINE_FILLER_LENGTH };
			}

			const offset = domBefore ? indexOf( domBefore ) + 1 : 0;

			return { parent: domParent, offset };
		}
	}

	/**
	 * Converts DOM to view. For all text nodes, not bound elements and document fragments new items will
	 * be created. For bound elements and document fragments function will return corresponding items. For
	 * {@link module:engine/view/filler fillers} `null` will be returned.
	 * For all DOM elements rendered by {@link module:engine/view/uielement~UIElement} that UIElement will be returned.
	 *
	 * @param {Node|DocumentFragment} domNode DOM node or document fragment to transform.
	 * @param {Object} [options] Conversion options.
	 * @param {Boolean} [options.bind=false] Determines whether new elements will be bound.
	 * @param {Boolean} [options.withChildren=true] If `true`, node's and document fragment's children will be converted too.
	 * @param {Boolean} [options.keepOriginalCase=false] If `false`, node's tag name will be converter to lower case.
	 * @returns {module:engine/view/node~Node|module:engine/view/documentfragment~DocumentFragment|null} Converted node or document fragment
	 * or `null` if DOM node is a {@link module:engine/view/filler filler} or the given node is an empty text node.
	 */
	domToView( domNode, options = {} ) {
		if ( isBlockFiller( domNode, this.blockFiller ) ) {
			return null;
		}

		// When node is inside UIElement return that UIElement as it's view representation.
		const uiElement = this.getParentUIElement( domNode, this._domToViewMapping );

		if ( uiElement ) {
			return uiElement;
		}

		if ( this.isText( domNode ) ) {
			if ( isInlineFiller( domNode ) ) {
				return null;
			} else {
				const textData = this._processDataFromDomText( domNode );

				return textData === '' ? null : new ViewText( textData );
			}
		} else if ( this.isComment( domNode ) ) {
			return null;
		} else {
			if ( this.mapDomToView( domNode ) ) {
				return this.mapDomToView( domNode );
			}

			let viewElement;

			if ( this.isDocumentFragment( domNode ) ) {
				// Create view document fragment.
				viewElement = new ViewDocumentFragment();

				if ( options.bind ) {
					this.bindDocumentFragments( domNode, viewElement );
				}
			} else {
				// Create view element.
				const viewName = options.keepOriginalCase ? domNode.tagName : domNode.tagName.toLowerCase();
				viewElement = new ViewElement( viewName );

				if ( options.bind ) {
					this.bindElements( domNode, viewElement );
				}

				// Copy element's attributes.
				const attrs = domNode.attributes;

				for ( let i = attrs.length - 1; i >= 0; i-- ) {
					viewElement.setAttribute( attrs[ i ].name, attrs[ i ].value );
				}
			}

			if ( options.withChildren || options.withChildren === undefined ) {
				for ( const child of this.domChildrenToView( domNode, options ) ) {
					viewElement.appendChildren( child );
				}
			}

			return viewElement;
		}
	}

	/**
	 * Converts children of the DOM element to view nodes using {@link module:engine/view/domconverter~DomConverter#domToView} method.
	 * Additionally this method omits block {@link module:engine/view/filler filler}, if it exists in the DOM parent.
	 *
	 * @param {HTMLElement} domElement Parent DOM element.
	 * @param {Object} options See {@link module:engine/view/domconverter~DomConverter#domToView} options parameter.
	 * @returns {Iterable.<module:engine/view/node~Node>} View nodes.
	 */
	* domChildrenToView( domElement, options = {} ) {
		for ( let i = 0; i < domElement.childNodes.length; i++ ) {
			const domChild = domElement.childNodes[ i ];
			const viewChild = this.domToView( domChild, options );

			if ( viewChild !== null ) {
				yield viewChild;
			}
		}
	}

	/**
	 * Converts DOM selection to view {@link module:engine/view/selection~Selection}.
	 * Ranges which cannot be converted will be omitted.
	 *
	 * @param {Selection} domSelection DOM selection.
	 * @returns {module:engine/view/selection~Selection} View selection.
	 */
	domSelectionToView( domSelection ) {
		// DOM selection might be placed in fake selection container.
		// If container contains fake selection - return corresponding view selection.
		if ( domSelection.rangeCount === 1 ) {
			let container = domSelection.getRangeAt( 0 ).startContainer;

			// The DOM selection might be moved to the text node inside the fake selection container.
			if ( this.isText( container ) ) {
				container = container.parentNode;
			}

			const viewSelection = this.fakeSelectionToView( container );

			if ( viewSelection ) {
				return viewSelection;
			}
		}

		const viewSelection = new ViewSelection();
		const isBackward = this.isDomSelectionBackward( domSelection );

		for ( let i = 0; i < domSelection.rangeCount; i++ ) {
			// DOM Range have correct start and end, no matter what is the DOM Selection direction. So we don't have to fix anything.
			const domRange = domSelection.getRangeAt( i );
			const viewRange = this.domRangeToView( domRange );

			if ( viewRange ) {
				viewSelection.addRange( viewRange, isBackward );
			}
		}

		return viewSelection;
	}

	/**
	 * Converts DOM Range to view {@link module:engine/view/range~Range}.
	 * If the start or end position can not be converted `null` is returned.
	 *
	 * @param {Range} domRange DOM range.
	 * @returns {module:engine/view/range~Range|null} View range.
	 */
	domRangeToView( domRange ) {
		const viewStart = this.domPositionToView( domRange.startContainer, domRange.startOffset );
		const viewEnd = this.domPositionToView( domRange.endContainer, domRange.endOffset );

		if ( viewStart && viewEnd ) {
			return new ViewRange( viewStart, viewEnd );
		}

		return null;
	}

	/**
	 * Converts DOM parent and offset to view {@link module:engine/view/position~Position}.
	 *
	 * If the position is inside a {@link module:engine/view/filler filler} which has no corresponding view node,
	 * position of the filler will be converted and returned.
	 *
	 * If the position is inside DOM element rendered by {@link module:engine/view/uielement~UIElement}
	 * that position will be converted to view position before that UIElement.
	 *
	 * If structures are too different and it is not possible to find corresponding position then `null` will be returned.
	 *
	 * @param {Node} domParent DOM position parent.
	 * @param {Number} domOffset DOM position offset.
	 * @returns {module:engine/view/position~Position} viewPosition View position.
	 */
	domPositionToView( domParent, domOffset ) {
		if ( isBlockFiller( domParent, this.blockFiller ) ) {
			return this.domPositionToView( domParent.parentNode, indexOf( domParent ) );
		}

		// If position is somewhere inside UIElement - return position before that element.
		const viewElement = this.mapDomToView( domParent );

		if ( viewElement && viewElement.is( 'uiElement' ) ) {
			return ViewPosition.createBefore( viewElement );
		}

		if ( this.isText( domParent ) ) {
			if ( isInlineFiller( domParent ) ) {
				return this.domPositionToView( domParent.parentNode, indexOf( domParent ) );
			}

			const viewParent = this.findCorrespondingViewText( domParent );
			let offset = domOffset;

			if ( !viewParent ) {
				return null;
			}

			if ( startsWithFiller( domParent ) ) {
				offset -= INLINE_FILLER_LENGTH;
				offset = offset < 0 ? 0 : offset;
			}

			return new ViewPosition( viewParent, offset );
		}
		// domParent instanceof HTMLElement.
		else {
			if ( domOffset === 0 ) {
				const viewParent = this.mapDomToView( domParent );

				if ( viewParent ) {
					return new ViewPosition( viewParent, 0 );
				}
			} else {
				const domBefore = domParent.childNodes[ domOffset - 1 ];
				const viewBefore = this.isText( domBefore ) ?
					this.findCorrespondingViewText( domBefore ) :
					this.mapDomToView( domBefore );

				// TODO #663
				if ( viewBefore && viewBefore.parent ) {
					return new ViewPosition( viewBefore.parent, viewBefore.index + 1 );
				}
			}

			return null;
		}
	}

	/**
	 * Gets corresponding view item. This function use
	 * {@link module:engine/view/domconverter~DomConverter#getCorrespondingViewElement getCorrespondingViewElement}
	 * for elements, {@link  module:engine/view/domconverter~DomConverter#getCorrespondingViewText getCorrespondingViewText} for text
	 * nodes and
	 * {@link module:engine/view/domconverter~DomConverter#getCorrespondingViewDocumentFragment getCorrespondingViewDocumentFragment}
	 * for document fragments.
	 *
	 * Note that for the block or inline {@link module:engine/view/filler filler} this method returns `null`.
	 *
	 * @param {Node|DocumentFragment} domNode DOM node or document fragment.
	 * @returns {module:engine/view/node~Node|module:engine/view/documentfragment~DocumentFragment|null} Corresponding view item.
	 */
	// getCorrespondingView( domNode ) {
	// 	if ( this.isElement( domNode ) ) {
	// 		return this.getCorrespondingViewElement( domNode );
	// 	} else if ( this.isDocumentFragment( domNode ) ) {
	// 		return this.getCorrespondingViewDocumentFragment( domNode );
	// 	} else if ( this.isText( domNode ) ) {
	// 		return this.getCorrespondingViewText( domNode );
	// 	}
    //
	// 	return null;
	// }

	// /**
	//  * Gets corresponding view element. Returns element if an view element was
	//  * {@link module:engine/view/domconverter~DomConverter#bindElements bound} to the given DOM element or `null` otherwise.
	//  * For all DOM elements rendered by {@link module:engine/view/uielement~UIElement} that UIElement will be returned.
	//  *
	//  * @param {HTMLElement} domElement DOM element.
	//  * @returns {module:engine/view/element~Element|null} Corresponding element or `null` if no element was bound.
	//  */
	// getCorrespondingViewElement( domElement ) {
	// 	return this.getParentUIElement( domElement ) || this._domToViewMapping.get( domElement );
	// }
    //
	// /**
	//  * Gets corresponding view document fragment. Returns document fragment if an view element was
	//  * {@link module:engine/view/domconverter~DomConverter#bindDocumentFragments bound} to the given DOM fragment or `null` otherwise.
	//  *
	//  * @param {DocumentFragment} domFragment DOM element.
	//  * @returns {module:engine/view/documentfragment~DocumentFragment|null} Corresponding document fragment or `null` if none element was
	//  * bound.
	//  */
	// getCorrespondingViewDocumentFragment( domFragment ) {
	// 	return this._domToViewMapping.get( domFragment );
	// }

	mapDomToView( domElement ) {
		return this.getParentUIElement( domElement ) || this._domToViewMapping.get( domElement );
	}

	/**
	 * Gets corresponding text node. Text nodes are not {@link module:engine/view/domconverter~DomConverter#bindElements bound},
	 * corresponding text node is returned based on the sibling or parent.
	 *
	 * If the directly previous sibling is a {@link module:engine/view/domconverter~DomConverter#bindElements bound} element, it is used
	 * to find the corresponding text node.
	 *
	 * If this is a first child in the parent and the parent is a {@link module:engine/view/domconverter~DomConverter#bindElements bound}
	 * element, it is used to find the corresponding text node.
	 *
	 * For all text nodes rendered by {@link module:engine/view/uielement~UIElement} that UIElement will be returned.
	 *
	 * Otherwise `null` is returned.
	 *
	 * Note that for the block or inline {@link module:engine/view/filler filler} this method returns `null`.
	 *
	 * @param {Text} domText DOM text node.
	 * @returns {module:engine/view/text~Text|null} Corresponding view text node or `null`, if it was not possible to find a
	 * corresponding node.
	 */
	findCorrespondingViewText( domText ) {
		if ( isInlineFiller( domText ) ) {
			return null;
		}

		// If DOM text was rendered by UIElement - return that element.
		const uiElement = this.getParentUIElement( domText );

		if ( uiElement ) {
			return uiElement;
		}

		const previousSibling = domText.previousSibling;

		// Try to use previous sibling to find the corresponding text node.
		if ( previousSibling ) {
			if ( !( this.isElement( previousSibling ) ) ) {
				// The previous is text or comment.
				return null;
			}

			const viewElement = this.mapDomToView( previousSibling );

			if ( viewElement ) {
				const nextSibling = viewElement.nextSibling;

				// It might be filler which has no corresponding view node.
				if ( nextSibling instanceof ViewText ) {
					return viewElement.nextSibling;
				} else {
					return null;
				}
			}
		}
		// Try to use parent to find the corresponding text node.
		else {
			const viewElement = this.mapDomToView( domText.parentNode );

			if ( viewElement ) {
				const firstChild = viewElement.getChild( 0 );

				// It might be filler which has no corresponding view node.
				if ( firstChild instanceof ViewText ) {
					return firstChild;
				} else {
					return null;
				}
			}
		}

		return null;
	}

	/**
	 * Returns corresponding DOM item for provided {@link module:engine/view/element~Element Element} or
	 * {@link module:engine/view/documentfragment~DocumentFragment DocumentFragment}.
	 * To find a corresponding text for {@link module:engine/view/text~Text view Text instance}
	 * use {@link #findCorrespondingDomText}.
	 *
	 * @param {module:engine/view/element~Element|module:engine/view/documentfragment~DocumentFragment} viewNode
	 * View element or document fragment.
	 * @returns {Node|DocumentFragment|undefined} Corresponding DOM node or document fragment.
	 */
	mapViewToDom( documentFragmentOrElement ) {
		return this._viewToDomMapping.get( documentFragmentOrElement );
	}

	/**
	 * Finds corresponding text node. Text nodes are not {@link module:engine/view/domconverter~DomConverter#bindElements bound},
	 * corresponding text node is returned based on the sibling or parent.
	 *
	 * If the directly previous sibling is a {@link module:engine/view/domconverter~DomConverter#bindElements bound} element, it is used
	 * to find the corresponding text node.
	 *
	 * If this is a first child in the parent and the parent is a {@link module:engine/view/domconverter~DomConverter#bindElements bound}
	 * element, it is used to find the corresponding text node.
	 *
	 * Otherwise `null` is returned.
	 *
	 * @param {module:engine/view/text~Text} viewText View text node.
	 * @returns {Text|null} Corresponding DOM text node or `null`, if it was not possible to find a corresponding node.
	 */
	findCorrespondingDomText( viewText ) {
		const previousSibling = viewText.previousSibling;

		// Try to use previous sibling to find the corresponding text node.
		if ( previousSibling && this.mapViewToDom( previousSibling ) ) {
			return this.mapViewToDom( previousSibling ).nextSibling;
		}

		// If this is a first node, try to use parent to find the corresponding text node.
		if ( !previousSibling && viewText.parent && this.mapViewToDom( viewText.parent ) ) {
			return this.mapViewToDom( viewText.parent ).childNodes[ 0 ];
		}

		return null;
	}

	/**
	 * Focuses DOM editable that is corresponding to provided {@link module:engine/view/editableelement~EditableElement EditableElement}.
	 *
	 * @param {module:engine/view/editableelement~EditableElement} viewEditable
	 */
	focus( viewEditable ) {
		const domEditable = this.mapViewToDom( viewEditable );

		if ( domEditable && domEditable.ownerDocument.activeElement !== domEditable ) {
			// Save the scrollX and scrollY positions before the focus.
			const { scrollX, scrollY } = global.window;
			const scrollPositions = [];

			// Save all scrollLeft and scrollTop values starting from domEditable up to
			// document#documentElement.
			forEachDomNodeAncestor( domEditable, node => {
				const { scrollLeft, scrollTop } = node;

				scrollPositions.push( [ scrollLeft, scrollTop ] );
			} );

			domEditable.focus();

			// Restore scrollLeft and scrollTop values starting from domEditable up to
			// document#documentElement.
			// https://github.com/ckeditor/ckeditor5-engine/issues/951
			// https://github.com/ckeditor/ckeditor5-engine/issues/957
			forEachDomNodeAncestor( domEditable, node => {
				const [ scrollLeft, scrollTop ] = scrollPositions.shift();

				node.scrollLeft = scrollLeft;
				node.scrollTop = scrollTop;
			} );

			// Restore the scrollX and scrollY positions after the focus.
			// https://github.com/ckeditor/ckeditor5-engine/issues/951
			global.window.scrollTo( scrollX, scrollY );
		}
	}

	/**
	 * Returns `true` when `node.nodeType` equals `Node.TEXT_NODE`.
	 *
	 * @param {Node} node Node to check.
	 * @returns {Boolean}
	 */
	isText( node ) {
		return node && node.nodeType == Node.TEXT_NODE;
	}

	/**
	 * Returns `true` when `node.nodeType` equals `Node.ELEMENT_NODE`.
	 *
	 * @param {Node} node Node to check.
	 * @returns {Boolean}
	 */
	isElement( node ) {
		return node && node.nodeType == Node.ELEMENT_NODE;
	}

	/**
	 * Returns `true` when `node.nodeType` equals `Node.DOCUMENT_FRAGMENT_NODE`.
	 *
	 * @param {Node} node Node to check.
	 * @returns {Boolean}
	 */
	isDocumentFragment( node ) {
		return node && node.nodeType == Node.DOCUMENT_FRAGMENT_NODE;
	}

	/**
	 * Returns `true` when `node.nodeType` equals `Node.COMMENT_NODE`.
	 *
	 * @param {Node} node Node to check.
	 * @returns {Boolean}
	 */
	isComment( node ) {
		return node && node.nodeType == Node.COMMENT_NODE;
	}

	/**
	 * Returns `true` if given selection is a backward selection, that is, if it's `focus` is before `anchor`.
	 *
	 * @param {Selection} DOM Selection instance to check.
	 * @returns {Boolean}
	 */
	isDomSelectionBackward( selection ) {
		if ( selection.isCollapsed ) {
			return false;
		}

		// Since it takes multiple lines of code to check whether a "DOM Position" is before/after another "DOM Position",
		// we will use the fact that range will collapse if it's end is before it's start.
		const range = document.createRange();

		range.setStart( selection.anchorNode, selection.anchorOffset );
		range.setEnd( selection.focusNode, selection.focusOffset );

		const backward = range.collapsed;

		range.detach();

		return backward;
	}

	/**
	 * Returns parent {@link module:engine/view/uielement~UIElement} for provided DOM node. Returns null if there is no
	 * parent UIElement.
	 *
	 * @param {Node} domNode
	 * @return {module:engine/view/uielement~UIElement|null}
	 */
	getParentUIElement( domNode ) {
		const ancestors = getAncestors( domNode );

		// Remove domNode from the list.
		ancestors.pop();

		while ( ancestors.length ) {
			const domNode = ancestors.pop();
			const viewNode = this._domToViewMapping.get( domNode );

			if ( viewNode && viewNode.is( 'uiElement' ) ) {
				return viewNode;
			}
		}

		return null;
	}

	/**
	 * Takes text data from given {@link module:engine/view/text~Text#data} and processes it so it is correctly displayed in DOM.
	 *
	 * Following changes are done:
	 * * multiple spaces are replaced to a chain of spaces and `&nbsp;`,
	 * * space at the beginning of the text node is changed to `&nbsp;` if it is a first text node in it's container
	 * element or if previous text node ends by space character,
	 * * space at the end of the text node is changed to `&nbsp;` if it is a last text node in it's container.
	 *
	 * @private
	 * @param {module:engine/view/text~Text} node View text node to process.
	 * @returns {String} Processed text data.
	 */
	_processDataFromViewText( node ) {
		const data = node.data;

		// If any of node ancestors has a name which is in `preElements` array, then currently processed
		// view text node is (will be) in preformatted element. We should not change whitespaces then.
		if ( node.getAncestors().some( parent => this.preElements.includes( parent.name ) ) ) {
			return data;
		}

		const prevNode = this._getTouchingViewTextNode( node, false );
		const nextNode = this._getTouchingViewTextNode( node, true );

		// Second part of text data, from the space after the last non-space character to the end.
		// We separate `textEnd` and `textStart` because `textEnd` needs some special handling.
		let textEnd = data.match( / *$/ )[ 0 ];
		// First part of data, between first and last part of data.
		let textStart = data.substr( 0, data.length - textEnd.length );

		// If previous text node does not exist or it ends by space character, replace space character at the beginning of text.
		// ` x`			-> `_x`
		// `  x`		-> `_ x`
		// `   x`		-> `_  x`
		if ( !prevNode || prevNode.data.charAt( prevNode.data.length - 1 ) == ' ' ) {
			textStart = textStart.replace( /^ /, '\u00A0' );
		}

		// Multiple consecutive spaces. Change them to ` &nbsp;` pairs.
		// `_x  x`		-> `_x _x`
		// `_ x  x`		-> `_ x _x`
		// `_  x  x`	-> `_ _x _x`
		// `_  x   x`	-> `_ _x _ x`
		// `_  x    x`	-> `_ _x _ _x`
		// `_   x    x` -> `_ _ x _ _x`
		textStart = textStart.replace( / {2}/g, ' \u00A0' );

		// Process `textEnd` only if there is anything to process.
		if ( textEnd.length > 0 ) {
			// (1) We need special treatment for the last part of text node, it has to end on `&nbsp;`, not space:
			// `x `		-> `x_`
			// `x  `	-> `x _`
			// `x   `	-> `x_ _`
			// `x    `	-> `x _ _`
			// (2) Different case when there is a node after:
			// `x <b>b</b>`		-> `x <b>b</b>`
			// `x  <b>b</b>`	-> `x _<b>b</b>`
			// `x   <b>b</b>`	-> `x _ <b>b</b>`
			// `x    <b>b</b>`	-> `x _ _<b>b</b>`
			// (3) But different, when that node starts by &nbsp; (or space that will be converted to &nbsp;):
			// `x <b>_b</b>`	-> `x <b>_b</b>`
			// `x  <b>_b</b>`	-> `x_ <b>_b</b>`
			// `x   <b>_b</b>`	-> `x _ <b>_b</b>`
			// `x    <b>_b</b>`	-> `x_ _ <b>_b</b>`
			// Let's assume that starting from space is normal behavior, because starting from &nbsp; is a less frequent case.
			let textEndStartsFromNbsp = false;

			if ( !nextNode ) {
				// (1)
				if ( textEnd.length % 2 ) {
					textEndStartsFromNbsp = true;
				}
			} else if ( nextNode.data.charAt( 0 ) == ' ' || nextNode.data.charAt( 0 ) == '\u00A0' ) {
				// (3)
				if ( textEnd.length % 2 === 0 ) {
					textEndStartsFromNbsp = true;
				}
			}

			if ( textEndStartsFromNbsp ) {
				textEnd = '\u00A0' + textEnd.substr( 0, textEnd.length - 1 );
			}

			textEnd = textEnd.replace( / {2}/g, ' \u00A0' );
		}

		return textStart + textEnd;
	}

	/**
	 * Helper function. For given {@link module:engine/view/text~Text view text node}, it finds previous or next sibling that is contained
	 * in the same block element. If there is no such sibling, `null` is returned.
	 *
	 * @private
	 * @param {module:engine/view/text~Text} node
	 * @param {Boolean} getNext
	 * @returns {module:engine/view/text~Text}
	 */
	_getTouchingViewTextNode( node, getNext ) {
		if ( !node.parent ) {
			return null;
		}

		const treeWalker = new ViewTreeWalker( {
			startPosition: getNext ? ViewPosition.createAfter( node ) : ViewPosition.createBefore( node ),
			direction: getNext ? 'forward' : 'backward'
		} );

		for ( const value of treeWalker ) {
			if ( value.item.is( 'containerElement' ) ) {
				// ViewContainerElement is found on a way to next ViewText node, so given `node` was first/last
				// text node in it's container element.
				return null;
			} else if ( value.item.is( 'text' ) ) {
				// Found a text node in the same container element.
				return value.item;
			}
		}

		return null;
	}

	/**
	 * Takes text data from native `Text` node and processes it to a correct {@link module:engine/view/text~Text view text node} data.
	 *
	 * Following changes are done:
	 * * multiple whitespaces are replaced to a single space,
	 * * space at the beginning of the text node is removed, if it is a first text node in it's container
	 * element or if previous text node ends by space character,
	 * * space at the end of the text node is removed, if it is a last text node in it's container.
	 *
	 * @param {Node} node DOM text node to process.
	 * @returns {String} Processed data.
	 * @private
	 */
	_processDataFromDomText( node ) {
		let data = getDataWithoutFiller( node );

		if ( _hasDomParentOfType( node, this.preElements ) ) {
			return data;
		}

		// Change all consecutive whitespace characters to a single space character. That's how multiple whitespaces
		// are treated when rendered, so we normalize those whitespaces.
		// Note that &nbsp; (`\u00A0`) should not be treated as a whitespace because it is rendered.
		data = data.replace( /[^\S\u00A0]{2,}/g, ' ' );

		const prevNode = this._getTouchingDomTextNode( node, false );
		const nextNode = this._getTouchingDomTextNode( node, true );

		// If previous dom text node does not exist or it ends by whitespace character, remove space character from the beginning
		// of this text node. Such space character is treated as a whitespace.
		if ( !prevNode || /[^\S\u00A0]/.test( prevNode.data.charAt( prevNode.data.length - 1 ) ) ) {
			data = data.replace( /^ /, '' );
		}

		// If next text node does not exist remove space character from the end of this text node.
		if ( !nextNode ) {
			data = data.replace( / $/, '' );
		}
		// At this point we should have removed all whitespaces from DOM text data.

		// Now we have to change &nbsp; chars, that were in DOM text data because of rendering reasons, to spaces.
		// First, change all ` \u00A0` pairs (space + &nbsp;) to two spaces. DOM converter changes two spaces from model/view as
		// ` \u00A0` to ensure proper rendering. Since here we convert back, we recognize those pairs and change them
		// to `  ` which is what we expect to have in model/view.
		data = data.replace( / \u00A0/g, '  ' );
		// Then, change &nbsp; character that is at the beginning of the text node to space character.
		// As above, that &nbsp; was created for rendering reasons but it's real meaning is just a space character.
		// We do that replacement only if this is the first node or the previous node ends on whitespace character.
		if ( !prevNode || /[^\S\u00A0]/.test( prevNode.data.charAt( prevNode.data.length - 1 ) ) ) {
			data = data.replace( /^\u00A0/, ' ' );
		}
		// Since input text data could be: `x_ _`, we would not replace the first &nbsp; after `x` character.
		// We have to fix it. Since we already change all ` &nbsp;`, we will have something like this at the end of text data:
		// `x_ _ _` -> `x_    `. Find &nbsp; at the end of string (can be followed only by spaces).
		// We do that replacement only if this is the last node or the next node starts by &nbsp;.
		if ( !nextNode || nextNode.data.charAt( 0 ) == '\u00A0' ) {
			data = data.replace( /\u00A0( *)$/, ' $1' );
		}

		// At this point, all whitespaces should be removed and all &nbsp; created for rendering reasons should be
		// changed to normal space. All left &nbsp; are &nbsp; inserted intentionally.
		return data;
	}

	/**
	 * Helper function. For given `Text` node, it finds previous or next sibling that is contained in the same block element.
	 * If there is no such sibling, `null` is returned.
	 *
	 * @private
	 * @param {Text} node
	 * @param {Boolean} getNext
	 * @returns {Text|null}
	 */
	_getTouchingDomTextNode( node, getNext ) {
		if ( !node.parentNode ) {
			return null;
		}

		const direction = getNext ? 'nextNode' : 'previousNode';
		const document = node.ownerDocument;
		const treeWalker = document.createTreeWalker( document.childNodes[ 0 ], NodeFilter.SHOW_TEXT );

		treeWalker.currentNode = node;

		const touchingNode = treeWalker[ direction ]();

		if ( touchingNode !== null ) {
			const lca = getCommonAncestor( node, touchingNode );

			// If there is common ancestor between the text node and next/prev text node,
			// and there are no block elements on a way from the text node to that ancestor,
			// and there are no block elements on a way from next/prev text node to that ancestor...
			if (
				lca &&
				!_hasDomParentOfType( node, this.blockElements, lca ) &&
				!_hasDomParentOfType( touchingNode, this.blockElements, lca )
			) {
				// Then they are in the same container element.
				return touchingNode;
			}
		}

		return null;
	}
}

// Helper function.
// Used to check if given native `Element` or `Text` node has parent with tag name from `types` array.
//
// @param {Node} node
// @param {Array.<String>} types
// @param {Boolean} [boundaryParent] Can be given if parents should be checked up to a given element (excluding that element).
// @returns {Boolean} `true` if such parent exists or `false` if it does not.
function _hasDomParentOfType( node, types, boundaryParent ) {
	let parents = getAncestors( node );

	if ( boundaryParent ) {
		parents = parents.slice( parents.indexOf( boundaryParent ) + 1 );
	}

	return parents.some( parent => parent.tagName && types.includes( parent.tagName.toLowerCase() ) );
}

// A helper that executes given callback for each DOM node's ancestor, starting from the given node
// and ending in document#documentElement.
//
// @param {Node} node
// @param {Function} callback A callback to be executed for each ancestor.
function forEachDomNodeAncestor( node, callback ) {
	while ( node && node != global.document ) {
		callback( node );
		node = node.parentNode;
	}
}
