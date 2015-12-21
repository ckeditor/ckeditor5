/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'treeview/renderer' ], ( Renderer ) => {
	class TreeView {
		constructor( domElement ) {
			/**
			 * Root of the view
			 */
			this.view = domElement.clone();

			/**
			 * Root of the DOM.
			 */
			this.dom = domElement;

			this.elementsMapping = new WeakMap();

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

		insertBefore( parent, newNode, referenceNode ) {
			parent.insertBefore( newNode, referenceNode );
			this.render.markNode( element, Renderer.CHILDREN_NEED_UPDATE );
		}

		appendChild( parent, node ) {
			parent.appendChild( node );
			this.render.markNode( parent, Renderer.CHILDREN_NEED_UPDATE );
		}

		removeChild( parent, child ) {
			parent.removeChild( child );
			this.render.markNode( parent, Renderer.CHILDREN_NEED_UPDATE );
		}

		setAttr( element, key, value ) {
			element.setAttribute( key, value );
			this.render.markNode( element, Renderer.ATTRIBUTES_NEED_UPDATE );
		}

		removeAttr( element, key ) {
			element.removeAttribute( key );
			this.render.markNode( element, Renderer.ATTRIBUTES_NEED_UPDATE );
		}

		setText( textNode, text ) {
			textNode.data = text;
			this.render.markNode( textNode, Renderer.TEXT_NEEDS_UPDATE );
		}
	}

	utils.extend( Document.prototype, EmitterMixin );
} );
