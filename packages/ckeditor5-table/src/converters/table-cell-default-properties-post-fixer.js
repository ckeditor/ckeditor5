/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/converters/table-layout-post-fixer
 */

import TableWalker from './../tablewalker';

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

	// Do not analyze the same table more then once - may happen for multiple changes in the same table.
	const analyzedTables = new Set();

	for ( const entry of changes ) {
		let table;

		if ( entry.name == 'table' && entry.type == 'insert' ) {
			table = entry.position.nodeAfter;
		}

		// Fix table on adding/removing table cells and rows.
		if ( entry.name == 'tableRow' ) {
			table = entry.position.findAncestor( 'table' );
		}

		// Fix table on adding/removing table cells and rows.
		if ( entry.name == 'tableCell' ) {
			table = entry.position.findAncestor( 'table' );
		}

		if ( table && !analyzedTables.has( table ) ) {
			// For each cell in the table...
			for ( const item of new TableWalker( table ) ) {
				// ...check its cell properties...
				if ( shouldApplyDefaultCellProperties( item.cell ) ) {
					// ...and if cell has no properties, apply the default one.
					writer.setAttributes( cellProperties, item.cell );

					wasFixed = true;
				}
			}

			analyzedTables.add( table );
		}
	}

	return wasFixed;
}

function shouldApplyDefaultCellProperties( tableCell ) {
	return [ ...tableCell.getAttributeKeys() ].filter( attributeName => {
		return attributeName !== 'colspan' && attributeName !== 'rowspan';
	} ).length === 0;
}
