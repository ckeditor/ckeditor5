/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/tableediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';
import { createTableCell, createTableRow, downcastTableCell, downcastTable } from './converters';

export default class TablesEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;
		const conversion = editor.conversion;

		schema.register( 'table', {
			allowWhere: '$block',
			allowAttributes: [],
			isBlock: true,
			isObject: true
		} );

		schema.register( 'tableRow', {
			allowIn: 'table',
			allowAttributes: [ 'isHeading', 'isFooter' ],
			isBlock: true,
			isLimit: true
		} );

		schema.register( 'tableCell', {
			allowIn: 'tableRow',
			allowContentOf: '$block',
			allowAttributes: [ 'isHeading', 'colspan', 'rowspan' ],
			isBlock: true,
			isLimit: true
		} );

		// Table conversion.
		conversion.for( 'upcast' ).add( upcastElementToElement( { model: 'table', view: 'table' } ) );
		conversion.for( 'downcast' ).add( downcastTable );

		// Table row upcast only since downcast conversion is done in `downcastTable()`.
		conversion.for( 'upcast' ).add( upcastElementToElement( { model: createTableRow, view: 'tr' } ) );

		// Table cell conversion.
		conversion.for( 'upcast' ).add( upcastElementToElement( { model: createTableCell, view: 'td' } ) );
		conversion.for( 'upcast' ).add( upcastElementToElement( { model: createTableCell, view: 'th' } ) );
		conversion.for( 'downcast' ).add( downcastTableCell );

		conversion.attributeToAttribute( { model: 'colspan', view: 'colspan' } );
		conversion.attributeToAttribute( { model: 'rowspan', view: 'rowspan' } );
	}
}
