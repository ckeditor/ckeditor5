/**
 * The image style plugin.
 *
 * For a detailed overview of the image styles feature, check the {@glink features/images/images-styles documentation}.
 *
 * This is a "glue" plugin which loads the following plugins:
 * * {@link module:image/imagestyle/imagestyleediting~ImageStyleEditing},
 * * {@link module:image/imagestyle/imagestyleui~ImageStyleUI}
 *
 * It provides a default configuration, which can be extended or overwritten.
 * Read more about the {@link module:image/image~ImageConfig#styles image styles configuration}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageStyle {
    /**
     * @inheritDoc
     */
    static get requires(): (typeof ImageStyleEditing | typeof ImageStyleUI)[];
    /**
     * @inheritDoc
     */
    static get pluginName(): string;
}
/**
 * :image/imagestyle~ImageStyleOptionDefinition
 */
export type module = Object;
import ImageStyleEditing from "./imagestyle/imagestyleediting";
import ImageStyleUI from "./imagestyle/imagestyleui";
