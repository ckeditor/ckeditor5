/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module font/fontcolor
 */

import { Plugin } from 'ckeditor5/src/core.js';
import FontColorEditing from './fontcolor/fontcolorediting.js';
import FontColorUI from './fontcolor/fontcolorui.js';

/**
 * The font color plugin.
 *
 * For a detailed overview, check the {@glink features/font font feature} documentation
 * and the {@glink api/font package page}.
 *
 * This is a "glue" plugin which loads the {@link module:font/fontcolor/fontcolorediting~FontColorEditing} and
 * {@link module:font/fontcolor/fontcolorui~FontColorUI} features in the editor.
 */
export default class FontColor extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ FontColorEditing, FontColorUI ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'FontColor' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}
}
