/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
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

/**
 * The distance (in pixels) around the container's width within which a dragged table edge snaps to exactly
 * 100% of the container width, in either direction - making it easy to precisely land on that value.
 *
 * @internal
 */
export const TABLE_WIDTH_SNAP_THRESHOLD_IN_PIXELS = 5;

/**
 * How much further (in pixels, on top of the snap threshold above) a table edge has to be dragged past the
 * container's width before it actually starts growing past 100% again. This is what makes 100% "sticky" -
 * while still letting the table grow past it with a deliberate, longer drag.
 *
 * @internal
 */
export const TABLE_WIDTH_GROWTH_RESISTANCE_IN_PIXELS = 10;
