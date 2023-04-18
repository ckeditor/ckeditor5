/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module style/style
 */

import { Plugin } from 'ckeditor5/src/core';

import StyleUI from './styleui';
import StyleEditing from './styleediting';

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
	public static get pluginName(): 'Style' {
		return 'Style';
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ StyleEditing, StyleUI ] as const;
	}
}
