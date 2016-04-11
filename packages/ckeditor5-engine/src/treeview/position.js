/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import utils from '../../utils/utils.js';

/**
 * Position in the tree. Position is always located before or after a node.
 *
 * @memberOf engine.treeView
 */
export default class Position {
	/**
	 * Creates a position.
	 *
	 * @param {engine.treeView.Element} parent Position parent element.
	 * @param {Number} offset Position offset.
	 */
	constructor( parent, offset ) {
		/**
		 * Position parent node.
		 *
		 * @member {engine.treeView.Node} engine.treeView.Position#parent
		 */
		this.parent = parent;

		/**
		 * Position offset.
		 *
		 * @member {Number} engine.treeView.Position#offset
		 */
		this.offset = offset;
	}

	/**
	 * Returns a new instance of Position with offset incremented by `shift` value.
	 *
	 * @param {Number} shift How position offset should get changed. Accepts negative values.
	 * @returns {engine.treeView.Position} Shifted position.
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
	 * @param {engine.treeView.Position} otherPosition Position to compare with.
	 * @returns {Boolean} True if positions are same.
	 */
	isEqual( otherPosition ) {
		return this == otherPosition || ( this.parent == otherPosition.parent && this.offset == otherPosition.offset );
	}

	/**
	 * Checks whether this position is located before given position. When method returns `false` it does not mean that
	 * this position is after give one. Two positions may be located inside separate roots and in that situation this
	 * method will still return `false`.
	 *
	 * @see engine.treeView.Position#isAfter
	 * @see engine.treeView.Position#compareWith
	 * @param {engine.treeView.Position} otherPosition Position to compare with.
	 * @returns {Boolean} Returns `true` if this position is before given position.
	 */
	isBefore( otherPosition ) {
		return this.compareWith( otherPosition ) == 'BEFORE';
	}

	/**
	 * Checks whether this position is located after given position. When method returns `false` it does not mean that
	 * this position is before give one. Two positions may be located inside separate roots and in that situation this
	 * method will still return `false`.
	 *
	 * @see engine.treeView.Position#isBefore
	 * @see engine.treeView.Position#compareWith
	 * @param {engine.treeView.Position} otherPosition Position to compare with.
	 * @returns {Boolean} Returns `true` if this position is after given position.
	 */
	isAfter( otherPosition ) {
		return this.compareWith( otherPosition ) == 'AFTER';
	}

	/**
	 * Checks whether this position is before, after or in same position that other position. Two positions may be also
	 * different when they are located in separate roots.
	 *
	 * @param {engine.treeView.Position} otherPosition Position to compare with.
	 * @returns {engine.treeView.PositionRelation}
	 */
	compareWith( otherPosition ) {
		if ( this.isEqual( otherPosition ) ) {
			return 'SAME';
		}

		// If positions have same parent.
		if ( this.parent === otherPosition.parent ) {
			return this.offset - otherPosition.offset < 0 ? 'BEFORE' : 'AFTER';
		}

		// Get path from root to position's parent element.
		const path = this.parent.getAncestors( { includeNode: true } );
		const otherPath = otherPosition.parent.getAncestors( { includeNode: true } );

		// Compare both path arrays to find common ancestor.
		const result = utils.compareArrays( path, otherPath );

		let commonAncestorIndex;

		switch ( result ) {
			case 0:
				// No common ancestors found.
				return 'DIFFERENT';

			case 'PREFIX':
				commonAncestorIndex = path.length - 1;
				break;

			case 'EXTENSION':
				commonAncestorIndex = otherPath.length - 1;
				break;

			default:
				commonAncestorIndex = result - 1;
		}

		// Common ancestor of two positions.
		const commonAncestor = path[ commonAncestorIndex ];
		const nextAncestor1 = path[ commonAncestorIndex + 1 ];
		const nextAncestor2 = otherPath[ commonAncestorIndex + 1 ];

		// Check if common ancestor is not one of the parents.
		if ( commonAncestor === this.parent ) {
			const index = this.offset - nextAncestor2.getIndex();

			return index <= 0 ? 'BEFORE' : 'AFTER';
		} else if ( commonAncestor === otherPosition.parent ) {
			const index = nextAncestor1.getIndex() - otherPosition.offset;

			return index < 0 ? 'BEFORE' : 'AFTER';
		}

		const index = nextAncestor1.getIndex() - nextAncestor2.getIndex();

		// Compare indexes of next ancestors inside common one.
		return index < 0 ? 'BEFORE' : 'AFTER';
	}

	/**
	 * Creates and returns a new instance of Position, which is equal to passed position.
	 *
	 * @param {engine.treeView.Position} position Position to be cloned.
	 * @returns {engine.treeView.Position}
	 */
	static createFromPosition( position ) {
		return new this( position.parent, position.offset );
	}
}

/**
 * A flag indicating whether this position is `'BEFORE'` or `'AFTER'` or `'SAME'` as given position.
 * If positions are in different roots `'DIFFERENT'` flag is returned.
 *
 * @typedef {String} engine.treeView.PositionRelation
 */