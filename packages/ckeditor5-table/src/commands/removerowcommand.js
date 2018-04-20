/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/commands/removerow
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import TableWalker from '../tablewalker';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';

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
	 * Executes the command.
	 *
	 * @fires execute
	 */
	execute() {
		const model = this.editor.model;
		const document = model.document;
		const selection = document.selection;

		const firstPosition = selection.getFirstPosition();
		const tableCell = firstPosition.parent;
		const tableRow = tableCell.parent;

		const table = tableRow.parent;

		const rowIndex = tableRow.index;

		model.change( writer => {
			const headingRows = ( table.getAttribute( 'headingRows' ) || 0 );

			if ( headingRows && rowIndex <= headingRows ) {
				writer.setAttribute( 'headingRows', headingRows - 1, table );
			}

			const cellsToMove = {};

			// Cache cells from current row that have rowspan
			for ( const tableWalkerValue of new TableWalker( table, { startRow: rowIndex, endRow: rowIndex } ) ) {
				if ( tableWalkerValue.rowspan > 1 ) {
					cellsToMove[ tableWalkerValue.column ] = {
						cell: tableWalkerValue.cell,
						updatedRowspan: tableWalkerValue.rowspan - 1
					};
				}
			}

			// Update rowspans on cells abover removed row
			for ( const tableWalkerValue of new TableWalker( table, { endRow: rowIndex - 1 } ) ) {
				const row = tableWalkerValue.row;
				const rowspan = tableWalkerValue.rowspan;
				const cell = tableWalkerValue.cell;

				if ( row + rowspan > rowIndex ) {
					const rowspanToSet = rowspan - 1;

					if ( rowspanToSet > 1 ) {
						writer.setAttribute( 'rowspan', rowspanToSet, cell );
					} else {
						writer.removeAttribute( 'rowspan', cell );
					}
				}
			}

			let previousCell;

			// Move cells to another row
			for ( const tableWalkerValue of new TableWalker( table, {
				includeSpanned: true,
				startRow: rowIndex + 1,
				endRow: rowIndex + 1
			} ) ) {
				const cellToMoveData = cellsToMove[ tableWalkerValue.column ];

				if ( cellToMoveData ) {
					const targetPosition = previousCell ? Position.createAfter( previousCell ) :
						Position.createAt( table.getChild( tableWalkerValue.row ) );

					writer.move( Range.createOn( cellToMoveData.cell ), targetPosition );

					const rowspanToSet = cellToMoveData.updatedRowspan;

					if ( rowspanToSet > 1 ) {
						writer.setAttribute( 'rowspan', rowspanToSet, cellToMoveData.cell );
					} else {
						writer.removeAttribute( 'rowspan', cellToMoveData.cell );
					}

					previousCell = cellToMoveData.cell;
				} else {
					previousCell = tableWalkerValue.cell;
				}
			}

			writer.remove( tableRow );
		} );
	}
}
