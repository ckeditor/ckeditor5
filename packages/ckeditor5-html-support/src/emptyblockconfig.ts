/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module html-support/emptyblockconfig
 */

/**
 * The configuration of the Empty Block feature.
 * The option is used by the {@link module:html-support/emptyblock~EmptyBlock} feature.
 *
 * ```ts
 * ClassicEditor
 * 	.create( {
 * 		emptyBlock: ... // Empty block feature config.
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 */
export interface EmptyBlockConfig {

    /**
     * When set to `true`, empty blocks will be preserved in the editing view.
     * When `false` (default), empty blocks are only preserved in the data output.
     *
     * @default false
     */
    preserveInEditingView?: boolean;
}
