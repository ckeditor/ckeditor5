/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/tableediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';
import upcastTable from './converters/upcasttable';
import downcastTable from './converters/downcasttable';
import InsertTableCommand from './inserttablecommand';

/**
 * The table editing feature.
 *
 * @extends module:core/plugin~Plugin
 */
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
			allowAttributes: [ 'headingRows', 'headingColumns' ],
			isBlock: true,
			isObject: true
		} );

		schema.register( 'tableRow', {
			allowIn: 'table',
			allowAttributes: [],
			isBlock: true,
			isLimit: true
		} );

		schema.register( 'tableCell', {
			allowIn: 'tableRow',
			allowContentOf: '$block',
			allowAttributes: [ 'colspan', 'rowspan' ],
			isBlock: true,
			isLimit: true
		} );

		// Table conversion.
		conversion.for( 'upcast' ).add( upcastTable() );
		conversion.for( 'downcast' ).add( downcastTable() );

		// Table cell conversion.
		conversion.for( 'upcast' ).add( upcastElementToElement( { model: 'tableCell', view: 'td' } ) );
		conversion.for( 'upcast' ).add( upcastElementToElement( { model: 'tableCell', view: 'th' } ) );

		conversion.attributeToAttribute( { model: 'colspan', view: 'colspan' } );
		conversion.attributeToAttribute( { model: 'rowspan', view: 'rowspan' } );

		editor.commands.add( 'insertTable', new InsertTableCommand( editor ) );
	}
}
