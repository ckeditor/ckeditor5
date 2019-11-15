/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module restricted-editing/restricteddocument
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import RestrictedDocumentEditing from './restricteddocumentediting';
import RestrictedDocumentUI from './restricteddocumentui';

/**
 * @extends module:core/plugin~Plugin
 */
export default class RestrictedDocument extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'RestrictedDocument';
	}

	static get requires() {
		return [ RestrictedDocumentEditing, RestrictedDocumentUI ];
	}
}
