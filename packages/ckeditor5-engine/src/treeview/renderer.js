/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'utils-diff', 'treeview/element', 'treeview/text' ], ( diff, ViewElement, ViewText ) => {
	ATTRIBUTES_NEED_UPDATE = 0;
	CHILDREN_NEED_UPDATE = 1;

	class Renderer {
		constructor( treeView ) {
			this.view = treeView.view;

			this.domRoot = treeView.domRoot;
			this.domDocument = domRoot.ownerDocument;

			this.markedAttrs = new Set();
			this.markedChildren = new Set();
		}

		markToSync( node, type ) {
			if ( type === ATTRIBUTES_NEED_UPDATE ) {
				this.markedAttrs.push( node );
			} else if ( type === CHILDREN_NEED_UPDATE ) {
				this.markedChildren.push( element );
			}
		}

		render() {
			for ( let element of this.markedAttrs ) {
				this.updateAttrs( element );
			}

			for ( let element of this.markedChildren ) {
				this.updateChildren( element );
			}

			function updateAttrs( viewElement ) {
				const domElement = viewElement.domElement;
				const domAttrKeys = domElement.attributes;
				const viewAttrKeys = viewElement.getAttrKeys();

				// Add or overwrite attributes.
				for ( let key of viewAttrKeys ) {
					element.setAttribute( key, viewElement.getAttr( key ) );
				}

				// Remove from DOM attributes which do not exists in the view.
				for ( let key of domAttrKeys ) {
					if ( !viewElement.hasAttr( key ) ) {
						element.removeAttribute( key );
					}
				}
			}

			function updateChildren( viewElement ) {
				const domElement = viewElement.domElement;
				const domChildren = domElement.childNodes;
				const viewChildren = viewElement.getChildren();

				const actions = diff( domChildren, viewChildren, compareNodes );

				let i = 0;

				for ( let action of actions ) {
					if ( action === diff.EQUAL ) {
						i++;
					} else if ( action === diff.INSERT ) {
						domElement.insertBefore( viewToDom( viewChildren[ i ] ), domChildren[ i ] || null  )
						i++;
					} else if ( action === diff.DELETE ) {
						domElement.removeChild( domChildren[ i ] );
					}
				}
			}

			function compareNodes( domNode, viewNode ) {
				// Elements.
				if ( domNode instanceof HTMLElement && viewNode instanceof ViewElement ) {
					return domNode === viewNode.DOMElement
				}
				// Texts.
				else if ( domNode instanceof Text && viewNode instanceof ViewText ) {
					return domNode.data === viewNode.getText();
				}

				// Not matching types.
				return false;
			}

			function viewToDom( view ) {
				if ( view.domElement ) {
					return domElement;
				}

				if ( view instanceof ViewText ) {
					return this.domDocument.createTextNode( view.getText() );
				} else {
					const domElement = this.domDocument.createElement( view.name );
					view.setDomElement( domElement );

					for ( let key of view.getAttrKeys() ) {
						element.setAttribute( key, view.getAttr( key ) );
					}

					for ( let childView of view.getChildren() ) {
						element.appendChild( viewToDom( childView ) );
					}

					return domElement;
				}
			}
		}
	}

	Renderer.ATTRIBUTES_NEED_UPDATE = ATTRIBUTES_NEED_UPDATE;
	Renderer.CHILDREN_NEED_UPDATE = CHILDREN_NEED_UPDATE;

	utils.extend( Document.prototype, EmitterMixin );

	return Renderer;
} );
