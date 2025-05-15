/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module bookmark/bookmarkconfig
 */

/**
 * The configuration of the bookmark feature.
 *
 * The properties defined in this config are set in the `config.bookmark` namespace.
 *
 * ```ts
 * ClassicEditor
 * 	.create( editorElement, {
 * 		bookmark: {
 * 			// Bookmark configuration.
 * 		}
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 */
export interface BookmarkConfig {

	/**
	 * Allows to convert into bookmarks non-empty anchor elements.
	 *
	 * With this option enabled you will have all non-empty anchors converted into bookmakrs.
	 * For example:
	 *
	 *```html
	 * <a id="bookmark">Bookmark</a>
	 *```
	 *
	 * will be converted into:
	 *
	 *```html
	 * <a id="bookmark"></a>Bookmark
	 *```
	 *
	 * **Note:** This is enabled by default.
	 *
	 * @default true
	 */
	enableNonEmptyAnchorConversion?: boolean;

	/**
	 * Items to be placed in the bookmark contextual toolbar.
	 *
	 * Assuming that you use the {@link module:bookmark/bookmarkui~BookmarkUI} feature, the following toolbar items will be available
	 * in {@link module:ui/componentfactory~ComponentFactory}:
	 *
	 * * `'bookmarkPreview'`,
	 * * `'editBookmark'`,
	 * * `'removeBookmark'`.
	 *
	 * The default configuration for bookmark toolbar is:
	 *
	 * ```ts
	 * const bookmarkConfig = {
	 * 	toolbar: [ 'bookmarkPreview', '|', 'editBookmark', 'removeBookmark' ]
	 * };
	 * ```
	 *
	 * Of course, the same buttons can also be used in the
	 * {@link module:core/editor/editorconfig~EditorConfig#toolbar main editor toolbar}.
	 *
	 * Read more about configuring the toolbar in {@link module:core/editor/editorconfig~EditorConfig#toolbar}.
	 */
	toolbar?: Array<string>;
}
