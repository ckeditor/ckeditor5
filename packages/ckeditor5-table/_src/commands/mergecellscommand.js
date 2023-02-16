/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/commands/mergecellscommand
 */

import { Command } from 'ckeditor5/src/core';
import TableUtils from '../tableutils';
import { updateNumericAttribute } from '../utils/common';
import { removeEmptyRowsColumns } from '../utils/structure';

/**
 * The merge cells command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'mergeTableCells'` editor command.
 *
 * For example, to merge selected table cells:
 *
 *		editor.execute( 'mergeTableCells' );
 *
 * @extends module:core/command~Command
 */
export default class MergeCellsCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const tableUtils = this.editor.plugins.get( TableUtils );

		const selectedTableCells = tableUtils.getSelectedTableCells( this.editor.model.document.selection );
		this.isEnabled = tableUtils.isSelectionRectangular( selectedTableCells, this.editor.plugins.get( TableUtils ) );
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 */
	execute() {
		const model = this.editor.model;
		const tableUtils = this.editor.plugins.get( TableUtils );

		model.change( writer => {
			const selectedTableCells = tableUtils.getSelectedTableCells( model.document.selection );

			// All cells will be merged into the first one.
			const firstTableCell = selectedTableCells.shift();

			// Update target cell dimensions.
			const { mergeWidth, mergeHeight } = getMergeDimensions( firstTableCell, selectedTableCells, tableUtils );
			updateNumericAttribute( 'colspan', mergeWidth, firstTableCell, writer );
			updateNumericAttribute( 'rowspan', mergeHeight, firstTableCell, writer );

			for ( const tableCell of selectedTableCells ) {
				mergeTableCells( tableCell, firstTableCell, writer );
			}

			const table = firstTableCell.findAncestor( 'table' );

			// Remove rows and columns that become empty (have no anchored cells).
			removeEmptyRowsColumns( table, tableUtils );

			writer.setSelection( firstTableCell, 'in' );
		} );
	}
}

// Merges two table cells. It will ensure that after merging cells with empty paragraphs the resulting table cell will only have one
// paragraph. If one of the merged table cells is empty, the merged table cell will have contents of the non-empty table cell.
// If both are empty, the merged table cell will have only one empty paragraph.
//
// @param {module:engine/model/element~Element} cellBeingMerged
// @param {module:engine/model/element~Element} targetCell
// @param {module:engine/model/writer~Writer} writer
function mergeTableCells( cellBeingMerged, targetCell, writer ) {
	if ( !isEmpty( cellBeingMerged ) ) {
		if ( isEmpty( targetCell ) ) {
			writer.remove( writer.createRangeIn( targetCell ) );
		}

		writer.move( writer.createRangeIn( cellBeingMerged ), writer.createPositionAt( targetCell, 'end' ) );
	}

	// Remove merged table cell.
	writer.remove( cellBeingMerged );
}

// Checks if the passed table cell contains an empty paragraph.
//
// @param {module:engine/model/element~Element} tableCell
// @returns {Boolean}
function isEmpty( tableCell ) {
	return tableCell.childCount == 1 && tableCell.getChild( 0 ).is( 'element', 'paragraph' ) && tableCell.getChild( 0 ).isEmpty;
}

function getMergeDimensions( firstTableCell, selectedTableCells, tableUtils ) {
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

function getMaxOffset( tableCell, start, currentMaxOffset, which ) {
	const dimensionValue = parseInt( tableCell.getAttribute( which ) || 1 );

	return Math.max( currentMaxOffset, start + dimensionValue );
}
