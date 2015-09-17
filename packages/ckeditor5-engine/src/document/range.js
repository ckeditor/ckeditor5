/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'document/rangeiterator' ], function( RangeIterator ) {
	/**
	 * Range class.
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

		equals( otherRange ) {
			return this.start === otherRange.start && this.end === otherRange.end;
		}

		[ Symbol.iterator ]() {
			return new RangeIterator( this );
		}
	}

	return Range;
} );