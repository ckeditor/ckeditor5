/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module style/style
 */

import { Plugin } from 'ckeditor5/src/core.js';

import StyleUI from './styleui.js';
import StyleEditing from './styleediting.js';

/**
 * The style plugin.
 *
 * This is a "glue" plugin that loads the {@link module:style/styleediting~StyleEditing style editing feature}
 * and {@link module:style/styleui~StyleUI style UI feature}.
 */
export default class Style extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'Style' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ StyleEditing, StyleUI ] as const;
	}
}
