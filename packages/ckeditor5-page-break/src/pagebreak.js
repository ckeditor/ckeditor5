/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module page-break/pagebreak
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import PageBreakEditing from './pagebreakediting';
import PageBreakUI from './pagebreakui';

/**
 * The page break feature.
 *
 * It provides the possibility to insert a page break into the rich-text editor.
 *
 * For a detailed overview, check the {@glink features/page-break Page break feature} documentation.
 *
 * @extends module:core/plugin~Plugin
 */
export default class PageBreak extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ PageBreakEditing, PageBreakUI, Widget ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'PageBreak';
	}
}
