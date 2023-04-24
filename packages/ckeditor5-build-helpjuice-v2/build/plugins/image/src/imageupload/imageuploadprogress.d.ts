/**
 * The image upload progress plugin.
 * It shows a placeholder when the image is read from the disk and a progress bar while the image is uploading.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageUploadProgress {
    /**
     * @inheritDoc
     */
    static get pluginName(): string;
    /**
     * @inheritDoc
     */
    constructor(editor: any);
    /**
     * The image placeholder that is displayed before real image data can be accessed.
     *
     * For the record, this image is a 1x1 px GIF with an aspect ratio set by CSS.
     *
     * @protected
     * @member {String} #placeholder
     */
    protected placeholder: string;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * This method is called each time the image `uploadStatus` attribute is changed.
     *
     * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the fired event.
     * @param {Object} data Additional information about the change.
     * @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi
     */
    uploadStatusChange(evt: any, data: Object, conversionApi: any): void;
}
