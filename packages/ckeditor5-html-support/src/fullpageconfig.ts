/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module html-support/fullpageconfig
 */

/**
 * The configuration of the Full page editing feature.
 * The option is used by the {@link module:html-support/fullpage~FullPage} feature.
 *
 * ```ts
 * ClassicEditor
 * 	.create( {
 * 		fullPage: ... // Full page feature config.
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 */

export interface FullPageConfig {

	/**
	 * Whether the feature should allow the editor to render styles from the `<head>` section of editor data content.
	 *
	 * When set to `true`, the editor will render styles from the `<head>` section of editor data content.
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( {
	 * 		fullPage: {
	 * 			allowRenderStylesFromHead: true
	 * 		}
	 * 	} )
	 * 	.then( ... )
	 * 	.catch( ... );
	 * ```
	 *
	 * @default false
	 */
	allowRenderStylesFromHead?: boolean;

	/**
	 * Callback used to sanitize the CSS provided by the user in editor content
	 * when option `fullPage.allowRenderStylesFromHead` is set to `true`.
	 *
	 * We strongly recommend overwriting the default function to avoid XSS vulnerabilities.
	 *
	 * The function receives the CSS (as a string), and should return an object
	 * that matches the {@link module:html-support/fullpageconfig~CssSanitizeOutput} interface.
	 *
	 * ```ts
	 * ClassicEditor
	 *   .create( editorElement, {
	 *     fullPage: {
	 *       allowRenderStylesFromHead: true,
	 *       sanitizeCss( CssString ) {
	 *         const sanitizedCss = sanitize( CssString );
	 *
	 *         return {
	 *           css: sanitizedCss,
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
	 */
	sanitizeCss?: ( css: string ) => CssSanitizeOutput;
}

export interface CssSanitizeOutput {

	/**
	 * An output (safe) CSS that will be inserted into the document.
	 */
	css: string;

	/**
	 * A flag that indicates whether the output CSS is different than the input value.
	 */
	hasChanged: boolean;
}
