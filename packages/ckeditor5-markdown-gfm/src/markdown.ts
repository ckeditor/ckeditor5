/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module markdown-gfm/markdown
 */

import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import { MarkdownGfmDataProcessor } from './gfmdataprocessor.js';

/**
 * The GitHub Flavored Markdown (GFM) plugin.
 *
 * For a detailed overview, check the {@glink features/markdown Markdown feature} guide.
 */
export class Markdown extends Plugin {
	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		editor.data.processor = new MarkdownGfmDataProcessor( editor.data.viewDocument );
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'Markdown' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}
}
