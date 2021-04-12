/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/converters/table-layout-post-fixer
 */

const TABLE_CELL_PROPERTIES = [
	'borderStyle',
	'borderColor',
	'borderWidth',
	'backgroundColor',
	'padding',
	'horizontalAlignment',
	'verticalAlignment',
	'width',
	'height'
];

/**
 * Injects a table cell default properties post-fixer into the model.
 *
 * A table cell should have specified the default properties when a new cell was added into the table.
 *
 * @param {module:core/editor/editor~Editor} editor
 */
export default function injectTableCellDefaultPropertiesPostFixer( editor ) {
	editor.model.document.registerPostFixer( writer => tableCellDefaultPropertiesPostFixer( writer, editor ) );
}

// The table cell default properties post-fixer.
//
// @param {module:engine/model/writer~Writer} writer
// @param {module:core/editor/editor~Editor} editor
function tableCellDefaultPropertiesPostFixer( writer, editor ) {
	const model = editor.model;
	const changes = model.document.differ.getChanges();
	const cellProperties = editor.config.get( 'table.tableCellProperties.defaultProperties' );

	// Do not check anything if the default cell properties are not specified.
	if ( Object.keys( cellProperties ).length === 0 ) {
		return false;
	}

	let wasFixed = false;

	for ( const entry of changes ) {
		if ( entry.type != 'insert' ) {
			continue;
		}

		// Fix table on adding/removing table cells and rows.
		if ( entry.name == 'tableRow' ) {
			const tableRow = entry.position.nodeAfter;

			// For each cell in the table row...
			for ( const tableCell of tableRow.getChildren() ) {
				// ...check its cell properties...
				if ( shouldApplyDefaultCellProperties( tableCell ) ) {
					// ...and if the cell has no properties, apply the default.
					writer.setAttributes( cellProperties, tableCell );

					wasFixed = true;
				}
			}
		}

		// Fix table cell on adding/removing table cells and rows.
		if ( entry.name == 'tableCell' ) {
			const tableCell = entry.position.nodeAfter;

			if ( shouldApplyDefaultCellProperties( tableCell ) ) {
				// ...and if the cell has no properties, apply the default.
				writer.setAttributes( cellProperties, tableCell );

				wasFixed = true;
			}
		}
	}

	return wasFixed;
}

// Checks whether the default properties should be applied for the specified cell.
//
// The default properties will be applied only if the cell does not contain any "visual" properties.
//
// @param {module:engine/model/element~Element} tableCell
// @returns {Boolean}
function shouldApplyDefaultCellProperties( tableCell ) {
	const attrs = [ ...tableCell.getAttributeKeys() ];

	return attrs.some( attributeName => TABLE_CELL_PROPERTIES.includes( attributeName ) ) === false;
}
