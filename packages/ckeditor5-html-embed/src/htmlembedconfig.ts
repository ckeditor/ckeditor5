/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module html-embed/htmlembedconfig
 */

/**
 * The configuration of the HTML embed feature.
 *
 * ```ts
 * ClassicEditor
 *   .create( editorElement, {
 *     htmlEmbed: ... // HTML embed feature options.
 *   } )
 * 	 .then( ... )
 *   .catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 */
export interface HtmlEmbedConfig {

	/**
	 * Whether the feature should render previews of the embedded HTML.
	 *
	 * When set to `true`, the feature will produce a preview of the inserted HTML based on a sanitized
	 * version of the HTML provided by the user.
	 *
	 * The function responsible for sanitizing the HTML needs to be specified in
	 * {@link module:html-embed/htmlembedconfig~HtmlEmbedConfig#sanitizeHtml `config.htmlEmbed.sanitizeHtml()`}.
	 *
	 * Read more about the security aspect of this feature in the {@glink features/html/html-embed#security "Security"} section of
	 * the {@glink features/html/html-embed HTML embed} feature guide.
	 */
	showPreviews?: boolean;

	/**
	 * Callback used to sanitize the HTML provided by the user in HTML embed widget when it is previewed inside the editor.
	 *
	 * We strongly recommend overwriting the default function to avoid XSS vulnerabilities.
	 *
	 * Read more about the security aspect of this feature in the {@glink features/html/html-embed#security "Security"} section of
	 * the {@glink features/html/html-embed HTML embed} feature guide.
	 *
	 * The function receives the input HTML (as a string), and should return an object
	 * that matches the {@link module:html-embed/htmlembedconfig~HtmlEmbedSanitizeOutput} interface.
	 *
	 * ```ts
	 * ClassicEditor
	 *   .create( editorElement, {
	 *     htmlEmbed: {
	 *       showPreviews: true,
	 *       sanitizeHtml( inputHtml ) {
	 *         // Strip unsafe elements and attributes, e.g.:
	 *         // the `<script>` elements and `on*` attributes.
	 *         const outputHtml = sanitize( inputHtml );
	 *
	 *         return {
	 *           html: outputHtml,
	 *           // true or false depending on whether the sanitizer stripped anything.
	 *           hasChanged: ...
	 *         };
	 *       },
	 *     }
	 *   } )
	 *   .then( ... )
	 *   .catch( ... );
	 * ```
	 *
	 * **Note:** The function is used only when the feature
	 * {@link module:html-embed/htmlembedconfig~HtmlEmbedConfig#showPreviews is configured to render previews}.
	 */
	sanitizeHtml?: ( html: string ) => HtmlEmbedSanitizeOutput;
}

/**
 * An object returned by the {@link module:html-embed/htmlembedconfig~HtmlEmbedConfig#sanitizeHtml} function.
 */
export interface HtmlEmbedSanitizeOutput {

	/**
	 * An output (safe) HTML that will be inserted into the {@glink framework/architecture/editing-engine editing view}.
	 */
	html: string;

	/**
	 * A flag that indicates whether the output HTML is different than the input value.
	 */
	hasChanged: boolean;
}
