/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/commands/selectrowcommand
 */

import { Command, type Editor } from 'ckeditor5/src/core';
import type { Range, Element } from 'ckeditor5/src/engine';
import type TableUtils from '../tableutils';

/**
 * The select row command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'selectTableRow'` editor command.
 *
 * To select the rows containing the selected cells, execute the command:
 *
 * ```ts
 * editor.execute( 'selectTableRow' );
 * ```
 */
export default class SelectRowCommand extends Command {
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
		const model = this.editor.model;
		const tableUtils: TableUtils = this.editor.plugins.get( 'TableUtils' );
		const referenceCells = tableUtils.getSelectionAffectedTableCells( model.document.selection );
		const rowIndexes = tableUtils.getRowIndexes( referenceCells );

		const table = referenceCells[ 0 ].findAncestor( 'table' )!;
		const rangesToSelect: Array<Range> = [];

		for ( let rowIndex = rowIndexes.first; rowIndex <= rowIndexes.last; rowIndex++ ) {
			for ( const cell of ( table.getChild( rowIndex ) as Element ).getChildren() ) {
				rangesToSelect.push( model.createRangeOn( cell ) );
			}
		}

		model.change( writer => {
			writer.setSelection( rangesToSelect );
		} );
	}
}
