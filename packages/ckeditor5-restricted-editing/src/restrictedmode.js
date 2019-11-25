/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module restricted-editing/restrictedmode
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import RestrictedModeEditing from './restrictedmodeediting';
import RestrictedModeUI from './restrictedmodeui';

import '../theme/restrictedediting.css';

/**
 * The restricted mode plugin.
 *
 * This is a "glue" plugin which loads the following plugins:
 *
 * * The restricted mode editing feature and
 * * The restricted mode ui feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class RestrictedMode extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'RestrictedMode';
	}

	static get requires() {
		return [ RestrictedModeEditing, RestrictedModeUI ];
	}
}
