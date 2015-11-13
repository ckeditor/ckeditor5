/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'document/positioniterator', 'document/position' ], ( PositionIterator, Position ) => {
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
