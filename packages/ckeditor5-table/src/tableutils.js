/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/commands/insertrowcommand
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import TableWalker from './tablewalker';
import { getColumns } from './commands/utils';

/**
 * The table utils plugin.
 *
 * @extends module:core/command~Command
 */
export default class TableUtils extends Plugin {
	insertRow( table, options = {} ) {
		const model = this.editor.model;

		const rows = parseInt( options.rows ) || 1;
		const insertAt = parseInt( options.at ) || 0;

		const headingRows = table.getAttribute( 'headingRows' ) || 0;

		const columns = getColumns( table );

		model.change( writer => {
			if ( headingRows > insertAt ) {
				writer.setAttribute( 'headingRows', headingRows + rows, table );
			}

			const tableIterator = new TableWalker( table, { endRow: insertAt + 1 } );

			let tableCellToInsert = 0;

			for ( const tableCellInfo of tableIterator ) {
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
