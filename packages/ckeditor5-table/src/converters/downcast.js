/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/converters/downcast
 */

import TableWalker from './../tablewalker';
import { toWidget, toWidgetEditable } from 'ckeditor5/src/widget';

/**
 * Model table element to view table element conversion helper.
 *
 * This conversion helper creates the whole table element with child elements.
 *
 * @param {Object} options
 * @param {Boolean} options.asWidget If set to `true`, the downcast conversion will produce a widget.
 * @returns {Function} Conversion helper.
 */
export function downcastInsertTable( options = {} ) {
	return dispatcher => dispatcher.on( 'insert:table', ( evt, data, conversionApi ) => {
		const table = data.item;

		if ( !conversionApi.consumable.consume( table, 'insert' ) ) {
			return;
		}

		// Consume attributes if present to not fire attribute change downcast
		conversionApi.consumable.consume( table, 'attribute:headingRows:table' );
		conversionApi.consumable.consume( table, 'attribute:headingColumns:table' );

		const asWidget = options && options.asWidget;

		const figureElement = conversionApi.writer.createContainerElement( 'figure', { class: 'table' } );
		const tableElement = conversionApi.writer.createContainerElement( 'table' );
		conversionApi.writer.insert( conversionApi.writer.createPositionAt( figureElement, 0 ), tableElement );

		let tableWidget;

		if ( asWidget ) {
			tableWidget = toTableWidget( figureElement, conversionApi.writer );
		}

		const tableWalker = new TableWalker( table );

		const tableAttributes = {
			headingRows: table.getAttribute( 'headingRows' ) || 0,
			headingColumns: table.getAttribute( 'headingColumns' ) || 0
		};

		// Cache for created table rows.
		const viewRows = new Map();

		for ( const tableSlot of tableWalker ) {
			const { row, cell } = tableSlot;

			const tableRow = table.getChild( row );
			const trElement = viewRows.get( row ) || createTr( tableElement, tableRow, row, tableAttributes, conversionApi );
			viewRows.set( row, trElement );

			// Consume table cell - it will be always consumed as we convert whole table at once.
			conversionApi.consumable.consume( cell, 'insert' );

			const insertPosition = conversionApi.writer.createPositionAt( trElement, 'end' );

			createViewTableCellElement( tableSlot, tableAttributes, insertPosition, conversionApi, options );
		}

		// Insert empty TR elements if there are any rows without anchored cells. Since the model is always normalized
		// this can happen only in the document fragment that only part of the table is down-casted.
		for ( const tableRow of table.getChildren() ) {
			const rowIndex = tableRow.index;

			// Make sure that this is a table row and not some other element (i.e., caption).
			if ( tableRow.is( 'element', 'tableRow' ) && !viewRows.has( rowIndex ) ) {
				viewRows.set( rowIndex, createTr( tableElement, tableRow, rowIndex, tableAttributes, conversionApi ) );
			}
		}

		const viewPosition = conversionApi.mapper.toViewPosition( data.range.start );

		conversionApi.mapper.bindElements( table, asWidget ? tableWidget : figureElement );
		conversionApi.writer.insert( viewPosition, asWidget ? tableWidget : figureElement );
	} );
}

/**
 * Model row element to view `<tr>` element conversion helper.
 *
 * This conversion helper creates the whole `<tr>` element with child elements.
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

		const figureElement = conversionApi.mapper.toViewElement( table );
		const tableElement = getViewTable( figureElement );

		const row = table.getChildIndex( tableRow );

		const tableWalker = new TableWalker( table, { row } );

		const tableAttributes = {
			headingRows: table.getAttribute( 'headingRows' ) || 0,
			headingColumns: table.getAttribute( 'headingColumns' ) || 0
		};

		// Cache for created table rows.
		const viewRows = new Map();

		for ( const tableSlot of tableWalker ) {
			const trElement = viewRows.get( row ) || createTr( tableElement, tableRow, row, tableAttributes, conversionApi );
			viewRows.set( row, trElement );

			// Consume table cell - it will be always consumed as we convert whole row at once.
			conversionApi.consumable.consume( tableSlot.cell, 'insert' );

			const insertPosition = conversionApi.writer.createPositionAt( trElement, 'end' );

			createViewTableCellElement( tableSlot, tableAttributes, insertPosition, conversionApi, { asWidget: true } );
		}
	} );
}

/**
 * Model table cell element to view `<td>` or `<th>` element conversion helper.
 *
 * This conversion helper will create proper `<th>` elements for table cells that are in the heading section (heading row or column)
 * and `<td>` otherwise.
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
		const rowIndex = table.getChildIndex( tableRow );

		const tableWalker = new TableWalker( table, { row: rowIndex } );

		const tableAttributes = {
			headingRows: table.getAttribute( 'headingRows' ) || 0,
			headingColumns: table.getAttribute( 'headingColumns' ) || 0
		};

		// We need to iterate over a table in order to get proper row & column values from a walker
		for ( const tableSlot of tableWalker ) {
			if ( tableSlot.cell === tableCell ) {
				const trElement = conversionApi.mapper.toViewElement( tableRow );
				const insertPosition = conversionApi.writer.createPositionAt( trElement, tableRow.getChildIndex( tableCell ) );

				createViewTableCellElement( tableSlot, tableAttributes, insertPosition, conversionApi, { asWidget: true } );

				// No need to iterate further.
				return;
			}
		}
	} );
}

/**
 * Conversion helper that acts on heading column table attribute change.
 *
 * Depending on changed attributes this converter will rename `<td` to `<th>` elements or vice versa depending on the cell column index.
 *
 * @returns {Function} Conversion helper.
 */
export function downcastTableHeadingColumnsChange() {
	return dispatcher => dispatcher.on( 'attribute:headingColumns:table', ( evt, data, conversionApi ) => {
		const table = data.item;

		if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
			return;
		}

		const tableAttributes = {
			headingRows: table.getAttribute( 'headingRows' ) || 0,
			headingColumns: table.getAttribute( 'headingColumns' ) || 0
		};

		const oldColumns = data.attributeOldValue;
		const newColumns = data.attributeNewValue;

		const lastColumnToCheck = ( oldColumns > newColumns ? oldColumns : newColumns ) - 1;

		for ( const tableSlot of new TableWalker( table, { endColumn: lastColumnToCheck } ) ) {
			renameViewTableCellIfRequired( tableSlot, tableAttributes, conversionApi );
		}
	} );
}

/**
 * Conversion helper that acts on a removed row.
 *
 * @returns {Function} Conversion helper.
 */
export function downcastRemoveRow() {
	return dispatcher => dispatcher.on( 'remove:tableRow', ( evt, data, conversionApi ) => {
		// Prevent default remove converter.
		evt.stop();
		const viewWriter = conversionApi.writer;
		const mapper = conversionApi.mapper;

		const viewStart = mapper.toViewPosition( data.position ).getLastMatchingPosition( value => !value.item.is( 'element', 'tr' ) );
		const viewItem = viewStart.nodeAfter;
		const tableSection = viewItem.parent;
		const viewTable = tableSection.parent;

		// Remove associated <tr> from the view.
		const removeRange = viewWriter.createRangeOn( viewItem );
		const removed = viewWriter.remove( removeRange );

		for ( const child of viewWriter.createRangeIn( removed ).getItems() ) {
			mapper.unbindViewElement( child );
		}

		// Cleanup: Ensure that thead & tbody sections are removed if left empty after removing rows. See #6437, #6391.
		removeTableSectionIfEmpty( 'thead', viewTable, conversionApi );
		removeTableSectionIfEmpty( 'tbody', viewTable, conversionApi );
	}, { priority: 'higher' } );
}

/**
 * Overrides paragraph inside table cell conversion.
 *
 * This converter:
 * * should be used to override default paragraph conversion in the editing view.
 * * It will only convert <paragraph> placed directly inside <tableCell>.
 * * For a single paragraph without attributes it returns `<span>` to simulate data table.
 * * For all other cases it returns `<p>` element.
 *
 * @param {module:engine/model/element~Element} modelElement
 * @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi
 * @returns {module:engine/view/containerelement~ContainerElement|undefined}
 */
export function convertParagraphInTableCell( modelElement, conversionApi ) {
	const { writer } = conversionApi;

	if ( !modelElement.parent.is( 'element', 'tableCell' ) ) {
		return;
	}

	if ( isSingleParagraphWithoutAttributes( modelElement ) ) {
		return writer.createContainerElement( 'span', { class: 'ck-table-bogus-paragraph' } );
	} else {
		return writer.createContainerElement( 'p' );
	}
}

/**
 * Checks if given model `<paragraph>` is an only child of a parent (`<tableCell>`) and if it has any attribute set.
 *
 * The paragraph should be converted in the editing view to:
 *
 * * If returned `true` - to a `<span class="ck-table-bogus-paragraph">`
 * * If returned `false` - to a `<p>`
 *
 * @param {module:engine/model/element~Element} modelElement
 * @returns {Boolean}
 */
export function isSingleParagraphWithoutAttributes( modelElement ) {
	const tableCell = modelElement.parent;

	const isSingleParagraph = tableCell.childCount === 1;

	return isSingleParagraph && !hasAnyAttribute( modelElement );
}

// Converts a given {@link module:engine/view/element~Element} to a table widget:
// * Adds a {@link module:engine/view/element~Element#_setCustomProperty custom property} allowing to recognize the table widget element.
// * Calls the {@link module:widget/utils~toWidget} function with the proper element's label creator.
//
// @param {module:engine/view/element~Element} viewElement
// @param {module:engine/view/downcastwriter~DowncastWriter} writer An instance of the view writer.
// @param {String} label The element's label. It will be concatenated with the table `alt` attribute if one is present.
// @returns {module:engine/view/element~Element}
function toTableWidget( viewElement, writer ) {
	writer.setCustomProperty( 'table', true, viewElement );

	return toWidget( viewElement, writer, { hasSelectionHandle: true } );
}

// Renames an existing table cell in the view to a given element name.
//
// **Note** This method will not do anything if a view table cell has not been converted yet.
//
// @param {module:engine/model/element~Element} tableCell
// @param {String} desiredCellElementName
// @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi
function renameViewTableCell( tableCell, desiredCellElementName, conversionApi ) {
	const viewWriter = conversionApi.writer;
	const viewCell = conversionApi.mapper.toViewElement( tableCell );

	const editable = viewWriter.createEditableElement( desiredCellElementName, viewCell.getAttributes() );
	const renamedCell = toWidgetEditable( editable, viewWriter );

	viewWriter.insert( viewWriter.createPositionAfter( viewCell ), renamedCell );
	viewWriter.move( viewWriter.createRangeIn( viewCell ), viewWriter.createPositionAt( renamedCell, 0 ) );
	viewWriter.remove( viewWriter.createRangeOn( viewCell ) );

	conversionApi.mapper.unbindViewElement( viewCell );
	conversionApi.mapper.bindElements( tableCell, renamedCell );
}

// Renames a table cell element in the view according to its location in the table.
//
// @param {module:table/tablewalker~TableSlot} tableSlot
// @param {{headingColumns, headingRows}} tableAttributes
// @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi
function renameViewTableCellIfRequired( tableSlot, tableAttributes, conversionApi ) {
	const { cell } = tableSlot;

	// Check whether current columnIndex is overlapped by table cells from previous rows.
	const desiredCellElementName = getCellElementName( tableSlot, tableAttributes );

	const viewCell = conversionApi.mapper.toViewElement( cell );

	// If in single change we're converting attribute changes and inserting cell the table cell might not be inserted into view
	// because of child conversion is done after parent.
	if ( viewCell && viewCell.name !== desiredCellElementName ) {
		renameViewTableCell( cell, desiredCellElementName, conversionApi );
	}
}

// Creates a table cell element in the view.
//
// @param {module:table/tablewalker~TableSlot} tableSlot
// @param {module:engine/view/position~Position} insertPosition
// @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi
function createViewTableCellElement( tableSlot, tableAttributes, insertPosition, conversionApi, options ) {
	const asWidget = options && options.asWidget;
	const cellElementName = getCellElementName( tableSlot, tableAttributes );

	const cellElement = asWidget ?
		toWidgetEditable( conversionApi.writer.createEditableElement( cellElementName ), conversionApi.writer ) :
		conversionApi.writer.createContainerElement( cellElementName );

	const tableCell = tableSlot.cell;

	const firstChild = tableCell.getChild( 0 );
	const isSingleParagraph = tableCell.childCount === 1 && firstChild.name === 'paragraph';

	conversionApi.writer.insert( insertPosition, cellElement );

	conversionApi.mapper.bindElements( tableCell, cellElement );

	// Additional requirement for data pipeline to have backward compatible data tables.
	if ( !asWidget && isSingleParagraph && !hasAnyAttribute( firstChild ) ) {
		const innerParagraph = tableCell.getChild( 0 );

		conversionApi.consumable.consume( innerParagraph, 'insert' );

		conversionApi.mapper.bindElements( innerParagraph, cellElement );
	}
}

// Creates a `<tr>` view element.
//
// @param {module:engine/view/element~Element} tableElement
// @param {module:engine/model/element~Element} tableRow
// @param {Number} rowIndex
// @param {{headingColumns, headingRows}} tableAttributes
// @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi
// @returns {module:engine/view/element~Element}
function createTr( tableElement, tableRow, rowIndex, tableAttributes, conversionApi ) {
	// Will always consume since we're converting <tableRow> element from a parent <table>.
	conversionApi.consumable.consume( tableRow, 'insert' );

	const trElement = tableRow.isEmpty ?
		conversionApi.writer.createEmptyElement( 'tr' ) :
		conversionApi.writer.createContainerElement( 'tr' );

	conversionApi.mapper.bindElements( tableRow, trElement );

	const headingRows = tableAttributes.headingRows;
	const tableSection = getOrCreateTableSection( getSectionName( rowIndex, tableAttributes ), tableElement, conversionApi );

	const offset = headingRows > 0 && rowIndex >= headingRows ? rowIndex - headingRows : rowIndex;
	const position = conversionApi.writer.createPositionAt( tableSection, offset );

	conversionApi.writer.insert( position, trElement );

	return trElement;
}

// Returns `th` for heading cells and `td` for other cells for the current table walker value.
//
// @param {module:table/tablewalker~TableSlot} tableSlot
// @param {{headingColumns, headingRows}} tableAttributes
// @returns {String}
function getCellElementName( tableSlot, tableAttributes ) {
	const { row, column } = tableSlot;
	const { headingColumns, headingRows } = tableAttributes;

	// Column heading are all tableCells in the first `columnHeading` rows.
	const isColumnHeading = headingRows && headingRows > row;

	// So a whole row gets <th> element.
	if ( isColumnHeading ) {
		return 'th';
	}

	// Row heading are tableCells which columnIndex is lower then headingColumns.
	const isRowHeading = headingColumns && headingColumns > column;

	return isRowHeading ? 'th' : 'td';
}

// Returns the table section name for the current table walker value.
//
// @param {Number} row
// @param {{headingColumns, headingRows}} tableAttributes
// @returns {String}
function getSectionName( row, tableAttributes ) {
	return row < tableAttributes.headingRows ? 'thead' : 'tbody';
}

// Creates or returns an existing `<tbody>` or `<thead>` element with caching.
//
// @param {String} sectionName
// @param {module:engine/view/element~Element} viewTable
// @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi
// @param {Object} cachedTableSection An object that stores cached elements.
// @returns {module:engine/view/containerelement~ContainerElement}
function getOrCreateTableSection( sectionName, viewTable, conversionApi ) {
	const viewTableSection = getExistingTableSectionElement( sectionName, viewTable );

	return viewTableSection ? viewTableSection : createTableSection( sectionName, viewTable, conversionApi );
}

// Finds an existing `<tbody>` or `<thead>` element or returns undefined.
//
// @param {String} sectionName
// @param {module:engine/view/element~Element} tableElement
// @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi
function getExistingTableSectionElement( sectionName, tableElement ) {
	for ( const tableSection of tableElement.getChildren() ) {
		if ( tableSection.name == sectionName ) {
			return tableSection;
		}
	}
}

// Creates a table section at the end of the table.
//
// @param {String} sectionName
// @param {module:engine/view/element~Element} tableElement
// @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi
// @returns {module:engine/view/containerelement~ContainerElement}
function createTableSection( sectionName, tableElement, conversionApi ) {
	const tableChildElement = conversionApi.writer.createContainerElement( sectionName );

	const insertPosition = conversionApi.writer.createPositionAt( tableElement, sectionName == 'tbody' ? 'end' : 0 );

	conversionApi.writer.insert( insertPosition, tableChildElement );

	return tableChildElement;
}

// Removes an existing `<tbody>` or `<thead>` element if it is empty.
//
// @param {String} sectionName
// @param {module:engine/view/element~Element} tableElement
// @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi
function removeTableSectionIfEmpty( sectionName, tableElement, conversionApi ) {
	const tableSection = getExistingTableSectionElement( sectionName, tableElement );

	if ( tableSection && tableSection.childCount === 0 ) {
		conversionApi.writer.remove( conversionApi.writer.createRangeOn( tableSection ) );
	}
}

// Finds a '<table>' element inside the `<figure>` widget.
//
// @param {module:engine/view/element~Element} viewFigure
function getViewTable( viewFigure ) {
	for ( const child of viewFigure.getChildren() ) {
		if ( child.name === 'table' ) {
			return child;
		}
	}
}

// Checks if an element has any attributes set.
//
// @param {module:engine/model/element~Element element
// @returns {Boolean}
function hasAnyAttribute( element ) {
	return !![ ...element.getAttributeKeys() ].length;
}
