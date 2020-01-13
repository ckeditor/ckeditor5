/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableproperties
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import TablePropertiesUI from './tablepropertiesui';
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
	static get requires() {
		return [ TablePropertiesUI ];
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
		this.enableWidthProperty( schema, conversion );
		this.enableHeightProperty( schema, conversion );
		this.enableAlignmentProperty( schema, conversion );
	}

	enableBorderProperties( schema, conversion ) {
		schema.extend( 'table', {
			allowAttributes: [ 'borderWidth', 'borderColor', 'borderStyle' ]
		} );
		upcastBorderStyles( conversion, 'table' );
		downcastTableAttribute( conversion, 'borderColor', 'border-color' );
		downcastTableAttribute( conversion, 'borderStyle', 'border-style' );
		downcastTableAttribute( conversion, 'borderWidth', 'border-width' );
	}

	enableBackgroundColorProperty( schema, conversion ) {
		schema.extend( 'table', {
			allowAttributes: [ 'backgroundColor' ]
		} );
		upcastAttribute( conversion, 'table', 'backgroundColor', 'background-color' );
		downcastTableAttribute( conversion, 'backgroundColor', 'background-color' );
	}

	enableWidthProperty( schema, conversion ) {
		schema.extend( 'table', {
			allowAttributes: [ 'width' ]
		} );
		upcastAttribute( conversion, 'table', 'width', 'width' );
		downcastTableAttribute( conversion, 'width', 'width' );
	}

	enableHeightProperty( schema, conversion ) {
		schema.extend( 'table', {
			allowAttributes: [ 'height' ]
		} );
		upcastAttribute( conversion, 'table', 'height', 'height' );
		downcastTableAttribute( conversion, 'height', 'height' );
	}

	enableAlignmentProperty( schema, conversion ) {
		schema.extend( 'table', {
			allowAttributes: [ 'alignment' ]
		} );
		conversion.for( 'upcast' )
			.attributeToAttribute( {
				view: {
					styles: {
						'margin-right': /^(auto|0(%|[a-z]{2,4})?)$/,
						'margin-left': /^(auto|0(%|[a-z]{2,4})?)$/
					}
				},
				model: {
					name: 'table',
					key: 'alignment',
					value: viewElement => {
						// At this point we only have auto or 0 value (with a unit).
						if ( viewElement.getStyle( 'margin-right' ) != 'auto' ) {
							return 'right';
						}

						if ( viewElement.getStyle( 'margin-left' ) != 'auto' ) {
							return 'left';
						}

						return 'center';
					}
				}
			} )
			// Support for backwards compatibility and pasting from other sources.
			.attributeToAttribute( {
				view: {
					attributes: {
						align: /^(left|right|center)$/
					}
				},
				model: {
					name: 'table',
					key: 'alignment',
					value: viewElement => viewElement.getAttribute( 'align' )
				}
			} );
		conversion.for( 'downcast' ).add( dispatcher => dispatcher.on( 'attribute:alignment:table', ( evt, data, conversionApi ) => {
			const { item, attributeNewValue } = data;
			const { mapper, writer } = conversionApi;

			const table = [ ...mapper.toViewElement( item ).getChildren() ].find( child => child.is( 'table' ) );

			if ( !attributeNewValue ) {
				writer.removeStyle( 'margin-left', table );
				writer.removeStyle( 'margin-right', table );

				return;
			}

			const styles = {
				'margin-right': 'auto',
				'margin-left': 'auto'
			};

			if ( attributeNewValue == 'left' ) {
				styles[ 'margin-left' ] = '0';
			}

			if ( attributeNewValue == 'right' ) {
				styles[ 'margin-right' ] = '0';
			}

			writer.setStyle( styles, table );
		} ) );
	}
}
