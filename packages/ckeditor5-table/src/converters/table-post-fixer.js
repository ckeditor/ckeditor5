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
 * Injects table post-fixer to the model.
 *
 * The role of the tables post-fixer is to ensure that the table's rows has correct structure
 * after a {@link module:engine/model/model~Model#change `change()`} block was executed.
 *
 * The correct structure means that:
 *
 * * All table rows have the same width.
 * * None of a table cells extends vertically beyond its section (either header or body).
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
 * As an example see below table which has a table cell (FOO) with a `rowspan` attribute of `2`:
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
 *		<table>
 *
 * In above example the table will be rendered as a table with two rows - one in the header and second one in the body.
 * The table cell with FOO contents will not expand to the body section so its `rowspan` attribute will be changed to `1` (and as
 * the value `1` is a default value the `rowspan` attribute will be removed from the model).
 *
 * The table cell with BAZ contents will be in the first column of a table.
 *
 * ## Adding missing table cells
 *
 * The table post-fixer will insert empty table cells to equalize table rows lengths. The width of a table row is calculated by counting
 * widths of table cells and widths of columns spanned by cells from rows above in a given row.
 *
 * In the above example the table row in body section of the table is narrower then the row from the header - it has two cells
 * with default colspan (value of `1`). The header row has one cell with width = 1 and second withe width = 2.
 * The table cell FOO does not expand beyond head section (and as such will be fixed in the first step of this post-fixer).
 * The post-fixer will add a missing table cell to the row in body section of the table.
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
 *		<table>
 *
 * **Note** The table post-fixer only ensures proper structure without deeper analysis of the nature of a change. As such it might lead
 * to a structure which was not intended by user changes. In particular it will also fix undo steps (in conjunction with collaboration)
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

		if ( table ) {
			// Step 1: correct rowspans of table cells if necessary.
			wasFixed = fixTableCellsRowspan( table, writer ) || wasFixed; // Should be true if any of present tables was fixed.
			// Step 2: fix table rows widths.
			wasFixed = fixTableRowsWidths( table, writer ) || wasFixed;
		}
	}

	return wasFixed;
}

// Fixes the invalid value of rowspan attribute as a table cell cannot extend vertically beyond a table section to which it belongs.
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

// Makes all table rows in a table the same width.
//
// @param {module:engine/model/element~Element} table
// @param {module:engine/model/writer~Writer} writer
// @returns {Boolean} Returns true if table was fixed.
function fixTableRowsWidths( table, writer ) {
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

// Searches for the table cells that extends beyond the table section to which they belongs. It will return  an array of objects
// that holds table cells to be trimmed and correct value of a rowspan attribute to set.
//
// @param {module:engine/model/element~Element} table
// @returns {Array.<{{cell, rowspan}}>}
function findCellsToTrim( table ) {
	const headingRows = parseInt( table.getAttribute( 'headingRows' ) || 0 );

	const cellsToTrim = [];

	for ( const { row, rowspan, cell } of new TableWalker( table ) ) {
		const maxRows = table.childCount;

		if ( headingRows > row ) {
			if ( row + rowspan > headingRows ) {
				const newRowspan = headingRows - row;

				cellsToTrim.push( { cell, rowspan: newRowspan } );
			}
		} else {
			if ( row + rowspan + headingRows > maxRows ) {
				const newRowspan = maxRows - row - headingRows + 1;

				cellsToTrim.push( { cell, rowspan: newRowspan } );
			}
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

// Checks if differ entry for attribute change is one of table's attributes.
//
// @param entry
// @returns {Boolean}
function isTableAttributeEntry( entry ) {
	const isAttributeType = entry.type === 'attribute';
	const key = entry.attributeKey;

	return isAttributeType && ( key === 'headingRows' || key === 'colspan' || key === 'rowspan' );
}
