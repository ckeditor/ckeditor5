/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'document/position', 'document/positioniterator', 'utils' ], ( Position, PositionIterator, utils ) => {
	/**
	 * Range class. Range is iterable.
	 *
	 * @class document.Range
	 */
	class Range {
		/**
		 * Creates a range.
		 *
		 * @param {document.Position} start Start position.
		 * @param {document.Position} end End position.
		 * @constructor
		 */
		constructor( start, end ) {
			/**
			 * Start position.
			 *
			 * @property {document.Position}
			 */
			this.start = start;

			/**
			 * End position.
			 *
			 * @property {document.Position}
			 */
			this.end = end;
		}

		/**
		 * Creates a range inside an element which starts before the first child and ends after the last child.
		 *
		 * @param {document.Element} element Element which is a parent for the range.
		 * @returns {document.Range} Created range.
		 */
		static createFromElement( element ) {
			return Range.createFromParentsAndOffsets( element, 0, element, element.getChildCount() );
		}

		/**
		 * Creates a range from given parents and offsets.
		 *
		 * @param {document.Element} startElement Start position parent element.
		 * @param {Number} startOffset Start position offset.
		 * @param {document.Element} endElement End position parent element.
		 * @param {Number} endOffset End position offset.
		 * @returns {document.Range} Created range.
		 */
		static createFromParentsAndOffsets( startElement, startOffset, endElement, endOffset ) {
			return new Range(
					Position.createFromParentAndOffset( startElement, startOffset ),
					Position.createFromParentAndOffset( endElement, endOffset )
				);
		}

		/**
		 * Two ranges equal if their start and end positions equal.
		 *
		 * @param {document.Range} otherRange Range to compare with.
		 * @returns {Boolean} True if ranges equal.
		 */
		isEqual( otherRange ) {
			return this.start.isEqual( otherRange.start ) && this.end.isEqual( otherRange.end );
		}

		/**
		 * Checks whether this {document.Range range} intersects with the given {document.Range range}.
		 *
		 * @param {document.Range} otherRange Range to check.
		 * @returns {boolean} True if ranges intersect.
		 */
		intersectsWith( otherRange ) {
			const isBefore = this.start.compareWith( otherRange.start ) == Position.BEFORE &&
				this.end.compareWith( otherRange.start ) == Position.BEFORE;

			const isAfter = this.start.compareWith( otherRange.end ) == Position.AFTER &&
				this.end.compareWith( otherRange.end ) == Position.AFTER;

			const touches = this.start.isEqual( otherRange.end ) || this.end.isEqual( otherRange.start );

			return !isBefore && !isAfter && !touches;
		}

		/**
		 * Creates and returns a new instance of {@link document.Range}
		 * that is equal to this {@link document.Range range}.
		 *
		 * @returns {document.Position} Cloned {@link document.Range range}.
		 */
		clone() {
			return new Range( this.start.clone(), this.end.clone() );
		}

		/**
		 * Checks whether this {document.Range range} contains given (document.Position position}.
		 *
		 * @param {document.Position} position Position to check.
		 * @returns {boolean} True if given {document.Position position} is contained.
		 */
		containsPosition( position ) {
			return position.compareWith( this.start ) == Position.AFTER && position.compareWith( this.end ) == Position.BEFORE;
		}

		/**
		 * Returns an array containing one or two {document.Range ranges} that are results of transforming this
		 * {document.Range range} by inserting `howMany` nodes at `insertPosition`. Two {document.Range ranges} are
		 * returned if the insertion was inside this {document.Range range}.
		 *
		 * Examples:
		 * 	let range = new Range( new Position( [ 2, 7 ], root ), new Position( [ 4, 0, 1 ], root ) );
		 * 	let transformed = range.getTransformedByInsertion( new Position( [ 1 ], root ), 2 );
		 * 	// transformed array has one range from [ 4, 7 ] to [ 6, 0, 1 ]
		 *
		 * 	transformed = range.getTransformedByInsertion( new Position( [ 3, 2 ], root ), 4 );
		 * 	// transformed array has two ranges: from [ 2, 7 ] to [ 3, 2 ] and from [ 3, 6 ] to [ 4, 0, 1 ]
		 *
		 * 	transformed = range.getTransformedByInsertion( new Position( [ 3, 2 ], root ), 4, true );
		 * 	// transformed array has one range which is equal to `range`. This is because of spreadOnlyOnSameLevel flag.
		 *
		 * @param {document.Position} insertPosition Position where nodes are inserted.
		 * @param {Number} howMany How many nodes are inserted.
		 * @param {Boolean} spreadOnlyOnSameLevel Flag indicating whether this {document.Range range} should be spread
		 * if insertion was inside a node from this {document.Range range} but not in the range itself.
		 * @returns {Array.<document.Range>} Result of the transformation.
		 */
		getTransformedByInsertion( insertPosition, howMany, spreadOnlyOnSameLevel ) {
			// Flag indicating whether this whole range and given insertPosition is on the same tree level.
			const areOnSameLevel = utils.compareArrays( this.start.parentPath, this.end.parentPath ) == utils.compareArrays.SAME &&
				utils.compareArrays( this.start.parentPath, insertPosition.parentPath ) == utils.compareArrays.SAME;

			if ( this.containsPosition( insertPosition ) && ( !spreadOnlyOnSameLevel || areOnSameLevel ) ) {
				// Range has to be spread. The first part is from original start to the spread point.
				// The other part is from spread point to the original end, but transformed by
				// insertion to reflect insertion changes.

				return [
					new Range(
						insertPosition.getTransformedByInsertion( insertPosition, howMany, true ),
						this.end.getTransformedByInsertion( insertPosition, howMany, true )
					),
					new Range(
						this.start.clone(),
						insertPosition.clone()
					)
				];
			} else {
				// If insertion is not inside the range, simply transform range boundaries (positions) by the insertion.
				// Both, one or none of them might be affected by the insertion.

				const range = this.clone();

				range.start = range.start.getTransformedByInsertion( insertPosition, howMany, true );
				range.end = range.end.getTransformedByInsertion( insertPosition, howMany, false );

				return [ range ];
			}
		}

		/**
		 * Gets a part of this {document.Range range} that is not a part of given {document.Range range}. Returned
		 * array contains zero, one or two {document.Range ranges}.
		 *
		 * Examples:
		 * 	let range = new Range( new Position( [ 2, 7 ], root ), new Position( [ 4, 0, 1 ], root ) );
		 * 	let otherRange = new Range( new Position( [ 1 ], root ), new Position( [ 5 ], root ) );
		 * 	let transformed = range.getDifference( otherRange );
		 * 	// transformed array has no ranges because `otherRange` contains `range`
		 *
		 * 	otherRange = new Range( new Position( [ 1 ], root ), new Position( [ 3 ], root ) );
		 * 	transformed = range.getDifference( otherRange );
		 * 	// transformed array has one range: from [ 3 ] to [ 4, 0, 1 ]
		 *
		 * 	otherRange = new Range( new Position( [ 3 ], root ), new Position( [ 4 ], root ) );
		 * 	transformed = range.getDifference( otherRange );
		 * 	// transformed array has two ranges: from [ 2, 7 ] to [ 3 ] and from [ 4 ] to [ 4, 0, 1 ]
		 *
		 * @param {document.Range} otherRange Range to differentiate against.
		 * @returns {Array.<document.Range>} The difference between ranges.
		 */
		getDifference( otherRange ) {
			// If ranges do not intersect, return the original range.
			if ( !otherRange.intersectsWith( this ) ) {
				return [
					this.clone()
				];
			}

			// At this point we know that ranges intersect but given range does not contain this range.
			const ranges = [];

			if ( this.containsPosition( otherRange.start ) ) {
				// Given range start is inside this range. This means that we have to
				// add shrunken range - from the start to the middle of this range.
				ranges.push(
					new Range(
						this.start.clone(),
						otherRange.start.clone()
					)
				);
			}

			if ( this.containsPosition( otherRange.end ) ) {
				// Given range end is inside this range. This means that we have to
				// add shrunken range - from the middle of this range to the end.
				ranges.push(
					new Range(
						otherRange.end.clone(),
						this.end.clone()
					)
				);
			}

			return ranges;
		}

		/**
		 * Returns a part of this {document.Range range} that is also a part of given {document.Range range}. If
		 * ranges has no common part, returns null.
		 *
		 * Examples:
		 * 	let range = new Range( new Position( [ 2, 7 ], root ), new Position( [ 4, 0, 1 ], root ) );
		 * 	let otherRange = new Range( new Position( [ 1 ], root ), new Position( [ 2 ], root ) );
		 * 	let transformed = range.getCommon( otherRange ); // null - ranges have no common part
		 *
		 * 	otherRange = new Range( new Position( [ 3 ], root ), new Position( [ 5 ], root ) );
		 * 	transformed = range.getCommon( otherRange ); // range from [ 3 ] to [ 4, 0, 1 ]
		 *
		 * @param {document.Range} otherRange Range to compare with.
		 * @returns {document.Range} Range that is common part of given ranges.
		 */
		getCommon( otherRange ) {
			// If ranges do not intersect, they do not have common part.
			if ( !otherRange.intersectsWith( this ) ) {
				return null;
			}

			// At this point we know that ranges intersect, so a common range will be returned.
			// At most, it will be same as this range.
			let commonRangeStart = this.start;
			let commonRangeEnd = this.end;

			if ( this.containsPosition( otherRange.start ) ) {
				// Given range start is inside this range. This means that we have to
				// shrink common range to the given range start.
				commonRangeStart = otherRange.start;
			}

			if ( this.containsPosition( otherRange.end ) ) {
				// Given range end is inside this range. This means that we have to
				// shrink common range to the given range end.
				commonRangeEnd = otherRange.end;
			}

			return new Range( commonRangeStart.clone(), commonRangeEnd.clone() );
		}

		/**
		 * Creates a new range spreading from specified position to the same position moved by given offset.
		 *
		 * @param {document.Position} position Beginning of the range.
		 * @param {Number} offset How long the range should be.
		 * @returns {document.Range}
		 */
		static createFromPositionAndOffset( position, offset ) {
			let endPosition = position.clone();
			endPosition.offset += offset;

			return new Range( position, endPosition );
		}

		/**
		 * Range iterator.
		 *
		 * @see document.PositionIterator
		 */
		[ Symbol.iterator ]() {
			return new PositionIterator( this );
		}
	}

	return Range;
} );
