/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import priorities, { type PriorityString } from './priorities.js';

/**
 * @module utils/inserttopriorityarray
 */

/**
 * The priority object descriptor.
 *
 * ```ts
 * const objectWithPriority = {
 * 	priority: 'high'
 * }
 * ```
 */
export interface ObjectWithPriority {

	/**
	 * Priority of the object.
	 */
	priority: PriorityString;
}

/**
 * Inserts any object with priority at correct index by priority so registered objects are always sorted from highest to lowest priority.
 *
 * @param objects Array of objects with priority to insert object to.
 * @param objectToInsert Object with `priority` property.
 */
export default function insertToPriorityArray<T extends ObjectWithPriority>( objects: Array<T>, objectToInsert: T ): void {
	const priority = priorities.get( objectToInsert.priority );

	// Binary search for better performance in large tables.
	let left = 0;
	let right = objects.length;

	while ( left < right ) {
		const mid = ( left + right ) >> 1; // Use bitwise operator for faster floor division by 2.
		const midPriority = priorities.get( objects[ mid ].priority );

		if ( midPriority < priority ) {
			right = mid;
		} else {
			left = mid + 1;
		}
	}

	objects.splice( left, 0, objectToInsert );
}
