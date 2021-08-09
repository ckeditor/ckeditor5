/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/converters/downcast
 */

import TableWalker from './../tablewalker';
import { setHighlightHandling, toWidget, toWidgetEditable } from 'ckeditor5/src/widget';
import { toArray } from 'ckeditor5/src/utils';

/**
 * TODO
 */
export function downcastTable( tableUtils, options = {} ) {
	return ( table, conversionApi ) => {
		const asWidget = options && options.asWidget;

		const figureElement = conversionApi.writer.createContainerElement( 'figure', { class: 'table' } );
		const tableElement = conversionApi.writer.createContainerElement( 'table' );
		conversionApi.writer.insert( conversionApi.writer.createPositionAt( figureElement, 0 ), tableElement );

		let tableWidget;

		if ( asWidget ) {
			tableWidget = toTableWidget( figureElement, conversionApi.writer );
		}

		const tableAttributes = {
			headingRows: table.getAttribute( 'headingRows' ) || 0,
			headingColumns: table.getAttribute( 'headingColumns' ) || 0
		};

		// Table head slot.
		if ( tableAttributes.headingRows > 0 ) {
			const tableHead = conversionApi.writer.createContainerElement( 'thead' );

			const headSlot = conversionApi.slotFor(
				element => element.is( 'element', 'tableRow' ) && element.index < tableAttributes.headingRows
			);

			conversionApi.writer.insert( conversionApi.writer.createPositionAt( tableElement, 'end' ), tableHead );
			conversionApi.writer.insert( conversionApi.writer.createPositionAt( tableHead, 0 ), headSlot );
		}

		// Table body slot.
		if ( tableAttributes.headingRows < tableUtils.getRows( table ) ) {
			const tableBody = conversionApi.writer.createContainerElement( 'tbody' );

			const bodySlot = conversionApi.slotFor(
				element => element.is( 'element', 'tableRow' ) && element.index >= tableAttributes.headingRows
			);

			conversionApi.writer.insert( conversionApi.writer.createPositionAt( tableElement, 'end' ), tableBody );
			conversionApi.writer.insert( conversionApi.writer.createPositionAt( tableBody, 0 ), bodySlot );
		}

		// Slot for the rest (for example caption).
		const restSlot = conversionApi.slotFor( element => !element.is( 'element', 'tableRow' ) );

		conversionApi.writer.insert( conversionApi.writer.createPositionAt( figureElement, 'end' ), restSlot );

		return asWidget ? tableWidget : figureElement;
	};
}

/**
 * TODO
 */
export function downcastCell( options = {} ) {
	return ( tableCell, conversionApi ) => {
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
				return createViewTableCellElement( tableSlot, tableAttributes, conversionApi, options );
			}
		}
	};
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
export function convertParagraphInTableCell( options = {} ) {
	return ( modelElement, conversionApi ) => {
		const asWidget = options && options.asWidget;
		const { writer } = conversionApi;

		if ( !modelElement.parent.is( 'element', 'tableCell' ) ) {
			return;
		}

		if ( isSingleParagraphWithoutAttributes( modelElement ) ) {
			if ( asWidget ) {
				return writer.createContainerElement( 'span', { class: 'ck-table-bogus-paragraph' } );
			} else {
				// Additional requirement for data pipeline to have backward compatible data tables.
				conversionApi.consumable.consume( modelElement, 'insert' );
				conversionApi.mapper.bindElements( modelElement, conversionApi.mapper.toViewElement( modelElement.parent ) );

				return null;
			}
		}
	};
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

// Creates a table cell element in the view.
//
// @param {module:table/tablewalker~TableSlot} tableSlot
// TODO
// @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi
function createViewTableCellElement( tableSlot, tableAttributes, conversionApi, options ) {
	const asWidget = options && options.asWidget;
	const cellElementName = getCellElementName( tableSlot, tableAttributes );

	const cellElement = asWidget ?
		toWidgetEditable( conversionApi.writer.createEditableElement( cellElementName ), conversionApi.writer ) :
		conversionApi.writer.createContainerElement( cellElementName );

	if ( asWidget ) {
		setHighlightHandling(
			cellElement,
			conversionApi.writer,
			( element, descriptor, writer ) => writer.addClass( toArray( descriptor.classes ), element ),
			( element, descriptor, writer ) => writer.removeClass( toArray( descriptor.classes ), element )
		);
	}

	return cellElement;
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

// Checks if an element has any attributes set.
//
// @param {module:engine/model/element~Element element
// @returns {Boolean}
function hasAnyAttribute( element ) {
	return !![ ...element.getAttributeKeys() ].length;
}
