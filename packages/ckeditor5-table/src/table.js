/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/table
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import TableEditing from './tableediting';
import TableUI from './tableui';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

/**
 * The table plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Table extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ TableEditing, TableUI, Widget ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Table';
	}
}
