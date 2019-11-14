/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module core/restricteddocument
 */

import Plugin from './plugin';
import RestrictedDocumentCommand from './restricteddocumentcommand';

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
