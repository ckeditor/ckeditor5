/**
 * The image text alternative plugin.
 *
 * For a detailed overview, check the {@glink features/images/images-styles image styles} documentation.
 *
 * This is a "glue" plugin which loads the
 *  {@link module:image/imagetextalternative/imagetextalternativeediting~ImageTextAlternativeEditing}
 * and {@link module:image/imagetextalternative/imagetextalternativeui~ImageTextAlternativeUI} plugins.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageTextAlternative {
    /**
     * @inheritDoc
     */
    static get requires(): (typeof ImageTextAlternativeEditing | typeof ImageTextAlternativeUI)[];
    /**
     * @inheritDoc
     */
    static get pluginName(): string;
}
import ImageTextAlternativeEditing from "./imagetextalternative/imagetextalternativeediting";
import ImageTextAlternativeUI from "./imagetextalternative/imagetextalternativeui";
