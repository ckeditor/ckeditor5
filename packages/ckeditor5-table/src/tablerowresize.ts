/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablerowresize
 */

import { Plugin, type PluginDependenciesOf } from '@ckeditor/ckeditor5-core';
import { TableRowResizeEditing } from './tablerowresize/tablerowresizeediting.js';
import { TableCellHeightEditing } from './tablecellheight/tablecellheightediting.js';
import { TableHeightEditing } from './tableheight/tableheightediting.js';

/**
 * The table row resize feature.
 *
 * It provides the possibility to set the height of each row in a table.
 */
export class TableRowResize extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires(): PluginDependenciesOf<[ TableRowResizeEditing, TableCellHeightEditing, TableHeightEditing ]> {
		// The cell and table heights are changed by the row resize, so they must be in the model (not left to GHS) without
		// the table and cell properties features too.
		return [ TableRowResizeEditing, TableCellHeightEditing, TableHeightEditing ];
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'TableRowResize' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}
}
