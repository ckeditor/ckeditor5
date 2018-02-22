/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/table
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import TablesEditing from './tableediting';
import TablesUI from './tableui';

export default class Tables extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ TablesEditing, TablesUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Tables';
	}
}
