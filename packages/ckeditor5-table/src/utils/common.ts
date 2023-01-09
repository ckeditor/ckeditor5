/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/utils/common
 */

import { downcastAttributeToStyle, upcastStyleToAttribute } from './../converters/tableproperties';

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
 * @returns {module:engine/model/element~Element} Created table cell.
 */
export function createEmptyTableCell( writer, insertPosition, attributes = {} ) {
	const tableCell = writer.createElement( 'tableCell', attributes );

	writer.insertElement( 'paragraph', tableCell );
	writer.insert( tableCell, insertPosition );

	return tableCell;
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

/**
 * Enables conversion for an attribute for simple view-model mappings.
 *
 * @param {module:engine/model/schema~Schema} schema
 * @param {module:engine/conversion/conversion~Conversion} conversion
 * @param {Object} options
 * @param {String} options.modelAttribute
 * @param {String} options.styleName
 * @param {String} options.defaultValue The default value for the specified `modelAttribute`.
 * @param {Boolean} [options.reduceBoxSides=false]
 */
export function enableProperty( schema, conversion, options ) {
	const { modelAttribute } = options;

	schema.extend( 'tableCell', {
		allowAttributes: [ modelAttribute ]
	} );

	upcastStyleToAttribute( conversion, { viewElement: /^(td|th)$/, ...options } );
	downcastAttributeToStyle( conversion, { modelElement: 'tableCell', ...options } );
}
