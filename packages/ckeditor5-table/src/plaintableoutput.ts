/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/plaintableoutput
 */

import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import type { DowncastWriter, Element, Node, ViewContainerElement, UpcastElementEvent } from 'ckeditor5/src/engine.js';

import Table from './table.js';

/**
 * The plain table output feature.
 *
 * This feature strips the `<figure>` tag from the table data. This is because this tag is not supported
 * by most popular email clients and removing it ensures compatibility.
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
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ Table ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		// Override default table data downcast converter.
		editor.conversion.for( 'dataDowncast' ).elementToStructure( {
			model: 'table',
			view: downcastTableElement,
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

		editor.conversion.for( 'upcast' ).add( dispatcher => {
			dispatcher.on<UpcastElementEvent>( 'element:table', ( evt, data, conversionApi ) => {
				// It's not necessary to upcast the `table` class. This class was only added in data downcast
				// to center a plain table in the editor output.
				// See: https://github.com/ckeditor/ckeditor5/issues/17888.
				conversionApi.consumable.consume( data.viewItem, { classes: 'table' } );
			} );
		} );
	}
}

/**
 * The plain table downcast converter callback.
 *
 * @param table Table model element.
 * @param conversionApi The conversion API object.
 * @returns Created element.
 */
function downcastTableElement( table: Element, { writer }: { writer: DowncastWriter } ) {
	const headingRows = table.getAttribute( 'headingRows' ) as number || 0;

	// Table head rows slot.
	const headRowsSlot = writer.createSlot( ( element: Node ) =>
		element.is( 'element', 'tableRow' ) && element.index! < headingRows
	);

	// Table body rows slot.
	const bodyRowsSlot = writer.createSlot( ( element: Node ) =>
		element.is( 'element', 'tableRow' ) && element.index! >= headingRows
	);

	// Table children slot.
	const childrenSlot = writer.createSlot( ( element: Node ) => !element.is( 'element', 'tableRow' ) );

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
	return writer.createContainerElement( 'table', { class: 'table' }, [ childrenSlot, ...tableContentElements ] );
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
