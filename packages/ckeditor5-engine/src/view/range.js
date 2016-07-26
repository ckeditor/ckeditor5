/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Position from './position.js';
import TreeWalker from './treewalker.js';

/**
 * Tree view range.
 *
 * @memberOf engine.view
 */
export default class Range {
	/**
	 * Creates a range spanning from `start` position to `end` position.
	 * **Note:** Constructor creates it's own {@link engine.view.Position} instances basing on passed values.
	 *
	 * @param {engine.view.Position} start Start position.
	 * @param {engine.view.Position} end End position.
	 */
	constructor( start, end ) {
		/**
		 * Start position.
		 *
		 * @member engine.view.Range#start
		 * @type {engine.view.Position}
		 */
		this.start = Position.createFromPosition( start );

		/**
		 * End position.
		 *
		 * @member engine.view.Range#end
		 * @type {engine.view.Position}
		 */
		this.end = Position.createFromPosition( end );
	}

	/**
	 * Returns an iterator that iterates over all {@link engine.view.Item view items} that are in this range and returns
	 * them together with additional information like length or {@link engine.view.Position positions},
	 * grouped as {@link engine.view.TreeWalkerValue}.
	 *
	 * This iterator uses {@link engine.view.TreeWalker TreeWalker} with `boundaries` set to this range and `ignoreElementEnd` option
	 * set to `true`.
	 *
	 * @returns {Iterable.<engine.view.TreeWalkerValue>}
	 */
	*[ Symbol.iterator ]() {
		yield* new TreeWalker( { boundaries: this, ignoreElementEnd: true } );
	}

	/**
	 * Returns whether the range is collapsed, that is it start and end positions are equal.
	 *
	 * @type {Boolean}
	 */
	get isCollapsed() {
		return this.start.isEqual( this.end );
	}

	/**
	 * Returns whether this range is flat, that is if {@link engine.view.Range#start start} position and
	 * {@link engine.view.Range#end end} position are in the same {@link engine.view.Position#parent parent}.
	 *
	 * @type {Boolean}
	 */
	get isFlat() {
		return this.start.parent === this.end.parent;
	}

	/**
	 * Range root element.
	 *
	 * @type {engine.view.Element|engine.view.DocumentFragment}
	 */
	get root() {
		return this.start.root;
	}

	/**
	 * Two ranges are equal if their start and end positions are equal.
	 *
	 * @param {engine.view.Range} otherRange Range to compare with.
	 * @returns {Boolean} `true` if ranges are equal, `false` otherwise
	 */
	isEqual( otherRange ) {
		return this == otherRange || ( this.start.isEqual( otherRange.start ) && this.end.isEqual( otherRange.end ) );
	}

	/**
	 * Checks whether this range contains given {@link engine.view.Position position}.
	 *
	 * @param {engine.view.Position} position Position to check.
	 * @returns {Boolean} `true` if given {@link engine.view.Position position} is contained in this range, `false` otherwise.
	 */
	containsPosition( position ) {
		return position.isAfter( this.start ) && position.isBefore( this.end );
	}

	/**
	 * Checks whether this range contains given {@link engine.view.Range range}.
	 *
	 * @param {engine.view.Range} otherRange Range to check.
	 * @returns {Boolean} `true` if given {@link engine.view.Range range} boundaries are contained by this range, `false` otherwise.
	 */
	containsRange( otherRange ) {
		return this.containsPosition( otherRange.start ) && this.containsPosition( otherRange.end );
	}

	/**
	 * Computes which part(s) of this {@link engine.view.Range range} is not a part of given {@link engine.view.Range range}.
	 * Returned array contains zero, one or two {@link engine.view.Range ranges}.
	 *
	 * Examples:
	 *
	 *		let foo = new Text( 'foo' );
	 *		let img = new ContainerElement( 'img' );
	 *		let bar = new Text( 'bar' );
	 *		let p = new ContainerElement( 'p', null, [ foo, img, bar ] );
	 *
	 *		let range = new Range( new Position( foo, 2 ), new Position( bar, 1 ); // "o", img, "b" are in range.
	 *		let otherRange = new Range( new Position( foo, 1 ), new Position( bar, 2 ); "oo", img, "ba" are in range.
	 *		let transformed = range.getDifference( otherRange );
	 *		// transformed array has no ranges because `otherRange` contains `range`
	 *
	 *		otherRange = new Range( new Position( foo, 1 ), new Position( p, 2 ); // "oo", img are in range.
	 *		transformed = range.getDifference( otherRange );
	 *		// transformed array has one range: from ( p, 2 ) to ( bar, 1 )
	 *
	 *		otherRange = new Range( new Position( p, 1 ), new Position( p, 2 ) ); // img is in range.
	 *		transformed = range.getDifference( otherRange );
	 *		// transformed array has two ranges: from ( foo, 1 ) to ( p, 1 ) and from ( p, 2 ) to ( bar, 1 )
	 *
	 * @param {engine.view.Range} otherRange Range to differentiate against.
	 * @returns {Array.<engine.view.Range>} The difference between ranges.
	 */
	getDifference( otherRange ) {
		const ranges = [];

		if ( this.isIntersecting( otherRange ) ) {
			// Ranges intersect.

			if ( this.containsPosition( otherRange.start ) ) {
				// Given range start is inside this range. This means that we have to
				// add shrunken range - from the start to the middle of this range.
				ranges.push( new Range( this.start, otherRange.start ) );
			}

			if ( this.containsPosition( otherRange.end ) ) {
				// Given range end is inside this range. This means that we have to
				// add shrunken range - from the middle of this range to the end.
				ranges.push( new Range( otherRange.end, this.end ) );
			}
		} else {
			// Ranges do not intersect, return the original range.
			ranges.push( Range.createFromRange( this ) );
		}

		return ranges;
	}

	/**
	 * Returns an intersection of this {@link engine.view.Range range} and given {@link engine.view.Range range}.
	 * Intersection is a common part of both of those ranges. If ranges has no common part, returns `null`.
	 *
	 * Examples:
	 *
	 *		let foo = new Text( 'foo' );
	 *		let img = new ContainerElement( 'img' );
	 *		let bar = new Text( 'bar' );
	 *		let p = new ContainerElement( 'p', null, [ foo, img, bar ] );
	 *
	 *		let range = new Range( new Position( foo, 2 ), new Position( bar, 1 ); // "o", img, "b" are in range.
	 *		let otherRange = new Range( new Position( foo, 1 ), new Position( p, 2 ); // "oo", img are in range.
	 *		let transformed = range.getIntersection( otherRange ); // range from ( foo, 1 ) to ( p, 2 ).
	 *
	 *		otherRange = new Range( new Position( bar, 1 ), new Position( bar, 3 ); "ar" is in range.
	 *		transformed = range.getIntersection( otherRange ); // null - no common part.
	 *
	 * @param {engine.view.Range} otherRange Range to check for intersection.
	 * @returns {engine.view.Range|null} A common part of given ranges or `null` if ranges have no common part.
	 */
	getIntersection( otherRange ) {
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

			return new Range( commonRangeStart, commonRangeEnd );
		}

		// Ranges do not intersect, so they do not have common part.
		return null;
	}

	/**
	 * Creates a {@link engine.view.TreeWalker TreeWalker} instance with this range as a boundary.
	 *
	 * @param {Object} options Object with configuration options. See {@link engine.view.TreeWalker}.
	 * @param {engine.view.Position} [options.startPosition]
	 * @param {Boolean} [options.singleCharacters=false]
	 * @param {Boolean} [options.shallow=false]
	 * @param {Boolean} [options.ignoreElementEnd=false]
	 */
	getWalker( options = {} ) {
		options.boundaries = this;

		return new TreeWalker( options );
	}

	/**
	 * Returns an iterator that iterates over all {@link engine.view.Items view items} that are in this range and returns
	 * them.
	 *
	 * This method uses {@link engine.view.TreeWalker} with `boundaries` set to this range and `ignoreElementEnd` option
	 * set to `true`. However it returns only {@link engine.view.Item items}, not {@link engine.view.TreeWalkerValue}.
	 *
	 * You may specify additional options for the tree walker. See {@link engine.view.TreeWalker} for
	 * a full list of available options.
	 *
	 * @param {Object} options Object with configuration options. See {@link engine.view.TreeWalker}.
	 * @returns {Iterable.<engine.view.Item>}
	 */
	*getItems( options = {} ) {
		options.boundaries = this;
		options.ignoreElementEnd = true;

		const treeWalker = new TreeWalker( options );

		for ( let value of treeWalker ) {
			yield value.item;
		}
	}

	/**
	 * Returns an iterator that iterates over all {@link engine.view.Position positions} that are boundaries or
	 * contained in this range.
	 *
	 * This method uses {@link engine.view.TreeWalker} with `boundaries` set to this range. However it returns only
	 * {@link engine.view.Position positions}, not {@link engine.view.TreeWalkerValue}.
	 *
	 * You may specify additional options for the tree walker. See {@link engine.view.TreeWalker} for
	 * a full list of available options.
	 *
	 * @param {Object} options Object with configuration options. See {@link engine.view.TreeWalker}.
	 * @returns {Iterable.<engine.view.Position>}
	 */
	*getPositions( options = {} ) {
		options.boundaries = this;

		const treeWalker = new TreeWalker( options );

		yield treeWalker.position;

		for ( let value of treeWalker ) {
			yield value.nextPosition;
		}
	}

	/**
	 * Checks and returns whether this range intersects with given range.
	 *
	 * @param {engine.view.Range} otherRange Range to compare with.
	 * @returns {Boolean} True if ranges intersect.
	 */
	isIntersecting( otherRange ) {
		return this.start.isBefore( otherRange.end ) && this.end.isAfter( otherRange.start );
	}

	/**
	 * Creates a range from given parents and offsets.
	 *
	 * @param {engine.view.Element} startElement Start position parent element.
	 * @param {Number} startOffset Start position offset.
	 * @param {engine.view.Element} endElement End position parent element.
	 * @param {Number} endOffset End position offset.
	 * @returns {engine.view.Range} Created range.
	 */
	static createFromParentsAndOffsets( startElement, startOffset, endElement, endOffset ) {
		return new this(
			new Position( startElement, startOffset ),
			new Position( endElement, endOffset )
		);
	}

	/**
	 * Creates and returns a new instance of Range which is equal to passed range.
	 *
	 * @param {engine.view.Range} range Range to clone.
	 * @returns {engine.view.Range}
	 */
	static createFromRange( range ) {
		return new this( range.start, range.end );
	}

	/**
	 * Creates a new range, spreading from specified {@link engine.view.Position position} to a position moved by
	 * given `shift`. If `shift` is a negative value, shifted position is treated as the beginning of the range.
	 *
	 * @param {engine.view.Position} position Beginning of the range.
	 * @param {Number} shift How long the range should be.
	 * @returns {engine.view.Range}
	 */
	static createFromPositionAndShift( position, shift ) {
		const start = position;
		const end = position.getShiftedBy( shift );

		return shift > 0 ? new this( start, end ) : new this( end, start );
	}

	/**
	 * Creates a range inside an {@link engine.view.Element element} which starts before the first child of
	 * that element and ends after the last child of that element.
	 *
	 * @param {engine.view.Element} element Element which is a parent for the range.
	 * @returns {engine.view.Range}
	 */
	static createFromElement( element ) {
		return this.createFromParentsAndOffsets( element, 0, element, element.childCount );
	}
}
