/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/inserttablecommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';

/**
 * The insert table command.
 *
 * @extends module:core/command~Command
 */
export default class InsertTableCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const doc = model.document;

		const validParent = _getValidParent( doc.selection.getFirstPosition() );

		this.isEnabled = model.schema.checkChild( validParent, 'table' );
	}

	/**
	 * Executes the command.
	 *
	 * @param {Object} [options] Options for the executed command.
	 * @param {Number} [options.rows=2] Number of rows to create in inserted table.
	 * @param {Number} [options.columns=2] Number of columns to create in inserted table.
	 *
	 * @fires execute
	 */
	execute( options = {} ) {
		const model = this.editor.model;
		const document = model.document;
		const selection = document.selection;

		const rows = parseInt( options.rows ) || 2;
		const columns = parseInt( options.columns ) || 2;

		const firstPosition = selection.getFirstPosition();

		// TODO does API has it?
		const isRoot = firstPosition.parent === firstPosition.root;
		const insertTablePosition = isRoot ? Position.createAt( firstPosition ) : Position.createAfter( firstPosition.parent );

		model.change( writer => {
			const table = writer.createElement( 'table' );

			writer.insert( table, insertTablePosition );

			// Create rows x columns table.
			for ( let row = 0; row < rows; row++ ) {
				const row = writer.createElement( 'tableRow' );

				writer.insert( row, table, 'end' );

				for ( let column = 0; column < columns; column++ ) {
					const cell = writer.createElement( 'tableCell' );

					writer.insert( cell, row, 'end' );
				}
			}
		} );
	}
}

function _getValidParent( firstPosition ) {
	const parent = firstPosition.parent;
	return parent === parent.root ? parent : parent.parent;
}
