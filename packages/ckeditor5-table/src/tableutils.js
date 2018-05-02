/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/commands/insertrowcommand
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import TableWalker from './tablewalker';
import { getColumns, getParentTable } from './commands/utils';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';

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

	splitCellHorizontally( tableCell, cellNumber = 2 ) {
		const model = this.editor.model;

		const table = getParentTable( tableCell );

		model.change( writer => {
			const tableMap = [ ...new TableWalker( table ) ];
			const cellData = tableMap.find( value => value.cell === tableCell );

			const cellColumn = cellData.column;
			const cellColspan = cellData.colspan;
			const cellRowspan = cellData.rowspan;

			const splitOnly = cellColspan >= cellNumber;

			const cellsToInsert = cellNumber - 1;

			if ( !splitOnly ) {
				const cellsToUpdate = tableMap.filter( value => {
					const cell = value.cell;

					if ( cell === tableCell ) {
						return false;
					}

					const colspan = value.colspan;
					const column = value.column;

					return column === cellColumn || ( column < cellColumn && column + colspan - 1 >= cellColumn );
				} );

				for ( const tableWalkerValue of cellsToUpdate ) {
					const colspan = tableWalkerValue.colspan;
					const cell = tableWalkerValue.cell;

					writer.setAttribute( 'colspan', colspan + cellNumber - 1, cell );
				}

				for ( let i = 0; i < cellsToInsert; i++ ) {
					writer.insertElement( 'tableCell', Position.createAfter( tableCell ) );
				}
			} else {
				const colspanOfInsertedCells = Math.floor( cellColspan / cellNumber );
				const newColspan = ( cellColspan - colspanOfInsertedCells * cellNumber ) + colspanOfInsertedCells;

				if ( newColspan > 1 ) {
					writer.setAttribute( 'colspan', newColspan, tableCell );
				} else {
					writer.removeAttribute( 'colspan', tableCell );
				}

				const attributes = colspanOfInsertedCells > 1 ? { colspan: colspanOfInsertedCells } : {};

				if ( cellRowspan > 1 ) {
					attributes.rowspan = cellRowspan;
				}

				for ( let i = 0; i < cellsToInsert; i++ ) {
					writer.insertElement( 'tableCell', attributes, Position.createAfter( tableCell ) );
				}
			}
		} );
	}

	splitCellVertically() {
	}
}
