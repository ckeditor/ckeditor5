/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type BlockQuote from './blockquote';
import type BlockQuoteCommand from './blockquotecommand';
import type BlockQuoteEditing from './blockquoteediting';
import type BlockQuoteUI from './blockquoteui';

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ BlockQuote.pluginName ]: BlockQuote;
		[ BlockQuoteEditing.pluginName ]: BlockQuoteEditing;
		[ BlockQuoteUI.pluginName ]: BlockQuoteUI;
	}

	interface CommandsMap {
		blockQuote: BlockQuoteCommand;
	}
}
