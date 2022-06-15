/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecolumnresize/constants
 */

/* istanbul ignore file */

/**
 * The minimum column width given as a percentage value. Used in situations when the table is not yet rendered, so it is impossible to
 * calculate how many percentage of the table width would be {@link ~COLUMN_MIN_WIDTH_IN_PIXELS minimum column width in pixels}.
 *
 * @const {Number}
 */
export const COLUMN_MIN_WIDTH_AS_PERCENTAGE = 5;

/**
 * The minimum column width in pixels when the maximum table width is known.
 *
 * @const {Number}
 */
export const COLUMN_MIN_WIDTH_IN_PIXELS = 40;

/**
 * Determines how many digits after the decimal point are used to store the column width as a percentage value.
 *
 * @const {Number}
 */
export const COLUMN_WIDTH_PRECISION = 2;
