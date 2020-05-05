/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module basic-styles/code
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import CodeEditing from './code/codeediting';
import CodeUI from './code/codeui';

import '../theme/code.css';

/**
 * The code feature.
 *
 * For a detailed overview check the {@glink features/basic-styles Basic styles feature documentation}
 * and the {@glink api/basic-styles package page}.
 *
 * This is a "glue" plugin which loads the {@link module:basic-styles/code/codeediting~CodeEditing code editing feature}
 * and {@link module:basic-styles/code/codeui~CodeUI code UI feature}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Code extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ CodeEditing, CodeUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Code';
	}
}
