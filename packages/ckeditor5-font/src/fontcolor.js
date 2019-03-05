/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/fontcolor
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import FontColorEditing from './fontcolor/fontcolorediting';
import FontColorUI from './fontcolor/fontcolorui';

export default class FontFamily extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ FontColorEditing, FontColorUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'FontColor';
	}
}
