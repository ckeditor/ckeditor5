/**
 * The image plugin.
 *
 * For a detailed overview, check the {@glink features/images/images-overview image feature} documentation.
 *
 * This is a "glue" plugin which loads the following plugins:
 *
 * * {@link module:image/imageblock~ImageBlock},
 * * {@link module:image/imageinline~ImageInline},
 *
 * Usually, it is used in conjunction with other plugins from this package. See the {@glink api/image package page}
 * for more information.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Image {
    /**
     * @inheritDoc
     */
    static get requires(): (typeof ImageBlock | typeof ImageInline)[];
    /**
     * @inheritDoc
     */
    static get pluginName(): string;
}
import ImageBlock from "./imageblock";
import ImageInline from "./imageinline";
