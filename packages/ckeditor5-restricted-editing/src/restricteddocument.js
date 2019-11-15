/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module restricted-editing/restricteddocument
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import RestrictedEditingExceptionEditing from './restricteddocumentediting';
import RestrictedEditingExceptionUI from './restricteddocumentui';

/**
 * @extends module:core/plugin~Plugin
 */
export default class RestrictedEditingException extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'RestrictedEditingException';
	}

	static get requires() {
		return [ RestrictedEditingExceptionEditing, RestrictedEditingExceptionUI ];
	}
}
