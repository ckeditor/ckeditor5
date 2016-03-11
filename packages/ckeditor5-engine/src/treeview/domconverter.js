/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import ViewText from './text.js';
import ViewElement from './element.js';

/**
 * DomConverter is a set of tools to do transformations between DOM nodes and view nodes. It also handles
 * {@link core.treeView.DomConverter#bindElements binding} these nodes.
 *
 * DomConverter does not check which nodes should be rendered (use {@link core.treeView.Renderer}), does not keep a
 * state of a tree nor keeps synchronization between tree view and DOM tree (use {@link core.treeView.TreeView}).
 *
 * DomConverter keeps DOM elements to View element bindings, so when the converter will be destroyed, the binding will
 * be lost. Two converters will keep separate binding maps, so one tree view can be bound with two DOM trees.
 *
 * @memberOf core.treeView
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
		 * @member {WeakMap} core.treeView.DomConverter#_domToViewMapping
		 */
		this._domToViewMapping = new WeakMap();

		/**
		 * View to DOM mapping.
		 *
		 * @private
		 * @member {WeakMap} core.treeView.DomConverter#_viewToDomMapping
		 */
		this._viewToDomMapping = new WeakMap();
	}

	/**
	 * Binds DOM and View elements, so it will be possible to get corresponding elements using
	 * {@link core.treeView.DomConverter#getCorrespondingViewElement} and
	 * {@link core.treeView.DomConverter#getCorespondingDOMElement}.
	 *
	 * @param {HTMLElement} domElement DOM element to bind.
	 * @param {core.treeView.Element} viewElement View element to bind.
	 */
	bindElements( domElement, viewElement ) {
		this._domToViewMapping.set( domElement, viewElement );
		this._viewToDomMapping.set( viewElement, domElement );
	}

	/**
	 * Compares DOM and View nodes. Elements are same when they are bound. Text nodes are same when they have the same
	 * text data. Nodes need to have corresponding types. In all other cases nodes are different.
	 *
	 * @param {Node} domNode DOM node to compare.
	 * @param {core.treeView.Node} viewNode View node to compare.
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
	 * Converts view to DOM. For all text nodes and not bound elements new elements will be created. For bound
	 * elements function will return corresponding elements.
	 *
	 * @param {core.treeView.Node} viewNode View node to transform.
	 * @param {document} domDocument Document which will be used to create DOM nodes.
	 * @param {Object} [options] Conversion options.
	 * @param {Boolean} [options.bind=false] Determines whether new elements will be bound.
	 * @param {Boolean} [options.withChildren=true] If true node's children will be converted too.
	 * @returns {Node} Converted node.
	 */
	viewToDom( viewNode, domDocument, options ) {
		if ( !options ) {
			options = {};
		}

		if ( viewNode instanceof ViewText ) {
			return domDocument.createTextNode( viewNode.data );
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
	 * Converts DOM to view. For all text nodes and not bound elements new elements will be created. For bound
	 * elements function will return corresponding elements.
	 *
	 * @param {Node} domNode DOM node to transform.
	 * @param {Object} [options] Conversion options.
	 * @param {Boolean} [options.bind=false] Determines whether new elements will be bound.
	 * @param {Boolean} [options.withChildren=true] It true node's children will be converted too.
	 * @returns {core.treeView.Node} Converted node.
	 */
	domToView( domNode, options ) {
		if ( !options ) {
			options = {};
		}

		if ( domNode instanceof Text ) {
			return new ViewText( domNode.data );
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
	 * Gets corresponding view node. This function use {@link core.treeView.DomConverter#getCorrespondingViewElement}
	 * for elements and {@link getCorrespondingViewText} for text nodes.
	 *
	 * @param {Node} domNode DOM node.
	 * @returns {core.treeView.Node|null} Corresponding node.
	 */
	getCorrespondingView( domNode ) {
		if ( domNode instanceof HTMLElement ) {
			return this.getCorrespondingViewElement( domNode );
		} else {
			return this.getCorrespondingViewText( domNode );
		}
	}

	/**
	 * Gets corresponding view element. Returns element if an view element was
	 * {@link core.treeView.DomConverter#bindElements bound} to the given DOM element or null otherwise.
	 *
	 * @param {HTMLElement} domElement DOM element.
	 * @returns {core.treeView.Element|null} Corresponding element or null if none element was bound.
	 */
	getCorrespondingViewElement( domElement ) {
		return this._domToViewMapping.get( domElement );
	}

	/**
	 * Gets corresponding text node. Text nodes are not {@link core.treeView.DomConverter#bindElements bound},
	 * corresponding text node is returned based on the sibling or parent.
	 *
	 * If the directly previous sibling is a {@link core.treeView.DomConverter#bindElements bound} element, it is used
	 * to find the corresponding text node.
	 *
	 * If this is a first child in the parent and the parent is a {@link core.treeView.DomConverter#bindElements bound}
	 * element, it is used to find the corresponding text node.
	 *
	 * Otherwise `null` is returned.
	 *
	 * @param {Text} domText DOM text node.
	 * @returns {core.treeView.Text|null} Corresponding view text node or null, if it was not possible to find a
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
	 * Gets corresponding DOM node. This function uses {@link core.treeView.DomConverter#getCorrespondingDomElement} for
	 * elements and {@link core.treeView.DomConverter#getCorrespondingDomText} for text nodes.
	 *
	 * @param {core.treeView.Node} viewNode View node.
	 * @returns {Node|null} Corresponding DOM node.
	 */
	getCorrespondingDom( viewNode ) {
		if ( viewNode instanceof ViewElement ) {
			return this.getCorrespondingDomElement( viewNode );
		} else {
			return this.getCorrespondingDomText( viewNode );
		}
	}

	/**
	 * Gets corresponding DOM element. Returns element if an DOM element was
	 * {@link core.treeView.DomConverter#bindElements bound} to the given view element or null otherwise.
	 *
	 * @param {core.treeView.Element} viewElement View element.
	 * @returns {HTMLElement|null} Corresponding element or null if none element was bound.
	 */
	getCorrespondingDomElement( viewElement ) {
		return this._viewToDomMapping.get( viewElement );
	}

	/**
	 * Gets corresponding text node. Text nodes are not {@link core.treeView.DomConverter#bindElements bound},
	 * corresponding text node is returned based on the sibling or parent.
	 *
	 * If the directly previous sibling is a {@link core.treeView.DomConverter#bindElements bound} element, it is used
	 * to find the corresponding text node.
	 *
	 * If this is a first child in the parent and the parent is a {@link core.treeView.DomConverter#bindElements bound}
	 * element, it is used to find the corresponding text node.
	 *
	 * Otherwise null is returned.
	 *
	 * @param {core.treeView.Text} viewText View text node.
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
