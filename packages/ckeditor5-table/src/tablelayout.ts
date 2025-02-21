/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablelayout
 */

import { Plugin } from 'ckeditor5/src/core.js';
import TableLayoutUI from './tablelayout/tablelayoutui.js';

/**
 * The table layout plugin.
 */
export default class TableLayout extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ TableLayoutUI ] as const;
	}

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
}
