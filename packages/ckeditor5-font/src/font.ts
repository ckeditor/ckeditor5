/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module font/font
 */

import { Plugin } from 'ckeditor5/src/core.js';

import FontFamily from './fontfamily.js';
import FontSize from './fontsize.js';
import FontColor from './fontcolor.js';
import FontBackgroundColor from './fontbackgroundcolor.js';

/**
 * A plugin that enables a set of text styling features:
 *
 * * {@link module:font/fontsize~FontSize},
 * * {@link module:font/fontfamily~FontFamily}.
 * * {@link module:font/fontcolor~FontColor},
 * * {@link module:font/fontbackgroundcolor~FontBackgroundColor}.
 *
 * For a detailed overview, check the {@glink features/font Font feature} documentation
 * and the {@glink api/font package page}.
 */
export default class Font extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ FontFamily, FontSize, FontColor, FontBackgroundColor ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'Font' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}
}
