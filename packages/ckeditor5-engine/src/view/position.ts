/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/position
 */

import TypeCheckable from './typecheckable';

import { CKEditorError, compareArrays } from '@ckeditor/ckeditor5-utils';

import EditableElement from './editableelement';

// To check if component is loaded more than once.
import '@ckeditor/ckeditor5-utils/src/version';

import type DocumentFragment from './documentfragment';
import type Element from './element';
import type Item from './item';
import type Node from './node';
import { default as TreeWalker, type TreeWalkerValue, type TreeWalkerOptions } from './treewalker';

/**
 * Position in the view tree. Position is represented by its parent node and an offset in this parent.
 *
 * In order to create a new position instance use the `createPosition*()` factory methods available in:
 *
 * * {@link module:engine/view/view~View}
 * * {@link module:engine/view/downcastwriter~DowncastWriter}
 * * {@link module:engine/view/upcastwriter~UpcastWriter}
 */
export default class Position extends TypeCheckable {
	/**
	 * Position parent.
	 */
	public readonly parent: Node | DocumentFragment;

	/**
	 * Position offset.
	 */
	public offset: number;

	/**
	 * Creates a position.
	 *
	 * @param parent Position parent.
	 * @param offset Position offset.
	 */
	constructor( parent: Node | DocumentFragment, offset: number ) {
		super();

		this.parent = parent;
		this.offset = offset;
	}

	/**
	 * Node directly after the position. Equals `null` when there is no node after position or position is located
	 * inside text node.
	 */
	public get nodeAfter(): Node | null {
		if ( this.parent.is( '$text' ) ) {
			return null;
		}

		return ( this.parent as Element ).getChild( this.offset ) || null;
	}

	/**
	 * Node directly before the position. Equals `null` when there is no node before position or position is located
	 * inside text node.
	 */
	public get nodeBefore(): Node | null {
		if ( this.parent.is( '$text' ) ) {
			return null;
		}

		return ( this.parent as Element ).getChild( this.offset - 1 ) || null;
	}

	/**
	 * Is `true` if position is at the beginning of its {@link module:engine/view/position~Position#parent parent}, `false` otherwise.
	 */
	public get isAtStart(): boolean {
		return this.offset === 0;
	}

	/**
	 * Is `true` if position is at the end of its {@link module:engine/view/position~Position#parent parent}, `false` otherwise.
	 */
	public get isAtEnd(): boolean {
		const endOffset = this.parent.is( '$text' ) ? this.parent.data.length : ( this.parent as any ).childCount;

		return this.offset === endOffset;
	}

	/**
	 * Position's root, that is the root of the position's parent element.
	 */
	public get root(): Node | DocumentFragment {
		return this.parent.root;
	}

	/**
	 * {@link module:engine/view/editableelement~EditableElement EditableElement} instance that contains this position, or `null` if
	 * position is not inside an editable element.
	 */
	public get editableElement(): EditableElement | null {
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
	 * @param shift How position offset should get changed. Accepts negative values.
	 * @returns Shifted position.
	 */
	public getShiftedBy( shift: number ): Position {
		const shifted = Position._createAt( this );

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
	 * ```ts
	 * getLastMatchingPosition( value => value.type == 'text' ); // <p>{}foo</p> -> <p>foo[]</p>
	 * getLastMatchingPosition( value => value.type == 'text', { direction: 'backward' } ); // <p>foo[]</p> -> <p>{}foo</p>
	 * getLastMatchingPosition( value => false ); // Do not move the position.
	 * ```
	 *
	 * @param skip Callback function. Gets {@link module:engine/view/treewalker~TreeWalkerValue} and should
	 * return `true` if the value should be skipped or `false` if not.
	 * @param options Object with configuration options. See {@link module:engine/view/treewalker~TreeWalker}.
	 * @returns The position after the last item which matches the `skip` callback test.
	 */
	public getLastMatchingPosition( skip: ( value: TreeWalkerValue ) => boolean, options: TreeWalkerOptions = {} ): Position {
		options.startPosition = this;

		const treeWalker = new TreeWalker( options );
		treeWalker.skip( skip );

		return treeWalker.position;
	}

	/**
	 * Returns ancestors array of this position, that is this position's parent and it's ancestors.
	 *
	 * @returns Array with ancestors.
	 */
	public getAncestors(): Array<Node | DocumentFragment> {
		if ( this.parent.is( 'documentFragment' ) ) {
			return [ this.parent ];
		} else {
			return this.parent.getAncestors( { includeSelf: true } );
		}
	}

	/**
	 * Returns a {@link module:engine/view/node~Node} or {@link module:engine/view/documentfragment~DocumentFragment}
	 * which is a common ancestor of both positions.
	 */
	public getCommonAncestor( position: Position ): Node | DocumentFragment | null {
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
	 * @param otherPosition Position to compare with.
	 * @returns True if positions are same.
	 */
	public isEqual( otherPosition: Position ): boolean {
		return ( this.parent == otherPosition.parent && this.offset == otherPosition.offset );
	}

	/**
	 * Checks whether this position is located before given position. When method returns `false` it does not mean that
	 * this position is after give one. Two positions may be located inside separate roots and in that situation this
	 * method will still return `false`.
	 *
	 * @see module:engine/view/position~Position#isAfter
	 * @see module:engine/view/position~Position#compareWith
	 * @param otherPosition Position to compare with.
	 * @returns Returns `true` if this position is before given position.
	 */
	public isBefore( otherPosition: Position ): boolean {
		return this.compareWith( otherPosition ) == 'before';
	}

	/**
	 * Checks whether this position is located after given position. When method returns `false` it does not mean that
	 * this position is before give one. Two positions may be located inside separate roots and in that situation this
	 * method will still return `false`.
	 *
	 * @see module:engine/view/position~Position#isBefore
	 * @see module:engine/view/position~Position#compareWith
	 * @param otherPosition Position to compare with.
	 * @returns Returns `true` if this position is after given position.
	 */
	public isAfter( otherPosition: Position ): boolean {
		return this.compareWith( otherPosition ) == 'after';
	}

	/**
	 * Checks whether this position is before, after or in same position that other position. Two positions may be also
	 * different when they are located in separate roots.
	 *
	 * @param otherPosition Position to compare with.
	 */
	public compareWith( otherPosition: Position ): PositionRelation {
		if ( this.root !== otherPosition.root ) {
			return 'different';
		}

		if ( this.isEqual( otherPosition ) ) {
			return 'same';
		}

		// Get path from root to position's parent element.
		const thisPath = this.parent.is( 'node' ) ? this.parent.getPath() : [];
		const otherPath = otherPosition.parent.is( 'node' ) ? otherPosition.parent.getPath() : [];

		// Add the positions' offsets to the parents offsets.
		thisPath.push( this.offset );
		otherPath.push( otherPosition.offset );

		// Compare both path arrays to find common ancestor.
		const result = compareArrays( thisPath, otherPath );

		switch ( result ) {
			case 'prefix':
				return 'before';

			case 'extension':
				return 'after';

			/* istanbul ignore next */
			case 'same':
				// Already covered by `this.isEqual` above. Added so TypeScript can infer `result` as number in `default` case.
				return 'same';

			default:
				return thisPath[ result ] < otherPath[ result ] ? 'before' : 'after';
		}
	}

	/**
	 * Creates a {@link module:engine/view/treewalker~TreeWalker TreeWalker} instance with this positions as a start position.
	 *
	 * @param options Object with configuration options. See {@link module:engine/view/treewalker~TreeWalker}
	 */
	public getWalker( options: TreeWalkerOptions = {} ): TreeWalker {
		options.startPosition = this;

		return new TreeWalker( options );
	}

	/**
	 * Clones this position.
	 */
	public clone(): Position {
		return new Position( this.parent, this.offset );
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
	 * * {@link module:engine/view/position~Position._createBefore},
	 * * {@link module:engine/view/position~Position._createAfter}.
	 *
	 * @internal
	 * @param offset Offset or one of the flags. Used only when first parameter is a {@link module:engine/view/item~Item view item}.
	 */
	public static _createAt( itemOrPosition: Item | Position, offset?: PositionOffset ): Position {
		if ( itemOrPosition instanceof Position ) {
			return new this( itemOrPosition.parent, itemOrPosition.offset );
		} else {
			const node = itemOrPosition;

			if ( offset == 'end' ) {
				offset = node.is( '$text' ) ? node.data.length : ( node as any ).childCount;
			} else if ( offset == 'before' ) {
				return this._createBefore( node );
			} else if ( offset == 'after' ) {
				return this._createAfter( node );
			} else if ( offset !== 0 && !offset ) {
				/**
				 * {@link module:engine/view/view~View#createPositionAt `View#createPositionAt()`}
				 * requires the offset to be specified when the first parameter is a view item.
				 *
				 * @error view-createpositionat-offset-required
				 */
				throw new CKEditorError( 'view-createpositionat-offset-required', node );
			}

			return new Position( node as any, offset as number );
		}
	}

	/**
	 * Creates a new position after given view item.
	 *
	 * @internal
	 * @param item View item after which the position should be located.
	 */
	public static _createAfter( item: Item ): Position {
		// TextProxy is not a instance of Node so we need do handle it in specific way.
		if ( item.is( '$textProxy' ) ) {
			return new Position( item.textNode, item.offsetInText + item.data.length );
		}

		if ( !item.parent ) {
			/**
			 * You can not make a position after a root.
			 *
			 * @error view-position-after-root
			 * @param {module:engine/view/node~Node} root
			 */
			throw new CKEditorError( 'view-position-after-root', item, { root: item } );
		}

		return new Position( item.parent, ( item.index as number ) + 1 );
	}

	/**
	 * Creates a new position before given view item.
	 *
	 * @internal
	 * @param item View item before which the position should be located.
	 */
	public static _createBefore( item: Item ): Position {
		// TextProxy is not a instance of Node so we need do handle it in specific way.
		if ( item.is( '$textProxy' ) ) {
			return new Position( item.textNode, item.offsetInText );
		}

		if ( !item.parent ) {
			/**
			 * You cannot make a position before a root.
			 *
			 * @error view-position-before-root
			 * @param {module:engine/view/node~Node} root
			 */
			throw new CKEditorError( 'view-position-before-root', item, { root: item } );
		}

		return new Position( item.parent, item.index as number );
	}
}

// The magic of type inference using `is` method is centralized in `TypeCheckable` class.
// Proper overload would interfere with that.
Position.prototype.is = function( type: string ): boolean {
	return type === 'position' || type === 'view:position';
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
