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
	 * Creates a range iterator. All parameters are optional, but you have to specify either `boundaries` or `startPosition`.
	 *
	 * The most important values of iterator values are column & row of a cell.
	 *
	 * To iterate over given row:
	 *
	 *		const tableWalker = new TableWalker( table, { startRow: 1, endRow: 2 } );
	 *
	 *		for( const cellInfo of tableWalker ) {
	 *			console.log( 'A cell at row ' + cellInfo.row + ' and column ' + cellInfo.column );
	 *		}
	 *
	 * For instance the above code for a table:
	 *
	 *		+----+----+----+----+----+----+
	 *		| 00      | 02 | 03      | 05 |
	 *		|         +--- +----+----+----+
	 *		|         | 12      | 14 | 15 |
	 *		|         +----+----+----+----+
	 *		|         | 22                |
	 *		|----+----+                   +
	 *		| 31 | 32 |                   |
	 *		+----+----+----+----+----+----+
	 *
	 *	will log in the console:
	 *
	 *		'A cell at row 1 and column 2'
	 *		'A cell at row 1 and column 4'
	 *		'A cell at row 1 and column 5'
	 *		'A cell at row 2 and column 2'
	 *
	 *	To iterate over spanned cells also:
	 *
	 *		const tableWalker = new TableWalker( table, { startRow: 1, endRow: 1 } );
	 *
	 *		for( const cellInfo of tableWalker ) {
	 *			console.log( 'Cell at ' + cellInfo.row + ' x ' + cellInfo.column + ' : ' + ( cellInfo.cell ? 'has data' : 'is spanned' )  );
	 *		}
	 *
	 *	will log in the console for the table from previous example:
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
	 * @param {Number} [options.startRow=0] A row index for which this iterator should start.
	 * @param {Number} [options.endRow] A row index for which this iterator should end.
	 * @param {Number} [options.includeSpanned] Also return values for spanned cells.
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
		 * @type {Boolean}
		 */
		this.includeSpanned = !!options.includeSpanned;

		/**
		 * A current row index.
		 *
		 * @readonly
		 * @member {Number}
		 */
		this.row = 0;

		/**
		 * A current cell index in a row.
		 *
		 * @readonly
		 * @member {Number}
		 */
		this.cell = 0;

		/**
		 * A current column index.
		 *
		 * @readonly
		 * @member {Number}
		 */
		this.column = 0;

		/**
		 * The previous cell in a row.
		 *
		 * @readonly
		 * @member {module:engine/model/element~Element}
		 * @private
		 */
		this._previousCell = undefined;

		/**
		 * Holds information about spanned table cells.
		 *
		 * @readonly
		 * @member {CellSpans}
		 * @private
		 */
		this._cellSpans = new CellSpans();

		/**
		 * Holds spanned cells info to be outputed when {@link #includeSpanned} is set to true.
		 *
		 * @type {Array.<module:table/tablewalker~TableWalkerValue>}
		 * @private
		 */
		this._spannedCells = [];

		/**
		 * Cached table properties - returned for every yielded value.
		 *
		 * @readonly
		 * @member {{headingRows: Number, headingColumns: Number}}
		 * @private
		 */
		this._tableData = {
			headingRows: parseInt( this.table.getAttribute( 'headingRows' ) || 0 ),
			headingColumns: parseInt( this.table.getAttribute( 'headingColumns' ) || 0 )
		};
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
		const row = this.table.getChild( this.row );

		if ( !row || ( this.endRow !== undefined && this.row > this.endRow ) ) {
			return { done: true };
		}

		if ( this.includeSpanned && this._spannedCells.length ) {
			return { done: false, value: this._spannedCells.shift() };
		}

		// The previous cell is defined after the first cell in a row.
		if ( this._previousCell ) {
			const colspan = this._updateSpans();

			// Update the column index by a width of a previous cell.
			this.column += colspan;
		}

		const cell = row.getChild( this.cell );

		// If there is no cell then it's end of a row so update spans and reset indexes.
		if ( !cell ) {
			// Record spans of the previous cell.
			const colspan = this._updateSpans();

			if ( this.includeSpanned && colspan > 1 ) {
				for ( let i = this.column + 1; i < this.column + colspan; i++ ) {
					this._spannedCells.push( { row: this.row, column: this.column, table: this._tableData, colspan: 1, rowspan: 1 } );
				}
			}

			// Reset indexes and move to next row.
			this.cell = 0;
			this.column = 0;
			this.row++;
			this._previousCell = undefined;

			return this.next();
		}

		// Update the column index if the current column is overlapped by cells from previous rows that have rowspan attribute set.
		const beforeColumn = this.column;
		this.column = this._cellSpans.getAdjustedColumnIndex( this.row, beforeColumn );

		// return this.next()
		if ( this.includeSpanned && beforeColumn !== this.column ) {
			for ( let i = beforeColumn; i < this.column; i++ ) {
				this._spannedCells.push( { row: this.row, column: i, table: this._tableData, colspan: 1, rowspan: 1 } );
			}

			return this.next();
		}

		// Update the cell indexes before returning value.
		this._previousCell = cell;
		this.cell++;

		// Skip rows that are before startRow.
		if ( this.startRow > this.row ) {
			return this.next();
		}

		const colspan = parseInt( cell.getAttribute( 'colspan' ) || 1 );

		if ( this.includeSpanned && colspan > 1 ) {
			for ( let i = this.column + 1; i < this.column + colspan; i++ ) {
				this._spannedCells.push( { row: this.row, column: i, table: this._tableData, colspan: 1, rowspan: 1 } );
			}
		}

		return {
			done: false,
			value: {
				cell,
				row: this.row,
				column: this.column,
				rowspan: parseInt( cell.getAttribute( 'rowspan' ) || 1 ),
				colspan,
				table: this._tableData
			}
		};
	}

	/**
	 * Updates the cell spans of a previous cell.
	 *
	 * @returns {Number}
	 * @private
	 */
	_updateSpans() {
		const colspan = parseInt( this._previousCell.getAttribute( 'colspan' ) || 1 );
		const rowspan = parseInt( this._previousCell.getAttribute( 'rowspan' ) || 1 );

		this._cellSpans.recordSpans( this.row, this.column, rowspan, colspan );

		return colspan;
	}
}

// Holds information about spanned table cells.
class CellSpans {
	// Creates CellSpans instance.
	constructor() {
		// Holds table cell spans mapping.
		//
		// @member {Map<Number, Number>}
		// @private
		this._spans = new Map();
	}

	// Returns proper column index if a current cell index is overlapped by other (has a span defined).
	//
	// @param {Number} row
	// @param {Number} column
	// @return {Number} Returns current column or updated column index.
	getAdjustedColumnIndex( row, column ) {
		let span = this._check( row, column ) || 0;

		// Offset current table cell columnIndex by spanning cells from rows above.
		while ( span ) {
			column += span;
			span = this._check( row, column );
		}

		return column;
	}

	// Updates spans based on current table cell height & width. Spans with height <= 1 will not be recorded.
	//
	// For instance if a table cell at row 0 and column 0 has height of 3 and width of 2 we're setting spans:
	//
	//		   0 1 2 3 4 5
	//		0:
	//		1: 2
	//		2: 2
	//		3:
	//
	// Adding another spans for a table cell at row 2 and column 1 that has height of 2 and width of 4 will update above to:
	//
	//		   0 1 2 3 4 5
	//		0:
	//		1: 2
	//		2: 2
	//		3:   4
	//
	// The above span mapping was calculated from a table below (cells 03 & 12 were not added as their height is 1):
	//
	//		+----+----+----+----+----+----+
	//		| 00      | 02 | 03      | 05 |
	//		|         +--- +----+----+----+
	//		|         | 12      | 24 | 25 |
	//		|         +----+----+----+----+
	//		|         | 22                |
	//		|----+----+                   +
	//		| 31 | 32 |                   |
	//		+----+----+----+----+----+----+
	//
	// @param {Number} rowIndex
	// @param {Number} columnIndex
	// @param {Number} height
	// @param {Number} width
	recordSpans( rowIndex, columnIndex, height, width ) {
		// This will update all rows below up to row height with value of span width.
		for ( let rowToUpdate = rowIndex + 1; rowToUpdate < rowIndex + height; rowToUpdate++ ) {
			if ( !this._spans.has( rowToUpdate ) ) {
				this._spans.set( rowToUpdate, new Map() );
			}

			const rowSpans = this._spans.get( rowToUpdate );

			rowSpans.set( columnIndex, width );
		}
	}

	// Checks if given table cell is spanned by other.
	//
	// @param {Number} rowIndex
	// @param {Number} columnIndex
	// @return {Boolean|Number} Returns false or width of a span.
	_check( rowIndex, columnIndex ) {
		if ( !this._spans.has( rowIndex ) ) {
			return false;
		}

		const rowSpans = this._spans.get( rowIndex );

		return rowSpans.has( columnIndex ) ? rowSpans.get( columnIndex ) : false;
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
 * @property {Object} table Table attributes
 * @property {Object} table.headingRows The heading rows attribute of a table - always defined even if model attribute is not present.
 * @property {Object} table.headingColumns The heading columns attribute of a table - always defined even if model attribute is not present.
 */
