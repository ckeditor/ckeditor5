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
import TableUtils from './tableutils';

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
		return [ Table, TableCaption, TableUtils ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const conversion = editor.conversion;
		const tableUtils = editor.plugins.get( TableUtils );

		// Override default table data downcast converter.
		conversion.for( 'dataDowncast' ).elementToStructure( {
			model: {
				name: 'table',
				attributes: [ 'headingRows' ]
			},
			view: ( table, { writer } ) => {
				const headingRows = table.getAttribute( 'headingRows' ) || 0;
				const tableSections = [];

				// Table heading rows slot.
				if ( headingRows > 0 ) {
					tableSections.push(
						writer.createSlot( element => element.is( 'element', 'tableRow' ) && element.index < headingRows )
					);
				}

				// Table body rows slot.
				if ( headingRows < tableUtils.getRows( table ) ) {
					tableSections.push(
						writer.createSlot( element => element.is( 'element', 'tableRow' ) && element.index >= headingRows )
					);
				}

				// Table children slot.
				const childrenSlot = writer.createSlot( element => !element.is( 'element', 'tableRow' ) );

				// Create <table>{children-slot}{table-rows-slot}</table> structure.
				return writer.createContainerElement( 'table', null, [
					childrenSlot,
					writer.createContainerElement( 'tbody', null, tableSections )
				] );
			},
			converterPriority: 'high'
		} );

		// Make sure <caption> is always downcasted to <caption> in the data pipeline.
		editor.conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'caption',
			view: 'caption',
			converterPriority: 'high'
		} );
	}
}
