/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecellproperties/tablecellpropertiesediting
 */

import { Plugin } from 'ckeditor5/src/core';
import { addBorderRules, addPaddingRules, addBackgroundRules } from 'ckeditor5/src/engine';

import { downcastAttributeToStyle, upcastStyleToAttribute, upcastBorderStyles } from './../converters/tableproperties';
import TableEditing from './../tableediting';
import TableCellPaddingCommand from './commands/tablecellpaddingcommand';
import TableCellWidthCommand from './commands/tablecellwidthcommand';
import TableCellHeightCommand from './commands/tablecellheightcommand';
import TableCellBackgroundColorCommand from './commands/tablecellbackgroundcolorcommand';
import TableCellVerticalAlignmentCommand from './commands/tablecellverticalalignmentcommand';
import TableCellHorizontalAlignmentCommand from './commands/tablecellhorizontalalignmentcommand';
import TableCellBorderStyleCommand from './commands/tablecellborderstylecommand';
import TableCellBorderColorCommand from './commands/tablecellbordercolorcommand';
import TableCellBorderWidthCommand from './commands/tablecellborderwidthcommand';

const VALIGN_VALUES_REG_EXP = /^(top|bottom)$/;

/**
 * The table cell properties editing feature.
 *
 * Introduces table cell model attributes and their conversion:
 *
 * - border: `borderStyle`, `borderColor` and `borderWidth`
 * - background color: `backgroundColor`
 * - cell padding: `padding`
 * - horizontal and vertical alignment: `horizontalAlignment`, `verticalAlignment`
 * - cell width and height: `width`, `height`
 *
 * It also registers commands used to manipulate the above attributes:
 *
 * - border: the `'tableCellBorderStyle'`, `'tableCellBorderColor'` and `'tableCellBorderWidth'` commands
 * - background color: the `'tableCellBackgroundColor'` command
 * - cell padding: the `'tableCellPadding'` command
 * - horizontal and vertical alignment: the `'tableCellHorizontalAlignment'` and `'tableCellVerticalAlignment'` commands
 * - width and height: the `'tableCellWidth'` and `'tableCellHeight'` commands
 *
 * @extends module:core/plugin~Plugin
 */
export default class TableCellPropertiesEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TableCellPropertiesEditing';
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
		const locale = editor.locale;

		editor.data.addStyleProcessorRules( addBorderRules );
		enableBorderProperties( schema, conversion );
		editor.commands.add( 'tableCellBorderStyle', new TableCellBorderStyleCommand( editor ) );
		editor.commands.add( 'tableCellBorderColor', new TableCellBorderColorCommand( editor ) );
		editor.commands.add( 'tableCellBorderWidth', new TableCellBorderWidthCommand( editor ) );

		enableHorizontalAlignmentProperty( schema, conversion, locale );
		editor.commands.add( 'tableCellHorizontalAlignment', new TableCellHorizontalAlignmentCommand( editor ) );

		enableProperty( schema, conversion, 'width', 'width' );
		editor.commands.add( 'tableCellWidth', new TableCellWidthCommand( editor ) );

		enableProperty( schema, conversion, 'height', 'height' );
		editor.commands.add( 'tableCellHeight', new TableCellHeightCommand( editor ) );

		editor.data.addStyleProcessorRules( addPaddingRules );
		enableProperty( schema, conversion, 'padding', 'padding' );
		editor.commands.add( 'tableCellPadding', new TableCellPaddingCommand( editor ) );

		editor.data.addStyleProcessorRules( addBackgroundRules );
		enableProperty( schema, conversion, 'backgroundColor', 'background-color' );
		editor.commands.add( 'tableCellBackgroundColor', new TableCellBackgroundColorCommand( editor ) );

		enableVerticalAlignmentProperty( schema, conversion );
		editor.commands.add( 'tableCellVerticalAlignment', new TableCellVerticalAlignmentCommand( editor ) );
	}
}

// Enables the `'borderStyle'`, `'borderColor'` and `'borderWidth'` attributes for table cells.
//
// @param {module:engine/model/schema~Schema} schema
// @param {module:engine/conversion/conversion~Conversion} conversion
function enableBorderProperties( schema, conversion ) {
	schema.extend( 'tableCell', {
		allowAttributes: [ 'borderWidth', 'borderColor', 'borderStyle' ]
	} );
	upcastBorderStyles( conversion, 'td' );
	upcastBorderStyles( conversion, 'th' );
	downcastAttributeToStyle( conversion, 'tableCell', 'borderStyle', 'border-style' );
	downcastAttributeToStyle( conversion, 'tableCell', 'borderColor', 'border-color' );
	downcastAttributeToStyle( conversion, 'tableCell', 'borderWidth', 'border-width' );
}

// Enables the `'horizontalAlignment'` attribute for table cells.
//
// @param {module:engine/model/schema~Schema} schema
// @param {module:engine/conversion/conversion~Conversion} conversion
// @param {module:utils/locale~Locale} locale The {@link module:core/editor/editor~Editor#locale} instance.
function enableHorizontalAlignmentProperty( schema, conversion, locale ) {
	schema.extend( 'tableCell', {
		allowAttributes: [ 'horizontalAlignment' ]
	} );

	const options = [ locale.contentLanguageDirection == 'rtl' ? 'left' : 'right', 'center', 'justify' ];

	conversion.attributeToAttribute( {
		model: {
			name: 'tableCell',
			key: 'horizontalAlignment',
			values: options
		},
		view: options.reduce( ( result, option ) => ( {
			...result,
			[ option ]: {
				key: 'style',
				value: {
					'text-align': option
				}
			}
		} ), {} )
	} );
}

// Enables the `'verticalAlignment'` attribute for table cells.
//
// @param {module:engine/model/schema~Schema} schema
// @param {module:engine/conversion/conversion~Conversion} conversion
function enableVerticalAlignmentProperty( schema, conversion ) {
	schema.extend( 'tableCell', {
		allowAttributes: [ 'verticalAlignment' ]
	} );

	conversion.attributeToAttribute( {
		model: {
			name: 'tableCell',
			key: 'verticalAlignment',
			values: [ 'top', 'bottom' ]
		},
		view: {
			top: {
				key: 'style',
				value: {
					'vertical-align': 'top'
				}
			},
			bottom: {
				key: 'style',
				value: {
					'vertical-align': 'bottom'
				}
			}
		}
	} );

	conversion.for( 'upcast' )
		// Support for backwards compatibility and pasting from other sources.
		.attributeToAttribute( {
			view: {
				attributes: {
					valign: VALIGN_VALUES_REG_EXP
				}
			},
			model: {
				name: 'tableCell',
				key: 'verticalAlignment',
				value: viewElement => viewElement.getAttribute( 'valign' )
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
	schema.extend( 'tableCell', {
		allowAttributes: [ modelAttribute ]
	} );
	upcastStyleToAttribute( conversion, 'tableCell', modelAttribute, styleName );
	downcastAttributeToStyle( conversion, 'tableCell', modelAttribute, styleName );
}
