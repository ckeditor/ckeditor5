/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/converters
 */

import Position from '@ckeditor/ckeditor5-engine/src/view/position';
import ModelRange from '@ckeditor/ckeditor5-engine/src/model/range';
import ModelPosition from '@ckeditor/ckeditor5-engine/src/model/position';

export function upcastTable() {
	const converter = ( evt, data, conversionApi ) => {
		const viewTable = data.viewItem;

		// When element was already consumed then skip it.
		const test = conversionApi.consumable.test( viewTable, { name: true } );

		if ( !test ) {
			return;
		}

		const modelTable = conversionApi.writer.createElement( 'table' );

		const splitResult = conversionApi.splitToAllowedParent( modelTable, data.modelCursor );

		// Insert element on allowed position.
		conversionApi.writer.insert( modelTable, splitResult.position );

		// Convert children and insert to element.
		_upcastTableRows( viewTable, modelTable, conversionApi );

		// Consume appropriate value from consumable values list.
		conversionApi.consumable.consume( viewTable, { name: true } );

		// Set conversion result range.
		data.modelRange = new ModelRange(
			// Range should start before inserted element
			ModelPosition.createBefore( modelTable ),
			// Should end after but we need to take into consideration that children could split our
			// element, so we need to move range after parent of the last converted child.
			// before: <allowed>[]</allowed>
			// after: <allowed>[<converted><child></child></converted><child></child><converted>]</converted></allowed>
			ModelPosition.createAfter( modelTable )
		);

		// Now we need to check where the modelCursor should be.
		// If we had to split parent to insert our element then we want to continue conversion inside split parent.
		//
		// before: <allowed><notAllowed>[]</notAllowed></allowed>
		// after:  <allowed><notAllowed></notAllowed><converted></converted><notAllowed>[]</notAllowed></allowed>
		if ( splitResult.cursorParent ) {
			data.modelCursor = ModelPosition.createAt( splitResult.cursorParent );

			// Otherwise just continue after inserted element.
		} else {
			data.modelCursor = data.modelRange.end;
		}
	};

	return dispatcher => {
		dispatcher.on( 'element:table', converter, { priority: 'normal' } );
	};
}

export function downcastTable() {
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

function _upcastTableRows( viewTable, modelTable, conversionApi ) {
	const { rows, headingRows, headingColumns } = _scanTable( viewTable );

	for ( const viewRow of rows ) {
		const modelRow = conversionApi.writer.createElement( 'tableRow' );
		conversionApi.writer.insert( modelRow, ModelPosition.createAt( modelTable, 'end' ) );
		conversionApi.consumable.consume( viewRow, { name: true } );

		const childrenCursor = ModelPosition.createAt( modelRow );
		conversionApi.convertChildren( viewRow, childrenCursor );
	}

	if ( headingRows ) {
		conversionApi.writer.setAttribute( 'headingRows', headingRows, modelTable );
	}

	if ( headingColumns ) {
		conversionApi.writer.setAttribute( 'headingColumns', headingColumns, modelTable );
	}

	if ( !rows.length ) {
		// Create empty table with one row and one table cell.
		const row = conversionApi.writer.createElement( 'tableRow' );
		conversionApi.writer.insert( row, ModelPosition.createAt( modelTable, 'end' ) );
		conversionApi.writer.insertElement( 'tableCell', ModelPosition.createAt( row, 'end' ) );
	}
}

// This one scans table rows & extracts required metadata from table:
//
// headingRows    - number of rows that goes as table header.
// headingColumns - max number of row headings.
// rows           - sorted trs as they should go into the model - ie if <thead> is inserted after <tbody> in the view.
function _scanTable( viewTable ) {
	const tableMeta = {
		headingRows: 0,
		headingColumns: 0,
		rows: {
			head: [],
			body: []
		}
	};

	let firstTheadElement;

	for ( const tableChild of Array.from( viewTable.getChildren() ) ) {
		// Only <thead>, <tbody> & <tfoot> from allowed table children can have <tr>s.
		// The else is for future purposes (mainly <caption>).
		if ( tableChild.name === 'tbody' || tableChild.name === 'thead' || tableChild.name === 'tfoot' ) {
			// Parse only the first <thead> in the table as table header - all other ones will be converted to table body rows.
			if ( tableChild.name === 'thead' && !firstTheadElement ) {
				firstTheadElement = tableChild;
			}

			for ( const childRow of Array.from( tableChild.getChildren() ) ) {
				_scanRow( childRow, tableMeta, firstTheadElement );
			}
		}
	}

	// Unify returned table meta.
	tableMeta.rows = [ ...tableMeta.rows.head, ...tableMeta.rows.body ];

	return tableMeta;
}

// Scans <tr> and it's children for metadata:
// - For heading row:
//     - either add this row to heading or body rows.
//     - updates number of heading rows.
// - For body rows:
//     - calculates number of column headings.
function _scanRow( tr, tableMeta, firstThead ) {
	if ( tr.parent.name === 'thead' && tr.parent === firstThead ) {
		// It's a table header so only update it's meta.
		tableMeta.headingRows++;
		tableMeta.rows.head.push( tr );

		return;
	}

	// For normal row check how many column headings this row has.
	tableMeta.rows.body.push( tr );

	let headingCols = 0;
	let index = 0;

	// Filter out empty text nodes from tr children.
	const children = Array.from( tr.getChildren() )
		.filter( child => child.name === 'th' || child.name === 'td' );

	// Count starting adjacent <th> elements of a <tr>.
	while ( index < children.length && children[ index ].name === 'th' ) {
		const td = children[ index ];

		// Adjust columns calculation by the number of extended columns.
		const hasAttribute = td.hasAttribute( 'colspan' );
		const tdSize = hasAttribute ? parseInt( td.getAttribute( 'colspan' ) ) : 1;

		headingCols = headingCols + tdSize;
		index++;
	}

	if ( headingCols > tableMeta.headingColumns ) {
		tableMeta.headingColumns = headingCols;
	}
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
