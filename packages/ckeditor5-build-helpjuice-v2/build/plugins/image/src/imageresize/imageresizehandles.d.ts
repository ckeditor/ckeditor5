/**
 * The image resize by handles feature.
 *
 * It adds the ability to resize each image using handles or manually by
 * {@link module:image/imageresize/imageresizebuttons~ImageResizeButtons} buttons.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageResizeHandles {
    /**
     * @inheritDoc
     */
    static get requires(): (typeof WidgetResize)[];
    /**
     * @inheritDoc
     */
    static get pluginName(): string;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Attaches the listeners responsible for creating a resizer for each image, except for images inside the HTML embed preview.
     *
     * @private
     */
    private _setupResizerCreator;
}
import { WidgetResize } from "@ckeditor/ckeditor5-widget";
