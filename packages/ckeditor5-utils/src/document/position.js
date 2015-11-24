/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'document/rootelement', 'utils', 'ckeditorerror' ], ( RootElement, utils, CKEditorError ) => {
	/**
	 * Position in the tree. Position is always located before or after a node.
	 * See {@link #path} property for more information.
	 *
	 * @class document.Position
	 */
	class Position {
		/**
		 * Creates a position.
		 *
		 * @param {Array} path Position path. See {@link #path} property for more information.
		 * @param {document.RootElement} root Root element for the path. Note that this element can not have a parent.
		 * @constructor
		 */
		constructor( path, root ) {
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
			 * @type {Number[]}
			 */
			this.path = path;

			if ( !( root instanceof RootElement ) ) {
				/**
				 * Position root has to be an instance of RootElement.
				 *
				 * @error position-root-not-rootelement
				 * @param root
				 */
				throw new CKEditorError( 'position-root-not-rootelement: Position root has to be an instance of RootElement.', { root: root } );
			}

			/**
			 * Root element for the path. Note that this element can not have a parent.
			 *
			 * @type {document.RootElement}
			 */
			this.root = root;
		}

		/**
		 * Parent element of the position. The position is located at {@link #offset} in this element.
		 *
		 * @readonly
		 * @property {document.Element} parent
		 */
		get parent() {
			let parent = this.root;

			let i, len;

			for ( i = 0, len = this.path.length - 1; i < len; i++ ) {
				parent = parent.getChild( this.path[ i ] );
			}

			return parent;
		}

		/**
		 * Offset at which the position is located in the {@link #parent}.
		 *
		 * @readonly
		 * @property {Number} offset
		 */
		get offset() {
			return utils.last( this.path );
		}

		/**
		 * Sets offset in the parent, which is the last element of the path.
		 */
		set offset( newOffset ) {
			this.path[ this.path.length - 1 ] = newOffset;
		}

		/**
		 * Node directly before the position.
		 *
		 * @readonly
		 * @type {document.Node}
		 */
		get nodeBefore() {
			return this.parent.getChild( this.offset - 1 ) || null;
		}

		/**
		 * Node directly after the position.
		 *
		 * @readonly
		 * @property {document.Node}
		 */
		get nodeAfter() {
			return this.parent.getChild( this.offset ) || null;
		}

		/**
		 * Two positions equal if paths are equal.
		 *
		 * @param {document.Position} otherPosition Position to compare.
		 * @returns {Boolean} True if positions equal.
		 */
		isEqual( otherPosition ) {
			return utils.isEqual( this.path, otherPosition.path );
		}

		/**
		 * Returns the path to the parent, which is the {@link document.Position#path} without the last element.
		 *
		 * This method returns the parent path even if the parent does not exists.
		 *
		 * @returns {Number[]} Path to the parent.
		 */
		get parentPath() {
			return this.path.slice( 0, -1 );
		}

		/**
		 * Creates and returns a new instance of {@link document.Position}
		 * that is equal to this {@link document.Position position}.
		 *
		 * @returns {document.Position} Cloned {@link document.Position position}.
		 */
		clone() {
			return new Position( this.path.slice(), this.root );
		}

		/**
		 * Creates a new position from the parent element and the offset in that element.
		 *
		 * @param {document.Element} parent Position parent element.
		 * @param {Number} offset Position offset.
		 * @returns {document.Position}
		 */
		static createFromParentAndOffset( parent, offset ) {
			const path = parent.getPath();

			path.push( offset );

			return new Position( path, parent.root );
		}

		/**
		 * Creates a new position before the given node.
		 *
		 * @param {document.node} node Node the position should be directly before.
		 * @returns {document.Position}
		 */
		static createBefore( node ) {
			if ( !node.parent ) {
				/**
				 * You can not make position before root.
				 *
				 * @error position-before-root
				 * @param {document.Node} root
				 */
				throw new CKEditorError( 'position-before-root: You can not make position before root.', { root: node } );
			}

			return Position.createFromParentAndOffset( node.parent, node.getIndex() );
		}

		/**
		 * Creates a new position after given node.
		 *
		 * @param {document.Node} node Node the position should be directly after.
		 * @returns {document.Position}
		 */
		static createAfter( node ) {
			if ( !node.parent ) {
				/**
				 * You can not make position after root.
				 *
				 * @error position-after-root
				 * @param {document.Node} root
				 */
				throw new CKEditorError( 'position-after-root: You can not make position after root.', { root: node } );
			}

			return Position.createFromParentAndOffset( node.parent, node.getIndex() + 1 );
		}
	}

	return Position;
} );
