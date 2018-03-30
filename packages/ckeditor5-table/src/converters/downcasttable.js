/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/converters/downcasttable
 */

import ViewPosition from '@ckeditor/ckeditor5-engine/src/view/position';
import ViewRange from '@ckeditor/ckeditor5-engine/src/view/range';
import CellSpans from '../cellspans';

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

		// Consume attributes if present to not fire attribute change downcast
		conversionApi.consumable.consume( table, 'attribute:headingRows:table' );
		conversionApi.consumable.consume( table, 'attribute:headingColumns:table' );

		// The <thead> and <tbody> elements are created on the fly when needed & cached by `getTableSection()` function.
		const tableSections = {};

		const tableElement = conversionApi.writer.createContainerElement( 'table' );
		const headingRows = getNumericAttribute( table, 'headingRows', 0 );
		const tableRows = Array.from( table.getChildren() );

		const cellSpans = getCellSpansWithPreviousFilled( table, 0 );

		for ( const tableRow of tableRows ) {
			const rowIndex = tableRows.indexOf( tableRow );
			const isHead = headingRows && rowIndex < headingRows;

			const tableSectionElement = getTableSection( isHead ? 'thead' : 'tbody', tableElement, conversionApi, tableSections );

			downcastTableRow( tableRow, rowIndex, tableSectionElement, cellSpans, conversionApi );

			// Drop table cell spans information for downcasted row.
			cellSpans.drop( rowIndex );
		}

		const viewPosition = conversionApi.mapper.toViewPosition( data.range.start );

		conversionApi.mapper.bindElements( table, tableElement );
		conversionApi.writer.insert( viewPosition, tableElement );
	}, { priority: 'normal' } );
}

/**
 * Model row element to view <tr> element conversion helper.
 *
 * This conversion helper creates whole <tr> element with child elements.
 *
 * @returns {Function} Conversion helper.
 */
export function downcastInsertRow() {
	return dispatcher => dispatcher.on( 'insert:tableRow', ( evt, data, conversionApi ) => {
		const tableRow = data.item;

		if ( !conversionApi.consumable.consume( tableRow, 'insert' ) ) {
			return;
		}

		const table = tableRow.parent;

		const tableElement = conversionApi.mapper.toViewElement( table );

		const headingRows = getNumericAttribute( table, 'headingRows', 0 );

		const rowIndex = table.getChildIndex( tableRow );
		const isHeadingRow = rowIndex < headingRows;

		const tableSection = Array.from( tableElement.getChildren() )
			.filter( child => child.name === ( isHeadingRow ? 'thead' : 'tbody' ) )[ 0 ];

		const cellSpans = getCellSpansWithPreviousFilled( table, rowIndex );

		downcastTableRow( tableRow, rowIndex, tableSection, cellSpans, conversionApi );
	}, { priority: 'normal' } );
}

/**
 * Model row element to view <tr> element conversion helper.
 *
 * This conversion helper creates whole <tr> element with child elements.
 *
 * @returns {Function} Conversion helper.
 */
export function downcastInsertCell() {
	return dispatcher => dispatcher.on( 'insert:tableCell', ( evt, data, conversionApi ) => {
		const tableCell = data.item;

		if ( !conversionApi.consumable.consume( tableCell, 'insert' ) ) {
			return;
		}

		const tableRow = tableCell.parent;
		const table = tableRow.parent;

		const trElement = conversionApi.mapper.toViewElement( tableRow );

		const headingRows = getNumericAttribute( table, 'headingRows', 0 );
		const headingColumns = getNumericAttribute( table, 'headingColumns', 0 );

		const rowIndex = table.getChildIndex( tableRow );

		const cellIndex = tableRow.getChildIndex( tableCell );

		let columnIndex = 0;

		const cellSpans = getCellSpansWithPreviousFilled( table, rowIndex, columnIndex );

		// check last row up to
		columnIndex = getColumnIndex( tableRow, columnIndex, cellSpans, rowIndex, tableCell );

		// Check whether current columnIndex is overlapped by table cells from previous rows.
		columnIndex = cellSpans.getAdjustedColumnIndex( rowIndex, columnIndex );

		const cellElementName = getCellElementName( rowIndex, columnIndex, headingRows, headingColumns );

		downcastTableCell( tableCell, rowIndex, columnIndex, cellSpans, cellElementName, trElement, conversionApi, cellIndex );
	}, { priority: 'normal' } );
}

/**
 * Conversion helper that acts on attribute change for headingColumns and headingRows attributes.
 *
 * Depending on changed attributes this converter will:
 * - rename <td> to <th> elements or vice versa
 * - create <thead> or <tbody> elements
 * - remove empty <thead> or <tbody>
 *
 * @returns {Function} Conversion helper.
 */
export function downcastAttributeChange( attribute ) {
	return dispatcher => dispatcher.on( `attribute:${ attribute }:table`, ( evt, data, conversionApi ) => {
		const table = data.item;

		if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
			return;
		}

		const headingRows = getNumericAttribute( table, 'headingRows', 0 );
		const headingColumns = getNumericAttribute( table, 'headingColumns', 0 );
		const tableElement = conversionApi.mapper.toViewElement( table );

		const tableRows = Array.from( table.getChildren() );

		const cellSpans = getCellSpansWithPreviousFilled( table, 0 );

		const cachedTableSections = {};

		for ( const tableRow of tableRows ) {
			const rowIndex = tableRows.indexOf( tableRow );

			const tr = conversionApi.mapper.toViewElement( tableRow );

			const desiredParentName = rowIndex < headingRows ? 'thead' : 'tbody';

			if ( desiredParentName !== tr.parent.name ) {
				const tableSection = getTableSection( desiredParentName, tableElement, conversionApi, cachedTableSections );

				let targetPosition;

				if ( desiredParentName === 'tbody' &&
					rowIndex === data.attributeNewValue &&
					data.attributeNewValue < data.attributeOldValue
				) {
					targetPosition = ViewPosition.createAt( tableSection, 'start' );
				} else if ( rowIndex > 0 ) {
					const previousTr = conversionApi.mapper.toViewElement( table.getChild( rowIndex - 1 ) );

					targetPosition = ViewPosition.createAfter( previousTr );
				} else {
					targetPosition = ViewPosition.createAt( tableSection, 'start' );
				}

				conversionApi.writer.move( ViewRange.createOn( tr ), targetPosition );
			}

			// Check rows
			let columnIndex = 0;

			for ( const tableCell of Array.from( tableRow.getChildren() ) ) {
				// Check whether current columnIndex is overlapped by table cells from previous rows.
				columnIndex = cellSpans.getAdjustedColumnIndex( rowIndex, columnIndex );

				const cellElementName = getCellElementName( rowIndex, columnIndex, headingRows, headingColumns );

				const cell = conversionApi.mapper.toViewElement( tableCell );

				// If in single change we're converting attribute changes and inserting cell the table cell might not be inserted into view
				// because of child conversion is done after parent.
				if ( cell && cell.name !== cellElementName ) {
					conversionApi.writer.rename( cell, cellElementName );
				}

				columnIndex = columnIndex + getNumericAttribute( tableCell, 'colspan', 1 );
			}

			// Drop table cell spans information for checked rows.
			cellSpans.drop( rowIndex );
		}

		// TODO: maybe a postfixer?
		if ( headingRows === 0 ) {
			removeTableSectionIfEmpty( 'thead', tableElement, conversionApi );
		} else if ( headingRows === table.childCount ) {
			removeTableSectionIfEmpty( 'tbody', tableElement, conversionApi );
		}
	}, { priority: 'normal' } );
}

// Downcast converter for tableRow model element. Converts tableCells as well.
//
// @param {module:engine/model/element~Element} tableRow
// @param {Number} rowIndex
// @param {module:table/cellspans~CellSpans} cellSpans
// @param {module:engine/view/containerelement~ContainerElement} tableSection
function downcastTableCell( tableCell, rowIndex, columnIndex, cellSpans, cellElementName, trElement, conversionApi, offset = 'end' ) {
	const colspan = getNumericAttribute( tableCell, 'colspan', 1 );
	const rowspan = getNumericAttribute( tableCell, 'rowspan', 1 );

	cellSpans.recordSpans( rowIndex, columnIndex, rowspan, colspan );

	// Will always consume since we're converting <tableRow> element from a parent <table>.
	conversionApi.consumable.consume( tableCell, 'insert' );

	const cellElement = conversionApi.writer.createContainerElement( cellElementName );

	conversionApi.mapper.bindElements( tableCell, cellElement );
	conversionApi.writer.insert( ViewPosition.createAt( trElement, offset ), cellElement );

	// Skip to next "free" column index.
	columnIndex += colspan;

	return columnIndex;
}

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
		columnIndex = cellSpans.getAdjustedColumnIndex( rowIndex, columnIndex );

		const cellElementName = getCellElementName( rowIndex, columnIndex, headingRows, headingColumns );

		columnIndex = downcastTableCell( tableCell, rowIndex, columnIndex, cellSpans, cellElementName, trElement, conversionApi );
	}
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

// Creates or returns an existing <tbody> or <thead> element witch caching.
//
// @param {String} sectionName
// @param {module:engine/view/element~Element} tableElement
// @param conversionApi
// @param {Object} cachedTableSection An object on which store cached elements.
// @return {module:engine/view/containerelement~ContainerElement}
function getTableSection( sectionName, tableElement, conversionApi, cachedTableSections ) {
	if ( cachedTableSections[ sectionName ] ) {
		return cachedTableSections[ sectionName ];
	}

	cachedTableSections[ sectionName ] = getOrCreateTableSection( sectionName, tableElement, conversionApi );

	return cachedTableSections[ sectionName ];
}

// Creates or returns an existing <tbody> or <thead> element.
//
// @param {String} sectionName
// @param {module:engine/view/element~Element} tableElement
// @param conversionApi
function getOrCreateTableSection( sectionName, tableElement, conversionApi ) {
	return getExistingTableSectionElement( sectionName, tableElement ) || createTableSection( sectionName, tableElement, conversionApi );
}

// Finds an existing <tbody> or <thead> element or returns undefined.
//
// @param {String} sectionName
// @param {module:engine/view/element~Element} tableElement
// @param conversionApi
function getExistingTableSectionElement( sectionName, tableElement ) {
	for ( const tableSection of tableElement.getChildren() ) {
		if ( tableSection.name == sectionName ) {
			return tableSection;
		}
	}
}

// Creates table section at the end of a table.
//
// @param {String} sectionName
// @param {module:engine/view/element~Element} tableElement
// @param conversionApi
// @return {module:engine/view/containerelement~ContainerElement}
function createTableSection( sectionName, tableElement, conversionApi ) {
	const tableChildElement = conversionApi.writer.createContainerElement( sectionName );

	conversionApi.writer.insert( ViewPosition.createAt( tableElement, sectionName == 'tbody' ? 'end' : 'start' ), tableChildElement );

	return tableChildElement;
}

// Removes an existing <tbody> or <thead> element if it is empty.
//
// @param {String} sectionName
// @param {module:engine/view/element~Element} tableElement
// @param conversionApi
function removeTableSectionIfEmpty( sectionName, tableElement, conversionApi ) {
	const tHead = getExistingTableSectionElement( sectionName, tableElement );

	if ( tHead && tHead.childCount === 0 ) {
		conversionApi.writer.remove( ViewRange.createOn( tHead ) );
	}
}

export function getNumericAttribute( element, attribute, defaultValue ) {
	return element.hasAttribute( attribute ) ? parseInt( element.getAttribute( attribute ) ) : defaultValue;
}

function getColumnIndex( tableRow, columnIndex, cellSpans, rowIndex, tableCell ) {
	for ( const tableCellA of Array.from( tableRow.getChildren() ) ) {
		// Check whether current columnIndex is overlapped by table cells from previous rows.
		columnIndex = cellSpans.getAdjustedColumnIndex( rowIndex, columnIndex );

		// Up to here only!
		if ( tableCellA === tableCell ) {
			return columnIndex;
		}

		const colspan = getNumericAttribute( tableCellA, 'colspan', 1 );
		const rowspan = getNumericAttribute( tableCellA, 'rowspan', 1 );

		cellSpans.recordSpans( rowIndex, columnIndex, rowspan, colspan );

		// Skip to next "free" column index.
		columnIndex += colspan;
	}
}

// Helper method for creating a pre-filled cell span instance. Useful when converting part of a table.
//
// @param {module:engine/model/element~Element} table Model table instance.
// @param currentRowIndex Current row index - all table rows up to this index will be analyzed (excluding provided row index).
// @returns {module:table/cellspans~CellSpans}
function getCellSpansWithPreviousFilled( table, currentRowIndex ) {
	const cellSpans = new CellSpans();

	for ( let rowIndex = 0; rowIndex <= currentRowIndex; rowIndex++ ) {
		const row = table.getChild( rowIndex );

		let columnIndex = 0;

		// TODO: make this an iterator?
		for ( const tableCell of Array.from( row.getChildren() ) ) {
			columnIndex = cellSpans.getAdjustedColumnIndex( rowIndex, columnIndex );

			const colspan = getNumericAttribute( tableCell, 'colspan', 1 );
			const rowspan = getNumericAttribute( tableCell, 'rowspan', 1 );

			cellSpans.recordSpans( rowIndex, columnIndex, rowspan, colspan );

			// Skip to next "free" column index.
			columnIndex += colspan;
		}
	}

	return cellSpans;
}
