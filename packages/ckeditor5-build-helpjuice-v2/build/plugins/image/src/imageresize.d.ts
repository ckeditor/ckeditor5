/**
 * The image resize plugin.
 *
 * It adds a possibility to resize each image using handles.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageResize {
    /**
     * @inheritDoc
     */
    static get requires(): (typeof ImageResizeEditing | typeof ImageResizeButtons | typeof ImageResizeHandles)[];
    /**
     * @inheritDoc
     */
    static get pluginName(): string;
}
import ImageResizeEditing from "./imageresize/imageresizeediting";
import ImageResizeButtons from "./imageresize/imageresizebuttons";
import ImageResizeHandles from "./imageresize/imageresizehandles";
