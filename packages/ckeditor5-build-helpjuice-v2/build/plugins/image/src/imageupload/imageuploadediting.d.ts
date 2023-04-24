export function isHtmlIncluded(dataTransfer: any): boolean;
/**
 * The editing part of the image upload feature. It registers the `'uploadImage'` command
 * and the `imageUpload` command as an aliased name.
 *
 * When an image is uploaded, it fires the {@link ~ImageUploadEditing#event:uploadComplete `uploadComplete`} event
 * that allows adding custom attributes to the {@link module:engine/model/element~Element image element}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageUploadEditing {
    /**
     * @inheritDoc
     */
    static get requires(): (typeof Notification | typeof ClipboardPipeline | typeof FileRepository | typeof ImageUtils)[];
    static get pluginName(): string;
    /**
     * @inheritDoc
     */
    constructor(editor: any);
    /**
     * An internal mapping of {@link module:upload/filerepository~FileLoader#id file loader UIDs} and
     * model elements during the upload.
     *
     * Model element of the uploaded image can change, for instance, when {@link module:image/image/imagetypecommand~ImageTypeCommand}
     * is executed as a result of adding caption or changing image style. As a result, the upload logic must keep track of the model
     * element (reference) and resolve the upload for the correct model element (instead of the one that landed in the `$graveyard`
     * after image type changed).
     *
     * @private
     * @readonly
     * @member {Map.<String,module:engine/model/element~Element>}
     */
    private readonly _uploadImageElements;
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
     *
     * @protected
     * @param {module:upload/filerepository~FileLoader} loader
     * @returns {Promise}
     */
    protected _readAndUpload(loader: any): Promise<any>;
    /**
     * Creates the `srcset` attribute based on a given file upload response and sets it as an attribute to a specific image element.
     *
     * @protected
     * @param {Object} data Data object from which `srcset` will be created.
     * @param {module:engine/model/element~Element} image The image element on which the `srcset` attribute will be set.
     * @param {module:engine/model/writer~Writer} writer
     */
    protected _parseAndSetSrcsetAttributeOnImage(data: Object, image: any, writer: any): void;
}
import { Notification } from "@ckeditor/ckeditor5-ui";
import { ClipboardPipeline } from "@ckeditor/ckeditor5-clipboard";
import { FileRepository } from "@ckeditor/ckeditor5-upload";
import ImageUtils from "../imageutils";
