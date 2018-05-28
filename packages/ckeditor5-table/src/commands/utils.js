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
 * @param {module:engine/model/position~Position} position
 * @returns {module:engine/model/element~Element|module:engine/model/documentfragment~DocumentFragment}
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

/**
 * Common method to update numeric value. If value is default one it will be unset.
 *
 * @param {String} key Attribute key.
 * @param {*} value Attribute new value.
 * @param {module:engine/model/item~Item} item Model item on which the attribute will be set.
 * @param {module:engine/model/writer~Writer} writer
 * @param {*} defaultValue Default attribute value if value is lower or equal then it will be unset.
 */
export function updateNumericAttribute( key, value, item, writer, defaultValue = 1 ) {
	if ( value > defaultValue ) {
		writer.setAttribute( key, value, item );
	} else {
		writer.removeAttribute( key, item );
	}
}
