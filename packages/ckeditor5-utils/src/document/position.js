/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'document/rootelement', 'utils', 'ckeditorerror' ], ( RootElement, utils, CKEditorError ) => {
	const SAME = 0;
	const AFTER = 1;
	const BEFORE = -1;
	const DIFFERENT = -2;

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
		 * Checks whether this position equals given position.
		 *
		 * @param {document.Position} otherPosition Position to compare with.
		 * @returns {Boolean} True if positions are same.
		 */
		isEqual( otherPosition ) {
			return this.compareWith( otherPosition ) == SAME;
		}

		/**
		 * Checks whether this position is before given position.
		 * Attention: watch out when using negation of the value returned by this method, because the negation will also
		 * be true if positions are in different roots and you might not expect this. You should probably use
		 * `a.isAfter( b ) || a.isEqual( b )` or `!a.isBefore( p ) && a.root == b.root` in most scenarios. If your
		 * condition uses multiple `isAfter` and `isBefore` checks, build them so they do not use negated values, i.e.:
		 *
		 *  if ( a.isBefore( b ) && c.isAfter( d ) ) {
		 *    // do A.
		 *  } else {
		 *    // do B.
		 *  }
		 *
		 * or, if you have only one if-branch:
		 *
		 *  if ( !( a.isBefore( b ) && c.isAfter( d ) ) {
		 *    // do B.
		 *  }
		 *
		 * rather than:
		 *
		 *  if ( !a.isBefore( b ) || && !c.isAfter( d ) ) {
		 *    // do B.
		 *  } else {
		 *    // do A.
		 *  }
		 *
		 * @param {document.Position} otherPosition Position to compare with.
		 * @returns {Boolean} True if this position is before given position.
		 */
		isBefore( otherPosition ) {
			return this.compareWith( otherPosition ) == BEFORE;
		}

		/**
		 * Checks whether this position is after given position.
		 * Attention: see {document.Position#isBefore}.
		 *
		 * @param {document.Position} otherPosition Position to compare with.
		 * @returns {Boolean} True if this position is after given position.
		 */
		isAfter( otherPosition ) {
			return this.compareWith( otherPosition ) == AFTER;
		}

		/**
		 * Returns the path to the parent, which is the {@link document.Position#path} without the last element.
		 *
		 * This method returns the parent path even if the parent does not exists.
		 *
		 * @returns {Number[]} Path to the parent.
		 */
		getParentPath() {
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

		/**
		 * Checks whether this position is before or after given position.
		 *
		 * @param {document.Position} otherPosition Position to compare with.
		 * @returns {Number} A flag indicating whether this position is {@link #BEFORE} or
		 * {@link #AFTER} or {@link #SAME} as given position. If positions are in different roots,
		 * {@link #DIFFERENT} flag is returned.
		 */
		compareWith( otherPosition ) {
			if ( this.root != otherPosition.root ) {
				return DIFFERENT;
			}

			const result = utils.compareArrays( this.path, otherPosition.path );

			switch ( result ) {
				case utils.compareArrays.SAME:
					return SAME;

				case utils.compareArrays.PREFIX:
					return BEFORE;

				case utils.compareArrays.EXTENSION:
					return AFTER;

				default:
					if ( this.path[ result ] < otherPosition.path[ result ] ) {
						return BEFORE;
					} else {
						return AFTER;
					}
			}
		}

		/**
		 * Returns a new position that is a combination of this position and given positions. The combined
		 * position is this position transformed by moving a range starting at `from` to `to` position.
		 * It is expected that `original` position is inside the moved range.
		 *
		 * In other words, this method in a smart way "cuts out" `from` path from this position and
		 * injects `to` path in it's place, while doing necessary fixes in order to get a correct path.
		 *
		 * Example:
		 * 	let original = new Position( [ 2, 3, 1 ], root );
		 * 	let from = new Position( [ 2, 2 ], root );
		 * 	let to = new Position( [ 1, 1, 3 ], otherRoot );
		 * 	let combined = original.getCombined( from, to );
		 * 	// combined.path is [ 1, 1, 4, 1 ], combined.root is otherRoot
		 *
		 * Explanation:
		 * We have a position `[ 2, 3, 1 ]` and move some nodes from `[ 2, 2 ]` to `[ 1, 1, 3 ]`. The original position
		 * was inside moved nodes and now should point to the new place. The moved nodes will be after
		 * positions `[ 1, 1, 3 ]`, `[ 1, 1, 4 ]`, `[ 1, 1, 5 ]`. Since our position was in the second moved node,
		 * the transformed position will be in a sub-tree of a node at `[ 1, 1, 4 ]`. Looking at original path, we
		 * took care of `[ 2, 3 ]` part of it. Now we have to add the rest of the original path to the transformed path.
		 * Finally, the transformed position will point to `[ 1, 1, 4, 1 ]`.
		 *
		 * @param {document.Position} from Beginning of the moved range.
		 * @param {document.Position} to Position where the range is moved.
		 * @returns {document.Position} Combined position.
		 */
		getCombined( from, to ) {
			const i = from.path.length - 1;

			// The first part of a path to combined position is a path to the place where nodes were moved.
			let combined = to.clone();

			// Then we have to update the rest of the path.

			// Fix the offset because this position might be after `from` position and we have to reflect that.
			combined.offset = combined.offset + this.path[ i ] - from.offset;

			// Then, add the rest of the path.
			// If this position is at the same level as `from` position nothing will get added.
			combined.path = combined.path.concat( this.path.slice( i + 1 ) );

			return combined;
		}

		/**
		 * Returns this position after being updated by inserting `howMany` nodes at `insertPosition`.
		 *
		 * @param {document.Position} insertPosition Position where nodes are inserted.
		 * @param {Number} howMany How many nodes are inserted.
		 * @param {Boolean} insertBefore Flag indicating whether nodes are inserted before or after `insertPosition`.
		 * This is important only when `insertPosition` and this position are same. If that is the case and the flag is
		 * set to true, this position will get transformed. If the flag is set to false, it won't.
		 * @returns {document.Position} Transformed position.
		 */
		getTransformedByInsertion( insertPosition, howMany, insertBefore ) {
			let transformed = this.clone();

			// This position can't be affected if insertion was in a different root.
			if ( this.root != insertPosition.root ) {
				return transformed;
			}

			if ( utils.compareArrays( insertPosition.getParentPath(), this.getParentPath() ) == utils.compareArrays.SAME ) {
				// If nodes are inserted in the node that is pointed by this position...
				if ( insertPosition.offset < this.offset || ( insertPosition.offset == this.offset && insertBefore ) ) {
					// And are inserted before an offset of that position...
					// "Push" this positions offset.
					transformed.offset += howMany;
				}
			} else if ( utils.compareArrays( insertPosition.getParentPath(), this.getParentPath() ) == utils.compareArrays.PREFIX ) {
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
		 * Returns this position after being updated by removing `howMany` nodes starting from `deletePosition`.
		 * It may happen that this position is in a removed node. If that is the case, `null` is returned instead.
		 *
		 * @param {document.Position} deletePosition Position before the first removed node.
		 * @param {Number} howMany How many nodes are removed.
		 * @returns {document.Position|null} Transformed position or null.
		 */
		getTransformedByDeletion( deletePosition, howMany ) {
			let transformed = this.clone();

			// This position can't be affected if deletion was in a different root.
			if ( this.root != deletePosition.root ) {
				return transformed;
			}

			if ( utils.compareArrays( deletePosition.getParentPath(), this.getParentPath() ) == utils.compareArrays.SAME ) {
				// If nodes are removed from the node that is pointed by this position...
				if ( deletePosition.offset < this.offset ) {
					// And are removed from before an offset of that position...
					// Decrement the offset accordingly.
					if ( deletePosition.offset + howMany > this.offset ) {
						transformed.offset = deletePosition.offset;
					} else {
						transformed.offset -= howMany;
					}
				}
			} else if ( utils.compareArrays( deletePosition.getParentPath(), this.getParentPath() ) == utils.compareArrays.PREFIX ) {
				// If nodes are removed from a node that is on a path to this position...
				const i = deletePosition.path.length - 1;

				if ( deletePosition.offset < this.path[ i ] ) {
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
	}

	/**
	 * Flag for "are same" relation between Positions.
	 * @type {Number}
	 */
	Position.SAME = SAME;

	/**
	 * Flag for "is before" relation between Positions.
	 * @type {Number}
	 */
	Position.BEFORE = BEFORE;

	/**
	 * Flag for "is after" relation between Positions.
	 * @type {Number}
	 */
	Position.AFTER = AFTER;

	/**
	 * Flag for "are in different roots" relation between Positions.
	 * @type {Number}
	 */
	Position.DIFFERENT = DIFFERENT;

	return Position;
} );
