/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
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
	 * Callback used to sanitize the HTML provided by the user when generating previews of it in the editor.
	 *
	 * **This config property was deprecated. Use {@link module:core/editor/editorconfig~EditorConfig#sanitizeHtml `config.sanitizeHtml`}
	 * instead.**
	 *
	 * @deprecated
	 */
	sanitizeHtml?: ( html: string ) => HtmlEmbedSanitizeOutput;
}

/**
 * An object returned by the {@link module:html-embed/htmlembedconfig~HtmlEmbedConfig#sanitizeHtml} function.
 *
 * @deprecated
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
