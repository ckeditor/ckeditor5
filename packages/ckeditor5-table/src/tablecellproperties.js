/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecellproperties
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { downcastToStyle, upcastAttribute, upcastBorderStyles } from './tableproperties/utils';

/**
 * The table cell properties feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TableCellProperties extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TableCellProperties';
	}

	/**
	 * @inheritDoc
	 */
	afterInit() {
		const editor = this.editor;
		const schema = editor.model.schema;
		const conversion = editor.conversion;

		this.enableBorderProperties( schema, conversion );
		this.enableBackgroundColorProperty( schema, conversion );
		this.enablePaddingProperty( schema, conversion );
		this.enableVerticalAlignmentProperty( schema, conversion );
		this.enableHorizontalAlignmentProperty( schema, conversion );
	}

	enableBorderProperties( schema, conversion ) {
		schema.extend( 'tableCell', {
			allowAttributes: [ 'borderWidth', 'borderColor', 'borderStyle' ]
		} );
		upcastBorderStyles( conversion, 'td' );
		upcastBorderStyles( conversion, 'th' );
		downcastToStyle( conversion, 'tableCell', 'borderStyle', 'border-style' );
		downcastToStyle( conversion, 'tableCell', 'borderColor', 'border-color' );
		downcastToStyle( conversion, 'tableCell', 'borderWidth', 'border-width' );
	}

	enableBackgroundColorProperty( schema, conversion ) {
		schema.extend( 'tableCell', {
			allowAttributes: [ 'backgroundColor' ]
		} );
		upcastAttribute( conversion, 'tableCell', 'backgroundColor', 'background-color' );
		downcastToStyle( conversion, 'tableCell', 'backgroundColor', 'background-color' );
	}

	enablePaddingProperty( schema, conversion ) {
		schema.extend( 'tableCell', {
			allowAttributes: [ 'padding' ]
		} );
		upcastAttribute( conversion, 'tableCell', 'padding', 'padding' );
		downcastToStyle( conversion, 'tableCell', 'padding', 'padding' );
	}

	enableVerticalAlignmentProperty( schema, conversion ) {
		schema.extend( 'tableCell', {
			allowAttributes: [ 'verticalAlignment' ]
		} );
		upcastAttribute( conversion, 'tableCell', 'verticalAlignment', 'vertical-align' );
		downcastToStyle( conversion, 'tableCell', 'verticalAlignment', 'vertical-align' );
	}

	enableHorizontalAlignmentProperty( schema, conversion ) {
		schema.extend( 'tableCell', {
			allowAttributes: [ 'horizontalAlignment' ]
		} );

		conversion.attributeToAttribute( {
			model: {
				name: 'tableCell',
				key: 'horizontalAlignment',
				values: [ 'left', 'right', 'center', 'justify' ]
			},
			view: {
				// TODO: controversial one but I don't know if we want "default".
				left: {
					key: 'style',
					value: {
						'text-align': 'left'
					}
				},
				right: {
					key: 'style',
					value: {
						'text-align': 'right'
					}
				},
				center: {
					key: 'style',
					value: {
						'text-align': 'center'
					}
				},
				justify: {
					key: 'style',
					value: {
						'text-align': 'justify'
					}
				}
			}
		} );
	}
}
