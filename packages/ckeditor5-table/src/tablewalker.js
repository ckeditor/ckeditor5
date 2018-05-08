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

		this._spans = new Map();
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

		if ( this._isSpanned( this.row, this.column ) ) {
			const outValue = {
				row: this.row,
				column: this.column,
				rowspan: 1,
				colspan: 1,
				cellIndex: this.cell,
				cell: undefined,
				table: this._tableData
			};

			this.column++;

			if ( !this.includeSpanned || this.startRow > this.row ) {
				return this.next();
			}

			return { done: false, value: outValue };
		}

		const cell = row.getChild( this.cell );

		if ( !cell ) {
			this.row++;
			this.column = 0;
			this.cell = 0;

			return this.next();
		}

		const colspan = parseInt( cell.getAttribute( 'colspan' ) || 1 );
		const rowspan = parseInt( cell.getAttribute( 'rowspan' ) || 1 );

		if ( colspan > 1 || rowspan > 1 ) {
			this._recordSpans( this.row, this.column, rowspan, colspan );
		}

		const outValue = {
			cell,
			row: this.row,
			column: this.column,
			rowspan,
			colspan,
			cellIndex: this.cell,
			table: this._tableData
		};

		this.column++;
		this.cell++;

		if ( this.startRow > this.row ) {
			return this.next();
		}

		return {
			done: false,
			value: outValue
		};
	}

	_isSpanned( row, column ) {
		if ( !this._spans.has( row ) ) {
			return false;
		}

		const rowSpans = this._spans.get( row );

		return rowSpans.has( column ) ? rowSpans.get( column ) : false;
	}

	_recordSpans( row, column, rowspan, colspan ) {
		// This will update all rows after columns
		for ( let columnToUpdate = column + 1; columnToUpdate <= column + colspan - 1; columnToUpdate++ ) {
			this._recordSpan( row, columnToUpdate );
		}

		// This will update all rows below up to row height with value of span width.
		for ( let rowToUpdate = row + 1; rowToUpdate < row + rowspan; rowToUpdate++ ) {
			for ( let columnToUpdate = column; columnToUpdate <= column + colspan - 1; columnToUpdate++ ) {
				this._recordSpan( rowToUpdate, columnToUpdate );
			}
		}
	}

	_recordSpan( row, column ) {
		if ( !this._spans.has( row ) ) {
			this._spans.set( row, new Map() );
		}

		const rowSpans = this._spans.get( row );

		rowSpans.set( column, 1 );
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
 * @property {Number} cellIndex The index of a current cell in parent row. When using `includeSpanned` option it will indicate next child
 * index if #cell is empty (spanned cell).
 * @property {Object} table Table attributes
 * @property {Object} table.headingRows The heading rows attribute of a table - always defined even if model attribute is not present.
 * @property {Object} table.headingColumns The heading columns attribute of a table - always defined even if model attribute is not present.
 */
