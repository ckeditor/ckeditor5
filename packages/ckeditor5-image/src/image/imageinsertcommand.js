/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { Command } from 'ckeditor5/src/core';
import { logWarning, toArray } from 'ckeditor5/src/utils';

import { insertImage, isImage, isImageAllowed, isImageInline } from './utils';

/**
 * @module image/image/imageinsertcommand
 */

/**
 * Insert image command.
 *
 * The command is registered by the {@link module:image/image/imageediting~ImageEditing} plugin as `'imageInsert'`.
 *
 * In order to insert an image at the current selection position
 * (according to the {@link module:widget/utils~findOptimalInsertionPosition} algorithm),
 * execute the command and specify the image source:
 *
 *		editor.execute( 'imageInsert', { source: 'http://url.to.the/image' } );
 *
 * It is also possible to insert multiple images at once:
 *
 *		editor.execute( 'imageInsert', {
 *			source:  [
 *				'path/to/image.jpg',
 *				'path/to/other-image.jpg'
 *			]
 *		} );
 *
 * @extends module:core/command~Command
 */
export default class ImageInsertCommand extends Command {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		const configImageInsertType = editor.config.get( 'image.insert.type' );

		if ( !editor.plugins.has( 'ImageBlockEditing' ) ) {
			if ( configImageInsertType === 'block' ) {
				/**
				 * When using the Image feature with the `image.insert.type="block"` option,
				 * the ImageBlockEditing plugin should be enabled to allow inserting of block images.
				 * Otherwise inline type image will be used despite the `block` option set.
				 *
				 * @error image-block-plugin-required
				 */
				logWarning( 'image-block-plugin-required' );
			}
		}

		if ( !editor.plugins.has( 'ImageInlineEditing' ) ) {
			if ( configImageInsertType === 'inline' ) {
				/**
				 * When using the Image feature with the `image.insert.type="inline"` option,
				 * the ImageInlineEditing plugin should be enabled to allow inserting of inline images.
				 * Otherwise block type image will be used despite the `inline` option set.
				 *
				 * @error image-inline-plugin-required
				 */
				logWarning( 'image-inline-plugin-required' );
			}
		}
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		this.isEnabled = isImageAllowed( this.editor );
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param {Object} options Options for the executed command.
	 * @param {String|Array.<String>} options.source The image source or an array of image sources to insert.
	 */
	execute( options ) {
		const sources = toArray( options.source );
		const selection = this.editor.model.document.selection;

		for ( const src of sources ) {
			const selectedElement = selection.getSelectedElement();

			// Inserting of an inline image replace the selected element and make a selection on the inserted image.
			// Therefore inserting multiple inline images requires creating position after each element.
			if ( sources.length > 1 && selectedElement && ( isImageInline( selectedElement ) || isImage( selectedElement ) ) ) {
				const position = this.editor.model.createPositionAfter( selectedElement );

				insertImage( this.editor, { src }, position );
			} else {
				insertImage( this.editor, { src }, selection );
			}
		}
	}
}
