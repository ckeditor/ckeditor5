/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module restricted-editing/restrictededitingconfig
 */

/**
 * The configuration of the restricted editing mode feature.
 * The option is used by the {@link module:restricted-editing/restrictededitingmode~RestrictedEditingMode} feature.
 *
 * ```ts
 * ClassicEditor
 *   .create( {
 *     restrictedEditing: {
 *       allowedCommands: [ 'bold', 'link', 'unlink' ],
 *       allowedAttributes: [ 'bold', 'linkHref' ]
 *     }
 *   } )
 *   .then( ... )
 *   .catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 */
export interface RestrictedEditingConfig {

	/**
	 * The command names allowed in non-restricted areas of the content.
	 *
	 * Defines which feature commands should be enabled in the restricted editing mode. The commands used for typing and deleting text
	 * (`'input'`, `'delete'` and `'deleteForward'`) are allowed by the feature inside non-restricted regions and do not need to be defined.
	 *
	 * **Note**: The restricted editing mode always allows to use the restricted mode navigation commands as well as `'undo'` and `'redo'`
	 * commands.
	 *
	 * The default value is:
	 *
	 * ```ts
	 * const restrictedEditingConfig = {
	 *   allowedCommands: [ 'bold', 'italic', 'link', 'unlink' ]
	 * };
	 * ```
	 *
	 * Only inline content inserting or editing commands are allowed in this setting. Block content commands such as
	 * `insertTable` or `enter` cannot be allowed via this setting, as they are not supported in the restricted editing mode.
	 *
	 * To make a command always enabled (also outside non-restricted areas) use the
	 * {@link module:restricted-editing/restrictededitingmodeediting~RestrictedEditingModeEditing#enableCommand} method.
	 */
	allowedCommands: Array<string>;

	/**
	 * The text attribute names allowed when pasting content ot non-restricted areas.
	 *
	 * The default value is:
	 *
	 * ```ts
	 * const restrictedEditingConfig = {
	 *   allowedAttributes: [ 'bold', 'italic', 'linkHref' ]
	 * };
	 * ```
	 */
	allowedAttributes: Array<string>;
}
