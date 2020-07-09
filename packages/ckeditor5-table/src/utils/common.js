/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/utils/common
 */

/**
 * A common method to update the numeric value. If a value is the default one, it will be unset.
 *
 * @param {String} key An attribute key.
 * @param {*} value The new attribute value.
 * @param {module:engine/model/item~Item} item A model item on which the attribute will be set.
 * @param {module:engine/model/writer~Writer} writer
 * @param {*} defaultValue The default attribute value. If a value is lower or equal, it will be unset.
 */
export function updateNumericAttribute( key, value, item, writer, defaultValue = 1 ) {
	if ( value > defaultValue ) {
		writer.setAttribute( key, value, item );
	} else {
		writer.removeAttribute( key, item );
	}
}

/**
 * A common method to create an empty table cell. It creates a proper model structure as a table cell must have at least one block inside.
 *
 * @param {module:engine/model/writer~Writer} writer The model writer.
 * @param {module:engine/model/position~Position} insertPosition The position at which the table cell should be inserted.
 * @param {Object} attributes The element attributes.
 */
export function createEmptyTableCell( writer, insertPosition, attributes = {} ) {
	const tableCell = writer.createElement( 'tableCell', attributes );
	writer.insertElement( 'paragraph', tableCell );
	writer.insert( tableCell, insertPosition );
}

/**
 * Checks if a table cell belongs to the heading column section.
 *
 * @param {module:table/tableutils~TableUtils} tableUtils
 * @param {module:engine/model/element~Element} tableCell
 * @returns {Boolean}
 */
export function isHeadingColumnCell( tableUtils, tableCell ) {
	const table = tableCell.parent.parent;
	const headingColumns = parseInt( table.getAttribute( 'headingColumns' ) || 0 );
	const { column } = tableUtils.getCellLocation( tableCell );

	return !!headingColumns && column < headingColumns;
}
