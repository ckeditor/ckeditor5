/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module code-block/codeblock
 */

import { Plugin } from 'ckeditor5/src/core.js';

import CodeBlockEditing from './codeblockediting.js';
import CodeBlockUI from './codeblockui.js';

/**
 * The code block plugin.
 *
 * For more information about this feature check the {@glink api/code-block package page} and the
 * {@glink features/code-blocks code block} feature guide.
 *
 * This is a "glue" plugin that loads the {@link module:code-block/codeblockediting~CodeBlockEditing code block editing feature}
 * and the {@link module:code-block/codeblockui~CodeBlockUI code block UI feature}.
 */
export default class CodeBlock extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ CodeBlockEditing, CodeBlockUI ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'CodeBlock' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}
}
