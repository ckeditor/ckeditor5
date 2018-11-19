/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';
import Command from '@ckeditor/ckeditor5-core/src/command';
import { insertImage, isImageAllowed } from '../image/utils';

/**
 * @module image/imageupload/imageuploadcommand
 */

/**
 * Image upload command.
 *
 * @extends module:core/command~Command
 */
export default class ImageUploadCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		this.isEnabled = isImageAllowed( this.editor.model );
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param {Object} options Options for the executed command.
	 * @param {File|Array.<File>} options.files The image file or an array of image files to upload.
	 */
	execute( options ) {
		const editor = this.editor;
		const model = editor.model;

		const fileRepository = editor.plugins.get( FileRepository );

		model.change( writer => {
			const filesToUpload = Array.isArray( options.files ) ? options.files : [ options.files ];

			for ( const file of filesToUpload ) {
				uploadImage( writer, model, fileRepository, file );
			}
		} );
	}
}

// Handles uploading single file.
//
// @param {module:engine/model/writer~writer} writer
// @param {module:engine/model/model~Model} model
// @param {File} file
function uploadImage( writer, model, fileRepository, file ) {
	const loader = fileRepository.createLoader( file );

	// Do not throw when upload adapter is not set. FileRepository will log an error anyway.
	if ( !loader ) {
		return;
	}

	insertImage( writer, model, { uploadId: loader.id } );
}
