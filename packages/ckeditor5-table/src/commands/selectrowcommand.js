/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/commands/selectrowcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

import { getRowIndexes, getSelectionAffectedTableCells } from '../utils/selection';

/**
 * The select row command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'selectTableRow'` editor command.
 *
 * To select the rows containing the selected cells, execute the command:
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
	execute( options = {} ) {
		const model = this.editor.model;
		const selection = model.document.selection;

		const { table, startRow, endRow } = options.table ? {
			table: options.table,
			startRow: options.row,
			endRow: options.row
		} : getOptionsFromSelection( selection );

		const rangesToSelect = [];

		for ( let rowIndex = startRow; rowIndex <= endRow; rowIndex++ ) {
			for ( const cell of table.getChild( rowIndex ).getChildren() ) {
				rangesToSelect.push( model.createRangeOn( cell ) );
			}
		}

		model.change( writer => {
			writer.setSelection( rangesToSelect );
		} );
	}
}

function getOptionsFromSelection( selection ) {
	const referenceCells = getSelectionAffectedTableCells( selection );
	const rowIndexes = getRowIndexes( referenceCells );

	return {
		table: referenceCells[ 0 ].findAncestor( 'table' ),
		startRow: rowIndexes.first,
		endRow: rowIndexes.last
	};
}
