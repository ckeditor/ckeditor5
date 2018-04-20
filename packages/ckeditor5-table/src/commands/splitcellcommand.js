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

		this.isEnabled = element.is( 'tableCell' ) && ( element.hasAttribute( 'colspan' ) || element.hasAttribute( 'rowspan' ) );
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

		const colspan = parseInt( tableCell.getAttribute( 'colspan' ) || 1 );
		const rowspan = parseInt( tableCell.getAttribute( 'rowspan' ) || 1 );

		model.change( writer => {
			if ( rowspan > 1 ) {
				const tableRow = tableCell.parent;
				const table = tableRow.parent;

				const startRow = table.getChildIndex( tableRow );
				const endRow = startRow + rowspan - 1;

				const options = { startRow, endRow, includeSpanned: true };

				const tableWalker = new TableWalker( table, options );

				let columnIndex;
				let previousCell;
				let cellsToInsert;

				for ( const tableWalkerInfo of tableWalker ) {
					if ( tableWalkerInfo.cell ) {
						previousCell = tableWalkerInfo.cell;
					}

					if ( tableWalkerInfo.cell === tableCell ) {
						columnIndex = tableWalkerInfo.column;
						cellsToInsert = tableWalkerInfo.colspan;
					}

					if ( columnIndex !== undefined && columnIndex === tableWalkerInfo.column && tableWalkerInfo.row > startRow ) {
						const insertRow = table.getChild( tableWalkerInfo.row );

						if ( previousCell.parent === insertRow ) {
							for ( let i = 0; i < cellsToInsert; i++ ) {
								writer.insertElement( 'tableCell', Position.createAfter( previousCell ) );
							}
						} else {
							for ( let i = 0; i < cellsToInsert; i++ ) {
								writer.insertElement( 'tableCell', Position.createAt( insertRow ) );
							}
						}
					}
				}
			}

			if ( colspan > 1 ) {
				for ( let i = colspan - 1; i > 0; i-- ) {
					writer.insertElement( 'tableCell', Position.createAfter( tableCell ) );
				}
			}

			writer.removeAttribute( 'colspan', tableCell );
			writer.removeAttribute( 'rowspan', tableCell );
		} );
	}
}
