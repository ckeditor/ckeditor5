/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
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
 *
 * @extends module:core/plugin~Plugin
 */
export default class TableCaption extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TableCaption';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ TableCaptionEditing, TableCaptionUI ];
	}
}
