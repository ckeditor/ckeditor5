/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/commands/removerowcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';

import TableWalker from '../tablewalker';
import { updateNumericAttribute } from './utils';

/**
 * The remove row command.
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

		const element = doc.selection.getFirstPosition().parent;

		this.isEnabled = element.is( 'tableCell' ) && element.parent.parent.childCount > 1;
	}

	/**
	 * @inheritDoc
	 */
	execute() {
		const model = this.editor.model;
		const selection = model.document.selection;

		const firstPosition = selection.getFirstPosition();
		const tableCell = firstPosition.parent;
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
					const targetPosition = previousCell ? Position.createAfter( previousCell ) : Position.createAt( table.getChild( row ) );

					writer.move( Range.createOn( cellToMove ), targetPosition );
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
