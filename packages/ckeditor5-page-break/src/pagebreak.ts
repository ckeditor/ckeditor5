/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module page-break/pagebreak
 */

import { Plugin } from 'ckeditor5/src/core';
import { Widget } from 'ckeditor5/src/widget';

import PageBreakEditing from './pagebreakediting';
import PageBreakUI from './pagebreakui';

/**
 * The page break feature.
 *
 * It provides the possibility to insert a page break into the rich-text editor.
 *
 * For a detailed overview, check the {@glink features/page-break Page break feature} documentation.
 */
export default class PageBreak extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ PageBreakEditing, PageBreakUI, Widget ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'PageBreak' {
		return 'PageBreak';
	}
}
