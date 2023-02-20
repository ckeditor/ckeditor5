/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module restricted-editing/restrictededitingmode
 */

import { Plugin, type PluginDependencies } from 'ckeditor5/src/core';

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
 */
export default class RestrictedEditingMode extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'RestrictedEditingMode' {
		return 'RestrictedEditingMode';
	}

	/**
	 * @inheritDoc
	 */
	public static get requires(): PluginDependencies {
		return [ RestrictedEditingModeEditing, RestrictedEditingModeUI ];
	}
}

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ RestrictedEditingMode.pluginName ]: RestrictedEditingMode;
	}
}
