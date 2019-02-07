/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/commands/utils
 */

/**
 * Returns the parent element of given name. Returns undefined if position is not inside desired parent.
 *
 * @param {String} parentName Name of parent element to find.
 * @param {module:engine/model/position~Position|module:engine/model/position~Position} position Position to start searching.
 * @returns {module:engine/model/element~Element|module:engine/model/documentfragment~DocumentFragment}
 */
export function findAncestor( parentName, position ) {
	let parent = position.parent;

	while ( parent ) {
		if ( parent.name === parentName ) {
			return parent;
		}

		parent = parent.parent;
	}
}

/**
 * A common method to update the numeric value. If a value is the default one, it will be unset.
 *
 * @param {String} key Attribute key.
 * @param {*} value The new attribute value.
 * @param {module:engine/model/item~Item} item Model item on which the attribute will be set.
 * @param {module:engine/model/writer~Writer} writer
 * @param {*} defaultValue Default attribute value. If a value is lower or equal, it will be unset.
 */
export function updateNumericAttribute( key, value, item, writer, defaultValue = 1 ) {
	if ( value > defaultValue ) {
		writer.setAttribute( key, value, item );
	} else {
		writer.removeAttribute( key, item );
	}
}

/**
 * Common method to create empty table cell - it will create proper model structure as table cell must have at least one block inside.
 *
 * @param {module:engine/model/writer~Writer} writer Model writer.
 * @param {module:engine/model/position~Position} insertPosition Position at which table cell should be inserted.
 * @param {Object} attributes Element's attributes.
 */
export function createEmptyTableCell( writer, insertPosition, attributes = {} ) {
	const tableCell = writer.createElement( 'tableCell', attributes );
	writer.insertElement( 'paragraph', tableCell );
	writer.insert( tableCell, insertPosition );
}
