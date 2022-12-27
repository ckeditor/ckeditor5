/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/commands/splitcellcommand
 */

import { Command } from 'ckeditor5/src/core';

/**
 * The split cell command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'splitTableCellVertically'`
 * and `'splitTableCellHorizontally'`  editor commands.
 *
 * You can split any cell vertically or horizontally by executing this command. For example, to split the selected table cell vertically:
 *
 *		editor.execute( 'splitTableCellVertically' );
 *
 * @extends module:core/command~Command
 */
export default class SplitCellCommand extends Command {
	/**
	 * Creates a new `SplitCellCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor The editor on which this command will be used.
	 * @param {Object} options
	 * @param {String} options.direction Indicates whether the command should split cells `'horizontally'` or `'vertically'`.
	 */
	constructor( editor, options = {} ) {
		super( editor );

		/**
		 * The direction that indicates which cell will be split.
		 *
		 * @readonly
		 * @member {String} #direction
		 */
		this.direction = options.direction || 'horizontally';
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		const tableUtils = this.editor.plugins.get( 'TableUtils' );
		const selectedCells = tableUtils.getSelectionAffectedTableCells( this.editor.model.document.selection );

		this.isEnabled = selectedCells.length === 1;
	}

	/**
	 * @inheritDoc
	 */
	execute() {
		const tableUtils = this.editor.plugins.get( 'TableUtils' );
		const tableCell = tableUtils.getSelectionAffectedTableCells( this.editor.model.document.selection )[ 0 ];
		const isHorizontal = this.direction === 'horizontally';

		if ( isHorizontal ) {
			tableUtils.splitCellHorizontally( tableCell, 2 );
		} else {
			tableUtils.splitCellVertically( tableCell, 2 );
		}
	}
}
