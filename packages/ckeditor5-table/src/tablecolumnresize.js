/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecolumnresize
 */

import { Plugin } from 'ckeditor5/src/core';
import TableColumnResizeEditing from './tablecolumnresize/tablecolumnresizeediting';

import '../theme/tablecolumnresize.css';

/**
 * The table column resizer feature.
 *
 * It provides the possibility to set the width of each column in a table using a resize handle.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TableColumnResize extends Plugin {
	/**
	 * @inheritDoc
 	 */
	static get requires() {
		return [ TableColumnResizeEditing ];
	}

	/**
	 * @inheritDoc
 	 */
	static get pluginName() {
		return 'TableColumnResize';
	}
}
