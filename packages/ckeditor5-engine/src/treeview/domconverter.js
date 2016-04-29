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

export const BR_FILLER = ( domDocument ) => {
	const fillerBr = domDocument.createElement( 'br' );
	fillerBr.dataset.filler = true;

	return fillerBr;
};

export const NBSP_FILLER = ( domDocument ) => domDocument.createTextNode( '&nbsp;' );

export const INLINE_FILLER_SIZE = 7;

export let INLINE_FILLER = '';

for ( let i = 0; i < INLINE_FILLER_SIZE; i++ ) {
	INLINE_FILLER += '\u200b';
}

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
	 */
	constructor( options = { blockFiller: BR_FILLER } ) {
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

		this.blockFillerCreator = options.blockFiller;

		this._templateBlockFiller = options.blockFiller( window.document );
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

	*viewChildrenToDom( viewElement, domDocument, options = {} ) {
		let fillerPositionOffset = viewElement.getBlockFillerOffset && viewElement.getBlockFillerOffset();
		let offset = 0;

		for ( let childView of viewElement.getChildren() ) {
			if ( fillerPositionOffset === offset ) {
				yield this.blockFillerCreator( domDocument );
			}

			yield this.viewToDom( childView, domDocument, options );

			offset++;
		}

		if ( fillerPositionOffset === offset ) {
			yield this.blockFillerCreator( domDocument );
		}
	}

	/**
	 * Converts DOM to view. For all text nodes, not bound elements and document fragments new items will
	 * be created. For bound elements and document fragments function will return corresponding items.
	 *
	 * @param {Node|DocumentFragment} domNode DOM node or document fragment to transform.
	 * @param {Object} [options] Conversion options.
	 * @param {Boolean} [options.bind=false] Determines whether new elements will be bound.
	 * @param {Boolean} [options.withChildren=true] It true node's and document fragment's children will be converted too.
	 * @returns {engine.treeView.Node|engine.treeView.DocumentFragment} Converted node or document fragment.
	 */
	domToView( domNode, options = {} ) {
		if ( this.isBlockFiller( domNode )  ) {
			return null;
		}

		if ( domNode instanceof Text ) {
			if ( this.isInlineFiller( domNode )  ) {
				return null;
			} else {
				return new ViewText( domNode.data );
			}
		} else {
			if ( this.getCorrespondingView( domNode ) ) {
				return this.getCorrespondingView( domNode );
			}

			let viewElement;

			if ( domNode instanceof  DocumentFragment ) {
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

	*domChildrenToView( domNode, options = {} ) {
		for ( let i = 0; i < domNode.childNodes.length; i++ ) {
			const domChild = domNode.childNodes[ i ];
			const viewChild = this.domToView( domChild, options );

			if ( viewChild !== null ) {
				yield viewChild;
			}
		}
	}

	/**
	 * Gets corresponding view item. This function use
	 * {@link engine.treeView.DomConverter#getCorrespondingViewElement getCorrespondingViewElement}
	 * for elements, {@link  engine.treeView.DomConverter#getCorrespondingViewText getCorrespondingViewText} for text
	 * nodes and {@link engine.treeView.DomConverter#getCorrespondingViewDocumentFragment getCorrespondingViewDocumentFragment}
	 * for document fragments.
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

		return undefined;
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
	 * @param {Text} domText DOM text node.
	 * @returns {engine.treeView.Text|null} Corresponding view text node or null, if it was not possible to find a
	 * corresponding node.
	 */
	getCorrespondingViewText( domText ) {
		if ( this.isInlineFiller( domText ) ) {
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

	viewPositionToDom( viewPosition ) {
		const viewParent = viewPosition.parent;

		if ( viewParent instanceof ViewText ) {
			const domParent = this.getCorrespondingDomText( viewParent );
			let offset = viewPosition.offset;

			if ( this.startsWithFiller( domParent ) ) {
				offset += INLINE_FILLER_SIZE;
			}

			return { parent: domParent, offset: offset };
		} else {
			let domParent, domBefore, domAfter;

			if ( viewPosition.offset === 0 ) {
				domParent = this.getCorrespondingDom( viewPosition.parent );
				domAfter = domParent.childNodes[ 0 ];
			} else {
				domBefore = this.getCorrespondingDom( viewPosition.nodeBefore );
				domParent = domBefore.parentNode;
				domAfter = domBefore.nextSibling;
			}

			if ( domAfter instanceof Text && this.startsWithFiller( domAfter ) ) {
				return { parent: domAfter, offset: INLINE_FILLER_SIZE };
			}

			const offset = domBefore ? indexOf( domBefore ) + 1 : 0;

			return { parent: domParent, offset: offset };
		}
	}

	domPositionToView( domParent, domOffset ) {
		if ( this.isBlockFiller( domParent ) ) {
			return this.domPositionToView( domParent.parentNode, indexOf( domParent ) );
		}

		if ( domParent instanceof Text ) {
			if ( this.isInlineFiller( domParent ) ) {
				return this.domPositionToView( domParent.parentNode, indexOf( domParent ) );
			}

			const viewParent = this.getCorrespondingViewText( domParent );
			let offset = domOffset;

			if ( this.startsWithFiller( domParent ) ) {
				offset -= INLINE_FILLER_SIZE;
				offset = offset < 0 ? 0 : offset;
			}

			return new ViewPosition( viewParent, offset );
		} else {
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

			return undefined;
		}
	}

	viewRangeToDom( viewRange ) {
		const domStart = this.viewPositionToDom( viewRange.start );
		const domEnd = this.viewPositionToDom( viewRange.end );

		const domRange = new Range();
		domRange.setStart( domStart.parent, domStart.offset );
		domRange.setEnd( domEnd.parent, domEnd.offset );

		return domRange;
	}

	domRangeToView( domRange ) {
		const viewStart = this.domPositionToView( domRange.startContainer, domRange.startOffset );
		const viewEnd = this.domPositionToView( domRange.endContainer, domRange.endOffset );

		if ( viewStart && viewEnd ) {
			return new ViewRange( viewStart, viewEnd );
		}

		return undefined;
	}

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

	startsWithFiller( domText ) {
		return ( domText.data.substr( 0, INLINE_FILLER_SIZE ) === INLINE_FILLER );
	}

	isInlineFiller( domText ) {
		return domText.data.length == INLINE_FILLER_SIZE && this.startsWithFiller( domText );
	}

	isBlockFiller( domNode ) {
		return domNode.isEqualNode( this._templateBlockFiller );
	}
}

function indexOf( domNode ) {
	let index = 0;

	while ( domNode.previousSibling ) {
		domNode = domNode.previousSibling;
		index++;
	}

	return index;
}