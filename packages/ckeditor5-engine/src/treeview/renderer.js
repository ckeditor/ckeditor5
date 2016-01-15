/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import diff from '../utils-diff.js';
import converter from './converter.js';
import CKEditorError from '../ckeditorerror.js';

export default class Renderer {
	constructor() {
		this.markedAttrs = new Set();
		this.markedChildren = new Set();
		this.markedTexts = new Set();
	}

	markToSync( node, type ) {
		if ( type === 'TEXT_NEEDS_UPDATE' ) {
			if ( converter.getCorespondingDom( node.parent ) ) {
				this.markedTexts.add( node );
			}
		} else {
			// If the node has no DOM element it is not rendered yet, its children/attributes do not need to be marked to be sync.
			if ( !converter.getCorespondingDom( node ) ) {
				return;
			}

			if ( type === 'ATTRIBUTES_NEED_UPDATE' ) {
				this.markedAttrs.add( node );
			} else if ( type === 'CHILDREN_NEED_UPDATE' ) {
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
			const domElement = converter.getCorespondingDom( viewElement );
			const domChildren = domElement.childNodes;
			const viewChildren = Array.from( viewElement.getChildren() );
			const domDocument = domElement.ownerDocument;

			const actions = diff( domChildren, viewChildren, converter.compareNodes );
			let i = 0;

			for ( let action of actions ) {
				if ( action === 'INSERT' ) {
					domElement.insertBefore( converter.viewToDom( viewChildren[ i ], domDocument ), domChildren[ i ] || null  );
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
