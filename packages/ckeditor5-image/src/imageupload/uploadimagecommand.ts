/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { FileRepository } from 'ckeditor5/src/upload.js';
import { Command, type Editor } from 'ckeditor5/src/core.js';
import { toArray, type ArrayOrItem } from 'ckeditor5/src/utils.js';
import type { Position } from 'ckeditor5/src/engine.js';

import type ImageUtils from '../imageutils.js';

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
 * ```ts
 * this.listenTo( editor.editing.view.document, 'clipboardInput', ( evt, data ) => {
 * 	// Assuming that only images were pasted:
 * 	const images = Array.from( data.dataTransfer.files );
 *
 * 	// Upload the first image:
 * 	editor.execute( 'uploadImage', { file: images[ 0 ] } );
 * } );
 * ```
 *
 * It is also possible to insert multiple images at once:
 *
 * ```ts
 * editor.execute( 'uploadImage', {
 * 	file: [
 * 		file1,
 * 		file2
 * 	]
 * } );
 * ```
 */
export default class UploadImageCommand extends Command {
	/**
	 * The command property: `false` if there is no permission on image upload, otherwise `true`.
	 *
	 * @observable
	 * @internal
	 */
	declare public isAccessAllowed: boolean;

	/**
	 * Creates an instance of the `imageUlpoad` command. When executed, the command upload one of
	 * the currently selected image from computer.
	 *
	 * @param editor The editor instance.
	 */
	constructor( editor: Editor ) {
		super( editor );

		this.set( 'isAccessAllowed', true );
	}

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const editor = this.editor;
		const imageUtils: ImageUtils = editor.plugins.get( 'ImageUtils' );
		const selectedElement = editor.model.document.selection.getSelectedElement()!;

		// TODO: This needs refactoring.
		this.isEnabled = imageUtils.isImageAllowed() || imageUtils.isImage( selectedElement );
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param options Options for the executed command.
	 * @param options.file The image file or an array of image files to upload.
	 */
	public override execute( options: { file: ArrayOrItem<File> } ): void {
		const files = toArray( options.file );
		const selection = this.editor.model.document.selection;
		const imageUtils: ImageUtils = this.editor.plugins.get( 'ImageUtils' );

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
	 */
	private _uploadImage( file: File, attributes: object, position?: Position ): void {
		const editor = this.editor;
		const fileRepository = editor.plugins.get( FileRepository );
		const loader = fileRepository.createLoader( file );
		const imageUtils: ImageUtils = editor.plugins.get( 'ImageUtils' );

		// Do not throw when upload adapter is not set. FileRepository will log an error anyway.
		if ( !loader ) {
			return;
		}

		imageUtils.insertImage( { ...attributes, uploadId: loader.id }, position );
	}
}
