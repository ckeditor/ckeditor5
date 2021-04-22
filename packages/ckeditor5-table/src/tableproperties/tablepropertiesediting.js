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
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;
		const conversion = editor.conversion;

		editor.config.define( 'table.tableProperties.defaultProperties', {} );

		/**
		 * The normalized, default table properties.
		 *
		 * @protected
		 * @member {Object}
		 */
		// TODO (pomek): Update the member type.
		this._defaultTableProperties = getNormalizedDefaultProperties( editor.config.get( 'table.tableProperties.defaultProperties' ), {
			includeAlignmentProperty: true
		} );

		editor.data.addStyleProcessorRules( addBorderRules );
		enableBorderProperties( schema, conversion, this._defaultTableProperties );
		editor.commands.add( 'tableBorderColor', new TableBorderColorCommand( editor, this._defaultTableProperties.borderColor ) );
		editor.commands.add( 'tableBorderStyle', new TableBorderStyleCommand( editor, this._defaultTableProperties.borderStyle ) );
		editor.commands.add( 'tableBorderWidth', new TableBorderWidthCommand( editor, this._defaultTableProperties.borderWidth ) );

		enableAlignmentProperty( schema, conversion, this._defaultTableProperties.alignment );
		editor.commands.add( 'tableAlignment', new TableAlignmentCommand( editor, this._defaultTableProperties.alignment ) );

		enableTableToFigureProperty( schema, conversion, {
			modelAttribute: 'width',
			styleName: 'width',
			defaultValue: this._defaultTableProperties.width
		} );
		editor.commands.add( 'tableWidth', new TableWidthCommand( editor, this._defaultTableProperties.width ) );

		enableTableToFigureProperty( schema, conversion, {
			modelAttribute: 'height',
			styleName: 'height',
			defaultValue: this._defaultTableProperties.height
		} );
		editor.commands.add( 'tableHeight', new TableHeightCommand( editor, this._defaultTableProperties.height ) );

		editor.data.addStyleProcessorRules( addBackgroundRules );
		enableProperty( schema, conversion, {
			modelAttribute: 'backgroundColor',
			styleName: 'background-color',
			defaultValue: this._defaultTableProperties.backgroundColor
		} );
		editor.commands.add(
			'tableBackgroundColor',
			new TableBackgroundColorCommand( editor, this._defaultTableProperties.backgroundColor )
		);
	}
}

// Enables `'borderStyle'`, `'borderColor'` and `'borderWidth'` attributes for table.
//
// @param {module:engine/model/schema~Schema} schema
// @param {module:engine/conversion/conversion~Conversion} conversion
// @param {Object} tableProperties
// TODO (pomek): Update the param type.
function enableBorderProperties( schema, conversion, tableProperties ) {
	schema.extend( 'table', {
		allowAttributes: [ 'borderWidth', 'borderColor', 'borderStyle' ]
	} );
	upcastBorderStyles( conversion, 'table', {
		style: tableProperties.borderStyle,
		width: tableProperties.borderWidth,
		color: tableProperties.borderColor
	} );
	downcastTableAttribute( conversion, { modelAttribute: 'borderColor', styleName: 'border-color' } );
	downcastTableAttribute( conversion, { modelAttribute: 'borderStyle', styleName: 'border-style' } );
	downcastTableAttribute( conversion, { modelAttribute: 'borderWidth', styleName: 'border-width' } );
}

// Enables the `'alignment'` attribute for table.
//
// @param {module:engine/model/schema~Schema} schema
// @param {module:engine/conversion/conversion~Conversion} conversion
// @param {String} defaultValue The default alignment value.
function enableAlignmentProperty( schema, conversion, defaultValue ) {
	schema.extend( 'table', {
		allowAttributes: [ 'alignment' ]
	} );

	conversion
		.attributeToAttribute( {
			model: {
				name: 'table',
				key: 'alignment',
				value: viewElement => {
					let align = viewElement.getStyle( 'float' );

					// CSS: `float:none` => Model: `alignment:center`.
					if ( align === 'none' ) {
						align = 'center';
					}

					return align === defaultValue ? null : align;
				}
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
		// Support for backwards compatibility and pasting from other sources.
		.attributeToAttribute( {
			model: {
				name: 'table',
				key: 'alignment',
				value: viewElement => {
					const align = viewElement.getAttribute( 'align' );

					return align === defaultValue ? null : align;
				}
			},
			view: {
				attributes: {
					align: ALIGN_VALUES_REG_EXP
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
function enableProperty( schema, conversion, options ) {
	const { modelAttribute } = options;

	schema.extend( 'table', {
		allowAttributes: [ modelAttribute ]
	} );
	upcastStyleToAttribute( conversion, { viewElementName: 'table', modelElement: 'table', ...options } );
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
	upcastStyleToAttribute( conversion, { viewElementName: 'table', modelElement: 'table', ...options } );
	upcastStyleToAttribute( conversion, { viewElementName: 'figure', modelElement: 'table', ...options } );
	downcastAttributeToStyle( conversion, { modelElement: 'table', ...options } );
}
