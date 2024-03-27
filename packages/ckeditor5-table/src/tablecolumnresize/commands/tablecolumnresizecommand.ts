/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecolumnresize/commands/tablecolumnresizecommand
 */

import { Command, type Editor } from 'ckeditor5/src/core.js';
import type { DowncastInsertEvent } from 'ckeditor5/src/engine.js';
import type { PossibleResizeColumnRange } from '../tablecolumnresizeutils.js';

/**
 * The resize table column command.
 *
 * The command is registered by {@link module:table/tablecolumnresize/tablecolumnresizeui~TableColumnResizeUI}
 * as the `'resizeTableColumn'` editor command.
 *
 * To resize currently selected column, execute the command:
 *
 * ```ts
 * editor.execute( 'resizeTableColumn', { newColumnWidth: 250 } );
 * ```
 */
export default class TableColumnResizeCommand extends Command {
	/**
	 * The command value: Current size of column (in pixels) and possible resize range of such column..
	 *
	 * @readonly
	 * @observable
	 */
	declare public possibleRange: PossibleResizeColumnRange | null;

	constructor( editor: Editor ) {
		super( editor );

		// After inserting a table, the Resizer column elements are added to the document.
		// However, the plugin remains disabled because none of the column resizers have been mounted in the DOM yet.
		// To ensure that the resize option is enabled, refresh the plugin after rendering the table.
		this.editor.conversion.for( 'editingDowncast' ).add( dispatcher => {
			dispatcher.on<DowncastInsertEvent>( 'insert:table', () => {
				editor.editing.view.once( 'render', this.refresh.bind( this ) );
			} );
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const { plugins } = this.editor;

		const resizeUtils = plugins.get( 'TableColumnResizeUtils' );
		const tableUtils = plugins.get( 'TableUtils' );

		const smallestResizer = resizeUtils.getSmallestSelectedColumnResizer();

		if ( smallestResizer ) {
			const { last, first } = tableUtils.getColumnIndexes(
				tableUtils.getSelectionAffectedTableCells( this.editor.model.document.selection )
			);

			if ( last === first ) {
				this.isEnabled = true;
				this.possibleRange = resizeUtils.getPossibleResizeColumnRange( smallestResizer );
				return;
			}
		}

		this.isEnabled = false;
		this.possibleRange = null;
	}

	/**
	 * Executes the command.
	 *
	 * Resizes selected column to new size.
	 *
	 * @param options.newColumnWidth New column size in pixels.
	 * @fires execute
	 */
	public override execute( { newColumnWidth }: TableColumnResizeCommandOptions ): void {
		const resizeUtils = this.editor.plugins.get( 'TableColumnResizeUtils' );
		const resizer = resizeUtils.getSmallestSelectedColumnResizer();

		resizeUtils.resizeColumnUsingResizer( resizer!, newColumnWidth );
	}
}

export interface TableColumnResizeCommandOptions {

	/**
	 * Represents the width of a new table column in pixels.
	 *
	 *  * The width is automatically clamped if it's too large or too small.
	 *  * The width corresponds to the inner cell content width (excluding borders).
	 */
	newColumnWidth: number;
}
