/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/converters/downcasttable
 */

import Position from '@ckeditor/ckeditor5-engine/src/view/position';

export default function downcastTable() {
	return dispatcher => dispatcher.on( 'insert:table', ( evt, data, conversionApi ) => {
		const table = data.item;

		if ( !conversionApi.consumable.consume( table, 'insert' ) ) {
			return;
		}

		let tHead, tBody;

		const tableElement = conversionApi.writer.createContainerElement( 'table' );
		const headingRowsCount = parseInt( table.getAttribute( 'headingRows' ) ) || 0;
		const tableRows = Array.from( table.getChildren() );
		const cellSpans = new CellSpans();

		for ( const row of tableRows ) {
			const rowIndex = tableRows.indexOf( row );
			const parent = getParent( rowIndex, headingRowsCount, tableElement, conversionApi );

			_downcastTableRow( row, rowIndex, cellSpans, parent, conversionApi );

			// Drop table cell spans information for downcasted row.
			cellSpans.drop( rowIndex );
		}

		const viewPosition = conversionApi.mapper.toViewPosition( data.range.start );

		conversionApi.mapper.bindElements( table, tableElement );
		conversionApi.writer.insert( viewPosition, tableElement );

		// Creates if not existing and returns <tbody> or <thead> element for given rowIndex.
		function getParent( rowIndex, headingRowsCount, tableElement, conversionApi ) {
			if ( headingRowsCount && rowIndex < headingRowsCount ) {
				if ( !tHead ) {
					tHead = _createTableSection( 'thead', tableElement, conversionApi );
				}

				return tHead;
			}

			if ( !tBody ) {
				tBody = _createTableSection( 'tbody', tableElement, conversionApi );
			}

			return tBody;
		}
	}, { priority: 'normal' } );
}

function _downcastTableRow( tableRow, rowIndex, cellSpans, parent, conversionApi ) {
	// Will always consume since we're converting <tableRow> element from a parent <table>.
	conversionApi.consumable.consume( tableRow, 'insert' );
	const trElement = conversionApi.writer.createContainerElement( 'tr' );

	conversionApi.mapper.bindElements( tableRow, trElement );
	conversionApi.writer.insert( Position.createAt( parent, 'end' ), trElement );

	let cellIndex = 0;

	const headingColumns = tableRow.parent.getAttribute( 'headingColumns' ) || 0;

	for ( const tableCell of Array.from( tableRow.getChildren() ) ) {
		cellIndex = cellSpans.getColumnWithSpan( rowIndex, cellIndex );

		const cellWidth = tableCell.hasAttribute( 'colspan' ) ? parseInt( tableCell.getAttribute( 'colspan' ) ) : 1;
		const cellHeight = tableCell.hasAttribute( 'rowspan' ) ? parseInt( tableCell.getAttribute( 'rowspan' ) ) : 1;

		cellSpans.updateSpans( rowIndex, cellIndex, cellHeight, cellWidth );

		// Will always consume since we're converting <tableRow> element from a parent <table>.
		conversionApi.consumable.consume( tableCell, 'insert' );

		const isHead = _isHead( tableCell, rowIndex, cellIndex, headingColumns );
		const cellElement = conversionApi.writer.createContainerElement( isHead ? 'th' : 'td' );

		conversionApi.mapper.bindElements( tableCell, cellElement );
		conversionApi.writer.insert( Position.createAt( trElement, 'end' ), cellElement );

		cellIndex += cellWidth;
	}
}

function _createTableSection( elementName, tableElement, conversionApi ) {
	const tableChildElement = conversionApi.writer.createContainerElement( elementName );

	conversionApi.writer.insert( Position.createAt( tableElement, 'end' ), tableChildElement );

	return tableChildElement;
}

function _isHead( tableCell, rowIndex, cellIndex, columnHeadings ) {
	const row = tableCell.parent;
	const table = row.parent;
	const headingRows = table.getAttribute( 'headingRows' ) || 0;

	return ( !!headingRows && headingRows > rowIndex ) || ( !!columnHeadings && columnHeadings > cellIndex );
}

/**
 * Holds information about spanned table cells.
 *
 * @private
 */
class CellSpans {
	/**
	 * Creates CellSpans instance.
	 */
	constructor() {
		/**
		 * Holds table cell spans mapping.
		 *
		 * @type {Map<Number, Number>}
		 * @private
		 */
		this._spans = new Map();
	}

	/**
	 * Returns proper column index if current cell have span.
	 *
	 * @param {Number} row
	 * @param {Number} column
	 * @return {Number} Returns current column or updated column index.
	 */
	getColumnWithSpan( row, column ) {
		let span = this._check( row, column ) || 0;

		// Offset current table cell columnIndex by spanning cells from rows above.
		while ( span ) {
			column += span;
			span = this._check( row, column );
		}

		return column;
	}

	/**
	 * Updates spans based on current table cell height & width.
	 *
	 * For instance if a table cell at row 0 and column 0 has height of 3 and width of 2 we're setting spans:
	 *
	 *        0 1 2
	 *     0:
	 *     1: 2
	 *     2: 2
	 *     3:
	 *
	 * Adding another spans for a table cell at row 2 and column 1 that has height of 2 and width of 4 will update above to:
	 *
	 *        0 1 2
	 *     0:
	 *     1: 2
	 *     2: 2
	 *     3:   4
	 *
	 * @param {Number} row
	 * @param {Number} column
	 * @param {Number} height
	 * @param {Number} width
	 */
	updateSpans( row, column, height, width ) {
		// Omit horizontal spans as those are handled during current row conversion.

		// This will update all rows below up to row height with value of span width.
		for ( let nextRow = row + 1; nextRow < row + height; nextRow++ ) {
			if ( !this._spans.has( nextRow ) ) {
				this._spans.set( nextRow, new Map() );
			}

			const rowSpans = this._spans.get( nextRow );

			rowSpans.set( column, width );
		}
	}

	/**
	 * Drops already downcasted row.
	 *
	 * @param {Number} row
	 */
	drop( row ) {
		if ( this._spans.has( row ) ) {
			this._spans.delete( row );
		}
	}

	/**
	 * Checks if given table cell is spanned by other.
	 *
	 * @param {Number} row
	 * @param {Number} column
	 * @return {Boolean|Number} Returns false or width of a span.
	 * @private
	 */
	_check( row, column ) {
		if ( !this._spans.has( row ) ) {
			return false;
		}

		const rowSpans = this._spans.get( row );

		return rowSpans.has( column ) ? rowSpans.get( column ) : false;
	}
}
