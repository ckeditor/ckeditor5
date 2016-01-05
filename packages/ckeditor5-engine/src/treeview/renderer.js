/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import diff from '../utils-diff.js';
import ViewText from './text.js';
import ViewElement from './element.js';

export default class Renderer {
	constructor( treeView ) {
		this.view = treeView.view;

		this.domRoot = treeView.domRoot;

		this.markedAttrs = new Set();
		this.markedChildren = new Set();
		this.markedTexts = new Set();
	}

	markToSync( node, type ) {
		if ( type === 'ATTRIBUTES_NEED_UPDATE' ) {
			this.markedAttrs.push( node );
		} else if ( type === 'CHILDREN_NEED_UPDATE' ) {
			this.markedChildren.push( node );
		} else if ( type === 'TEXT_NEEDS_UPDATE' ) {
			this.markedTexts.push( node );
		}
	}

	render() {
		const domDocument = this.domRoot.ownerDocument;

		for ( let node of this.markedTexts ) {
			if ( !this.markedChildren.has( node.parent ) && node.parent.domElement ) {
				updateText( node );
			}
		}

		for ( let element of this.markedAttrs ) {
			updateAttrs( element );
		}

		for ( let element of this.markedChildren ) {
			updateChildren( element );
		}

		function updateText( viewText ) {
			const domText = viewText.getDomNode();

			if ( domText.data != viewText.getText() ) {
				domText.data = viewText.getText();
			}
		}

		function updateAttrs( viewElement ) {
			const domElement = viewElement.domElement;
			const domAttrKeys = domElement.attributes;
			const viewAttrKeys = viewElement.getAttrKeys();

			// Add or overwrite attributes.
			for ( let key of viewAttrKeys ) {
				domElement.setAttribute( key, viewElement.getAttr( key ) );
			}

			// Remove from DOM attributes which do not exists in the view.
			for ( let key of domAttrKeys ) {
				if ( !viewElement.hasAttr( key ) ) {
					domElement.removeAttribute( key );
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
					domElement.insertBefore( viewToDom( viewChildren[ i ] ), domChildren[ i ] || null  );
					i++;
				} else if ( action === diff.DELETE ) {
					domElement.removeChild( domChildren[ i ] );
				}
			}
		}

		function compareNodes( domNode, viewNode ) {
			// Elements.
			if ( domNode instanceof HTMLElement && viewNode instanceof ViewElement ) {
				return domNode === viewNode.DOMElement;
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
				return view.domElement;
			}

			if ( view instanceof ViewText ) {
				return domDocument.createTextNode( view.getText() );
			} else {
				const domElement = domDocument.createElement( view.name );
				view.setDomElement( domElement );

				for ( let key of view.getAttrKeys() ) {
					domElement.setAttribute( key, view.getAttr( key ) );
				}

				for ( let childView of view.getChildren() ) {
					domElement.appendChild( viewToDom( childView ) );
				}

				return domElement;
			}
		}
	}
}
