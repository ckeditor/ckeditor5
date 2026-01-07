/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/converters/downcast
 */

import { type Editor } from '@ckeditor/ckeditor5-core';
import { toWidget, toWidgetEditable } from '@ckeditor/ckeditor5-widget';
import type {
	ModelNode,
	ViewElement,
	ViewElementAttributes,
	ModelElement,
	ViewDowncastWriter,
	DowncastElementCreatorFunction,
	ViewContainerElement,
	DowncastConversionApi
} from '@ckeditor/ckeditor5-engine';

import { type TableUtils } from '../tableutils.js';
import type { TableConversionAdditionalSlot } from '../tableediting.js';
import { downcastTableAlignmentConfig, type TableAlignmentValues } from './tableproperties.js';
import { getNormalizedDefaultTableProperties } from '../utils/table-properties.js';
import { TableWalker } from '../tablewalker.js';
import { isTableHeaderCellType, type TableCellType } from '../tablecellproperties/tablecellpropertiesutils.js';

/**
 * Model table element to view table element conversion helper.
 *
 * @internal
 */
export function downcastTable( tableUtils: TableUtils, options: DowncastTableOptions ): DowncastElementCreatorFunction {
	return ( table, { writer } ) => {
		const headingRows = table.getAttribute( 'headingRows' ) as number || 0;
		const tableElement = writer.createContainerElement( 'table', null, [] );
		const figureElement = writer.createContainerElement( 'figure', { class: 'table' }, tableElement );

		// Table head slot.
		if ( headingRows > 0 ) {
			writer.insert(
				writer.createPositionAt( tableElement, 'end' ),
				writer.createContainerElement(
					'thead',
					null,
					writer.createSlot( element => element.is( 'element', 'tableRow' ) && element.index! < headingRows )
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
					writer.createSlot( element => element.is( 'element', 'tableRow' ) && element.index! >= headingRows )
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
 * @internal
 * @returns Element creator.
 */
export function downcastRow(): DowncastElementCreatorFunction {
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
 * @internal
 * @param options.asWidget If set to `true`, the downcast conversion will produce a widget.
 * @param options.cellTypeEnabled If returns `true`, the downcast conversion will use the `tableCellType` attribute to determine cell type.
 * @returns Element creator.
 */
export function downcastCell( options: { asWidget?: boolean; cellTypeEnabled: () => boolean } ): DowncastElementCreatorFunction {
	return ( tableCell, { writer } ) => {
		// If the table cell type feature is enabled, then we can simply check the cell type attribute.
		if ( options.cellTypeEnabled?.() ) {
			const tableCellType = tableCell.getAttribute( 'tableCellType' ) as TableCellType;
			const cellElementName: 'td' | 'th' = (
				isTableHeaderCellType( tableCellType ) ?
					'th' :
					'td'
			);

			return createCellElement( writer, cellElementName );
		}

		// If the table cell type feature is not enabled, we should iterate through the table structure
		// to determine whether the cell is in the heading section.
		const tableRow = tableCell.parent as ModelElement;
		const table = tableRow.parent as ModelElement;
		const rowIndex = table.getChildIndex( tableRow )!;

		const tableWalker = new TableWalker( table, { row: rowIndex } );
		const headingRows = table.getAttribute( 'headingRows' ) as number || 0;
		const headingColumns = table.getAttribute( 'headingColumns' ) as number || 0;

		let result: ViewElement | null = null;

		// We need to iterate over a table in order to get proper row & column values from a walker.
		for ( const tableSlot of tableWalker ) {
			if ( tableSlot.cell == tableCell ) {
				const isHeading = tableSlot.row < headingRows || tableSlot.column < headingColumns;

				result = createCellElement( writer, isHeading ? 'th' : 'td' );
				break;
			}
		}

		return result;
	};

	function createCellElement( writer: ViewDowncastWriter, name: string ) {
		return (
			options.asWidget ?
				toWidgetEditable( writer.createEditableElement( name ), writer, { withAriaRole: false } ) :
				writer.createContainerElement( name )
		);
	}
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
 * @internal
 * @param options.asWidget If set to `true`, the downcast conversion will produce a widget.
 * @returns Element creator.
 */
export function convertParagraphInTableCell( options: { asWidget?: boolean } = {} ): DowncastElementCreatorFunction {
	return ( modelElement, { writer } ) => {
		if ( !modelElement.parent!.is( 'element', 'tableCell' ) ) {
			return null;
		}

		if ( !isSingleParagraphWithoutAttributes( modelElement ) ) {
			return null;
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
 * @internal
 */
export function isSingleParagraphWithoutAttributes( modelElement: ModelElement ): boolean {
	const tableCell = modelElement.parent!;

	const isSingleParagraph = tableCell.childCount == 1;

	return isSingleParagraph && !hasAnyAttribute( modelElement );
}

/**
 * Converts a given {@link module:engine/view/element~ViewElement} to a table widget:
 * * Adds a {@link module:engine/view/element~ViewElement#_setCustomProperty custom property}
 * allowing to recognize the table widget element.
 * * Calls the {@link module:widget/utils~toWidget} function with the proper element's label creator.
 *
 * @param writer An instance of the view writer.
 * @param label The element's label. It will be concatenated with the table `alt` attribute if one is present.
 */
function toTableWidget( viewElement: ViewElement, writer: ViewDowncastWriter ): ViewElement {
	writer.setCustomProperty( 'table', true, viewElement );

	return toWidget( viewElement, writer, { hasSelectionHandle: true } );
}

/**
 * Checks if an element has any attributes set.
 */
function hasAnyAttribute( element: ModelNode ): boolean {
	for ( const attributeKey of element.getAttributeKeys() ) {
		// Ignore selection attributes stored on block elements.
		if ( attributeKey.startsWith( 'selection:' ) || attributeKey == 'htmlEmptyBlock' ) {
			continue;
		}

		return true;
	}

	return false;
}

/**
 * Downcasts a plain table (also used in the clipboard pipeline).
 */
export function convertPlainTable( editor: Editor ): DowncastElementCreatorFunction {
	return ( table, conversionApi ) => {
		if ( !conversionApi.options.isClipboardPipeline && !editor.plugins.has( 'PlainTableOutput' ) ) {
			return null;
		}

		return downcastPlainTable( table, conversionApi, editor );
	};
}

/**
 * Downcasts a plain table caption (also used in the clipboard pipeline).
 */
export function convertPlainTableCaption( editor: Editor ): DowncastElementCreatorFunction {
	return ( modelElement, { writer, options } ) => {
		if ( !options.isClipboardPipeline && !editor.plugins.has( 'PlainTableOutput' ) ) {
			return null;
		}

		if ( modelElement.parent!.name === 'table' ) {
			return writer.createContainerElement( 'caption' );
		}

		return null;
	};
}

/**
 * Downcasts a plain table.
 *
 * @param table Table model element.
 * @param conversionApi The conversion API object.
 * @param editor The editor instance.
 * @returns Created element.
 */
export function downcastPlainTable(
	table: ModelElement,
	conversionApi: DowncastConversionApi,
	editor: Editor
): ViewElement {
	const writer = conversionApi.writer;
	const headingRows = table.getAttribute( 'headingRows' ) as number || 0;

	// Table head rows slot.
	const headRowsSlot = writer.createSlot( ( element: ModelNode ) =>
		element.is( 'element', 'tableRow' ) && element.index! < headingRows
	);

	// Table body rows slot.
	const bodyRowsSlot = writer.createSlot( ( element: ModelNode ) =>
		element.is( 'element', 'tableRow' ) && element.index! >= headingRows
	);

	// Table children slot.
	const childrenSlot = writer.createSlot( ( element: ModelNode ) => !element.is( 'element', 'tableRow' ) );

	// Table <thead> element with all the heading rows.
	const theadElement = writer.createContainerElement( 'thead', null, headRowsSlot );

	// Table <tbody> element with all the body rows.
	const tbodyElement = writer.createContainerElement( 'tbody', null, bodyRowsSlot );

	// Table contents element containing <thead> and <tbody> when necessary.
	const tableContentElements: Array<ViewContainerElement> = [];

	if ( headingRows ) {
		tableContentElements.push( theadElement );
	}

	if ( headingRows < table.childCount ) {
		tableContentElements.push( tbodyElement );
	}

	const tableAttributes: ViewElementAttributes = { class: 'table' };

	if ( editor.plugins.has( 'TablePropertiesEditing' ) && conversionApi.options.isClipboardPipeline ) {
		const defaultTableProperties = getNormalizedDefaultTableProperties(
			editor.config.get( 'table.tableProperties.defaultProperties' )!,
			{
				includeAlignmentProperty: true
			}
		);

		const tableAlignment = table.getAttribute( 'tableAlignment' ) as TableAlignmentValues | undefined;

		let localDefaultValue = defaultTableProperties.alignment;

		if ( table.getAttribute( 'tableType' ) === 'layout' ) {
			localDefaultValue = '';
		}

		const tableAlignmentValue = tableAlignment || localDefaultValue as TableAlignmentValues | undefined;

		if ( tableAlignmentValue ) {
			tableAttributes.class += ' ' + downcastTableAlignmentConfig[ tableAlignmentValue ].className;
			tableAttributes.style = downcastTableAlignmentConfig[ tableAlignmentValue ].style;

			if ( downcastTableAlignmentConfig[ tableAlignmentValue ].align !== undefined ) {
				tableAttributes.align = downcastTableAlignmentConfig[ tableAlignmentValue ].align;
			}
		}
	}

	// Create table structure.
	//
	// <table>
	//    {children-slot-like-caption}
	//    <thead>
	//        {table-head-rows-slot}
	//    </thead>
	//    <tbody>
	//        {table-body-rows-slot}
	//    </tbody>
	// </table>
	return writer.createContainerElement( 'table', tableAttributes, [ childrenSlot, ...tableContentElements ] );
}

/**
 * Registers border and background attributes converters for plain tables or when the clipboard pipeline is used.
 */
export function downcastTableBorderAndBackgroundAttributes( editor: Editor ): void {
	const modelAttributes = {
		'border-width': 'tableBorderWidth',
		'border-color': 'tableBorderColor',
		'border-style': 'tableBorderStyle',
		'background-color': 'tableBackgroundColor'
	};

	for ( const [ styleName, modelAttribute ] of Object.entries( modelAttributes ) ) {
		editor.conversion.for( 'dataDowncast' ).add( dispatcher => {
			return dispatcher.on( `attribute:${ modelAttribute }:table`, ( evt, data, conversionApi ) => {
				const { item, attributeNewValue } = data;
				const { mapper, writer } = conversionApi;

				if ( !conversionApi.options.isClipboardPipeline && !editor.plugins.has( 'PlainTableOutput' ) ) {
					return;
				}

				if ( !conversionApi.consumable.consume( item, evt.name ) ) {
					return;
				}

				const table = mapper.toViewElement( item );

				if ( attributeNewValue ) {
					writer.setStyle( styleName, attributeNewValue, table );
				} else {
					writer.removeStyle( styleName, table );
				}
			}, { priority: 'high' } );
		} );
	}
}

/**
 * Options for the downcast table conversion.
 *
 * @internal
 */
export interface DowncastTableOptions {

	/**
	 * If set to `true`, the downcast conversion will produce a widget.
	 */
	asWidget?: boolean;

	/**
	 * Array of additional slot handlers.
	 */
	additionalSlots: Array<TableConversionAdditionalSlot>;
}
