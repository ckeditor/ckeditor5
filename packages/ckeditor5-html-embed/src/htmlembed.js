/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-embed/htmlembed
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import HTMLEmbedEditing from './htmlembedediting';
import HTMLEmbedUI from './htmlembedui';

/**
 * The HTML embed feature.
 *
 * @TODO: What does it allow doing?
 *
 * For a detailed overview, check the {@glink features/html-embed HTML embed feature} documentation.
 *
 * @extends module:core/plugin~Plugin
 */
export default class HTMLEmbed extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ HTMLEmbedEditing, HTMLEmbedUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'HTMLEmbed';
	}
}
