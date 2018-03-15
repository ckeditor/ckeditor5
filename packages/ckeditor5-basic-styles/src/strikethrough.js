/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module basic-styles/strikethrough
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import StrikethroughEditing from './strikethrough/strikethroughediting';
import StrikethroughUI from './strikethrough/strikethroughui';

/**
 * The strikethrough feature.
 *
 * It loads the {@link module:basic-styles/strikethrough/strikethroughediting~StrikethroughEditing} and
 * {@link module:basic-styles/strikethrough/strikethroughui~StrikethroughUI} plugins.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Strikethrough extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ StrikethroughEditing, StrikethroughUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Strikethrough';
	}
}
