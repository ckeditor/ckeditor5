/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/converters/downcast
 */

import ViewPosition from '@ckeditor/ckeditor5-engine/src/view/position';
import ViewRange from '@ckeditor/ckeditor5-engine/src/view/range';
import TableWalker from './../tablewalker';
import { toWidget, toWidgetEditable } from '@ckeditor/ckeditor5-widget/src/utils';

/**
 * Model table element to view table element conversion helper.
 *
 * This conversion helper creates whole table element with child elements.
 *
 * @param {Object} options
 * @param {Boolean} options.asWidget If set to true the downcast conversion will produce widget.
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

		const tableElement = conversionApi.writer.createContainerElement( 'table' );

		let tableWidget;

		if ( asWidget ) {
			tableWidget = toWidget( tableElement, conversionApi.writer );
		}

		const tableWalker = new TableWalker( table );

		const tableAttributes = {
			headingRows: parseInt( table.getAttribute( 'headingRows' ) || 0 ),
			headingColumns: parseInt( table.getAttribute( 'headingColumns' ) || 0 )
		};

		for ( const tableWalkerValue of tableWalker ) {
			const { row, cell } = tableWalkerValue;

			const tableSection = getOrCreateTableSection( getSectionName( row, tableAttributes ), tableElement, conversionApi );
			const tableRow = table.getChild( row );

			// Check if row was converted
			const trElement = getOrCreateTr( tableRow, row, tableSection, conversionApi );

			// Consume table cell - it will be always consumed as we convert whole table at once.
			conversionApi.consumable.consume( cell, 'insert' );

			const insertPosition = ViewPosition.createAt( trElement, 'end' );

			createViewTableCellElement( tableWalkerValue, tableAttributes, insertPosition, conversionApi, options );
		}

		const viewPosition = conversionApi.mapper.toViewPosition( data.range.start );

		conversionApi.mapper.bindElements( table, asWidget ? tableWidget : tableElement );
		conversionApi.writer.insert( viewPosition, asWidget ? tableWidget : tableElement );
	}, { priority: 'normal' } );
}

/**
 * Model row element to view <tr> element conversion helper.
 *
 * This conversion helper creates whole <tr> element with child elements.
 *
 * @returns {Function} Conversion helper.
 */
export function downcastInsertRow( options = {} ) {
	return dispatcher => dispatcher.on( 'insert:tableRow', ( evt, data, conversionApi ) => {
		const tableRow = data.item;

		if ( !conversionApi.consumable.consume( tableRow, 'insert' ) ) {
			return;
		}

		const table = tableRow.parent;

		const tableElement = conversionApi.mapper.toViewElement( table );

		const row = table.getChildIndex( tableRow );

		const tableWalker = new TableWalker( table, { startRow: row, endRow: row } );

		const tableAttributes = {
			headingRows: parseInt( table.getAttribute( 'headingRows' ) || 0 ),
			headingColumns: parseInt( table.getAttribute( 'headingColumns' ) || 0 )
		};

		for ( const tableWalkerValue of tableWalker ) {
			const tableSection = getOrCreateTableSection( getSectionName( row, tableAttributes ), tableElement, conversionApi );
			const trElement = getOrCreateTr( tableRow, row, tableSection, conversionApi );

			// Consume table cell - it will be always consumed as we convert whole row at once.
			conversionApi.consumable.consume( tableWalkerValue.cell, 'insert' );

			const insertPosition = ViewPosition.createAt( trElement, 'end' );

			createViewTableCellElement( tableWalkerValue, tableAttributes, insertPosition, conversionApi, options );
		}
	}, { priority: 'normal' } );
}

/**
 * Model tableCEll element to view <td> or <th> element conversion helper.
 *
 * This conversion helper will create proper <th> elements for tableCells that are in heading section (heading row or column)
 * and <td> otherwise.
 *
 * @returns {Function} Conversion helper.
 */
export function downcastInsertCell( options = {} ) {
	return dispatcher => dispatcher.on( 'insert:tableCell', ( evt, data, conversionApi ) => {
		const tableCell = data.item;

		if ( !conversionApi.consumable.consume( tableCell, 'insert' ) ) {
			return;
		}

		const tableRow = tableCell.parent;
		const table = tableRow.parent;

		const tableWalker = new TableWalker( table );

		const tableAttributes = {
			headingRows: parseInt( table.getAttribute( 'headingRows' ) || 0 ),
			headingColumns: parseInt( table.getAttribute( 'headingColumns' ) || 0 )
		};

		// We need to iterate over a table in order to get proper row & column values from a walker
		for ( const tableWalkerValue of tableWalker ) {
			if ( tableWalkerValue.cell === tableCell ) {
				const trElement = conversionApi.mapper.toViewElement( tableRow );
				const insertPosition = ViewPosition.createAt( trElement, tableRow.getChildIndex( tableCell ) );

				createViewTableCellElement( tableWalkerValue, tableAttributes, insertPosition, conversionApi, options );

				// No need to iterate further.
				return;
			}
		}
	}, { priority: 'normal' } );
}

/**
 * Conversion helper that acts on headingRows table attribute change.
 *
 * This converter will:
 * - Rename <td> to <th> elements or vice versa depending on headings.
 * - Create <thead> or <tbody> elements if needed.
 * - Remove empty <thead> or <tbody> if needed.
 *
 * @returns {Function} Conversion helper.
 */
export function downcastTableHeadingRowsChange( options = {} ) {
	const asWidget = !!options.asWidget;

	return dispatcher => dispatcher.on( 'attribute:headingRows:table', ( evt, data, conversionApi ) => {
		const table = data.item;

		if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
			return;
		}

		const viewTable = conversionApi.mapper.toViewElement( table );

		const oldRows = data.attributeOldValue;
		const newRows = data.attributeNewValue;

		// The head section has grown so move rows from <tbody> to <thead>.
		if ( newRows > oldRows ) {
			// Filter out only those rows that are in wrong section.
			const rowsToMove = Array.from( table.getChildren() ).filter( ( { index } ) => isBetween( index, oldRows - 1, newRows ) );

			const viewTableHead = getOrCreateTableSection( 'thead', viewTable, conversionApi );
			moveViewRowsToTableSection( rowsToMove, viewTableHead, conversionApi, 'end' );

			// Rename all table cells from moved rows to 'th' as they lands in <thead>.
			for ( const tableRow of rowsToMove ) {
				for ( const tableCell of tableRow.getChildren() ) {
					renameViewTableCell( tableCell, 'th', conversionApi, asWidget );
				}
			}

			// Cleanup: this will remove any empty section from the view which may happen when moving all rows from a table section.
			removeTableSectionIfEmpty( 'tbody', viewTable, conversionApi );
		}
		// The head section has shrunk so move rows from <thead> to <tbody>.
		else {
			// Filter out only those rows that are in wrong section.
			const rowsToMove = Array.from( table.getChildren() )
				.filter( ( { index } ) => isBetween( index, newRows - 1, oldRows ) )
				.reverse(); // The rows will be moved from <thead> to <tbody> in reverse order at the beginning of a <tbody>.

			const viewTableBody = getOrCreateTableSection( 'tbody', viewTable, conversionApi );
			moveViewRowsToTableSection( rowsToMove, viewTableBody, conversionApi );

			// Check if cells moved from <thead> to <tbody> requires renaming to <td> as this depends on current heading columns attribute.
			const tableWalker = new TableWalker( table, { startRow: newRows ? newRows - 1 : newRows, endRow: oldRows - 1 } );

			const tableAttributes = {
				headingRows: parseInt( table.getAttribute( 'headingRows' ) || 0 ),
				headingColumns: parseInt( table.getAttribute( 'headingColumns' ) || 0 )
			};

			for ( const tableWalkerValue of tableWalker ) {
				renameViewTableCellIfRequired( tableWalkerValue, tableAttributes, conversionApi, asWidget );
			}

			// Cleanup: this will remove any empty section from the view which may happen when moving all rows from a table section.
			removeTableSectionIfEmpty( 'thead', viewTable, conversionApi );
		}

		function isBetween( index, lower, upper ) {
			return index > lower && index < upper;
		}
	}, { priority: 'normal' } );
}

/**
 * Conversion helper that acts on headingColumns table attribute change.
 *
 * Depending on changed attributes this converter will rename <td> to <th> elements or vice versa depending of cell column index.
 *
 * @returns {Function} Conversion helper.
 */
export function downcastTableHeadingColumnsChange( options = {} ) {
	const asWidget = !!options.asWidget;

	return dispatcher => dispatcher.on( 'attribute:headingColumns:table', ( evt, data, conversionApi ) => {
		const table = data.item;

		if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
			return;
		}

		const tableAttributes = {
			headingRows: parseInt( table.getAttribute( 'headingRows' ) || 0 ),
			headingColumns: parseInt( table.getAttribute( 'headingColumns' ) || 0 )
		};

		const oldColumns = data.attributeOldValue;
		const newColumns = data.attributeNewValue;

		const lastColumnToCheck = ( oldColumns > newColumns ? oldColumns : newColumns ) - 1;

		for ( const tableWalkerValue of new TableWalker( table ) ) {
			// Skip cells that were not in heading section before and after the change.
			if ( tableWalkerValue.column > lastColumnToCheck ) {
				continue;
			}

			renameViewTableCellIfRequired( tableWalkerValue, tableAttributes, conversionApi, asWidget );
		}
	}, { priority: 'normal' } );
}

/**
 * Conversion helper that acts on removed row.
 *
 * @returns {Function} Conversion helper.
 */
export function downcastRemoveRow() {
	return dispatcher => dispatcher.on( 'remove:tableRow', ( evt, data, conversionApi ) => {
		// Prevent default remove converter.
		evt.stop();

		const viewStart = conversionApi.mapper.toViewPosition( data.position ).getLastMatchingPosition( value => !value.item.is( 'tr' ) );
		const viewItem = viewStart.nodeAfter;
		const tableSection = viewItem.parent;

		// Remove associated <tr> from the view.
		const removeRange = ViewRange.createOn( viewItem );
		const removed = conversionApi.writer.remove( removeRange );

		for ( const child of ViewRange.createIn( removed ).getItems() ) {
			conversionApi.mapper.unbindViewElement( child );
		}

		// Check if table section has any children left - if not remove it from the view.
		if ( !tableSection.childCount ) {
			// No need to unbind anything as table section is not represented in the model.
			conversionApi.writer.remove( ViewRange.createOn( tableSection ) );
		}
	}, { priority: 'higher' } );
}

// Renames table cell in the view to given element name.
//
// @param {module:engine/model/element~Element} tableCell
// @param {String} desiredCellElementName
// @param {Object} conversionApi
// @param {Boolean} asWidget
function renameViewTableCell( tableCell, desiredCellElementName, conversionApi, asWidget ) {
	const viewCell = conversionApi.mapper.toViewElement( tableCell );

	let renamedCell;

	if ( asWidget ) {
		const editable = conversionApi.writer.createEditableElement( desiredCellElementName, viewCell.getAttributes() );
		renamedCell = toWidgetEditable( editable, conversionApi.writer );

		conversionApi.writer.insert( ViewPosition.createAfter( viewCell ), renamedCell );
		conversionApi.writer.move( ViewRange.createIn( viewCell ), ViewPosition.createAt( renamedCell ) );
		conversionApi.writer.remove( ViewRange.createOn( viewCell ) );
	} else {
		renamedCell = conversionApi.writer.rename( viewCell, desiredCellElementName );
	}

	conversionApi.mapper.bindElements( tableCell, renamedCell );
}

// Renames a table cell element in a view according to it's location in table.
//
// @param {module:table/tablewalker~TableWalkerValue} tableWalkerValue
// @param {{headingColumns, headingRows}} tableAttributes
// @param {Object} conversionApi
// @param {Boolean} asWidget
function renameViewTableCellIfRequired( tableWalkerValue, tableAttributes, conversionApi, asWidget ) {
	const { cell } = tableWalkerValue;

	// Check whether current columnIndex is overlapped by table cells from previous rows.
	const desiredCellElementName = getCellElementName( tableWalkerValue, tableAttributes );

	const viewCell = conversionApi.mapper.toViewElement( cell );

	// If in single change we're converting attribute changes and inserting cell the table cell might not be inserted into view
	// because of child conversion is done after parent.
	if ( viewCell && viewCell.name !== desiredCellElementName ) {
		renameViewTableCell( cell, desiredCellElementName, conversionApi, asWidget );
	}
}

// Creates a table cell element in a view.
//
// @param {module:table/tablewalker~TableWalkerValue} tableWalkerValue
// @param {module:engine/view/position~Position} insertPosition
// @param {Object} conversionApi
function createViewTableCellElement( tableWalkerValue, tableAttributes, insertPosition, conversionApi, options ) {
	const asWidget = options && options.asWidget;
	const cellElementName = getCellElementName( tableWalkerValue, tableAttributes );

	const cellElement = asWidget ?
		toWidgetEditable( conversionApi.writer.createEditableElement( cellElementName ), conversionApi.writer ) :
		conversionApi.writer.createContainerElement( cellElementName );

	const tableCell = tableWalkerValue.cell;

	conversionApi.mapper.bindElements( tableCell, cellElement );
	conversionApi.writer.insert( insertPosition, cellElement );
}

// Creates or returns an existing tr element from a view.
//
// @param {module:engine/view/element~Element} tableRow
// @param {Number} rowIndex
// @param {module:engine/view/element~Element} tableSection
// @param {Object} conversionApi
// @returns {module:engine/view/element~Element}
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

// Returns `th` for heading cells and `td` for other cells for current table walker value.
//
// @param {module:table/tablewalker~TableWalkerValue} tableWalkerValue
// @param {{headingColumns, headingRows}} tableAttributes
// @returns {String}
function getCellElementName( tableWalkerValue, tableAttributes ) {
	const { row, column } = tableWalkerValue;
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

// Returns table section name for current table walker value.
//
// @param {Number} row
// @param {{headingColumns, headingRows}} tableAttributes
// @returns {String}
function getSectionName( row, tableAttributes ) {
	return row < tableAttributes.headingRows ? 'thead' : 'tbody';
}

// Creates or returns an existing <tbody> or <thead> element witch caching.
//
// @param {String} sectionName
// @param {module:engine/view/element~Element} viewTable
// @param {Object} conversionApi
// @param {Object} cachedTableSection An object on which store cached elements.
// @returns {module:engine/view/containerelement~ContainerElement}
function getOrCreateTableSection( sectionName, viewTable, conversionApi ) {
	const viewTableSection = getExistingTableSectionElement( sectionName, viewTable );

	return viewTableSection ? viewTableSection : createTableSection( sectionName, viewTable, conversionApi );
}

// Finds an existing <tbody> or <thead> element or returns undefined.
//
// @param {String} sectionName
// @param {module:engine/view/element~Element} tableElement
// @param {Object} conversionApi
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
// @param {Object} conversionApi
// @returns {module:engine/view/containerelement~ContainerElement}
function createTableSection( sectionName, tableElement, conversionApi ) {
	const tableChildElement = conversionApi.writer.createContainerElement( sectionName );

	conversionApi.writer.insert( ViewPosition.createAt( tableElement, sectionName == 'tbody' ? 'end' : 'start' ), tableChildElement );

	return tableChildElement;
}

// Removes an existing <tbody> or <thead> element if it is empty.
//
// @param {String} sectionName
// @param {module:engine/view/element~Element} tableElement
// @param {Object} conversionApi
function removeTableSectionIfEmpty( sectionName, tableElement, conversionApi ) {
	const tableSection = getExistingTableSectionElement( sectionName, tableElement );

	if ( tableSection && tableSection.childCount === 0 ) {
		conversionApi.writer.remove( ViewRange.createOn( tableSection ) );
	}
}

// Moves view table rows associated with passed model rows to provided table section element.
//
// @param {Array.<module:engine/model/element~Element>} rowsToMove
// @param {module:engine/view/element~Element} viewTableSection
// @param {Object} conversionApi
// @param {Number|'end'|'before'|'after'} [offset=0] Offset or one of the flags.
function moveViewRowsToTableSection( rowsToMove, viewTableSection, conversionApi, offset ) {
	for ( const tableRow of rowsToMove ) {
		const viewTableRow = conversionApi.mapper.toViewElement( tableRow );

		conversionApi.writer.move( ViewRange.createOn( viewTableRow ), ViewPosition.createAt( viewTableSection, offset ) );
	}
}
