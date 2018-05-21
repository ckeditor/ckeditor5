/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/tablewalker
 */

/**
 * Table iterator class. It allows to iterate over a table cells. For each cell the iterator yields
 * {@link module:table/tablewalker~TableWalkerValue} with proper table cell attributes.
 */
export default class TableWalker {
	/**
	 * Creates an instance of table walker.
	 *
	 *
	 * The TableWalker iterates internally by traversing table from row index = 0 and column index = 0.
	 * It walks row by row and column by column in order to output values defined in constructor.
	 * By default it will output only those locations that are occupied by a cell to include also a spanned rows & columns
	 * pass `includeSpanned` option to a constructor.
	 *
	 * The most important values of iterator values are column & row indexes of a cell.
	 *
	 * To iterate over given row:
	 *
	 *		const tableWalker = new TableWalker( table, { startRow: 1, endRow: 2 } );
	 *
	 *		for ( const cellInfo of tableWalker ) {
	 *			console.log( 'A cell at row ' + cellInfo.row + ' and column ' + cellInfo.column );
	 *		}
	 *
	 * For instance the above code for a table:
	 *
	 *		+----+----+----+----+----+----+
	 *		| 00      | 02 | 03      | 05 |
	 *		|         +----+----+----+----+
	 *		|         | 12      | 14 | 15 |
	 *		|         +----+----+----+----+
	 *		|         | 22                |
	 *		|----+----+                   +
	 *		| 31 | 32 |                   |
	 *		+----+----+----+----+----+----+
	 *
	 * will log in the console:
	 *
	 *		'A cell at row 1 and column 2'
	 *		'A cell at row 1 and column 4'
	 *		'A cell at row 1 and column 5'
	 *		'A cell at row 2 and column 2'
	 *
	 * To iterate over spanned cells also:
	 *
	 *		const tableWalker = new TableWalker( table, { startRow: 1, endRow: 1, includeSpanned: true } );
	 *
	 *		for ( const cellInfo of tableWalker ) {
	 *			console.log( 'Cell at ' + cellInfo.row + ' x ' + cellInfo.column + ' : ' + ( cellInfo.cell ? 'has data' : 'is spanned' ) );
	 *		}
	 *
	 * will log in the console for the table from previous example:
	 *
	 *		'Cell at 1 x 0 : is spanned'
	 *		'Cell at 1 x 1 : is spanned'
	 *		'Cell at 1 x 2 : has data'
	 *		'Cell at 1 x 3 : is spanned'
	 *		'Cell at 1 x 4 : has data'
	 *		'Cell at 1 x 5 : has data'
	 *
	 * @constructor
	 * @param {module:engine/model/element~Element} table A table over which iterate.
	 * @param {Object} [options={}] Object with configuration.
	 * @param {Number} [options.column] A column index for which this iterator will output cells.
	 * @param {Number} [options.startRow=0] A row index for which this iterator should start.
	 * @param {Number} [options.endRow] A row index for which this iterator should end.
	 * @param {Boolean} [options.includeSpanned] Also return values for spanned cells.
	 */
	constructor( table, options = {} ) {
		/**
		 * The walker's table element.
		 *
		 * @readonly
		 * @member {module:engine/model/element~Element}
		 */
		this.table = table;

		/**
		 * A row index on which this iterator will start.
		 *
		 * @readonly
		 * @member {Number}
		 */
		this.startRow = options.startRow || 0;

		/**
		 * A row index on which this iterator will end.
		 *
		 * @readonly
		 * @member {Number}
		 */
		this.endRow = typeof options.endRow == 'number' ? options.endRow : undefined;

		/**
		 * Enables output of spanned cells that are normally not yielded.
		 *
		 * @readonly
		 * @member {Boolean}
		 */
		this.includeSpanned = !!options.includeSpanned;

		/**
		 * If set table walker will only output cells of given column or cells that overlaps it.
		 *
		 * @readonly
		 * @member {Number}
		 */
		this.column = typeof options.column == 'number' ? options.column : undefined;

		/**
		 * Row indexes to skip from iteration.
		 *
		 * @readonly
		 * @member {Set<Number>}
		 * @private
		 */
		this._skipRows = new Set();

		/**
		 * A current row index.
		 *
		 * @readonly
		 * @member {Number}
		 * @private
		 */
		this._row = 0;

		/**
		 * A current column index.
		 *
		 * @readonly
		 * @member {Number}
		 * @private
		 */
		this._column = 0;

		/**
		 * A cell index in a parent row. For spanned cells when {@link #includeSpanned} is set to true
		 * this represents the index of next table cell.
		 *
		 * @readonly
		 * @member {Number}
		 * @private
		 */
		this._cell = 0;

		/**
		 * Holds map of spanned cells in a table.
		 *
		 * @readonly
		 * @member {Map<Number, Map.<Number, Number>>}
		 * @private
		 */
		this._spannedCells = new Map();
	}

	/**
	 * Iterable interface.
	 *
	 * @returns {Iterable.<module:table/tablewalker~TableWalkerValue>}
	 */
	[ Symbol.iterator ]() {
		return this;
	}

	/**
	 * Gets the next table walker's value.
	 *
	 * @returns {module:table/tablewalker~TableWalkerValue} Next table walker's value.
	 */
	next() {
		const row = this.table.getChild( this._row );

		// Iterator is done when no row (table end) or the row is after #endRow.
		if ( !row || this._isOverEndRow() ) {
			return { done: true };
		}

		// Spanned cell location handling.
		if ( this._isSpanned( this._row, this._column ) ) {
			// Current column must be kept as it will be updated before returning current value.
			const currentColumn = this._column;
			const outValue = this._formatOutValue( undefined, currentColumn );

			// Advance to next column - always.
			this._column++;

			const skipCurrentValue = !this.includeSpanned || this._shouldSkipRow() || this._shouldSkipColumn( currentColumn, 1 );

			// The current value will be returned only if #includedSpanned=true and also current row and column are not skipped.
			return skipCurrentValue ? this.next() : outValue;
		}

		// The cell location is not spanned by other cells.
		const cell = row.getChild( this._cell );

		if ( !cell ) {
			// If there are no more cells left in row advance to next row.
			this._row++;
			// And reset column & cell indexes.
			this._column = 0;
			this._cell = 0;

			// Return next value.
			return this.next();
		}

		// Read table cell attributes.
		const colspan = parseInt( cell.getAttribute( 'colspan' ) || 1 );
		const rowspan = parseInt( cell.getAttribute( 'rowspan' ) || 1 );

		// Record this cell spans if it's not 1x1 cell.
		if ( colspan > 1 || rowspan > 1 ) {
			this._recordSpans( this._row, this._column, rowspan, colspan );
		}

		// Current column must be kept as it will be updated before returning current value.
		const currentColumn = this._column;
		const outValue = this._formatOutValue( cell, currentColumn, rowspan, colspan );

		// Advance to next column before returning value.
		this._column++;

		// Advance to next cell in a parent row before returning value.
		this._cell++;

		const skipCurrentValue = this._shouldSkipRow() || this._shouldSkipColumn( currentColumn, colspan );

		// The current value will be returned only if current row & column are not skipped.
		return skipCurrentValue ? this.next() : outValue;
	}

	/**
	 * Mark a row to skip on next iteration - will skip also cells from current row if any.
	 *
	 * @param {Number} row Row index to skip.
	 */
	skipRow( row ) {
		this._skipRows.add( row );
	}

	/**
	 * Check if current row is over {@link #endRow}.
	 *
	 * @returns {Boolean}
	 * @private
	 */
	_isOverEndRow() {
		// If {@link #endRow) is defined skipp all rows above it.
		return this.endRow !== undefined && this._row > this.endRow;
	}

	/**
	 * Common method for formatting iterator's out value.
	 *
	 * @param {module:engine/model/element~Element|undefined} cell Table cell to output. Might be undefined for spanned cell locations.
	 * @param {Number} column Column index (use cached value)
	 * @param {Number} rowspan Rowspan of current cell.
	 * @param {Number} colspan Colspan of current cell.
	 * @returns {{done: boolean, value: {cell: *, row: Number, column: *, rowspan: *, colspan: *, cellIndex: Number}}}
	 * @private
	 */
	_formatOutValue( cell, column, rowspan = 1, colspan = 1 ) {
		return {
			done: false,
			value: {
				cell,
				row: this._row,
				column,
				rowspan,
				colspan,
				cellIndex: this._cell
			}
		};
	}

	/**
	 * Checks if current row should be skipped.
	 *
	 * @returns {Boolean}
	 * @private
	 */
	_shouldSkipRow() {
		const rowIsBelowStartRow = this._row < this.startRow;
		const rowIsMarkedAsSkipped = this._skipRows.has( this._row );

		return rowIsBelowStartRow || rowIsMarkedAsSkipped;
	}

	/**
	 * Checks if current column should be skipped.
	 *
	 * @param {Number} column
	 * @param {Number} colspan
	 * @returns {Boolean}
	 * @private
	 */
	_shouldSkipColumn( column, colspan ) {
		if ( this.column === undefined ) {
			// The {@link #column} is not defined so output all columns.
			return false;
		}

		// When outputting cells from given column we skip:
		// - Cells that are not on that column.
		const isCurrentColumn = column === this.column;
		// - CSells that are before given column and they overlaps given column.
		const isPreviousThatOverlapsColumn = column < this.column && column + colspan > this.column;

		return !isCurrentColumn && !isPreviousThatOverlapsColumn;
	}

	/**
	 * Checks if current cell location - row x column - is spanned by other cell.
	 *
	 * @param {Number} row Row index of a cell location to check.
	 * @param {Number} column Column index of a cell location to check.
	 * @returns {Boolean}
	 * @private
	 */
	_isSpanned( row, column ) {
		if ( !this._spannedCells.has( row ) ) {
			// No spans for given row.
			return false;
		}

		const rowSpans = this._spannedCells.get( row );

		// If spans for given rows has entry for column it means that this location if spanned by other cell.
		return rowSpans.has( column );
	}

	/**
	 * Updates spanned cells map relative to current cell location and it's span dimensions.
	 *
	 * @param {Number} row Row index of a cell.
	 * @param {Number} column Column index of a cell.
	 * @param {Number} rowspan Cell's height.
	 * @param {Number} colspan Cell's width.
	 * @private
	 */
	_recordSpans( row, column, rowspan, colspan ) {
		// This will update all cell locations after current column - ie a cell has colspan set.
		for ( let columnToUpdate = column + 1; columnToUpdate <= column + colspan - 1; columnToUpdate++ ) {
			this._markSpannedCell( row, columnToUpdate );
		}

		// This will update all rows below current up to row's height.
		for ( let rowToUpdate = row + 1; rowToUpdate < row + rowspan; rowToUpdate++ ) {
			for ( let columnToUpdate = column; columnToUpdate <= column + colspan - 1; columnToUpdate++ ) {
				this._markSpannedCell( rowToUpdate, columnToUpdate );
			}
		}
	}

	/**
	 * Marks cell location as spanned by other cell.
	 *
	 * @param {Number} row Row index of cell location.
	 * @param {Number} column Column index of cell location.
	 * @private
	 */
	_markSpannedCell( row, column ) {
		if ( !this._spannedCells.has( row ) ) {
			this._spannedCells.set( row, new Map() );
		}

		const rowSpans = this._spannedCells.get( row );

		rowSpans.set( column, true );
	}
}

/**
 * Object returned by {@link module:table/tablewalker~TableWalker} when traversing table cells.
 *
 * @typedef {Object} module:table/tablewalker~TableWalkerValue
 * @property {module:engine/model/element~Element} [cell] Current table cell. Might be empty if
 * {@link module:table/tablewalker~TableWalker#includeSpanned} is set to true.
 * @property {Number} row The row index of a cell.
 * @property {Number} column The column index of a cell. Column index is adjusted to widths & heights of previous cells.
 * @property {Number} [colspan] The colspan attribute of a cell - always defined even if model attribute is not present. Not set if
 * {@link module:table/tablewalker~TableWalker#includeSpanned} is set to true.
 * @property {Number} [rowspan] The rowspan attribute of a cell - always defined even if model attribute is not present. Not set if
 * {@link module:table/tablewalker~TableWalker#includeSpanned} is set to true.
 * @property {Number} cellIndex The index of a current cell in a parent row. When using `includeSpanned` option it will indicate next child
 * index if #cell is empty (which indicates that cell is spanned by other cell).
 */
