/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * String representing a priority value.
 *
 * @typedef {'highest'|'high'|'normal'|'low'|'lowest'} utils.PriorityString
 */

/**
 * Provides group of constants to use instead of hardcoding numeric priority values.
 *
 * @memberOf utils
 */
const priorities = {
	/**
	 * Converts a string with priority name to it's numeric value. If `Number` is given, it just returns it.
	 *
	 * @param {utils.PriorityString|Number} priority Priority to convert.
	 * @returns {Number} Converted priority.
	 */
	get( priority ) {
		if ( typeof priority != 'number' ) {
			return this[ priority ] || this.normal;
		} else {
			return priority;
		}
	},

	highest: 100000,
	high: 1000,
	normal: 0,
	low: -1000,
	lowest: -100000
};

export default priorities;
