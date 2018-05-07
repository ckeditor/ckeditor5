/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/commands/utils
 */

/**
 * Returns parent table.
 *
 * @param {module:engine/model/position} position
 * @returns {*}
 */
export function getParentTable( position ) {
	let parent = position.parent;

	while ( parent ) {
		if ( parent.name === 'table' ) {
			return parent;
		}

		parent = parent.parent;
	}
}
