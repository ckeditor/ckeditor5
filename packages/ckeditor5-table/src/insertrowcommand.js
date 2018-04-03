/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/insertrowcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import TableIterator from './tableiterator';

/**
 * The insert row command.
 *
 * @extends module:core/command~Command
 */
export default class InsertRowCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const doc = model.document;

		const tableParent = getValidParent( doc.selection.getFirstPosition() );

		this.isEnabled = !!tableParent;
	}

	/**
	 * Executes the command.
	 *
	 * @param {Object} [options] Options for the executed command.
	 * @param {Number} [options.rows=1] Number of rows to insert.
	 * @param {Number} [options.at=0] Row index to insert at.
	 *
	 * @fires execute
	 */
	execute( options = {} ) {
		const model = this.editor.model;
		const document = model.document;
		const selection = document.selection;

		const rows = parseInt( options.rows ) || 1;
		const insertAt = parseInt( options.at ) || 0;

		const table = getValidParent( selection.getFirstPosition() );

		const headingRows = table.getAttribute( 'headingRows' ) || 0;

		const columns = getColumns( table );

		model.change( writer => {
			if ( headingRows > insertAt ) {
				writer.setAttribute( 'headingRows', headingRows + rows, table );
			}

			const tableIterator = new TableIterator( table );

			let tableCellToInsert = 0;

			for ( const tableCellInfo of tableIterator.iterateOverRows( 0, insertAt + 1 ) ) {
				const { row, rowspan, colspan, cell } = tableCellInfo;

				if ( row < insertAt ) {
					if ( rowspan > 1 ) {
						// check whether rowspan overlaps inserts:
						if ( row < insertAt && row + rowspan > insertAt ) {
							writer.setAttribute( 'rowspan', rowspan + rows, cell );
						}
					}
				} else if ( row === insertAt ) {
					tableCellToInsert += colspan;
				}
			}

			if ( insertAt >= table.childCount ) {
				tableCellToInsert = columns;
			}

			for ( let i = 0; i < rows; i++ ) {
				const tableRow = writer.createElement( 'tableRow' );

				writer.insert( tableRow, table, insertAt );

				for ( let columnIndex = 0; columnIndex < tableCellToInsert; columnIndex++ ) {
					const cell = writer.createElement( 'tableCell' );

					writer.insert( cell, tableRow, 'end' );
				}
			}
		} );
	}
}

function getValidParent( firstPosition ) {
	let parent = firstPosition.parent;

	while ( parent ) {
		if ( parent.name === 'table' ) {
			return parent;
		}

		parent = parent.parent;
	}
}

function getColumns( table ) {
	const row = table.getChild( 0 );

	return [ ...row.getChildren() ].reduce( ( columns, row ) => {
		const columnWidth = parseInt( row.getAttribute( 'colspan' ) ) || 1;

		return columns + ( columnWidth );
	}, 0 );
}
