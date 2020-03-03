/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/commands/removerowcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

import TableWalker from '../tablewalker';
import { findAncestor, updateNumericAttribute } from './utils';

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
		const firstCell = this._getReferenceCells().next().value;

		this.isEnabled = !!firstCell && firstCell.parent.parent.childCount > 1;
	}

	/**
	 * @inheritDoc
	 */
	execute() {
		const referenceCells = Array.from( this._getReferenceCells() );
		const removedRowIndexes = {
			first: referenceCells[ 0 ].parent.index,
			last: referenceCells[ referenceCells.length - 1 ].parent.index
		};
		const firstCell = referenceCells[ 0 ];
		const table = firstCell.parent.parent;

		const tableMap = [ ...new TableWalker( table, { endRow: removedRowIndexes.last } ) ];

		const firstCellData = tableMap.find( value => value.cell === firstCell );

		const headingRows = table.getAttribute( 'headingRows' ) || 0;

		const columnToFocus = firstCellData.column;

		this.editor.model.change( writer => {
			// Temporary workaround to avoid the "model-selection-range-intersects" error.
			writer.setSelection( writer.createSelection( table, 'on' ) );

			let cellToFocus;

			for ( let i = removedRowIndexes.last; i >= removedRowIndexes.first; i-- ) {
				const removedRowIndex = i;
				const tableRow = table.getChild( removedRowIndex );
				this._removeRow( headingRows, removedRowIndex, table, writer, tableMap, tableRow );

				cellToFocus = getCellToFocus( table, removedRowIndex, columnToFocus );
			}

			if ( cellToFocus ) {
				writer.setSelection( writer.createPositionAt( cellToFocus, 0 ) );
			}
		} );
	}

	/**
	 * @private
	 */
	_removeRow( headingRows, removedRowIndex, table, writer, tableMap, tableRow ) {
		if ( headingRows && removedRowIndex <= headingRows ) {
			updateNumericAttribute( 'headingRows', headingRows - 1, table, writer, 0 );
		}

		const cellsToMove = new Map();

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

	/**
	 * Returns cells that are selected and are a reference to removing rows.
	 *
	 * @private
	 * @returns {Iterable.<module:engine/model/element~Element>} Generates `tableCell` elements.
	 */
	* _getReferenceCells() {
		const plugins = this.editor.plugins;
		if ( plugins.has( 'TableSelection' ) && plugins.get( 'TableSelection' ).hasMultiCellSelection ) {
			for ( const cell of plugins.get( 'TableSelection' ).getSelectedTableCells() ) {
				yield cell;
			}
		} else {
			const selection = this.editor.model.document.selection;

			yield findAncestor( 'tableCell', selection.getFirstPosition() );
		}
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
