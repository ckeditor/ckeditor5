/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'document/positioniterator' ], function( PositionIterator ) {
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
