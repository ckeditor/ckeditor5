/**
 * The image inline plugin.
 *
 * This is a "glue" plugin which loads the following plugins:
 *
 * * {@link module:image/image/imageinlineediting~ImageInlineEditing},
 * * {@link module:image/imagetextalternative~ImageTextAlternative}.
 *
 * Usually, it is used in conjunction with other plugins from this package. See the {@glink api/image package page}
 * for more information.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageInline {
    /**
     * @inheritDoc
     */
    static get requires(): (typeof ImageTextAlternative | typeof Widget | typeof ImageInlineEditing)[];
    /**
     * @inheritDoc
     */
    static get pluginName(): string;
}
import ImageTextAlternative from "./imagetextalternative";
import { Widget } from "@ckeditor/ckeditor5-widget";
import ImageInlineEditing from "./image/imageinlineediting";
