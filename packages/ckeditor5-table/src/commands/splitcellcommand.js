/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/commands/splitcellcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import { unsplitVertically } from './utils';

/**
 * The split cell command.
 *
 * @extends module:core/command~Command
 */
export default class SplitCellCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const doc = model.document;

		const element = doc.selection.getFirstPosition().parent;

		this.isEnabled = element.is( 'tableCell' ) && ( element.hasAttribute( 'colspan' ) || element.hasAttribute( 'rowspan' ) );
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 */
	execute() {
		const model = this.editor.model;
		const document = model.document;
		const selection = document.selection;

		const firstPosition = selection.getFirstPosition();
		const tableCell = firstPosition.parent;

		const colspan = parseInt( tableCell.getAttribute( 'colspan' ) || 1 );
		const rowspan = parseInt( tableCell.getAttribute( 'rowspan' ) || 1 );

		model.change( writer => {
			if ( rowspan > 1 ) {
				unsplitVertically( tableCell, writer, { breakHorizontally: true } );
			}

			if ( colspan > 1 ) {
				for ( let i = colspan - 1; i > 0; i-- ) {
					writer.insertElement( 'tableCell', Position.createAfter( tableCell ) );
				}
			}

			writer.removeAttribute( 'colspan', tableCell );
			writer.removeAttribute( 'rowspan', tableCell );
		} );
	}
}
