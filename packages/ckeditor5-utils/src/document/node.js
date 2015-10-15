/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'document/attribute' ], function( Attribute ) {
	/**
	 * Abstract document tree node class.
	 *
	 * @class document.Node
	 */
	class Node {
		/**
		 * Creates tree node.
		 *
		 * This is an abstract class, it should not be created directly.
		 *
		 * @param {document.Element|Null} parent Node parent.
		 * @param {Array} attrs Array of attributes.
		 */
		constructor( parent, attrs ) {
			/**
			 * Parent element.
			 *
			 * @readonly
			 * @property {document.Element} parent
			 */
			this.parent = parent;

			/**
			 * Array of attributes.
			 *
			 * @property {Array} attr
			 */
			this.attrs = attrs || [];
		}

		hasAttr( attr ) {
			return this.getAttr( attr ) !== null;
		}

		getAttr( attr ) {
			var i, len;

			if ( attr instanceof Attribute ) {
				for ( i = 0, len = this.attrs.length; i < len; i++ ) {
					if ( this.attrs[ i ].isEqual( attr ) ) {
						return this.attrs[ i ];
					}
				}
			} else {
				for ( i = 0, len = this.attrs.length; i < len; i++ ) {
					if ( this.attrs[ i ].key == attr ) {
						return this.attrs[ i ];
					}
				}
			}

			return null;
		}

		/**
		 * Position of the node in the parent element.
		 *
		 * @readonly
		 * @property {Number} positionInParent
		 */
		get positionInParent() {
			var pos;

			// No parent or child doesn't exist in parent's children.
			if ( !this.parent || ( pos = this.parent.children.indexOf( this ) ) == -1 ) {
				return null;
			}

			return pos;
		}

		/**
		 * Dept of the node, which equals total number of its parents.
		 *
		 * @readonly
		 * @property {Number} depth
		 */
		get depth() {
			var depth = 0;
			var parent = this.parent;

			while ( parent ) {
				depth++;

				parent = parent.parent;
			}

			return depth;
		}

		/**
		 * Nodes next sibling or null if it is the last child.
		 *
		 * @readonly
		 * @property {document.Node|Null} nextSibling
		 */
		get nextSibling() {
			var pos = this.positionInParent;

			return ( pos !== null && this.parent.children[ pos + 1 ] ) || null;
		}

		/**
		 * Nodes previous sibling or null if it is the last child.
		 *
		 * @readonly
		 * @property {document.Node|Null} previousSibling
		 */
		get previousSibling() {
			var pos = this.positionInParent;

			return ( pos !== null && this.parent.children[ pos - 1 ] ) || null;
		}

		getPath() {
			var path = [];
			var node = this; // jscs:ignore safeContextKeyword

			while ( node.parent ) {
				path.unshift( node.positionInParent );
				node = node.parent;
			}

			return path;
		}
	}

	return Node;
} );