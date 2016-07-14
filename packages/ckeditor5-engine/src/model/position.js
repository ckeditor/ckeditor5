/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import DocumentFragment from './documentfragment.js';
import Element from './element.js';
import last from '../../utils/lib/lodash/last.js';
import compareArrays from '../../utils/comparearrays';
import CKEditorError from '../../utils/ckeditorerror.js';

/**
 * Position in the tree. Position is always located before or after a node.
 * See {@link #path} property for more information.
 *
 * @memberOf engine.model
 */
export default class Position {
	/**
	 * Creates a position.
	 *
	 * @param {engine.model.Element|engine.model.DocumentFragment} root
	 * Root of the position path. Element (most often a {@link engine.model.RootElement}) or a document fragment.
	 * @param {Array.<Number>} path Position path. See {@link engine.model.Position#path} property for more information.
	 */
	constructor( root, path ) {
		if ( !( root instanceof Element ) && !( root instanceof DocumentFragment ) ) {
			/**
			 * Position root invalid.
			 *
			 * @error position-root-invalid.
			 */
			throw new CKEditorError( 'position-root-invalid: Position root invalid.' );
		}

		if ( !( path instanceof Array ) || path.length === 0 ) {
			/**
			 * Position path must be an Array with at least one item.
			 *
			 * @error position-path-incorrect
			 * @param path
			 */
			throw new CKEditorError( 'position-path-incorrect: Position path must be an Array with at least one item.', { path: path } );
		}

		// Normalize the root and path (if element was passed).
		path = root.getPath().concat( path );
		root = root.root;

		/**
		 * Root of the position path.
		 *
		 * @readonly
		 * @member {engine.model.Element|engine.model.DocumentFragment} engine.model.Position#root
		 */
		this.root = root;

		/**
		 * Position of the node it the tree. Must contain at least one item. For example:
		 *
		 *		 root
		 *		  |- p         Before: [ 0 ]       After: [ 1 ]
		 *		  |- ul        Before: [ 1 ]       After: [ 2 ]
		 *		     |- li     Before: [ 1, 0 ]    After: [ 1, 1 ]
		 *		     |  |- f   Before: [ 1, 0, 0 ] After: [ 1, 0, 1 ]
		 *		     |  |- o   Before: [ 1, 0, 1 ] After: [ 1, 0, 2 ]
		 *		     |  |- o   Before: [ 1, 0, 2 ] After: [ 1, 0, 3 ]
		 *		     |- li     Before: [ 1, 1 ]    After: [ 1, 2 ]
		 *		        |- b   Before: [ 1, 1, 0 ] After: [ 1, 1, 1 ]
		 *		        |- a   Before: [ 1, 1, 1 ] After: [ 1, 1, 2 ]
		 *		        |- r   Before: [ 1, 1, 2 ] After: [ 1, 1, 3 ]
		 *
		 * @member {Array.<Number>} engine.model.Position#path
		 */
		this.path = path;
	}

	/**
	 * Node directly after the position.
	 *
	 * @readonly
	 * @type {engine.model.Node}
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
	 *
	 * @param {Number} newOffset
	 */
	set offset( newOffset ) {
		this.path[ this.path.length - 1 ] = newOffset;
	}

	/**
	 * Parent element of the position. The position is located at {@link #offset} in this element.
	 *
	 * @readonly
	 * @type {engine.model.Element}
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
	 * @param {engine.model.Position} otherPosition Position to compare with.
	 * @returns {engine.model.PositionRelation}
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
	 * Returns the path to the parent, which is the {@link engine.model.Position#path} without the last element.
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
	 * @returns {engine.model.Position} Shifted position.
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
	 * @protected
	 * @param {engine.model.Position} deletePosition Position before the first removed node.
	 * @param {Number} howMany How many nodes are removed.
	 * @returns {engine.model.Position|null} Transformed position or `null`.
	 */
	getTransformedByDeletion( deletePosition, howMany ) {
		let transformed = Position.createFromPosition( this );

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
	 * Returns this position after being updated by inserting `howMany` nodes at `insertPosition`.
	 *
	 * @protected
	 * @param {engine.model.Position} insertPosition Position where nodes are inserted.
	 * @param {Number} howMany How many nodes are inserted.
	 * @param {Boolean} insertBefore Flag indicating whether nodes are inserted before or after `insertPosition`.
	 * This is important only when `insertPosition` and this position are same. If that is the case and the flag is
	 * set to `true`, this position will get transformed. If the flag is set to `false`, it won't.
	 * @returns {engine.model.Position} Transformed position.
	 */
	getTransformedByInsertion( insertPosition, howMany, insertBefore ) {
		let transformed = Position.createFromPosition( this );

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
	 * Returns this position after being updated by moving `howMany` nodes from `sourcePosition` to `targetPosition`.
	 *
	 * @protected
	 * @param {engine.model.Position} sourcePosition Position before the first element to move.
	 * @param {engine.model.Position} targetPosition Position where moved elements will be inserted.
	 * @param {Number} howMany How many consecutive nodes to move, starting from `sourcePosition`.
	 * @param {Boolean} insertBefore Flag indicating whether moved nodes are pasted before or after `insertPosition`.
	 * This is important only when `targetPosition` and this position are same. If that is the case and the flag is
	 * set to `true`, this position will get transformed by range insertion. If the flag is set to `false`, it won't.
	 * @param {Boolean} [sticky] Flag indicating whether this position "sticks" to range, that is if it should be moved
	 * with the moved range if it is equal to one of range's boundaries.
	 * @returns {engine.model.Position} Transformed position.
	 */
	getTransformedByMove( sourcePosition, targetPosition, howMany, insertBefore, sticky ) {
		// Moving a range removes nodes from their original position. We acknowledge this by proper transformation.
		let transformed = this.getTransformedByDeletion( sourcePosition, howMany );

		// Then we update target position, as it could be affected by nodes removal too.
		targetPosition = targetPosition.getTransformedByDeletion( sourcePosition, howMany );

		if ( transformed === null || ( sticky && transformed.isEqual( sourcePosition ) ) ) {
			// This position is inside moved range (or sticks to it).
			// In this case, we calculate a combination of this position, move source position and target position.
			transformed = this._getCombined( sourcePosition, targetPosition );
		} else {
			// This position is not inside a removed range.
			// In next step, we simply reflect inserting `howMany` nodes, which might further affect the position.
			transformed = transformed.getTransformedByInsertion( targetPosition, howMany, insertBefore );
		}

		return transformed;
	}

	/**
	 * Checks whether this position is after given position.
	 *
	 * @see engine.model.Position#isBefore
	 *
	 * @param {engine.model.Position} otherPosition Position to compare with.
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
	 * @param {engine.model.Position} otherPosition Position to compare with.
	 * @returns {Boolean} True if this position is before given position.
	 */
	isBefore( otherPosition ) {
		return this.compareWith( otherPosition ) == 'before';
	}

	/**
	 * Checks whether this position equals given position.
	 *
	 * @param {engine.model.Position} otherPosition Position to compare with.
	 * @returns {Boolean} True if positions are same.
	 */
	isEqual( otherPosition ) {
		return this.compareWith( otherPosition ) == 'same';
	}

	/**
	 * Checks whether this position is touching given position. Positions touch when there are no characters
	 * or empty nodes in a range between them. Technically, those positions are not equal but in many cases
	 * they are very similar or even indistinguishable when they touch.
	 *
	 * @param {engine.model.Position} otherPosition Position to compare with.
	 * @returns {Boolean} True if positions touch.
	 */
	isTouching( otherPosition ) {
		let left = null;
		let right = null;
		let compare = this.compareWith( otherPosition );

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
	 * Whether position is at the beginning of its {@link engine.model.Position#parent}.
	 *
	 * @returns {Boolean}
	 */
	isAtStart() {
		return this.offset === 0;
	}

	/**
	 * Whether position is at the end of its {@link engine.model.Position#parent}.
	 *
	 * @returns {Boolean}
	 */
	isAtEnd() {
		return this.offset == this.parent.getChildCount();
	}

	/**
	 * Creates position at the given location. The location can be specified as:
	 *
	 * * a {@link engine.model.Position position},
	 * * parent element and offset (offset defaults to `0`),
	 * * parent element and `'end'` (sets selection at the end of that element),
	 * * node and `'before'` or `'after'` (sets selection before or after the given node).
	 *
	 * This method is a shortcut to other constructors such as:
	 *
	 * * {@link engine.model.Position.createBefore},
	 * * {@link engine.model.Position.createAfter},
	 * * {@link engine.model.Position.createFromParentAndOffset},
	 * * {@link engine.model.Position.createFromPosition}.
	 *
	 * @param {engine.model.Node|engine.model.Position} nodeOrPosition
	 * @param {Number|'end'|'before'|'after'} [offset=0] Offset or one of the flags. Used only when
	 * first parameter is a node.
	 */
	static createAt( nodeOrPosition, offset ) {
		let node;

		if ( nodeOrPosition instanceof Position ) {
			return this.createFromPosition( nodeOrPosition );
		} else {
			node = nodeOrPosition;

			if ( offset == 'end' ) {
				offset = node.getChildCount();
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
	 * Creates a new position after given node.
	 *
	 * @see {@link engine.model.TreeWalkerValue}
	 *
	 * @param {engine.model.Node} node Node the position should be directly after.
	 * @returns {engine.model.Position}
	 */
	static createAfter( node ) {
		if ( !node.parent ) {
			/**
			 * You can not make position after root.
			 *
			 * @error position-after-root
			 * @param {engine.model.Node} root
			 */
			throw new CKEditorError( 'position-after-root: You can not make position after root.', { root: node } );
		}

		return this.createFromParentAndOffset( node.parent, node.getIndex() + 1 );
	}

	/**
	 * Creates a new position before the given node.
	 *
	 * @see {@link engine.model.TreeWalkerValue}
	 *
	 * @param {engine.model.node} node Node the position should be directly before.
	 * @returns {engine.model.Position}
	 */
	static createBefore( node ) {
		if ( !node.parent ) {
			/**
			 * You can not make position before root.
			 *
			 * @error position-before-root
			 * @param {engine.model.Node} root
			 */
			throw new CKEditorError( 'position-before-root: You can not make position before root.', { root: node } );
		}

		return this.createFromParentAndOffset( node.parent, node.getIndex() );
	}

	/**
	 * Creates a new position from the parent element and the offset in that element.
	 *
	 * @param {engine.model.Element|engine.model.DocumentFragment} parent Position's parent element or
	 * document fragment.
	 * @param {Number} offset Position's offset.
	 * @returns {engine.model.Position}
	 */
	static createFromParentAndOffset( parent, offset ) {
		if ( !( parent instanceof Element || parent instanceof DocumentFragment ) ) {
			/**
			 * Position parent have to be a model element or model document fragment.
			 *
			 * @error position-parent-incorrect
			 */
			throw new CKEditorError( 'position-parent-incorrect: Position parent have to be a model element or model document fragment.' );
		}

		const path = parent.getPath();

		path.push( offset );

		return new this( parent.root, path );
	}

	/**
	 * Creates and returns a new instance of Position, which is equal to passed position.
	 *
	 * @param {engine.model.Position} position Position to be cloned.
	 * @returns {engine.model.Position}
	 */
	static createFromPosition( position ) {
		return new this( position.root, position.path.slice() );
	}

	/**
	 * Creates Element object from deserilized object, ie. from parsed JSON string.
	 *
	 * @param {Object} json Deserialized JSON object.
	 * @param {engine.model.Document} doc Document on which this operation will be applied.
	 * @returns {engine.model.Position}
	 */
	static fromJSON( json, doc ) {
		if ( json.root === '$graveyard' ) {
			return new Position( doc.graveyard, json.path );
		}

		if ( !doc.hasRoot( json.root ) ) {
			/**
			 * Cannot create position for document. Root with specified name does not exist.
			 *
			 * @error position-fromjson-no-root
			 * @param {String} rootName
			 */
			throw new CKEditorError(
				'position-fromjson-no-root: Cannot create position for document. Root with specified name does not exist.',
				{ rootName: json.root }
			);
		}

		return new Position( doc.getRoot( json.root ), json.path );
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
	 * @param {engine.model.Position} source Beginning of the moved range.
	 * @param {engine.model.Position} target Position where the range is moved.
	 * @returns {engine.model.Position} Combined position.
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
 * A flag indicating whether this position is `'before'` or `'after'` or `'same'` as given position.
 * If positions are in different roots `'different'` flag is returned.
 *
 * @typedef {String} engine.model.PositionRelation
 */
