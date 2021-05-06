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

const ALIGN_VALUES_REG_EXP = /^(left|right)$/;

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

		editor.data.addStyleProcessorRules( addBorderRules );
		enableBorderProperties( schema, conversion );
		editor.commands.add( 'tableBorderColor', new TableBorderColorCommand( editor ) );
		editor.commands.add( 'tableBorderStyle', new TableBorderStyleCommand( editor ) );
		editor.commands.add( 'tableBorderWidth', new TableBorderWidthCommand( editor ) );

		enableAlignmentProperty( schema, conversion );
		editor.commands.add( 'tableAlignment', new TableAlignmentCommand( editor ) );

		enableTableToFigureProperty( schema, conversion, 'width', 'width' );
		editor.commands.add( 'tableWidth', new TableWidthCommand( editor ) );

		enableTableToFigureProperty( schema, conversion, 'height', 'height' );
		editor.commands.add( 'tableHeight', new TableHeightCommand( editor ) );

		editor.data.addStyleProcessorRules( addBackgroundRules );
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

	conversion
		.attributeToAttribute( {
			model: {
				name: 'table',
				key: 'alignment',
				values: [ 'left', 'right' ]
			},
			view: {
				left: {
					key: 'style',
					value: {
						float: 'left'
					}
				},
				right: {
					key: 'style',
					value: {
						float: 'right'
					}
				}
			},
			converterPriority: 'high'
		} );

	conversion.for( 'upcast' )
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

// Enables conversion for an attribute for simple view (figure) to model (table) mappings.
//
// @param {String} modelAttribute
// @param {String} styleName
// @param {module:engine/model/schema~Schema} schema
// @param {module:engine/conversion/conversion~Conversion} conversion
function enableTableToFigureProperty( schema, conversion, modelAttribute, styleName ) {
	schema.extend( 'table', {
		allowAttributes: [ modelAttribute ]
	} );
	upcastStyleToAttribute( conversion, 'table', modelAttribute, styleName );
	downcastAttributeToStyle( conversion, 'table', modelAttribute, styleName );
}
