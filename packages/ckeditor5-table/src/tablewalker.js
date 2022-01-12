/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablewalker
 */

// @if CK_DEBUG // import { CKEditorError } from 'ckeditor5/src/utils';

/**
 * The table iterator class. It allows to iterate over table cells. For each cell the iterator yields
 * {@link module:table/tablewalker~TableSlot} with proper table cell attributes.
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
	 * See {@link module:table/tablewalker~TableSlot} what values are returned by the table walker.
	 *
	 * To iterate over a given row:
	 *
	 *		const tableWalker = new TableWalker( table, { startRow: 1, endRow: 2 } );
	 *
	 *		for ( const tableSlot of tableWalker ) {
	 *			console.log( 'A cell at row', tableSlot.row, 'and column', tableSlot.column );
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
	 *		for ( const tableSlot of tableWalker ) {
	 *			console.log( 'Slot at', tableSlot.row, 'x', tableSlot.column, ':', tableSlot.isAnchor ? 'is anchored' : 'is spanned' );
	 *		}
	 *
	 * will log in the console for the table from the previous example:
	 *
	 *		'Cell at 1 x 0 : is spanned'
	 *		'Cell at 1 x 1 : is spanned'
	 *		'Cell at 1 x 2 : is anchored'
	 *		'Cell at 1 x 3 : is spanned'
	 *		'Cell at 1 x 4 : is anchored'
	 *		'Cell at 1 x 5 : is anchored'
	 *
	 * **Note**: Option `row` is a shortcut that sets both `startRow` and `endRow` to the same row.
	 * (Use either `row` or `startRow` and `endRow` but never together). Similarly the `column` option sets both `startColumn`
	 * and `endColumn` to the same column (Use either `column` or `startColumn` and `endColumn` but never together).
	 *
	 * @constructor
	 * @param {module:engine/model/element~Element} table A table over which the walker iterates.
	 * @param {Object} [options={}] An object with configuration.
	 * @param {Number} [options.row] A row index for which this iterator will output cells.
	 * Can't be used together with `startRow` and `endRow`.
	 * @param {Number} [options.startRow=0] A row index from which this iterator should start. Can't be used together with `row`.
	 * @param {Number} [options.endRow] A row index at which this iterator should end. Can't be used together with `row`.
	 * @param {Number} [options.column] A column index for which this iterator will output cells.
	 * Can't be used together with `startColumn` and `endColumn`.
	 * @param {Number} [options.startColumn=0] A column index from which this iterator should start. Can't be used together with `column`.
	 * @param {Number} [options.endColumn] A column index at which this iterator should end. Can't be used together with `column`.
	 * @param {Boolean} [options.includeAllSlots=false] Also return values for spanned cells.
	 */
	constructor( table, options = {} ) {
		/**
		 * The walker's table element.
		 *
		 * @readonly
		 * @member {module:engine/model/element~Element}
		 * @protected
		 */
		this._table = table;

		/**
		 * A row index from which this iterator will start.
		 *
		 * @readonly
		 * @member {Number}
		 * @private
		 */
		this._startRow = options.row !== undefined ? options.row : options.startRow || 0;

		/**
		 * A row index at which this iterator will end.
		 *
		 * @readonly
		 * @member {Number}
		 * @private
		 */
		this._endRow = options.row !== undefined ? options.row : options.endRow;

		/**
		 * If set, the table walker will only output cells from a given column and following ones or cells that overlap them.
		 *
		 * @readonly
		 * @member {Number}
		 * @private
		 */
		this._startColumn = options.column !== undefined ? options.column : options.startColumn || 0;

		/**
		 * If set, the table walker will only output cells up to a given column.
		 *
		 * @readonly
		 * @member {Number}
		 * @private
		 */
		this._endColumn = options.column !== undefined ? options.column : options.endColumn;

		/**
		 * Enables output of spanned cells that are normally not yielded.
		 *
		 * @readonly
		 * @member {Boolean}
		 * @private
		 */
		this._includeAllSlots = !!options.includeAllSlots;

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
		 * @member {Number}
		 * @protected
		 */
		this._row = 0;

		/**
		 * The index of the current row element in the table.
		 *
		 * @type {Number}
		 * @protected
		 */
		this._rowIndex = 0;

		/**
		 * The current column index.
		 *
		 * @member {Number}
		 * @protected
		 */
		this._column = 0;

		/**
		 * The cell index in a parent row. For spanned cells when {@link #_includeAllSlots} is set to `true`,
		 * this represents the index of the next table cell.
		 *
		 * @member {Number}
		 * @protected
		 */
		this._cellIndex = 0;

		/**
		 * Holds a map of spanned cells in a table.
		 *
		 * @readonly
		 * @member {Map.<Number, Map.<Number, Object>>}
		 * @private
		 */
		this._spannedCells = new Map();

		/**
		 * Index of the next column where a cell is anchored.
		 *
		 * @member {Number}
		 * @private
		 */
		this._nextCellAtColumn = -1;
	}

	/**
	 * Iterable interface.
	 *
	 * @returns {Iterable.<module:table/tablewalker~TableSlot>}
	 */
	[ Symbol.iterator ]() {
		return this;
	}

	/**
	 * Gets the next table walker's value.
	 *
	 * @returns {module:table/tablewalker~TableSlot} The next table walker's value.
	 */
	next() {
		const row = this._table.getChild( this._rowIndex );

		// Iterator is done when there's no row (table ended) or the row is after `endRow` limit.
		if ( !row || this._isOverEndRow() ) {
			return { done: true };
		}

		// We step over current element when it is not a tableRow instance.
		if ( !row.is( 'element', 'tableRow' ) ) {
			this._rowIndex++;

			return this.next();
		}

		if ( this._isOverEndColumn() ) {
			return this._advanceToNextRow();
		}

		let outValue = null;

		const spanData = this._getSpanned();

		if ( spanData ) {
			if ( this._includeAllSlots && !this._shouldSkipSlot() ) {
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
	 * Advances internal cursor to the next row.
	 *
	 * @private
	 * @returns {module:table/tablewalker~TableSlot}
	 */
	_advanceToNextRow() {
		this._row++;
		this._rowIndex++;
		this._column = 0;
		this._cellIndex = 0;
		this._nextCellAtColumn = -1;

		return this.next();
	}

	/**
	 * Checks if the current row is over {@link #_endRow}.
	 *
	 * @private
	 * @returns {Boolean}
	 */
	_isOverEndRow() {
		// If #_endRow is defined skip all rows after it.
		return this._endRow !== undefined && this._row > this._endRow;
	}

	/**
	 * Checks if the current cell is over {@link #_endColumn}
	 *
	 * @private
	 * @returns {Boolean}
	 */
	_isOverEndColumn() {
		// If #_endColumn is defined skip all cells after it.
		return this._endColumn !== undefined && this._column > this._endColumn;
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
			value: new TableSlot( this, cell, anchorRow, anchorColumn )
		};
	}

	/**
	 * Checks if the current slot should be skipped.
	 *
	 * @private
	 * @returns {Boolean}
	 */
	_shouldSkipSlot() {
		const rowIsMarkedAsSkipped = this._skipRows.has( this._row );
		const rowIsBeforeStartRow = this._row < this._startRow;

		const columnIsBeforeStartColumn = this._column < this._startColumn;
		const columnIsAfterEndColumn = this._endColumn !== undefined && this._column > this._endColumn;

		return rowIsMarkedAsSkipped || rowIsBeforeStartRow || columnIsBeforeStartColumn || columnIsAfterEndColumn;
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
	 * @param {Object} data A spanned cell details (cell element, anchor row and column).
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
class TableSlot {
	/**
	 * Creates an instance of the table walker value.
	 *
	 * @protected
	 * @param {module:table/tablewalker~TableWalker} tableWalker The table walker instance.
	 * @param {module:engine/model/element~Element} cell The current table cell.
	 * @param {Number} anchorRow The row index of a cell anchor slot.
	 * @param {Number} anchorColumn The column index of a cell anchor slot.
	 */
	constructor( tableWalker, cell, anchorRow, anchorColumn ) {
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
		this.row = tableWalker._row;

		/**
		 * The column index of a table slot.
		 *
		 * @readonly
		 * @member {Number}
		 */
		this.column = tableWalker._column;

		/**
		 * The row index of a cell anchor slot.
		 *
		 * @readonly
		 * @member {Number}
		 */
		this.cellAnchorRow = anchorRow;

		/**
		 * The column index of a cell anchor slot.
		 *
		 * @readonly
		 * @member {Number}
		 */
		this.cellAnchorColumn = anchorColumn;

		/**
		 * The index of the current cell in the parent row.
		 *
		 * @readonly
		 * @member {Number}
		 * @private
		 */
		this._cellIndex = tableWalker._cellIndex;

		/**
		 * The index of the current row element in the table.
		 *
		 * @readonly
		 * @member {Number}
		 * @private
		 */
		this._rowIndex = tableWalker._rowIndex;

		/**
		 * The table element.
		 *
		 * @readonly
		 * @member {module:engine/model/element~Element}
		 * @private
		 */
		this._table = tableWalker._table;
	}

	/**
	 * Whether the cell is anchored in the current slot.
	 *
	 * @readonly
	 * @returns {Boolean}
	 */
	get isAnchor() {
		return this.row === this.cellAnchorRow && this.column === this.cellAnchorColumn;
	}

	/**
	 * The width of a cell defined by a `colspan` attribute. If the model attribute is not present, it is set to `1`.
	 *
	 * @readonly
	 * @returns {Number}
	 */
	get cellWidth() {
		return parseInt( this.cell.getAttribute( 'colspan' ) || 1 );
	}

	/**
	 * The height of a cell defined by a `rowspan` attribute. If the model attribute is not present, it is set to `1`.
	 *
	 * @readonly
	 * @returns {Number}
	 */
	get cellHeight() {
		return parseInt( this.cell.getAttribute( 'rowspan' ) || 1 );
	}

	/**
	 * The index of the current row element in the table.
	 *
	 * @readonly
	 * @returns {Number}
	 */
	get rowIndex() {
		return this._rowIndex;
	}

	/**
	 * Returns the {@link module:engine/model/position~Position} before the table slot.
	 *
	 * @returns {module:engine/model/position~Position}
	 */
	getPositionBefore() {
		const model = this._table.root.document.model;

		return model.createPositionAt( this._table.getChild( this.row ), this._cellIndex );
	}

	// @if CK_DEBUG // get isSpanned() { throwMissingGetterError( 'isSpanned' ); }
	// @if CK_DEBUG // get colspan() { throwMissingGetterError( 'colspan' ); }
	// @if CK_DEBUG // get rowspan() { throwMissingGetterError( 'rowspan' ); }
	// @if CK_DEBUG // get cellIndex() { throwMissingGetterError( 'cellIndex' ); }
}

/**
 * This `TableSlot`'s getter (property) was removed in CKEditor 5 v20.0.0.
 *
 * Check out the new `TableWalker`'s API in the documentation.
 *
 * @error tableslot-getter-removed
 * @param {String} getterName
 */

// @if CK_DEBUG // function throwMissingGetterError( getterName ) {
// @if CK_DEBUG //		throw new CKEditorError( 'tableslot-getter-removed', this, {
// @if CK_DEBUG //			getterName
// @if CK_DEBUG //		} );
// @if CK_DEBUG // }
