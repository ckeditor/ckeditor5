/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module markdown-gfm/markdown
 */

import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import GFMDataProcessor from './gfmdataprocessor.js';

/**
 * The GitHub Flavored Markdown (GFM) plugin.
 *
 * For a detailed overview, check the {@glink features/markdown Markdown feature} guide.
 */
export default class Markdown extends Plugin {
	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		editor.data.processor = new GFMDataProcessor( editor.data.viewDocument );
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'Markdown' as const;
	}
}
