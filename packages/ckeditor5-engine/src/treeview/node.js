/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import CKEditorError from '../ckeditorerror.js';

export default class Node {
	constructor() {
		this.parent = null;
	}

	getIndex() {
		let pos;

		if ( !this.parent ) {
			return null;
		}

		// No parent or child doesn't exist in parent's children.
		if ( ( pos = this.parent.getChildIndex( this ) ) == -1 ) {
			/**
			 * The node's parent does not contain this node. It means that the document tree is corrupted.
			 *
			 * @error treeview-node-not-found-in-parent
			 */
			throw new CKEditorError( 'treeview-node-not-found-in-parent: The node\'s parent does not contain this node.' );
		}

		return pos;
	}

	getNextSibling() {
		const index = this.getIndex();

		return ( index !== null && this.parent.getChild( index + 1 ) ) || null;
	}

	getPreviousSibling() {
		const index = this.getIndex();

		return ( index !== null && this.parent.getChild( index - 1 ) ) || null;
	}

	getTreeView() {
		if ( !this.parent ) {
			return null;
		} else {
			return this.parent.getTreeView();
		}
	}

	markToSync( type ) {
		const treeView = this.getTreeView();

		// If element is not attached to the Tree view it is a child of the detached subtree and will be rendered anyway with this
		// subtree.
		if ( !treeView || !treeView.renderer ) {
			return;
		}

		treeView.renderer.markToSync( this, type );
	}
}
