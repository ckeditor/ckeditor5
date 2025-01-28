/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module page-break/pagebreak
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { Widget } from 'ckeditor5/src/widget.js';

import PageBreakEditing from './pagebreakediting.js';
import PageBreakUI from './pagebreakui.js';

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
	public static get pluginName() {
		return 'PageBreak' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}
}
