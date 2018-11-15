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

		const fileRepository = editor.plugins.get( FileRepository );

		editor.model.change( writer => {
			const filesToUpload = Array.isArray( options.files ) ? options.files : [ options.files ];

			for ( const file of filesToUpload ) {
				uploadImage( writer, editor, fileRepository, file );
			}
		} );
	}
}

// Handles uploading single file.
//
// @param {module:engine/model/writer~writer} writer
// @param {module:core/editor/editor~Editor} editor
// @param {File} file
function uploadImage( writer, editor, fileRepository, file ) {
	const loader = fileRepository.createLoader( file );

	// Do not throw when upload adapter is not set. FileRepository will log an error anyway.
	if ( !loader ) {
		return;
	}

	insertImage( writer, editor, { uploadId: loader.id } );
}
