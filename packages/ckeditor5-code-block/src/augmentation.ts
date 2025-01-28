/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type {
	CodeBlock,
	CodeBlockCommand,
	CodeBlockConfig,
	CodeBlockEditing,
	CodeBlockUI,
	IndentCodeBlockCommand,
	OutdentCodeBlockCommand
} from './index.js';

declare module '@ckeditor/ckeditor5-core' {
	interface EditorConfig {

		/**
		 * The configuration of the {@link module:code-block/codeblock~CodeBlock} feature.
		 *
		 * Read more in {@link module:code-block/codeblockconfig~CodeBlockConfig}.
		 */
		codeBlock?: CodeBlockConfig;
	}

	interface PluginsMap {
		[ CodeBlock.pluginName ]: CodeBlock;
		[ CodeBlockEditing.pluginName ]: CodeBlockEditing;
		[ CodeBlockUI.pluginName ]: CodeBlockUI;
	}

	interface CommandsMap {
		codeBlock: CodeBlockCommand;
		indentCodeBlock: IndentCodeBlockCommand;
		outdentCodeBlock: OutdentCodeBlockCommand;
	}
}
