/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module font/font
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import FontFamily from './fontfamily';
import FontSize from './fontsize';
import FontColor from './fontcolor';
import FontBackgroundColor from './fontbackgroundcolor';

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
 *
 * @extends module:core/plugin~Plugin
 */
export default class Font extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ FontFamily, FontSize, FontColor, FontBackgroundColor ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Font';
	}
}
