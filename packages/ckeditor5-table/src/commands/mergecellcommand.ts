/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/commands/mergecellcommand
 */

import type {
	Element,
	Node,
	Writer
} from 'ckeditor5/src/engine.js';

import { Command, type Editor } from 'ckeditor5/src/core.js';
import TableWalker from '../tablewalker.js';
import { isHeadingColumnCell } from '../utils/common.js';
import { removeEmptyRowsColumns } from '../utils/structure.js';
import type { ArrowKeyCodeDirection } from 'ckeditor5/src/utils.js';

import type TableUtils from '../tableutils.js';

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
 * ```ts
 * editor.execute( 'mergeTableCellRight' );
 * ```
 *
 * **Note**: If a table cell has a different [`rowspan`](https://www.w3.org/TR/html50/tabular-data.html#attr-tdth-rowspan)
 * (for `'mergeTableCellRight'` and `'mergeTableCellLeft'`) or [`colspan`](https://www.w3.org/TR/html50/tabular-data.html#attr-tdth-colspan)
 * (for `'mergeTableCellUp'` and `'mergeTableCellDown'`), the command will be disabled.
 */
export default class MergeCellCommand extends Command {
	/**
	 * The direction that indicates which cell will be merged with the currently selected one.
	 */
	public readonly direction: ArrowKeyCodeDirection;

	/**
	 * Whether the merge is horizontal (left/right) or vertical (up/down).
	 */
	public readonly isHorizontal: boolean;

	/**
	 * @inheritDoc
	 */
	public declare value: Node | undefined;

	/**
	 * Creates a new `MergeCellCommand` instance.
	 *
	 * @param editor The editor on which this command will be used.
	 * @param options.direction Indicates which cell to merge with the currently selected one.
	 * Possible values are: `'left'`, `'right'`, `'up'` and `'down'`.
	 */
	constructor( editor: Editor, options: { direction: ArrowKeyCodeDirection } ) {
		super( editor );

		this.direction = options.direction;
		this.isHorizontal = this.direction == 'right' || this.direction == 'left';
	}

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
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
	public override execute(): void {
		const model = this.editor.model;
		const doc = model.document;
		const tableUtils: TableUtils = this.editor.plugins.get( 'TableUtils' );
		const tableCell = tableUtils.getTableCellsContainingSelection( doc.selection )[ 0 ];

		const cellToMerge = this.value!;
		const direction = this.direction;

		model.change( writer => {
			const isMergeNext = direction == 'right' || direction == 'down';

			// The merge mechanism is always the same so sort cells to be merged.
			const cellToExpand = ( isMergeNext ? tableCell : cellToMerge ) as Element;
			const cellToRemove = ( isMergeNext ? cellToMerge : tableCell ) as Element;

			// Cache the parent of cell to remove for later check.
			const removedTableCellRow = cellToRemove.parent as Element;

			mergeTableCells( cellToRemove, cellToExpand, writer );

			const spanAttribute = this.isHorizontal ? 'colspan' : 'rowspan';
			const cellSpan = parseInt( tableCell.getAttribute( spanAttribute ) as string || '1' );
			const cellToMergeSpan = parseInt( cellToMerge.getAttribute( spanAttribute ) as string || '1' );

			// Update table cell span attribute and merge set selection on merged contents.
			writer.setAttribute( spanAttribute, cellSpan + cellToMergeSpan, cellToExpand );
			writer.setSelection( writer.createRangeIn( cellToExpand ) );

			const tableUtils: TableUtils = this.editor.plugins.get( 'TableUtils' );
			const table = removedTableCellRow.findAncestor( 'table' )!;

			// Remove empty rows and columns after merging.
			removeEmptyRowsColumns( table, tableUtils );
		} );
	}

	/**
	 * Returns a cell that can be merged with the current cell depending on the command's direction.
	 */
	private _getMergeableCell(): Node | undefined {
		const model = this.editor.model;
		const doc = model.document;
		const tableUtils: TableUtils = this.editor.plugins.get( 'TableUtils' );
		const tableCell = tableUtils.getTableCellsContainingSelection( doc.selection )[ 0 ];

		if ( !tableCell ) {
			return;
		}

		// First get the cell on proper direction.
		const cellToMerge = this.isHorizontal ?
			getHorizontalCell( tableCell, this.direction, tableUtils ) :
			getVerticalCell( tableCell, this.direction, tableUtils );

		if ( !cellToMerge ) {
			return;
		}

		// If found check if the span perpendicular to merge direction is equal on both cells.
		const spanAttribute = this.isHorizontal ? 'rowspan' : 'colspan';
		const span = parseInt( tableCell.getAttribute( spanAttribute ) as string || '1' );

		const cellToMergeSpan = parseInt( cellToMerge.getAttribute( spanAttribute ) as string || '1' );

		if ( cellToMergeSpan === span ) {
			return cellToMerge;
		}
	}
}

/**
 * Returns the cell that can be merged horizontally.
 */
function getHorizontalCell( tableCell: Element, direction: ArrowKeyCodeDirection, tableUtils: TableUtils ) {
	const tableRow = tableCell.parent!;
	const table = tableRow.parent as Element;
	const horizontalCell = direction == 'right' ? tableCell.nextSibling : tableCell.previousSibling;
	const hasHeadingColumns = ( table.getAttribute( 'headingColumns' ) as number || 0 ) > 0;

	if ( !horizontalCell ) {
		return;
	}

	// Sort cells:
	const cellOnLeft = ( direction == 'right' ? tableCell : horizontalCell ) as Element;
	const cellOnRight = ( direction == 'right' ? horizontalCell : tableCell ) as Element;

	// Get their column indexes:
	const { column: leftCellColumn } = tableUtils.getCellLocation( cellOnLeft );
	const { column: rightCellColumn } = tableUtils.getCellLocation( cellOnRight );

	const leftCellSpan = parseInt( cellOnLeft.getAttribute( 'colspan' ) as string || '1' );

	const isCellOnLeftInHeadingColumn = isHeadingColumnCell( tableUtils, cellOnLeft );
	const isCellOnRightInHeadingColumn = isHeadingColumnCell( tableUtils, cellOnRight );

	// We cannot merge heading columns cells with regular cells.
	if ( hasHeadingColumns && isCellOnLeftInHeadingColumn != isCellOnRightInHeadingColumn ) {
		return;
	}

	// The cell on the right must have index that is distant to the cell on the left by the left cell's width (colspan).
	const cellsAreTouching = leftCellColumn + leftCellSpan === rightCellColumn;

	// If the right cell's column index is different it means that there are rowspanned cells between them.
	return cellsAreTouching ? horizontalCell : undefined;
}

/**
 * Returns the cell that can be merged vertically.
 */
function getVerticalCell( tableCell: Element, direction: ArrowKeyCodeDirection, tableUtils: TableUtils ): Node | null {
	const tableRow = tableCell.parent as Element;
	const table = tableRow.parent as Element;

	const rowIndex = table.getChildIndex( tableRow )!;

	// Don't search for mergeable cell if direction points out of the table.
	if ( ( direction == 'down' && rowIndex === tableUtils.getRows( table ) - 1 ) || ( direction == 'up' && rowIndex === 0 ) ) {
		return null;
	}

	const rowspan = parseInt( tableCell.getAttribute( 'rowspan' ) as string || '1' );
	const headingRows = table.getAttribute( 'headingRows' ) || 0;

	const isMergeWithBodyCell = direction == 'down' && ( rowIndex + rowspan ) === headingRows;
	const isMergeWithHeadCell = direction == 'up' && rowIndex === headingRows;

	// Don't search for mergeable cell if direction points out of the current table section.
	if ( headingRows && ( isMergeWithBodyCell || isMergeWithHeadCell ) ) {
		return null;
	}

	const currentCellRowSpan = parseInt( tableCell.getAttribute( 'rowspan' ) as string || '1' );
	const rowOfCellToMerge = direction == 'down' ? rowIndex + currentCellRowSpan : rowIndex;

	const tableMap = [ ...new TableWalker( table, { endRow: rowOfCellToMerge } ) ];

	const currentCellData = tableMap.find( value => value.cell === tableCell )!;
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

	return cellToMergeData && cellToMergeData.cell ? cellToMergeData.cell : null;
}

/**
 * Merges two table cells. It will ensure that after merging cells with an empty paragraph, the resulting table cell will only have one
 * paragraph. If one of the merged table cells is empty, the merged table cell will have the contents of the non-empty table cell.
 * If both are empty, the merged table cell will have only one empty paragraph.
 */
function mergeTableCells( cellToRemove: Element, cellToExpand: Element, writer: Writer ) {
	if ( !isEmpty( cellToRemove ) ) {
		if ( isEmpty( cellToExpand ) ) {
			writer.remove( writer.createRangeIn( cellToExpand ) );
		}

		writer.move( writer.createRangeIn( cellToRemove ), writer.createPositionAt( cellToExpand, 'end' ) );
	}

	// Remove merged table cell.
	writer.remove( cellToRemove );
}

/**
 * Checks if the passed table cell contains an empty paragraph.
 */
function isEmpty( tableCell: Element ): boolean {
	const firstTableChild = tableCell.getChild( 0 ) as Element;

	return tableCell.childCount == 1 && firstTableChild.is( 'element', 'paragraph' ) && firstTableChild.isEmpty;
}
