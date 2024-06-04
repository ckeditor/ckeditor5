/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type {
	Paragraph,
	ParagraphCommand,
	InsertParagraphCommand
} from './index.js';

declare module '@ckeditor/ckeditor5-core' {
	interface CommandsMap {
		insertParagraph: InsertParagraphCommand;
		paragraph: ParagraphCommand;
	}

	interface PluginsMap {
		[ Paragraph.pluginName ]: Paragraph;
	}
}
