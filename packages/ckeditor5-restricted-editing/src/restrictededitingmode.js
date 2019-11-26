/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module restricted-editing/restrictededitingmode
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import RestrictedEditingModeEditing from './restrictededitingmodeediting';
import RestrictedEditingModeUI from './restrictededitingmodeui';

import '../theme/restrictedediting.css';

/**
 * The Restricted Editing Mode plugin.
 *
 * This is a "glue" plugin which loads the following plugins:
 *
 * * The {@link module:restricted-editing/restrictededitingmodeediting~RestrictedEditingModeEditing restricted mode editing feature} and
 * * The {@link module:restricted-editing/restrictededitingmodeui~RestrictedEditingModeUI restricted mode ui feature}.
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
 * 				restrictedEditing: ... // Restricted editing mode feature config.
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
 * Define which feature commands should be enabled in restricted editing mode. The commands used for typing and deleting text
 * (`'input'`, `'delete'` and `'forwardDelete'`) are allowed inside non-restricted regions.
 *
 * **Note**: The restricted editing mode always allows to use restricted mode navigation commands as well as `'undo'` and `'redo'` commands.
 *
 * The default value is:
 *
 *		const restrictedEditingConfig = {
 *			allowedCommands: [ 'bold', 'italic', 'link' ]
 *		};
 *
 * @member {Array.<String>} module:restricted-editing/restrictededitingmode~RestrictedEditingModeConfig#allowedCommands
 */
