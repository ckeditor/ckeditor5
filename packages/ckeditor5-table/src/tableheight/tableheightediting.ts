/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tableheight/tableheightediting
 */

import { Plugin, type PluginDependenciesOf } from '@ckeditor/ckeditor5-core';

import { TableEditing } from './../tableediting.js';
import { TableHeightCommand } from '../tableproperties/commands/tableheightcommand.js';
import { getNormalizedDefaultTableProperties } from '../utils/table-properties.js';
import { enableTableToFigureProperty } from '../utils/common.js';

/**
 * The table height editing feature.
 *
 * Introduces `tableHeight` table model attribute alongside with its converters
 * and a command.
 */
export class TableHeightEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'TableHeightEditing' as const;
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
	public static get requires(): PluginDependenciesOf<[ TableEditing ]> {
		return [ TableEditing ];
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		const defaultTableProperties = getNormalizedDefaultTableProperties(
			editor.config.get( 'table.tableProperties.defaultProperties' )!
		);

		enableTableToFigureProperty( editor.model.schema, editor.conversion, {
			modelAttribute: 'tableHeight',
			styleName: 'height',
			attributeName: 'height',
			attributeType: 'length',
			defaultValue: defaultTableProperties.height
		} );

		editor.commands.add( 'tableHeight', new TableHeightCommand( editor, defaultTableProperties.height ) );
	}
}
