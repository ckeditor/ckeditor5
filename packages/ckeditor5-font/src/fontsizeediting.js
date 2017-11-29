/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/fontsizeediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

/**
 * The Font Size Editing feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class FontSizeEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		editor.config.define( 'fontSize', { items: [] } );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		// Allow highlight attribute on all elements
		editor.document.schema.allow( { name: '$inline', attributes: 'fontSize', inside: '$block' } );
		// Temporary workaround. See https://github.com/ckeditor/ckeditor5/issues/477.
		editor.document.schema.allow( { name: '$inline', attributes: 'fontSize', inside: '$clipboardHolder' } );
	}
}
