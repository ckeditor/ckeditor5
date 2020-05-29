/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/commands/selectrowcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

import { findAncestor } from './utils';
import { getRowIndexes, getSelectionAffectedTableCells } from '../utils/utils';

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
	execute() {
		const model = this.editor.model;
		const referenceCells = getSelectionAffectedTableCells( model.document.selection );
		const rowIndexes = getRowIndexes( referenceCells );

		const table = findAncestor( 'table', referenceCells[ 0 ] );
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
