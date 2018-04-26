/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/commands/splitcellcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';

import TableWalker from '../tablewalker';

/**
 * The split cell command.
 *
 * @extends module:core/command~Command
 */
export default class SplitCellCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const doc = model.document;

		const element = doc.selection.getFirstPosition().parent;

		this.isEnabled = element.is( 'tableCell' );
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 */
	execute( options ) {
		const model = this.editor.model;
		const document = model.document;
		const selection = document.selection;

		const firstPosition = selection.getFirstPosition();
		const tableCell = firstPosition.parent;

		const horizontally = options && options.horizontally && parseInt( options.horizontally || 0 );

		const tableRow = tableCell.parent;
		const table = tableRow.parent;

		model.change( writer => {
			if ( horizontally && horizontally > 1 ) {
				const tableMap = [ ...new TableWalker( table ) ];
				const cellData = tableMap.find( value => value.cell === tableCell );

				const cellColumn = cellData.column;
				const cellColspan = cellData.colspan;
				const cellRowspan = cellData.rowspan;

				const splitOnly = cellColspan >= horizontally;

				const cellsToInsert = horizontally - 1;

				if ( !splitOnly ) {
					const cellsToUpdate = tableMap.filter( value => {
						const cell = value.cell;

						if ( cell === tableCell ) {
							return false;
						}

						const colspan = value.colspan;
						const column = value.column;

						return column === cellColumn || ( column < cellColumn && column + colspan - 1 >= cellColumn );
					} );

					for ( const tableWalkerValue of cellsToUpdate ) {
						const colspan = tableWalkerValue.colspan;
						const cell = tableWalkerValue.cell;

						writer.setAttribute( 'colspan', colspan + horizontally - 1, cell );
					}

					for ( let i = 0; i < cellsToInsert; i++ ) {
						writer.insertElement( 'tableCell', Position.createAfter( tableCell ) );
					}
				} else {
					const colspanOfInsertedCells = Math.floor( cellColspan / horizontally );
					const newColspan = ( cellColspan - colspanOfInsertedCells * horizontally ) + colspanOfInsertedCells;

					if ( newColspan > 1 ) {
						writer.setAttribute( 'colspan', newColspan, tableCell );
					} else {
						writer.removeAttribute( 'colspan', tableCell );
					}

					const attributes = colspanOfInsertedCells > 1 ? { colspan: colspanOfInsertedCells } : {};

					if ( cellRowspan > 1 ) {
						attributes.rowspan = cellRowspan;
					}

					for ( let i = 0; i < cellsToInsert; i++ ) {
						writer.insertElement( 'tableCell', attributes, Position.createAfter( tableCell ) );
					}
				}
			}
		} );
	}
}
