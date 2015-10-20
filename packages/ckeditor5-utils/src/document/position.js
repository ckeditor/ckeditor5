/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'utils', 'ckeditorerror' ], function( utils, CKEditorError ) {
	/**
	 * Position is always before of after a node.
	 * See {@link #path} property for more information.
	 *
	 * @class document.Position
	 */
	class Position {
		/**
		 * Creates a position.
		 *
		 * @param {Array} path Position path. See {@link #path} property for more information.
		 * @param {document.Document} doc Document which position refers to.
		 */
		constructor( path, doc ) {
			/**
			 * Position of the node it the tree. For example:
			 *
			 * root
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
			this.path = path;

			/**
			 * Document which position refers to.
			 *
			 * @type {document.Document}
			 */
			this.doc = doc;
		}

		/**
		 * Create position from the parent element and the offset in that element.
		 *
		 * @param {document.Element} parent Position parent element.
		 * @param {Number} offset Position offset.
		 * @param {document.Document} doc Document which position refers to.
		 */
		static makePositionFromParentAndOffset( parent, offset, doc ) {
			var path = parent.getPath();

			path.push( offset );

			return new Position( path, doc );
		}

		/**
		 * Set the position before given node.
		 *
		 * @param {document.node} node Node the position should be directly before.
		 * @param {document.Document} doc Document which position refers to.
		 */
		static makePositionBefore( node, doc ) {
			if ( !node.parent ) {
				/**
				 * You can not make position before root.
				 *
				 * @error position-before-root
				 * @param {document.Node} root
				 */
				throw new CKEditorError( 'position-before-root: You can not make position before root.', { root: node } );
			}

			return Position.makePositionFromParentAndOffset( node.parent, node.positionInParent, doc );
		}

		/**
		 * Set the position after given node.
		 *
		 * @param {document.node} node Node the position should be directly after.
		 * @param {document.Document} doc Document which position refers to.
		 */
		static makePositionAfter( node, doc ) {
			if ( !node.parent ) {
				/**
				 * You can not make position after root.
				 *
				 * @error position-after-root
				 * @param {document.Node} root
				 */
				throw new CKEditorError( 'position-after-root: You can not make position after root.', { root: node } );
			}

			return Position.makePositionFromParentAndOffset( node.parent, node.positionInParent + 1, doc );
		}

		/**
		 * Element which is a parent of the position.
		 *
		 * @readonly
		 * @property {document.Element} parent
		 */
		get parent() {
			var parent = this.doc.root;

			var i, len;

			for ( i = 0, len = this.path.length - 1; i < len; i++ ) {
				parent = parent.children[ this.path[ i ] ];
			}

			return parent;
		}

		/**
		 * Position offset in the parent, which is the last element of the path.
		 *
		 * @readonly
		 * @property {Number} offset
		 */
		get offset() {
			return utils.last( this.path );
		}

		/**
		 * Node directly before the position.
		 *
		 * @readonly
		 * @type {Node}
		 */
		get nodeBefore() {
			return this.parent.children[ this.offset - 1 ] || null;
		}

		/**
		 * Node directly after the position.
		 *
		 * @readonly
		 * @type {Node}
		 */
		get nodeAfter() {
			return this.parent.children[ this.offset ] || null;
		}

		/**
		 * Two positions equals if paths equal.
		 *
		 * @param {document.Position} otherPosition Position to compare.
		 * @returns {Boolean} true if positions equal.
		 */
		isEqual( otherPosition ) {
			return utils.isEqual( this.path, otherPosition.path );
		}
	}

	return Position;
} );