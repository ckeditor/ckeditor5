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
import { getParentTable, updateNumericAttribute } from './commands/utils';

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

	/**
	 * Insert rows into a table.
	 *
	 * @param {module:engine/model/element~Element} table
	 * @param {Object} options
	 * @param {Number} [options.at=0] Row index at which insert rows.
	 * @param {Number} [options.rows=1] Number of rows to insert.
	 */
	insertRows( table, options = {} ) {
		const model = this.editor.model;

		const insertAt = options.at || 0;
		const rows = options.rows || 1;

		const headingRows = table.getAttribute( 'headingRows' ) || 0;

		model.change( writer => {
			if ( headingRows > insertAt ) {
				writer.setAttribute( 'headingRows', headingRows + rows, table );
			}

			const tableIterator = new TableWalker( table, { endRow: insertAt + 1 } );

			let tableCellToInsert = 0;

			for ( const tableCellInfo of tableIterator ) {
				const { row, rowspan, colspan, cell } = tableCellInfo;

				const isBeforeInsertedRow = row < insertAt;
				const overlapsInsertedRow = row + rowspan > insertAt;

				if ( isBeforeInsertedRow && overlapsInsertedRow ) {
					writer.setAttribute( 'rowspan', rowspan + rows, cell );
				}

				// Calculate how many cells to insert based on the width of cells in a row at insert position.
				// It might be lower then table width as some cells might overlaps inserted row.
				if ( row === insertAt ) {
					tableCellToInsert += colspan;
				}
			}

			// If insertion occurs on the end of a table use table width.
			if ( insertAt >= table.childCount ) {
				tableCellToInsert = this.getColumns( table );
			}

			createEmptyRows( writer, table, insertAt, rows, tableCellToInsert );
		} );
	}

	/**
	 * Inserts columns into a table.
	 *
	 * @param {module:engine/model/element~Element} table
	 * @param {Object} options
	 * @param {Number} [options.at=0] Column index at which insert columns.
	 * @param {Number} [options.columns=1] Number of columns to insert.
	 */
	insertColumns( table, options = {} ) {
		const model = this.editor.model;

		const insertAt = options.at || 0;
		const columns = options.columns || 1;

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

	/**
	 * Divides table cell horizontally into several ones.
	 *
	 * @param {module:engine/model/element~Element} tableCell
	 * @param {Number} numberOfCells
	 */
	splitCellHorizontally( tableCell, numberOfCells = 2 ) {
		const model = this.editor.model;
		const table = getParentTable( tableCell );

		model.change( writer => {
			const tableMap = [ ...new TableWalker( table ) ];
			const cellData = tableMap.find( value => value.cell === tableCell );

			const cellColspan = cellData.colspan;

			const cellsToInsert = numberOfCells - 1;
			const attributes = {};

			if ( cellColspan >= numberOfCells ) {
				// If the colspan is bigger then requied cells to create we don't need to update colspan on cells from the same column.
				// The colspan will be equally devided for newly created cells and a current one.
				const colspanOfInsertedCells = Math.floor( cellColspan / numberOfCells );
				const newColspan = ( cellColspan - colspanOfInsertedCells * numberOfCells ) + colspanOfInsertedCells;

				if ( colspanOfInsertedCells > 1 ) {
					attributes.colspan = colspanOfInsertedCells;
				}

				updateNumericAttribute( 'colspan', newColspan, tableCell, writer );

				const cellRowspan = cellData.rowspan;

				if ( cellRowspan > 1 ) {
					attributes.rowspan = cellRowspan;
				}
			} else {
				const cellColumn = cellData.column;

				const cellsToUpdate = tableMap.filter( ( { cell, colspan, column } ) => {
					const isOnSameColumn = cell !== tableCell && column === cellColumn;
					const spansOverColumn = ( column < cellColumn && column + colspan - 1 >= cellColumn );

					return isOnSameColumn || spansOverColumn;
				} );

				for ( const { cell, colspan } of cellsToUpdate ) {
					writer.setAttribute( 'colspan', colspan + numberOfCells - 1, cell );
				}
			}

			createCells( cellsToInsert, writer, Position.createAfter( tableCell ), attributes );
		} );
	}

	/**
	 * Divides table cell horizontally into several ones.
	 *
	 * @param {module:engine/model/element~Element} tableCell
	 * @param {Number} numberOfCells
	 */
	splitCellVertically( tableCell, numberOfCells = 2 ) {
		const model = this.editor.model;

		const table = getParentTable( tableCell );
		const rowIndex = table.getChildIndex( tableCell.parent );

		model.change( writer => {
			const tableMap = [ ...new TableWalker( table, { startRow: 0, endRow: rowIndex } ) ];

			for ( const { cell, rowspan, row } of tableMap ) {
				if ( cell !== tableCell && row + rowspan > rowIndex ) {
					const rowspan = parseInt( cell.getAttribute( 'rowspan' ) || 1 );

					writer.setAttribute( 'rowspan', rowspan + numberOfCells - 1, cell );
				}
			}

			createEmptyRows( writer, table, rowIndex + 1, numberOfCells - 1, 1 );
		} );
	}

	/**
	 * Returns number of columns for given table.
	 *
	 * @param {module:engine/model/element~Element} table Table to analyze.
	 * @returns {Number}
	 */
	getColumns( table ) {
		// Analyze first row only as all the rows should have the same width.
		const row = table.getChild( 0 );

		return [ ...row.getChildren() ].reduce( ( columns, row ) => {
			const columnWidth = parseInt( row.getAttribute( 'colspan' ) || 1 );

			return columns + columnWidth;
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
function createCells( cells, writer, insertPosition, attributes = {} ) {
	for ( let i = 0; i < cells; i++ ) {
		writer.insertElement( 'tableCell', attributes, insertPosition );
	}
}
