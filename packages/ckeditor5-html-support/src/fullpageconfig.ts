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
	 * Whether the feature should allow the editor to render styles from the `<head>` section of the document.
	 *
	 * When set to `true`, the editor will render styles from the `<head>` section of the document.
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
}
