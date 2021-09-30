/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module markdown-gfm/markdown
 */

import { Plugin } from 'ckeditor5/src/core';
import GFMDataProcessor from './gfmdataprocessor';

/**
 * The GitHub Flavored Markdown (GFM) plugin.
 *
 * For a detailed overview, check the {@glink features/markdown Markdown feature documentation}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Markdown extends Plugin {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		// Do not write `get('mention.idToText')` as it does NOT return a resolver function
		const mentionIdToText = editor.config.get( 'mention' ).idToText;

		editor.data.processor = new GFMDataProcessor( editor.data.viewDocument, { mentionIdToText } );
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Markdown';
	}
}
