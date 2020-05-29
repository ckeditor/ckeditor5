/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/utils/common
 */

import { isWidget, toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import { createEmptyTableCell, findAncestor, updateNumericAttribute } from '../commands/utils';
import TableWalker from '../tablewalker';

/**
 * Converts a given {@link module:engine/view/element~Element} to a table widget:
 * * Adds a {@link module:engine/view/element~Element#_setCustomProperty custom property} allowing to recognize the table widget element.
 * * Calls the {@link module:widget/utils~toWidget} function with the proper element's label creator.
 *
 * @param {module:engine/view/element~Element} viewElement
 * @param {module:engine/view/downcastwriter~DowncastWriter} writer An instance of the view writer.
 * @param {String} label The element's label. It will be concatenated with the table `alt` attribute if one is present.
 * @returns {module:engine/view/element~Element}
 */
export function toTableWidget( viewElement, writer ) {
	writer.setCustomProperty( 'table', true, viewElement );

	return toWidget( viewElement, writer, { hasSelectionHandle: true } );
}

// Checks if a given view element is a table widget.
//
// @param {module:engine/view/element~Element} viewElement
// @returns {Boolean}
function isTableWidget( viewElement ) {
	return !!viewElement.getCustomProperty( 'table' ) && isWidget( viewElement );
}

/**
 * Returns a table widget editing view element if one is selected.
 *
 * @param {module:engine/view/selection~Selection|module:engine/view/documentselection~DocumentSelection} selection
 * @returns {module:engine/view/element~Element|null}
 */
export function getSelectedTableWidget( selection ) {
	const viewElement = selection.getSelectedElement();

	if ( viewElement && isTableWidget( viewElement ) ) {
		return viewElement;
	}

	return null;
}

/**
 * Returns a table widget editing view element if one is among the selection's ancestors.
 *
 * @param {module:engine/view/selection~Selection|module:engine/view/documentselection~DocumentSelection} selection
 * @returns {module:engine/view/element~Element|null}
 */
export function getTableWidgetAncestor( selection ) {
	const parentTable = findAncestor( 'table', selection.getFirstPosition() );

	if ( parentTable && isTableWidget( parentTable.parent ) ) {
		return parentTable.parent;
	}

	return null;
}

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
