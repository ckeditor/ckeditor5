/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type {
	IndentBlockConfig,
	Indent,
	IndentBlock,
	IndentUI,
	IndentBlockCommand
} from './index.js';

declare module '@ckeditor/ckeditor5-core' {
	interface EditorConfig {

		/**
		 * The configuration of the {@link module:indent/indentblock~IndentBlock block indentation feature}.
		 *
		 * Read more in {@link module:indent/indentconfig~IndentBlockConfig}.
		 */
		indentBlock?: IndentBlockConfig;
	}

	interface PluginsMap {
		[ Indent.pluginName ]: Indent;
		[ IndentBlock.pluginName ]: IndentBlock;
		[ IndentUI.pluginName ]: IndentUI;
	}

	interface CommandsMap {
		indentBlock: IndentBlockCommand;
		outdentBlock: IndentBlockCommand;
	}
}
