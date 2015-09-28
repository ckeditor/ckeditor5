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
		 * Create an range.
		 *
		 * @param {document.Position} start Start position.
		 * @param {document.Position} end End position.
		 */
		constructor( start, end ) {
			/**
			 * Start position.
			 *
			 * @type {document.Position}
			 */
			this.start = start;

			/**
			 * End position.
			 *
			 * @type {document.Position}
			 */
			this.end = end;
		}

		/**
		 * Two ranges equals if first and last positions equal.
		 *
		 * @param {document.Range} otherRange Range to compare.
		 * @returns {Boolean} true if ranges equal.
		 */
		equals( otherRange ) {
			return this.start.equals( otherRange.start ) && this.end.equals( otherRange.end );
		}

		/**
		 * Range iterator.
		 *
		 * @async see document.PositionIterator
		 */
		[ Symbol.iterator ]() {
			return new PositionIterator( this );
		}
	}

	return Range;
} );