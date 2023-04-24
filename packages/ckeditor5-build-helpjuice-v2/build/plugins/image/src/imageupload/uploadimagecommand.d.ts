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
export default class UploadImageCommand {
    /**
     * @inheritDoc
     */
    refresh(): void;
    isEnabled: any;
    /**
     * Executes the command.
     *
     * @fires execute
     * @param {Object} options Options for the executed command.
     * @param {File|Array.<File>} options.file The image file or an array of image files to upload.
     */
    execute(options: {
        file: File | Array<File>;
    }): void;
    /**
     * Handles uploading single file.
     *
     * @private
     * @param {File} file
     * @param {Object} attributes
     * @param {module:engine/model/position~Position} position
     */
    private _uploadImage;
}
