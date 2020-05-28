/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablewalker
 */

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

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
	 * pass the `includeAllSlots` option to the constructor.
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
	 *		const tableWalker = new TableWalker( table, { row: 1, includeAllSlots: true } );
	 *
	 *		for ( const value of tableWalker ) {
	 *			console.log( 'Cell at ' + value.row + ' x ' + value.column + ' : ' + ( !value.isAnchor ? 'is spanned' : 'has data' ) );
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
	 * @param {Boolean} [options.includeAllSlots=false] Also return values for spanned cells.
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
		 * If set, the table walker will only output cells of a given row or cells that overlap it.
		 *
		 * @readonly
		 * @member {Number}
		 */
		this.row = typeof options.row == 'number' ? options.row : undefined;

		/**
		 * Enables output of spanned cells that are normally not yielded.
		 *
		 * @readonly
		 * @member {Boolean}
		 */
		this.includeAllSlots = !!options.includeAllSlots;

		/**
		 * If set, the table walker will only output cells from a given column and following ones or cells that overlap them.
		 *
		 * @readonly
		 * @member {Number}
		 */
		this.startColumn = typeof options.startColumn == 'number' ? options.startColumn : undefined;

		/**
		 * If set, the table walker will only output cells up to a given column.
		 *
		 * @readonly
		 * @member {Number}
		 */
		this.endColumn = typeof options.endColumn == 'number' ? options.endColumn : undefined;

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
		 * The cell index in a parent row. For spanned cells when {@link #includeAllSlots} is set to `true`,
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
		 * TODO this will hold more data about the cell
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

	set row( value ) {
		if ( typeof value == 'number' ) {
			this.startRow = this.endRow = value;
		}
	}

	get row() {
		if ( this.startRow === this.endRow ) {
			return this.startRow;
		}

		throw new CKEditorError( 'improper-api-usage', this );
	}

	set column( value ) {
		if ( typeof value == 'number' ) {
			this.startColumn = this.endColumn = value;
		}
	}

	get column() {
		if ( this.startColumn === this.endColumn ) {
			return this.startColumn;
		}

		throw new CKEditorError( 'improper-api-usage', this );
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

		if ( this._isOverEndColumn() ) {
			return this._advanceToNextRow();
		}

		let outValue = null;

		const spanData = this._getSpanned();

		if ( spanData ) {
			if ( this.includeAllSlots && !this._shouldSkipSlot() ) {
				outValue = this._formatOutValue( spanData.cell, spanData.row, spanData.column );
			}
		} else {
			const cell = row.getChild( this._cellIndex );

			if ( !cell ) {
				// If there are no more cells left in row advance to the next row.
				return this._advanceToNextRow();
			}

			const colspan = parseInt( cell.getAttribute( 'colspan' ) || 1 );
			const rowspan = parseInt( cell.getAttribute( 'rowspan' ) || 1 );

			// Record this cell spans if it's not 1x1 cell.
			if ( colspan > 1 || rowspan > 1 ) {
				this._recordSpans( cell, rowspan, colspan );
			}

			if ( !this._shouldSkipSlot() ) {
				outValue = this._formatOutValue( cell );
			}

			this._nextCellAtColumn = this._column + colspan;
		}

		// Advance to the next column before returning value.
		this._column++;

		if ( this._column == this._nextCellAtColumn ) {
			this._cellIndex++;
		}

		// The current value will be returned only if current row and column are not skipped.
		return outValue || this.next();
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
		// If #endRow is defined skip all rows after it.
		return this.endRow !== undefined && this._row > this.endRow;
	}

	// TODO docs
	_isOverEndColumn() {
		// If #endColumn is defined skip all cells after it.
		return this.endColumn !== undefined && this._column > this.endColumn;
	}

	/**
	 * TODO docs
	 *
	 * @private
	 * @returns {module:table/tablewalker~TableWalkerValue}
	 */
	_advanceToNextRow() {
		this._row++;
		this._column = 0;
		this._cellIndex = 0;
		this._nextCellAtColumn = -1;

		return this.next();
	}

	/**
	 * A common method for formatting the iterator's output value.
	 *
	 * @private
	 * @param {module:engine/model/element~Element} cell The table cell to output.
	 * @param {Number} [anchorRow] The row index of a cell anchor slot.
	 * @param {Number} [anchorColumn] The column index of a cell anchor slot.
	 * @returns {{done: Boolean, value: {cell: *, row: Number, column: *, rowspan: *, colspan: *, cellIndex: Number}}}
	 */
	_formatOutValue( cell, anchorRow = this._row, anchorColumn = this._column ) {
		return {
			done: false,
			value: new TableWalkerValue( cell, {
				row: this._row,
				column: this._column,
				anchorRow,
				anchorColumn,
				cellIndex: this._cellIndex
			} )
		};
	}

	/**
	 * Checks if the current slot should be skipped.
	 *
	 * @private
	 * @returns {Boolean}
	 */
	_shouldSkipSlot() {
		const rowIsBelowStartRow = this._row < this.startRow;
		const rowIsMarkedAsSkipped = this._skipRows.has( this._row );

		const columnIsBeforeStartColumn = this.startColumn !== undefined && this._column < this.startColumn;
		const columnIsAfterEndColumn = this.endColumn !== undefined && this._column > this.endColumn;

		return rowIsBelowStartRow || rowIsMarkedAsSkipped || columnIsBeforeStartColumn || columnIsAfterEndColumn;
	}

	/**
	 * Returns the cell element that is spanned over the current cell location.
	 *
	 * @private
	 * @returns {module:engine/model/element~Element}
	 */
	_getSpanned() {
		const rowMap = this._spannedCells.get( this._row );

		// No spans for given row.
		if ( !rowMap ) {
			return null;
		}

		// If spans for given rows has entry for column it means that this location if spanned by other cell.
		return rowMap.get( this._column ) || null;
	}

	/**
	 * Updates spanned cells map relative to the current cell location and its span dimensions.
	 *
	 * @private
	 * @param {module:engine/model/element~Element} cell A cell that is spanned.
	 * @param {Number} rowspan Cell height.
	 * @param {Number} colspan Cell width.
	 */
	_recordSpans( cell, rowspan, colspan ) {
		const data = {
			cell,
			row: this._row,
			column: this._column
		};

		for ( let rowToUpdate = this._row; rowToUpdate < this._row + rowspan; rowToUpdate++ ) {
			for ( let columnToUpdate = this._column; columnToUpdate < this._column + colspan; columnToUpdate++ ) {
				if ( rowToUpdate != this._row || columnToUpdate != this._column ) {
					this._markSpannedCell( rowToUpdate, columnToUpdate, data );
				}
			}
		}
	}

	/**
	 * Marks the cell location as spanned by another cell.
	 *
	 * @private
	 * @param {Number} row The row index of the cell location.
	 * @param {Number} column The column index of the cell location.
	 * @param {module:engine/model/element~Element} data A cell that is spanned. // TODO update docs
	 */
	_markSpannedCell( row, column, data ) {
		if ( !this._spannedCells.has( row ) ) {
			this._spannedCells.set( row, new Map() );
		}

		const rowSpans = this._spannedCells.get( row );

		rowSpans.set( column, data );
	}
}

/**
 * An object returned by {@link module:table/tablewalker~TableWalker} when traversing table cells.
 */
class TableWalkerValue {
	/**
	 * Creates an instance of the table walker value.
	 *
	 * @param {module:engine/model/element~Element} cell The current table cell.
	 * @param {Object} data
	 * @param {Number} data.row The row index of a table slot.
	 * @param {Number} data.column The column index of a table slot.
	 * @param {Number} data.anchorRow The row index of a cell anchor slot.
	 * @param {Number} data.anchorColumn The column index of a cell anchor slot.
	 * @param {Number} data.cellIndex The index of the current cell in the parent row.
	 */
	constructor( cell, data ) {
		/**
		 * The current table cell.
		 *
		 * @readonly
		 * @member {module:engine/model/element~Element}
		 */
		this.cell = cell;

		/**
		 * The row index of a table slot.
		 *
		 * @readonly
		 * @member {Number}
		 */
		this.row = data.row;

		/**
		 * The column index of a table slot.
		 *
		 * @readonly
		 * @member {Number}
		 */
		this.column = data.column;

		/**
		 * The row index of a cell anchor slot.
		 *
		 * @readonly
		 * @member {Number}
		 */
		this.cellAnchorRow = data.anchorRow;

		/**
		 * The column index of a cell anchor slot.
		 *
		 * @readonly
		 * @member {Number}
		 */
		this.cellAnchorColumn = data.anchorColumn;

		/**
		 * The index of the current cell in the parent row.
		 *
		 * @readonly
		 * @member {Number}
		 */
		this.cellIndex = data.cellIndex;
	}

	/**
	 * Whether the cell is anchored in the current slot.
	 *
	 * @returns {Boolean}
	 */
	get isAnchor() {
		return this.row === this.cellAnchorRow && this.column === this.cellAnchorColumn;
	}

	/**
	 * The `colspan` attribute of a cell. If the model attribute is not present, it is set to `1`.
	 *
	 * @returns {Number}
	 */
	get cellWidth() {
		return parseInt( this.cell.getAttribute( 'colspan' ) || 1 );
	}

	/**
	 * The `rowspan` attribute of a cell. If the model attribute is not present, it is set to `1`.
	 *
	 * @returns {Number}
	 */
	get cellHeight() {
		return parseInt( this.cell.getAttribute( 'rowspan' ) || 1 );
	}

	get isSpanned() {
		throw new CKEditorError( 'improper-api-usage', this );
	}

	get colspan() {
		throw new CKEditorError( 'improper-api-usage', this );
	}

	get rowspan() {
		throw new CKEditorError( 'improper-api-usage', this );
	}
}
