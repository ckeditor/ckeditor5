/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module utils/dom/tounit
 */

/**
 * Returns a helper function, which adds a desired trailing
 * `unit` to the passed value.
 *
 * @param {String} unit An unit like "px" or "em".
 * @returns {module:utils/dom/tounit~helper}
 */
export default function toUnit( unit ) {
	/**
	 * A function, which adds a pre–defined trailing `unit`
	 * to the passed `value`.
	 *
	 * @function helper
 	 * @param {*} value A value to be given the unit.
 	 * @returns {String} A value with the trailing unit.
	 */
	return value => value + unit;
}
