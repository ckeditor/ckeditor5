/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableproperties/tablepropertiesediting
 */

import { Plugin } from 'ckeditor5/src/core';
import { addBackgroundRules, addBorderRules } from 'ckeditor5/src/engine';

import TableEditing from '../tableediting';
import {
	downcastAttributeToStyle,
	downcastTableAttribute,
	upcastBorderStyles,
	upcastStyleToAttribute
} from '../converters/tableproperties';
import TableBackgroundColorCommand from './commands/tablebackgroundcolorcommand';
import TableBorderColorCommand from './commands/tablebordercolorcommand';
import TableBorderStyleCommand from './commands/tableborderstylecommand';
import TableBorderWidthCommand from './commands/tableborderwidthcommand';
import TableWidthCommand from './commands/tablewidthcommand';
import TableHeightCommand from './commands/tableheightcommand';
import TableAlignmentCommand from './commands/tablealignmentcommand';
import { getNormalizedDefaultProperties } from '../utils/table-properties';

const ALIGN_VALUES_REG_EXP = /^(left|center|right)$/;
const FLOAT_VALUES_REG_EXP = /^(left|none|right)$/;

/**
 * The table properties editing feature.
 *
 * Introduces table's model attributes and their conversion:
 *
 * - border: `tableBorderStyle`, `tableBorderColor` and `tableBorderWidth`
 * - background color: `tableBackgroundColor`
 * - horizontal alignment: `tableAlignment`
 * - width & height: `tableWidth` & `tableHeight`
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
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;
		const conversion = editor.conversion;

		editor.config.define( 'table.tableProperties.defaultProperties', {} );

		const defaultTableProperties = getNormalizedDefaultProperties( editor.config.get( 'table.tableProperties.defaultProperties' ), {
			includeAlignmentProperty: true
		} );

		editor.data.addStyleProcessorRules( addBorderRules );
		enableBorderProperties( schema, conversion, {
			color: defaultTableProperties.borderColor,
			style: defaultTableProperties.borderStyle,
			width: defaultTableProperties.borderWidth
		} );
		editor.commands.add( 'tableBorderColor', new TableBorderColorCommand( editor, defaultTableProperties.borderColor ) );
		editor.commands.add( 'tableBorderStyle', new TableBorderStyleCommand( editor, defaultTableProperties.borderStyle ) );
		editor.commands.add( 'tableBorderWidth', new TableBorderWidthCommand( editor, defaultTableProperties.borderWidth ) );

		enableAlignmentProperty( schema, conversion, defaultTableProperties.alignment );
		editor.commands.add( 'tableAlignment', new TableAlignmentCommand( editor, defaultTableProperties.alignment ) );

		enableTableToFigureProperty( schema, conversion, {
			modelAttribute: 'tableWidth',
			styleName: 'width',
			defaultValue: defaultTableProperties.width
		} );
		editor.commands.add( 'tableWidth', new TableWidthCommand( editor, defaultTableProperties.width ) );

		enableTableToFigureProperty( schema, conversion, {
			modelAttribute: 'tableHeight',
			styleName: 'height',
			defaultValue: defaultTableProperties.height
		} );
		editor.commands.add( 'tableHeight', new TableHeightCommand( editor, defaultTableProperties.height ) );

		editor.data.addStyleProcessorRules( addBackgroundRules );
		enableProperty( schema, conversion, {
			modelAttribute: 'tableBackgroundColor',
			styleName: 'background-color',
			defaultValue: defaultTableProperties.backgroundColor
		} );
		editor.commands.add(
			'tableBackgroundColor',
			new TableBackgroundColorCommand( editor, defaultTableProperties.backgroundColor )
		);
	}
}

// Enables `tableBorderStyle'`, `tableBorderColor'` and `tableBorderWidth'` attributes for table.
//
// @param {module:engine/model/schema~Schema} schema
// @param {module:engine/conversion/conversion~Conversion} conversion
// @param {Object} defaultBorder The default border values.
// @param {String} defaultBorder.color The default `tableBorderColor` value.
// @param {String} defaultBorder.style The default `tableBorderStyle` value.
// @param {String} defaultBorder.width The default `tableBorderWidth` value.
function enableBorderProperties( schema, conversion, defaultBorder ) {
	const modelAttributes = {
		width: 'tableBorderWidth',
		color: 'tableBorderColor',
		style: 'tableBorderStyle'
	};

	schema.extend( 'table', {
		allowAttributes: Object.values( modelAttributes )
	} );

	upcastBorderStyles( conversion, 'table', modelAttributes, defaultBorder );

	downcastTableAttribute( conversion, { modelAttribute: modelAttributes.color, styleName: 'border-color' } );
	downcastTableAttribute( conversion, { modelAttribute: modelAttributes.style, styleName: 'border-style' } );
	downcastTableAttribute( conversion, { modelAttribute: modelAttributes.width, styleName: 'border-width' } );
}

// Enables the `'alignment'` attribute for table.
//
// @param {module:engine/model/schema~Schema} schema
// @param {module:engine/conversion/conversion~Conversion} conversion
// @param {String} defaultValue The default alignment value.
function enableAlignmentProperty( schema, conversion, defaultValue ) {
	schema.extend( 'table', {
		allowAttributes: [ 'tableAlignment' ]
	} );

	conversion.for( 'downcast' )
		.attributeToAttribute( {
			model: {
				name: 'table',
				key: 'tableAlignment'
			},
			view: alignment => ( {
				key: 'style',
				value: {
					// Model: `alignment:center` => CSS: `float:none`.
					float: alignment === 'center' ? 'none' : alignment
				}
			} ),
			converterPriority: 'high'
		} );

	conversion.for( 'upcast' )
		// Support for the `float:*;` CSS definition for the table alignment.
		.attributeToAttribute( {
			view: {
				name: /^(table|figure)$/,
				styles: {
					float: FLOAT_VALUES_REG_EXP
				}
			},
			model: {
				key: 'tableAlignment',
				value: viewElement => {
					let align = viewElement.getStyle( 'float' );

					// CSS: `float:none` => Model: `alignment:center`.
					if ( align === 'none' ) {
						align = 'center';
					}

					return align === defaultValue ? null : align;
				}
			}
		} )
		// Support for the `align` attribute as the backward compatibility while pasting from other sources.
		.attributeToAttribute( {
			view: {
				attributes: {
					align: ALIGN_VALUES_REG_EXP
				}
			},
			model: {
				name: 'table',
				key: 'tableAlignment',
				value: viewElement => {
					const align = viewElement.getAttribute( 'align' );

					return align === defaultValue ? null : align;
				}
			}
		} );
}

// Enables conversion for an attribute for simple view-model mappings.
//
// @param {module:engine/model/schema~Schema} schema
// @param {module:engine/conversion/conversion~Conversion} conversion
// @param {Object} options
// @param {String} options.modelAttribute
// @param {String} options.styleName
// @param {String} options.defaultValue The default value for the specified `modelAttribute`.
function enableProperty( schema, conversion, options ) {
	const { modelAttribute } = options;

	schema.extend( 'table', {
		allowAttributes: [ modelAttribute ]
	} );
	upcastStyleToAttribute( conversion, { viewElement: 'table', ...options } );
	downcastTableAttribute( conversion, options );
}

// Enables conversion for an attribute for simple view (figure) to model (table) mappings.
//
// @param {module:engine/model/schema~Schema} schema
// @param {module:engine/conversion/conversion~Conversion} conversion
// @param {Object} options
// @param {String} options.modelAttribute
// @param {String} options.styleName
function enableTableToFigureProperty( schema, conversion, options ) {
	const { modelAttribute } = options;

	schema.extend( 'table', {
		allowAttributes: [ modelAttribute ]
	} );
	upcastStyleToAttribute( conversion, { viewElement: /^(table|figure)$/, ...options } );
	downcastAttributeToStyle( conversion, { modelElement: 'table', ...options } );
}
