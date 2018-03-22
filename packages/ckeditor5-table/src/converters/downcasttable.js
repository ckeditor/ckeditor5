/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/converters/downcasttable
 */

import ViewPosition from '@ckeditor/ckeditor5-engine/src/view/position';

/**
 * Model table element to view table element conversion helper.
 *
 * This conversion helper creates whole table element with child elements.
 *
 * @returns {Function} Conversion helper.
 */
export default function downcastTable() {
	return dispatcher => dispatcher.on( 'insert:table', ( evt, data, conversionApi ) => {
		const table = data.item;

		if ( !conversionApi.consumable.consume( table, 'insert' ) ) {
			return;
		}

		// The <thead> and <tbody> elements are created on the fly when needed by inner `getTableSection()` function.
		let tHead, tBody;

		const tableElement = conversionApi.writer.createContainerElement( 'table' );
		const headingRows = parseInt( table.getAttribute( 'headingRows' ) ) || 0;
		const tableRows = Array.from( table.getChildren() );

		const cellSpans = ensureCellSpans( table, 0 );

		for ( const tableRow of tableRows ) {
			const rowIndex = tableRows.indexOf( tableRow );
			const tableSectionElement = getTableSection( rowIndex, headingRows, tableElement, conversionApi );

			downcastTableRow( tableRow, rowIndex, tableSectionElement, cellSpans, conversionApi );

			// Drop table cell spans information for downcasted row.
			cellSpans.drop( rowIndex );
		}

		const viewPosition = conversionApi.mapper.toViewPosition( data.range.start );

		conversionApi.mapper.bindElements( table, tableElement );
		conversionApi.writer.insert( viewPosition, tableElement );

		// Creates if not existing and returns <tbody> or <thead> element for given rowIndex.
		function getTableSection( rowIndex, headingRows, tableElement, conversionApi ) {
			if ( headingRows && rowIndex < headingRows ) {
				if ( !tHead ) {
					tHead = createTableSection( 'thead', tableElement, conversionApi );
				}

				return tHead;
			}

			if ( !tBody ) {
				tBody = createTableSection( 'tbody', tableElement, conversionApi );
			}

			return tBody;
		}
	}, { priority: 'normal' } );
}

export function downcastInsertRow() {
	return dispatcher => dispatcher.on( 'insert:tableRow', ( evt, data, conversionApi ) => {
		const tableRow = data.item;

		if ( !conversionApi.consumable.consume( tableRow, 'insert' ) ) {
			return;
		}

		const table = tableRow.parent;

		const tableElement = conversionApi.mapper.toViewElement( table );

		const headingRows = parseInt( table.getAttribute( 'headingRows' ) ) || 0;

		const rowIndex = table.getChildIndex( tableRow );
		const isHeadingRow = rowIndex < headingRows;

		const tableSection = Array.from( tableElement.getChildren() )
			.filter( child => child.name === ( isHeadingRow ? 'thead' : 'tbody' ) )[ 0 ];

		const cellSpans = ensureCellSpans( table, rowIndex );

		downcastTableRow( tableRow, rowIndex, tableSection, cellSpans, conversionApi );
	}, { priority: 'normal' } );
}

function ensureCellSpans( table, currentRowIndex ) {
	const cellSpans = new CellSpans();

	for ( let rowIndex = 0; rowIndex < currentRowIndex; rowIndex++ ) {
		const row = table.getChild( rowIndex );

		let columnIndex = 0;

		for ( const tableCell of Array.from( row.getChildren() ) ) {
			columnIndex = cellSpans.getNextFreeColumnIndex( rowIndex, columnIndex );

			const colspan = tableCell.hasAttribute( 'colspan' ) ? parseInt( tableCell.getAttribute( 'colspan' ) ) : 1;
			const rowspan = tableCell.hasAttribute( 'rowspan' ) ? parseInt( tableCell.getAttribute( 'rowspan' ) ) : 1;

			cellSpans.recordSpans( rowIndex, columnIndex, rowspan, colspan );

			// Skip to next "free" column index.
			columnIndex += colspan;
		}
	}

	return cellSpans;
}

// Downcast converter for tableRow model element. Converts tableCells as well.
//
// @param {module:engine/model/element~Element} tableRow
// @param {Number} rowIndex
// @param {CellSpans} cellSpans
// @param {module:engine/view/containerelement~ContainerElement} tableSection
// @param {Object} conversionApi
function downcastTableRow( tableRow, rowIndex, tableSection, cellSpans, conversionApi ) {
	// Will always consume since we're converting <tableRow> element from a parent <table>.
	conversionApi.consumable.consume( tableRow, 'insert' );

	const headingRows = tableRow.parent.getAttribute( 'headingRows' ) || 0;

	const trElement = conversionApi.writer.createContainerElement( 'tr' );
	conversionApi.mapper.bindElements( tableRow, trElement );

	const offset = headingRows > 0 && rowIndex >= headingRows ? rowIndex - headingRows : rowIndex;

	const position = ViewPosition.createAt( tableSection, offset );
	conversionApi.writer.insert( position, trElement );

	// Defines tableCell horizontal position in table.
	// Might be different then position of tableCell in parent tableRow
	// as tableCells from previous rows might overlaps current row's cells.
	let columnIndex = 0;

	const headingColumns = tableRow.parent.getAttribute( 'headingColumns' ) || 0;

	for ( const tableCell of Array.from( tableRow.getChildren() ) ) {
		// Check whether current columnIndex is overlapped by table cells from previous rows.
		columnIndex = cellSpans.getNextFreeColumnIndex( rowIndex, columnIndex );

		const colspan = tableCell.hasAttribute( 'colspan' ) ? parseInt( tableCell.getAttribute( 'colspan' ) ) : 1;
		const rowspan = tableCell.hasAttribute( 'rowspan' ) ? parseInt( tableCell.getAttribute( 'rowspan' ) ) : 1;

		cellSpans.recordSpans( rowIndex, columnIndex, rowspan, colspan );

		// Will always consume since we're converting <tableRow> element from a parent <table>.
		conversionApi.consumable.consume( tableCell, 'insert' );

		const cellElementName = getCellElementName( rowIndex, columnIndex, headingRows, headingColumns );
		const cellElement = conversionApi.writer.createContainerElement( cellElementName );

		conversionApi.mapper.bindElements( tableCell, cellElement );
		conversionApi.writer.insert( ViewPosition.createAt( trElement, 'end' ), cellElement );

		// Skip to next "free" column index.
		columnIndex += colspan;
	}
}

// Creates table section at the end of a table.
//
// @param {String} elementName
// @param {module:engine/view/element~Element} tableElement
// @param conversionApi
// @return {module:engine/view/containerelement~ContainerElement}
function createTableSection( elementName, tableElement, conversionApi ) {
	const tableChildElement = conversionApi.writer.createContainerElement( elementName );

	conversionApi.writer.insert( ViewPosition.createAt( tableElement, 'end' ), tableChildElement );

	return tableChildElement;
}

// Returns `th` for heading cells and `td` for other cells.
// It is based on tableCell location (rowIndex x columnIndex) and the sizes of column & row headings sizes.
//
// @param {Number} rowIndex
// @param {Number} columnIndex
// @param {Number} headingRows
// @param {Number} headingColumns
// @returns {String}
function getCellElementName( rowIndex, columnIndex, headingRows, headingColumns ) {
	// Column heading are all tableCells in the first `columnHeading` rows.
	const isHeadingForAColumn = headingRows && headingRows > rowIndex;

	// So a whole row gets <th> element.
	if ( isHeadingForAColumn ) {
		return 'th';
	}

	// Row heading are tableCells which columnIndex is lower then headingColumns.
	const isHeadingForARow = headingColumns && headingColumns > columnIndex;

	return isHeadingForARow ? 'th' : 'td';
}

/**
 * Holds information about spanned table cells.
 *
 * @private
 */
export class CellSpans {
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
	 * Returns proper column index if a current cell index is overlapped by other (has a span defined).
	 *
	 * @param {Number} row
	 * @param {Number} column
	 * @return {Number} Returns current column or updated column index.
	 */
	getNextFreeColumnIndex( row, column ) {
		let span = this._check( row, column ) || 0;

		// Offset current table cell columnIndex by spanning cells from rows above.
		while ( span ) {
			column += span;
			span = this._check( row, column );
		}

		return column;
	}

	/**
	 * Updates spans based on current table cell height & width. Spans with height <= 1 will not be recorded.
	 *
	 * For instance if a table cell at row 0 and column 0 has height of 3 and width of 2 we're setting spans:
	 *
	 *        0 1 2 3 4 5
	 *     0:
	 *     1: 2
	 *     2: 2
	 *     3:
	 *
	 * Adding another spans for a table cell at row 2 and column 1 that has height of 2 and width of 4 will update above to:
	 *
	 *        0 1 2 3 4 5
	 *     0:
	 *     1: 2
	 *     2: 2
	 *     3:   4
	 *
	 * The above span mapping was calculated from a table below (cells 03 & 12 were not added as their height is 1):
	 *
	 *     +----+----+----+----+----+----+
	 *     | 00      | 02 | 03      | 05 |
	 *     |         +--- +----+----+----+
	 *     |         | 12      | 24 | 25 |
	 *     |         +----+----+----+----+
	 *     |         | 22                |
	 *     |----+----+                   +
	 *     | 31 | 32 |                   |
	 *     +----+----+----+----+----+----+
	 *
	 * @param {Number} rowIndex
	 * @param {Number} columnIndex
	 * @param {Number} height
	 * @param {Number} width
	 */
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

	/**
	 * Removes row from mapping.
	 *
	 * @param {Number} rowIndex
	 */
	drop( rowIndex ) {
		if ( this._spans.has( rowIndex ) ) {
			this._spans.delete( rowIndex );
		}
	}

	/**
	 * Checks if given table cell is spanned by other.
	 *
	 * @param {Number} rowIndex
	 * @param {Number} columnIndex
	 * @return {Boolean|Number} Returns false or width of a span.
	 * @private
	 */
	_check( rowIndex, columnIndex ) {
		if ( !this._spans.has( rowIndex ) ) {
			return false;
		}

		const rowSpans = this._spans.get( rowIndex );

		return rowSpans.has( columnIndex ) ? rowSpans.get( columnIndex ) : false;
	}
}
