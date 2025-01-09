/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/tounit
 */

/**
 * Returns a helper function, which adds a desired trailing
 * `unit` to the passed value.
 *
 * @param unit An unit like "px" or "em".
 */
export default function toUnit( unit: string ): ToUnitHelper {
	return value => value + unit;
}

/**
 * A function, which adds a pre–defined trailing `unit`
 * to the passed `value`.
 *
 * @param value A value to be given the unit.
 * @returns A value with the trailing unit.
 */
export type ToUnitHelper = ( value: string | number ) => string;
