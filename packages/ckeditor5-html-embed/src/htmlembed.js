/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-embed/htmlembed
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import HtmlEmbedEditing from './htmlembedediting';
import HtmlEmbedUI from './htmlembedui';

/**
 * The HTML embed feature.
 *
 * It allows inserting HTML snippets directly to the editor.
 *
 * For a detailed overview, check the {@glink features/html-embed HTML embed feature} documentation.
 *
 * @extends module:core/plugin~Plugin
 */
export default class HtmlEmbed extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ HtmlEmbedEditing, HtmlEmbedUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'HtmlEmbed';
	}
}

/**
 * The configuration of the HTML embed feature.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 * 				htmlEmbed: ... // HTML embed feature options.
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface HtmlEmbedConfig
 */

/**
 * TODO
 *
 * @member {Boolean} [module:html-embed/htmlembed~HtmlEmbedConfig#previewsInData=false]
 */

/**
 * TODO
 *
 * @member {Function} [module:html-embed/htmlembed~HtmlEmbedConfig#sanitizeHtml]
 */
