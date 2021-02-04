/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { FileRepository } from 'ckeditor5/src/upload';
import { Command } from 'ckeditor5/src/core';
import { toArray } from 'ckeditor5/src/utils';

import { insertImage, isImage, isImageAllowed, isImageInline } from '../image/utils';

/**
 * @module image/imageupload/imageuploadcommand
 */

/**
 * The image upload command.
 *
 * The command is registered by the {@link module:image/imageupload/imageuploadediting~ImageUploadEditing} plugin as `'imageUpload'`.
 *
 * In order to upload an image at the current selection position
 * (according to the {@link module:widget/utils~findOptimalInsertionPosition} algorithm),
 * execute the command and pass the native image file instance:
 *
 *		this.listenTo( editor.editing.view.document, 'clipboardInput', ( evt, data ) => {
 *			// Assuming that only images were pasted:
 *			const images = Array.from( data.dataTransfer.files );
 *
 *			// Upload the first image:
 *			editor.execute( 'imageUpload', { file: images[ 0 ] } );
 *		} );
 *
 * It is also possible to insert multiple images at once:
 *
 *		editor.execute( 'imageUpload', {
 *			file: [
 *				file1,
 *				file2
 *			]
 *		} );
 *
 * @extends module:core/command~Command
 */
export default class ImageUploadCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const imageElement = this.editor.model.document.selection.getSelectedElement();
		const isImage = imageElement && [ 'image', 'imageInline' ].includes( imageElement.name ) || false;

		this.isEnabled = isImageAllowed( this.editor ) || isImage;
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param {Object} options Options for the executed command.
	 * @param {File|Array.<File>} options.file The image file or an array of image files to upload.
	 */
	execute( options ) {
		const files = toArray( options.file );
		const selection = this.editor.model.document.selection;
		const fileRepository = this.editor.plugins.get( FileRepository );

		files.forEach( ( file, idx ) => {
			const selectedElement = selection.getSelectedElement();

			// Inserting of an inline image replace the selected element and make a selection on the inserted image.
			// Therefore inserting multiple inline images requires creating position after each element.
			if ( idx && selectedElement && ( isImageInline( selectedElement ) || isImage( selectedElement ) ) ) {
				const position = this.editor.model.createPositionAfter( selectedElement );

				uploadImage( this.editor, fileRepository, file, position );
			} else {
				uploadImage( this.editor, fileRepository, file );
			}
		} );
	}
}

// Handles uploading single file.
//
// @param {module:core/editor/editor~Editor} editor
// @param {module:upload/filerepository~FileRepository} fileRepository
// @param {File} file
// @param {module:engine/model/position~Position} position
function uploadImage( editor, fileRepository, file, position ) {
	const loader = fileRepository.createLoader( file );

	// Do not throw when upload adapter is not set. FileRepository will log an error anyway.
	if ( !loader ) {
		return;
	}

	insertImage( editor, { uploadId: loader.id }, position );
}
