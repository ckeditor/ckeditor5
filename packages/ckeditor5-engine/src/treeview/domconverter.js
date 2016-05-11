/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import ViewText from './text.js';
import ViewElement from './element.js';
import ViewPosition from './position.js';
import ViewRange from './range.js';
import ViewSelection from './selection.js';
import ViewDocumentFragment from './documentfragment.js';
import { BR_FILLER, INLINE_FILLER_LENGTH, isBlockFiller, isInlineFiller, startsWithFiller, getDataWithoutFiller } from './filler.js';

import indexOf from '../../utils/dom/indexof.js';

/**
 * DomConverter is a set of tools to do transformations between DOM nodes and view nodes. It also handles
 * {@link engine.treeView.DomConverter#bindElements binding} these nodes.
 *
 * DomConverter does not check which nodes should be rendered (use {@link engine.treeView.Renderer}), does not keep a
 * state of a tree nor keeps synchronization between tree view and DOM tree (use {@link engine.treeView.TreeView}).
 *
 * DomConverter keeps DOM elements to View element bindings, so when the converter will be destroyed, the binding will
 * be lost. Two converters will keep separate binding maps, so one tree view can be bound with two DOM trees.
 *
 * @memberOf engine.treeView
 */
export default class DomConverter {
	/**
	 * Creates DOM converter.
	 *
	 * @param {Object} options Object with configuration options.
	 * @param {Function} [options.blockFiller=engine.treeView.filler.BR_FILLER] Block filler creator.
	 */
	constructor( options = {} ) {
		// Using WeakMap prevent memory leaks: when the converter will be destroyed all referenced between View and DOM
		// will be removed. Also because it is a *Weak*Map when both view and DOM elements will be removed referenced
		// will be also removed, isn't it brilliant?
		//
		// Yes, PJ. It is.
		//
		// You guys so smart.

		/**
		 * DOM to View mapping.
		 *
		 * @private
		 * @member {WeakMap} engine.treeView.DomConverter#_domToViewMapping
		 */
		this._domToViewMapping = new WeakMap();

		/**
		 * View to DOM mapping.
		 *
		 * @private
		 * @member {WeakMap} engine.treeView.DomConverter#_viewToDomMapping
		 */
		this._viewToDomMapping = new WeakMap();

		/**
		 * Block {@link engine.treeView.filler filler} creator, which is used to create all block fillers during the
		 * view to DOM conversion and to recognize block fillers during the DOM to view conversion.
		 *
		 * @member {Function} engine.treeView.DomConverter#blockFiller
		 */
		this.blockFiller = options.blockFiller || BR_FILLER;
	}

	/**
	 * Binds DOM and View elements, so it will be possible to get corresponding elements using
	 * {@link engine.treeView.DomConverter#getCorrespondingViewElement getCorrespondingViewElement} and
	 * {@link engine.treeView.DomConverter#getCorrespondingDomElement getCorrespondingDomElement}.
	 *
	 * @param {HTMLElement} domElement DOM element to bind.
	 * @param {engine.treeView.Element} viewElement View element to bind.
	 */
	bindElements( domElement, viewElement ) {
		this._domToViewMapping.set( domElement, viewElement );
		this._viewToDomMapping.set( viewElement, domElement );
	}

	/**
	 * Binds DOM and View document fragments, so it will be possible to get corresponding document fragments using
	 * {@link engine.treeView.DomConverter#getCorrespondingViewDocumentFragment getCorrespondingViewDocumentFragment} and
	 * {@link engine.treeView.DomConverter#getCorrespondingDomDocumentFragment getCorrespondingDomDocumentFragment}.
	 *
	 * @param {DocumentFragment} domFragment DOM document fragment to bind.
	 * @param {engine.treeView.DocumentFragment} viewFragment View document fragment to bind.
	 */
	bindDocumentFragments( domFragment, viewFragment ) {
		this._domToViewMapping.set( domFragment, viewFragment );
		this._viewToDomMapping.set( viewFragment, domFragment );
	}

	/**
	 * Converts view to DOM. For all text nodes, not bound elements and document fragments new items will
	 * be created. For bound elements and document fragments function will return corresponding items.
	 *
	 * @param {engine.treeView.Node|engine.treeView.DocumentFragment} viewNode View node or document fragment to transform.
	 * @param {document} domDocument Document which will be used to create DOM nodes.
	 * @param {Object} [options] Conversion options.
	 * @param {Boolean} [options.bind=false] Determines whether new elements will be bound.
	 * @param {Boolean} [options.withChildren=true] If true node's and document fragment's children  will be converted too.
	 * @returns {Node|DocumentFragment} Converted node or DocumentFragment.
	 */
	viewToDom( viewNode, domDocument, options = {} ) {
		if ( viewNode instanceof ViewText ) {
			return domDocument.createTextNode( viewNode.data );
		} else {
			if ( this.getCorrespondingDom( viewNode ) ) {
				return this.getCorrespondingDom( viewNode );
			}

			let domElement;

			if ( viewNode instanceof ViewDocumentFragment ) {
				// Create DOM document fragment.
				domElement = domDocument.createDocumentFragment();

				if ( options.bind ) {
					this.bindDocumentFragments( domElement, viewNode );
				}
			} else {
				// Create DOM element.
				domElement = domDocument.createElement( viewNode.name );

				if ( options.bind ) {
					this.bindElements( domElement, viewNode );
				}

				// Copy element's attributes.
				for ( let key of viewNode.getAttributeKeys() ) {
					domElement.setAttribute( key, viewNode.getAttribute( key ) );
				}
			}

			if ( options.withChildren || options.withChildren === undefined ) {
				for ( let child of this.viewChildrenToDom( viewNode, domDocument, options ) ) {
					domElement.appendChild( child );
				}
			}

			return domElement;
		}
	}

	/**
	 * Converts children of the view element to DOM using {@link engine.treeView.DomConverter#viewToDom} method.
	 * Additionally this method adds block {@link engine.treeView.filler filler} to the list of children, if needed.
	 *
	 * @param {engine.treeView.Element|engine.treeView.DocumentFragment} viewElement Parent view element.
	 * @param {document} domDocument Document which will be used to create DOM nodes.
	 * @param {Object} options See {@link engine.treeView.DomConverter#viewToDom} options parameter.
	 * @returns {Iterable.<Node>} DOM nodes.
	 */
	*viewChildrenToDom( viewElement, domDocument, options = {} ) {
		let fillerPositionOffset = viewElement.getFillerOffset && viewElement.getFillerOffset();
		let offset = 0;

		for ( let childView of viewElement.getChildren() ) {
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
	 * Converts view {@link engine.treeView.Range} to DOM range.
	 * Inline and block {@link engine.treeView.filler fillers} are handled during the conversion.
	 *
	 * @param {engine.treeView.Range} viewRange View range.
	 * @returns {Range} DOM range.
	 */
	viewRangeToDom( viewRange ) {
		const domStart = this.viewPositionToDom( viewRange.start );
		const domEnd = this.viewPositionToDom( viewRange.end );

		const domRange = new Range();
		domRange.setStart( domStart.parent, domStart.offset );
		domRange.setEnd( domEnd.parent, domEnd.offset );

		return domRange;
	}

	/**
	 * Converts view {@link engine.treeView.Position} to DOM parent and offset.
	 *
	 * Inline and block {@link engine.treeView.filler fillers} are handled during the conversion.
	 * If the converted position is directly before inline filler it is moved inside the filler.
	 *
	 * @param {engine.treeView.position} viewPosition View position.
	 * @returns {Object} position
	 * @returns {Node} position.parent DOM position parent.
	 * @returns {Number} position.offset DOM position offset.
	 */
	viewPositionToDom( viewPosition ) {
		const viewParent = viewPosition.parent;

		if ( viewParent instanceof ViewText ) {
			const domParent = this.getCorrespondingDomText( viewParent );
			let offset = viewPosition.offset;

			if ( startsWithFiller( domParent ) ) {
				offset += INLINE_FILLER_LENGTH;
			}

			return { parent: domParent, offset: offset };
		} // instanceof HTMLElement
		else {
			let domParent, domBefore, domAfter;

			if ( viewPosition.offset === 0 ) {
				domParent = this.getCorrespondingDom( viewPosition.parent );
				domAfter = domParent.childNodes[ 0 ];
			} else {
				domBefore = this.getCorrespondingDom( viewPosition.nodeBefore );
				domParent = domBefore.parentNode;
				domAfter = domBefore.nextSibling;
			}

			// If there is an inline filler at position return position inside the filler. We should never return
			// the position before the inline filler.
			if ( domAfter instanceof Text && startsWithFiller( domAfter ) ) {
				return { parent: domAfter, offset: INLINE_FILLER_LENGTH };
			}

			const offset = domBefore ? indexOf( domBefore ) + 1 : 0;

			return { parent: domParent, offset: offset };
		}
	}

	/**
	 * Converts DOM to view. For all text nodes, not bound elements and document fragments new items will
	 * be created. For bound elements and document fragments function will return corresponding items. For
	 * {@link engine.treeView.filler fillers} null will be returned.
	 *
	 * @param {Node|DocumentFragment} domNode DOM node or document fragment to transform.
	 * @param {Object} [options] Conversion options.
	 * @param {Boolean} [options.bind=false] Determines whether new elements will be bound.
	 * @param {Boolean} [options.withChildren=true] It true node's and document fragment's children will be converted too.
	 * @returns {engine.treeView.Node|engine.treeView.DocumentFragment|null} Converted node or document fragment. Null
	 * if DOM node is a {@link engine.treeView.filler filler}.
	 */
	domToView( domNode, options = {} ) {
		if ( isBlockFiller( domNode, this.blockFiller )  ) {
			return null;
		}

		if ( domNode instanceof Text ) {
			if ( isInlineFiller( domNode ) ) {
				return null;
			} else {
				return new ViewText( getDataWithoutFiller( domNode ) );
			}
		} else {
			if ( this.getCorrespondingView( domNode ) ) {
				return this.getCorrespondingView( domNode );
			}

			let viewElement;

			if ( domNode instanceof DocumentFragment ) {
				// Create view document fragment.
				viewElement = new ViewDocumentFragment();

				if ( options.bind ) {
					this.bindDocumentFragments( domNode, viewElement );
				}
			} else {
				// Create view element.
				viewElement = new ViewElement( domNode.tagName.toLowerCase() );

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
				for ( let child of this.domChildrenToView( domNode, options ) ) {
					viewElement.appendChildren( child );
				}
			}

			return viewElement;
		}
	}

	/**
	 * Converts children of the DOM element to view nodes using {@link engine.treeView.DomConverter#domToView} method.
	 * Additionally this method omit block {@link engine.treeView.filler filler}, if it exists in the DOM parent.
	 *
	 * @param {HTMLElement} domElement Parent DOM element.
	 * @param {Object} options See {@link engine.treeView.DomConverter#domToView} options parameter.
	 * @returns {Iterable.<engine.treeView.Node>} View nodes.
	 */
	*domChildrenToView( domElement, options = {} ) {
		for ( let i = 0; i < domElement.childNodes.length; i++ ) {
			const domChild = domElement.childNodes[ i ];
			const viewChild = this.domToView( domChild, options );

			if ( viewChild !== null ) {
				yield viewChild;
			}
		}
	}

	/**
	 * Converts DOM selection to view {@link engine.treeView.Selection}.
	 * Ranges which can not be converted will be omitted.
	 *
	 * @param {Selection} domSelection DOM selection.
	 * @returns {engine.treeView.Selection} View selection.
	 */
	domSelectionToView( domSelection ) {
		const viewSelection = new ViewSelection();

		for ( let i = 0; i < domSelection.rangeCount; i++ ) {
			const domRange = domSelection.getRangeAt( i );
			const viewRange = this.domRangeToView( domRange );

			if ( viewRange ) {
				viewSelection.addRange( viewRange );
			}
		}

		return viewSelection;
	}

	/**
	 * Converts DOM Range to view {@link engine.treeView.range}.
	 * If the start or end position can not be converted null is returned.
	 *
	 * @param {Range} domRange DOM range.
	 * @returns {engine.treeView.Range|null} View range.
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
	 * Converts DOM parent and offset to view {@link engine.treeView.Position}.
	 *
	 * If the position is inside a {@link engine.treeView.filler filler} which has no corresponding view node,
	 * position of the filler will be converted and returned.
	 *
	 * If structures are too different and it is not possible to find corresponding position then null will be returned.
	 *
	 * @param {Node} domParent DOM position parent.
	 * @param {Number} domOffset DOM position offset.
	 * @returns {engine.treeView.Position} viewPosition View position.
	 */
	domPositionToView( domParent, domOffset ) {
		if ( isBlockFiller( domParent, this.blockFiller ) ) {
			return this.domPositionToView( domParent.parentNode, indexOf( domParent ) );
		}

		if ( domParent instanceof Text ) {
			if ( isInlineFiller( domParent ) ) {
				return this.domPositionToView( domParent.parentNode, indexOf( domParent ) );
			}

			const viewParent = this.getCorrespondingViewText( domParent );
			let offset = domOffset;

			if ( !viewParent ) {
				return null;
			}

			if ( startsWithFiller( domParent ) ) {
				offset -= INLINE_FILLER_LENGTH;
				offset = offset < 0 ? 0 : offset;
			}

			return new ViewPosition( viewParent, offset );
		} // domParent instanceof HTMLElement
		else {
			if ( domOffset === 0 ) {
				const viewParent = this.getCorrespondingView( domParent );

				if ( viewParent ) {
					return new ViewPosition( viewParent, 0 );
				}
			} else {
				const viewBefore = this.getCorrespondingView( domParent.childNodes[ domOffset - 1 ] );

				if ( viewBefore ) {
					return new ViewPosition( viewBefore.parent, viewBefore.getIndex() + 1 );
				}
			}

			return null;
		}
	}

	/**
	 * Gets corresponding view item. This function use
	 * {@link engine.treeView.DomConverter#getCorrespondingViewElement getCorrespondingViewElement}
	 * for elements, {@link  engine.treeView.DomConverter#getCorrespondingViewText getCorrespondingViewText} for text
	 * nodes and {@link engine.treeView.DomConverter#getCorrespondingViewDocumentFragment getCorrespondingViewDocumentFragment}
	 * for document fragments.
	 *
	 * Note that for the block or inline {@link engine.treeView.filler filler} this method returns null.
	 *
	 * @param {Node|DocumentFragment} domNode DOM node or document fragment.
	 * @returns {engine.treeView.Node|engine.treeView.DocumentFragment|null} Corresponding view item.
	 */
	getCorrespondingView( domNode ) {
		if ( domNode instanceof HTMLElement ) {
			return this.getCorrespondingViewElement( domNode );
		} else if ( domNode instanceof DocumentFragment ) {
			return this.getCorrespondingViewDocumentFragment( domNode );
		} else if ( domNode instanceof Text ) {
			return this.getCorrespondingViewText( domNode );
		}

		return null;
	}

	/**
	 * Gets corresponding view element. Returns element if an view element was
	 * {@link engine.treeView.DomConverter#bindElements bound} to the given DOM element or null otherwise.
	 *
	 * @param {HTMLElement} domElement DOM element.
	 * @returns {engine.treeView.Element|null} Corresponding element or null if no element was bound.
	 */
	getCorrespondingViewElement( domElement ) {
		return this._domToViewMapping.get( domElement );
	}

	/**
	 * Gets corresponding view document fragment. Returns document fragment if an view element was
	 * {@link engine.treeView.DomConverter#bindDocumentFragments bound} to the given DOM fragment or null otherwise.
	 *
	 * @param {DocumentFragment} domFragment DOM element.
	 * @returns {engine.treeView.DocumentFragment|null} Corresponding document fragment or null if none element was bound.
	 */
	getCorrespondingViewDocumentFragment( domFragment ) {
		return this._domToViewMapping.get( domFragment );
	}

	/**
	 * Gets corresponding text node. Text nodes are not {@link engine.treeView.DomConverter#bindElements bound},
	 * corresponding text node is returned based on the sibling or parent.
	 *
	 * If the directly previous sibling is a {@link engine.treeView.DomConverter#bindElements bound} element, it is used
	 * to find the corresponding text node.
	 *
	 * If this is a first child in the parent and the parent is a {@link engine.treeView.DomConverter#bindElements bound}
	 * element, it is used to find the corresponding text node.
	 *
	 * Otherwise `null` is returned.
	 *
	 * Note that for the block or inline {@link engine.treeView.filler filler} this method returns null.
	 *
	 * @param {Text} domText DOM text node.
	 * @returns {engine.treeView.Text|null} Corresponding view text node or null, if it was not possible to find a
	 * corresponding node.
	 */
	getCorrespondingViewText( domText ) {
		if ( isInlineFiller( domText ) ) {
			return null;
		}

		const previousSibling = domText.previousSibling;

		// Try to use previous sibling to find the corresponding text node.
		if ( previousSibling ) {
			if ( !( previousSibling instanceof HTMLElement ) ) {
				// The previous is text or comment.
				return null;
			}

			const viewElement = this.getCorrespondingViewElement( previousSibling );

			if ( viewElement ) {
				const nextSibling = viewElement.getNextSibling();

				// It might be filler which has no corresponding view node.
				if ( nextSibling instanceof ViewText ) {
					return viewElement.getNextSibling();
				} else {
					return null;
				}
			}
		}
		// Try to use parent to find the corresponding text node.
		else {
			const viewElement = this.getCorrespondingViewElement( domText.parentNode );

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
	 * Gets corresponding DOM item. This function uses
	 * {@link engine.treeView.DomConverter#getCorrespondingDomElement getCorrespondingDomElement} for
	 * elements, {@link engine.treeView.DomConverter#getCorrespondingDomText getCorrespondingDomText} for text nodes
	 * and {@link engine.treeView.DomConverter#getCorrespondingDomDocumentFragment getCorrespondingDomDocumentFragment}
	 * for document fragments.
	 *
	 * @param {engine.treeView.Node|engine.treeView.DomFragment} viewNode View node or document fragment.
	 * @returns {Node|DocumentFragment|null} Corresponding DOM node or document fragment.
	 */
	getCorrespondingDom( viewNode ) {
		if ( viewNode instanceof ViewElement ) {
			return this.getCorrespondingDomElement( viewNode );
		} else if ( viewNode instanceof ViewDocumentFragment ) {
			return this.getCorrespondingDomDocumentFragment( viewNode );
		} else {
			return this.getCorrespondingDomText( viewNode );
		}
	}

	/**
	 * Gets corresponding DOM element. Returns element if an DOM element was
	 * {@link engine.treeView.DomConverter#bindElements bound} to the given view element or null otherwise.
	 *
	 * @param {engine.treeView.Element} viewElement View element.
	 * @returns {HTMLElement|null} Corresponding element or null if none element was bound.
	 */
	getCorrespondingDomElement( viewElement ) {
		return this._viewToDomMapping.get( viewElement );
	}

	/**
	 * Gets corresponding DOM document fragment. Returns document fragment if an DOM element was
	 * {@link engine.treeView.DomConverter#bindDocumentFragments bound} to the given view document fragment or null otherwise.
	 *
	 * @param {engine.treeView.DocumentFragment} viewDocumentFragment View document fragment.
	 * @returns {DocumentFragment|null} Corresponding document fragment or null if no fragment was bound.
	 */
	getCorrespondingDomDocumentFragment( viewDocumentFragment ) {
		return this._viewToDomMapping.get( viewDocumentFragment );
	}

	/**
	 * Gets corresponding text node. Text nodes are not {@link engine.treeView.DomConverter#bindElements bound},
	 * corresponding text node is returned based on the sibling or parent.
	 *
	 * If the directly previous sibling is a {@link engine.treeView.DomConverter#bindElements bound} element, it is used
	 * to find the corresponding text node.
	 *
	 * If this is a first child in the parent and the parent is a {@link engine.treeView.DomConverter#bindElements bound}
	 * element, it is used to find the corresponding text node.
	 *
	 * Otherwise null is returned.
	 *
	 * @param {engine.treeView.Text} viewText View text node.
	 * @returns {Text|null} Corresponding DOM text node or null, if it was not possible to find a corresponding node.
	 */
	getCorrespondingDomText( viewText ) {
		const previousSibling = viewText.getPreviousSibling();

		// Try to use previous sibling to find the corresponding text node.
		if ( previousSibling && this.getCorrespondingDom( previousSibling ) ) {
			return this.getCorrespondingDom( previousSibling ).nextSibling;
		}

		// Try to use parent to find the corresponding text node.
		if ( !previousSibling && this.getCorrespondingDom( viewText.parent ) ) {
			return this.getCorrespondingDom( viewText.parent ).childNodes[ 0 ];
		}

		return null;
	}
}
