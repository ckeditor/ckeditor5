/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/view/range
 */

import { ViewTypeCheckable } from './typecheckable.js';
import { ViewPosition } from './position.js';

import { type ViewDocumentFragment } from './documentfragment.js';
import { type ViewElement } from './element.js';
import { type ViewItem } from './item.js';
import { type ViewNode } from './node.js';
import { ViewTreeWalker, type ViewTreeWalkerValue, type ViewTreeWalkerOptions } from './treewalker.js';

/**
 * Range in the view tree. A range is represented by its start and end {@link module:engine/view/position~ViewPosition positions}.
 *
 * In order to create a new position instance use the `createPosition*()` factory methods available in:
 *
 * * {@link module:engine/view/view~EditingView}
 * * {@link module:engine/view/downcastwriter~ViewDowncastWriter}
 * * {@link module:engine/view/upcastwriter~ViewUpcastWriter}
 */
export class ViewRange extends ViewTypeCheckable implements Iterable<ViewTreeWalkerValue> {
	/**
	 * Start position.
	 */
	public readonly start: ViewPosition;

	/**
	 * End position.
	 */
	public readonly end: ViewPosition;

	/**
	 * Creates a range spanning from `start` position to `end` position.
	 *
	 * **Note:** Constructor creates it's own {@link module:engine/view/position~ViewPosition} instances basing on passed values.
	 *
	 * @param start Start position.
	 * @param end End position. If not set, range will be collapsed at the `start` position.
	 */
	constructor( start: ViewPosition, end: ViewPosition | null = null ) {
		super();

		this.start = start.clone();
		this.end = end ? end.clone() : start.clone();
	}

	/**
	 * Iterable interface.
	 *
	 * Iterates over all {@link module:engine/view/item~Item view items} that are in this range and returns
	 * them together with additional information like length or {@link module:engine/view/position~ViewPosition positions},
	 * grouped as {@link module:engine/view/treewalker~ViewTreeWalkerValue}.
	 *
	 * This iterator uses {@link module:engine/view/treewalker~ViewTreeWalker TreeWalker} with `boundaries` set to this range and
	 * `ignoreElementEnd` option
	 * set to `true`.
	 */
	public* [ Symbol.iterator ](): IterableIterator<ViewTreeWalkerValue> {
		yield* new ViewTreeWalker( { boundaries: this, ignoreElementEnd: true } );
	}

	/**
	 * Returns whether the range is collapsed, that is it start and end positions are equal.
	 */
	public get isCollapsed(): boolean {
		return this.start.isEqual( this.end );
	}

	/**
	 * Returns whether this range is flat, that is if {@link module:engine/view/range~ViewRange#start start} position and
	 * {@link module:engine/view/range~ViewRange#end end} position are in the same
	 * {@link module:engine/view/position~ViewPosition#parent parent}.
	 */
	public get isFlat(): boolean {
		return this.start.parent === this.end.parent;
	}

	/**
	 * Range root element.
	 */
	public get root(): ViewNode | ViewDocumentFragment {
		return this.start.root;
	}

	/**
	 * Creates a maximal range that has the same content as this range but is expanded in both ways (at the beginning
	 * and at the end).
	 *
	 * For example:
	 *
	 * ```html
	 * <p>Foo</p><p><b>{Bar}</b></p> -> <p>Foo</p>[<p><b>Bar</b>]</p>
	 * <p><b>foo</b>{bar}<span></span></p> -> <p><b>foo[</b>bar<span></span>]</p>
	 * ```
	 *
	 * Note that in the sample above:
	 *
	 * - `<p>` have type of {@link module:engine/view/containerelement~ViewContainerElement},
	 * - `<b>` have type of {@link module:engine/view/attributeelement~ViewAttributeElement},
	 * - `<span>` have type of {@link module:engine/view/uielement~ViewUIElement}.
	 *
	 * @returns Enlarged range.
	 */
	public getEnlarged(): ViewRange {
		let start = this.start.getLastMatchingPosition( enlargeTrimSkip, { direction: 'backward' } );
		let end = this.end.getLastMatchingPosition( enlargeTrimSkip );

		// Fix positions, in case if they are in Text node.
		if ( start.parent.is( '$text' ) && start.isAtStart ) {
			start = ViewPosition._createBefore( start.parent );
		}

		if ( end.parent.is( '$text' ) && end.isAtEnd ) {
			end = ViewPosition._createAfter( end.parent );
		}

		return new ViewRange( start, end );
	}

	/**
	 * Creates a minimum range that has the same content as this range but is trimmed in both ways (at the beginning
	 * and at the end).
	 *
	 * For example:
	 *
	 * ```html
	 * <p>Foo</p>[<p><b>Bar</b>]</p> -> <p>Foo</p><p><b>{Bar}</b></p>
	 * <p><b>foo[</b>bar<span></span>]</p> -> <p><b>foo</b>{bar}<span></span></p>
	 * ```
	 *
	 * Note that in the sample above:
	 *
	 * - `<p>` have type of {@link module:engine/view/containerelement~ViewContainerElement},
	 * - `<b>` have type of {@link module:engine/view/attributeelement~ViewAttributeElement},
	 * - `<span>` have type of {@link module:engine/view/uielement~ViewUIElement}.
	 *
	 * @returns Shrunk range.
	 */
	public getTrimmed(): ViewRange {
		let start = this.start.getLastMatchingPosition( enlargeTrimSkip );

		if ( start.isAfter( this.end ) || start.isEqual( this.end ) ) {
			return new ViewRange( start, start );
		}

		let end = this.end.getLastMatchingPosition( enlargeTrimSkip, { direction: 'backward' } );
		const nodeAfterStart = start.nodeAfter;
		const nodeBeforeEnd = end.nodeBefore;

		// Because TreeWalker prefers positions next to text node, we need to move them manually into these text nodes.
		if ( nodeAfterStart && nodeAfterStart.is( '$text' ) ) {
			start = new ViewPosition( nodeAfterStart, 0 );
		}

		if ( nodeBeforeEnd && nodeBeforeEnd.is( '$text' ) ) {
			end = new ViewPosition( nodeBeforeEnd, nodeBeforeEnd.data.length );
		}

		return new ViewRange( start, end );
	}

	/**
	 * Two ranges are equal if their start and end positions are equal.
	 *
	 * @param otherRange Range to compare with.
	 * @returns `true` if ranges are equal, `false` otherwise
	 */
	public isEqual( otherRange: ViewRange ): boolean {
		return this == otherRange || ( this.start.isEqual( otherRange.start ) && this.end.isEqual( otherRange.end ) );
	}

	/**
	 * Checks whether this range contains given {@link module:engine/view/position~ViewPosition position}.
	 *
	 * @param position Position to check.
	 * @returns `true` if given {@link module:engine/view/position~ViewPosition position} is contained in this range, `false` otherwise.
	 */
	public containsPosition( position: ViewPosition ): boolean {
		return position.isAfter( this.start ) && position.isBefore( this.end );
	}

	/**
	 * Checks whether this range contains given {@link module:engine/view/range~ViewRange range}.
	 *
	 * @param otherRange Range to check.
	 * @param loose Whether the check is loose or strict. If the check is strict (`false`), compared range cannot
	 * start or end at the same position as this range boundaries. If the check is loose (`true`), compared range can start, end or
	 * even be equal to this range. Note that collapsed ranges are always compared in strict mode.
	 * @returns `true` if given {@link module:engine/view/range~ViewRange range} boundaries are contained by this range, `false`
	 * otherwise.
	 */
	public containsRange( otherRange: ViewRange, loose: boolean = false ): boolean {
		if ( otherRange.isCollapsed ) {
			loose = false;
		}

		const containsStart = this.containsPosition( otherRange.start ) || ( loose && this.start.isEqual( otherRange.start ) );
		const containsEnd = this.containsPosition( otherRange.end ) || ( loose && this.end.isEqual( otherRange.end ) );

		return containsStart && containsEnd;
	}

	/**
	 * Computes which part(s) of this {@link module:engine/view/range~ViewRange range} is not a part of given
	 * {@link module:engine/view/range~ViewRange range}.
	 * Returned array contains zero, one or two {@link module:engine/view/range~ViewRange ranges}.
	 *
	 * Examples:
	 *
	 * ```ts
	 * let foo = downcastWriter.createText( 'foo' );
	 * let img = downcastWriter.createContainerElement( 'img' );
	 * let bar = downcastWriter.createText( 'bar' );
	 * let p = downcastWriter.createContainerElement( 'p', null, [ foo, img, bar ] );
	 *
	 * let range = view.createRange( view.createPositionAt( foo, 2 ), view.createPositionAt( bar, 1 ); // "o", img, "b" are in range.
	 * let otherRange = view.createRange( // "oo", img, "ba" are in range.
	 * 	view.createPositionAt( foo, 1 ),
	 * 	view.createPositionAt( bar, 2 )
	 * );
	 * let transformed = range.getDifference( otherRange );
	 * // transformed array has no ranges because `otherRange` contains `range`
	 *
	 * otherRange = view.createRange( view.createPositionAt( foo, 1 ), view.createPositionAt( p, 2 ); // "oo", img are in range.
	 * transformed = range.getDifference( otherRange );
	 * // transformed array has one range: from ( p, 2 ) to ( bar, 1 )
	 *
	 * otherRange = view.createRange( view.createPositionAt( p, 1 ), view.createPositionAt( p, 2 ) ); // img is in range.
	 * transformed = range.getDifference( otherRange );
	 * // transformed array has two ranges: from ( foo, 1 ) to ( p, 1 ) and from ( p, 2 ) to ( bar, 1 )
	 * ```
	 *
	 * @param otherRange Range to differentiate against.
	 * @returns The difference between ranges.
	 */
	public getDifference( otherRange: ViewRange ): Array<ViewRange> {
		const ranges: Array<ViewRange> = [];

		if ( this.isIntersecting( otherRange ) ) {
			// Ranges intersect.

			if ( this.containsPosition( otherRange.start ) ) {
				// Given range start is inside this range. This means that we have to
				// add shrunken range - from the start to the middle of this range.
				ranges.push( new ViewRange( this.start, otherRange.start ) );
			}

			if ( this.containsPosition( otherRange.end ) ) {
				// Given range end is inside this range. This means that we have to
				// add shrunken range - from the middle of this range to the end.
				ranges.push( new ViewRange( otherRange.end, this.end ) );
			}
		} else {
			// Ranges do not intersect, return the original range.
			ranges.push( this.clone() );
		}

		return ranges;
	}

	/**
	 * Returns an intersection of this {@link module:engine/view/range~ViewRange range}
	 * and given {@link module:engine/view/range~ViewRange range}.
	 * Intersection is a common part of both of those ranges. If ranges has no common part, returns `null`.
	 *
	 * Examples:
	 *
	 * ```ts
	 * let foo = downcastWriter.createText( 'foo' );
	 * let img = downcastWriter.createContainerElement( 'img' );
	 * let bar = downcastWriter.createText( 'bar' );
	 * let p = downcastWriter.createContainerElement( 'p', null, [ foo, img, bar ] );
	 *
	 * let range = view.createRange( view.createPositionAt( foo, 2 ), view.createPositionAt( bar, 1 ); // "o", img, "b" are in range.
	 * let otherRange = view.createRange( view.createPositionAt( foo, 1 ), view.createPositionAt( p, 2 ); // "oo", img are in range.
	 * let transformed = range.getIntersection( otherRange ); // range from ( foo, 1 ) to ( p, 2 ).
	 *
	 * otherRange = view.createRange( view.createPositionAt( bar, 1 ), view.createPositionAt( bar, 3 ); "ar" is in range.
	 * transformed = range.getIntersection( otherRange ); // null - no common part.
	 * ```
	 *
	 * @param otherRange Range to check for intersection.
	 * @returns A common part of given ranges or `null` if ranges have no common part.
	 */
	public getIntersection( otherRange: ViewRange ): ViewRange | null {
		if ( this.isIntersecting( otherRange ) ) {
			// Ranges intersect, so a common range will be returned.
			// At most, it will be same as this range.
			let commonRangeStart = this.start;
			let commonRangeEnd = this.end;

			if ( this.containsPosition( otherRange.start ) ) {
				// Given range start is inside this range. This means thaNt we have to
				// shrink common range to the given range start.
				commonRangeStart = otherRange.start;
			}

			if ( this.containsPosition( otherRange.end ) ) {
				// Given range end is inside this range. This means that we have to
				// shrink common range to the given range end.
				commonRangeEnd = otherRange.end;
			}

			return new ViewRange( commonRangeStart, commonRangeEnd );
		}

		// Ranges do not intersect, so they do not have common part.
		return null;
	}

	/**
	 * Creates a {@link module:engine/view/treewalker~ViewTreeWalker TreeWalker} instance with this range as a boundary.
	 *
	 * @param options Object with configuration options. See {@link module:engine/view/treewalker~ViewTreeWalker}.
	 */
	public getWalker( options: ViewTreeWalkerOptions = {} ): ViewTreeWalker {
		options.boundaries = this;

		return new ViewTreeWalker( options );
	}

	/**
	 * Returns a {@link module:engine/view/node~ViewNode} or {@link module:engine/view/documentfragment~ViewDocumentFragment}
	 * which is a common ancestor of range's both ends (in which the entire range is contained).
	 */
	public getCommonAncestor(): ViewNode | ViewDocumentFragment | null {
		return this.start.getCommonAncestor( this.end );
	}

	/**
	 * Returns an {@link module:engine/view/element~ViewElement Element} contained by the range.
	 * The element will be returned when it is the **only** node within the range and **fully–contained**
	 * at the same time.
	 */
	public getContainedElement(): ViewElement | null {
		if ( this.isCollapsed ) {
			return null;
		}

		let nodeAfterStart = this.start.nodeAfter;
		let nodeBeforeEnd = this.end.nodeBefore;

		// Handle the situation when the range position is at the beginning / at the end of a text node.
		// In such situation `.nodeAfter` and `.nodeBefore` are `null` but the range still might be spanning
		// over one element.
		//
		// <p>Foo{<span class="widget"></span>}bar</p> vs <p>Foo[<span class="widget"></span>]bar</p>
		//
		// These are basically the same range, only the difference is if the range position is at
		// at the end/at the beginning of a text node or just before/just after the text node.
		//
		if ( this.start.parent.is( '$text' ) && this.start.isAtEnd && this.start.parent.nextSibling ) {
			nodeAfterStart = this.start.parent.nextSibling;
		}

		if ( this.end.parent.is( '$text' ) && this.end.isAtStart && this.end.parent.previousSibling ) {
			nodeBeforeEnd = this.end.parent.previousSibling;
		}

		if ( nodeAfterStart && nodeAfterStart.is( 'element' ) && nodeAfterStart === nodeBeforeEnd ) {
			return nodeAfterStart;
		}

		return null;
	}

	/**
	 * Clones this range.
	 */
	public clone(): ViewRange {
		return new ViewRange( this.start, this.end );
	}

	/**
	 * Returns an iterator that iterates over all {@link module:engine/view/item~Item view items} that are in this range and returns
	 * them.
	 *
	 * This method uses {@link module:engine/view/treewalker~ViewTreeWalker} with `boundaries` set to this range
	 * and `ignoreElementEnd` option set to `true`. However it returns only {@link module:engine/view/item~Item items},
	 * not {@link module:engine/view/treewalker~ViewTreeWalkerValue}.
	 *
	 * You may specify additional options for the tree walker. See {@link module:engine/view/treewalker~ViewTreeWalker} for
	 * a full list of available options.
	 *
	 * @param options Object with configuration options. See {@link module:engine/view/treewalker~ViewTreeWalker}.
	 */
	public* getItems( options: ViewTreeWalkerOptions = {} ): IterableIterator<ViewItem> {
		options.boundaries = this;
		options.ignoreElementEnd = true;

		const treeWalker = new ViewTreeWalker( options );

		for ( const value of treeWalker ) {
			yield value.item;
		}
	}

	/**
	 * Returns an iterator that iterates over all {@link module:engine/view/position~ViewPosition positions} that are boundaries or
	 * contained in this range.
	 *
	 * This method uses {@link module:engine/view/treewalker~ViewTreeWalker} with `boundaries` set to this range. However it returns only
	 * {@link module:engine/view/position~ViewPosition positions}, not {@link module:engine/view/treewalker~ViewTreeWalkerValue}.
	 *
	 * You may specify additional options for the tree walker. See {@link module:engine/view/treewalker~ViewTreeWalker} for
	 * a full list of available options.
	 *
	 * @param options Object with configuration options. See {@link module:engine/view/treewalker~ViewTreeWalker}.
	 */
	public* getPositions( options: ViewTreeWalkerOptions = {} ): IterableIterator<ViewPosition> {
		options.boundaries = this;

		const treeWalker = new ViewTreeWalker( options );

		yield treeWalker.position;

		for ( const value of treeWalker ) {
			yield value.nextPosition;
		}
	}

	/**
	 * Checks and returns whether this range intersects with the given range.
	 *
	 * @param otherRange Range to compare with.
	 * @returns True if ranges intersect.
	 */
	public isIntersecting( otherRange: ViewRange ): boolean {
		return this.start.isBefore( otherRange.end ) && this.end.isAfter( otherRange.start );
	}

	/**
	 * Creates a range from the given parents and offsets.
	 *
	 * @internal
	 * @param startElement Start position parent element.
	 * @param startOffset Start position offset.
	 * @param endElement End position parent element.
	 * @param endOffset End position offset.
	 * @returns Created range.
	 */
	public static _createFromParentsAndOffsets(
		startElement: ViewElement | ViewDocumentFragment,
		startOffset: number,
		endElement: ViewElement | ViewDocumentFragment,
		endOffset: number
	): ViewRange {
		return new this(
			new ViewPosition( startElement, startOffset ),
			new ViewPosition( endElement, endOffset )
		);
	}

	/**
	 * Creates a new range, spreading from specified {@link module:engine/view/position~ViewPosition position} to a position moved by
	 * given `shift`. If `shift` is a negative value, shifted position is treated as the beginning of the range.
	 *
	 * @internal
	 * @param position Beginning of the range.
	 * @param shift How long the range should be.
	 */
	public static _createFromPositionAndShift( position: ViewPosition, shift: number ): ViewRange {
		const start = position;
		const end = position.getShiftedBy( shift );

		return shift > 0 ? new this( start, end ) : new this( end, start );
	}

	/**
	 * Creates a range inside an {@link module:engine/view/element~ViewElement element} which starts before the first child of
	 * that element and ends after the last child of that element.
	 *
	 * @internal
	 * @param element Element which is a parent for the range.
	 */
	public static _createIn( element: ViewElement | ViewDocumentFragment ): ViewRange {
		return this._createFromParentsAndOffsets( element, 0, element, element.childCount );
	}

	/**
	 * Creates a range that starts before given {@link module:engine/view/item~Item view item} and ends after it.
	 *
	 * @internal
	 */
	public static _createOn( item: ViewItem ): ViewRange {
		const size = item.is( '$textProxy' ) ? item.offsetSize : 1;

		return this._createFromPositionAndShift( ViewPosition._createBefore( item ), size );
	}
}

// The magic of type inference using `is` method is centralized in `TypeCheckable` class.
// Proper overload would interfere with that.
ViewRange.prototype.is = function( type: string ): boolean {
	return type === 'range' || type === 'view:range';
};

/**
 * Function used by getEnlarged and getTrimmed methods.
 */
function enlargeTrimSkip( value: ViewTreeWalkerValue ): boolean {
	if ( value.item.is( 'attributeElement' ) || value.item.is( 'uiElement' ) ) {
		return true;
	}

	return false;
}
