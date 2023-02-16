/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module restricted-editing/restrictededitingmode
 */

import { Plugin } from 'ckeditor5/src/core';

import RestrictedEditingModeEditing from './restrictededitingmodeediting';
import RestrictedEditingModeUI from './restrictededitingmodeui';

import '../theme/restrictedediting.css';

/**
 * The restricted editing mode plugin.
 *
 * This is a "glue" plugin which loads the following plugins:
 *
 * * The {@link module:restricted-editing/restrictededitingmodeediting~RestrictedEditingModeEditing restricted mode editing feature}.
 * * The {@link module:restricted-editing/restrictededitingmodeui~RestrictedEditingModeUI restricted mode UI feature}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class RestrictedEditingMode extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'RestrictedEditingMode';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ RestrictedEditingModeEditing, RestrictedEditingModeUI ];
	}
}

/**
 * The configuration of the restricted editing mode feature. Introduced by the
 * {@link module:restricted-editing/restrictededitingmode~RestrictedEditingMode} feature.
 *
 * Read more in {@link module:restricted-editing/restrictededitingmode~RestrictedEditingModeConfig}.
 *
 * @member {module:restricted-editing/restrictededitingmode~RestrictedEditingModeConfig}
 * module:core/editor/editorconfig~EditorConfig#restrictedEditing
 */

/**
 * The configuration of the restricted editing mode feature.
 * The option is used by the {@link module:restricted-editing/restrictededitingmode~RestrictedEditingMode} feature.
 *
 *		ClassicEditor
 *			.create( {
 * 				restrictedEditing: {
 * 					allowedCommands: [ 'bold', 'link', 'unlink' ],
 * 					allowedAttributes: [ 'bold', 'linkHref' ]
 * 				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface module:restricted-editing/restrictededitingmode~RestrictedEditingModeConfig
 */

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
 *		const restrictedEditingConfig = {
 *			allowedCommands: [ 'bold', 'italic', 'link', 'unlink' ]
 *		};
 *
 * To make a command always enabled (also outside non-restricted areas) use
 * {@link module:restricted-editing/restrictededitingmodeediting~RestrictedEditingModeEditing#enableCommand} method.
 *
 * @member {Array.<String>} module:restricted-editing/restrictededitingmode~RestrictedEditingModeConfig#allowedCommands
 */

/**
 * The text attribute names allowed when pasting content ot non-restricted areas.
 *
 * The default value is:
 *
 *		const restrictedEditingConfig = {
 *			allowedAttributes: [ 'bold', 'italic', 'linkHref' ]
 *		};
 *
 * @member {Array.<String>} module:restricted-editing/restrictededitingmode~RestrictedEditingModeConfig#allowedAttributes
 */
