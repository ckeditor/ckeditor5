/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module source-editing/sourceeditingconfig
 */

/**
 * The configuration of the source editing feature.
 *
 * ```ts
 * ClassicEditor
 *   .create( {
 *     sourceEditing: {
 *         allowCollaborationFeatures: true
 *     }
 *   } )
 *   .then( ... )
 *   .catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 */
export interface SourceEditingConfig {

	/**
	 * Set to `true` to enable source editing feature for real-time collaboration.
	 *
	 * Please note that source editing feature is not fully compatible with real-time collaboration and using it may lead to data loss.
	 * {@glink features/source-editing/source-editing#limitations-and-incompatibilities Read more}.
	 *
	 * @default false
	 */
	allowCollaborationFeatures?: boolean;
}
