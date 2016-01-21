/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import diff from '../utils-diff.js';
import CKEditorError from '../ckeditorerror.js';

export default class Renderer {
	constructor( converter ) {
		this.converter = converter;

		this.markedAttrs = new Set();
		this.markedChildren = new Set();
		this.markedTexts = new Set();
	}

	markToSync( type, node ) {
		if ( type === 'TEXT' ) {
			if ( this.converter.getCorespondingDom( node.parent ) ) {
				this.markedTexts.add( node );
			}
		} else {
			// If the node has no DOM element it is not rendered yet, its children/attributes do not need to be marked to be sync.
			if ( !this.converter.getCorespondingDom( node ) ) {
				return;
			}

			if ( type === 'ATTRIBUTES' ) {
				this.markedAttrs.add( node );
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

	render() {
		const converter = this.converter;

		for ( let node of this.markedTexts ) {
			if ( !this.markedChildren.has( node.parent ) && converter.getCorespondingDom( node.parent ) ) {
				updateText( node );
			}
		}

		for ( let element of this.markedAttrs ) {
			updateAttrs( element );
		}

		for ( let element of this.markedChildren ) {
			updateChildren( element );
		}

		this.markedTexts.clear();
		this.markedAttrs.clear();
		this.markedChildren.clear();

		function updateText( viewText ) {
			const domText = converter.getCorespondingDom( viewText );

			if ( domText.data != viewText.getText() ) {
				domText.data = viewText.getText();
			}
		}

		function updateAttrs( viewElement ) {
			const domElement = converter.getCorespondingDom( viewElement );
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

		function updateChildren( viewElement ) {
			const domElement = converter.getCorespondingDom( viewElement );
			const domChildren = domElement.childNodes;
			const viewChildren = Array.from( viewElement.getChildren() );
			const domDocument = domElement.ownerDocument;

			const actions = diff( domChildren, viewChildren, ( domNode, viewNode ) => converter.compareNodes( domNode, viewNode ) );
			let i = 0;

			for ( let action of actions ) {
				if ( action === 'INSERT' ) {
					let domChildToInsert = converter.viewToDom( viewChildren[ i ], domDocument, { bind: true } );
					domElement.insertBefore( domChildToInsert, domChildren[ i ] || null  );
					i++;
				} else if ( action === 'DELETE' ) {
					domElement.removeChild( domChildren[ i ] );
				} else { // 'EQUAL'
					i++;
				}
			}
		}
	}
}
