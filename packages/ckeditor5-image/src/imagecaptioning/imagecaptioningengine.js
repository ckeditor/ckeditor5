/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagecaptioning/imagecaptioningengine
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class ImageCaptioningEngine extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const document = editor.document;
		const schema = document.schema;

		schema.registerItem( 'caption' );
		schema.allow( { name: '$inline', inside: 'caption' } );
		schema.allow( { name: 'caption', inside: 'image' } );
	}
}
