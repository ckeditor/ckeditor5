/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/utils/common
 */

import TableWalker from '../tablewalker';

/**
 * Returns slot info of cells that starts above and overlaps a given row.
 *
 * In a table below, passing `overlapRow = 3`
 *
 *       ┌───┬───┬───┬───┬───┐
 *    0  │ a │ b │ c │ d │ e │
 *       │   ├───┼───┼───┼───┤
 *    1  │   │ f │ g │ h │ i │
 *       ├───┤   ├───┼───┤   │
 *    2  │ j │   │ k │ l │   │
 *       │   │   │   ├───┼───┤
 *    3  │   │   │   │ m │ n │  <- overlap row to check
 *       ├───┼───┤   │   ├───│
 *    4  │ o │ p │   │   │ q │
 *       └───┴───┴───┴───┴───┘
 *
 * will return slot info for cells: "j", "f", "k".
 *
 * @param {module:engine/model/element~Element} table The table to check.
 * @param {Number} overlapRow The index of the row to check.
 * @param {Number} [startRow=0] A row to start analysis. Use it when it is known that the cells above that row will not overlap.
 * @returns {Array.<module:table/tablewalker~TableWalkerValue>}
 */
export function getVerticallyOverlappingCells( table, overlapRow, startRow = 0 ) {
	const cells = [];

	const tableWalker = new TableWalker( table, { startRow, endRow: overlapRow - 1 } );

	for ( const slotInfo of tableWalker ) {
		const { row, rowspan } = slotInfo;
		const cellEndRow = row + rowspan - 1;

		if ( row < overlapRow && overlapRow <= cellEndRow ) {
			cells.push( slotInfo );
		}
	}

	return cells;
}

/**
 * Returns the parent element of the given name. Returns undefined if the position or the element is not inside the desired parent.
 *
 * @param {String} parentName The name of the parent element to find.
 * @param {module:engine/model/position~Position|module:engine/model/position~Position} positionOrElement The position or
 * the parentElement to start searching.
 * @returns {module:engine/model/element~Element|module:engine/model/documentfragment~DocumentFragment}
 */
export function findAncestor( parentName, positionOrElement ) {
	let parent = positionOrElement.parent;

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

/**
 * Splits the table cell horizontally.
 *
 * @param {module:engine/model/element~Element} tableCell
 * @param {Number} splitRow
 * @param {module:engine/model/writer~Writer} writer
 */
export function splitHorizontally( tableCell, splitRow, writer ) {
	const tableRow = tableCell.parent;
	const table = tableRow.parent;
	const rowIndex = tableRow.index;

	const rowspan = parseInt( tableCell.getAttribute( 'rowspan' ) );
	const newRowspan = splitRow - rowIndex;

	const newCellAttributes = {};
	const newCellRowSpan = rowspan - newRowspan;

	if ( newCellRowSpan > 1 ) {
		newCellAttributes.rowspan = newCellRowSpan;
	}

	const colspan = parseInt( tableCell.getAttribute( 'colspan' ) || 1 );

	if ( colspan > 1 ) {
		newCellAttributes.colspan = colspan;
	}

	const startRow = rowIndex;
	const endRow = startRow + newRowspan;
	const tableMap = [ ...new TableWalker( table, { startRow, endRow, includeSpanned: true } ) ];

	let columnIndex;

	for ( const { row, column, cell, cellIndex } of tableMap ) {
		if ( cell === tableCell && columnIndex === undefined ) {
			columnIndex = column;
		}

		if ( columnIndex !== undefined && columnIndex === column && row === endRow ) {
			const tableRow = table.getChild( row );
			const tableCellPosition = writer.createPositionAt( tableRow, cellIndex );

			createEmptyTableCell( writer, tableCellPosition, newCellAttributes );
		}
	}

	// Update the rowspan attribute after updating table.
	updateNumericAttribute( 'rowspan', newRowspan, tableCell, writer );
}

/**
 * Returns slot info of cells that starts before and overlaps a given column.
 *
 * In a table below, passing `overlapColumn = 3`
 *
 *      0   1   2   3   4
 *    ┌───────┬───────┬───┐
 *    │ a     │ b     │ c │
 *    │───┬───┴───────┼───┤
 *    │ d │ e         │ f │
 *    ├───┼───┬───────┴───┤
 *    │ g │ h │ i         │
 *    ├───┼───┼───┬───────┤
 *    │ j │ k │ l │ m     │
 *    ├───┼───┴───┼───┬───┤
 *    │ n │ o     │ p │ q │
 *    └───┴───────┴───┴───┘
 *                  ^
 *                  Overlap column to check
 *
 * will return slot info for cells: "b", "e", "i".
 *
 * @param {module:engine/model/element~Element} table The table to check.
 * @param {Number} overlapColumn The index of the column to check.
 * @returns {Array.<module:table/tablewalker~TableWalkerValue>}
 */
export function getHorizontallyOverlappingCells( table, overlapColumn ) {
	const cellsToSplit = [];

	const tableWalker = new TableWalker( table );

	for ( const slotInfo of tableWalker ) {
		const { column, colspan } = slotInfo;
		const cellEndColumn = column + colspan - 1;

		if ( column < overlapColumn && overlapColumn <= cellEndColumn ) {
			cellsToSplit.push( slotInfo );
		}
	}

	return cellsToSplit;
}

/**
 * Splits the table cell vertically.
 *
 * @param {module:engine/model/element~Element} tableCell
 * @param {Number} columnIndex The table cell column index.
 * @param {Number} splitColumn The index of column to split cell on.
 * @param {module:engine/model/writer~Writer} writer
 */
export function splitVertically( tableCell, columnIndex, splitColumn, writer ) {
	const colspan = parseInt( tableCell.getAttribute( 'colspan' ) );
	const newColspan = splitColumn - columnIndex;

	const newCellAttributes = {};
	const newCellColSpan = colspan - newColspan;

	if ( newCellColSpan > 1 ) {
		newCellAttributes.colspan = newCellColSpan;
	}

	const rowspan = parseInt( tableCell.getAttribute( 'rowspan' ) || 1 );

	if ( rowspan > 1 ) {
		newCellAttributes.rowspan = rowspan;
	}

	createEmptyTableCell( writer, writer.createPositionAfter( tableCell ), newCellAttributes );
	// Update the colspan attribute after updating table.
	updateNumericAttribute( 'colspan', newColspan, tableCell, writer );
}
