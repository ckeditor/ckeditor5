/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/commands/removerowcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

import TableWalker from '../tablewalker';
import { updateNumericAttribute } from './utils';
import { getSelectionAffectedTableCells } from '../utils';

/**
 * The remove row command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'removeTableRow'` editor command.
 *
 * To remove the row containing the selected cell, execute the command:
 *
 *		editor.execute( 'removeTableRow' );
 *
 * @extends module:core/command~Command
 */
export default class RemoveRowCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const selectedCells = getSelectionAffectedTableCells( this.editor.model.document.selection );
		const firstCell = selectedCells[ 0 ];

		if ( firstCell ) {
			const table = firstCell.parent.parent;
			const tableUtils = this.editor.plugins.get( 'TableUtils' );
			const tableRowCount = table && tableUtils.getRows( table );

			const tableMap = [ ...new TableWalker( table ) ];
			const rowIndexes = tableMap.filter( entry => selectedCells.includes( entry.cell ) ).map( el => el.row );

			this.isEnabled = Math.max.apply( null, rowIndexes ) - Math.min.apply( null, rowIndexes ) < ( tableRowCount - 1 );
		} else {
			this.isEnabled = false;
		}
	}

	/**
	 * @inheritDoc
	 */
	execute() {
		const referenceCells = getSelectionAffectedTableCells( this.editor.model.document.selection );
		const removedRowIndexes = {
			first: referenceCells[ 0 ].parent.index,
			last: referenceCells[ referenceCells.length - 1 ].parent.index
		};

		if ( removedRowIndexes.last < removedRowIndexes.first ) {
			removedRowIndexes.first = referenceCells[ referenceCells.length - 1 ].parent.index;
			removedRowIndexes.last = referenceCells[ 0 ].parent.index;
		}

		const firstCell = referenceCells[ 0 ];
		const table = firstCell.parent.parent;
		const tableMap = [ ...new TableWalker( table, { endRow: removedRowIndexes.last } ) ];
		const batch = this.editor.model.createBatch();

		// Doing multiple model.enqueueChange() calls, to get around ckeditor/ckeditor5#6391.
		// Ideally we want to do this in a single model.change() block.
		this.editor.model.enqueueChange( batch, writer => {
			// This prevents the "model-selection-range-intersects" error, caused by removing row selected cells.
			writer.setSelection( writer.createSelection( table, 'on' ) );
		} );

		const firstCellData = tableMap.find( value => value.cell === firstCell );
		const columnToFocus = firstCellData.column;
		let cellToFocus;

		for ( let i = removedRowIndexes.last; i >= removedRowIndexes.first; i-- ) {
			this.editor.model.enqueueChange( batch, writer => {
				const removedRowIndex = i;
				this._removeRow( removedRowIndex, table, writer, tableMap );

				cellToFocus = getCellToFocus( table, removedRowIndex, columnToFocus );
			} );
		}

		this.editor.model.enqueueChange( batch, writer => {
			writer.setSelection( writer.createPositionAt( cellToFocus, 0 ) );
		} );
	}

	/**
	 * Removes a row from the given `table`.
	 *
	 * @private
	 * @param {Number} removedRowIndex Index of the row that should be removed.
	 * @param {module:engine/model/element~Element} table
	 * @param {module:engine/model/writer~Writer} writer
	 * @param {module:engine/model/element~Element[]} tableMap Table map retrieved from {@link module:table/tablewalker~TableWalker}.
	 */
	_removeRow( removedRowIndex, table, writer, tableMap ) {
		const cellsToMove = new Map();
		const tableRow = table.getChild( removedRowIndex );
		const headingRows = table.getAttribute( 'headingRows' ) || 0;

		if ( headingRows && removedRowIndex < headingRows ) {
			updateNumericAttribute( 'headingRows', headingRows - 1, table, writer, 0 );
		}

		// Get cells from removed row that are spanned over multiple rows.
		tableMap
			.filter( ( { row, rowspan } ) => row === removedRowIndex && rowspan > 1 )
			.forEach( ( { column, cell, rowspan } ) => cellsToMove.set( column, { cell, rowspanToSet: rowspan - 1 } ) );

		// Reduce rowspan on cells that are above removed row and overlaps removed row.
		tableMap
			.filter( ( { row, rowspan } ) => row <= removedRowIndex - 1 && row + rowspan > removedRowIndex )
			.forEach( ( { cell, rowspan } ) => updateNumericAttribute( 'rowspan', rowspan - 1, cell, writer ) );

		// Move cells to another row.
		const targetRow = removedRowIndex + 1;
		const tableWalker = new TableWalker( table, { includeSpanned: true, startRow: targetRow, endRow: targetRow } );
		let previousCell;

		for ( const { row, column, cell } of [ ...tableWalker ] ) {
			if ( cellsToMove.has( column ) ) {
				const { cell: cellToMove, rowspanToSet } = cellsToMove.get( column );
				const targetPosition = previousCell ?
					writer.createPositionAfter( previousCell ) :
					writer.createPositionAt( table.getChild( row ), 0 );
				writer.move( writer.createRangeOn( cellToMove ), targetPosition );
				updateNumericAttribute( 'rowspan', rowspanToSet, cellToMove, writer );
				previousCell = cellToMove;
			}
			else {
				previousCell = cell;
			}
		}

		writer.remove( tableRow );
	}
}

// Returns a cell that should be focused before removing the row, belonging to the same column as the currently focused cell.
function getCellToFocus( table, removedRowIndex, columnToFocus ) {
	const row = table.getChild( removedRowIndex );

	// Default to first table cell.
	let cellToFocus = row.getChild( 0 );
	let column = 0;

	for ( const tableCell of row.getChildren() ) {
		if ( column > columnToFocus ) {
			return cellToFocus;
		}

		cellToFocus = tableCell;
		column += parseInt( tableCell.getAttribute( 'colspan' ) || 1 );
	}
}
