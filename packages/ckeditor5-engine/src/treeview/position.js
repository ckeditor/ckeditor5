/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * Position in the tree. Position is always located before or after a node.
 *
 * @memberOf core.treeView
 */
export default class Position {
	/**
	 * Creates a position.
	 *
	 * @param {core.treeView.Element} parent Position parent element.
	 * @param {Number} offset Position offset.
	 */
	constructor( parent, offset ) {
		/**
		 * Position parent element.
		 *
		 * @member {core.treeView.Element} core.treeView.Position#parent
		 */
		this.parent = parent;

		/**
		 * Position offset.
		 *
		 * @member {Number} core.treeView.Position#offset
		 */
		this.offset = offset;
	}

	/**
	 * Returns a new instance of Position with offset incremented by `shift` value.
	 *
	 * @param {Number} shift How position offset should get changed. Accepts negative values.
	 * @returns {core.treeView.Position} Shifted position.
	 */
	getShiftedBy( shift ) {
		let shifted = Position.createFromPosition( this );

		let offset = shifted.offset + shift;
		shifted.offset = offset < 0 ? 0 : offset;

		return shifted;
	}

	/**
	 * Checks whether this position equals given position.
	 *
	 * @param {core.treeView.Position} otherPosition Position to compare with.
	 * @returns {Boolean} True if positions are same.
	 */
	isEqual( otherPosition ) {
		return this == otherPosition || ( this.parent == otherPosition.parent && this.offset == otherPosition.offset );
	}

	/**
	 * Creates and returns a new instance of Position, which is equal to passed position.
	 *
	 * @param {core.treeView.Position} position Position to be cloned.
	 * @returns {core.treeView.Position}
	 */
	static createFromPosition( position ) {
		return new this( position.parent, position.offset );
	}
}
