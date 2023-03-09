/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type {
	RestrictedEditingMode,
	RestrictedEditingModeEditing,
	RestrictedEditingModeUI,
	StandardEditingMode,
	StandardEditingModeEditing,
	StandardEditingModeUI,
	RestrictedEditingConfig,
	RestrictedEditingExceptionCommand,
	RestrictedEditingModeNavigationCommand
} from './index';

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ RestrictedEditingMode.pluginName ]: RestrictedEditingMode;
		[ RestrictedEditingModeEditing.pluginName ]: RestrictedEditingModeEditing;
		[ RestrictedEditingModeUI.pluginName ]: RestrictedEditingModeUI;
		[ StandardEditingMode.pluginName ]: StandardEditingMode;
		[ StandardEditingModeEditing.pluginName ]: StandardEditingModeEditing;
		[ StandardEditingModeUI.pluginName ]: StandardEditingModeUI;
	}

	interface CommandsMap {
		restrictedEditingException: RestrictedEditingExceptionCommand;
		goToPreviousRestrictedEditingException: RestrictedEditingModeNavigationCommand;
		goToNextRestrictedEditingException: RestrictedEditingModeNavigationCommand;
	}

	interface EditorConfig {

		/**
		 * The configuration of the restricted editing mode feature. Introduced by the
		 * {@link module:restricted-editing/restrictededitingmode~RestrictedEditingMode} feature.
		 *
		 * Read more in {@link module:restricted-editing/restrictededitingconfig~RestrictedEditingConfig}.
		 */
		restrictedEditing?: RestrictedEditingConfig;
	}
}
