/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

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
	 * Is `true` if position is at the beginning of its {@link engine.view.Position#parent parent}, `false` otherwise.
	 *
	 * @readonly
	 * @type {Boolean}
	 */
	get isAtStart() {
		return this.offset === 0;
	}

	/**
	 * Is `true` if position is at the end of its {@link engine.view.Position#parent parent}, `false` otherwise.
	 *
	 * @readonly
	 * @type {Boolean}
	 */
	get isAtEnd() {
		const endOffset = this.parent instanceof Text ? this.parent.data.length : this.parent.childCount;

		return this.offset === endOffset;
	}

	/**
	 * Position's root, that is the root of the position's parent element.
	 *
	 * @readonly
	 * @type {engine.view.Node|engine.view.DocumentFragment}
	 */
	get root() {
		return this.parent.root;
	}

	/**
	 * {@link engine.view.EditableElement EditableElement} instance that contains this position, or `null` if
	 * position is not inside an editable element.
	 *
	 * @type {engine.view.EditableElement|null}
	 */
	get editableElement() {
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
	 * Returns ancestors array of this position, that is this position's parent and it's ancestors.
	 *
	 * @returns {Array} Array with ancestors.
	 */
	getAncestors() {
		return this.parent.getAncestors().concat( this.parent );
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
			const index = this.offset - nextAncestor2.index;

			return index <= 0 ? 'before' : 'after';
		} else if ( commonAncestor === otherPosition.parent ) {
			const index = nextAncestor1.index - otherPosition.offset;

			return index < 0 ? 'before' : 'after';
		}

		const index = nextAncestor1.index - nextAncestor2.index;

		// Compare indexes of next ancestors inside common one.
		return index < 0 ? 'before' : 'after';
	}

	/**
	 * Creates position at the given location. The location can be specified as:
	 *
	 * * a {@link engine.view.Position position},
	 * * parent element and offset (offset defaults to `0`),
	 * * parent element and `'end'` (sets position at the end of that element),
	 * * {@link engine.view.Item view item} and `'before'` or `'after'` (sets position before or after given view item).
	 *
	 * This method is a shortcut to other constructors such as:
	 *
	 * * {@link engine.view.Position.createBefore},
	 * * {@link engine.view.Position.createAfter},
	 * * {@link engine.view.Position.createFromPosition}.
	 *
	 * @param {engine.view.Item|engine.model.Position} itemOrPosition
	 * @param {Number|'end'|'before'|'after'} [offset=0] Offset or one of the flags. Used only when
	 * first parameter is a {@link engine.view.Item view item}.
	 */
	static createAt( itemOrPosition, offset ) {
		if ( itemOrPosition instanceof Position ) {
			return this.createFromPosition( itemOrPosition );
		} else {
			let node = itemOrPosition;

			if ( offset == 'end' ) {
				offset = node instanceof Text ? node.data.length : node.childCount;
			} else if ( offset == 'before' ) {
				return this.createBefore( node );
			} else if ( offset == 'after' ) {
				return this.createAfter( node );
			} else if ( !offset ) {
				offset = 0;
			}

			return new Position( node, offset );
		}
	}

	/**
	 * Creates a new position after given view item.
	 *
	 * @param {engine.view.Item} item View item after which the position should be located.
	 * @returns {engine.view.Position}
	 */
	static createAfter( item ) {
		// TextProxy is not a instance of Node so we need do handle it in specific way.
		if ( item instanceof TextProxy ) {
			return new Position( item.textNode, item.offsetInText + item.data.length );
		}

		if ( !item.parent ) {
			/**
			 * You can not make a position after a root.
			 *
			 * @error position-after-root
			 * @param {engine.view.Node} root
			 */
			throw new CKEditorError( 'view-position-after-root: You can not make position after root.', { root: item } );
		}

		return new Position( item.parent, item.index + 1 );
	}

	/**
	 * Creates a new position before given view item.
	 *
	 * @param {engine.view.Item} item View item before which the position should be located.
	 * @returns {engine.view.Position}
	 */
	static createBefore( item ) {
		// TextProxy is not a instance of Node so we need do handle it in specific way.
		if ( item instanceof TextProxy ) {
			return new Position( item.textNode, item.offsetInText );
		}

		if ( !item.parent ) {
			/**
			 * You cannot make a position before a root.
			 *
			 * @error position-before-root
			 * @param {engine.view.Node} root
			 */
			throw new CKEditorError( 'view-position-before-root: You can not make position before root.', { root: item } );
		}

		return new Position( item.parent, item.index );
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
