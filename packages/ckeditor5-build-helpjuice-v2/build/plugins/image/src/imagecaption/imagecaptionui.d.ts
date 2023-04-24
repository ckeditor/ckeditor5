/**
 * The image caption UI plugin. It introduces the `'toggleImageCaption'` UI button.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageCaptionUI {
    /**
     * @inheritDoc
     */
    static get requires(): (typeof ImageCaptionUtils)[];
    /**
     * @inheritDoc
     */
    static get pluginName(): string;
    /**
     * @inheritDoc
     */
    init(): void;
}
import ImageCaptionUtils from "./imagecaptionutils";
