/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/commands/mergecellscommand
 */

import type {
	ModelElement,
	ModelWriter
} from 'ckeditor5/src/engine.js';

import { Command } from 'ckeditor5/src/core.js';
import { TableUtils } from '../tableutils.js';
import { updateNumericAttribute } from '../utils/common.js';
import { removeEmptyRowsColumns } from '../utils/structure.js';

/**
 * The merge cells command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'mergeTableCells'` editor command.
 *
 * For example, to merge selected table cells:
 *
 * ```ts
 * editor.execute( 'mergeTableCells' );
 * ```
 */
export class MergeCellsCommand extends Command {
	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const tableUtils = this.editor.plugins.get( TableUtils );

		const selectedTableCells = tableUtils.getSelectedTableCells( this.editor.model.document.selection );
		this.isEnabled = tableUtils.isSelectionRectangular( selectedTableCells );
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 */
	public override execute(): void {
		const model = this.editor.model;
		const tableUtils = this.editor.plugins.get( TableUtils );

		model.change( writer => {
			const selectedTableCells = tableUtils.getSelectedTableCells( model.document.selection );

			// All cells will be merged into the first one.
			const firstTableCell = selectedTableCells.shift()!;

			// Update target cell dimensions.
			const { mergeWidth, mergeHeight } = getMergeDimensions( firstTableCell, selectedTableCells, tableUtils );
			updateNumericAttribute( 'colspan', mergeWidth, firstTableCell, writer );
			updateNumericAttribute( 'rowspan', mergeHeight, firstTableCell, writer );

			for ( const tableCell of selectedTableCells ) {
				mergeTableCells( tableCell, firstTableCell, writer );
			}

			const table = firstTableCell.findAncestor( 'table' )!;

			// Remove rows and columns that become empty (have no anchored cells).
			removeEmptyRowsColumns( table, tableUtils );

			writer.setSelection( firstTableCell, 'in' );
		} );
	}
}

/**
 *  Merges two table cells. It will ensure that after merging cells with empty paragraphs the resulting table cell will only have one
 * paragraph. If one of the merged table cells is empty, the merged table cell will have contents of the non-empty table cell.
 * If both are empty, the merged table cell will have only one empty paragraph.
 */
function mergeTableCells( cellBeingMerged: ModelElement, targetCell: ModelElement, writer: ModelWriter ) {
	if ( !isEmpty( cellBeingMerged ) ) {
		if ( isEmpty( targetCell ) ) {
			writer.remove( writer.createRangeIn( targetCell ) );
		}

		writer.move( writer.createRangeIn( cellBeingMerged ), writer.createPositionAt( targetCell, 'end' ) );
	}

	// Remove merged table cell.
	writer.remove( cellBeingMerged );
}

/**
 * Checks if the passed table cell contains an empty paragraph.
 */
function isEmpty( tableCell: ModelElement ): boolean {
	const firstTableChild = tableCell.getChild( 0 );

	return tableCell.childCount == 1 && firstTableChild!.is( 'element', 'paragraph' ) && firstTableChild.isEmpty;
}

function getMergeDimensions( firstTableCell: ModelElement, selectedTableCells: Array<ModelElement>, tableUtils: TableUtils ) {
	let maxWidthOffset = 0;
	let maxHeightOffset = 0;

	for ( const tableCell of selectedTableCells ) {
		const { row, column } = tableUtils.getCellLocation( tableCell );

		maxWidthOffset = getMaxOffset( tableCell, column, maxWidthOffset, 'colspan' );
		maxHeightOffset = getMaxOffset( tableCell, row, maxHeightOffset, 'rowspan' );
	}

	// Update table cell span attribute and merge set selection on a merged contents.
	const { row: firstCellRow, column: firstCellColumn } = tableUtils.getCellLocation( firstTableCell );

	const mergeWidth = maxWidthOffset - firstCellColumn;
	const mergeHeight = maxHeightOffset - firstCellRow;

	return { mergeWidth, mergeHeight };
}

function getMaxOffset( tableCell: ModelElement, start: number, currentMaxOffset: number, which: string ) {
	const dimensionValue = parseInt( tableCell.getAttribute( which ) as string || '1' );

	return Math.max( currentMaxOffset, start + dimensionValue );
}
