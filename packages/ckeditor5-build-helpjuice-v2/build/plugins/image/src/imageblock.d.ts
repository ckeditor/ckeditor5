/**
 * The image inline plugin.
 *
 * This is a "glue" plugin which loads the following plugins:
 *
 * * {@link module:image/image/imageblockediting~ImageBlockEditing},
 * * {@link module:image/imagetextalternative~ImageTextAlternative}.
 *
 * Usually, it is used in conjunction with other plugins from this package. See the {@glink api/image package page}
 * for more information.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageBlock {
    /**
     * @inheritDoc
     */
    static get requires(): (typeof Widget | typeof ImageTextAlternative | typeof ImageBlockEditing)[];
    /**
     * @inheritDoc
     */
    static get pluginName(): string;
}
import { Widget } from "@ckeditor/ckeditor5-widget";
import ImageTextAlternative from "./imagetextalternative";
import ImageBlockEditing from "./image/imageblockediting";
