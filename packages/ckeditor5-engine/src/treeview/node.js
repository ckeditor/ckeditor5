/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'treeview/Renderer' ], ( Renderer ) => {
	class Node {
		constructor() {
			this.parent = null;
		}

		getTreeView() {
			if ( !this.parent ) {
				return null;
			} else {
				return this.parent.getTreeView();
			}
		}

		getNextSibling() {
			const index = this.getIndex();

			return ( index !== null && this.parent.getChild( index + 1 ) ) || null;
		}

		getPreviousSibling() {
			const index = this.getIndex();

			return ( index !== null && this.parent.getChild( index - 1 ) ) || null;
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

		markToSync( type ) {
			// If the node has no DOM element it is not rendered yet, its children/attributes do not need to be marked to be sync.
			if ( !this.DOMElement ) {
				return;
			}

			const treeView = this.getTreeView();

			// If element is not attached to the Tree view it is a child of the detached subtree and will be rendered anyway with this
			// subtree.
			if ( !treeView ) {
				return;
			}

			treeView.renderer.markToSync( this, type );
		}
	}

	Node.ATTRIBUTES_NEED_UPDATE = Renderer.ATTRIBUTES_NEED_UPDATE;
	Node.CHILDREN_NEED_UPDATE = Renderer.CHILDREN_NEED_UPDATE;

	return Node;
} );
