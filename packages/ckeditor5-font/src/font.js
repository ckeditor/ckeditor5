/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/font
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import FontFamily from './fontfamily';
import FontSize from './fontsize';

/**
 * The Font plugin.
 *
 * It requires {@link module:font/fontsize~FontSize} and {@link module:font/fontfamily~FontFamily} plugins.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Font extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ FontFamily, FontSize ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Font';
	}
}
