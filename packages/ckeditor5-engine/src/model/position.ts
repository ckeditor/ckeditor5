/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/position
 */

import TypeCheckable from './typecheckable';
import TreeWalker, { type TreeWalkerOptions, type TreeWalkerValue } from './treewalker';

import type Document from './document';
import type DocumentFragment from './documentfragment';
import type Element from './element';
import type InsertOperation from './operation/insertoperation';
import type Item from './item';
import type MergeOperation from './operation/mergeoperation';
import type MoveOperation from './operation/moveoperation';
import type Node from './node';
import type Operation from './operation/operation';
import type SplitOperation from './operation/splitoperation';
import type Text from './text';

import { CKEditorError, compareArrays } from '@ckeditor/ckeditor5-utils';

// To check if component is loaded more than once.
import '@ckeditor/ckeditor5-utils/src/version';

/**
 * Represents a position in the model tree.
 *
 * A position is represented by its {@link module:engine/model/position~Position#root} and
 * a {@link module:engine/model/position~Position#path} in that root.
 *
 * You can create position instances via its constructor or the `createPosition*()` factory methods of
 * {@link module:engine/model/model~Model} and {@link module:engine/model/writer~Writer}.
 *
 * **Note:** Position is based on offsets, not indexes. This means that a position between two text nodes
 * `foo` and `bar` has offset `3`, not `1`. See {@link module:engine/model/position~Position#path} for more information.
 *
 * Since a position in the model is represented by a {@link module:engine/model/position~Position#root position root} and
 * {@link module:engine/model/position~Position#path position path} it is possible to create positions placed in non-existing places.
 * This requirement is important for operational transformation algorithms.
 *
 * Also, {@link module:engine/model/operation/operation~Operation operations}
 * kept in the {@link module:engine/model/document~Document#history document history}
 * are storing positions (and ranges) which were correct when those operations were applied, but may not be correct
 * after the document has changed.
 *
 * When changes are applied to the model, it may also happen that {@link module:engine/model/position~Position#parent position parent}
 * will change even if position path has not changed. Keep in mind, that if a position leads to non-existing element,
 * {@link module:engine/model/position~Position#parent} and some other properties and methods will throw errors.
 *
 * In most cases, position with wrong path is caused by an error in code, but it is sometimes needed, as described above.
 */
export default class Position extends TypeCheckable {
	/**
	 * Root of the position path.
	 */
	public readonly root: Element | DocumentFragment;

	/**
	 * Position of the node in the tree. **Path contains offsets, not indexes.**
	 *
	 * Position can be placed before, after or in a {@link module:engine/model/node~Node node} if that node has
	 * {@link module:engine/model/node~Node#offsetSize} greater than `1`. Items in position path are
	 * {@link module:engine/model/node~Node#startOffset starting offsets} of position ancestors, starting from direct root children,
	 * down to the position offset in it's parent.
	 *
	 * ```
	 * ROOT
	 *  |- P            before: [ 0 ]         after: [ 1 ]
	 *  |- UL           before: [ 1 ]         after: [ 2 ]
	 *     |- LI        before: [ 1, 0 ]      after: [ 1, 1 ]
	 *     |  |- foo    before: [ 1, 0, 0 ]   after: [ 1, 0, 3 ]
	 *     |- LI        before: [ 1, 1 ]      after: [ 1, 2 ]
	 *        |- bar    before: [ 1, 1, 0 ]   after: [ 1, 1, 3 ]
	 * ```
	 *
	 * `foo` and `bar` are representing {@link module:engine/model/text~Text text nodes}. Since text nodes has offset size
	 * greater than `1` you can place position offset between their start and end:
	 *
	 * ```
	 * ROOT
	 *  |- P
	 *  |- UL
	 *     |- LI
	 *     |  |- f^o|o  ^ has path: [ 1, 0, 1 ]   | has path: [ 1, 0, 2 ]
	 *     |- LI
	 *        |- b^a|r  ^ has path: [ 1, 1, 1 ]   | has path: [ 1, 1, 2 ]
	 * ```
	 */
	public readonly path: ReadonlyArray<number>;

	/**
	 * Position stickiness. See {@link module:engine/model/position~PositionStickiness}.
	 */
	public stickiness: PositionStickiness;

	/**
	 * Creates a position.
	 *
	 * @param root Root of the position.
	 * @param path Position path. See {@link module:engine/model/position~Position#path}.
	 * @param stickiness Position stickiness. See {@link module:engine/model/position~PositionStickiness}.
	 */
	constructor(
		root: Element | DocumentFragment,
		path: ReadonlyArray<number>,
		stickiness: PositionStickiness = 'toNone'
	) {
		super();

		if ( !root.is( 'element' ) && !root.is( 'documentFragment' ) ) {
			/**
			 * Position root is invalid.
			 *
			 * Positions can only be anchored in elements or document fragments.
			 *
			 * @error model-position-root-invalid
			 */
			throw new CKEditorError(
				'model-position-root-invalid',
				root
			);
		}

		if ( !( path instanceof Array ) || path.length === 0 ) {
			/**
			 * Position path must be an array with at least one item.
			 *
			 * @error model-position-path-incorrect-format
			 * @param path
			 */
			throw new CKEditorError(
				'model-position-path-incorrect-format',
				root,
				{ path }
			);
		}

		// Normalize the root and path when element (not root) is passed.
		if ( root.is( 'rootElement' ) ) {
			path = path.slice();
		} else {
			path = [ ...root.getPath(), ...path ];
			root = root.root as any;
		}

		this.root = root;
		this.path = path;
		this.stickiness = stickiness;
	}

	/**
	 * Offset at which this position is located in its {@link module:engine/model/position~Position#parent parent}. It is equal
	 * to the last item in position {@link module:engine/model/position~Position#path path}.
	 *
	 * @type {Number}
	 */
	public get offset(): number {
		return this.path[ this.path.length - 1 ];
	}

	public set offset( newOffset: number ) {
		( this.path as Array<number> )[ this.path.length - 1 ] = newOffset;
	}

	/**
	 * Parent element of this position.
	 *
	 * Keep in mind that `parent` value is calculated when the property is accessed.
	 * If {@link module:engine/model/position~Position#path position path}
	 * leads to a non-existing element, `parent` property will throw error.
	 *
	 * Also it is a good idea to cache `parent` property if it is used frequently in an algorithm (i.e. in a long loop).
	 */
	public get parent(): Element | DocumentFragment {
		let parent: any = this.root;

		for ( let i = 0; i < this.path.length - 1; i++ ) {
			parent = parent.getChild( parent.offsetToIndex( this.path[ i ] ) );

			if ( !parent ) {
				/**
				 * The position's path is incorrect. This means that a position does not point to
				 * a correct place in the tree and hence, some of its methods and getters cannot work correctly.
				 *
				 * **Note**: Unlike DOM and view positions, in the model, the
				 * {@link module:engine/model/position~Position#parent position's parent} is always an element or a document fragment.
				 * The last offset in the {@link module:engine/model/position~Position#path position's path} is the point in this element
				 * where this position points.
				 *
				 * Read more about model positions and offsets in
				 * the {@glink framework/architecture/editing-engine#indexes-and-offsets Editing engine architecture} guide.
				 *
				 * @error model-position-path-incorrect
				 * @param position The incorrect position.
				 */
				throw new CKEditorError( 'model-position-path-incorrect', this, { position: this } );
			}
		}

		if ( parent.is( '$text' ) ) {
			throw new CKEditorError( 'model-position-path-incorrect', this, { position: this } );
		}

		return parent;
	}

	/**
	 * Position {@link module:engine/model/position~Position#offset offset} converted to an index in position's parent node. It is
	 * equal to the {@link module:engine/model/node~Node#index index} of a node after this position. If position is placed
	 * in text node, position index is equal to the index of that text node.
	 */
	public get index(): number {
		return this.parent.offsetToIndex( this.offset );
	}

	/**
	 * Returns {@link module:engine/model/text~Text text node} instance in which this position is placed or `null` if this
	 * position is not in a text node.
	 */
	public get textNode(): Text | null {
		return getTextNodeAtPosition( this, this.parent );
	}

	/**
	 * Node directly after this position or `null` if this position is in text node.
	 */
	public get nodeAfter(): Node | null {
		// Cache the parent and reuse for performance reasons. See #6579 and #6582.
		const parent = this.parent;

		return getNodeAfterPosition( this, parent, getTextNodeAtPosition( this, parent ) );
	}

	/**
	 * Node directly before this position or `null` if this position is in text node.
	 */
	public get nodeBefore(): Node | null {
		// Cache the parent and reuse for performance reasons. See #6579 and #6582.
		const parent = this.parent;

		return getNodeBeforePosition( this, parent, getTextNodeAtPosition( this, parent ) );
	}

	/**
	 * Is `true` if position is at the beginning of its {@link module:engine/model/position~Position#parent parent}, `false` otherwise.
	 */
	public get isAtStart(): boolean {
		return this.offset === 0;
	}

	/**
	 * Is `true` if position is at the end of its {@link module:engine/model/position~Position#parent parent}, `false` otherwise.
	 */
	public get isAtEnd(): boolean {
		return this.offset == this.parent.maxOffset;
	}

	/**
	 * Checks whether this position is before or after given position.
	 *
	 * This method is safe to use it on non-existing positions (for example during operational transformation).
	 */
	public compareWith( otherPosition: Position ): PositionRelation {
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
				return this.path[ result ] < otherPosition.path[ result ] ? 'before' : 'after';
		}
	}

	/**
	 * Gets the farthest position which matches the callback using
	 * {@link module:engine/model/treewalker~TreeWalker TreeWalker}.
	 *
	 * For example:
	 *
	 * ```ts
	 * getLastMatchingPosition( value => value.type == 'text' );
	 * // <paragraph>[]foo</paragraph> -> <paragraph>foo[]</paragraph>
	 *
	 * getLastMatchingPosition( value => value.type == 'text', { direction: 'backward' } );
	 * // <paragraph>foo[]</paragraph> -> <paragraph>[]foo</paragraph>
	 *
	 * getLastMatchingPosition( value => false );
	 * // Do not move the position.
	 * ```
	 *
	 * @param skip Callback function. Gets {@link module:engine/model/treewalker~TreeWalkerValue} and should
	 * return `true` if the value should be skipped or `false` if not.
	 * @param options Object with configuration options. See {@link module:engine/model/treewalker~TreeWalker}.
	 *
	 * @returns The position after the last item which matches the `skip` callback test.
	 */
	public getLastMatchingPosition(
		skip: ( value: TreeWalkerValue ) => boolean,
		options: TreeWalkerOptions = {}
	): Position {
		options.startPosition = this;

		const treeWalker = new TreeWalker( options );
		treeWalker.skip( skip );

		return treeWalker.position;
	}

	/**
	 * Returns a path to this position's parent. Parent path is equal to position {@link module:engine/model/position~Position#path path}
	 * but without the last item.
	 *
	 * This method is safe to use it on non-existing positions (for example during operational transformation).
	 *
	 * @returns Path to the parent.
	 */
	public getParentPath(): Array<number> {
		return this.path.slice( 0, -1 );
	}

	/**
	 * Returns ancestors array of this position, that is this position's parent and its ancestors.
	 *
	 * @returns Array with ancestors.
	 */
	public getAncestors(): Array<Element | DocumentFragment> {
		const parent = this.parent;

		if ( parent.is( 'documentFragment' ) ) {
			return [ parent ];
		} else {
			return parent.getAncestors( { includeSelf: true } ) as any;
		}
	}

	/**
	 * Returns the parent element of the given name. Returns null if the position is not inside the desired parent.
	 *
	 * @param parentName The name of the parent element to find.
	 */
	public findAncestor( parentName: string ): Element | null {
		const parent = this.parent;

		if ( parent.is( 'element' ) ) {
			return parent.findAncestor( parentName, { includeSelf: true } );
		}

		return null;
	}

	/**
	 * Returns the slice of two position {@link #path paths} which is identical. The {@link #root roots}
	 * of these two paths must be identical.
	 *
	 * This method is safe to use it on non-existing positions (for example during operational transformation).
	 *
	 * @param position The second position.
	 * @returns The common path.
	 */
	public getCommonPath( position: Position ): Array<number> {
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
	 * @param position The second position.
	 */
	public getCommonAncestor( position: Position ): Element | DocumentFragment | null {
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
	 * This method is safe to use it on non-existing positions (for example during operational transformation).
	 *
	 * @param shift Offset shift. Can be a negative value.
	 * @returns Shifted position.
	 */
	public getShiftedBy( shift: number ): Position {
		const shifted = this.clone();

		const offset = shifted.offset + shift;
		shifted.offset = offset < 0 ? 0 : offset;

		return shifted;
	}

	/**
	 * Checks whether this position is after given position.
	 *
	 * This method is safe to use it on non-existing positions (for example during operational transformation).
	 *
	 * @see module:engine/model/position~Position#isBefore
	 * @param  otherPosition Position to compare with.
	 * @returns True if this position is after given position.
	 */
	public isAfter( otherPosition: Position ): boolean {
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
	 * ```ts
	 * if ( a.isBefore( b ) && c.isAfter( d ) ) {
	 * 	// do A.
	 * } else {
	 * 	// do B.
	 * }
	 * ```
	 *
	 * or, if you have only one if-branch:
	 *
	 * ```ts
	 * if ( !( a.isBefore( b ) && c.isAfter( d ) ) {
	 * 	// do B.
	 * }
	 * ```
	 *
	 * rather than:
	 *
	 * ```ts
	 * if ( !a.isBefore( b ) || && !c.isAfter( d ) ) {
	 * 	// do B.
	 * } else {
	 * 	// do A.
	 * }
	 * ```
	 *
	 * This method is safe to use it on non-existing positions (for example during operational transformation).
	 *
	 * @param otherPosition Position to compare with.
	 * @returns True if this position is before given position.
	 */
	public isBefore( otherPosition: Position ): boolean {
		return this.compareWith( otherPosition ) == 'before';
	}

	/**
	 * Checks whether this position is equal to given position.
	 *
	 * This method is safe to use it on non-existing positions (for example during operational transformation).
	 *
	 * @param otherPosition Position to compare with.
	 * @returns True if positions are same.
	 */
	public isEqual( otherPosition: Position ): boolean {
		return this.compareWith( otherPosition ) == 'same';
	}

	/**
	 * Checks whether this position is touching given position. Positions touch when there are no text nodes
	 * or empty nodes in a range between them. Technically, those positions are not equal but in many cases
	 * they are very similar or even indistinguishable.
	 *
	 * @param otherPosition Position to compare with.
	 * @returns True if positions touch.
	 */
	public isTouching( otherPosition: Position ): boolean {
		if ( this.root !== otherPosition.root ) {
			return false;
		}

		const commonLevel = Math.min( this.path.length, otherPosition.path.length );

		for ( let level = 0; level < commonLevel; level++ ) {
			const diff = this.path[ level ] - otherPosition.path[ level ];

			// Positions are spread by a node, so they are not touching.
			if ( diff < -1 || diff > 1 ) {
				return false;
			} else if ( diff === 1 ) {
				// `otherPosition` is on the left.
				// `this` is on the right.
				return checkTouchingBranch( otherPosition, this, level );
			} else if ( diff === -1 ) {
				// `this` is on the left.
				// `otherPosition` is on the right.
				return checkTouchingBranch( this, otherPosition, level );
			}
			// `diff === 0`.
			// Positions are inside the same element on this level, compare deeper.
		}

		// If we ended up here, it means that positions paths have the same beginning.
		// If the paths have the same length, then it means that they are identical, so the positions are same.
		if ( this.path.length === otherPosition.path.length ) {
			return true;
		}
		// If positions have different length of paths, then the common part is the same.
		// In this case, the "shorter" position is on the left, the "longer" position is on the right.
		//
		// If the positions are touching, the "longer" position must have only zeroes. For example:
		// [ 1, 2 ] vs [ 1, 2, 0 ]
		// [ 1, 2 ] vs [ 1, 2, 0, 0, 0 ]
		else if ( this.path.length > otherPosition.path.length ) {
			return checkOnlyZeroes( this.path, commonLevel );
		} else {
			return checkOnlyZeroes( otherPosition.path, commonLevel );
		}
	}

	/**
	 * Checks if two positions are in the same parent.
	 *
	 * This method is safe to use it on non-existing positions (for example during operational transformation).
	 *
	 * @param position Position to compare with.
	 * @returns `true` if positions have the same parent, `false` otherwise.
	 */
	public hasSameParentAs( position: Position ): boolean {
		if ( this.root !== position.root ) {
			return false;
		}

		const thisParentPath = this.getParentPath();
		const posParentPath = position.getParentPath();

		return compareArrays( thisParentPath, posParentPath ) == 'same';
	}

	/**
	 * Returns a copy of this position that is transformed by given `operation`.
	 *
	 * The new position's parameters are updated accordingly to the effect of the `operation`.
	 *
	 * For example, if `n` nodes are inserted before the position, the returned position {@link ~Position#offset} will be
	 * increased by `n`. If the position was in a merged element, it will be accordingly moved to the new element, etc.
	 *
	 * This method is safe to use it on non-existing positions (for example during operational transformation).
	 *
	 * @param operation Operation to transform by.
	 * @returns Transformed position.
	 */
	public getTransformedByOperation( operation: Operation ): Position {
		let result;

		switch ( operation.type ) {
			case 'insert':
				result = this._getTransformedByInsertOperation( operation as InsertOperation );
				break;
			case 'move':
			case 'remove':
			case 'reinsert':
				result = this._getTransformedByMoveOperation( operation as MoveOperation );
				break;
			case 'split':
				result = this._getTransformedBySplitOperation( operation as SplitOperation );
				break;
			case 'merge':
				result = this._getTransformedByMergeOperation( operation as MergeOperation );
				break;
			default:
				result = Position._createAt( this );
				break;
		}

		return result;
	}

	/**
	 * Returns a copy of this position transformed by an insert operation.
	 *
	 * @internal
	 */
	public _getTransformedByInsertOperation( operation: InsertOperation ): Position {
		return this._getTransformedByInsertion( operation.position, operation.howMany );
	}

	/**
	 * Returns a copy of this position transformed by a move operation.
	 *
	 * @internal
	 */
	public _getTransformedByMoveOperation( operation: MoveOperation ): Position {
		return this._getTransformedByMove( operation.sourcePosition, operation.targetPosition, operation.howMany );
	}

	/**
	 * Returns a copy of this position transformed by a split operation.
	 *
	 * @internal
	 */
	public _getTransformedBySplitOperation( operation: SplitOperation ): Position {
		const movedRange = operation.movedRange;

		const isContained = movedRange.containsPosition( this ) ||
			( movedRange.start.isEqual( this ) && this.stickiness == 'toNext' );

		if ( isContained ) {
			return this._getCombined( operation.splitPosition, operation.moveTargetPosition );
		} else {
			if ( operation.graveyardPosition ) {
				return this._getTransformedByMove( operation.graveyardPosition, operation.insertionPosition, 1 );
			} else {
				return this._getTransformedByInsertion( operation.insertionPosition, 1 );
			}
		}
	}

	/**
	 * Returns a copy of this position transformed by merge operation.
	 *
	 * @internal
	 */
	public _getTransformedByMergeOperation( operation: MergeOperation ): Position {
		const movedRange = operation.movedRange;
		const isContained = movedRange.containsPosition( this ) || movedRange.start.isEqual( this );

		let pos;

		if ( isContained ) {
			pos = this._getCombined( operation.sourcePosition, operation.targetPosition );

			if ( operation.sourcePosition.isBefore( operation.targetPosition ) ) {
				// Above happens during OT when the merged element is moved before the merged-to element.
				pos = pos._getTransformedByDeletion( operation.deletionPosition, 1 )!;
			}
		} else if ( this.isEqual( operation.deletionPosition ) ) {
			pos = Position._createAt( operation.deletionPosition );
		} else {
			pos = this._getTransformedByMove( operation.deletionPosition, operation.graveyardPosition, 1 );
		}

		return pos;
	}

	/**
	 * Returns a copy of this position that is updated by removing `howMany` nodes starting from `deletePosition`.
	 * It may happen that this position is in a removed node. If that is the case, `null` is returned instead.
	 *
	 * @internal
	 * @param deletePosition Position before the first removed node.
	 * @param howMany How many nodes are removed.
	 * @returns Transformed position or `null`.
	 */
	public _getTransformedByDeletion( deletePosition: Position, howMany: number ): Position | null {
		const transformed = Position._createAt( this );

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
					( transformed.path as Array<number> )[ i ] -= howMany;
				}
			}
		}

		return transformed;
	}

	/**
	 * Returns a copy of this position that is updated by inserting `howMany` nodes at `insertPosition`.
	 *
	 * @internal
	 * @param insertPosition Position where nodes are inserted.
	 * @param howMany How many nodes are inserted.
	 * @returns Transformed position.
	 */
	public _getTransformedByInsertion( insertPosition: Position, howMany: number ): Position {
		const transformed = Position._createAt( this );

		// This position can't be affected if insertion was in a different root.
		if ( this.root != insertPosition.root ) {
			return transformed;
		}

		if ( compareArrays( insertPosition.getParentPath(), this.getParentPath() ) == 'same' ) {
			// If nodes are inserted in the node that is pointed by this position...
			if ( insertPosition.offset < this.offset || ( insertPosition.offset == this.offset && this.stickiness != 'toPrevious' ) ) {
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
				( transformed.path as Array<number> )[ i ] += howMany;
			}
		}

		return transformed;
	}

	/**
	 * Returns a copy of this position that is updated by moving `howMany` nodes from `sourcePosition` to `targetPosition`.
	 *
	 * @internal
	 * @param sourcePosition Position before the first element to move.
	 * @param targetPosition Position where moved elements will be inserted.
	 * @param howMany How many consecutive nodes to move, starting from `sourcePosition`.
	 * @returns Transformed position.
	 */
	public _getTransformedByMove( sourcePosition: Position, targetPosition: Position, howMany: number ): Position {
		// Update target position, as it could be affected by nodes removal.
		targetPosition = targetPosition._getTransformedByDeletion( sourcePosition, howMany )!;

		if ( sourcePosition.isEqual( targetPosition ) ) {
			// If `targetPosition` is equal to `sourcePosition` this isn't really any move. Just return position as it is.
			return Position._createAt( this );
		}

		// Moving a range removes nodes from their original position. We acknowledge this by proper transformation.
		const transformed = this._getTransformedByDeletion( sourcePosition, howMany );

		const isMoved = transformed === null ||
			( sourcePosition.isEqual( this ) && this.stickiness == 'toNext' ) ||
			( sourcePosition.getShiftedBy( howMany ).isEqual( this ) && this.stickiness == 'toPrevious' );

		if ( isMoved ) {
			// This position is inside moved range (or sticks to it).
			// In this case, we calculate a combination of this position, move source position and target position.
			return this._getCombined( sourcePosition, targetPosition );
		} else {
			// This position is not inside a removed range.
			//
			// In next step, we simply reflect inserting `howMany` nodes, which might further affect the position.
			return transformed._getTransformedByInsertion( targetPosition, howMany );
		}
	}

	/**
	 * Returns a new position that is a combination of this position and given positions.
	 *
	 * The combined position is a copy of this position transformed by moving a range starting at `source` position
	 * to the `target` position. It is expected that this position is inside the moved range.
	 *
	 * Example:
	 *
	 * ```ts
	 * let original = model.createPositionFromPath( root, [ 2, 3, 1 ] );
	 * let source = model.createPositionFromPath( root, [ 2, 2 ] );
	 * let target = model.createPositionFromPath( otherRoot, [ 1, 1, 3 ] );
	 * original._getCombined( source, target ); // path is [ 1, 1, 4, 1 ], root is `otherRoot`
	 * ```
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
	 * @internal
	 * @param source Beginning of the moved range.
	 * @param target Position where the range is moved.
	 * @returns Combined position.
	 */
	public _getCombined( source: Position, target: Position ): Position {
		const i = source.path.length - 1;

		// The first part of a path to combined position is a path to the place where nodes were moved.
		const combined = Position._createAt( target );
		combined.stickiness = this.stickiness;

		// Then we have to update the rest of the path.

		// Fix the offset because this position might be after `from` position and we have to reflect that.
		combined.offset = combined.offset + this.path[ i ] - source.offset;

		// Then, add the rest of the path.
		// If this position is at the same level as `from` position nothing will get added.
		( combined as any ).path = [ ...combined.path, ...this.path.slice( i + 1 ) ];

		return combined;
	}

	/**
	 * @inheritDoc
	 */
	public toJSON(): unknown {
		return {
			root: this.root.toJSON(),
			path: Array.from( this.path ),
			stickiness: this.stickiness
		};
	}

	/**
	 * Returns a new position that is equal to current position.
	 */
	public clone(): this {
		return new ( this.constructor as any )( this.root, this.path, this.stickiness );
	}

	/**
	 * Creates position at the given location. The location can be specified as:
	 *
	 * * a {@link module:engine/model/position~Position position},
	 * * parent element and offset (offset defaults to `0`),
	 * * parent element and `'end'` (sets position at the end of that element),
	 * * {@link module:engine/model/item~Item model item} and `'before'` or `'after'` (sets position before or after given model item).
	 *
	 * This method is a shortcut to other factory methods such as:
	 *
	 * * {@link module:engine/model/position~Position._createBefore},
	 * * {@link module:engine/model/position~Position._createAfter}.
	 *
	 * @internal
	 * @param offset Offset or one of the flags. Used only when the first parameter is a {@link module:engine/model/item~Item model item}.
	 * @param stickiness Position stickiness. Used only when the first parameter is a {@link module:engine/model/item~Item model item}.
	 */
	public static _createAt(
		itemOrPosition: Item | Position | DocumentFragment,
		offset?: PositionOffset,
		stickiness: PositionStickiness = 'toNone'
	): Position {
		if ( itemOrPosition instanceof Position ) {
			return new Position( itemOrPosition.root, itemOrPosition.path, itemOrPosition.stickiness );
		} else {
			const node = itemOrPosition;

			if ( offset == 'end' ) {
				offset = ( node as any ).maxOffset;
			} else if ( offset == 'before' ) {
				return this._createBefore( node, stickiness );
			} else if ( offset == 'after' ) {
				return this._createAfter( node, stickiness );
			} else if ( offset !== 0 && !offset ) {
				/**
				 * {@link module:engine/model/model~Model#createPositionAt `Model#createPositionAt()`}
				 * requires the offset to be specified when the first parameter is a model item.
				 *
				 * @error model-createpositionat-offset-required
				 */
				throw new CKEditorError( 'model-createpositionat-offset-required', [ this, itemOrPosition ] );
			}

			if ( !node.is( 'element' ) && !node.is( 'documentFragment' ) ) {
				/**
				 * Position parent have to be a model element or model document fragment.
				 *
				 * @error model-position-parent-incorrect
				 */
				throw new CKEditorError(
					'model-position-parent-incorrect',
					[ this, itemOrPosition ]
				);
			}

			const path = node.getPath();

			path.push( offset as any );

			return new this( node.root as any, path, stickiness );
		}
	}

	/**
	 * Creates a new position, after given {@link module:engine/model/item~Item model item}.
	 *
	 * @internal
	 * @param item Item after which the position should be placed.
	 * @param stickiness Position stickiness.
	 */
	public static _createAfter( item: Item | DocumentFragment, stickiness?: PositionStickiness ): Position {
		if ( !item.parent ) {
			/**
			 * You can not make a position after a root element.
			 *
			 * @error model-position-after-root
			 * @param root
			 */
			throw new CKEditorError(
				'model-position-after-root',
				[ this, item ],
				{ root: item }
			);
		}

		return this._createAt( item.parent, item.endOffset!, stickiness );
	}

	/**
	 * Creates a new position, before the given {@link module:engine/model/item~Item model item}.
	 *
	 * @internal
	 * @param item Item before which the position should be placed.
	 * @param stickiness Position stickiness.
	 */
	public static _createBefore( item: Item | DocumentFragment, stickiness?: PositionStickiness ): Position {
		if ( !item.parent ) {
			/**
			 * You can not make a position before a root element.
			 *
			 * @error model-position-before-root
			 * @param root
			 */
			throw new CKEditorError(
				'model-position-before-root',
				item,
				{ root: item }
			);
		}

		return this._createAt( item.parent, item.startOffset!, stickiness );
	}

	/**
	 * Creates a `Position` instance from given plain object (i.e. parsed JSON string).
	 *
	 * @param json Plain object to be converted to `Position`.
	 * @param doc Document object that will be position owner.
	 * @returns `Position` instance created using given plain object.
	 */
	public static fromJSON( json: any, doc: Document ): Position {
		if ( json.root === '$graveyard' ) {
			const pos = new Position( doc.graveyard, json.path );
			pos.stickiness = json.stickiness;

			return pos;
		}

		if ( !doc.getRoot( json.root ) ) {
			/**
			 * Cannot create position for document. Root with specified name does not exist.
			 *
			 * @error model-position-fromjson-no-root
			 * @param rootName
			 */
			throw new CKEditorError(
				'model-position-fromjson-no-root',
				doc,
				{ rootName: json.root }
			);
		}

		return new Position( doc.getRoot( json.root )!, json.path, json.stickiness );
	}

	// @if CK_DEBUG_ENGINE // public override toString(): string {
	// @if CK_DEBUG_ENGINE // 	return `${ this.root } [ ${ this.path.join( ', ' ) } ]`;
	// @if CK_DEBUG_ENGINE // }

	// @if CK_DEBUG_ENGINE // public log(): void {
	// @if CK_DEBUG_ENGINE // 	console.log( 'ModelPosition: ' + this );
	// @if CK_DEBUG_ENGINE // }
}

// The magic of type inference using `is` method is centralized in `TypeCheckable` class.
// Proper overload would interfere with that.
Position.prototype.is = function( type: string ): boolean {
	return type === 'position' || type === 'model:position';
};

/**
 * A flag indicating whether this position is `'before'` or `'after'` or `'same'` as given position.
 * If positions are in different roots `'different'` flag is returned.
 */
export type PositionRelation = 'before' | 'after' | 'same' | 'different';

/**
 * Offset or one of the flags.
 */
export type PositionOffset = number | 'before' | 'after' | 'end';

/**
 * Represents how position is "sticking" with neighbour nodes. Used to define how position should be transformed (moved)
 * in edge cases. Possible values: `'toNone'`, `'toNext'`, `'toPrevious'`.
 *
 * Examples:
 *
 * ```
 * Insert. Position is at | and nodes are inserted at the same position, marked as ^:
 *
 * - sticks to none:           <p>f^|oo</p>  ->  <p>fbar|oo</p>
 * - sticks to next node:      <p>f^|oo</p>  ->  <p>fbar|oo</p>
 * - sticks to previous node:  <p>f|^oo</p>  ->  <p>f|baroo</p>
 * ```
 *
 *
 * Move. Position is at | and range [oo] is moved to position ^:
 *
 * ```
 * - sticks to none:           <p>f|[oo]</p><p>b^ar</p>  ->  <p>f|</p><p>booar</p>
 * - sticks to none:           <p>f[oo]|</p><p>b^ar</p>  ->  <p>f|</p><p>booar</p>
 *
 * - sticks to next node:      <p>f|[oo]</p><p>b^ar</p>  ->  <p>f</p><p>b|ooar</p>
 * - sticks to next node:      <p>f[oo]|</p><p>b^ar</p>  ->  <p>f|</p><p>booar</p>
 *
 * - sticks to previous node:  <p>f|[oo]</p><p>b^ar</p>  ->  <p>f|</p><p>booar</p>
 * - sticks to previous node:  <p>f[oo]|</p><p>b^ar</p>  ->  <p>f</p><p>boo|ar</p>
 * ```
 */
export type PositionStickiness = 'toNone' | 'toNext' | 'toPrevious';

/**
 * Returns a text node at the given position.
 *
 * This is a helper function optimized to reuse the position parent instance for performance reasons.
 *
 * Normally, you should use {@link module:engine/model/position~Position#textNode `Position#textNode`}.
 * If you start hitting performance issues with {@link module:engine/model/position~Position#parent `Position#parent`}
 * check if your algorithm does not access it multiple times (which can happen directly or indirectly via other position properties).
 *
 * See https://github.com/ckeditor/ckeditor5/issues/6579.
 *
 * See also:
 *
 * * {@link module:engine/model/position~getNodeAfterPosition}
 * * {@link module:engine/model/position~getNodeBeforePosition}
 *
 * @param positionParent The parent of the given position.
 */
export function getTextNodeAtPosition( position: Position, positionParent: Element | DocumentFragment ): Text | null {
	const node = positionParent.getChild( positionParent.offsetToIndex( position.offset ) );

	if ( node && node.is( '$text' ) && node.startOffset! < position.offset ) {
		return node;
	}

	return null;
}

/**
 * Returns the node after the given position.
 *
 * This is a helper function optimized to reuse the position parent instance and the calculation of the text node at the
 * specific position for performance reasons.
 *
 * Normally, you should use {@link module:engine/model/position~Position#nodeAfter `Position#nodeAfter`}.
 * If you start hitting performance issues with {@link module:engine/model/position~Position#parent `Position#parent`} and/or
 * {@link module:engine/model/position~Position#textNode `Position#textNode`}
 * check if your algorithm does not access those properties multiple times
 * (which can happen directly or indirectly via other position properties).
 *
 * See https://github.com/ckeditor/ckeditor5/issues/6579 and https://github.com/ckeditor/ckeditor5/issues/6582.
 *
 * See also:
 *
 * * {@link module:engine/model/position~getTextNodeAtPosition}
 * * {@link module:engine/model/position~getNodeBeforePosition}
 *
 * @param positionParent The parent of the given position.
 * @param textNode Text node at the given position.
 */
export function getNodeAfterPosition(
	position: Position,
	positionParent: Element | DocumentFragment,
	textNode: Text | null
): Node | null {
	if ( textNode !== null ) {
		return null;
	}

	return positionParent.getChild( positionParent.offsetToIndex( position.offset ) );
}

/**
 * Returns the node before the given position.
 *
 * Refer to {@link module:engine/model/position~getNodeBeforePosition} for documentation on when to use this util method.
 *
 * See also:
 *
 * * {@link module:engine/model/position~getTextNodeAtPosition}
 * * {@link module:engine/model/position~getNodeAfterPosition}
 *
 * @param positionParent The parent of the given position.
 * @param textNode Text node at the given position.
 */
export function getNodeBeforePosition(
	position: Position,
	positionParent: Element | DocumentFragment,
	textNode: Text | null
): Node | null {
	if ( textNode !== null ) {
		return null;
	}

	return positionParent.getChild( positionParent.offsetToIndex( position.offset ) - 1 );
}

/**
 * This is a helper function for `Position#isTouching()`.
 *
 * It checks whether to given positions are touching, considering that they have the same root and paths
 * until given level, and at given level they differ by 1 (so they are branching at `level` point).
 *
 * The exact requirements for touching positions are described in `Position#isTouching()` and also
 * in the body of this function.
 *
 * @param left Position "on the left" (it is before `right`).
 * @param right Position "on the right" (it is after `left`).
 * @param level Level on which the positions are different.
 */
function checkTouchingBranch( left: Position, right: Position, level: number ): boolean {
	if ( level + 1 === left.path.length ) {
		// Left position does not have any more entries after the point where the positions differ.
		// [ 2 ] vs [ 3 ]
		// [ 2 ] vs [ 3, 0, 0 ]
		// The positions are spread by node at [ 2 ].
		return false;
	}

	if ( !checkOnlyZeroes( right.path, level + 1 ) ) {
		// Right position does not have only zeroes, so we have situation like:
		// [ 2, maxOffset ] vs [ 3, 1 ]
		// [ 2, maxOffset ] vs [ 3, 1, 0, 0 ]
		// The positions are spread by node at [ 3, 0 ].
		return false;
	}

	if ( !checkOnlyMaxOffset( left, level + 1 ) ) {
		// Left position does not have only max offsets, so we have situation like:
		// [ 2, 4 ] vs [ 3 ]
		// [ 2, 4 ] vs [ 3, 0, 0 ]
		// The positions are spread by node at [ 2, 5 ].
		return false;
	}

	// Left position has only max offsets and right position has only zeroes or nothing.
	// [ 2, maxOffset ] vs [ 3 ]
	// [ 2, maxOffset, maxOffset ] vs [ 3, 0 ]
	// There are not elements between positions. The positions are touching.
	return true;
}

/**
 * Checks whether for given array, starting from given index until the end of the array, all items are `0`s.
 *
 * This is a helper function for `Position#isTouching()`.
 */
function checkOnlyZeroes( arr: ReadonlyArray<number>, idx: number ): boolean {
	while ( idx < arr.length ) {
		if ( arr[ idx ] !== 0 ) {
			return false;
		}

		idx++;
	}

	return true;
}

/**
 * Checks whether for given position, starting from given path level, whether the position is at the end of
 * its parent and whether each element on the path to the position is also at at the end of its parent.
 *
 * This is a helper function for `Position#isTouching()`.
 */
function checkOnlyMaxOffset( pos: Position, level: number ): boolean {
	let parent = pos.parent;
	let idx = pos.path.length - 1;
	let add = 0;

	while ( idx >= level ) {
		if ( pos.path[ idx ] + add !== parent.maxOffset ) {
			return false;
		}

		// After the first check, we "go up", and check whether the position's parent-parent is the last element.
		// However, we need to add 1 to the value in the path to "simulate" moving the path after the parent.
		// It happens just once.
		add = 1;
		idx--;
		parent = parent.parent!;
	}

	return true;
}
