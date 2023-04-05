/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module font/fontsize
 */

import { Plugin } from 'ckeditor5/src/core';
import FontSizeEditing from './fontsize/fontsizeediting';
import FontSizeUI from './fontsize/fontsizeui';
import { normalizeOptions } from './fontsize/utils';
import type { FontSizeOption } from './fontconfig';

/**
 * The font size plugin.
 *
 * For a detailed overview, check the {@glink features/font font feature} documentation
 * and the {@glink api/font package page}.
 *
 * This is a "glue" plugin which loads the {@link module:font/fontsize/fontsizeediting~FontSizeEditing} and
 * {@link module:font/fontsize/fontsizeui~FontSizeUI} features in the editor.
 */
export default class FontSize extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ FontSizeEditing, FontSizeUI ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'FontSize' {
		return 'FontSize';
	}

	/**
	 * Normalizes and translates the {@link module:font/fontconfig~FontSizeConfig#options configuration options}
	 * to the {@link module:font/fontconfig~FontSizeOption} format.
	 *
	 * @param configuredOptions An array of options taken from the configuration.
	 */
	public normalizeSizeOptions( options: Array<string | number | FontSizeOption> ): Array<FontSizeOption> {
		return normalizeOptions( options );
	}
}
