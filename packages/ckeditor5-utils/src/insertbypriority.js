/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import priorities from './priorities';

/**
 * @module utils/insertbypriority
 */

/**
 * The priority object descriptor.
 *
 *		const objectWithPriority = {
 *			priority: 'high'
 *		}
 *
 * @typedef {Object} module:utils/priorities~ObjectWithPriority
 *
 * @property {module:utils/priorities~PriorityString} priority Priority of the object
 */

/**
 * Inserts any object with priority at correct index by priority so registered objects are always sorted from highest to lowest priority
 *
 * @param {Array.<module:utils/priorities~ObjectWithPriority>} objects Array of objects with priority to insert object to
 * @param {Object.<String,<module:utils/priorities~ObjectWithPriority} objectWithPriority Object with `priority` property
 */
function insertByPriority( objects, objectToInsert ) {
	for ( let i = 0; i <= objects.length; i++ ) {
		if ( !objects[ i ] || priorities.get( objects[ i ].priority ) < priorities.get( objectToInsert.priority ) ) {
			objects.splice( i, 0, objectToInsert );

			break;
		}
	}
}

export default insertByPriority;
