/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
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
 * @param {module:table/tableutils~TableUtils} tableUtils The `TableUtils` plugin instance.
 * @param {Object} [options]
 * @param {Boolean} [options.asWidget] If set to `true`, the downcast conversion will produce a widget.
 * @param {Array.<module:table/tablediting~AdditionalSlot>} [options.additionalSlots] Array of additional slot handlers.
 * @returns {Function} Element creator.
 */
export function downcastTable( tableUtils, options ) {
	return ( table, { writer } ) => {
		const headingRows = table.getAttribute( 'headingRows' ) || 0;
		const tableElement = writer.createContainerElement( 'table', null, [] );
		const figureElement = writer.createContainerElement( 'figure', { class: 'table' }, tableElement );

		// Table head slot.
		if ( headingRows > 0 ) {
			writer.insert(
				writer.createPositionAt( tableElement, 'end' ),
				writer.createContainerElement(
					'thead',
					null,
					writer.createSlot( element => element.is( 'element', 'tableRow' ) && element.index < headingRows )
				)
			);
		}

		// Table body slot.
		if ( headingRows < tableUtils.getRows( table ) ) {
			writer.insert(
				writer.createPositionAt( tableElement, 'end' ),
				writer.createContainerElement(
					'tbody',
					null,
					writer.createSlot( element => element.is( 'element', 'tableRow' ) && element.index >= headingRows )
				)
			);
		}

		// Dynamic slots.
		for ( const { positionOffset, filter } of options.additionalSlots ) {
			writer.insert(
				writer.createPositionAt( tableElement, positionOffset ),
				writer.createSlot( filter )
			);
		}

		// Create a slot with items that don't fit into the table.
		writer.insert(
			writer.createPositionAt( tableElement, 'after' ),
			writer.createSlot( element => {
				if ( element.is( 'element', 'tableRow' ) ) {
					return false;
				}

				return !options.additionalSlots.some( ( { filter } ) => filter( element ) );
			} )
		);

		return options.asWidget ? toTableWidget( figureElement, writer ) : figureElement;
	};
}

/**
 * Model table row element to view `<tr>` element conversion helper.
 *
 * @returns {Function} Element creator.
 */
export function downcastRow() {
	return ( tableRow, { writer } ) => {
		return tableRow.isEmpty ?
			writer.createEmptyElement( 'tr' ) :
			writer.createContainerElement( 'tr' );
	};
}

/**
 * Model table cell element to view `<td>` or `<th>` element conversion helper.
 *
 * This conversion helper will create proper `<th>` elements for table cells that are in the heading section (heading row or column)
 * and `<td>` otherwise.
 *
 * @param {Object} [options]
 * @param {Boolean} [options.asWidget] If set to `true`, the downcast conversion will produce a widget.
 * @returns {Function} Element creator.
 */
export function downcastCell( options = {} ) {
	return ( tableCell, { writer } ) => {
		const tableRow = tableCell.parent;
		const table = tableRow.parent;
		const rowIndex = table.getChildIndex( tableRow );

		const tableWalker = new TableWalker( table, { row: rowIndex } );
		const headingRows = table.getAttribute( 'headingRows' ) || 0;
		const headingColumns = table.getAttribute( 'headingColumns' ) || 0;

		// We need to iterate over a table in order to get proper row & column values from a walker.
		for ( const tableSlot of tableWalker ) {
			if ( tableSlot.cell == tableCell ) {
				const isHeading = tableSlot.row < headingRows || tableSlot.column < headingColumns;
				const cellElementName = isHeading ? 'th' : 'td';

				return options.asWidget ?
					toWidgetEditable( writer.createEditableElement( cellElementName ), writer ) :
					writer.createContainerElement( cellElementName );
			}
		}
	};
}

/**
 * Overrides paragraph inside table cell conversion.
 *
 * This converter:
 * * should be used to override default paragraph conversion.
 * * It will only convert `<paragraph>` placed directly inside `<tableCell>`.
 * * For a single paragraph without attributes it returns `<span>` to simulate data table.
 * * For all other cases it returns `<p>` element.
 *
 * @param {Object} [options]
 * @param {Boolean} [options.asWidget] If set to `true`, the downcast conversion will produce a widget.
 * @returns {Function} Element creator.
 */
export function convertParagraphInTableCell( options = {} ) {
	return ( modelElement, { writer } ) => {
		if ( !modelElement.parent.is( 'element', 'tableCell' ) ) {
			return;
		}

		if ( !isSingleParagraphWithoutAttributes( modelElement ) ) {
			return;
		}

		if ( options.asWidget ) {
			return writer.createContainerElement( 'span', { class: 'ck-table-bogus-paragraph' } );
		} else {
			// Using `<p>` in case there are some markers on it and transparentRendering will render it anyway.
			const viewElement = writer.createContainerElement( 'p' );

			writer.setCustomProperty( 'dataPipeline:transparentRendering', true, viewElement );

			return viewElement;
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

	const isSingleParagraph = tableCell.childCount == 1;

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

// Checks if an element has any attributes set.
//
// @param {module:engine/model/element~Element element
// @returns {Boolean}
function hasAnyAttribute( element ) {
	return !![ ...element.getAttributeKeys() ].length;
}
