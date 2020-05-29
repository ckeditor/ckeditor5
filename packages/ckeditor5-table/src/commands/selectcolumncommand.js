/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/commands/selectcolumncommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

import TableWalker from '../tablewalker';
import { findAncestor } from './utils';
import { getSelectionAffectedTableCells } from '../utils/selection';

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
		const firstCell = referenceCells[ 0 ];
		const lastCell = referenceCells.pop();

		const tableUtils = this.editor.plugins.get( 'TableUtils' );
		const startLocation = tableUtils.getCellLocation( firstCell );
		const endLocation = tableUtils.getCellLocation( lastCell );

		const startColumn = Math.min( startLocation.column, endLocation.column );
		const endColumn = Math.max( startLocation.column, endLocation.column );

		const rangesToSelect = [];

		for ( const cellInfo of new TableWalker( findAncestor( 'table', firstCell ) ) ) {
			if ( cellInfo.column >= startColumn && cellInfo.column <= endColumn ) {
				rangesToSelect.push( model.createRangeOn( cellInfo.cell ) );
			}
		}

		model.change( writer => {
			writer.setSelection( rangesToSelect );
		} );
	}
}
