/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/converters/table-post-fixer
 */

import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import { getParentTable, updateNumericAttribute } from './../commands/utils';
import TableWalker from './../tablewalker';

/**
 * Injects a table post-fixer into the model.
 *
 * The role of the table post-fixer is to ensure that the table rows have the correct structure
 * after a {@link module:engine/model/model~Model#change `change()`} block was executed.
 *
 * The correct structure means that:
 *
 * * All table rows have the same size.
 * * None of a table cells that extend vertically beyond their section (either header or body).
 *
 * If the table structure is not correct, the post-fixer will automatically correct it in two steps:
 *
 * 1. It will clip table cells that extends beyond it section.
 * 2. It will add empty table cells to those rows which are narrower then the widest table row.
 *
 * ## Clipping overlapping table cells
 *
 * Such situation may occur when pasting a table (or part of a table) to the editor from external sources.
 *
 * For example, see the following table which has the cell (FOO) with the rowspan attribute (2):
 *
 *		<table headingRows="1">
 *			<tableRow>
 *				<tableCell rowspan="2">FOO</tableCell>
 *				<tableCell colspan="2">BAR</tableCell>
 *			</tableRow>
 *			<tableRow>
 *				<tableCell>BAZ</tableCell>
 *				<tableCell>XYZ</tableCell>
 *			</tableRow>
 *		</table>
 *
 * will be rendered in the view as:
 *
 *		<table>
 *			<thead>
 *				<tr>
 *					<td rowspan="2">FOO</td>
 *					<td colspan="2">BAR</td>
 *				</tr>
 *			</thead>
 *			<tbody>
 *				<tr>
 *					<td>BAZ<td>
 *					<td>XYZ<td>
 *				</tr>
 *			</tbody>
 *		</table>
 *
 * In the above example the table will be rendered as a table with two rows - one in the header and second one in the body.
 * The table cell (FOO) cannot span over multiple rows as it would expand from the header to the body section.
 * The `rowspan` attribute must be changed to (1). The value (1) is a default value of the `rowspan` attribute
 * so the `rowspan` attribute will be removed from the model.
 *
 * The table cell with BAZ contents will be in the first column of the table.
 *
 * ## Adding missing table cells
 *
 * The table post-fixer will insert empty table cells to equalize table rows sizes (number of columns).
 * The size of a table row is calculated by counting column spans of table cells - both horizontal (from the same row) and
 * vertical (from rows above).
 *
 * In the above example, the table row in the body section of the table is narrower then the row from the header - it has two cells
 * with the default colspan (1). The header row has one cell with colspan (1) and second with colspan (2).
 * The table cell (FOO) does not expand beyond the head section (and as such will be fixed in the first step of this post-fixer).
 * The post-fixer will add a missing table cell to the row in the body section of the table.
 *
 * The table from the above example will be fixed and rendered to the view as below:
 *
 *		<table>
 *			<thead>
 *				<tr>
 *					<td rowspan="2">FOO</td>
 *					<td colspan="2">BAR</td>
 *				</tr>
 *			</thead>
 *			<tbody>
 *				<tr>
 *					<td>BAZ<td>
 *					<td>XYZ<td>
 *				</tr>
 *			</tbody>
 *		</table>
 *
 * **Note** The table post-fixer only ensures proper structure without deeper analysis of the nature of a change. As such, it might lead
 * to a structure which was not intended by the user changes. In particular, it will also fix undo steps (in conjunction with collaboration)
 * in which editor content might not return to the original state.
 *
 * @param {module:engine/model/model~Model} model
 */
export default function injectTablePostFixer( model ) {
	model.document.registerPostFixer( writer => tablePostFixer( writer, model ) );
}

// The table post-fixer.
//
// @param {module:engine/model/writer~Writer} writer
// @param {module:engine/model/model~Model} model
function tablePostFixer( writer, model ) {
	const changes = model.document.differ.getChanges();

	let wasFixed = false;

	// Do not analyze the same table more then once - may happen for multiple changes in the same table.
	const analyzedTables = new Set();

	for ( const entry of changes ) {
		let table;

		// Fix table on table insert.
		if ( entry.name == 'table' && entry.type == 'insert' ) {
			table = entry.position.nodeAfter;
		}

		// Fix table on adding/removing table cells and rows.
		if ( entry.name == 'tableRow' || entry.name == 'tableCell' ) {
			table = getParentTable( entry.position );
		}

		// Fix table on any table's attribute change - including attributes of table cells.
		if ( isTableAttributeEntry( entry ) ) {
			table = getParentTable( entry.range.start );
		}

		if ( table && !analyzedTables.has( table ) ) {
			// Step 1: correct rowspans of table cells if necessary.
			// The wasFixed flag should be true if any of tables in batch was fixed - might be more then one.
			wasFixed = fixTableCellsRowspan( table, writer ) || wasFixed;
			// Step 2: fix table rows sizes.
			wasFixed = fixTableRowsSizes( table, writer ) || wasFixed;

			analyzedTables.add( table );
		}
	}

	return wasFixed;
}

// Fixes the invalid value of the rowspan attribute because a table cell cannot vertically extend beyond the table section it belongs to.
//
// @param {module:engine/model/element~Element} table
// @param {module:engine/model/writer~Writer} writer
// @returns {Boolean} Returns true if table was fixed.
function fixTableCellsRowspan( table, writer ) {
	let wasFixed = false;

	const cellsToTrim = findCellsToTrim( table );

	if ( cellsToTrim.length ) {
		wasFixed = true;

		for ( const data of cellsToTrim ) {
			updateNumericAttribute( 'rowspan', data.rowspan, data.cell, writer, 1 );
		}
	}

	return wasFixed;
}

// Makes all table rows in a table the same size.
//
// @param {module:engine/model/element~Element} table
// @param {module:engine/model/writer~Writer} writer
// @returns {Boolean} Returns true if table was fixed.
function fixTableRowsSizes( table, writer ) {
	let wasFixed = false;

	const rowsLengths = getRowsLengths( table );
	const tableSize = rowsLengths[ 0 ];

	const isValid = Object.values( rowsLengths ).every( length => length === tableSize );

	if ( !isValid ) {
		const maxColumns = Object.values( rowsLengths ).reduce( ( prev, current ) => current > prev ? current : prev, 0 );

		for ( const [ rowIndex, size ] of Object.entries( rowsLengths ) ) {
			const columnsToInsert = maxColumns - size;

			if ( columnsToInsert ) {
				for ( let i = 0; i < columnsToInsert; i++ ) {
					writer.insertElement( 'tableCell', Position.createAt( table.getChild( rowIndex ), 'end' ) );
				}

				wasFixed = true;
			}
		}
	}

	return wasFixed;
}

// Searches for the table cells that extends beyond the table section to which they belong to. It will return an array of objects
// that holds table cells to be trimmed and correct value of a rowspan attribute to set.
//
// @param {module:engine/model/element~Element} table
// @returns {Array.<{{cell, rowspan}}>}
function findCellsToTrim( table ) {
	const headingRows = parseInt( table.getAttribute( 'headingRows' ) || 0 );
	const maxRows = table.childCount;

	const cellsToTrim = [];

	for ( const { row, rowspan, cell } of new TableWalker( table ) ) {
		// Skip cells that do not expand over its row.
		if ( rowspan < 2 ) {
			continue;
		}

		const isInHeader = row < headingRows;

		// Row limit is either end of header section or whole table as table body is after the header.
		const rowLimit = isInHeader ? headingRows : maxRows;

		// If table cell expands over its limit reduce it height to proper value.
		if ( row + rowspan > rowLimit ) {
			const newRowspan = rowLimit - row;

			cellsToTrim.push( { cell, rowspan: newRowspan } );
		}
	}

	return cellsToTrim;
}

// Returns an object with lengths of rows assigned to the corresponding row index.
//
// @param {module:engine/model/element~Element} table
// @returns {Object}
function getRowsLengths( table ) {
	const lengths = {};

	for ( const { row } of new TableWalker( table, { includeSpanned: true } ) ) {
		if ( !lengths[ row ] ) {
			lengths[ row ] = 0;
		}

		lengths[ row ] += 1;
	}

	return lengths;
}

// Checks if the differ entry for an attribute change is one of table's attributes.
//
// @param entry
// @returns {Boolean}
function isTableAttributeEntry( entry ) {
	const isAttributeType = entry.type === 'attribute';
	const key = entry.attributeKey;

	return isAttributeType && ( key === 'headingRows' || key === 'colspan' || key === 'rowspan' );
}
