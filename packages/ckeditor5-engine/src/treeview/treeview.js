/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'utils',
	'emittermixin',
	'treeview/rootelement',
	'treeview/renderer'
], ( utils, EmitterMixin, RootElement, Renderer ) => {
	class TreeView {
		constructor( domElement ) {
			/**
			 * Root of the view
			 */
			this.viewRoot = new RootElement( this, domElement.name );
			this.viewRoot.cloneDOMAttrs();

			/**
			 * Root of the DOM.
			 */
			this.domRoot = domElement;

			this.observers = new Set();

			this.renderer = new Renderer( this );
		}

		addObserver( observer ) {
			this.observers.push( observer );
			observer.init( this );
			observer.attach();
		}

		render() {
			for ( let observer of this.observers ) {
				observer.detach();
			}

			this.renderer.render();

			for ( let observer of this.observers ) {
				observer.attach();
			}
		}
	}

	utils.extend( Document.prototype, EmitterMixin );

	return TreeView;
} );
