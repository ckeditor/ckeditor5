/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import RootElement from './rootelement.js';
import CKEditorError from '../ckeditorerror.js';
import last from '../lib/lodash/last.js';
import utils from '../utils.js';

/**
 * Position in the tree. Position is always located before or after a node.
 * See {@link #path} property for more information.
 *
 * @memberOf core.treeModel
 */
export default class Position {
	/**
	 * Creates a position.
	 *
	 * @param {core.treeModel.RootElement} root Root element for the path. Note that this element can not have a parent.
	 * @param {Array.<Number>} path Position path. Must contain at least one item. See {@link #path} property for more information.
	 */
	constructor( root, path ) {
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
		 * @type {core.treeModel.RootElement}
		 */
		this.root = root;

		if ( !( path instanceof Array ) || path.length === 0 ) {
			/**
			 * Position path must be an Array with at least one item.
			 *
			 * @error position-path-incorrect
			 * @param path
			 */
			throw new CKEditorError( 'position-path-incorrect: Position path must be an Array with at least one item.', { path: path } );
		}

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
	}

	/**
	 * Node directly after the position.
	 *
	 * @readonly
	 * @type {core.treeModel.Node}
	 */
	get nodeAfter() {
		return this.parent.getChild( this.offset ) || null;
	}

	/**
	 * Node directly before the position.
	 *
	 * @readonly
	 * @type {Node}
	 */
	get nodeBefore() {
		return this.parent.getChild( this.offset - 1 ) || null;
	}

	/**
	 * Offset at which the position is located in the {@link #parent}.
	 *
	 * @readonly
	 * @type {Number}
	 */
	get offset() {
		return last( this.path );
	}

	/**
	 * Sets offset in the parent, which is the last element of the path.
	 */
	set offset( newOffset ) {
		this.path[ this.path.length - 1 ] = newOffset;
	}

	/**
	 * Parent element of the position. The position is located at {@link #offset} in this element.
	 *
	 * @readonly
	 * @type {core.treeModel.Element}
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
	 * Checks whether this position is before or after given position.
	 *
	 * @param {core.treeModel.Position} otherPosition Position to compare with.
	 * @returns {core.treeModel.PositionRelation}
	 */
	compareWith( otherPosition ) {
		if ( this.root != otherPosition.root ) {
			return 'DIFFERENT';
		}

		const result = utils.compareArrays( this.path, otherPosition.path );

		switch ( result ) {
			case 'SAME':
				return 'SAME';

			case 'PREFIX':
				return 'BEFORE';

			case 'EXTENSION':
				return 'AFTER';

			default:
				if ( this.path[ result ] < otherPosition.path[ result ] ) {
					return 'BEFORE';
				} else {
					return 'AFTER';
				}
		}
	}

	/**
	 * Returns the path to the parent, which is the {@link core.treeModel.Position#path} without the last element.
	 *
	 * This method returns the parent path even if the parent does not exists.
	 *
	 * @returns {Number[]} Path to the parent.
	 */
	getParentPath() {
		return this.path.slice( 0, -1 );
	}

	/**
	 * Returns a new instance of Position with offset incremented by `shift` value.
	 *
	 * @param {Number} shift How position offset should get changed. Accepts negative values.
	 * @returns {core.treeModel.Position} Shifted position.
	 */
	getShiftedBy( shift ) {
		let shifted = Position.createFromPosition( this );

		let offset = shifted.offset + shift;
		shifted.offset = offset < 0 ? 0 : offset;

		return shifted;
	}

	/**
	 * Returns this position after being updated by removing `howMany` nodes starting from `deletePosition`.
	 * It may happen that this position is in a removed node. If that is the case, `null` is returned instead.
	 *
	 * @param {core.treeModel.Position} deletePosition Position before the first removed node.
	 * @param {Number} howMany How many nodes are removed.
	 * @returns {core.treeModel.Position|null} Transformed position or `null`.
	 */
	getTransformedByDeletion( deletePosition, howMany ) {
		let transformed = Position.createFromPosition( this );

		// This position can't be affected if deletion was in a different root.
		if ( this.root != deletePosition.root ) {
			return transformed;
		}

		if ( utils.compareArrays( deletePosition.getParentPath(), this.getParentPath() ) == 'SAME' ) {
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
		} else if ( utils.compareArrays( deletePosition.getParentPath(), this.getParentPath() ) == 'PREFIX' ) {
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

	/**
	 * Returns this position after being updated by inserting `howMany` nodes at `insertPosition`.
	 *
	 * @param {core.treeModel.Position} insertPosition Position where nodes are inserted.
	 * @param {Number} howMany How many nodes are inserted.
	 * @param {Boolean} insertBefore Flag indicating whether nodes are inserted before or after `insertPosition`.
	 * This is important only when `insertPosition` and this position are same. If that is the case and the flag is
	 * set to `true`, this position will get transformed. If the flag is set to `false`, it won't.
	 * @returns {core.treeModel.Position} Transformed position.
	 */
	getTransformedByInsertion( insertPosition, howMany, insertBefore ) {
		let transformed = Position.createFromPosition( this );

		// This position can't be affected if insertion was in a different root.
		if ( this.root != insertPosition.root ) {
			return transformed;
		}

		if ( utils.compareArrays( insertPosition.getParentPath(), this.getParentPath() ) == 'SAME' ) {
			// If nodes are inserted in the node that is pointed by this position...
			if ( insertPosition.offset < this.offset || ( insertPosition.offset == this.offset && insertBefore ) ) {
				// And are inserted before an offset of that position...
				// "Push" this positions offset.
				transformed.offset += howMany;
			}
		} else if ( utils.compareArrays( insertPosition.getParentPath(), this.getParentPath() ) == 'PREFIX' ) {
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
	 * Returns this position after being updated by moving `howMany` attributes from `sourcePosition` to `targetPosition`.
	 *
	 * @param {core.treeModel.Position} sourcePosition Position before the first element to move.
	 * @param {core.treeModel.Position} targetPosition Position where moved elements will be inserted.
	 * @param {Number} howMany How many consecutive nodes to move, starting from `sourcePosition`.
	 * @param {Boolean} insertBefore Flag indicating whether moved nodes are pasted before or after `insertPosition`.
	 * This is important only when `targetPosition` and this position are same. If that is the case and the flag is
	 * set to `true`, this position will get transformed by range insertion. If the flag is set to `false`, it won't.
	 * @returns {core.treeModel.Position} Transformed position.
	 */
	getTransformedByMove( sourcePosition, targetPosition, howMany, insertBefore ) {
		// Moving a range removes nodes from their original position. We acknowledge this by proper transformation.
		let transformed = this.getTransformedByDeletion( sourcePosition, howMany );

		if ( transformed !== null ) {
			// This position is not inside a removed node.
			// Next step is to reflect pasting nodes, which might further affect the position.
			transformed = transformed.getTransformedByInsertion( targetPosition, howMany, insertBefore );
		} else {
			// This position is inside a removed node. In this case, we are unable to simply transform it by range insertion.
			// Instead, we calculate a combination of this position, move source position and target position.
			transformed = this._getCombined( sourcePosition, targetPosition );
		}

		return transformed;
	}

	/**
	 * Checks whether this position is after given position.
	 *
	 * **Note:** see {treeModel.Position#isBefore}.
	 *
	 * @param {core.treeModel.Position} otherPosition Position to compare with.
	 * @returns {Boolean} True if this position is after given position.
	 */
	isAfter( otherPosition ) {
		return this.compareWith( otherPosition ) == 'AFTER';
	}

	/**
	 * Checks whether this position is before given position.
	 *
	 * **Note:** watch out when using negation of the value returned by this method, because the negation will also
	 * be `true` if positions are in different roots and you might not expect this. You should probably use
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
	 * @param {core.treeModel.Position} otherPosition Position to compare with.
	 * @returns {Boolean} True if this position is before given position.
	 */
	isBefore( otherPosition ) {
		return this.compareWith( otherPosition ) == 'BEFORE';
	}

	/**
	 * Checks whether this position equals given position.
	 *
	 * @param {core.treeModel.Position} otherPosition Position to compare with.
	 * @returns {Boolean} True if positions are same.
	 */
	isEqual( otherPosition ) {
		return this.compareWith( otherPosition ) == 'SAME';
	}

	/**
	 * Checks whether this position is touching given position. Positions touch when there are no characters
	 * or empty nodes in a range between them. Technically, those positions are not equal but in many cases
	 * they are very similar or even indistinguishable when they touch.
	 *
	 * @param {core.treeModel.Position} otherPosition Position to compare with.
	 * @returns {Boolean} True if positions touch.
	 */
	isTouching( otherPosition ) {
		let left = null;
		let right = null;
		let compare = this.compareWith( otherPosition );

		switch ( compare ) {
			case 'SAME':
				return true;

			case 'BEFORE':
				left = this;
				right = otherPosition;
				break;

			case 'AFTER':
				left = otherPosition;
				right = this;
				break;

			default:
				return false;
		}

		while ( left.path.length + right.path.length ) {
			if ( left.isEqual( right ) ) {
				return true;
			}

			if ( left.path.length > right.path.length ) {
				if ( left.nodeAfter !== null ) {
					return false;
				}

				left.path = left.path.slice( 0, -1 );
				left.offset++;
			} else {
				if ( right.nodeBefore !== null ) {
					return false;
				}

				right.path = right.path.slice( 0, -1 );
			}
		}
	}

	/**
	 * Creates a new position after given node.
	 *
	 * @see core.treeModel.TreeWalkerValue
	 *
	 * @param {core.treeModel.Node} node Node the position should be directly after.
	 * @returns {core.treeModel.Position}
	 */
	static createAfter( node ) {
		if ( !node.parent ) {
			/**
			 * You can not make position after root.
			 *
			 * @error position-after-root
			 * @param {core.treeModel.Node} root
			 */
			throw new CKEditorError( 'position-after-root: You can not make position after root.', { root: node } );
		}

		return this.createFromParentAndOffset( node.parent, node.getIndex() + 1 );
	}

	/**
	 * Creates a new position before the given node.
	 *
	 * @see core.treeModel.TreeWalkerValue
	 *
	 * @param {core.treeModel.node} node Node the position should be directly before.
	 * @returns {core.treeModel.Position}
	 */
	static createBefore( node ) {
		if ( !node.parent ) {
			/**
			 * You can not make position before root.
			 *
			 * @error position-before-root
			 * @param {core.treeModel.Node} root
			 */
			throw new CKEditorError( 'position-before-root: You can not make position before root.', { root: node } );
		}

		return this.createFromParentAndOffset( node.parent, node.getIndex() );
	}

	/**
	 * Creates a new position from the parent element and the offset in that element.
	 *
	 * @param {core.treeModel.Element} parent Position parent element.
	 * @param {Number} offset Position offset.
	 * @returns {core.treeModel.Position}
	 */
	static createFromParentAndOffset( parent, offset ) {
		const path = parent.getPath();

		path.push( offset );

		return new this( parent.root, path );
	}

	/**
	 * Creates and returns a new instance of Position, which is equal to passed position.
	 *
	 * @param {core.treeModel.Position} position Position to be cloned.
	 * @returns {core.treeModel.Position}
	 */
	static createFromPosition( position ) {
		return new this( position.root, position.path.slice() );
	}

	/**
	 * Returns a new position that is a combination of this position and given positions. The combined
	 * position is this position transformed by moving a range starting at `from` to `to` position.
	 * It is expected that this position is inside the moved range.
	 *
	 * In other words, this method in a smart way "cuts out" `source` path from this position and
	 * injects `target` path in it's place, while doing necessary fixes in order to get a correct path.
	 *
	 * Example:
	 *
	 * 	let original = new Position( root, [ 2, 3, 1 ] );
	 * 	let source = new Position( root, [ 2, 2 ] );
	 * 	let target = new Position( otherRoot, [ 1, 1, 3 ] );
	 * 	let combined = original.getCombined( source, target );
	 * 	// combined.path is [ 1, 1, 4, 1 ], combined.root is otherRoot
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
	 * @param {core.treeModel.Position} source Beginning of the moved range.
	 * @param {core.treeModel.Position} target Position where the range is moved.
	 * @returns {core.treeModel.Position} Combined position.
	 */
	_getCombined( source, target ) {
		const i = source.path.length - 1;

		// The first part of a path to combined position is a path to the place where nodes were moved.
		let combined = Position.createFromPosition( target );

		// Then we have to update the rest of the path.

		// Fix the offset because this position might be after `from` position and we have to reflect that.
		combined.offset = combined.offset + this.path[ i ] - source.offset;

		// Then, add the rest of the path.
		// If this position is at the same level as `from` position nothing will get added.
		combined.path = combined.path.concat( this.path.slice( i + 1 ) );

		return combined;
	}
}

/**
 * A flag indicating whether this position is `'BEFORE'` or `'AFTER'` or `'SAME'` as given position.
 * If positions are in different roots `'DIFFERENT'` flag is returned.
 *
 * @typedef {String} core.treeModel.PositionRelation
 */
