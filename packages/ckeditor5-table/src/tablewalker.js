/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablewalker
 */

/**
 * The table iterator class. It allows to iterate over table cells. For each cell the iterator yields
 * {@link module:table/tablewalker~TableWalkerValue} with proper table cell attributes.
 */
export default class TableWalker {
	/**
	 * Creates an instance of the table walker.
	 *
	 * The table walker iterates internally by traversing the table from row index = 0 and column index = 0.
	 * It walks row by row and column by column in order to output values defined in the constructor.
	 * By default it will output only the locations that are occupied by a cell. To include also spanned rows and columns,
	 * pass the `includeSpanned` option to the constructor.
	 *
	 * The most important values of the iterator are column and row indexes of a cell.
	 *
	 * See {@link module:table/tablewalker~TableWalkerValue} what values are returned by the table walker.
	 *
	 * To iterate over a given row:
	 *
	 *		const tableWalker = new TableWalker( table, { startRow: 1, endRow: 2 } );
	 *
	 *		for ( const cellInfo of tableWalker ) {
	 *			console.log( 'A cell at row ' + cellInfo.row + ' and column ' + cellInfo.column );
	 *		}
	 *
	 * For instance the code above for the following table:
	 *
	 *		+----+----+----+----+----+----+
	 *		| 00      | 02 | 03 | 04 | 05 |
	 *		|         +----+----+----+----+
	 *		|         | 12      | 14 | 15 |
	 *		|         +----+----+----+    +
	 *		|         | 22           |    |
	 *		|----+----+----+----+----+    +
	 *		| 30 | 31 | 32 | 33 | 34 |    |
	 *		+----+----+----+----+----+----+
	 *
	 * will log in the console:
	 *
	 *		'A cell at row 1 and column 2'
	 *		'A cell at row 1 and column 4'
	 *		'A cell at row 1 and column 5'
	 *		'A cell at row 2 and column 2'
	 *
	 * To also iterate over spanned cells:
	 *
	 *		const tableWalker = new TableWalker( table, { startRow: 1, endRow: 1, includeSpanned: true } );
	 *
	 *		for ( const value of tableWalker ) {
	 *			console.log( 'Cell at ' + value.row + ' x ' + value.column + ' : ' + ( value.isSpanned ? 'is spanned' : 'has data' ) );
	 *		}
	 *
	 * will log in the console for the table from the previous example:
	 *
	 *		'Cell at 1 x 0 : is spanned'
	 *		'Cell at 1 x 1 : is spanned'
	 *		'Cell at 1 x 2 : has data'
	 *		'Cell at 1 x 3 : is spanned'
	 *		'Cell at 1 x 4 : has data'
	 *		'Cell at 1 x 5 : has data'
	 *
	 * @constructor
	 * @param {module:engine/model/element~Element} table A table over which the walker iterates.
	 * @param {Object} [options={}] An object with configuration.
	 * @param {Number} [options.column] A column index for which this iterator will output cells.
	 * @param {Number} [options.startRow=0] A row index from which this iterator should start.
	 * @param {Number} [options.endRow] A row index at which this iterator should end.
	 * @param {Boolean} [options.includeSpanned=false] Also return values for spanned cells.
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
		 * A row index from which this iterator will start.
		 *
		 * @readonly
		 * @member {Number}
		 */
		this.startRow = options.startRow || 0;

		/**
		 * A row index at which this iterator will end.
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
		 * If set, the table walker will only output cells of a given column or cells that overlap it.
		 *
		 * @readonly
		 * @member {Number}
		 */
		this.column = typeof options.column == 'number' ? options.column : undefined;

		/**
		 * Row indexes to skip from the iteration.
		 *
		 * @readonly
		 * @member {Set<Number>}
		 * @private
		 */
		this._skipRows = new Set();

		/**
		 * The current row index.
		 *
		 * @readonly
		 * @member {Number}
		 * @private
		 */
		this._row = 0;

		/**
		 * The current column index.
		 *
		 * @readonly
		 * @member {Number}
		 * @private
		 */
		this._column = 0;

		/**
		 * The cell index in a parent row. For spanned cells when {@link #includeSpanned} is set to `true`,
		 * this represents the index of the next table cell.
		 *
		 * @readonly
		 * @member {Number}
		 * @private
		 */
		this._cellIndex = 0;

		/**
		 * Holds a map of spanned cells in a table.
		 *
		 * @readonly
		 * @member {Map<Number, Map.<Number, module:engine/model/element~Element>>}
		 * @private
		 */
		this._spannedCells = new Map();

		this._nextCellAtColumn = -1;
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
	 * @returns {module:table/tablewalker~TableWalkerValue} The next table walker's value.
	 */
	next() {
		const row = this.table.getChild( this._row );

		// Iterator is done when there's no row (table ended) or the row is after `endRow` limit.
		if ( !row || this._isOverEndRow() ) {
			return { done: true };
		}

		let cell, skipCurrentValue, outValue;

		if ( this._isSpanned( this._row, this._column ) ) {
			cell = this._getSpanned( this._row, this._column );

			skipCurrentValue = !this.includeSpanned || this._shouldSkipRow() || this._shouldSkipColumn();
			outValue = this._formatOutValue( cell, this._column, true );
		} else {
			cell = row.getChild( this._cellIndex );

			if ( !cell ) {
				// If there are no more cells left in row advance to the next row.
				this._row++;
				this._column = 0;
				this._cellIndex = 0;
				this._nextCellAtColumn = -1;

				return this.next();
			}

			const colspan = parseInt( cell.getAttribute( 'colspan' ) || 1 );
			const rowspan = parseInt( cell.getAttribute( 'rowspan' ) || 1 );

			// Record this cell spans if it's not 1x1 cell.
			if ( colspan > 1 || rowspan > 1 ) {
				this._recordSpans( this._row, this._column, rowspan, colspan, cell );
			}

			this._nextCellAtColumn = this._column + colspan;

			skipCurrentValue = this._shouldSkipRow() || this._shouldSkipColumn();
			outValue = this._formatOutValue( cell, this._column, false, rowspan, colspan );
		}

		// Advance to the next column before returning value.
		this._column++;

		if ( this._column == this._nextCellAtColumn ) {
			this._cellIndex++;
		}

		// The current value will be returned only if current row and column are not skipped.
		return skipCurrentValue ? this.next() : outValue;
	}

	/**
	 * Marks a row to skip in the next iteration. It will also skip cells from the current row if there are any cells from the current row
	 * to output.
	 *
	 * @param {Number} row The row index to skip.
	 */
	skipRow( row ) {
		this._skipRows.add( row );
	}

	/**
	 * Checks if the current row is over {@link #endRow}.
	 *
	 * @private
	 * @returns {Boolean}
	 */
	_isOverEndRow() {
		// If {@link #endRow) is defined skip all rows above it.
		return this.endRow !== undefined && this._row > this.endRow;
	}

	/**
	 * A common method for formatting the iterator's output value.
	 *
	 * @private
	 * @param {module:engine/model/element~Element} cell The table cell to output.
	 * @param {Number} column The column index (use the cached value).
	 * @param {Boolean} isSpanned Whether the value is returned for a spanned cell location or an actual cell.
	 * @param {Number} rowspan The rowspan of the current cell.
	 * @param {Number} colspan The colspan of the current cell.
	 * @returns {{done: Boolean, value: {cell: *, row: Number, column: *, rowspan: *, colspan: *, cellIndex: Number}}}
	 */
	_formatOutValue( cell, column, isSpanned, rowspan = 1, colspan = 1 ) {
		return {
			done: false,
			value: {
				cell,
				row: this._row,
				column,
				isSpanned,
				rowspan,
				colspan,
				cellIndex: this._cellIndex
			}
		};
	}

	/**
	 * Checks if the current row should be skipped.
	 *
	 * @private
	 * @returns {Boolean}
	 */
	_shouldSkipRow() {
		const rowIsBelowStartRow = this._row < this.startRow;
		const rowIsMarkedAsSkipped = this._skipRows.has( this._row );

		return rowIsBelowStartRow || rowIsMarkedAsSkipped;
	}

	/**
	 * Checks if the current column should be skipped.
	 *
	 * @private
	 * @returns {Boolean}
	 */
	_shouldSkipColumn() {
		if ( this.column === undefined ) {
			// The {@link #column} is not defined so output all columns.
			return false;
		}

		return this.column != this._column;
	}

	/**
	 * Checks if the current cell location (row x column) is spanned by another cell.
	 *
	 * @private
	 * @param {Number} row The row index of a cell location to check.
	 * @param {Number} column The column index of a cell location to check.
	 * @returns {Boolean}
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
	 * Returns the cell element that is spanned over the `row` x `column` location.
	 *
	 * @private
	 * @param {Number} row The row index of the cell location.
	 * @param {Number} column The column index of the cell location.
	 * @returns {module:engine/model/element~Element}
	 */
	_getSpanned( row, column ) {
		return this._spannedCells.get( row ).get( column );
	}

	/**
	 * Updates spanned cells map relative to the current cell location and its span dimensions.
	 *
	 * @private
	 * @param {Number} row The row index of a cell.
	 * @param {Number} column The column index of a cell.
	 * @param {Number} rowspan Cell height.
	 * @param {Number} colspan Cell width.
	 * @param {module:engine/model/element~Element} cell A cell that is spanned.
	 */
	_recordSpans( row, column, rowspan, colspan, cell ) {
		// This will update all cell locations after current column - ie a cell has colspan set.
		for ( let columnToUpdate = column + 1; columnToUpdate <= column + colspan - 1; columnToUpdate++ ) {
			this._markSpannedCell( row, columnToUpdate, cell );
		}

		// This will update all rows below current up to row's height.
		for ( let rowToUpdate = row + 1; rowToUpdate < row + rowspan; rowToUpdate++ ) {
			for ( let columnToUpdate = column; columnToUpdate <= column + colspan - 1; columnToUpdate++ ) {
				this._markSpannedCell( rowToUpdate, columnToUpdate, cell );
			}
		}
	}

	/**
	 * Marks the cell location as spanned by another cell.
	 *
	 * @private
	 * @param {Number} row The row index of the cell location.
	 * @param {Number} column The column index of the cell location.
	 * @param {module:engine/model/element~Element} cell A cell that is spanned.
	 */
	_markSpannedCell( row, column, cell ) {
		if ( !this._spannedCells.has( row ) ) {
			this._spannedCells.set( row, new Map() );
		}

		const rowSpans = this._spannedCells.get( row );

		rowSpans.set( column, cell );
	}
}

/**
 * An object returned by {@link module:table/tablewalker~TableWalker} when traversing table cells.
 *
 * @typedef {Object} module:table/tablewalker~TableWalkerValue
 * @property {module:engine/model/element~Element} cell The current table cell.
 * @property {Number} row The row index of a cell.
 * @property {Number} column The column index of a cell. Column index is adjusted to widths and heights of previous cells.
 * @param {Boolean} isSpanned Whether the value is returned for a spanned cell location or an actual cell.
 * @property {Number} colspan The `colspan` attribute of a cell. If the model attribute is not present, it is set to `1`. For spanned
 * table locations, it is set to `1`.
 * @property {Number} rowspan The `rowspan` attribute of a cell. If the model attribute is not present, it is set to `1`. For spanned
 * table locations, it is set to `1`.
 * @property {Number} cellIndex The index of the current cell in the parent row.
 */
