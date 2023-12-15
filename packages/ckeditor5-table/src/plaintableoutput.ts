/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/plaintableoutput
 */

import { Plugin, type Editor } from 'ckeditor5/src/core';
import type { DowncastWriter, Element, Node, ViewContainerElement } from 'ckeditor5/src/engine';

import Table from './table';
import TableUtils from './tableutils';

/**
 * The plain table output feature.
 */
export default class PlainTableOutput extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'PlainTableOutput' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ Table, TableUtils ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const tableUtils = editor.plugins.get( 'TableUtils' );

		// Override default table data downcast converter.
		editor.conversion.for( 'dataDowncast' ).elementToStructure( {
			model: 'table',
			view: ( modelElement, { writer } ) => {
				return downcastTableElement( modelElement, { writer }, tableUtils );
			},
			converterPriority: 'high'
		} );

		// Make sure table <caption> is downcasted into <caption> in the data pipeline when necessary.
		if ( editor.plugins.has( 'TableCaption' ) ) {
			editor.conversion.for( 'dataDowncast' ).elementToElement( {
				model: 'caption',
				view: ( modelElement, { writer } ) => {
					if ( modelElement.parent!.name === 'table' ) {
						return writer.createContainerElement( 'caption' );
					}
				},
				converterPriority: 'high'
			} );
		}

		// Handle border-style, border-color, border-width and background-color table attributes.
		if ( editor.plugins.has( 'TableProperties' ) ) {
			downcastTableBorderAndBackgroundAttributes( editor );
		}
	}
}

/**
 * The plain table downcast converter callback.
 *
 * @param table Table model element.
 * @param conversionApi The conversion API object.
 * @param tableUtils The Table Utils plugin instance.
 * @returns Created element.
 */
function downcastTableElement( table: Element, { writer }: { writer: DowncastWriter }, tableUtils: TableUtils ) {
	const headingRows = table.getAttribute( 'headingRows' ) || 0;

	// Table head rows slot.
	const headRowsSlot = writer.createSlot( ( element: Node ) =>
		element.is( 'element', 'tableRow' ) && element.index! < headingRows
	);

	// Table children slot.
	const childrenSlot = writer.createSlot( ( element: Node ) => !element.is( 'element', 'tableRow' ) );

	// Table <thead> element with all the heading rows.
	const theadElement = writer.createContainerElement( 'thead', null, headRowsSlot );

	// Table contents element containing <thead> and <tbody> when necessary.
	const tableContentElements: Array<ViewContainerElement> = [];

	if ( headingRows ) {
		tableContentElements.push( theadElement );
	}

	if ( headingRows < table.childCount ) {
		const rowGroupMap = tableUtils.getGroupedRows( table );
		for ( const key of rowGroupMap.keys() ) {
			// Table body row group slot.
			const bodyRowsSlot = writer.createSlot( ( element: Node ) =>
				element.is( 'element', 'tableRow' ) && element.index! >= headingRows && element.getAttribute( 'rowGroup' ) == key
			);

			// Table <tbody> element with all the rows for that group.
			const tbodyElement = writer.createContainerElement( 'tbody', null, bodyRowsSlot );

			tableContentElements.push( tbodyElement );
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
	return writer.createContainerElement( 'table', null, [ childrenSlot, ...tableContentElements ] );
}

/**
 * Register table border and background attributes converters.
 */
function downcastTableBorderAndBackgroundAttributes( editor: Editor ) {
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
