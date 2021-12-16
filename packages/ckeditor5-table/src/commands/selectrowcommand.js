/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/commands/selectrowcommand
 */

import { Command } from 'ckeditor5/src/core';

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
	constructor( editor ) {
		super( editor );

		// It does not affect data so should be enabled in read-only mode.
		this.affectsData = false;
	}

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

		const table = referenceCells[ 0 ].findAncestor( 'table' );
		const rangesToSelect = [];

		for ( let rowIndex = rowIndexes.first; rowIndex <= rowIndexes.last; rowIndex++ ) {
			for ( const cell of table.getChild( rowIndex ).getChildren() ) {
				rangesToSelect.push( model.createRangeOn( cell ) );
			}
		}

		model.change( writer => {
			writer.setSelection( rangesToSelect );
		} );
	}
}
