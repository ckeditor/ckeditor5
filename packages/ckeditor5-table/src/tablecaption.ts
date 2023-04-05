/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecaption
 */

import { Plugin } from 'ckeditor5/src/core';
import TableCaptionEditing from './tablecaption/tablecaptionediting';
import TableCaptionUI from './tablecaption/tablecaptionui';

import '../theme/tablecaption.css';

/**
 * The table caption plugin.
 */
export default class TableCaption extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'TableCaption' {
		return 'TableCaption';
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ TableCaptionEditing, TableCaptionUI ] as const;
	}
}
