/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module image/image/insertimagecommand
 */
import { Command, type Editor } from 'ckeditor5/src/core';
import { type ArrayOrItem } from 'ckeditor5/src/utils';
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
 * ```ts
 * editor.execute( 'insertImage', { source: 'http://url.to.the/image' } );
 * ```
 *
 * It is also possible to insert multiple images at once:
 *
 * ```ts
 * editor.execute( 'insertImage', {
 * 	source:  [
 * 		'path/to/image.jpg',
 * 		'path/to/other-image.jpg'
 * 	]
 * } );
 * ```
 *
 * If you want to take the full control over the process, you can specify individual model attributes:
 *
 * ```ts
 * editor.execute( 'insertImage', {
 * 	source:  [
 * 		{ src: 'path/to/image.jpg', alt: 'First alt text' },
 * 		{ src: 'path/to/other-image.jpg', alt: 'Second alt text', customAttribute: 'My attribute value' }
 * 	]
 * } );
 * ```
 */
export default class InsertImageCommand extends Command {
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Executes the command.
     *
     * @fires execute
     * @param options Options for the executed command.
     * @param options.source The image source or an array of image sources to insert.
     * See the documentation of the command to learn more about accepted formats.
     */
    execute(options: {
        source: ArrayOrItem<string | Record<string, unknown>>;
    }): void;
}
