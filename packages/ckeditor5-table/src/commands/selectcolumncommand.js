/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/commands/selectcolumncommand
 */

import { Command } from 'ckeditor5/src/core';

import TableWalker from '../tablewalker';

/**
 * The select column command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'selectTableColumn'` editor command.
 *
 * To select the columns containing the selected cells, execute the command:
 *
 *		editor.execute( 'selectTableColumn' );
 *
 * @extends module:core/command~Command
 */
export default class SelectColumnCommand extends Command {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		// It does not affect data so should be enabled in read-only mode.
		this.affectsData = false;
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		const tableUtils = this.editor.plugins.get( 'TableUtils' );
		const selectedCells = tableUtils.getSelectionAffectedTableCells( this.editor.model.document.selection );

		this.isEnabled = selectedCells.length > 0;
	}

	/**
	 * @inheritDoc
	 */
	execute() {
		const tableUtils = this.editor.plugins.get( 'TableUtils' );
		const model = this.editor.model;
		const referenceCells = tableUtils.getSelectionAffectedTableCells( model.document.selection );
		const firstCell = referenceCells[ 0 ];
		const lastCell = referenceCells.pop();
		const table = firstCell.findAncestor( 'table' );

		const startLocation = tableUtils.getCellLocation( firstCell );
		const endLocation = tableUtils.getCellLocation( lastCell );

		const startColumn = Math.min( startLocation.column, endLocation.column );
		const endColumn = Math.max( startLocation.column, endLocation.column );

		const rangesToSelect = [];

		for ( const cellInfo of new TableWalker( table, { startColumn, endColumn } ) ) {
			rangesToSelect.push( model.createRangeOn( cellInfo.cell ) );
		}

		model.change( writer => {
			writer.setSelection( rangesToSelect );
		} );
	}
}
