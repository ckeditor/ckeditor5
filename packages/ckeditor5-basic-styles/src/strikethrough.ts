/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module basic-styles/strikethrough
 */

import { Plugin } from 'ckeditor5/src/core.js';
import StrikethroughEditing from './strikethrough/strikethroughediting.js';
import StrikethroughUI from './strikethrough/strikethroughui.js';

/**
 * The strikethrough feature.
 *
 * For a detailed overview check the {@glink features/basic-styles Basic styles feature} guide
 * and the {@glink api/basic-styles package page}.
 *
 * This is a "glue" plugin which loads the {@link module:basic-styles/strikethrough/strikethroughediting~StrikethroughEditing} and
 * {@link module:basic-styles/strikethrough/strikethroughui~StrikethroughUI} plugins.
 */
export default class Strikethrough extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ StrikethroughEditing, StrikethroughUI ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'Strikethrough' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}
}
