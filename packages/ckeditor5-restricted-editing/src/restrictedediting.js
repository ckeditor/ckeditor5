/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module restricted-editing/restrictedediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import RestrictedEditingEditing from './restrictededitingediting';
import RestrictedEditingUI from './restrictededitingui';

import '../theme/restrictedediting.css';

/**
 * @extends module:core/plugin~Plugin
 */
export default class RestrictedEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'RestrictedEditing';
	}

	static get requires() {
		return [ RestrictedEditingEditing, RestrictedEditingUI ];
	}
}
