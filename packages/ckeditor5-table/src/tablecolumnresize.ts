/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecolumnresize
 */

import { Plugin, type PluginDependencies } from 'ckeditor5/src/core';
import TableColumnResizeEditing from './tablecolumnresize/tablecolumnresizeediting';
import TableCellWidthEditing from './tablecellwidth/tablecellwidthediting';

import '../theme/tablecolumnresize.css';

/**
 * The table column resize feature.
 *
 * It provides the possibility to set the width of each column in a table using a resize handler.
 */
export default class TableColumnResize extends Plugin {
	/**
	 * @inheritDoc
 	 */
	public static get requires(): PluginDependencies {
		return [ TableColumnResizeEditing, TableCellWidthEditing ];
	}

	/**
	 * @inheritDoc
 	 */
	public static get pluginName(): 'TableColumnResize' {
		return 'TableColumnResize';
	}
}

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
			[ TableColumnResize.pluginName ]: TableColumnResize;
	}
}
