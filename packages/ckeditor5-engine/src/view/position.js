/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/view/position
 */

import TreeWalker from './treewalker';

import compareArrays from '@ckeditor/ckeditor5-utils/src/comparearrays';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import EditableElement from './editableelement';

/**
 * Position in the tree. Position is always located before or after a node.
 */
export default class Position {
	/**
	 * Creates a position.
	 *
	 * @param {module:engine/view/node~Node|module:engine/view/documentfragment~DocumentFragment} parent Position parent.
	 * @param {Number} offset Position offset.
	 */
	constructor( parent, offset ) {
		/**
		 * Position parent.
		 *
		 * @member {module:engine/view/node~Node|module:engine/view/documentfragment~DocumentFragment}
		 * module:engine/view/position~Position#parent
		 */
		this.parent = parent;

		/**
		 * Position offset.
		 *
		 * @member {Number} module:engine/view/position~Position#offset
		 */
		this.offset = offset;
	}

	/**
	 * Node directly after the position. Equals `null` when there is no node after position or position is located
	 * inside text node.
	 *
	 * @readonly
	 * @type {module:engine/view/node~Node|null}
	 */
	get nodeAfter() {
		if ( this.parent.is( 'text' ) ) {
			return null;
		}

		return this.parent.getChild( this.offset ) || null;
	}

	/**
	 * Node directly before the position. Equals `null` when there is no node before position or position is located
	 * inside text node.
	 *
	 * @readonly
	 * @type {module:engine/view/node~Node|null}
	 */
	get nodeBefore() {
		if ( this.parent.is( 'text' ) ) {
			return null;
		}

		return this.parent.getChild( this.offset - 1 ) || null;
	}

	/**
	 * Is `true` if position is at the beginning of its {@link module:engine/view/position~Position#parent parent}, `false` otherwise.
	 *
	 * @readonly
	 * @type {Boolean}
	 */
	get isAtStart() {
		return this.offset === 0;
	}

	/**
	 * Is `true` if position is at the end of its {@link module:engine/view/position~Position#parent parent}, `false` otherwise.
	 *
	 * @readonly
	 * @type {Boolean}
	 */
	get isAtEnd() {
		const endOffset = this.parent.is( 'text' ) ? this.parent.data.length : this.parent.childCount;

		return this.offset === endOffset;
	}

	/**
	 * Position's root, that is the root of the position's parent element.
	 *
	 * @readonly
	 * @type {module:engine/view/node~Node|module:engine/view/documentfragment~DocumentFragment}
	 */
	get root() {
		return this.parent.root;
	}

	/**
	 * {@link module:engine/view/editableelement~EditableElement EditableElement} instance that contains this position, or `null` if
	 * position is not inside an editable element.
	 *
	 * @type {module:engine/view/editableelement~EditableElement|null}
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
	 * @returns {module:engine/view/position~Position} Shifted position.
	 */
	getShiftedBy( shift ) {
		const shifted = Position.createFromPosition( this );

		const offset = shifted.offset + shift;
		shifted.offset = offset < 0 ? 0 : offset;

		return shifted;
	}

	/**
	 * Gets the farthest position which matches the callback using
	 * {@link module:engine/view/treewalker~TreeWalker TreeWalker}.
	 *
	 * For example:
	 *
	 * 		getLastMatchingPosition( value => value.type == 'text' ); // <p>{}foo</p> -> <p>foo[]</p>
	 * 		getLastMatchingPosition( value => value.type == 'text', { direction: 'backward' } ); // <p>foo[]</p> -> <p>{}foo</p>
	 * 		getLastMatchingPosition( value => false ); // Do not move the position.
	 *
	 * @param {Function} skip Callback function. Gets {@link module:engine/view/treewalker~TreeWalkerValue} and should
	 * return `true` if the value should be skipped or `false` if not.
	 * @param {Object} options Object with configuration options. See {@link module:engine/view/treewalker~TreeWalker}.
	 *
	 * @returns {module:engine/view/position~Position} The position after the last item which matches the `skip` callback test.
	 */
	getLastMatchingPosition( skip, options = {} ) {
		options.startPosition = this;

		const treeWalker = new TreeWalker( options );
		treeWalker.skip( skip );

		return treeWalker.position;
	}

	/**
	 * Returns ancestors array of this position, that is this position's parent and it's ancestors.
	 *
	 * @returns {Array} Array with ancestors.
	 */
	getAncestors() {
		if ( this.parent.is( 'documentFragment' ) ) {
			return [ this.parent ];
		} else {
			return this.parent.getAncestors( { includeSelf: true } );
		}
	}

	/**
	 * Returns a {@link module:engine/view/node~Node} or {@link module:engine/view/documentfragment~DocumentFragment}
	 * which is a common ancestor of both positions.
	 *
	 * @param {module:engine/view/position~Position} position
	 * @returns {module:engine/view/node~Node|module:engine/view/documentfragment~DocumentFragment|null}
	 */
	getCommonAncestor( position ) {
		const ancestorsA = this.getAncestors();
		const ancestorsB = position.getAncestors();

		let i = 0;

		while ( ancestorsA[ i ] == ancestorsB[ i ] && ancestorsA[ i ] ) {
			i++;
		}

		return i === 0 ? null : ancestorsA[ i - 1 ];
	}

	/**
	 * Checks whether this position equals given position.
	 *
	 * @param {module:engine/view/position~Position} otherPosition Position to compare with.
	 * @returns {Boolean} True if positions are same.
	 */
	isEqual( otherPosition ) {
		return ( this.parent == otherPosition.parent && this.offset == otherPosition.offset );
	}

	/**
	 * Checks whether this position is located before given position. When method returns `false` it does not mean that
	 * this position is after give one. Two positions may be located inside separate roots and in that situation this
	 * method will still return `false`.
	 *
	 * @see module:engine/view/position~Position#isAfter
	 * @see module:engine/view/position~Position#compareWith
	 * @param {module:engine/view/position~Position} otherPosition Position to compare with.
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
	 * @see module:engine/view/position~Position#isBefore
	 * @see module:engine/view/position~Position#compareWith
	 * @param {module:engine/view/position~Position} otherPosition Position to compare with.
	 * @returns {Boolean} Returns `true` if this position is after given position.
	 */
	isAfter( otherPosition ) {
		return this.compareWith( otherPosition ) == 'after';
	}

	/**
	 * Checks whether this position is before, after or in same position that other position. Two positions may be also
	 * different when they are located in separate roots.
	 *
	 * @param {module:engine/view/position~Position} otherPosition Position to compare with.
	 * @returns {module:engine/view/position~PositionRelation}
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
		const path = this.getAncestors();
		const otherPath = otherPosition.getAncestors();

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
	 * * a {@link module:engine/view/position~Position position},
	 * * parent element and offset (offset defaults to `0`),
	 * * parent element and `'end'` (sets position at the end of that element),
	 * * {@link module:engine/view/item~Item view item} and `'before'` or `'after'` (sets position before or after given view item).
	 *
	 * This method is a shortcut to other constructors such as:
	 *
	 * * {@link module:engine/view/position~Position.createBefore},
	 * * {@link module:engine/view/position~Position.createAfter},
	 * * {@link module:engine/view/position~Position.createFromPosition}.
	 *
	 * @param {module:engine/view/item~Item|module:engine/model/position~Position} itemOrPosition
	 * @param {Number|'end'|'before'|'after'} [offset=0] Offset or one of the flags. Used only when
	 * first parameter is a {@link module:engine/view/item~Item view item}.
	 */
	static createAt( itemOrPosition, offset ) {
		if ( itemOrPosition instanceof Position ) {
			return this.createFromPosition( itemOrPosition );
		} else {
			const node = itemOrPosition;

			if ( offset == 'end' ) {
				offset = node.is( 'text' ) ? node.data.length : node.childCount;
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
	 * @param {module:engine/view/item~Item} item View item after which the position should be located.
	 * @returns {module:engine/view/position~Position}
	 */
	static createAfter( item ) {
		// TextProxy is not a instance of Node so we need do handle it in specific way.
		if ( item.is( 'textProxy' ) ) {
			return new Position( item.textNode, item.offsetInText + item.data.length );
		}

		if ( !item.parent ) {
			/**
			 * You can not make a position after a root.
			 *
			 * @error view-position-after-root
			 * @param {module:engine/view/node~Node} root
			 */
			throw new CKEditorError( 'view-position-after-root: You can not make position after root.', { root: item } );
		}

		return new Position( item.parent, item.index + 1 );
	}

	/**
	 * Creates a new position before given view item.
	 *
	 * @param {module:engine/view/item~Item} item View item before which the position should be located.
	 * @returns {module:engine/view/position~Position}
	 */
	static createBefore( item ) {
		// TextProxy is not a instance of Node so we need do handle it in specific way.
		if ( item.is( 'textProxy' ) ) {
			return new Position( item.textNode, item.offsetInText );
		}

		if ( !item.parent ) {
			/**
			 * You cannot make a position before a root.
			 *
			 * @error view-position-before-root
			 * @param {module:engine/view/node~Node} root
			 */
			throw new CKEditorError( 'view-position-before-root: You can not make position before root.', { root: item } );
		}

		return new Position( item.parent, item.index );
	}

	/**
	 * Creates and returns a new instance of `Position`, which is equal to the passed position.
	 *
	 * @param {module:engine/view/position~Position} position Position to be cloned.
	 * @returns {module:engine/view/position~Position}
	 */
	static createFromPosition( position ) {
		return new this( position.parent, position.offset );
	}
}

/**
 * A flag indicating whether this position is `'before'` or `'after'` or `'same'` as given position.
 * If positions are in different roots `'different'` flag is returned.
 *
 * @typedef {String} module:engine/view/position~PositionRelation
 */
