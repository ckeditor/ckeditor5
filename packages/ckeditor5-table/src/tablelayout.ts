/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablelayout
 */

import { Plugin } from 'ckeditor5/src/core.js';
import TableLayoutUI from './tablelayout/tablelayoutui.js';

import TableLayoutEditing from './tablelayout/tablelayoutediting.js';
import PlainTableOutput from './plaintableoutput.js';
import TableColumnResize from './tablecolumnresize.js';

/**
 * The table plugin.
 *
 * For a detailed overview, check the {@glink features/tables/layout-tables Layout table feature documentation}.
 */
export default class TableLayout extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'TableLayout' as const;
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
		return [ PlainTableOutput, TableColumnResize, TableLayoutEditing, TableLayoutUI ] as const;
	}
}
