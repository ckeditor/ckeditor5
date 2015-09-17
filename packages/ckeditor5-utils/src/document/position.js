/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( function() {
	/**
	 * Position is always before of after a node.
	 * See {@link #position} property for more information.
	 *
	 * @class document.Position
	 */
	class Position {
		/**
		 * Create a position.
		 *
		 * @param {document.element} parent Parents element.
		 * @param {Number} offset Offset in that element.
		 */
		constructor( parent, offset ) {
			this.parent = parent;
			this.offset = offset;
		}

		/**
		 * Position of the node it the tree. For example:
		 *
		 * root          Before: []          After: []
		 *  |- p         Before: [ 0 ]       After: [ 1 ]
		 *  |- ul        Before: [ 1 ]       After: [ 2 ]
		 *     |- li     Before: [ 1, 0 ]    After: [ 1, 1 ]
		 *     |  |- f   Before: [ 1, 0, 0 ] After: [ 1, 0, 1 ]
		 *     |  |- o   Before: [ 1, 0, 1 ] After: [ 1, 0, 2 ]
		 *     |  |- o   Before: [ 1, 0, 2 ] After: [ 1, 0, 3 ]
		 *     |- li     Before: [ 1, 1 ]    After: [ 1, 2 ]
		 *        |- b   Before: [ 1, 1, 0 ] After: [ 1, 1, 1 ]
		 *        |- a   Before: [ 1, 1, 1 ] After: [ 1, 1, 2 ]
		 *        |- r   Before: [ 1, 1, 2 ] After: [ 1, 1, 3 ]
		 *
		 * @type {Array}
		 */
		get path() {
			var path = [];

			var parent = this.parent;

			while ( parent.parent ) {
				path.unshift( parent.positionInParent );
				parent = parent.parent;
			}

			path.push( this.offset );

			return path;
		}

		get nodeBefore() {
			return this.parent.children[ this.offset - 1 ] || null;
		}

		get nodeAfter() {
			return this.parent.children[ this.offset ] || null;
		}

		equals( otherPossition ) {
			return this.offset === otherPossition.offset && this.parent === otherPossition.parent;
		}
	}

	return Position;
} );