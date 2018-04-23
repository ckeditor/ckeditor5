/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/commands/splitcell
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import TableWalker from '../tablewalker';
import { getColumns } from './utils';

/**
 * The split cell command.
 *
 * @extends module:core/command~Command
 */
export default class RemoveColumnCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const doc = model.document;

		const element = doc.selection.getFirstPosition().parent;

		this.isEnabled = element.is( 'tableCell' ) && getColumns( element.parent.parent ) > 1;
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
			const headingColumns = ( table.getAttribute( 'headingColumns' ) || 0 );

			if ( headingColumns && rowIndex <= headingColumns ) {
				writer.setAttribute( 'headingColumns', headingColumns - 1, table );
			}

			// Cache the table before removing or updating colspans.
			const currentTableState = [ ...new TableWalker( table ) ];

			// Get column index of removed column.
			const removedColumn = currentTableState.filter( value => value.cell === tableCell ).pop().column;

			for ( const tableWalkerValue of currentTableState ) {
				const column = tableWalkerValue.column;
				const colspan = tableWalkerValue.colspan;

				if ( column <= removedColumn && colspan > 1 && column + colspan > removedColumn ) {
					const colspanToSet = tableWalkerValue.colspan - 1;

					if ( colspanToSet > 1 ) {
						writer.setAttribute( 'colspan', colspanToSet, tableWalkerValue.cell );
					} else {
						writer.removeAttribute( 'colspan', tableWalkerValue.cell );
					}
				} else if ( column == removedColumn ) {
					writer.remove( tableWalkerValue.cell );
				}
			}
		} );
	}
}
