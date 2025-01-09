/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module remove-format/removeformat
 */

import { Plugin } from 'ckeditor5/src/core.js';

import RemoveFormatUI from './removeformatui.js';
import RemoveFormatEditing from './removeformatediting.js';

/**
 * The remove format plugin.
 *
 * This is a "glue" plugin which loads the {@link module:remove-format/removeformatediting~RemoveFormatEditing}
 * and {@link module:remove-format/removeformatui~RemoveFormatUI} plugins.
 *
 * For a detailed overview, check out the {@glink features/remove-format remove format} feature documentation.
 */
export default class RemoveFormat extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ RemoveFormatEditing, RemoveFormatUI ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'RemoveFormat' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}
}
