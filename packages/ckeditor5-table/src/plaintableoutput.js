/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/plaintableoutput
 */

import { Plugin } from 'ckeditor5/src/core';

import TableUtils from './tableutils';
import { isTable } from './tablecaption/utils';

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
		return [ TableUtils ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const conversion = editor.conversion;
		const tableUtils = editor.plugins.get( TableUtils );

		function downcastTable() {
			return ( table, { writer } ) => {
				const headingRows = table.getAttribute( 'headingRows' ) || 0;
				const tableSections = [];

				// Table head slot.
				if ( headingRows > 0 ) {
					tableSections.push(
						writer.createContainerElement( 'thead', null,
							writer.createSlot( element => element.is( 'element', 'tableRow' ) && element.index < headingRows )
						)
					);
				}

				// Table body slot.
				if ( headingRows < tableUtils.getRows( table ) ) {
					tableSections.push(
						writer.createContainerElement( 'tbody', null,
							writer.createSlot( element => element.is( 'element', 'tableRow' ) && element.index >= headingRows )
						)
					);
				}

				const tableElement = writer.createContainerElement( 'table', null, [
					// Slot for the children (for example caption).
					writer.createSlot( element => !element.is( 'element', 'tableRow' ) ),
					// Table with proper sections (thead, tbody).
					...tableSections
				] );

				return tableElement;
			};
		}

		conversion.for( 'dataDowncast' ).elementToStructure( {
			model: {
				name: 'table',
				attributes: [ 'headingRows' ]
			},
			view: downcastTable( tableUtils ),
			converterPriority: 'high'
		} );

		editor.conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'caption',
			view: ( modelElement, { writer } ) => {
				if ( !isTable( modelElement.parent ) ) {
					return null;
				}

				return writer.createContainerElement( 'caption' );
			},
			converterPriority: 'high'
		} );
	}
}
