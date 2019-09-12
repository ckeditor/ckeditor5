/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module page-break/pagebreak
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import PageBreakEditing from './pagebreakediting';
import PageBreakUI from './pagebreakui';

/**
 * The page break plugin provides a possibility to insert a page break in the rich-text editor.
 *
 * @extends module:core/plugin~Plugin
 */
export default class PageBreak extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ PageBreakEditing, PageBreakUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'PageBreak';
	}
}
