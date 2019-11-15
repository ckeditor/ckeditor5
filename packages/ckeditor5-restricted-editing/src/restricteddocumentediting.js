/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module restricted-editing/restricteddocumentediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import RestrictedDocumentCommand from './restricteddocumentcommand';

/**
 * @extends module:core/plugin~Plugin
 */
export default class RestrictedDocumentEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'RestrictedDocumentEditing';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		editor.model.schema.extend( '$text', { allowAttributes: [ 'nonRestricted' ] } );

		editor.conversion.attributeToElement( {
			model: 'nonRestricted',
			view: {
				name: 'span',
				classes: 'ck-non-restricted'
			}
		} );

		editor.commands.add( 'nonRestricted', new RestrictedDocumentCommand( editor ) );
	}
}
