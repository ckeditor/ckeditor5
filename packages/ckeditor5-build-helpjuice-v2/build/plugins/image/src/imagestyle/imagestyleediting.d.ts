/**
 * The image style engine plugin. It sets the default configuration, creates converters and registers
 * {@link module:image/imagestyle/imagestylecommand~ImageStyleCommand ImageStyleCommand}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageStyleEditing {
    /**
     * @inheritDoc
     */
    static get pluginName(): string;
    /**
     * @inheritDoc
     */
    static get requires(): (typeof ImageUtils)[];
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * It contains a list of the normalized and validated style options.
     *
     * * Each option contains a complete icon markup.
     * * The style options not supported by any of the loaded image editing plugins (
     * {@link module:image/image/imageinlineediting~ImageInlineEditing `ImageInlineEditing`} or
     * {@link module:image/image/imageblockediting~ImageBlockEditing `ImageBlockEditing`}) are filtered out.
     *
     * @protected
     * @readonly
     * @type {module:image/imagestyle~ImageStyleConfig}
     */
    protected readonly normalizedStyles: any;
    /**
     * Sets the editor conversion taking the presence of
     * {@link module:image/image/imageinlineediting~ImageInlineEditing `ImageInlineEditing`}
     * and {@link module:image/image/imageblockediting~ImageBlockEditing `ImageBlockEditing`} plugins into consideration.
     *
     * @private
     * @param {Boolean} isBlockPluginLoaded
     * @param {Boolean} isInlinePluginLoaded
     */
    private _setupConversion;
    /**
     * Registers a post-fixer that will make sure that the style attribute value is correct for a specific image type (block vs inline).
     *
     * @private
     */
    private _setupPostFixer;
}
import ImageUtils from "../imageutils";
