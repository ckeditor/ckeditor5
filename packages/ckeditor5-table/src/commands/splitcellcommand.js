/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/commands/splitcellcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import TableUtils from '../tableutils';

/**
 * The split cell command.
 *
 * @extends module:core/command~Command
 */
export default class SplitCellCommand extends Command {
	/**
	 * @param editor
	 * @param options
	 */
	constructor( editor, options = {} ) {
		super( editor );

		this.direction = options.direction || 'horizontally';
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const doc = model.document;

		const element = doc.selection.getFirstPosition().parent;

		this.isEnabled = element.is( 'tableCell' );
	}

	/**
	 * @inheritDoc
	 */
	execute() {
		const model = this.editor.model;
		const document = model.document;
		const selection = document.selection;

		const firstPosition = selection.getFirstPosition();
		const tableCell = firstPosition.parent;

		const isHorizontally = this.direction === 'horizontally';

		const tableUtils = this.editor.plugins.get( TableUtils );

		if ( isHorizontally ) {
			tableUtils.splitCellHorizontally( tableCell, 2 );
		} else {
			tableUtils.splitCellVertically( tableCell, 2 );
		}
	}
}
