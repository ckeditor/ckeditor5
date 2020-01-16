/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablepropertiesediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { addBorderRules } from '@ckeditor/ckeditor5-engine/src/view/styles/border';
import { addBackgroundRules } from '@ckeditor/ckeditor5-engine/src/view/styles/background';

import { downcastTableAttribute, upcastAttribute, upcastBorderStyles } from './tableproperties/utils';

/**
 * The table properties editing feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TablePropertiesEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TablePropertiesEditing';
	}

	/**
	 * @inheritDoc
	 */
	afterInit() {
		const editor = this.editor;
		const schema = editor.model.schema;
		const conversion = editor.conversion;
		const viewDoc = editor.editing.view.document;

		viewDoc.addStyleProcessorRules( addBorderRules );
		viewDoc.addStyleProcessorRules( addBackgroundRules );

		enableBorderProperties( schema, conversion );
		enableAlignmentProperty( schema, conversion );
		enableProperty( schema, conversion, 'width', 'width' );
		enableProperty( schema, conversion, 'height', 'height' );
		enableProperty( schema, conversion, 'backgroundColor', 'background-color' );
	}
}

// Enables `'borderStyle'`, `'borderColor'` and `'borderWidth'` attributes for table.
//
// @param {module:engine/model/schema~Schema} schema
// @param {module:engine/conversion/conversion~Conversion} conversion
function enableBorderProperties( schema, conversion ) {
	schema.extend( 'table', {
		allowAttributes: [ 'borderWidth', 'borderColor', 'borderStyle' ]
	} );
	upcastBorderStyles( conversion, 'table' );
	downcastTableAttribute( conversion, 'borderColor', 'border-color' );
	downcastTableAttribute( conversion, 'borderStyle', 'border-style' );
	downcastTableAttribute( conversion, 'borderWidth', 'border-width' );
}

// Enables `'alignment'` attribute for table.
//
// @param {module:engine/model/schema~Schema} schema
// @param {module:engine/conversion/conversion~Conversion} conversion
function enableAlignmentProperty( schema, conversion ) {
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

// Enables conversion for an attribute for simple view-model mappings.
//
// @param {String} modelAttribute
// @param {String} styleName
// @param {module:engine/model/schema~Schema} schema
// @param {module:engine/conversion/conversion~Conversion} conversion
function enableProperty( schema, conversion, modelAttribute, styleName ) {
	schema.extend( 'table', {
		allowAttributes: [ modelAttribute ]
	} );
	upcastAttribute( conversion, 'table', modelAttribute, styleName );
	downcastTableAttribute( conversion, modelAttribute, styleName );
}
