/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module find-and-replace/findandreplaceconfig
 */

/**
 * The configuration of the find and replace feature.
 * The option is used by the {@link module:find-and-replace/findandreplace~FindAndReplace} feature.
 *
 * ```ts
 * ClassicEditor
 *   .create( {
 *     findAndReplace: ... // Find and replace feature config.
 *   } )
 *   .then( ... )
 *   .catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 */
export interface FindAndReplaceConfig {

	/**
	 * The type of the find and replace UI opened by the `'findAndReplace'` button registered in the
	 * editor's {@link module:ui/componentfactory~ComponentFactory component factory}
	 *
	 * The default value is `'dialog'`.
	 */
	uiType?: 'dialog' | 'dropdown';
}
