/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableproperties
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { downcastTableAttribute, upcastAttribute, upcastBorderStyles } from './tableproperties/utils';

/**
 * The table properties feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TableProperties extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TableProperties';
	}

	/**
	 * @inheritDoc
	 */
	afterInit() {
		const editor = this.editor;
		const schema = editor.model.schema;
		const conversion = editor.conversion;

		// Border
		schema.extend( 'table', {
			allowAttributes: [ 'borderWidth', 'borderColor', 'borderStyle' ]
		} );
		upcastBorderStyles( conversion, 'table' );
		downcastTableAttribute( conversion, 'borderColor', 'border-color' );
		downcastTableAttribute( conversion, 'borderStyle', 'border-style' );
		downcastTableAttribute( conversion, 'borderWidth', 'border-width' );

		// Background
		schema.extend( 'table', {
			allowAttributes: [ 'backgroundColor' ]
		} );
		upcastAttribute( conversion, 'table', 'backgroundColor', 'background-color' );
		downcastTableAttribute( conversion, 'backgroundColor', 'background-color' );

		// Width
		schema.extend( 'table', {
			allowAttributes: [ 'width' ]
		} );
		upcastAttribute( conversion, 'table', 'width', 'width' );
		downcastTableAttribute( conversion, 'width', 'width' );

		// Height
		schema.extend( 'table', {
			allowAttributes: [ 'height' ]
		} );
		upcastAttribute( conversion, 'table', 'height', 'height' );
		downcastTableAttribute( conversion, 'height', 'height' );
	}
}
