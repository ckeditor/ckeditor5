/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module drupal-image/drupalimage
 */

import { Plugin } from 'ckeditor5/src/core';

import DrupalImageEditing from './drupalimageediting';

/**
 * The Drupal image plugin.
 *
 * This is a "glue" plugin that loads the {@link module:code-block/codeblockediting~CodeBlockEditing code block editing feature}.
 * If the feature has UI elements (buttons, toolbars etc.), they are also contained in this class.
 *
 * @extends module:core/plugin~Plugin
 */
export default class DrupalImage extends Plugin {
	/**
		 * @inheritDoc
		 */
	static get requires() {
		return [ DrupalImageEditing ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'DrupalImage';
	}
}
