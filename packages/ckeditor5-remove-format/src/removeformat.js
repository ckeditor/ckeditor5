/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module highlight/highlight
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import RemoveFormatUI from './removeformatui';

/**
 * The remove format plugin.
 *
 * For a detailed overview, check the {@glink features/removeformat Remove Format feature} documentation.
 *
 * This is a "glue" plugin which loads logic and UI of the remove format plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class RemoveFormat extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ RemoveFormatUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'RemoveFormat';
	}
}
