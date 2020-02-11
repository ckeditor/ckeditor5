/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableproperties/tablepropertiesediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { addBorderRules } from '@ckeditor/ckeditor5-engine/src/view/styles/border';
import { addBackgroundRules } from '@ckeditor/ckeditor5-engine/src/view/styles/background';

import TableEditing from './../tableediting';
import { downcastTableAttribute, upcastStyleToAttribute, upcastBorderStyles } from './../converters/tableproperties';
import { defaultColors } from '../ui/utils';
import TableBackgroundColorCommand from './commands/tablebackgroundcolorcommand';
import TableBorderColorCommand from './commands/tablebordercolorcommand';
import TableBorderStyleCommand from './commands/tableborderstylecommand';
import TableBorderWidthCommand from './commands/tableborderwidthcommand';
import TableWidthCommand from './commands/tablewidthcommand';
import TableHeightCommand from './commands/tableheightcommand';
import TableAlignmentCommand from './commands/tablealignmentcommand';

// RegExp used for matching margin style in converters.
const MARGIN_REG_EXP = /^(auto|0(%|[a-z]{2,4})?)$/;
const ALIGN_VALUES_REG_EXP = /^(left|right|center)$/;

/**
 * The table properties editing feature.
 *
 * Introduces table's model attributes and their conversion:
 *
 * - border: `borderStyle`, `borderColor` and `borderWidth`
 * - background color: `backgroundColor`
 * - horizontal alignment: `alignment`
 * - width & height: `width` & `height`
 *
 * It also registers commands used to manipulate the above attributes:
 *
 * - border: `'tableBorderStyle'`, `'tableBorderColor'` and `'tableBorderWidth'` commands
 * - background color: `'tableBackgroundColor'`
 * - horizontal alignment: `'tableAlignment'`
 * - width & height: `'tableWidth'` & `'tableHeight'`
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
	static get requires() {
		return [ TableEditing ];
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		editor.config.define( 'table.tableProperties', {
			border: {
				colors: defaultColors
			},
			backgroundColors: defaultColors
		} );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;
		const conversion = editor.conversion;
		const viewDoc = editor.editing.view.document;

		viewDoc.addStyleProcessorRules( addBorderRules );
		enableBorderProperties( schema, conversion );
		editor.commands.add( 'tableBorderColor', new TableBorderColorCommand( editor ) );
		editor.commands.add( 'tableBorderStyle', new TableBorderStyleCommand( editor ) );
		editor.commands.add( 'tableBorderWidth', new TableBorderWidthCommand( editor ) );

		enableAlignmentProperty( schema, conversion );
		editor.commands.add( 'tableAlignment', new TableAlignmentCommand( editor ) );

		enableProperty( schema, conversion, 'width', 'width' );
		editor.commands.add( 'tableWidth', new TableWidthCommand( editor ) );

		enableProperty( schema, conversion, 'height', 'height' );
		editor.commands.add( 'tableHeight', new TableHeightCommand( editor ) );

		viewDoc.addStyleProcessorRules( addBackgroundRules );
		enableProperty( schema, conversion, 'backgroundColor', 'background-color' );
		editor.commands.add( 'tableBackgroundColor', new TableBackgroundColorCommand( editor ) );
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

// Enables the `'alignment'` attribute for table.
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
					'margin-right': MARGIN_REG_EXP,
					'margin-left': MARGIN_REG_EXP
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
					align: ALIGN_VALUES_REG_EXP
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
	upcastStyleToAttribute( conversion, 'table', modelAttribute, styleName );
	downcastTableAttribute( conversion, modelAttribute, styleName );
}
