/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/commands/insertcolumncommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import TableWalker from '../tablewalker';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import { getColumns, getParentTable } from './utils';

/**
 * The insert column command.
 *
 * @extends module:core/command~Command
 */
export default class InsertColumnCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const doc = model.document;

		const tableParent = getParentTable( doc.selection.getFirstPosition() );

		this.isEnabled = !!tableParent;
	}

	/**
	 * Executes the command.
	 *
	 * @param {Object} [options] Options for the executed command.
	 * @param {Number} [options.columns=1] Number of rows to insert.
	 * @param {Number} [options.at=0] Row index to insert at.
	 *
	 * @fires execute
	 */
	execute( options = {} ) {
		const model = this.editor.model;
		const document = model.document;
		const selection = document.selection;

		const columns = parseInt( options.columns ) || 1;
		const insertAt = parseInt( options.at ) || 0;

		const table = getParentTable( selection.getFirstPosition() );

		model.change( writer => {
			const tableColumns = getColumns( table );

			// Inserting at the end of a table
			if ( tableColumns <= insertAt ) {
				for ( const tableRow of table.getChildren() ) {
					createCells( columns, writer, Position.createAt( tableRow, 'end' ) );
				}

				return;
			}

			const headingColumns = table.getAttribute( 'headingColumns' );

			if ( insertAt < headingColumns ) {
				writer.setAttribute( 'headingColumns', headingColumns + columns, table );
			}

			const tableIterator = new TableWalker( table );

			let currentRow = -1;
			let currentRowInserted = false;

			for ( const tableCellInfo of tableIterator ) {
				const { row, column, cell: tableCell, colspan } = tableCellInfo;

				if ( currentRow !== row ) {
					currentRow = row;
					currentRowInserted = false;
				}

				const shouldExpandSpan = colspan > 1 &&
					( column !== insertAt ) &&
					( column <= insertAt ) &&
					( column <= insertAt + columns ) &&
					( column + colspan > insertAt );

				if ( shouldExpandSpan ) {
					writer.setAttribute( 'colspan', colspan + columns, tableCell );
				}

				if ( column === insertAt || ( column < insertAt + columns && column > insertAt && !currentRowInserted ) ) {
					const insertPosition = Position.createBefore( tableCell );

					createCells( columns, writer, insertPosition );

					currentRowInserted = true;
				}
			}
		} );
	}
}

// Creates cells at given position.
//
// @param {Number} columns Number of columns to create
// @param {module:engine/model/writer} writer
// @param {module:engine/model/position} insertPosition
function createCells( columns, writer, insertPosition ) {
	for ( let i = 0; i < columns; i++ ) {
		const cell = writer.createElement( 'tableCell' );

		writer.insert( cell, insertPosition );
	}
}
