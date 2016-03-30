/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import ViewText from './text.js';
import ViewElement from './element.js';
import ViewDocumentFragment from './documentfragment.js';

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
	constructor() {
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
	}

	/**
	 * Binds DOM and View elements, so it will be possible to get corresponding elements using
	 * {@link engine.treeView.DomConverter#getCorrespondingViewElement} and
	 * {@link engine.treeView.DomConverter#getCorespondingDOMElement}.
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
	 * {@link engine.treeView.DomConverter#getCorrespondingViewDocumentFragment} and
	 * {@link engine.treeView.DomConverter#getCorrespondingDomDocumentFragment.
	 *
	 * @param {DocumentFragment} domFragment DOM document fragment to bind.
	 * @param {engine.treeView.DocumentFragment} viewFragment View document fragment to bind.
	 */
	bindDocumentFragments( domFragment, viewFragment ) {
		this._domToViewMapping.set( domFragment, viewFragment );
		this._viewToDomMapping.set( viewFragment, domFragment );
	}

	/**
	 * Compares DOM and View nodes. Elements are same when they are bound. Text nodes are same when they have the same
	 * text data. Nodes need to have corresponding types. In all other cases nodes are different.
	 *
	 * @param {Node} domNode DOM node to compare.
	 * @param {engine.treeView.Node} viewNode View node to compare.
	 * @returns {Boolean} True if nodes are same.
	 */
	compareNodes( domNode, viewNode ) {
		// Elements.
		if ( domNode instanceof HTMLElement && viewNode instanceof ViewElement ) {
			return domNode === this.getCorrespondingDomElement( viewNode );
		}
		// Texts.
		else if ( domNode instanceof Text && viewNode instanceof ViewText ) {
			return domNode.data === viewNode.data;
		}

		// Not matching types.
		return false;
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
	viewToDom( viewNode, domDocument, options ) {
		if ( !options ) {
			options = {};
		}

		if ( viewNode instanceof ViewText ) {
			return domDocument.createTextNode( viewNode.data );
		} else if ( viewNode instanceof  ViewDocumentFragment ) {
			if ( this.getCorrespondingDom( viewNode ) ) {
				return this.getCorrespondingDom( viewNode );
			}

			const domFragment = domDocument.createDocumentFragment();

			if ( options.bind ) {
				this.bindDocumentFragments( domFragment, viewNode );
			}

			if ( options.withChildren || options.withChildren === undefined ) {
				for ( let childView of viewNode.getChildren() ) {
					domFragment.appendChild( this.viewToDom( childView, domDocument, options ) );
				}
			}

			return domFragment;
		} else {
			if ( this.getCorrespondingDom( viewNode ) ) {
				return this.getCorrespondingDom( viewNode );
			}

			const domElement = domDocument.createElement( viewNode.name );

			if ( options.bind ) {
				this.bindElements( domElement, viewNode );
			}

			for ( let key of viewNode.getAttributeKeys() ) {
				domElement.setAttribute( key, viewNode.getAttribute( key ) );
			}

			if ( options.withChildren || options.withChildren === undefined ) {
				for ( let childView of viewNode.getChildren() ) {
					domElement.appendChild( this.viewToDom( childView, domDocument, options ) );
				}
			}

			return domElement;
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
	domToView( domNode, options ) {
		if ( !options ) {
			options = {};
		}

		if ( domNode instanceof Text ) {
			return new ViewText( domNode.data );
		} else if ( domNode instanceof DocumentFragment ) {
			if ( this.getCorrespondingView( domNode ) ) {
				return this.getCorrespondingView( domNode );
			}

			const viewFragment = new ViewDocumentFragment();

			if ( options.bind ) {
				this.bindDocumentFragments( domNode, viewFragment );
			}

			if ( options.withChildren || options.withChildren === undefined ) {
				for ( let i = 0, len = domNode.childNodes.length; i < len; i++ ) {
					let domChild = domNode.childNodes[ i ];

					viewFragment.appendChildren( this.domToView( domChild, options ) );
				}
			}

			return viewFragment;
		} else {
			if ( this.getCorrespondingView( domNode ) ) {
				return this.getCorrespondingView( domNode );
			}

			const viewElement = new ViewElement( domNode.tagName.toLowerCase() );

			if ( options.bind ) {
				this.bindElements( domNode, viewElement );
			}

			const attrs = domNode.attributes;

			for ( let i = attrs.length - 1; i >= 0; i-- ) {
				viewElement.setAttribute( attrs[ i ].name, attrs[ i ].value );
			}

			if ( options.withChildren || options.withChildren === undefined ) {
				for ( let i = 0, len = domNode.childNodes.length; i < len; i++ ) {
					let domChild = domNode.childNodes[ i ];

					viewElement.appendChildren( this.domToView( domChild, options ) );
				}
			}

			return viewElement;
		}
	}

	/**
	 * Gets corresponding view item. This function use {@link engine.treeView.DomConverter#getCorrespondingViewElement}
	 * for elements, {@link getCorrespondingViewText} for text nodes and {@link getCorrespondingViewDocumentFragment}
	 * for document fragments.
	 *
	 * @param {Node|DocumentFragment} domNode DOM node or document fragment.
	 * @returns {engine.treeView.Node|engine.treeView.DocumentFragment|null} Corresponding item.
	 */
	getCorrespondingView( domNode ) {
		if ( domNode instanceof HTMLElement ) {
			return this.getCorrespondingViewElement( domNode );
		} else if ( domNode instanceof DocumentFragment ) {
			return this.getCorrespondingViewDocumentFragment( domNode );
		} else {
			return this.getCorrespondingViewText( domNode );
		}
	}

	/**
	 * Gets corresponding view element. Returns element if an view element was
	 * {@link engine.treeView.DomConverter#bindElements bound} to the given DOM element or null otherwise.
	 *
	 * @param {HTMLElement} domElement DOM element.
	 * @returns {engine.treeView.Element|null} Corresponding element or null if none element was bound.
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
		const previousSibling = domText.previousSibling;

		// Try to use previous sibling to find the corresponding text node.
		if ( previousSibling ) {
			if ( !( previousSibling instanceof HTMLElement ) ) {
				// The previous is text or comment.
				return null;
			}

			const viewElement = this.getCorrespondingViewElement( previousSibling );

			if ( viewElement ) {
				return viewElement.getNextSibling();
			}
		}
		// Try to use parent to find the corresponding text node.
		else {
			const viewElement = this.getCorrespondingViewElement( domText.parentElement );

			if ( viewElement ) {
				return viewElement.getChild( 0 );
			}
		}

		return null;
	}

	/**
	 * Gets corresponding DOM item. This function uses {@link engine.treeView.DomConverter#getCorrespondingDomElement} for
	 * elements, {@link engine.treeView.DomConverter#getCorrespondingDomText} for text nodes
	 * and {@link getCorrespondingDomDocumentFragment} for document fragments.
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
