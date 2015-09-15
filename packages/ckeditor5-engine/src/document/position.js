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
		 * @param {document.node} node Node the position is next to.
		 * @param {Number} position Possible options: Position.BEFORE or Position.AFTER
		 */
		constructor( node, position ) {
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
			this.position = [];

			var parent = node.parent;

			while ( parent && parent.parent ) {
				this.position.unshift( parent.positionInParent );
				parent = parent.parent;
			}

			// Root have position [].
			if ( node.parent ) {
				if ( position === Position.BEFORE ) {
					this.position.push( node.positionInParent );
				} else {
					this.position.push( node.positionInParent + 1 );
				}
			}
		}
	}

	Position.BEFORE = -1;
	Position.AFTER = 1;

	return Position;
} );