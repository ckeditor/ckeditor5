/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/commands/selectrowcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

import TableWalker from '../tablewalker';
import { findAncestor } from './utils';
import { getRowIndexes, getSelectionAffectedTableCells } from '../utils';

/**
 * The select row command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'selectTableRow'` editor command.
 *
 * To select the row containing the selected cell, execute the command:
 *
 *		editor.execute( 'selectTableRow' );
 *
 * @extends module:core/command~Command
 */
export default class SelectRowCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const selectedCells = getSelectionAffectedTableCells( this.editor.model.document.selection );

		this.isEnabled = selectedCells.length > 0;
	}

	/**
	 * @inheritDoc
	 */
	execute() {
		const model = this.editor.model;
		const referenceCells = getSelectionAffectedTableCells( model.document.selection );
		const rowIndexes = getRowIndexes( referenceCells );

		const table = findAncestor( 'table', referenceCells[ 0 ] );
		const cellsToSelect = [];

		for ( const cellInfo of new TableWalker( table, { startRow: rowIndexes.first, endRow: rowIndexes.last } ) ) {
			cellsToSelect.push( cellInfo.cell );
		}

		model.change( writer => {
			writer.setSelection( cellsToSelect.map( cell => writer.createRangeOn( cell ) ) );
		} );
	}
}
