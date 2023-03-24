/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module font/fontcolor
 */

import { Plugin } from 'ckeditor5/src/core';
import FontColorEditing from './fontcolor/fontcolorediting';
import FontColorUI from './fontcolor/fontcolorui';

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
	public static get pluginName(): 'FontColor' {
		return 'FontColor';
	}
}
