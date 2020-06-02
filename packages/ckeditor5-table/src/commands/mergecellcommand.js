/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/commands/mergecellcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import TableWalker from '../tablewalker';
import { getTableCellsContainingSelection } from '../utils/selection';
import { findAncestor, isHeadingColumnCell } from '../utils/common';
import { getEmptyColumnsIndexes } from '../utils/structure';

/**
 * The merge cell command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'mergeTableCellRight'`, `'mergeTableCellLeft'`,
 * `'mergeTableCellUp'` and `'mergeTableCellDown'` editor commands.
 *
 * To merge a table cell at the current selection with another cell, execute the command corresponding with the preferred direction.
 *
 * For example, to merge with a cell to the right:
 *
 *		editor.execute( 'mergeTableCellRight' );
 *
 * **Note**: If a table cell has a different [`rowspan`](https://www.w3.org/TR/html50/tabular-data.html#attr-tdth-rowspan)
 * (for `'mergeTableCellRight'` and `'mergeTableCellLeft'`) or [`colspan`](https://www.w3.org/TR/html50/tabular-data.html#attr-tdth-colspan)
 * (for `'mergeTableCellUp'` and `'mergeTableCellDown'`), the command will be disabled.
 *
 * @extends module:core/command~Command
 */
export default class MergeCellCommand extends Command {
	/**
	 * Creates a new `MergeCellCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor The editor on which this command will be used.
	 * @param {Object} options
	 * @param {String} options.direction Indicates which cell to merge with the currently selected one.
	 * Possible values are: `'left'`, `'right'`, `'up'` and `'down'`.
	 */
	constructor( editor, options ) {
		super( editor );

		/**
		 * The direction that indicates which cell will be merged with the currently selected one.
		 *
		 * @readonly
		 * @member {String} #direction
		 */
		this.direction = options.direction;

		/**
		 * Whether the merge is horizontal (left/right) or vertical (up/down).
		 *
		 * @readonly
		 * @member {Boolean} #isHorizontal
		 */
		this.isHorizontal = this.direction == 'right' || this.direction == 'left';
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		const cellToMerge = this._getMergeableCell();

		this.value = cellToMerge;
		this.isEnabled = !!cellToMerge;
	}

	/**
	 * Executes the command.
	 *
	 * Depending on the command's {@link #direction} value, it will merge the cell that is to the `'left'`, `'right'`, `'up'` or `'down'`.
	 *
	 * @fires execute
	 */
	execute() {
		const model = this.editor.model;
		const doc = model.document;
		const tableCell = getTableCellsContainingSelection( doc.selection )[ 0 ];

		const cellToMerge = this.value;
		const direction = this.direction;

		model.change( writer => {
			const isMergeNext = direction == 'right' || direction == 'down';

			// The merge mechanism is always the same so sort cells to be merged.
			const cellToExpand = isMergeNext ? tableCell : cellToMerge;
			const cellToRemove = isMergeNext ? cellToMerge : tableCell;

			// Cache the parent of cell to remove for later check.
			const removedTableCellRow = cellToRemove.parent;

			mergeTableCells( cellToRemove, cellToExpand, writer );

			const spanAttribute = this.isHorizontal ? 'colspan' : 'rowspan';
			const cellSpan = parseInt( tableCell.getAttribute( spanAttribute ) || 1 );
			const cellToMergeSpan = parseInt( cellToMerge.getAttribute( spanAttribute ) || 1 );

			// Update table cell span attribute and merge set selection on merged contents.
			writer.setAttribute( spanAttribute, cellSpan + cellToMergeSpan, cellToExpand );
			writer.setSelection( writer.createRangeIn( cellToExpand ) );

			const tableUtils = this.editor.plugins.get( 'TableUtils' );
			const table = findAncestor( 'table', removedTableCellRow );

			// Remove empty row after merging.
			if ( !removedTableCellRow.childCount ) {
				tableUtils.removeRows( table, { at: removedTableCellRow.index, batch: writer.batch } );
			} else {
				// If there were some rows removed then empty columns were already verified.
				const emptyColumnsIndexes = getEmptyColumnsIndexes( table );

				if ( emptyColumnsIndexes.length ) {
					emptyColumnsIndexes.reverse().forEach( column => {
						tableUtils.removeColumns( table, { at: column, batch: writer.batch } );
					} );
				}
			}
		} );
	}

	/**
	 * Returns a cell that can be merged with the current cell depending on the command's direction.
	 *
	 * @returns {module:engine/model/element~Element|undefined}
	 * @private
	 */
	_getMergeableCell() {
		const model = this.editor.model;
		const doc = model.document;
		const tableCell = getTableCellsContainingSelection( doc.selection )[ 0 ];

		if ( !tableCell ) {
			return;
		}

		const tableUtils = this.editor.plugins.get( 'TableUtils' );

		// First get the cell on proper direction.
		const cellToMerge = this.isHorizontal ?
			getHorizontalCell( tableCell, this.direction, tableUtils ) :
			getVerticalCell( tableCell, this.direction );

		if ( !cellToMerge ) {
			return;
		}

		// If found check if the span perpendicular to merge direction is equal on both cells.
		const spanAttribute = this.isHorizontal ? 'rowspan' : 'colspan';
		const span = parseInt( tableCell.getAttribute( spanAttribute ) || 1 );

		const cellToMergeSpan = parseInt( cellToMerge.getAttribute( spanAttribute ) || 1 );

		if ( cellToMergeSpan === span ) {
			return cellToMerge;
		}
	}
}

// Returns the cell that can be merged horizontally.
//
// @param {module:engine/model/element~Element} tableCell
// @param {String} direction
// @returns {module:engine/model/node~Node|null}
function getHorizontalCell( tableCell, direction, tableUtils ) {
	const tableRow = tableCell.parent;
	const table = tableRow.parent;
	const horizontalCell = direction == 'right' ? tableCell.nextSibling : tableCell.previousSibling;
	const hasHeadingColumns = ( table.getAttribute( 'headingColumns' ) || 0 ) > 0;

	if ( !horizontalCell ) {
		return;
	}

	// Sort cells:
	const cellOnLeft = direction == 'right' ? tableCell : horizontalCell;
	const cellOnRight = direction == 'right' ? horizontalCell : tableCell;

	// Get their column indexes:
	const { column: leftCellColumn } = tableUtils.getCellLocation( cellOnLeft );
	const { column: rightCellColumn } = tableUtils.getCellLocation( cellOnRight );

	const leftCellSpan = parseInt( cellOnLeft.getAttribute( 'colspan' ) || 1 );

	const isCellOnLeftInHeadingColumn = isHeadingColumnCell( tableUtils, cellOnLeft, table );
	const isCellOnRightInHeadingColumn = isHeadingColumnCell( tableUtils, cellOnRight, table );

	// We cannot merge heading columns cells with regular cells.
	if ( hasHeadingColumns && isCellOnLeftInHeadingColumn != isCellOnRightInHeadingColumn ) {
		return;
	}

	// The cell on the right must have index that is distant to the cell on the left by the left cell's width (colspan).
	const cellsAreTouching = leftCellColumn + leftCellSpan === rightCellColumn;

	// If the right cell's column index is different it means that there are rowspanned cells between them.
	return cellsAreTouching ? horizontalCell : undefined;
}

// Returns the cell that can be merged vertically.
//
// @param {module:engine/model/element~Element} tableCell
// @param {String} direction
// @returns {module:engine/model/node~Node|null}
function getVerticalCell( tableCell, direction ) {
	const tableRow = tableCell.parent;
	const table = tableRow.parent;

	const rowIndex = table.getChildIndex( tableRow );

	// Don't search for mergeable cell if direction points out of the table.
	if ( ( direction == 'down' && rowIndex === table.childCount - 1 ) || ( direction == 'up' && rowIndex === 0 ) ) {
		return;
	}

	const rowspan = parseInt( tableCell.getAttribute( 'rowspan' ) || 1 );
	const headingRows = table.getAttribute( 'headingRows' ) || 0;

	const isMergeWithBodyCell = direction == 'down' && ( rowIndex + rowspan ) === headingRows;
	const isMergeWithHeadCell = direction == 'up' && rowIndex === headingRows;

	// Don't search for mergeable cell if direction points out of the current table section.
	if ( headingRows && ( isMergeWithBodyCell || isMergeWithHeadCell ) ) {
		return;
	}

	const currentCellRowSpan = parseInt( tableCell.getAttribute( 'rowspan' ) || 1 );
	const rowOfCellToMerge = direction == 'down' ? rowIndex + currentCellRowSpan : rowIndex;

	const tableMap = [ ...new TableWalker( table, { endRow: rowOfCellToMerge } ) ];

	const currentCellData = tableMap.find( value => value.cell === tableCell );
	const mergeColumn = currentCellData.column;

	const cellToMergeData = tableMap.find( ( { row, cellHeight, column } ) => {
		if ( column !== mergeColumn ) {
			return false;
		}

		if ( direction == 'down' ) {
			// If merging a cell below the mergeRow is already calculated.
			return row === rowOfCellToMerge;
		} else {
			// If merging a cell above calculate if it spans to mergeRow.
			return rowOfCellToMerge === row + cellHeight;
		}
	} );

	return cellToMergeData && cellToMergeData.cell;
}

// Merges two table cells. It will ensure that after merging cells with an empty paragraph, the resulting table cell will only have one
// paragraph. If one of the merged table cells is empty, the merged table cell will have the contents of the non-empty table cell.
// If both are empty, the merged table cell will have only one empty paragraph.
//
// @param {module:engine/model/element~Element} cellToRemove
// @param {module:engine/model/element~Element} cellToExpand
// @param {module:engine/model/writer~Writer} writer
function mergeTableCells( cellToRemove, cellToExpand, writer ) {
	if ( !isEmpty( cellToRemove ) ) {
		if ( isEmpty( cellToExpand ) ) {
			writer.remove( writer.createRangeIn( cellToExpand ) );
		}

		writer.move( writer.createRangeIn( cellToRemove ), writer.createPositionAt( cellToExpand, 'end' ) );
	}

	// Remove merged table cell.
	writer.remove( cellToRemove );
}

// Checks if the passed table cell contains an empty paragraph.
//
// @param {module:engine/model/element~Element} tableCell
// @returns {Boolean}
function isEmpty( tableCell ) {
	return tableCell.childCount == 1 && tableCell.getChild( 0 ).is( 'paragraph' ) && tableCell.getChild( 0 ).isEmpty;
}
