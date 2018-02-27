/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
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
 * It loads the {@link module:basic-styles/code/codeediting~CodeEditing code editing feature}
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
