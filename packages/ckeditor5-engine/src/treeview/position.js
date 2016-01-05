/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import CKEditorError from '../ckeditorerror.js';

/**
 * Position in the tree. Position is always located before or after a node.
 *
 * @class treeModel.Position
 */
 export default class Position {
	/**
	 * Creates a position.
	 *
	 * @param {treeView.Element} parent Position parent element.
	 * @param {Number} offset Position offset.
	 * @constructor
	 */
	constructor( parent, offset ) {
		/**
		 * Position parent element.
		 *
		 * @type {treeView.Element}
		 */
		this.parent = parent;

		/**
		 * Position offset.
		 *
		 * @type {Number}
		 */
		this.offset = offset;
	}

	/**
	 * Node directly after the position.
	 *
	 * @readonly
	 * @property {treeView.Node}
	 */
	getNodeAfter() {
		return this.parent.getChild( this.offset ) || null;
	}

	/**
	 * Node directly before the position.
	 *
	 * @readonly
	 * @type {treeView.Node}
	 */
	getNodeBefore() {
		return this.parent.getChild( this.offset - 1 ) || null;
	}

	/**
	 * Creates a new position after given node.
	 *
	 * @param {treeView.Node} node Node the position should be directly after.
	 * @returns {treeView.Position}
	 */
	static createAfter( node ) {
		if ( !node.parent ) {
			/**
			 * You can not make position after root.
			 *
			 * @error position-after-root
			 * @param {treeView.Node} root
			 */
			throw new CKEditorError( 'position-after-root: You can not make position after root.', { root: node } );
		}

		return new Position( node.parent, node.getIndex() + 1 );
	}

	/**
	 * Creates a new position before the given node.
	 *
	 * @param {treeView.node} node Node the position should be directly before.
	 * @returns {treeView.Position}
	 */
	static createBefore( node ) {
		if ( !node.parent ) {
			/**
			 * You can not make position before root.
			 *
			 * @error position-before-root
			 * @param {treeView.Node} root
			 */
			throw new CKEditorError( 'position-before-root: You can not make position before root.', { root: node } );
		}

		return new Position( node.parent, node.getIndex() );
	}

	/**
	 * Creates and returns a new instance of Position, which is equal to passed position.
	 *
	 * @param {treeView.Position} position Position to be cloned.
	 * @returns {treeView.Position}
	 */
	static createFromPosition( position ) {
		return new this( position.parent, position.offset );
	}
}
