/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/plaintableoutput
 */

import { Plugin } from 'ckeditor5/src/core';
import Table from './table';

/**
 * The plain table output feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class PlainTableOutput extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'PlainTableOutput';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ Table ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
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
					if ( modelElement.parent.name === 'table' ) {
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

// The plain table downcast converter callback.
//
// @private
// @param {module:engine/model/element~Element} Table model element.
// @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi The conversion API object.
// @returns {module:engine/view/containerelement~ContainerElement} Created element.
function downcastTableElement( table, { writer } ) {
	const headingRows = table.getAttribute( 'headingRows' ) || 0;

	// Table head rows slot.
	const headRowsSlot = writer.createSlot( element =>
		element.is( 'element', 'tableRow' ) && element.index < headingRows
	);

	// Table body rows slot.
	const bodyRowsSlot = writer.createSlot( element =>
		element.is( 'element', 'tableRow' ) && element.index >= headingRows
	);

	// Table children slot.
	const childrenSlot = writer.createSlot( element => !element.is( 'element', 'tableRow' ) );

	// Table <thead> element with all the heading rows.
	const theadElement = writer.createContainerElement( 'thead', null, headRowsSlot );

	// Table <tbody> element with all the body rows.
	const tbodyElement = writer.createContainerElement( 'tbody', null, bodyRowsSlot );

	// Table contents element containing <thead> and <tbody> when necessary.
	const tableContentElements = [];

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
	return writer.createContainerElement( 'table', null, [ childrenSlot, ...tableContentElements ] );
}

// Register table border and background attributes converters.
//
// @private
// @param {module:core/editor/editor~Editor} editor
function downcastTableBorderAndBackgroundAttributes( editor ) {
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
