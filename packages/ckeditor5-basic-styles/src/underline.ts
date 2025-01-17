/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module basic-styles/underline
 */

import { Plugin } from 'ckeditor5/src/core.js';
import UnderlineEditing from './underline/underlineediting.js';
import UnderlineUI from './underline/underlineui.js';

/**
 * The underline feature.
 *
 * For a detailed overview check the {@glink features/basic-styles Basic styles feature} guide
 * and the {@glink api/basic-styles package page}.
 *
 * This is a "glue" plugin which loads the {@link module:basic-styles/underline/underlineediting~UnderlineEditing} and
 * {@link module:basic-styles/underline/underlineui~UnderlineUI} plugins.
 */
export default class Underline extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ UnderlineEditing, UnderlineUI ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'Underline' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}
}
