/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
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
