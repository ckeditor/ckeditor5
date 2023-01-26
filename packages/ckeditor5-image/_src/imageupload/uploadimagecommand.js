/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { FileRepository } from 'ckeditor5/src/upload';
import { Command } from 'ckeditor5/src/core';
import { toArray } from 'ckeditor5/src/utils';

/**
 * @module image/imageupload/uploadimagecommand
 */

/**
 * The upload image command.
 *
 * The command is registered by the {@link module:image/imageupload/imageuploadediting~ImageUploadEditing} plugin as `uploadImage`
 * and it is also available via aliased `imageUpload` name.
 *
 * In order to upload an image at the current selection position
 * (according to the {@link module:widget/utils~findOptimalInsertionRange} algorithm),
 * execute the command and pass the native image file instance:
 *
 *		this.listenTo( editor.editing.view.document, 'clipboardInput', ( evt, data ) => {
 *			// Assuming that only images were pasted:
 *			const images = Array.from( data.dataTransfer.files );
 *
 *			// Upload the first image:
 *			editor.execute( 'uploadImage', { file: images[ 0 ] } );
 *		} );
 *
 * It is also possible to insert multiple images at once:
 *
 *		editor.execute( 'uploadImage', {
 *			file: [
 *				file1,
 *				file2
 *			]
 *		} );
 *
 * @extends module:core/command~Command
 */
export default class UploadImageCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const editor = this.editor;
		const imageUtils = editor.plugins.get( 'ImageUtils' );
		const selectedElement = editor.model.document.selection.getSelectedElement();

		// TODO: This needs refactoring.
		this.isEnabled = imageUtils.isImageAllowed() || imageUtils.isImage( selectedElement );
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
		const imageUtils = this.editor.plugins.get( 'ImageUtils' );

		// In case of multiple files, each file (starting from the 2nd) will be inserted at a position that
		// follows the previous one. That will move the selection and, to stay on the safe side and make sure
		// all images inherit the same selection attributes, they are collected beforehand.
		//
		// Applying these attributes ensures, for instance, that inserting an (inline) image into a link does
		// not split that link but preserves its continuity.
		//
		// Note: Selection attributes that do not make sense for images will be filtered out by insertImage() anyway.
		const selectionAttributes = Object.fromEntries( selection.getAttributes() );

		files.forEach( ( file, index ) => {
			const selectedElement = selection.getSelectedElement();

			// Inserting of an inline image replace the selected element and make a selection on the inserted image.
			// Therefore inserting multiple inline images requires creating position after each element.
			if ( index && selectedElement && imageUtils.isImage( selectedElement ) ) {
				const position = this.editor.model.createPositionAfter( selectedElement );

				this._uploadImage( file, selectionAttributes, position );
			} else {
				this._uploadImage( file, selectionAttributes );
			}
		} );
	}

	/**
	 * Handles uploading single file.
	 *
	 * @private
	 * @param {File} file
	 * @param {Object} attributes
	 * @param {module:engine/model/position~Position} position
	 */
	_uploadImage( file, attributes, position ) {
		const editor = this.editor;
		const fileRepository = editor.plugins.get( FileRepository );
		const loader = fileRepository.createLoader( file );
		const imageUtils = editor.plugins.get( 'ImageUtils' );

		// Do not throw when upload adapter is not set. FileRepository will log an error anyway.
		if ( !loader ) {
			return;
		}

		imageUtils.insertImage( { ...attributes, uploadId: loader.id }, position );
	}
}
