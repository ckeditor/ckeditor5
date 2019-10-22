/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecolumnrowproperties
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { downcastToStyle, upcastAttribute } from './tableproperties/utils';

/**
 * The table column row properties feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TableColumnRowProperties extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const model = editor.model;
		const schema = model.schema;
		const conversion = editor.conversion;

		// Table row attributes.
		schema.extend( 'tableRow', {
			allowAttributes: [ 'height' ]
		} );
		upcastAttribute( conversion, 'tableRow', 'height', 'height' );
		downcastToStyle( conversion, 'tableRow', 'height', 'height' );

		schema.extend( 'tableCell', {
			allowAttributes: [ 'width' ]
		} );
		upcastAttribute( conversion, 'tableCell', 'width', 'width' );
		downcastToStyle( conversion, 'tableCell', 'width', 'width' );
	}
}
