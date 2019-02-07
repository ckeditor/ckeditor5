/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
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
 * The command is registered by {@link module:table/tableediting~TableEditing} as `'removeTableRow'` editor command.
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
		const model = this.editor.model;
		const doc = model.document;

		const tableCell = findAncestor( 'tableCell', doc.selection.getFirstPosition() );

		this.isEnabled = !!tableCell && tableCell.parent.parent.childCount > 1;
	}

	/**
	 * @inheritDoc
	 */
	execute() {
		const model = this.editor.model;
		const selection = model.document.selection;

		const firstPosition = selection.getFirstPosition();
		const tableCell = findAncestor( 'tableCell', firstPosition );
		const tableRow = tableCell.parent;
		const table = tableRow.parent;

		const currentRow = table.getChildIndex( tableRow );
		const headingRows = table.getAttribute( 'headingRows' ) || 0;

		model.change( writer => {
			if ( headingRows && currentRow <= headingRows ) {
				updateNumericAttribute( 'headingRows', headingRows - 1, table, writer, 0 );
			}

			const tableMap = [ ...new TableWalker( table, { endRow: currentRow } ) ];

			const cellsToMove = new Map();

			// Get cells from removed row that are spanned over multiple rows.
			tableMap
				.filter( ( { row, rowspan } ) => row === currentRow && rowspan > 1 )
				.forEach( ( { column, cell, rowspan } ) => cellsToMove.set( column, { cell, rowspanToSet: rowspan - 1 } ) );

			// Reduce rowspan on cells that are above removed row and overlaps removed row.
			tableMap
				.filter( ( { row, rowspan } ) => row <= currentRow - 1 && row + rowspan > currentRow )
				.forEach( ( { cell, rowspan } ) => updateNumericAttribute( 'rowspan', rowspan - 1, cell, writer ) );

			// Move cells to another row.
			const targetRow = currentRow + 1;
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
				} else {
					previousCell = cell;
				}
			}

			writer.remove( tableRow );
		} );
	}
}
