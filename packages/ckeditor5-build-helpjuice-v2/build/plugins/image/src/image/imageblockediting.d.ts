/**
 * The image block plugin.
 *
 * It registers:
 *
 * * `<imageBlock>` as a block element in the document schema, and allows `alt`, `src` and `srcset` attributes.
 * * converters for editing and data pipelines.,
 * * {@link module:image/image/imagetypecommand~ImageTypeCommand `'imageTypeBlock'`} command that converts inline images into
 * block images.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageBlockEditing {
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
     * block images (block image widgets) and their attributes.
     *
     * @private
     */
    private _setupConversion;
    /**
     * Integrates the plugin with the clipboard pipeline.
     *
     * Idea is that the feature should recognize the user's intent when an **inline** image is
     * pasted or dropped. If such an image is pasted/dropped:
     *
     * * into an empty block (e.g. an empty paragraph),
     * * on another object (e.g. some block widget).
     *
     * it gets converted into a block image on the fly. We assume this is the user's intent
     * if they decided to put their image there.
     *
     * See the `ImageInlineEditing` for the similar integration that works in the opposite direction.
     *
     * @private
     */
    private _setupClipboardIntegration;
}
import { ClipboardPipeline } from "@ckeditor/ckeditor5-clipboard";
import ImageUtils from "../imageutils";
import ImageEditing from "./imageediting";
