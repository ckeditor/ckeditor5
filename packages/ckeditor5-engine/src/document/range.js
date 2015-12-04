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
		 * Range iterator.
		 *
		 * @see document.PositionIterator
		 */
		[ Symbol.iterator ]() {
			return new PositionIterator( this );
		}

		/**
		 * Creates and returns a new instance of {@link document.Range}
		 * which is equal to this {@link document.Range range}.
		 *
		 * @returns {document.Position} Cloned {@link document.Range range}.
		 */
		clone() {
			return new Range( this.start.clone(), this.end.clone() );
		}

		/**
		 * Checks whether this contains given {@link document.Position position}.
		 *
		 * @param {document.Position} position Position to check.
		 * @returns {Boolean} True if given {@link document.Position position} is contained.
		 */
		containsPosition( position ) {
			return position.isAfter( this.start ) && position.isBefore( this.end );
		}

		/**
		 * Checks whether this range contains given {@link document.Range range}.
		 *
		 * @param {document.Range} otherRange Range to check.
		 * @returns {Boolean} True if given {@link document.Range range} boundaries are contained by this range.
		 */
		containsRange( otherRange ) {
			return this.containsPosition( otherRange.start ) && this.containsPosition( otherRange.end );
		}

		/**
		 * Gets a part of this {@link document.Range range} which is not a part of given {@link document.Range range}. Returned
		 * array contains zero, one or two {@link document.Range ranges}.
		 *
		 * Examples:
		 *
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
			const ranges = [];

			if ( this.start.isBefore( otherRange.end ) && this.end.isAfter( otherRange.start ) ) {
				// Ranges intersect.

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
			} else {
				// Ranges do not intersect, return the original range.
				ranges.push( this.clone() );
			}

			return ranges;
		}

		/**
		 * Returns an intersection of this {@link document.Range range} and given {@link document.Range range}. Intersection
		 * is a common part of both of those ranges. If ranges has no common part, returns `null`.
		 *
		 * Examples:
		 *
		 * 	let range = new Range( new Position( [ 2, 7 ], root ), new Position( [ 4, 0, 1 ], root ) );
		 * 	let otherRange = new Range( new Position( [ 1 ], root ), new Position( [ 2 ], root ) );
		 * 	let transformed = range.getIntersection( otherRange ); // null - ranges have no common part
		 *
		 * 	otherRange = new Range( new Position( [ 3 ], root ), new Position( [ 5 ], root ) );
		 * 	transformed = range.getIntersection( otherRange ); // range from [ 3 ] to [ 4, 0, 1 ]
		 *
		 * @param {document.Range} otherRange Range to check for intersection.
		 * @returns {document.Range|null} A common part of given ranges or null if ranges have no common part.
		 */
		getIntersection( otherRange ) {
			if ( this.start.isBefore( otherRange.end ) && this.end.isAfter( otherRange.start ) ) {
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

				return new Range( commonRangeStart.clone(), commonRangeEnd.clone() );
			}

			// Ranges do not intersect, so they do not have common part.
			return null;
		}

		/**
		 * Returns an array containing one or two {document.Range ranges} that are a result of transforming this
		 * {@link document.Range range} by inserting `howMany` nodes at `insertPosition`. Two {@link document.Range ranges} are
		 * returned if the insertion was inside this {@link document.Range range}.
		 *
		 * Examples:
		 *
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
			const areOnSameLevel = utils.compareArrays( this.start.getParentPath(), this.end.getParentPath() ) == utils.compareArrays.SAME &&
				utils.compareArrays( this.start.getParentPath(), insertPosition.getParentPath() ) == utils.compareArrays.SAME;

			if ( this.containsPosition( insertPosition ) && ( !spreadOnlyOnSameLevel || areOnSameLevel ) ) {
				// Range has to be spread. The first part is from original start to the spread point.
				// The other part is from spread point to the original end, but transformed by
				// insertion to reflect insertion changes.

				return [
					new Range(
						this.start.clone(),
						insertPosition.clone()
					),
					new Range(
						insertPosition.getTransformedByInsertion( insertPosition, howMany, true ),
						this.end.getTransformedByInsertion( insertPosition, howMany, true )
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
		 * Two ranges equal if their start and end positions equal.
		 *
		 * @param {document.Range} otherRange Range to compare with.
		 * @returns {Boolean} True if ranges equal.
		 */
		isEqual( otherRange ) {
			return this.start.isEqual( otherRange.start ) && this.end.isEqual( otherRange.end );
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
	}

	return Range;
} );
