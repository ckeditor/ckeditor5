/**
 * The image inline plugin.
 *
 * It registers:
 *
 * * `<imageInline>` as an inline element in the document schema, and allows `alt`, `src` and `srcset` attributes.
 * * converters for editing and data pipelines.
 * * {@link module:image/image/imagetypecommand~ImageTypeCommand `'imageTypeInline'`} command that converts block images into
 * inline images.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageInlineEditing {
    /**
     * @inheritDoc
     */
    static get requires(): (typeof ClipboardPipeline | typeof ImageUtils | typeof ImageEditing)[];
    /**
     * @inheritDoc
     */
    static get pluginName(): string;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Configures conversion pipelines to support upcasting and downcasting
     * inline images (inline image widgets) and their attributes.
     *
     * @private
     */
    private _setupConversion;
    /**
     * Integrates the plugin with the clipboard pipeline.
     *
     * Idea is that the feature should recognize the user's intent when an **block** image is
     * pasted or dropped. If such an image is pasted/dropped into a non-empty block
     * (e.g. a paragraph with some text) it gets converted into an inline image on the fly.
     *
     * We assume this is the user's intent if they decided to put their image there.
     *
     * **Note**: If a block image has a caption, it will not be converted to an inline image
     * to avoid the confusion. Captions are added on purpose and they should never be lost
     * in the clipboard pipeline.
     *
     * See the `ImageBlockEditing` for the similar integration that works in the opposite direction.
     *
     * @private
     */
    private _setupClipboardIntegration;
}
import { ClipboardPipeline } from "@ckeditor/ckeditor5-clipboard";
import ImageUtils from "../imageutils";
import ImageEditing from "./imageediting";
