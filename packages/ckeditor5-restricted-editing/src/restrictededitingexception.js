/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module restricted-editing/restrictededitingexception
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import RestrictedEditingExceptionEditing from './restrictededitingexceptionediting';
import RestrictedEditingExceptionUI from './restrictededitingexceptionui';

import '../theme/restrictedediting.css';

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
