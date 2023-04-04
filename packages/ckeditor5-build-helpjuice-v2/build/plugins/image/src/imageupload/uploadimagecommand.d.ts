/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import { Command } from 'ckeditor5/src/core';
import { type ArrayOrItem } from 'ckeditor5/src/utils';
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
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Executes the command.
     *
     * @fires execute
     * @param options Options for the executed command.
     * @param options.file The image file or an array of image files to upload.
     */
    execute(options: {
        file: ArrayOrItem<File>;
    }): void;
    /**
     * Handles uploading single file.
     */
    private _uploadImage;
}
