/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module restricted-editing/standardeditingmode
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import StandardEditingModeEditing from './standardeditingmodeediting';
import StandardEditingModeUI from './standardeditingmodeui';

import '../theme/restrictedediting.css';

/**
 * The standard editing mode plugin.
 *
 * This is a "glue" plugin that loads the following plugins:
 *
 * * The {@link module:restricted-editing/standardeditingmodeediting~StandardEditingModeEditing standard mode editing feature}.
 * * The {@link module:restricted-editing/standardeditingmodeui~StandardEditingModeUI standard mode UI feature}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class StandardEditingMode extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'StandardEditingMode';
	}

	static get requires() {
		return [ StandardEditingModeEditing, StandardEditingModeUI ];
	}
}
