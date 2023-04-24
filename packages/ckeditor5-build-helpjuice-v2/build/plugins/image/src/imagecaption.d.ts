/**
 * The image caption plugin.
 *
 * For a detailed overview, check the {@glink features/images/images-captions image caption} documentation.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageCaption {
    /**
     * @inheritDoc
     */
    static get requires(): (typeof ImageCaptionEditing | typeof ImageCaptionUI)[];
    /**
     * @inheritDoc
     */
    static get pluginName(): string;
}
import ImageCaptionEditing from "./imagecaption/imagecaptionediting";
import ImageCaptionUI from "./imagecaption/imagecaptionui";
