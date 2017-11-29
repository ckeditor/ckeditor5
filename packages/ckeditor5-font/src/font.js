/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/font
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import FontSize from './fontsize';

/**
 * The Font plugin.
 *
 * It requires {@link module:font/fontsize~FontSize} plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Font extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ FontSize ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Font';
	}
}
