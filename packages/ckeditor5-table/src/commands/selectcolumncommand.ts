/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/commands/selectcolumncommand
 */

import { Command, type Editor } from 'ckeditor5/src/core.js';
import type { Range } from 'ckeditor5/src/engine.js';
import type TableUtils from '../tableutils.js';

import TableWalker from '../tablewalker.js';

/**
 * The select column command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'selectTableColumn'` editor command.
 *
 * To select the columns containing the selected cells, execute the command:
 *
 * ```ts
 * editor.execute( 'selectTableColumn' );
 * ```
 */
export default class SelectColumnCommand extends Command {
	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		// It does not affect data so should be enabled in read-only mode.
		this.affectsData = false;
	}

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const tableUtils: TableUtils = this.editor.plugins.get( 'TableUtils' );
		const selectedCells = tableUtils.getSelectionAffectedTableCells( this.editor.model.document.selection );

		this.isEnabled = selectedCells.length > 0;
	}

	/**
	 * @inheritDoc
	 */
	public override execute(): void {
		const tableUtils: TableUtils = this.editor.plugins.get( 'TableUtils' );
		const model = this.editor.model;
		const referenceCells = tableUtils.getSelectionAffectedTableCells( model.document.selection );
		const firstCell = referenceCells[ 0 ];
		const lastCell = referenceCells.pop()!;
		const table = firstCell.findAncestor( 'table' )!;

		const startLocation = tableUtils.getCellLocation( firstCell );
		const endLocation = tableUtils.getCellLocation( lastCell );

		const startColumn = Math.min( startLocation.column, endLocation.column );
		const endColumn = Math.max( startLocation.column, endLocation.column );

		const rangesToSelect: Array<Range> = [];

		for ( const cellInfo of new TableWalker( table, { startColumn, endColumn } ) ) {
			rangesToSelect.push( model.createRangeOn( cellInfo.cell ) );
		}

		model.change( writer => {
			writer.setSelection( rangesToSelect );
		} );
	}
}
