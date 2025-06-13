/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/view/position
 */

import { ViewTypeCheckable } from './typecheckable.js';

import { CKEditorError, compareArrays } from '@ckeditor/ckeditor5-utils';

import { ViewEditableElement } from './editableelement.js';

import { type ViewDocumentFragment } from './documentfragment.js';
import { type ViewElement } from './element.js';
import { type ViewItem } from './item.js';
import { type ViewNode } from './node.js';
import { ViewTreeWalker, type ViewTreeWalkerValue, type ViewTreeWalkerOptions } from './treewalker.js';

/**
 * Position in the view tree. Position is represented by its parent node and an offset in this parent.
 *
 * In order to create a new position instance use the `createPosition*()` factory methods available in:
 *
 * * {@link module:engine/view/view~EditingView}
 * * {@link module:engine/view/downcastwriter~ViewDowncastWriter}
 * * {@link module:engine/view/upcastwriter~ViewUpcastWriter}
 */
export class ViewPosition extends ViewTypeCheckable {
	/**
	 * Position parent.
	 */
	public readonly parent: ViewNode | ViewDocumentFragment;

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
	constructor( parent: ViewNode | ViewDocumentFragment, offset: number ) {
		super();

		this.parent = parent;
		this.offset = offset;
	}

	/**
	 * Node directly after the position. Equals `null` when there is no node after position or position is located
	 * inside text node.
	 */
	public get nodeAfter(): ViewNode | null {
		if ( this.parent.is( '$text' ) ) {
			return null;
		}

		return ( this.parent as ViewElement ).getChild( this.offset ) || null;
	}

	/**
	 * Node directly before the position. Equals `null` when there is no node before position or position is located
	 * inside text node.
	 */
	public get nodeBefore(): ViewNode | null {
		if ( this.parent.is( '$text' ) ) {
			return null;
		}

		return ( this.parent as ViewElement ).getChild( this.offset - 1 ) || null;
	}

	/**
	 * Is `true` if position is at the beginning of its {@link module:engine/view/position~ViewPosition#parent parent}, `false` otherwise.
	 */
	public get isAtStart(): boolean {
		return this.offset === 0;
	}

	/**
	 * Is `true` if position is at the end of its {@link module:engine/view/position~ViewPosition#parent parent}, `false` otherwise.
	 */
	public get isAtEnd(): boolean {
		const endOffset = this.parent.is( '$text' ) ? this.parent.data.length : ( this.parent as any ).childCount;

		return this.offset === endOffset;
	}

	/**
	 * Position's root, that is the root of the position's parent element.
	 */
	public get root(): ViewNode | ViewDocumentFragment {
		return this.parent.root;
	}

	/**
	 * {@link module:engine/view/editableelement~ViewEditableElement ViewEditableElement} instance that contains this position, or `null` if
	 * position is not inside an editable element.
	 */
	public get editableElement(): ViewEditableElement | null {
		let editable = this.parent;

		while ( !( editable instanceof ViewEditableElement ) ) {
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
	public getShiftedBy( shift: number ): ViewPosition {
		const shifted = ViewPosition._createAt( this );

		const offset = shifted.offset + shift;
		shifted.offset = offset < 0 ? 0 : offset;

		return shifted;
	}

	/**
	 * Gets the farthest position which matches the callback using
	 * {@link module:engine/view/treewalker~ViewTreeWalker TreeWalker}.
	 *
	 * For example:
	 *
	 * ```ts
	 * getLastMatchingPosition( value => value.type == 'text' ); // <p>{}foo</p> -> <p>foo[]</p>
	 * getLastMatchingPosition( value => value.type == 'text', { direction: 'backward' } ); // <p>foo[]</p> -> <p>{}foo</p>
	 * getLastMatchingPosition( value => false ); // Do not move the position.
	 * ```
	 *
	 * @param skip Callback function. Gets {@link module:engine/view/treewalker~ViewTreeWalkerValue} and should
	 * return `true` if the value should be skipped or `false` if not.
	 * @param options Object with configuration options. See {@link module:engine/view/treewalker~ViewTreeWalker}.
	 * @returns The position after the last item which matches the `skip` callback test.
	 */
	public getLastMatchingPosition( skip: ( value: ViewTreeWalkerValue ) => boolean, options: ViewTreeWalkerOptions = {} ): ViewPosition {
		options.startPosition = this;

		const treeWalker = new ViewTreeWalker( options );
		treeWalker.skip( skip );

		return treeWalker.position;
	}

	/**
	 * Returns ancestors array of this position, that is this position's parent and it's ancestors.
	 *
	 * @returns Array with ancestors.
	 */
	public getAncestors(): Array<ViewNode | ViewDocumentFragment> {
		if ( this.parent.is( 'documentFragment' ) ) {
			return [ this.parent ];
		} else {
			return this.parent.getAncestors( { includeSelf: true } );
		}
	}

	/**
	 * Returns a {@link module:engine/view/node~ViewNode} or {@link module:engine/view/documentfragment~ViewDocumentFragment}
	 * which is a common ancestor of both positions.
	 */
	public getCommonAncestor( position: ViewPosition ): ViewNode | ViewDocumentFragment | null {
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
	public isEqual( otherPosition: ViewPosition ): boolean {
		return ( this.parent == otherPosition.parent && this.offset == otherPosition.offset );
	}

	/**
	 * Checks whether this position is located before given position. When method returns `false` it does not mean that
	 * this position is after give one. Two positions may be located inside separate roots and in that situation this
	 * method will still return `false`.
	 *
	 * @see module:engine/view/position~ViewPosition#isAfter
	 * @see module:engine/view/position~ViewPosition#compareWith
	 * @param otherPosition Position to compare with.
	 * @returns Returns `true` if this position is before given position.
	 */
	public isBefore( otherPosition: ViewPosition ): boolean {
		return this.compareWith( otherPosition ) == 'before';
	}

	/**
	 * Checks whether this position is located after given position. When method returns `false` it does not mean that
	 * this position is before give one. Two positions may be located inside separate roots and in that situation this
	 * method will still return `false`.
	 *
	 * @see module:engine/view/position~ViewPosition#isBefore
	 * @see module:engine/view/position~ViewPosition#compareWith
	 * @param otherPosition Position to compare with.
	 * @returns Returns `true` if this position is after given position.
	 */
	public isAfter( otherPosition: ViewPosition ): boolean {
		return this.compareWith( otherPosition ) == 'after';
	}

	/**
	 * Checks whether this position is before, after or in same position that other position. Two positions may be also
	 * different when they are located in separate roots.
	 *
	 * @param otherPosition Position to compare with.
	 */
	public compareWith( otherPosition: ViewPosition ): ViewPositionRelation {
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

			default:
				// Cast to number to avoid having 'same' as a type of `result`.
				return thisPath[ result as number ] < otherPath[ result as number ] ? 'before' : 'after';
		}
	}

	/**
	 * Creates a {@link module:engine/view/treewalker~ViewTreeWalker TreeWalker} instance with this positions as a start position.
	 *
	 * @param options Object with configuration options. See {@link module:engine/view/treewalker~ViewTreeWalker}
	 */
	public getWalker( options: ViewTreeWalkerOptions = {} ): ViewTreeWalker {
		options.startPosition = this;

		return new ViewTreeWalker( options );
	}

	/**
	 * Clones this position.
	 */
	public clone(): ViewPosition {
		return new ViewPosition( this.parent, this.offset );
	}

	/**
	 * Creates position at the given location. The location can be specified as:
	 *
	 * * a {@link module:engine/view/position~ViewPosition position},
	 * * parent element and offset (offset defaults to `0`),
	 * * parent element and `'end'` (sets position at the end of that element),
	 * * {@link module:engine/view/item~Item view item} and `'before'` or `'after'` (sets position before or after given view item).
	 *
	 * This method is a shortcut to other constructors such as:
	 *
	 * * {@link module:engine/view/position~ViewPosition._createBefore},
	 * * {@link module:engine/view/position~ViewPosition._createAfter}.
	 *
	 * @internal
	 * @param offset Offset or one of the flags. Used only when first parameter is a {@link module:engine/view/item~Item view item}.
	 */
	public static _createAt( itemOrPosition: ViewItem | ViewPosition, offset?: ViewPositionOffset ): ViewPosition {
		if ( itemOrPosition instanceof ViewPosition ) {
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
				 * {@link module:engine/view/view~EditingView#createPositionAt `View#createPositionAt()`}
				 * requires the offset to be specified when the first parameter is a view item.
				 *
				 * @error view-createpositionat-offset-required
				 */
				throw new CKEditorError( 'view-createpositionat-offset-required', node );
			}

			return new ViewPosition( node as any, offset as number );
		}
	}

	/**
	 * Creates a new position after given view item.
	 *
	 * @internal
	 * @param item View item after which the position should be located.
	 */
	public static _createAfter( item: ViewItem ): ViewPosition {
		// ViewTextProxy is not a instance of Node so we need do handle it in specific way.
		if ( item.is( '$textProxy' ) ) {
			return new ViewPosition( item.textNode, item.offsetInText + item.data.length );
		}

		if ( !item.parent ) {
			/**
			 * You cannot make a position after a root.
			 *
			 * @error view-position-after-root
			 * @param {module:engine/view/node~ViewNode} root A root item.
			 */
			throw new CKEditorError( 'view-position-after-root', item, { root: item } );
		}

		return new ViewPosition( item.parent, ( item.index as number ) + 1 );
	}

	/**
	 * Creates a new position before given view item.
	 *
	 * @internal
	 * @param item View item before which the position should be located.
	 */
	public static _createBefore( item: ViewItem ): ViewPosition {
		// ViewTextProxy is not a instance of Node so we need do handle it in specific way.
		if ( item.is( '$textProxy' ) ) {
			return new ViewPosition( item.textNode, item.offsetInText );
		}

		if ( !item.parent ) {
			/**
			 * You cannot make a position before a root.
			 *
			 * @error view-position-before-root
			 * @param {module:engine/view/node~ViewNode} root A root item.
			 */
			throw new CKEditorError( 'view-position-before-root', item, { root: item } );
		}

		return new ViewPosition( item.parent, item.index as number );
	}
}

// The magic of type inference using `is` method is centralized in `TypeCheckable` class.
// Proper overload would interfere with that.
ViewPosition.prototype.is = function( type: string ): boolean {
	return type === 'position' || type === 'view:position';
};

/**
 * A flag indicating whether this position is `'before'` or `'after'` or `'same'` as given position.
 * If positions are in different roots `'different'` flag is returned.
 */
export type ViewPositionRelation = 'before' | 'after' | 'same' | 'different';

/**
 * Offset or one of the flags.
 */
export type ViewPositionOffset = number | 'before' | 'after' | 'end';
