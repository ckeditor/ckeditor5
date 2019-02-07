/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/commands/removecolumncommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

import TableWalker from '../tablewalker';
import { findAncestor, updateNumericAttribute } from './utils';

/**
 * The remove column command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as `'removeTableColumn'` editor command.
 *
 * To remove the column containing the selected cell, execute the command:
 *
 *		editor.execute( 'removeTableColumn' );
 *
 * @extends module:core/command~Command
 */
export default class RemoveColumnCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const editor = this.editor;
		const selection = editor.model.document.selection;
		const tableUtils = editor.plugins.get( 'TableUtils' );

		const tableCell = findAncestor( 'tableCell', selection.getFirstPosition() );

		this.isEnabled = !!tableCell && tableUtils.getColumns( tableCell.parent.parent ) > 1;
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

		const headingColumns = table.getAttribute( 'headingColumns' ) || 0;
		const row = table.getChildIndex( tableRow );

		// Cache the table before removing or updating colspans.
		const tableMap = [ ...new TableWalker( table ) ];

		// Get column index of removed column.
		const cellData = tableMap.find( value => value.cell === tableCell );
		const removedColumn = cellData.column;

		model.change( writer => {
			// Update heading columns attribute if removing a row from head section.
			if ( headingColumns && row <= headingColumns ) {
				writer.setAttribute( 'headingColumns', headingColumns - 1, table );
			}

			for ( const { cell, column, colspan } of tableMap ) {
				// If colspaned cell overlaps removed column decrease it's span.
				if ( column <= removedColumn && colspan > 1 && column + colspan > removedColumn ) {
					updateNumericAttribute( 'colspan', colspan - 1, cell, writer );
				} else if ( column === removedColumn ) {
					// The cell in removed column has colspan of 1.
					writer.remove( cell );
				}
			}
		} );
	}
}
