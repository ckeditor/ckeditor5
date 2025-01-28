/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/priorities
 */

/**
 * String representing a priority value.
 */
export type PriorityString = 'highest' | 'high' | 'normal' | 'low' | 'lowest' | number;

// This interface exists to make our API pages more readable.
/**
 * Provides group of constants to use instead of hardcoding numeric priority values.
 */
export interface PrioritiesType {

	/**
	 * Converts a string with priority name to it's numeric value. If `Number` is given, it just returns it.
	 *
	 * @param priority Priority to convert.
	 * @returns Converted priority.
	 */
	get( priority?: PriorityString ): number;

	readonly highest: number;
	readonly high: number;
	readonly normal: number;
	readonly low: number;
	readonly lowest: number;
}

/**
 * Provides group of constants to use instead of hardcoding numeric priority values.
 */
const priorities: PrioritiesType = {
	get( priority: PriorityString = 'normal' ): number {
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
