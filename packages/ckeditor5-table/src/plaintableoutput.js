/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/plaintableoutput
 */

import { Plugin } from 'ckeditor5/src/core';
import Table from './table';
import TableCaption from './tablecaption';
import TablePropertiesEditing from './tableproperties/tablepropertiesediting';

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
		return [ Table, TablePropertiesEditing, TableCaption ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		this._downcastTableElement();
		this._downcastCaptionElement();
		this._downcastTableBorderAttributes();
	}

	_downcastTableElement() {
		// Override default table data downcast converter.
		this.editor.conversion.for( 'dataDowncast' ).elementToStructure( {
			model: {
				name: 'table',
				attributes: [ 'headingRows' ]
			},
			view: ( table, { writer } ) => {
				// Table body rows slot.
				const rowsSlot = writer.createSlot( element => element.is( 'element', 'tableRow' ) );

				// Table children slot.
				const childrenSlot = writer.createSlot( element => !element.is( 'element', 'tableRow' ) );

				/**
				 * Create table structure.
				 *
				 * <table>
				 *   {children-slot-like-caption}
				 *   {table-rows-slot}
				 * </table>
				 */
				return writer.createContainerElement( 'table', null, [
					childrenSlot,
					writer.createContainerElement( 'tbody', null, rowsSlot )
				] );
			},
			converterPriority: 'high'
		} );
	}

	_downcastCaptionElement() {
		// Make sure <caption> is always downcasted to <caption> in the data pipeline.
		this.editor.conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'caption',
			view: 'caption',
			converterPriority: 'high'
		} );
	}

	_downcastTableBorderAttributes() {
		const modelAttributes = {
			'border-width': 'tableBorderWidth',
			'border-color': 'tableBorderColor',
			'border-style': 'tableBorderStyle'
		};

		for ( const [ styleName, modelAttribute ] of Object.entries( modelAttributes ) ) {
			this.editor.conversion.for( 'dataDowncast' ).add( dispatcher => {
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
}
