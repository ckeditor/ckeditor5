/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module block-quote/blockquote
 */

import { Plugin } from 'ckeditor5/src/core';

import BlockQuoteEditing from './blockquoteediting';
import BlockQuoteUI from './blockquoteui';

/**
 * The block quote plugin.
 *
 * For more information about this feature check the {@glink api/block-quote package page}.
 *
 * This is a "glue" plugin which loads the {@link module:block-quote/blockquoteediting~BlockQuoteEditing block quote editing feature}
 * and {@link module:block-quote/blockquoteui~BlockQuoteUI block quote UI feature}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class BlockQuote extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ BlockQuoteEditing, BlockQuoteUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'BlockQuote';
	}
}
