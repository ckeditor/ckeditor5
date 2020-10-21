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
 * Controls the view produced by the feature.
 *
 * When `false` (default), the feature produces the `<textarea>` element in the view.
 *
 * When `true`, the inserted HTML will be injected directly to the editor.
 *
 * **Note:** If the option was set to `true`, do not forget about implementing
 * the {@link module:html-embed/htmlembed~HtmlEmbedConfig#sanitizeHtml `htmlEmbed.sanitizeHtml()`} function that will control
 * the output HTML.
 *
 * @member {Boolean} [module:html-embed/htmlembed~HtmlEmbedConfig#showPreviews=false]
 */

/**
 * Allows modifying an input HTML before injecting it directly to the editor's view.
 *
 * We strongly recommend to overwrite the default function to avoid XSS vulnerability.
 *
 * The function receives an input HTML (`String`), and should return an object
 * that match to the {@link module:html-embed/htmlembed~HtmlEmbedSanitizeOutput} interface.
 *
 *  	ClassicEditor
 *			.create( editorElement, {
 * 				htmlEmbed: {
 * 				    showPreviews: true,
 * 				    sanitizeHtml( inputHtml ) {
 * 				        // Strip dangerous elements and attributes, e.g.:
 * 				        // the `<script>` elements or `[on*]` attributes.
 *
 * 				        return {
 * 				            html: ...,
 * 				            hasModified: ...
 * 				        }
 * 				    },
 * 				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 *	**Note:** The function is used only if the feature has enabled previews in the view
 *	({@link module:html-embed/htmlembed~HtmlEmbedConfig#showPreviews} is set to `true`).
 *
 * @member {Function} [module:html-embed/htmlembed~HtmlEmbedConfig#sanitizeHtml]
 */

/**
 * An object returned by the {@link module:html-embed/htmlembed~HtmlEmbedConfig#sanitizeHtml} function should match to this interface.
 *
 * @interface HtmlEmbedSanitizeOutput
 */

/**
 * An output HTML that will be inserted into the {@glink framework/guides/architecture/editing-engine editing view}.
 *
 * @member {String} module:html-embed/htmlembed~HtmlEmbedSanitizeOutput#html
 */

/**
 * A flag that describes whether the output HTML is different that an input value.
 *
 * @member {Boolean} [module:html-embed/htmlembed~HtmlEmbedSanitizeOutput#hasModified]
 */
