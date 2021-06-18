/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { Command } from 'ckeditor5/src/core';
import { logWarning, toArray } from 'ckeditor5/src/utils';

/**
 * @module image/image/insertimagecommand
 */

/**
 * Insert image command.
 *
 * The command is registered by the {@link module:image/image/imageediting~ImageEditing} plugin as `insertImage`
 * and it is also available via aliased `imageInsert` name.
 *
 * In order to insert an image at the current selection position
 * (according to the {@link module:widget/utils~findOptimalInsertionRange} algorithm),
 * execute the command and specify the image source:
 *
 *		editor.execute( 'insertImage', { source: 'http://url.to.the/image' } );
 *
 * It is also possible to insert multiple images at once:
 *
 *		editor.execute( 'insertImage', {
 *			source:  [
 *				'path/to/image.jpg',
 *				'path/to/other-image.jpg'
 *			]
 *		} );
 *
 * If you want to take the full control over the process, you can specify individual model attributes:
 *
 *		editor.execute( 'insertImage', {
 *			source:  [
 *				{ src: 'path/to/image.jpg', alt: 'First alt text' },
 *				{ src: 'path/to/other-image.jpg', alt: 'Second alt text', customAttribute: 'My attribute value' }
 *			]
 *		} );
 *
 * @extends module:core/command~Command
 */
export default class InsertImageCommand extends Command {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		const configImageInsertType = editor.config.get( 'image.insert.type' );

		if ( !editor.plugins.has( 'ImageBlockEditing' ) ) {
			if ( configImageInsertType === 'block' ) {
				/**
				 * The {@link module:image/imageblock~ImageBlock} plugin must be enabled to allow inserting block images. See
				 * {@link module:image/imageinsert~ImageInsertConfig#type} to learn more.
				 *
				 * @error image-block-plugin-required
				 */
				logWarning( 'image-block-plugin-required' );
			}
		}

		if ( !editor.plugins.has( 'ImageInlineEditing' ) ) {
			if ( configImageInsertType === 'inline' ) {
				/**
				 * The {@link module:image/imageinline~ImageInline} plugin must be enabled to allow inserting inline images. See
				 * {@link module:image/imageinsert~ImageInsertConfig#type} to learn more.
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
		this.isEnabled = this.editor.plugins.get( 'ImageUtils' ).isImageAllowed();
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param {Object} options Options for the executed command.
	 * @param {String|Array.<String>|Array.<Object>} options.source The image source or an array of image sources to insert.
	 * See the documentation of the command to learn more about accepted formats.
	 */
	execute( options ) {
		const sourceDefinitions = toArray( options.source );
		const selection = this.editor.model.document.selection;
		const imageUtils = this.editor.plugins.get( 'ImageUtils' );

		// In case of multiple images, each image (starting from the 2nd) will be inserted at a position that
		// follows the previous one. That will move the selection and, to stay on the safe side and make sure
		// all images inherit the same selection attributes, they are collected beforehand.
		//
		// Applying these attributes ensures, for instance, that inserting an (inline) image into a link does
		// not split that link but preserves its continuity.
		//
		// Note: Selection attributes that do not make sense for images will be filtered out by insertImage() anyway.
		const selectionAttributes = Object.fromEntries( selection.getAttributes() );

		sourceDefinitions.forEach( ( sourceDefinition, index ) => {
			const selectedElement = selection.getSelectedElement();

			if ( typeof sourceDefinition === 'string' ) {
				sourceDefinition = { src: sourceDefinition };
			}

			// Inserting of an inline image replace the selected element and make a selection on the inserted image.
			// Therefore inserting multiple inline images requires creating position after each element.
			if ( index && selectedElement && imageUtils.isImage( selectedElement ) ) {
				const position = this.editor.model.createPositionAfter( selectedElement );

				imageUtils.insertImage( { ...sourceDefinition, ...selectionAttributes }, position );
			} else {
				imageUtils.insertImage( { ...sourceDefinition, ...selectionAttributes } );
			}
		} );
	}
}
