/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module remove-format/removeformat
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import RemoveFormatUI from './removeformatui';
import RemoveFormatEditing from './removeformatediting';

/**
 * The remove format plugin.
 *
 * This is a "glue" plugin which loads the {@link module:remove-format/removeformatediting~RemoveFormatEditing}
 * and {@link module:remove-format/removeformatui~RemoveFormatUI} plugins.
 *
 * For a detailed overview, check out the {@glink features/remove-format remove format} feature documentation.
 *
 * @extends module:core/plugin~Plugin
 */
export default class RemoveFormat extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ RemoveFormatEditing, RemoveFormatUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'RemoveFormat';
	}
}
