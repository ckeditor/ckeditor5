/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module code-block/codeblock
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import CodeBlockEditing from './codeblockediting';
import CodeBlockUI from './codeblockqui';

/**
 * The code block plugin.
 *
 * For more information about this feature check the {@glink api/code-block package page}.
 *
 * This is a "glue" plugin which loads the {@link module:code-block/codeblockediting~CodeBlockEditing code block editing feature}
 * and {@link module:code-block/codeblockui~CodeBlockUI code block UI feature}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class CodeBlock extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ CodeBlockEditing, CodeBlockUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'CodeBlock';
	}
}
