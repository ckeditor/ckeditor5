/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecellwidth/tablecellwidthediting
 */

import { Plugin } from 'ckeditor5/src/core';

import { downcastAttributeToStyle, upcastStyleToAttribute } from './../converters/tableproperties';
import TableEditing from './../tableediting';
import TableCellWidthCommand from './commands/tablecellwidthcommand';
import { getNormalizedDefaultProperties } from '../utils/table-properties';

/**
 * The table cell width editing feature.
 *
 * Introduces table cell model attribute and their conversion:
 *
 * - cell width: `tableCellWidth`
 *
 * It also registers a command used to manipulate the above attribute:
 *
 * - width: the `'tableCellWidth'` command
 *
 * @extends module:core/plugin~Plugin
 */
export default class TableCellWidthEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TableCellWidthEditing';
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

		const defaultTableCellProperties = getNormalizedDefaultProperties(
			editor.config.get( 'table.tableCellProperties.defaultProperties' )
		);

		enableProperty( schema, conversion, {
			modelAttribute: 'tableCellWidth',
			styleName: 'width',
			defaultValue: defaultTableCellProperties.width
		} );
		editor.commands.add( 'tableCellWidth', new TableCellWidthCommand( editor, defaultTableCellProperties.width ) );
	}
}

// Enables conversion for an attribute for simple view-model mappings.
//
// @param {module:engine/model/schema~Schema} schema
// @param {module:engine/conversion/conversion~Conversion} conversion
// @param {Object} options
// @param {String} options.modelAttribute
// @param {String} options.styleName
// @param {String} options.defaultValue The default value for the specified `modelAttribute`.
// @param {Boolean} [options.reduceBoxSides=false]
function enableProperty( schema, conversion, options ) {
	const { modelAttribute } = options;

	schema.extend( 'tableCell', {
		allowAttributes: [ modelAttribute ]
	} );

	upcastStyleToAttribute( conversion, { viewElement: /^(td|th)$/, ...options } );
	downcastAttributeToStyle( conversion, { modelElement: 'tableCell', ...options } );
}
