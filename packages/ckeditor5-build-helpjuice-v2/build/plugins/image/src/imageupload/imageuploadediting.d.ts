/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module image/imageupload/imageuploadediting
 */
import { Plugin, type Editor } from 'ckeditor5/src/core';
import { type Element, type Writer, type DataTransfer } from 'ckeditor5/src/engine';
import { Notification } from 'ckeditor5/src/ui';
import { ClipboardPipeline } from 'ckeditor5/src/clipboard';
import { FileRepository, type UploadResponse, type FileLoader } from 'ckeditor5/src/upload';
import ImageUtils from '../imageutils';
/**
 * The editing part of the image upload feature. It registers the `'uploadImage'` command
 * and the `imageUpload` command as an aliased name.
 *
 * When an image is uploaded, it fires the {@link ~ImageUploadEditing#event:uploadComplete `uploadComplete`} event
 * that allows adding custom attributes to the {@link module:engine/model/element~Element image element}.
 */
export default class ImageUploadEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof FileRepository, typeof Notification, typeof ClipboardPipeline, typeof ImageUtils];
    static get pluginName(): 'ImageUploadEditing';
    /**
     * An internal mapping of {@link module:upload/filerepository~FileLoader#id file loader UIDs} and
     * model elements during the upload.
     *
     * Model element of the uploaded image can change, for instance, when {@link module:image/image/imagetypecommand~ImageTypeCommand}
     * is executed as a result of adding caption or changing image style. As a result, the upload logic must keep track of the model
     * element (reference) and resolve the upload for the correct model element (instead of the one that landed in the `$graveyard`
     * after image type changed).
     */
    private readonly _uploadImageElements;
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * @inheritDoc
     */
    afterInit(): void;
    /**
     * Reads and uploads an image.
     *
     * The image is read from the disk and as a Base64-encoded string it is set temporarily to
     * `image[src]`. When the image is successfully uploaded, the temporary data is replaced with the target
     * image's URL (the URL to the uploaded image on the server).
     */
    protected _readAndUpload(loader: FileLoader): Promise<void>;
    /**
     * Creates the `srcset` attribute based on a given file upload response and sets it as an attribute to a specific image element.
     *
     * @param data Data object from which `srcset` will be created.
     * @param image The image element on which the `srcset` attribute will be set.
     */
    protected _parseAndSetSrcsetAttributeOnImage(data: Record<string, unknown>, image: Element, writer: Writer): void;
}
/**
 * Returns `true` if non-empty `text/html` is included in the data transfer.
 */
export declare function isHtmlIncluded(dataTransfer: DataTransfer): boolean;
/**
 * An event fired when an image is uploaded. You can hook into this event to provide
 * custom attributes to the {@link module:engine/model/element~Element image element} based on the data from
 * the server.
 *
 * ```ts
 * const imageUploadEditing = editor.plugins.get( 'ImageUploadEditing' );
 *
 * imageUploadEditing.on( 'uploadComplete', ( evt, { data, imageElement } ) => {
 * 	editor.model.change( writer => {
 * 		writer.setAttribute( 'someAttribute', 'foo', imageElement );
 * 	} );
 * } );
 * ```
 *
 * You can also stop the default handler that sets the `src` and `srcset` attributes
 * if you want to provide custom values for these attributes.
 *
 * ```ts
 * imageUploadEditing.on( 'uploadComplete', ( evt, { data, imageElement } ) => {
 * 	evt.stop();
 * } );
 * ```
 *
 * **Note**: This event is fired by the {@link module:image/imageupload/imageuploadediting~ImageUploadEditing} plugin.
 *
 * @eventName ~ImageUploadEditing#uploadComplete
 * @param data The `uploadComplete` event data.
 */
export type ImageUploadCompleteEvent = {
    name: 'uploadComplete';
    args: [data: ImageUploadCompleteData];
};
export type ImageUploadCompleteData = {
    /**
     * The data coming from the upload adapter.
     */
    data: UploadResponse;
    /**
     * The model {@link module:engine/model/element~Element image element} that can be customized.
     */
    imageElement: Element;
};
