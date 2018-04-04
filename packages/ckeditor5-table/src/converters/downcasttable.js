/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/converters/downcasttable
 */

import ViewPosition from '@ckeditor/ckeditor5-engine/src/view/position';
import ViewRange from '@ckeditor/ckeditor5-engine/src/view/range';
import TableWalker from './../tablewalker';

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

		const tableIterator = new TableWalker( table );

		for ( const tableCellInfo of tableIterator ) {
			const { row, table: { headingRows } } = tableCellInfo;

			const isHead = headingRows && row < headingRows;

			const tableSectionElement = getTableSection( isHead ? 'thead' : 'tbody', tableElement, conversionApi, tableSections );
			const tableRow = table.getChild( row );

			// Check if row was converted
			const trElement = getOrCreateTr( tableRow, row, tableSectionElement, conversionApi );

			createViewTableCellElement( tableCellInfo, trElement, conversionApi );
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

		const headingRows = table.getAttribute( 'headingRows' ) || 0;

		const row = table.getChildIndex( tableRow );
		const isHeadingRow = row < headingRows;

		const tableSection = getOrCreateTableSection( isHeadingRow ? 'thead' : 'tbody', tableElement, conversionApi );

		const tableIterator = new TableWalker( table, { startRow: row, endRow: row } );

		for ( const tableCellInfo of tableIterator ) {
			const trElement = getOrCreateTr( tableRow, row, tableSection, conversionApi );

			createViewTableCellElement( tableCellInfo, trElement, conversionApi );
		}
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

		const tableIterator = new TableWalker( table );

		for ( const tableCellInfo of tableIterator ) {
			if ( tableCellInfo.cell === tableCell ) {
				const trElement = conversionApi.mapper.toViewElement( tableRow );

				createViewTableCellElement( tableCellInfo, trElement, conversionApi, tableRow.getChildIndex( tableCell ) );

				return;
			}
		}
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

		const headingRows = table.getAttribute( 'headingRows' ) || 0;
		const tableElement = conversionApi.mapper.toViewElement( table );

		const cachedTableSections = {};

		const tableIterator = new TableWalker( table );

		for ( const tableCellInfo of tableIterator ) {
			const { row, cell } = tableCellInfo;
			const tableRow = table.getChild( row );

			const tr = conversionApi.mapper.toViewElement( tableRow );

			const desiredParentName = row < headingRows ? 'thead' : 'tbody';

			if ( desiredParentName !== tr.parent.name ) {
				const tableSection = getTableSection( desiredParentName, tableElement, conversionApi, cachedTableSections );

				let targetPosition;

				if ( desiredParentName === 'tbody' &&
					row === data.attributeNewValue &&
					data.attributeNewValue < data.attributeOldValue
				) {
					targetPosition = ViewPosition.createAt( tableSection, 'start' );
				} else if ( row > 0 ) {
					const previousTr = conversionApi.mapper.toViewElement( table.getChild( row - 1 ) );

					targetPosition = ViewPosition.createAfter( previousTr );
				} else {
					targetPosition = ViewPosition.createAt( tableSection, 'start' );
				}

				conversionApi.writer.move( ViewRange.createOn( tr ), targetPosition );
			}

			// Check whether current columnIndex is overlapped by table cells from previous rows.
			const cellElementName = getCellElementName( tableCellInfo );

			const viewCell = conversionApi.mapper.toViewElement( cell );

			// If in single change we're converting attribute changes and inserting cell the table cell might not be inserted into view
			// because of child conversion is done after parent.
			if ( viewCell && viewCell.name !== cellElementName ) {
				conversionApi.writer.rename( viewCell, cellElementName );
			}
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
function createViewTableCellElement( tableCellInfo, trElement, conversionApi, offset = 'end' ) {
	const tableCell = tableCellInfo.cell;

	const cellElementName = getCellElementName( tableCellInfo );

	// Will always consume since we're converting <tableRow> element from a parent <table>.
	conversionApi.consumable.consume( tableCell, 'insert' );

	const cellElement = conversionApi.writer.createContainerElement( cellElementName );

	conversionApi.mapper.bindElements( tableCell, cellElement );
	conversionApi.writer.insert( ViewPosition.createAt( trElement, offset ), cellElement );
}

function getOrCreateTr( tableRow, rowIndex, tableSection, conversionApi ) {
	let trElement = conversionApi.mapper.toViewElement( tableRow );

	if ( !trElement ) {
		// Will always consume since we're converting <tableRow> element from a parent <table>.
		conversionApi.consumable.consume( tableRow, 'insert' );

		trElement = conversionApi.writer.createContainerElement( 'tr' );
		conversionApi.mapper.bindElements( tableRow, trElement );

		const headingRows = tableRow.parent.getAttribute( 'headingRows' ) || 0;
		const offset = headingRows > 0 && rowIndex >= headingRows ? rowIndex - headingRows : rowIndex;

		const position = ViewPosition.createAt( tableSection, offset );
		conversionApi.writer.insert( position, trElement );
	}

	return trElement;
}

// Returns `th` for heading cells and `td` for other cells.
// It is based on tableCell location (rowIndex x columnIndex) and the sizes of column & row headings sizes.
//
// @param {Number} rowIndex
// @param {Number} columnIndex
// @param {Number} headingRows
// @param {Number} headingColumns
// @returns {String}
function getCellElementName( tableCellInfo ) {
	const headingRows = tableCellInfo.table.headingRows;

	// Column heading are all tableCells in the first `columnHeading` rows.
	const isHeadingForAColumn = headingRows && headingRows > tableCellInfo.row;

	// So a whole row gets <th> element.
	if ( isHeadingForAColumn ) {
		return 'th';
	}

	const headingColumns = tableCellInfo.table.headingColumns;

	// Row heading are tableCells which columnIndex is lower then headingColumns.
	const isHeadingForARow = headingColumns && headingColumns > tableCellInfo.column;

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
