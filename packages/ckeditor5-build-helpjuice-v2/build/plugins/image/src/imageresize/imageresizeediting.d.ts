/**
 * The image resize editing feature.
 *
 * It adds the ability to resize each image using handles or manually by
 * {@link module:image/imageresize/imageresizebuttons~ImageResizeButtons} buttons.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageResizeEditing {
    /**
     * @inheritDoc
     */
    static get requires(): (typeof ImageUtils)[];
    /**
     * @inheritDoc
     */
    static get pluginName(): string;
    /**
     * @inheritDoc
     */
    constructor(editor: any);
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * @private
     */
    private _registerSchema;
    /**
     * Registers image resize converters.
     *
     * @private
     * @param {'imageBlock'|'imageInline'} imageType The type of the image.
     */
    private _registerConverters;
}
import ImageUtils from "../imageutils";
