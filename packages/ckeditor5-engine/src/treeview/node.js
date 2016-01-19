/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import CKEditorError from '../ckeditorerror.js';
import EmitterMixin from '../emittermixin.js';
import objectUtils from '../lib/lodash/object.js';

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

	_fireChange( type, node ) {
		this.fire( 'change', type, node );

		if ( this.parent ) {
			this.parent._fireChange( type, node );
		}
	}
}

objectUtils.extend( Node.prototype, EmitterMixin );
