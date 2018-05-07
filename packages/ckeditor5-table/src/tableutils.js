/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/tableutils
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';

import TableWalker from './tablewalker';
import { getParentTable } from './commands/utils';

/**
 * The table utils plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TableUtils extends Plugin {
	/**
	 * Returns table cell location in table.
	 *
	 * @param {module:engine/model/element~Element} tableCell
	 * @returns {Object}
	 */
	getCellLocation( tableCell ) {
		const tableRow = tableCell.parent;
		const table = tableRow.parent;

		const rowIndex = table.getChildIndex( tableRow );

		const tableWalker = new TableWalker( table, { startRow: rowIndex, endRow: rowIndex } );

		for ( const { cell, row, column } of tableWalker ) {
			if ( cell === tableCell ) {
				return { row, column };
			}
		}
	}

	/**
	 * Creates an empty table at given position.
	 *
	 * @param {module:engine/model/position~Position} position Position at which insert a table.
	 * @param {Number} rows Number of rows to create.
	 * @param {Number} columns Number of columns to create.
	 */
	createTable( position, rows, columns ) {
		const model = this.editor.model;

		model.change( writer => {
			const table = writer.createElement( 'table' );

			writer.insert( table, position );

			createEmptyRows( writer, table, 0, rows, columns );
		} );
	}

	insertRows( table, options = {} ) {
		const model = this.editor.model;

		const rows = parseInt( options.rows ) || 1;
		const insertAt = parseInt( options.at ) || 0;

		const headingRows = table.getAttribute( 'headingRows' ) || 0;

		const columns = this.getColumns( table );

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

			createEmptyRows( writer, table, insertAt, rows, tableCellToInsert );
		} );
	}

	insertColumns( table, options = {} ) {
		const model = this.editor.model;

		const columns = parseInt( options.columns ) || 1;
		const insertAt = parseInt( options.at ) || 0;

		model.change( writer => {
			const tableColumns = this.getColumns( table );

			// Inserting at the end and at the begging of a table doesn't require to calculate anything special.
			if ( insertAt === 0 || tableColumns <= insertAt ) {
				for ( const tableRow of table.getChildren() ) {
					createCells( columns, writer, Position.createAt( tableRow, insertAt ? 'end' : 0 ) );
				}

				return;
			}

			const headingColumns = table.getAttribute( 'headingColumns' );

			if ( insertAt < headingColumns ) {
				writer.setAttribute( 'headingColumns', headingColumns + columns, table );
			}

			for ( const { column, cell: tableCell, colspan } of [ ...new TableWalker( table ) ] ) {
				// Check if currently analyzed cell overlaps insert position.
				const isBeforeInsertAt = column < insertAt;
				const expandsOverInsertAt = column + colspan > insertAt;

				if ( isBeforeInsertAt && expandsOverInsertAt ) {
					// And if so expand that table cell.
					writer.setAttribute( 'colspan', colspan + columns, tableCell );
				}

				if ( column === insertAt ) {
					const insertPosition = Position.createBefore( tableCell );

					createCells( columns, writer, insertPosition );
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

			const isOnlySplit = cellColspan >= cellNumber;

			const cellsToInsert = cellNumber - 1;

			if ( isOnlySplit ) {
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

				return;
			}

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
		} );
	}

	splitCellVertically( tableCell, cellNumber = 2 ) {
		const model = this.editor.model;

		const table = getParentTable( tableCell );
		const rowIndex = table.getChildIndex( tableCell.parent );

		model.change( writer => {
			for ( const tableWalkerValue of new TableWalker( table, { startRow: 0, endRow: rowIndex } ) ) {
				if ( tableWalkerValue.cell !== tableCell && tableWalkerValue.row + tableWalkerValue.rowspan > rowIndex ) {
					const rowspan = parseInt( tableWalkerValue.cell.getAttribute( 'rowspan' ) || 1 );

					writer.setAttribute( 'rowspan', rowspan + cellNumber - 1, tableWalkerValue.cell );
				}
			}

			createEmptyRows( writer, table, rowIndex + 1, cellNumber - 1, 1 );
		} );
	}

	/**
	 * Returns number of columns for given table.
	 *
	 * @param {module:engine/model/element} table
	 * @returns {Number}
	 */
	getColumns( table ) {
		const row = table.getChild( 0 );

		return [ ...row.getChildren() ].reduce( ( columns, row ) => {
			const columnWidth = parseInt( row.getAttribute( 'colspan' ) ) || 1;

			return columns + ( columnWidth );
		}, 0 );
	}
}

// Creates empty rows at given index in an existing table.
//
// @param {module:engine/model/writer~Writer} writer
// @param {module:engine/model/element~Element} table
// @param {Number} insertAt Row index of row insertion.
// @param {Number} rows Number of rows to create.
// @param {Number} tableCellToInsert Number of cells to insert in each row.
function createEmptyRows( writer, table, insertAt, rows, tableCellToInsert ) {
	for ( let i = 0; i < rows; i++ ) {
		const tableRow = writer.createElement( 'tableRow' );

		writer.insert( tableRow, table, insertAt );

		for ( let columnIndex = 0; columnIndex < tableCellToInsert; columnIndex++ ) {
			const cell = writer.createElement( 'tableCell' );

			writer.insert( cell, tableRow, 'end' );
		}
	}
}

// Creates cells at given position.
//
// @param {Number} columns Number of columns to create
// @param {module:engine/model/writer~Writer} writer
// @param {module:engine/model/position~Position} insertPosition
function createCells( columns, writer, insertPosition ) {
	for ( let i = 0; i < columns; i++ ) {
		const cell = writer.createElement( 'tableCell' );

		writer.insert( cell, insertPosition );
	}
}
