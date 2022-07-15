/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import priorities from './priorities';

/**
 * @module utils/inserttopriorityarray
 */

/**
 * The priority object descriptor.
 *
 *		const objectWithPriority = {
 *			priority: 'high'
 *		}
 *
 * @typedef {Object} module:utils/inserttopriorityarray~ObjectWithPriority
 *
 * @property {module:utils/priorities~PriorityString|Number} priority Priority of the object.
 */

/**
 * Inserts any object with priority at correct index by priority so registered objects are always sorted from highest to lowest priority.
 *
 * @param {Array.<module:utils/inserttopriorityarray~ObjectWithPriority>} objects Array of objects with priority to insert object to.
 * @param {module:utils/inserttopriorityarray~ObjectWithPriority} objectToInsert Object with `priority` property.
 */
export default function insertToPriorityArray( objects, objectToInsert ) {
	const priority = priorities.get( objectToInsert.priority );

	for ( let i = 0; i < objects.length; i++ ) {
		if ( priorities.get( objects[ i ].priority ) < priority ) {
			objects.splice( i, 0, objectToInsert );

			return;
		}
	}

	objects.push( objectToInsert );
}
