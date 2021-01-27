/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
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
 * For a detailed overview check the {@glink features/basic-styles Basic styles feature documentation}
 * and the {@glink api/basic-styles package page}.
 *
 * This is a "glue" plugin which loads the {@link module:basic-styles/strikethrough/strikethroughediting~StrikethroughEditing} and
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
