/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecaption
 */

import { Plugin } from 'ckeditor5/src/core.js';
import TableCaptionEditing from './tablecaption/tablecaptionediting.js';
import TableCaptionUI from './tablecaption/tablecaptionui.js';

import '../theme/tablecaption.css';

/**
 * The table caption plugin.
 */
export default class TableCaption extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'TableCaption' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ TableCaptionEditing, TableCaptionUI ] as const;
	}
}
