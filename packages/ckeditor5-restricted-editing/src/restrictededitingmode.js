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
