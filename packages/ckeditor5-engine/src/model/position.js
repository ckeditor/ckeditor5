/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/position
 */

import TreeWalker from './treewalker';
import last from '@ckeditor/ckeditor5-utils/src/lib/lodash/last';
import compareArrays from '@ckeditor/ckeditor5-utils/src/comparearrays';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import Text from './text';

/**
 * Represents a position in the model tree.
 *
 * **Note:** Position is based on offsets, not indexes. This means that position in element containing two text nodes
 * with data `foo` and `bar`, position between them has offset `3`, not `1`.
 * See {@link module:engine/model/position~Position#path} for more.
 *
 * Since position in a model is represented by a {@link module:engine/model/position~Position#root position root} and
 * {@link module:engine/model/position~Position#path position path} it is possible to create positions placed in non-existing elements.
 * This requirement is important for {@link module:engine/model/operation/transform~transform operational transformation}.
 *
 * Also, {@link module:engine/model/operation/operation~Operation operations}
 * kept in {@link module:engine/model/document~Document#history document history}
 * are storing positions (and ranges) which were correct when those operations were applied, but may not be correct
 * after document got changed.
 *
 * When changes are applied to model, it may also happen that {@link module:engine/model/position~Position#parent position parent}
 * will change even if position path has not changed. Keep in mind, that if a position leads to non-existing element,
 * {@link module:engine/model/position~Position#parent} and some other properties and methods will throw errors.
 *
 * In most cases, position with wrong path is caused by an error in code, but it is sometimes needed, as described above.
 */
export default class Position {
	/**
	 * Creates a position.
	 *
	 * @param {module:engine/model/element~Element|module:engine/model/documentfragment~DocumentFragment} root Root of the position.
	 * @param {Array.<Number>} path Position path. See {@link module:engine/model/position~Position#path}.
	 */
	constructor( root, path ) {
		if ( !root.is( 'element' ) && !root.is( 'documentFragment' ) ) {
			/**
			 * Position root is invalid.
			 *
			 * Positions can only be anchored in elements or document fragments.
			 *
			 * @error model-position-root-invalid
			 */
			throw new CKEditorError( 'model-position-root-invalid: Position root invalid.' );
		}

		if ( !( path instanceof Array ) || path.length === 0 ) {
			/**
			 * Position path must be an array with at least one item.
			 *
			 * @error model-position-path-incorrect
			 * @param path
			 */
			throw new CKEditorError( 'model-position-path-incorrect: Position path must be an array with at least one item.', { path } );
		}

		// Normalize the root and path (if element was passed).
		path = root.getPath().concat( path );
		root = root.root;

		/**
		 * Root of the position path.
		 *
		 * @readonly
		 * @member {module:engine/model/element~Element|module:engine/model/documentfragment~DocumentFragment}
		 * module:engine/model/position~Position#root
		 */
		this.root = root;

		/**
		 * Position of the node in the tree. **Path contains offsets, not indexes.**
		 *
		 * Position can be placed before, after or in a {@link module:engine/model/node~Node node} if that node has
		 * {@link module:engine/model/node~Node#offsetSize} greater than `1`. Items in position path are
		 * {@link module:engine/model/node~Node#startOffset starting offsets} of position ancestors, starting from direct root children,
		 * down to the position offset in it's parent.
		 *
		 *		 ROOT
		 *		  |- P            before: [ 0 ]         after: [ 1 ]
		 *		  |- UL           before: [ 1 ]         after: [ 2 ]
		 *		     |- LI        before: [ 1, 0 ]      after: [ 1, 1 ]
		 *		     |  |- foo    before: [ 1, 0, 0 ]   after: [ 1, 0, 3 ]
		 *		     |- LI        before: [ 1, 1 ]      after: [ 1, 2 ]
		 *		        |- bar    before: [ 1, 1, 0 ]   after: [ 1, 1, 3 ]
		 *
		 * `foo` and `bar` are representing {@link module:engine/model/text~Text text nodes}. Since text nodes has offset size
		 * greater than `1` you can place position offset between their start and end:
		 *
		 *		 ROOT
		 *		  |- P
		 *		  |- UL
		 *		     |- LI
		 *		     |  |- f^o|o  ^ has path: [ 1, 0, 1 ]   | has path: [ 1, 0, 2 ]
		 *		     |- LI
		 *		        |- b^a|r  ^ has path: [ 1, 1, 1 ]   | has path: [ 1, 1, 2 ]
		 *
		 * @member {Array.<Number>} module:engine/model/position~Position#path
		 */
		this.path = path;
	}

	/**
	 * Offset at which this position is located in its {@link module:engine/model/position~Position#parent parent}. It is equal
	 * to the last item in position {@link module:engine/model/position~Position#path path}.
	 *
	 * @type {Number}
	 */
	get offset() {
		return last( this.path );
	}

	/**
	 * @param {Number} newOffset
	 */
	set offset( newOffset ) {
		this.path[ this.path.length - 1 ] = newOffset;
	}

	/**
	 * Parent element of this position.
	 *
	 * Keep in mind that `parent` value is calculated when the property is accessed.
	 * If {@link module:engine/model/position~Position#path position path}
	 * leads to a non-existing element, `parent` property will throw error.
	 *
	 * Also it is a good idea to cache `parent` property if it is used frequently in an algorithm (i.e. in a long loop).
	 *
	 * @readonly
	 * @type {module:engine/model/element~Element}
	 */
	get parent() {
		let parent = this.root;

		for ( let i = 0; i < this.path.length - 1; i++ ) {
			parent = parent.getChild( parent.offsetToIndex( this.path[ i ] ) );
		}

		return parent;
	}

	/**
	 * Position {@link module:engine/model/position~Position#offset offset} converted to an index in position's parent node. It is
	 * equal to the {@link module:engine/model/node~Node#index index} of a node after this position. If position is placed
	 * in text node, position index is equal to the index of that text node.
	 *
	 * @readonly
	 * @type {Number}
	 */
	get index() {
		return this.parent.offsetToIndex( this.offset );
	}

	/**
	 * Returns {@link module:engine/model/text~Text text node} instance in which this position is placed or `null` if this
	 * position is not in a text node.
	 *
	 * @readonly
	 * @type {module:engine/model/text~Text|null}
	 */
	get textNode() {
		const node = this.parent.getChild( this.index );

		return ( node instanceof Text && node.startOffset < this.offset ) ? node : null;
	}

	/**
	 * Node directly after this position or `null` if this position is in text node.
	 *
	 * @readonly
	 * @type {module:engine/model/node~Node|null}
	 */
	get nodeAfter() {
		return this.textNode === null ? this.parent.getChild( this.index ) : null;
	}

	/**
	 * Node directly before this position or `null` if this position is in text node.
	 *
	 * @readonly
	 * @type {Node}
	 */
	get nodeBefore() {
		return this.textNode === null ? this.parent.getChild( this.index - 1 ) : null;
	}

	/**
	 * Is `true` if position is at the beginning of its {@link module:engine/model/position~Position#parent parent}, `false` otherwise.
	 *
	 * @readonly
	 * @type {Boolean}
	 */
	get isAtStart() {
		return this.offset === 0;
	}

	/**
	 * Is `true` if position is at the end of its {@link module:engine/model/position~Position#parent parent}, `false` otherwise.
	 *
	 * @readonly
	 * @type {Boolean}
	 */
	get isAtEnd() {
		return this.offset == this.parent.maxOffset;
	}

	/**
	 * Checks whether this position is before or after given position.
	 *
	 * @param {module:engine/model/position~Position} otherPosition Position to compare with.
	 * @returns {module:engine/model/position~PositionRelation}
	 */
	compareWith( otherPosition ) {
		if ( this.root != otherPosition.root ) {
			return 'different';
		}

		const result = compareArrays( this.path, otherPosition.path );

		switch ( result ) {
			case 'same':
				return 'same';

			case 'prefix':
				return 'before';

			case 'extension':
				return 'after';

			default:
				if ( this.path[ result ] < otherPosition.path[ result ] ) {
					return 'before';
				} else {
					return 'after';
				}
		}
	}

	/**
	 * Gets the farthest position which matches the callback using
	 * {@link module:engine/model/treewalker~TreeWalker TreeWalker}.
	 *
	 * For example:
	 *
	 * 		getLastMatchingPosition( value => value.type == 'text' );
	 * 		// <paragraph>[]foo</paragraph> -> <paragraph>foo[]</paragraph>
	 *
	 * 		getLastMatchingPosition( value => value.type == 'text', { direction: 'backward' } );
	 * 		// <paragraph>foo[]</paragraph> -> <paragraph>[]foo</paragraph>
	 *
	 * 		getLastMatchingPosition( value => false );
	 * 		// Do not move the position.
	 *
	 * @param {Function} skip Callback function. Gets {@link module:engine/model/treewalker~TreeWalkerValue} and should
	 * return `true` if the value should be skipped or `false` if not.
	 * @param {Object} options Object with configuration options. See {@link module:engine/model/treewalker~TreeWalker}.
	 *
	 * @returns {module:engine/model/position~Position} The position after the last item which matches the `skip` callback test.
	 */
	getLastMatchingPosition( skip, options = {} ) {
		options.startPosition = this;

		const treeWalker = new TreeWalker( options );
		treeWalker.skip( skip );

		return treeWalker.position;
	}

	/**
	 * Returns a path to this position's parent. Parent path is equal to position {@link module:engine/model/position~Position#path path}
	 * but without the last item.
	 *
	 * This method returns the parent path even if the parent does not exists.
	 *
	 * @returns {Array.<Number>} Path to the parent.
	 */
	getParentPath() {
		return this.path.slice( 0, -1 );
	}

	/**
	 * Returns ancestors array of this position, that is this position's parent and its ancestors.
	 *
	 * @returns {Array.<module:engine/model/item~Item>} Array with ancestors.
	 */
	getAncestors() {
		if ( this.parent.is( 'documentFragment' ) ) {
			return [ this.parent ];
		} else {
			return this.parent.getAncestors( { includeSelf: true } );
		}
	}

	/**
	 * Returns the slice of two position {@link #path paths} which is identical. The {@link #root roots}
	 * of these two paths must be identical.
	 *
	 * @param {module:engine/model/position~Position} position The second position.
	 * @returns {Array.<Number>} The common path.
	 */
	getCommonPath( position ) {
		if ( this.root != position.root ) {
			return [];
		}

		// We find on which tree-level start and end have the lowest common ancestor
		const cmp = compareArrays( this.path, position.path );
		// If comparison returned string it means that arrays are same.
		const diffAt = ( typeof cmp == 'string' ) ? Math.min( this.path.length, position.path.length ) : cmp;

		return this.path.slice( 0, diffAt );
	}

	/**
	 * Returns an {@link module:engine/model/element~Element} or {@link module:engine/model/documentfragment~DocumentFragment}
	 * which is a common ancestor of both positions. The {@link #root roots} of these two positions must be identical.
	 *
	 * @param {module:engine/model/position~Position} position The second position.
	 * @returns {module:engine/model/element~Element|module:engine/model/documentfragment~DocumentFragment|null}
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
	 * Returns a new instance of `Position`, that has same {@link #parent parent} but it's offset
	 * is shifted by `shift` value (can be a negative value).
	 *
	 * @param {Number} shift Offset shift. Can be a negative value.
	 * @returns {module:engine/model/position~Position} Shifted position.
	 */
	getShiftedBy( shift ) {
		const shifted = Position.createFromPosition( this );

		const offset = shifted.offset + shift;
		shifted.offset = offset < 0 ? 0 : offset;

		return shifted;
	}

	/**
	 * Checks whether this position is after given position.
	 *
	 * @see module:engine/model/position~Position#isBefore
	 *
	 * @param {module:engine/model/position~Position} otherPosition Position to compare with.
	 * @returns {Boolean} True if this position is after given position.
	 */
	isAfter( otherPosition ) {
		return this.compareWith( otherPosition ) == 'after';
	}

	/**
	 * Checks whether this position is before given position.
	 *
	 * **Note:** watch out when using negation of the value returned by this method, because the negation will also
	 * be `true` if positions are in different roots and you might not expect this. You should probably use
	 * `a.isAfter( b ) || a.isEqual( b )` or `!a.isBefore( p ) && a.root == b.root` in most scenarios. If your
	 * condition uses multiple `isAfter` and `isBefore` checks, build them so they do not use negated values, i.e.:
	 *
	 *		if ( a.isBefore( b ) && c.isAfter( d ) ) {
	 *			// do A.
	 *		} else {
	 *			// do B.
	 *		}
	 *
	 * or, if you have only one if-branch:
	 *
	 *		if ( !( a.isBefore( b ) && c.isAfter( d ) ) {
	 *			// do B.
	 *		}
	 *
	 * rather than:
	 *
	 *		if ( !a.isBefore( b ) || && !c.isAfter( d ) ) {
	 *			// do B.
	 *		} else {
	 *			// do A.
	 *		}
	 *
	 * @param {module:engine/model/position~Position} otherPosition Position to compare with.
	 * @returns {Boolean} True if this position is before given position.
	 */
	isBefore( otherPosition ) {
		return this.compareWith( otherPosition ) == 'before';
	}

	/**
	 * Checks whether this position is equal to given position.
	 *
	 * @param {module:engine/model/position~Position} otherPosition Position to compare with.
	 * @returns {Boolean} True if positions are same.
	 */
	isEqual( otherPosition ) {
		return this.compareWith( otherPosition ) == 'same';
	}

	/**
	 * Checks whether this position is touching given position. Positions touch when there are no text nodes
	 * or empty nodes in a range between them. Technically, those positions are not equal but in many cases
	 * they are very similar or even indistinguishable.
	 *
	 * **Note:** this method traverses model document so it can be only used when range is up-to-date with model document.
	 *
	 * @param {module:engine/model/position~Position} otherPosition Position to compare with.
	 * @returns {Boolean} True if positions touch.
	 */
	isTouching( otherPosition ) {
		let left = null;
		let right = null;
		const compare = this.compareWith( otherPosition );

		switch ( compare ) {
			case 'same':
				return true;

			case 'before':
				left = Position.createFromPosition( this );
				right = Position.createFromPosition( otherPosition );
				break;

			case 'after':
				left = Position.createFromPosition( otherPosition );
				right = Position.createFromPosition( this );
				break;

			default:
				return false;
		}

		// Cached for optimization purposes.
		let leftParent = left.parent;

		while ( left.path.length + right.path.length ) {
			if ( left.isEqual( right ) ) {
				return true;
			}

			if ( left.path.length > right.path.length ) {
				if ( left.offset !== leftParent.maxOffset ) {
					return false;
				}

				left.path = left.path.slice( 0, -1 );
				leftParent = leftParent.parent;
				left.offset++;
			} else {
				if ( right.offset !== 0 ) {
					return false;
				}

				right.path = right.path.slice( 0, -1 );
			}
		}
	}

	/**
	 * Returns a copy of this position that is updated by removing `howMany` nodes starting from `deletePosition`.
	 * It may happen that this position is in a removed node. If that is the case, `null` is returned instead.
	 *
	 * @protected
	 * @param {module:engine/model/position~Position} deletePosition Position before the first removed node.
	 * @param {Number} howMany How many nodes are removed.
	 * @returns {module:engine/model/position~Position|null} Transformed position or `null`.
	 */
	_getTransformedByDeletion( deletePosition, howMany ) {
		const transformed = Position.createFromPosition( this );

		// This position can't be affected if deletion was in a different root.
		if ( this.root != deletePosition.root ) {
			return transformed;
		}

		if ( compareArrays( deletePosition.getParentPath(), this.getParentPath() ) == 'same' ) {
			// If nodes are removed from the node that is pointed by this position...
			if ( deletePosition.offset < this.offset ) {
				// And are removed from before an offset of that position...
				if ( deletePosition.offset + howMany > this.offset ) {
					// Position is in removed range, it's no longer in the tree.
					return null;
				} else {
					// Decrement the offset accordingly.
					transformed.offset -= howMany;
				}
			}
		} else if ( compareArrays( deletePosition.getParentPath(), this.getParentPath() ) == 'prefix' ) {
			// If nodes are removed from a node that is on a path to this position...
			const i = deletePosition.path.length - 1;

			if ( deletePosition.offset <= this.path[ i ] ) {
				// And are removed from before next node of that path...
				if ( deletePosition.offset + howMany > this.path[ i ] ) {
					// If the next node of that path is removed return null
					// because the node containing this position got removed.
					return null;
				} else {
					// Otherwise, decrement index on that path.
					transformed.path[ i ] -= howMany;
				}
			}
		}

		return transformed;
	}

	/**
	 * Returns a copy of this position that is updated by inserting `howMany` nodes at `insertPosition`.
	 *
	 * @protected
	 * @param {module:engine/model/position~Position} insertPosition Position where nodes are inserted.
	 * @param {Number} howMany How many nodes are inserted.
	 * @param {Boolean} insertBefore Flag indicating whether nodes are inserted before or after `insertPosition`.
	 * This is important only when `insertPosition` and this position are same. If that is the case and the flag is
	 * set to `true`, this position will get transformed. If the flag is set to `false`, it won't.
	 * @returns {module:engine/model/position~Position} Transformed position.
	 */
	_getTransformedByInsertion( insertPosition, howMany, insertBefore ) {
		const transformed = Position.createFromPosition( this );

		// This position can't be affected if insertion was in a different root.
		if ( this.root != insertPosition.root ) {
			return transformed;
		}

		if ( compareArrays( insertPosition.getParentPath(), this.getParentPath() ) == 'same' ) {
			// If nodes are inserted in the node that is pointed by this position...
			if ( insertPosition.offset < this.offset || ( insertPosition.offset == this.offset && insertBefore ) ) {
				// And are inserted before an offset of that position...
				// "Push" this positions offset.
				transformed.offset += howMany;
			}
		} else if ( compareArrays( insertPosition.getParentPath(), this.getParentPath() ) == 'prefix' ) {
			// If nodes are inserted in a node that is on a path to this position...
			const i = insertPosition.path.length - 1;

			if ( insertPosition.offset <= this.path[ i ] ) {
				// And are inserted before next node of that path...
				// "Push" the index on that path.
				transformed.path[ i ] += howMany;
			}
		}

		return transformed;
	}

	/**
	 * Returns a copy of this position that is updated by moving `howMany` nodes from `sourcePosition` to `targetPosition`.
	 *
	 * @protected
	 * @param {module:engine/model/position~Position} sourcePosition Position before the first element to move.
	 * @param {module:engine/model/position~Position} targetPosition Position where moved elements will be inserted.
	 * @param {Number} howMany How many consecutive nodes to move, starting from `sourcePosition`.
	 * @param {Boolean} insertBefore Flag indicating whether moved nodes are pasted before or after `insertPosition`.
	 * This is important only when `targetPosition` and this position are same. If that is the case and the flag is
	 * set to `true`, this position will get transformed by range insertion. If the flag is set to `false`, it won't.
	 * @param {Boolean} [sticky] Flag indicating whether this position "sticks" to range, that is if it should be moved
	 * with the moved range if it is equal to one of range's boundaries.
	 * @returns {module:engine/model/position~Position} Transformed position.
	 */
	_getTransformedByMove( sourcePosition, targetPosition, howMany, insertBefore, sticky ) {
		// Moving a range removes nodes from their original position. We acknowledge this by proper transformation.
		let transformed = this._getTransformedByDeletion( sourcePosition, howMany );

		// Then we update target position, as it could be affected by nodes removal too.
		targetPosition = targetPosition._getTransformedByDeletion( sourcePosition, howMany );

		if ( transformed === null || ( sticky && transformed.isEqual( sourcePosition ) ) ) {
			// This position is inside moved range (or sticks to it).
			// In this case, we calculate a combination of this position, move source position and target position.
			transformed = this._getCombined( sourcePosition, targetPosition );
		} else {
			// This position is not inside a removed range.
			// In next step, we simply reflect inserting `howMany` nodes, which might further affect the position.
			transformed = transformed._getTransformedByInsertion( targetPosition, howMany, insertBefore );
		}

		return transformed;
	}

	/**
	 * Returns a new position that is a combination of this position and given positions.
	 *
	 * The combined position is a copy of this position transformed by moving a range starting at `source` position
	 * to the `target` position. It is expected that this position is inside the moved range.
	 *
	 * Example:
	 *
	 *		let original = new Position( root, [ 2, 3, 1 ] );
	 *		let source = new Position( root, [ 2, 2 ] );
	 *		let target = new Position( otherRoot, [ 1, 1, 3 ] );
	 *		original._getCombined( source, target ); // path is [ 1, 1, 4, 1 ], root is `otherRoot`
	 *
	 * Explanation:
	 *
	 * We have a position `[ 2, 3, 1 ]` and move some nodes from `[ 2, 2 ]` to `[ 1, 1, 3 ]`. The original position
	 * was inside moved nodes and now should point to the new place. The moved nodes will be after
	 * positions `[ 1, 1, 3 ]`, `[ 1, 1, 4 ]`, `[ 1, 1, 5 ]`. Since our position was in the second moved node,
	 * the transformed position will be in a sub-tree of a node at `[ 1, 1, 4 ]`. Looking at original path, we
	 * took care of `[ 2, 3 ]` part of it. Now we have to add the rest of the original path to the transformed path.
	 * Finally, the transformed position will point to `[ 1, 1, 4, 1 ]`.
	 *
	 * @protected
	 * @param {module:engine/model/position~Position} source Beginning of the moved range.
	 * @param {module:engine/model/position~Position} target Position where the range is moved.
	 * @returns {module:engine/model/position~Position} Combined position.
	 */
	_getCombined( source, target ) {
		const i = source.path.length - 1;

		// The first part of a path to combined position is a path to the place where nodes were moved.
		const combined = Position.createFromPosition( target );

		// Then we have to update the rest of the path.

		// Fix the offset because this position might be after `from` position and we have to reflect that.
		combined.offset = combined.offset + this.path[ i ] - source.offset;

		// Then, add the rest of the path.
		// If this position is at the same level as `from` position nothing will get added.
		combined.path = combined.path.concat( this.path.slice( i + 1 ) );

		return combined;
	}

	/**
	 * Creates position at the given location. The location can be specified as:
	 *
	 * * a {@link module:engine/model/position~Position position},
	 * * parent element and offset (offset defaults to `0`),
	 * * parent element and `'end'` (sets position at the end of that element),
	 * * {@link module:engine/model/item~Item model item} and `'before'` or `'after'` (sets position before or after given model item).
	 *
	 * This method is a shortcut to other constructors such as:
	 *
	 * * {@link module:engine/model/position~Position.createBefore},
	 * * {@link module:engine/model/position~Position.createAfter},
	 * * {@link module:engine/model/position~Position.createFromParentAndOffset},
	 * * {@link module:engine/model/position~Position.createFromPosition}.
	 *
	 * @param {module:engine/model/item~Item|module:engine/model/position~Position} itemOrPosition
	 * @param {Number|'end'|'before'|'after'} [offset=0] Offset or one of the flags. Used only when
	 * first parameter is a {@link module:engine/model/item~Item model item}.
	 */
	static createAt( itemOrPosition, offset ) {
		if ( itemOrPosition instanceof Position ) {
			return this.createFromPosition( itemOrPosition );
		} else {
			const node = itemOrPosition;

			if ( offset == 'end' ) {
				offset = node.maxOffset;
			} else if ( offset == 'before' ) {
				return this.createBefore( node );
			} else if ( offset == 'after' ) {
				return this.createAfter( node );
			} else if ( !offset ) {
				offset = 0;
			}

			return this.createFromParentAndOffset( node, offset );
		}
	}

	/**
	 * Creates a new position, after given {@link module:engine/model/item~Item model item}.
	 *
	 * @param {module:engine/model/item~Item} item Item after which the position should be placed.
	 * @returns {module:engine/model/position~Position}
	 */
	static createAfter( item ) {
		if ( !item.parent ) {
			/**
			 * You can not make a position after a root element.
			 *
			 * @error model-position-after-root
			 * @param {module:engine/model/item~Item} root
			 */
			throw new CKEditorError( 'model-position-after-root: You cannot make a position after root.', { root: item } );
		}

		return this.createFromParentAndOffset( item.parent, item.endOffset );
	}

	/**
	 * Creates a new position, before the given {@link module:engine/model/item~Item model item}.
	 *
	 * @param {module:engine/model/item~Item} item Item before which the position should be placed.
	 * @returns {module:engine/model/position~Position}
	 */
	static createBefore( item ) {
		if ( !item.parent ) {
			/**
			 * You can not make a position before a root element.
			 *
			 * @error model-position-before-root
			 * @param {module:engine/model/item~Item} root
			 */
			throw new CKEditorError( 'model-position-before-root: You cannot make a position before root.', { root: item } );
		}

		return this.createFromParentAndOffset( item.parent, item.startOffset );
	}

	/**
	 * Creates a new position from the parent element and an offset in that element.
	 *
	 * @param {module:engine/model/element~Element|module:engine/model/documentfragment~DocumentFragment} parent Position's parent.
	 * @param {Number} offset Position's offset.
	 * @returns {module:engine/model/position~Position}
	 */
	static createFromParentAndOffset( parent, offset ) {
		if ( !parent.is( 'element' ) && !parent.is( 'documentFragment' ) ) {
			/**
			 * Position parent have to be a model element or model document fragment.
			 *
			 * @error model-position-parent-incorrect
			 */
			throw new CKEditorError( 'model-position-parent-incorrect: Position parent have to be a element or document fragment.' );
		}

		const path = parent.getPath();

		path.push( offset );

		return new this( parent.root, path );
	}

	/**
	 * Creates a new position, which is equal to passed position.
	 *
	 * @param {module:engine/model/position~Position} position Position to be cloned.
	 * @returns {module:engine/model/position~Position}
	 */
	static createFromPosition( position ) {
		return new this( position.root, position.path.slice() );
	}

	/**
	 * Creates a `Position` instance from given plain object (i.e. parsed JSON string).
	 *
	 * @param {Object} json Plain object to be converted to `Position`.
	 * @returns {module:engine/model/position~Position} `Position` instance created using given plain object.
	 */
	static fromJSON( json, doc ) {
		if ( json.root === '$graveyard' ) {
			return new Position( doc.graveyard, json.path );
		}

		if ( !doc.hasRoot( json.root ) ) {
			/**
			 * Cannot create position for document. Root with specified name does not exist.
			 *
			 * @error model-position-fromjson-no-root
			 * @param {String} rootName
			 */
			throw new CKEditorError(
				'model-position-fromjson-no-root: Cannot create position for document. Root with specified name does not exist.',
				{ rootName: json.root }
			);
		}

		return new Position( doc.getRoot( json.root ), json.path );
	}
}

/**
 * A flag indicating whether this position is `'before'` or `'after'` or `'same'` as given position.
 * If positions are in different roots `'different'` flag is returned.
 *
 * @typedef {String} module:engine/model/position~PositionRelation
 */
