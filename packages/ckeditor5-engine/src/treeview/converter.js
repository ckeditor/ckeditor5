/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import ViewText from './text.js';
import ViewElement from './element.js';

/**
 * Converter is a set of tools to do transformations between DOM nodes and view nodes. It also handle
 * {@link #bindElements binding} these nodes.
 *
 * Converter does not check which nodes should be rendered (use {@link treeView.Renderer}), does not keep a state of
 * a tree nor keep synchronization between tree view and DOM tree (use {@treeView.TreeView}).
 *
 * Converter keep DOM elements - View element binding, so when the converter will be destroyed, the binding will be
 * lost. Two converters will use separate bindings, so one tree view can be binded with two DOM trees.
 *
 * In the future converter may take a configuration in the constructor (e.g. what should be inserted into an empty
 * elements).
 *
 * @class treeView.Converter
 */
export default class Converter {
	/**
	 * Creates converter.
	 *
	 * @constructor
	 */
	constructor() {
		// Using WeakMap prevent memory leaks: when the converter will be destroyed all referenced between View and DOM
		// will be removed. Also because it is a *Weak*Map when both view and DOM elements will be removed referenced
		// will be also removed, isn't it brilliant?

		/**
		 * DOM to View mapping.
		 *
		 * @private
		 * @type {WeakMap}
		 */
		this._domToViewMapping = new WeakMap();

		/**
		 * View to DOM mapping.
		 *
		 * @private
		 * @type {WeakMap}
		 */
		this._viewToDomMapping = new WeakMap();
	}

	/**
	 * Bind DOM and View elements, so it will be possible to get corresponding elements using
	 * {@link treeView.Converter#getCorrespondingViewElement} and {@link treeView.Converter#getCorespondingDOMElement}.
	 *
	 * @param {HTMLElement} domElement DOM element to bind.
	 * @param {treeView.Element} viewElement View element to bind.
	 */
	bindElements( domElement, viewElement ) {
		this._domToViewMapping.set( domElement, viewElement );
		this._viewToDomMapping.set( viewElement, domElement );
	}

	/**
	 * Compare DOM and View nodes. Elements are same when they are binded. Text nodes are same when they have the same
	 * text data. Nodes need to have corresponding types. In all other cases nodes are different.
	 *
	 * @param {Node} domNode DOM node to compare.
	 * @param {treeView.Node} viewNode View node to compare.
	 * @returns {Boolean} True if nodes are same.
	 */
	compareNodes( domNode, viewNode ) {
		// Elements.
		if ( domNode instanceof HTMLElement && viewNode instanceof ViewElement ) {
			return domNode === this.getCorrespondingDomElement( viewNode );
		}
		// Texts.
		else if ( domNode instanceof Text && viewNode instanceof ViewText ) {
			return domNode.data === viewNode.getText();
		}

		// Not matching types.
		return false;
	}

	/**
	 * Convert view to DOM. For all text nodes and not binded elements new elements will be created. For binded
	 * elements function will return corresponding elements.
	 *
	 * @param {treeView.Node} viewNode View node to transform.
	 * @param {document} domDocument Document which will be used to create DOM nodes.
	 * @param {Object} [options] Conversion options.
	 * @param {Boolean} [options.bind=false] Determines whether new elements will be binded.
	 * @param {Boolean} [options.withChildren=true] If true node's children will be converter too.
	 * @returns {Node} Converted node.
	 */
	viewToDom( viewNode, domDocument, options ) {
		if ( !options ) {
			options = {};
		}

		if ( viewNode instanceof ViewText ) {
			return domDocument.createTextNode( viewNode.getText() );
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
	 * Convert DOM to view. For all text nodes and not binded elements new elements will be created. For binded
	 * elements function will return corresponding elements.
	 *
	 * @param {Node} domNode DOM node to transform.
	 * @param {Object} [options] Conversion options.
	 * @param {Boolean} [options.bind=false] Determines whether new elements will be binded.
	 * @param {Boolean} [options.withChildren=true] It true node's children will be converter too.
	 * @returns {treeView.Node} Converted node.
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
	 * Gets corresponding view node. This function use {@link #getCorrespondingViewElement} for elements and
	 * {@link getCorrespondingViewText} for text nodes.
	 *
	 * @param {Node} domNode DOM node.
	 * @returns {treeView.Node|Null} Corresponding node.
	 */
	getCorrespondingView( domNode ) {
		if ( domNode instanceof HTMLElement ) {
			return this.getCorrespondingViewElement( domNode );
		} else {
			return this.getCorrespondingViewText( domNode );
		}
	}

	/**
	 * Gets corresponding view element. Returns element if an view element was {@link #bindElements binded} to the given
	 * DOM element or null otherwise.
	 *
	 * @param {HTMLElement} domElement DOM element.
	 * @returns {treeView.Element|Null} Corresponding element or null if none element was binded.
	 */
	getCorrespondingViewElement( domElement ) {
		return this._domToViewMapping.get( domElement );
	}

	/**
	 * Gets corresponding text node. Text nodes are not {@link #bindElements binded}, corresponding text node is
	 * returned based on the sibling or parent.
	 *
	 * If the directly previous sibling is a {@link #bindElements binded} element, it is used to find the corresponding
	 * text node.
	 *
	 * If this is a first child in the parent and the parent is a {@link #bindElements binded} element, it is used to
	 * find the corresponding text node.
	 *
	 * Otherwise null is returned.
	 *
	 * @param {Text} domText DOM text node.
	 * @returns {treeView.Text|Null} Corresponding view text node or null, if it was not possible to find a
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
	 * Gets corresponding DOM node. This function uses {@link #getCorrespondingDomElement} for elements and
	 * {@link #getCorrespondingDomText} for text nodes.
	 *
	 * @param {treeView.Node} viewNode View node.
	 * @returns {Node|Null} Corresponding DOM node.
	 */
	getCorrespondingDom( viewNode ) {
		if ( viewNode instanceof ViewElement ) {
			return this.getCorrespondingDomElement( viewNode );
		} else {
			return this.getCorrespondingDomText( viewNode );
		}
	}

	/**
	 * Gets corresponding DOM element. Returns element if an DOM element was {@link #bindElements binded} to the given
	 * view element or null otherwise.
	 *
	 * @param {treeView.Element} viewElement View element.
	 * @returns {HTMLElement|Null} Corresponding element or null if none element was binded.
	 */
	getCorrespondingDomElement( viewElement ) {
		return this._viewToDomMapping.get( viewElement );
	}

	/**
	 * Gets corresponding text node. Text nodes are not {@link #bindElements binded}, corresponding text node is
	 * returned based on the sibling or parent.
	 *
	 * If the directly previous sibling is a {@link #bindElements binded} element, it is used to find the corresponding
	 * text node.
	 *
	 * If this is a first child in the parent and the parent is a {@link #bindElements binded} element, it is used to
	 * find the corresponding text node.
	 *
	 * Otherwise null is returned.
	 *
	 * @param {treeView.Text} viewText View text node.
	 * @returns {Text|Null} Corresponding DOM text node or null, if it was not possible to find a corresponding node.
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