/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecellwidth/tablecellwidthediting
 */

import { Plugin, type PluginDependencies } from 'ckeditor5/src/core';

import TableEditing from './../tableediting';
import TableCellWidthCommand from './commands/tablecellwidthcommand';
import { getNormalizedDefaultProperties } from '../utils/table-properties';
import { enableProperty } from '../utils/common';

/**
 * The table cell width editing feature.
 *
 * Introduces `tableCellWidth` table cell model attribute alongside with its converters
 * and a command.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TableCellWidthEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'TableCellWidthEditing' {
		return 'TableCellWidthEditing';
	}

	/**
	 * @inheritDoc
	 */
	public static get requires(): PluginDependencies {
		return [ TableEditing ];
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		const defaultTableCellProperties = getNormalizedDefaultProperties(
			editor.config.get( 'table.tableCellProperties.defaultProperties' )
		);

		enableProperty( editor.model.schema, editor.conversion, {
			modelAttribute: 'tableCellWidth',
			styleName: 'width',
			defaultValue: defaultTableCellProperties.width
		} );

		editor.commands.add( 'tableCellWidth', new TableCellWidthCommand( editor, defaultTableCellProperties.width ) );
	}
}
