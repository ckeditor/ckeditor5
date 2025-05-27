/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablecellwidth/tablecellwidthediting
 */

import { Plugin } from 'ckeditor5/src/core.js';

import TableEditing from './../tableediting.js';
import TableCellWidthCommand from './commands/tablecellwidthcommand.js';
import { getNormalizedDefaultCellProperties } from '../utils/table-properties.js';
import { enableProperty } from '../utils/common.js';

/**
 * The table cell width editing feature.
 *
 * Introduces `tableCellWidth` table cell model attribute alongside with its converters
 * and a command.
 */
export default class TableCellWidthEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'TableCellWidthEditing' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ TableEditing ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		const defaultTableCellProperties = getNormalizedDefaultCellProperties(
			editor.config.get( 'table.tableCellProperties.defaultProperties' )!
		);

		enableProperty( editor.model.schema, editor.conversion, {
			modelAttribute: 'tableCellWidth',
			styleName: 'width',
			attributeName: 'width',
			attributeType: 'length',
			defaultValue: defaultTableCellProperties.width
		} );

		editor.commands.add( 'tableCellWidth', new TableCellWidthCommand( editor, defaultTableCellProperties.width ) );
	}
}
