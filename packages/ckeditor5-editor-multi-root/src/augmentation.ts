/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

declare module '@ckeditor/ckeditor5-core' {
	interface RootConfig {

		/**
		 * Flag for the root that exist in the document but is not initially loaded by the editor.
		 *
		 * **Important! Lazy roots loading is an experimental feature, and may become deprecated. Be advised of the following
		 * known limitations:**
		 *
		 * * **Real-time collaboration integrations that use
		 * [uploaded editor bundles](https://ckeditor.com/docs/cs/latest/guides/collaboration/editor-bundle.html) are not supported. Using
		 * lazy roots will lead to unexpected behavior and data loss.**
		 * * **Revision history feature will read and process the whole document on editor initialization, possibly defeating the purpose
		 * of using the lazy roots loading. Additionally, when the document is loaded for the first time, all roots need to be loaded,
		 * to make sure that the initial revision data includes all roots. Otherwise, you may experience data loss.**
		 * * **Multiple features, that require full document data to be loaded, will produce incorrect or confusing results if not all
		 * roots are loaded. These include: bookmarks, find and replace, word count, pagination, document exports, document outline,
		 * and table of contents.**
		 *
		 * These roots can be loaded at any time after the editor has been initialized, using
		 * {@link module:editor-multi-root/multirooteditor~MultiRootEditor#loadRoot `MultiRootEditor#lazyRoot()`}.
		 *
		 * This is useful for handling big documents that contain hundreds of roots, or contain very large roots, which may have
		 * impact editor performance if loaded all at once.
		 *
		 * **Note: This configuration option is supported only by the
		 * {@link module:editor-multi-root/multirooteditor~MultiRootEditor multi-root} editor type.**
		 *
		 * **Note: This property has been deprecated and will be removed in the future versions of CKEditor.**
		 *
		 * @deprecated
		 */
		lazyLoad?: boolean;
	}
}
