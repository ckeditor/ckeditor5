/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/fontbackgroundcolor
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import FontBackgroundColorEditing from './fontbackgroundcolor/fontbackgroundcolorediting';
import FontBackgroundColorUI from './fontbackgroundcolor/fontbackgroundcolorui';

export default class FontBackgroundColor extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ FontBackgroundColorEditing, FontBackgroundColorUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'FontBackgroundColor';
	}
}
