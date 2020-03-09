/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/commands/splitcellcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import { findAncestor } from './utils';
import { getTableCellsInSelection } from '../tableselection/utils';

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
		const selectedCells = getTableCellsInSelection( this.editor.model.document.selection, true );

		this.isEnabled = selectedCells.length === 1;
	}

	/**
	 * @inheritDoc
	 */
	execute() {
		const model = this.editor.model;
		const document = model.document;
		const selection = document.selection;

		const firstPosition = selection.getFirstPosition();
		const tableCell = findAncestor( 'tableCell', firstPosition );

		const isHorizontally = this.direction === 'horizontally';

		const tableUtils = this.editor.plugins.get( 'TableUtils' );

		if ( isHorizontally ) {
			tableUtils.splitCellHorizontally( tableCell, 2 );
		} else {
			tableUtils.splitCellVertically( tableCell, 2 );
		}
	}
}
