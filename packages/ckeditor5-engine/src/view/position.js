/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Text from './text.js';
import TextProxy from './textproxy.js';

import compareArrays from '../../utils/comparearrays.js';
import CKEditorError from '../../utils/ckeditorerror.js';
import EditableElement from './editableelement.js';

/**
 * Position in the tree. Position is always located before or after a node.
 *
 * @memberOf engine.view
 */
export default class Position {
	/**
	 * Creates a position.
	 *
	 * @param {engine.view.Node} parent Position parent node.
	 * @param {Number} offset Position offset.
	 */
	constructor( parent, offset ) {
		/**
		 * Position parent node.
		 *
		 * @member {engine.view.Node} engine.view.Position#parent
		 */
		this.parent = parent;

		/**
		 * Position offset.
		 *
		 * @member {Number} engine.view.Position#offset
		 */
		this.offset = offset;
	}

	/**
	 * Node directly after the position. Equals `null` when there is no node after position or position is located
	 * inside text node.
	 *
	 * @readonly
	 * @type {engine.view.Node|null}
	 */
	get nodeAfter() {
		if ( this.parent instanceof Text ) {
			return null;
		}

		return this.parent.getChild( this.offset ) || null;
	}

	/**
	 * Node directly before the position. Equals `null` when there is no node before position or position is located
	 * inside text node.
	 *
	 * @readonly
	 * @type {engine.view.Node|null}
	 */
	get nodeBefore() {
		if ( this.parent instanceof Text ) {
			return null;
		}

		return this.parent.getChild( this.offset - 1 ) || null;
	}

	/**
	 * Returns a new instance of Position with offset incremented by `shift` value.
	 *
	 * @param {Number} shift How position offset should get changed. Accepts negative values.
	 * @returns {engine.view.Position} Shifted position.
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
	 * @param {engine.view.Position} otherPosition Position to compare with.
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
	 * @see engine.view.Position#isAfter
	 * @see engine.view.Position#compareWith
	 * @param {engine.view.Position} otherPosition Position to compare with.
	 * @returns {Boolean} Returns `true` if this position is before given position.
	 */
	isBefore( otherPosition ) {
		return this.compareWith( otherPosition ) == 'before';
	}

	/**
	 * Checks whether this position is located after given position. When method returns `false` it does not mean that
	 * this position is before give one. Two positions may be located inside separate roots and in that situation this
	 * method will still return `false`.
	 *
	 * @see engine.view.Position#isBefore
	 * @see engine.view.Position#compareWith
	 * @param {engine.view.Position} otherPosition Position to compare with.
	 * @returns {Boolean} Returns `true` if this position is after given position.
	 */
	isAfter( otherPosition ) {
		return this.compareWith( otherPosition ) == 'after';
	}

	/**
	 * Checks whether this position is before, after or in same position that other position. Two positions may be also
	 * different when they are located in separate roots.
	 *
	 * @param {engine.view.Position} otherPosition Position to compare with.
	 * @returns {engine.view.PositionRelation}
	 */
	compareWith( otherPosition ) {
		if ( this.isEqual( otherPosition ) ) {
			return 'same';
		}

		// If positions have same parent.
		if ( this.parent === otherPosition.parent ) {
			return this.offset - otherPosition.offset < 0 ? 'before' : 'after';
		}

		// Get path from root to position's parent element.
		const path = this.parent.getAncestors( { includeNode: true } );
		const otherPath = otherPosition.parent.getAncestors( { includeNode: true } );

		// Compare both path arrays to find common ancestor.
		const result = compareArrays( path, otherPath );

		let commonAncestorIndex;

		switch ( result ) {
			case 0:
				// No common ancestors found.
				return 'different';

			case 'prefix':
				commonAncestorIndex = path.length - 1;
				break;

			case 'extension':
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

			return index <= 0 ? 'before' : 'after';
		} else if ( commonAncestor === otherPosition.parent ) {
			const index = nextAncestor1.getIndex() - otherPosition.offset;

			return index < 0 ? 'before' : 'after';
		}

		const index = nextAncestor1.getIndex() - nextAncestor2.getIndex();

		// Compare indexes of next ancestors inside common one.
		return index < 0 ? 'before' : 'after';
	}

	/**
	 * Returns {@link engine.view.EditableElement EditableElement} instance that contains this position.
	 *
	 * @returns {engine.view.EditableElement|null} Returns closest EditableElement or null if none is found.
	 */
	getEditableElement() {
		let editable = this.parent;

		while ( !( editable instanceof EditableElement ) ) {
			if ( editable.parent ) {
				editable = editable.parent;
			} else {
				return null;
			}
		}

		return editable;
	}

	/**
	 * Creates a new position after the given node.
	 *
	 * @param {engine.view.Node|engine.view.TextProxy} node Node or text proxy after which the position should be located.
	 * @returns {engine.view.Position}
	 */
	static createAfter( node ) {
		// {@link engine.view.TextProxy} is not a instance of {@link engine.view.Node} so we need do handle it in specific way.
		if ( node instanceof TextProxy ) {
			return new Position( node.textNode, node.index + node.data.length );
		}

		if ( !node.parent ) {
			/**
			 * You can not make a position after a root.
			 *
			 * @error position-after-root
			 * @param {engine.view.Node} root
			 */
			throw new CKEditorError( 'position-after-root: You can not make position after root.', { root: node } );
		}

		return new Position( node.parent, node.getIndex() + 1 );
	}

	/**
	 * Creates a new position before the given node.
	 *
	 * @param {engine.view.Node|engine.view.TextProxy} node Node or text proxy before which the position should be located.
	 * @returns {engine.view.Position}
	 */
	static createBefore( node ) {
		// {@link engine.view.TextProxy} is not a instance of {@link engine.view.Node} so we need do handle it in specific way.
		if ( node instanceof TextProxy ) {
			return new Position( node.textNode, node.index );
		}

		if ( !node.parent ) {
			/**
			 * You cannot make a position before a root.
			 *
			 * @error position-before-root
			 * @param {engine.view.Node} root
			 */
			throw new CKEditorError( 'position-before-root: You can not make position before root.', { root: node } );
		}

		return new Position( node.parent, node.getIndex() );
	}

	/**
	 * Creates and returns a new instance of `Position`, which is equal to the passed position.
	 *
	 * @param {engine.view.Position} position Position to be cloned.
	 * @returns {engine.view.Position}
	 */
	static createFromPosition( position ) {
		return new this( position.parent, position.offset );
	}
}

/**
 * A flag indicating whether this position is `'before'` or `'after'` or `'same'` as given position.
 * If positions are in different roots `'different'` flag is returned.
 *
 * @typedef {String} engine.view.PositionRelation
 */
