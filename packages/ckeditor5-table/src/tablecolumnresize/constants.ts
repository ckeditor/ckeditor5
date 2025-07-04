/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablecolumnresize/constants
 */

/**
 * The minimum column width given as a percentage value. Used in situations when the table is not yet rendered, so it is impossible to
 * calculate how many percentage of the table width would be {@link ~COLUMN_MIN_WIDTH_IN_PIXELS minimum column width in pixels}.
 *
 * @internal
 */
export const COLUMN_MIN_WIDTH_AS_PERCENTAGE = 5;

/**
 * The minimum column width in pixels when the maximum table width is known.
 * This value is an equivalent of `10%` of the default editor width (600px).
 *
 * @internal
 */
export const COLUMN_MIN_WIDTH_IN_PIXELS = 40;

/**
 * Determines how many digits after the decimal point are used to store the column width as a percentage value.
 *
 * @internal
 */
export const COLUMN_WIDTH_PRECISION = 2;

/**
 * The distance in pixels that the mouse has to move to start resizing the column.
 *
 * @internal
 */
export const COLUMN_RESIZE_DISTANCE_THRESHOLD = 3;
