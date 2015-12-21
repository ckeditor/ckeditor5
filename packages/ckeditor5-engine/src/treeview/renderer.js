/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [], () => {
	ATTRIBUTES_NEED_UPDATE = 0;
	CHILDREN_NEED_UPDATE = 1;
	TEXT_NEEDS_UPDATE = 2;

	class Renderer {
		constructor( treeView ) {
			this.view = treeView.view;

			this.dom = treeView.dom;

			this.markedTexts = new Set();
			this.markedAttrs = new Set();
			this.markedChildren = new Set();
		}

		markNode( node, type ) {
			if ( type === ATTRIBUTES_NEED_UPDATE ) {
				this.markedAttrs.push( node );
			} else if ( type === CHILDREN_NEED_UPDATE ) {
				this.markedChildren.push( element );
			} else if ( type === TEXT_NEEDS_UPDATE ) {
				this.markedTexts.push( element );
			}
		}

		render() {
			this._updateTexts();
			this._updateAttrs();
			this._updateChildren();
		}

		_updateTexts() {

		}

		_updateAttrs() {
		}

		_updateChildren() {
			//diff
		}
	}

	Renderer.ATTRIBUTES_NEED_UPDATE = ATTRIBUTES_NEED_UPDATE;
	Renderer.CHILDREN_NEED_UPDATE = CHILDREN_NEED_UPDATE;
	Renderer.TEXT_NEEDS_UPDATE = TEXT_NEEDS_UPDATE;

	utils.extend( Document.prototype, EmitterMixin );

	return Renderer;
} );
