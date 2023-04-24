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
export default class InsertImageCommand {
    /**
     * @inheritDoc
     */
    constructor(editor: any);
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
     * @param {String|Array.<String>|Array.<Object>} options.source The image source or an array of image sources to insert.
     * See the documentation of the command to learn more about accepted formats.
     */
    execute(options: {
        source: string | Array<string> | Array<Object>;
    }): void;
}
