/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/fontfamily
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import FontFamilyEditing from './fontfamily/fontfamilyediting';
import FontFamilyUI from './fontfamily/fontfamilyui';

/**
 * The Font Size plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class FontFamily extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ FontFamilyEditing, FontFamilyUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'FontFamily';
	}
}
