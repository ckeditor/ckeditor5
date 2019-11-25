/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module restricted-editing/standardmode
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import StandardModeEditing from './standardmodeediting';
import StandardModeUI from './standardmodeui';

import '../theme/restrictedediting.css';

/**
 * @extends module:core/plugin~Plugin
 */
export default class StandardMode extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'StandardMode';
	}

	static get requires() {
		return [ StandardModeEditing, StandardModeUI ];
	}
}
