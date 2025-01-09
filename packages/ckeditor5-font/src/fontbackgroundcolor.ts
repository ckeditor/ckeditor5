/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module font/fontbackgroundcolor
 */

import { Plugin } from 'ckeditor5/src/core.js';
import FontBackgroundColorEditing from './fontbackgroundcolor/fontbackgroundcolorediting.js';
import FontBackgroundColorUI from './fontbackgroundcolor/fontbackgroundcolorui.js';

/**
 * The font background color plugin.
 *
 * For a detailed overview, check the {@glink features/font font feature} documentation
 * and the {@glink api/font package page}.
 *
 * This is a "glue" plugin which loads
 * the {@link module:font/fontbackgroundcolor/fontbackgroundcolorediting~FontBackgroundColorEditing} and
 * {@link module:font/fontbackgroundcolor/fontbackgroundcolorui~FontBackgroundColorUI} features in the editor.
 */
export default class FontBackgroundColor extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ FontBackgroundColorEditing, FontBackgroundColorUI ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'FontBackgroundColor' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}
}
