/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Position from './position.js';
import TreeWalker from './treewalker.js';
import utils from '../utils.js';

/**
 * Range class. Range is iterable.
 *
 * @memberOf core.treeModel
 */
export default class Range {
	/**
	 * Creates a range spanning from `start` position to `end` position.
	 * **Note:** Constructor creates it's own {@link core.treeModel.Position} instances basing on passed values.
	 *
	 * @param {core.treeModel.Position} start Start position.
	 * @param {core.treeModel.Position} end End position.
	 */
	constructor( start, end ) {
		/**
		 * Start position.
		 *
		 * @readonly
		 * @member {core.treeModel.Position} core.treeModel.Range#start
		 */
		this.start = Position.createFromPosition( start );

		/**
		 * End position.
		 *
		 * @readonly
		 * @member {core.treeModel.Position} core.treeModel.Range#end
		 */
		this.end = Position.createFromPosition( end );
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
	 * Returns whether this range is flat, that is if start position and end position are in the same parent.
	 *
	 * @returns {Boolean}
	 */
	get isFlat() {
		return this.start.parent === this.end.parent;
	}

	/**
	 * Range root element. Equals to the root of start position (which should be same as root of end position).
	 *
	 * @type {core.treeModel.RootElement}
	 */
	get root() {
		return this.start.root;
	}

	/**
	 * Checks whether this contains given {@link core.treeModel.Position position}.
	 *
	 * @param {core.treeModel.Position} position Position to check.
	 * @returns {Boolean} True if given {@link core.treeModel.Position position} is contained.
	 */
	containsPosition( position ) {
		return position.isAfter( this.start ) && position.isBefore( this.end );
	}

	/**
	 * Checks whether this range contains given {@link core.treeModel.Range range}.
	 *
	 * @param {core.treeModel.Range} otherRange Range to check.
	 * @returns {Boolean} True if given {@link core.treeModel.Range range} boundaries are contained by this range.
	 */
	containsRange( otherRange ) {
		return this.containsPosition( otherRange.start ) && this.containsPosition( otherRange.end );
	}

	/**
	 * Gets a part of this {@link core.treeModel.Range range} which is not a part of given {@link core.treeModel.Range range}. Returned
	 * array contains zero, one or two {@link core.treeModel.Range ranges}.
	 *
	 * Examples:
	 *
	 *		let range = new Range( new Position( root, [ 2, 7 ] ), new Position( root, [ 4, 0, 1 ] ) );
	 *		let otherRange = new Range( new Position( root, [ 1 ] ), new Position( root, [ 5 ] ) );
	 *		let transformed = range.getDifference( otherRange );
	 *		// transformed array has no ranges because `otherRange` contains `range`
	 *
	 *		otherRange = new Range( new Position( root, [ 1 ] ), new Position( root, [ 3 ] ) );
	 *		transformed = range.getDifference( otherRange );
	 *		// transformed array has one range: from [ 3 ] to [ 4, 0, 1 ]
	 *
	 *		otherRange = new Range( new Position( root, [ 3 ] ), new Position( root, [ 4 ] ) );
	 *		transformed = range.getDifference( otherRange );
	 *		// transformed array has two ranges: from [ 2, 7 ] to [ 3 ] and from [ 4 ] to [ 4, 0, 1 ]
	 *
	 * @param {core.treeModel.Range} otherRange Range to differentiate against.
	 * @returns {Array.<core.treeModel.Range>} The difference between ranges.
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
	 * Returns an intersection of this {@link core.treeModel.Range range} and given {@link core.treeModel.Range range}. Intersection
	 * is a common part of both of those ranges. If ranges has no common part, returns `null`.
	 *
	 * Examples:
	 *
	 *		let range = new Range( new Position( root, [ 2, 7 ] ), new Position( root, [ 4, 0, 1 ] ) );
	 *		let otherRange = new Range( new Position( root, [ 1 ] ), new Position( root, [ 2 ] ) );
	 *		let transformed = range.getIntersection( otherRange ); // null - ranges have no common part
	 *
	 *		otherRange = new Range( new Position( root, [ 3 ] ), new Position( root, [ 5 ] ) );
	 *		transformed = range.getIntersection( otherRange ); // range from [ 3 ] to [ 4, 0, 1 ]
	 *
	 * @param {core.treeModel.Range} otherRange Range to check for intersection.
	 * @returns {core.treeModel.Range|null} A common part of given ranges or null if ranges have no common part.
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
	 * Computes and returns the smallest set of {@link #isFlat flat} ranges, that covers this range in whole.
	 * Assuming that tree model model structure is ("[" and "]" are range boundaries):
	 *
	 *		root                                                            root
	 *		 |- element DIV                         DIV             P2              P3             DIV
	 *		 |   |- element H                   H        P1        f o o           b a r       H         P4
	 *		 |   |   |- "fir[st"             fir[st     lorem                               se]cond     ipsum
	 *		 |   |- element P1
	 *		 |   |   |- "lorem"                                              ||
	 *		 |- element P2                                                   ||
	 *		 |   |- "foo"                                                    VV
	 *		 |- element P3
	 *		 |   |- "bar"                                                   root
	 *		 |- element DIV                         DIV             [P2             P3]             DIV
	 *		 |   |- element H                   H       [P1]       f o o           b a r        H         P4
	 *		 |   |   |- "se]cond"            fir[st]    lorem                               [se]cond     ipsum
	 *		 |   |- element P4
	 *		 |   |   |- "ipsum"
	 *
	 * As it can be seen, letters contained in the range are stloremfoobarse, spread across different parents.
	 * We are looking for minimal set of {@link #isFlat flat} ranges that contains the same nodes.
	 *
	 * Minimal flat ranges for above range `( [ 0, 0, 3 ], [ 3, 0, 2 ] )` will be:
	 *
	 *		( [ 0, 0, 3 ], [ 0, 0, 5 ] ) = "st"
	 *		( [ 0, 1 ], [ 0, 2 ] ) = element P1 ("lorem")
	 *		( [ 1 ], [ 3 ] ) = element P2, element P3 ("foobar")
	 *		( [ 3, 0, 0 ], [ 3, 0, 2 ] ) = "se"
	 *
	 * **Note:** this method is not returning flat ranges that contain no nodes. It may also happen that not-collapsed
	 * range will return an empty array of flat ranges.
	 *
	 * @returns {Array.<core.treeModel.Range>} Array of flat ranges.
	 */
	getMinimalFlatRanges() {
		let ranges = [];

		// We find on which tree-level start and end have the lowest common ancestor
		let cmp = utils.compareArrays( this.start.path, this.end.path );
		// If comparison returned string it means that arrays are same.
		let diffAt = ( typeof cmp == 'string' ) ? Math.min( this.start.path.length, this.end.path.length ) : cmp;

		let pos = Position.createFromPosition( this.start );
		let posParent = pos.parent;

		// Go up.
		while ( pos.path.length > diffAt + 1 ) {
			let howMany = posParent.getChildCount() - pos.offset;

			if ( howMany !== 0 ) {
				ranges.push( new Range( pos, pos.getShiftedBy( howMany ) ) );
			}

			pos.path = pos.path.slice( 0, -1 );
			pos.offset++;
			posParent = posParent.parent;
		}

		// Go down.
		while ( pos.path.length <= this.end.path.length ) {
			let offset = this.end.path[ pos.path.length - 1 ];
			let howMany = offset - pos.offset;

			if ( howMany !== 0 ) {
				ranges.push( new Range( pos, pos.getShiftedBy( howMany ) ) );
			}

			pos.offset = offset;
			pos.path.push( 0 );
		}

		return ranges;
	}

	/**
	 * Returns an iterator that iterates over all {@link core.treeModel.Item items} that are in this range and returns
	 * them together with additional information like length or {@link core.treeModel.Position positions},
	 * grouped as {@link core.treeModel.TreeWalkerValue}. It iterates over all {@link core.treeModel.TextFragment texts}
	 * that are inside the range and all the {@link core.treeModel.Element}s we enter into when iterating over this
	 * range.
	 *
	 * **Note:** iterator will not return a parent node of start position. This is in contrary to
	 * {@link core.treeModel.TreeWalker} which will return that node with `'ELEMENT_END'` type. Iterator also
	 * returns each {@link core.treeModel.Element} once, while simply used {@link core.treeModel.TreeWalker} might
	 * return it twice: for `'ELEMENT_START'` and `'ELEMENT_END'`.
	 *
	 * **Note:** because iterator does not return {@link core.treeModel.TreeWalkerValue values} with the type of
	 * `'ELEMENT_END'`, you can use {@link core.treeModel.TreeWalkerValue.previousPosition} as a position before the
	 * item.
	 *
	 * @see core.treeModel.TreeWalker
	 * @returns {Iterable.<core.treeModel.TreeWalkerValue>}
	 */
	*[ Symbol.iterator ]() {
		yield* new TreeWalker( { boundaries: this, ignoreElementEnd: true } );
	}

	/**
	 * Creates a {@link core.treeModel.TreeWalker} instance with this range as a boundary.
	 *
	 * @param {Object} options Object with configuration options. See {@link core.treeModel.TreeWalker}.
	 * @param {core.treeModel.Position} [options.startPosition]
	 * @param {Boolean} [options.singleCharacters=false]
	 * @param {Boolean} [options.shallow=false]
	 * @param {Boolean} [options.ignoreElementEnd=false]
	 */
	getWalker( options = {} ) {
		options.boundaries = this;

		return new TreeWalker( options );
	}

	/**
	 * Returns an iterator that iterates over all {@link core.treeModel.Item items} that are in this range and returns
	 * them. It iterates over all {@link core.treeModel.CharacterProxy characters} or
	 * {@link core.treeModel.TextFragment texts} that are inside the range and all the {@link core.treeModel.Element}s
	 * we enter into when iterating over this range. Note that it use {@link core.treeModel.TreeWalker} with the
	 * {@link core.treeModel.TreeWalker#ignoreElementEnd ignoreElementEnd} option set to true.
	 *
	 * @param {Object} options Object with configuration options. See {@link core.treeModel.TreeWalker}.
	 * @param {core.treeModel.Position} [options.startPosition]
	 * @param {Boolean} [options.singleCharacters=false]
	 * @param {Boolean} [options.shallow=false]
	 * @returns {Iterable.<core.treeModel.Item>}
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
	 * Returns an iterator that iterates over all {@link core.treeModel.Position positions} that are boundaries or
	 * contained in this range.
	 *
	 * @param {Object} options Object with configuration options. See {@link core.treeModel.TreeWalker}.
	 * @param {Boolean} [options.singleCharacters=false]
	 * @param {Boolean} [options.shallow=false]
	 * @returns {Iterable.<core.treeModel.Position>}
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
	 * Returns an array containing one or two {core.treeModel.Range ranges} that are a result of transforming this
	 * {@link core.treeModel.Range range} by inserting `howMany` nodes at `insertPosition`. Two {@link core.treeModel.Range ranges} are
	 * returned if the insertion was inside this {@link core.treeModel.Range range} and `spread` is set to `true`.
	 *
	 * Examples:
	 *
	 *		let range = new Range( new Position( root, [ 2, 7 ] ), new Position( root, [ 4, 0, 1 ] ) );
	 *		let transformed = range.getTransformedByInsertion( new Position( root, [ 1 ] ), 2 );
	 *		// transformed array has one range from [ 4, 7 ] to [ 6, 0, 1 ]
	 *
	 *		transformed = range.getTransformedByInsertion( new Position( root, [ 4, 0, 0 ] ), 4 );
	 *		// transformed array has one range from [ 2, 7 ] to [ 4, 0, 5 ]
	 *
	 *		transformed = range.getTransformedByInsertion( new Position( root, [ 3, 2 ] ), 4 );
	 *		// transformed array has one range, which is equal to original range
	 *
	 *		transformed = range.getTransformedByInsertion( new Position( root, [ 3, 2 ] ), 4, true );
	 *		// transformed array has two ranges: from [ 2, 7 ] to [ 3, 2 ] and from [ 3, 6 ] to [ 4, 0, 1 ]
	 *
	 *		transformed = range.getTransformedByInsertion( new Position( root, [ 4, 0, 1 ] ), 4, false, false );
	 *		// transformed array has one range which is equal to original range because insertion is after the range boundary
	 *
	 *		transformed = range.getTransformedByInsertion( new Position( root, [ 4, 0, 1 ] ), 4, false, true );
	 *		// transformed array has one range: from [ 2, 7 ] to [ 4, 0, 5 ] because range was expanded
	 *
	 * @param {core.treeModel.Position} insertPosition Position where nodes are inserted.
	 * @param {Number} howMany How many nodes are inserted.
	 * @param {Boolean} [spread] Flag indicating whether this {core.treeModel.Range range} should be spread if insertion
	 * was inside the range. Defaults to `false`.
	 * @param {Boolean} [isSticky] Flag indicating whether insertion should expand a range if it is in a place of
	 * range boundary. Defaults to `false`.
	 * @returns {Array.<core.treeModel.Range>} Result of the transformation.
	 */
	getTransformedByInsertion( insertPosition, howMany, spread, isSticky ) {
		isSticky = !!isSticky;

		if ( spread && this.containsPosition( insertPosition ) ) {
			// Range has to be spread. The first part is from original start to the spread point.
			// The other part is from spread point to the original end, but transformed by
			// insertion to reflect insertion changes.

			return [
				new Range( this.start, insertPosition ),
				new Range(
					insertPosition.getTransformedByInsertion( insertPosition, howMany, true ),
					this.end.getTransformedByInsertion( insertPosition, howMany, false )
				)
			];
		} else {
			const range = Range.createFromRange( this );

			range.start = range.start.getTransformedByInsertion( insertPosition, howMany, !isSticky );
			range.end = range.end.getTransformedByInsertion( insertPosition, howMany, isSticky );

			return [ range ];
		}
	}

	/**
	 * Two ranges equal if their start and end positions equal.
	 *
	 * @param {core.treeModel.Range} otherRange Range to compare with.
	 * @returns {Boolean} True if ranges equal.
	 */
	isEqual( otherRange ) {
		return this.start.isEqual( otherRange.start ) && this.end.isEqual( otherRange.end );
	}

	/**
	 * Checks and returns whether this range intersects with given range.
	 *
	 * @param {core.treeModel.Range} otherRange Range to compare with.
	 * @returns {Boolean} True if ranges intersect.
	 */
	isIntersecting( otherRange ) {
		return this.start.isBefore( otherRange.end ) && this.end.isAfter( otherRange.start );
	}

	/**
	 * Creates a range inside an element which starts before the first child and ends after the last child.
	 *
	 * @param {core.treeModel.Element} element Element which is a parent for the range.
	 * @returns {core.treeModel.Range} Created range.
	 */
	static createFromElement( element ) {
		return this.createFromParentsAndOffsets( element, 0, element, element.getChildCount() );
	}

	/**
	 * Creates a new range spreading from specified position to the same position moved by given shift.
	 *
	 * @param {core.treeModel.Position} position Beginning of the range.
	 * @param {Number} shift How long the range should be.
	 * @returns {core.treeModel.Range}
	 */
	static createFromPositionAndShift( position, shift ) {
		return new this( position, position.getShiftedBy( shift ) );
	}

	/**
	 * Creates a range from given parents and offsets.
	 *
	 * @param {core.treeModel.Element} startElement Start position parent element.
	 * @param {Number} startOffset Start position offset.
	 * @param {core.treeModel.Element} endElement End position parent element.
	 * @param {Number} endOffset End position offset.
	 * @returns {core.treeModel.Range} Created range.
	 */
	static createFromParentsAndOffsets( startElement, startOffset, endElement, endOffset ) {
		return new this(
			Position.createFromParentAndOffset( startElement, startOffset ),
			Position.createFromParentAndOffset( endElement, endOffset )
		);
	}

	/**
	 * Creates and returns a new instance of Range which is equal to passed range.
	 *
	 * @param {core.treeModel.Range} range Range to clone.
	 * @returns {core.treeModel.Range}
	 */
	static createFromRange( range ) {
		return new this( range.start, range.end );
	}
}
