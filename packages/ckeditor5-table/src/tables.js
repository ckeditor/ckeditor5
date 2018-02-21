/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module tables/tables
 */

import Plugin from '../../ckeditor5-core/src/plugin';

import TablesEditing from './tablesediting';
import TablesUI from './tablesui';

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
