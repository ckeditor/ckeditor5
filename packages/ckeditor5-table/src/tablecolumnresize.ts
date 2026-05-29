/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablecolumnresize
 */

import { Plugin, type PluginDependenciesOf } from '@ckeditor/ckeditor5-core';
import { TableColumnResizeEditing } from './tablecolumnresize/tablecolumnresizeediting.js';
import { TableCellWidthEditing } from './tablecellwidth/tablecellwidthediting.js';

import '../theme/tablecolumnresize.css';

/**
 * The table column resize feature.
 *
 * It provides the possibility to set the width of each column in a table using a resize handler.
 */
export class TableColumnResize extends Plugin {
	/**
	 * @inheritDoc
 	 */
	public static get requires(): PluginDependenciesOf<[ TableColumnResizeEditing, TableCellWidthEditing ]> {
		return [ TableColumnResizeEditing, TableCellWidthEditing ];
	}

	/**
	 * @inheritDoc
 	 */
	public static get pluginName() {
		return 'TableColumnResize' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}
}
