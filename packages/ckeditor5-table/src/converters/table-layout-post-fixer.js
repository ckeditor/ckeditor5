/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/converters/table-layout-post-fixer
 */

import TableWalker from './../tablewalker';
import { createEmptyTableCell, updateNumericAttribute } from '../utils/common';

/**
 * Injects a table layout post-fixer into the model.
 *
 * The role of the table layout post-fixer is to ensure that the table rows have the correct structure
 * after a {@link module:engine/model/model~Model#change `change()`} block was executed.
 *
 * The correct structure means that:
 *
 * * All table rows have the same size.
 * * None of the table cells extend vertically beyond their section (either header or body).
 * * A table cell has always at least one element as a child.
 *
 * If the table structure is not correct, the post-fixer will automatically correct it in two steps:
 *
 * 1. It will clip table cells that extend beyond their section.
 * 2. It will add empty table cells to the rows that are narrower than the widest table row.
 *
 * ## Clipping overlapping table cells
 *
 * Such situation may occur when pasting a table (or a part of a table) to the editor from external sources.
 *
 * For example, see the following table which has a cell (FOO) with the rowspan attribute (2):
 *
 *		<table headingRows="1">
 *			<tableRow>
 *				<tableCell rowspan="2"><paragraph>FOO</paragraph></tableCell>
 *				<tableCell colspan="2"><paragraph>BAR</paragraph></tableCell>
 *			</tableRow>
 *			<tableRow>
 *				<tableCell><paragraph>BAZ</paragraph></tableCell>
 *				<tableCell><paragraph>XYZ</paragraph></tableCell>
 *			</tableRow>
 *		</table>
 *
 * It will be rendered in the view as:
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
 *					<td>BAZ</td>
 *					<td>XYZ</td>
 *				</tr>
 *			</tbody>
 *		</table>
 *
 * In the above example the table will be rendered as a table with two rows: one in the header and second one in the body.
 * The table cell (FOO) cannot span over multiple rows as it would extend from the header to the body section.
 * The `rowspan` attribute must be changed to (1). The value (1) is the default value of the `rowspan` attribute
 * so the `rowspan` attribute will be removed from the model.
 *
 * The table cell with BAZ in the content will be in the first column of the table.
 *
 * ## Adding missing table cells
 *
 * The table post-fixer will insert empty table cells to equalize table row sizes (the number of columns).
 * The size of a table row is calculated by counting column spans of table cells, both horizontal (from the same row) and
 * vertical (from the rows above).
 *
 * In the above example, the table row in the body section of the table is narrower then the row from the header: it has two cells
 * with the default colspan (1). The header row has one cell with colspan (1) and the second with colspan (2).
 * The table cell (FOO) does not extend beyond the head section (and as such will be fixed in the first step of this post-fixer).
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
 *					<td>BAZ</td>
 *					<td>XYZ</td>
 *				</tr>
 *			</tbody>
 *		</table>
 *
 * ## Collaboration and undo - Expectations vs post-fixer results
 *
 * The table post-fixer only ensures proper structure without a deeper analysis of the nature of the change. As such, it might lead
 * to a structure which was not intended by the user. In particular, it will also fix undo steps (in conjunction with collaboration)
 * in which the editor content might not return to the original state.
 *
 * This will usually happen when one or more users change the size of the table.
 *
 * As an example see the table below:
 *
 *		<table>
 *			<tbody>
 *				<tr>
 *					<td>11</td>
 *					<td>12</td>
 *				</tr>
 *				<tr>
 *					<td>21</td>
 *					<td>22</td>
 *				</tr>
 *			</tbody>
 *		</table>
 *
 * and the user actions:
 *
 * 1. Both users have a table with two rows and two columns.
 * 2. User A adds a column at the end of the table. This will insert empty table cells to two rows.
 * 3. User B adds a row at the end of the table. This will insert a row with two empty table cells.
 * 4. Both users will have a table as below:
 *
 *
 *		<table>
 *			<tbody>
 *				<tr>
 *					<td>11</td>
 *					<td>12</td>
 *					<td>(empty, inserted by A)</td>
 *				</tr>
 *				<tr>
 *					<td>21</td>
 *					<td>22</td>
 *					<td>(empty, inserted by A)</td>
 *				</tr>
 *				<tr>
 *					<td>(empty, inserted by B)</td>
 *					<td>(empty, inserted by B)</td>
 *				</tr>
 *			</tbody>
 *		</table>
 *
 * The last row is shorter then others so the table post-fixer will add an empty row to the last row:
 *
 *		<table>
 *			<tbody>
 *				<tr>
 *					<td>11</td>
 *					<td>12</td>
 *					<td>(empty, inserted by A)</td>
 *				</tr>
 *				<tr>
 *					<td>21</td>
 *					<td>22</td>
 *					<td>(empty, inserted by A)</td>
 *				</tr>
 *				<tr>
 *					<td>(empty, inserted by B)</td>
 *					<td>(empty, inserted by B)</td>
 *					<td>(empty, inserted by the post-fixer)</td>
 *				</tr>
 *			</tbody>
 *		</table>
 *
 * Unfortunately undo does not know the nature of the changes and depending on which user applies the post-fixer changes, undoing them
 * might lead to a broken table. If User B undoes inserting the column to the table, the undo engine will undo only the operations of
 * inserting empty cells to rows from the initial table state (row 1 and 2) but the cell in the post-fixed row will remain:
 *
 *		<table>
 *			<tbody>
 *				<tr>
 *					<td>11</td>
 *					<td>12</td>
 *				</tr>
 *				<tr>
 *					<td>21</td>
 *					<td>22</td>
 *				</tr>
 *				<tr>
 *					<td>(empty, inserted by B)</td>
 *					<td>(empty, inserted by B)</td>
 *					<td>(empty, inserted by a post-fixer)</td>
 *				</tr>
 *			</tbody>
 *		</table>
 *
 * After undo, the table post-fixer will detect that two rows are shorter than others and will fix the table to:
 *
 *		<table>
 *			<tbody>
 *				<tr>
 *					<td>11</td>
 *					<td>12</td>
 *					<td>(empty, inserted by a post-fixer after undo)</td>
 *				</tr>
 *				<tr>
 *					<td>21</td>
 *					<td>22</td>
 *					<td>(empty, inserted by a post-fixer after undo)</td>
 *				</tr>
 *				<tr>
 *					<td>(empty, inserted by B)</td>
 *					<td>(empty, inserted by B)</td>
 *					<td>(empty, inserted by a post-fixer)</td>
 *				</tr>
 *			</tbody>
 *		</table>
 * @param {module:engine/model/model~Model} model
 */
export default function injectTableLayoutPostFixer( model ) {
	model.document.registerPostFixer( writer => tableLayoutPostFixer( writer, model ) );
}

// The table layout post-fixer.
//
// @param {module:engine/model/writer~Writer} writer
// @param {module:engine/model/model~Model} model
function tableLayoutPostFixer( writer, model ) {
	const changes = model.document.differ.getChanges();

	let wasFixed = false;

	// Do not analyze the same table more then once - may happen for multiple changes in the same table.
	const analyzedTables = new Set();

	for ( const entry of changes ) {
		let table;

		if ( entry.name == 'table' && entry.type == 'insert' ) {
			table = entry.position.nodeAfter;
		}

		// Fix table on adding/removing table cells and rows.
		if ( entry.name == 'tableRow' || entry.name == 'tableCell' ) {
			table = entry.position.findAncestor( 'table' );
		}

		// Fix table on any table's attribute change - including attributes of table cells.
		if ( isTableAttributeEntry( entry ) ) {
			table = entry.range.start.findAncestor( 'table' );
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

// Fixes the invalid value of the `rowspan` attribute because a table cell cannot vertically extend beyond the table section it belongs to.
//
// @param {module:engine/model/element~Element} table
// @param {module:engine/model/writer~Writer} writer
// @returns {Boolean} Returns `true` if the table was fixed.
function fixTableCellsRowspan( table, writer ) {
	let wasFixed = false;

	const cellsToTrim = findCellsToTrim( table );

	if ( cellsToTrim.length ) {
		// @if CK_DEBUG_TABLE // console.log( `Post-fixing table: trimming cells row-spans (${ cellsToTrim.length }).` );

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
// @returns {Boolean} Returns `true` if the table was fixed.
function fixTableRowsSizes( table, writer ) {
	let wasFixed = false;

	const childrenLengths = getChildrenLengths( table );
	const rowsToRemove = [];

	// Find empty rows.
	for ( const [ rowIndex, size ] of childrenLengths.entries() ) {
		// Ignore all non-row models.
		if ( !size && table.getChild( rowIndex ).is( 'element', 'tableRow' ) ) {
			rowsToRemove.push( rowIndex );
		}
	}

	// Remove empty rows.
	if ( rowsToRemove.length ) {
		// @if CK_DEBUG_TABLE // console.log( `Post-fixing table: remove empty rows (${ rowsToRemove.length }).` );

		wasFixed = true;

		for ( const rowIndex of rowsToRemove.reverse() ) {
			writer.remove( table.getChild( rowIndex ) );
			childrenLengths.splice( rowIndex, 1 );
		}
	}

	// Filter out everything that's not a table row.
	const rowsLengths = childrenLengths.filter( ( row, rowIndex ) => table.getChild( rowIndex ).is( 'element', 'tableRow' ) );

	// Verify if all the rows have the same number of columns.
	const tableSize = rowsLengths[ 0 ];
	const isValid = rowsLengths.every( length => length === tableSize );

	if ( !isValid ) {
		// @if CK_DEBUG_TABLE // console.log( 'Post-fixing table: adding missing cells.' );

		// Find the maximum number of columns.
		const maxColumns = rowsLengths.reduce( ( prev, current ) => current > prev ? current : prev, 0 );

		for ( const [ rowIndex, size ] of rowsLengths.entries() ) {
			const columnsToInsert = maxColumns - size;

			if ( columnsToInsert ) {
				for ( let i = 0; i < columnsToInsert; i++ ) {
					createEmptyTableCell( writer, writer.createPositionAt( table.getChild( rowIndex ), 'end' ) );
				}

				wasFixed = true;
			}
		}
	}

	return wasFixed;
}

// Searches for table cells that extend beyond the table section to which they belong to. It will return an array of objects
// that stores table cells to be trimmed and the correct value of the `rowspan` attribute to set.
//
// @param {module:engine/model/element~Element} table
// @returns {Array.<{{cell, rowspan}}>}
function findCellsToTrim( table ) {
	const headingRows = parseInt( table.getAttribute( 'headingRows' ) || 0 );
	const maxRows = Array.from( table.getChildren() )
		.reduce( ( count, row ) => row.is( 'element', 'tableRow' ) ? count + 1 : count, 0 );

	const cellsToTrim = [];

	for ( const { row, cell, cellHeight } of new TableWalker( table ) ) {
		// Skip cells that do not expand over its row.
		if ( cellHeight < 2 ) {
			continue;
		}

		const isInHeader = row < headingRows;

		// Row limit is either end of header section or whole table as table body is after the header.
		const rowLimit = isInHeader ? headingRows : maxRows;

		// If table cell expands over its limit reduce it height to proper value.
		if ( row + cellHeight > rowLimit ) {
			const newRowspan = rowLimit - row;

			cellsToTrim.push( { cell, rowspan: newRowspan } );
		}
	}

	return cellsToTrim;
}

// Returns an array with lengths of rows assigned to the corresponding row index.
//
// @param {module:engine/model/element~Element} table
// @returns {Array.<Number>}
function getChildrenLengths( table ) {
	// TableWalker will not provide items for the empty rows, we need to pre-fill this array.
	const lengths = new Array( table.childCount ).fill( 0 );

	for ( const { rowIndex } of new TableWalker( table, { includeAllSlots: true } ) ) {
		lengths[ rowIndex ]++;
	}

	return lengths;
}

// Checks if the differ entry for an attribute change is one of the table's attributes.
//
// @param entry
// @returns {Boolean}
function isTableAttributeEntry( entry ) {
	const isAttributeType = entry.type === 'attribute';
	const key = entry.attributeKey;

	return isAttributeType && ( key === 'headingRows' || key === 'colspan' || key === 'rowspan' );
}
