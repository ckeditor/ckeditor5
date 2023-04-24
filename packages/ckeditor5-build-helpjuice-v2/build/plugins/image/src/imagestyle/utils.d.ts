declare namespace _default {
    export { normalizeStyles };
    export { getDefaultStylesConfiguration };
    export { getDefaultDropdownDefinitions };
    export { warnInvalidStyle };
    export { DEFAULT_OPTIONS };
    export { DEFAULT_ICONS };
    export { DEFAULT_DROPDOWN_DEFINITIONS };
}
export default _default;
/**
 * Returns a list of the normalized and validated image style options.
 *
 * @protected
 * @param {Object} config
 * @param {Boolean} config.isInlinePluginLoaded
 * Determines whether the {@link module:image/image/imageblockediting~ImageBlockEditing `ImageBlockEditing`} plugin has been loaded.
 * @param {Boolean} config.isBlockPluginLoaded
 * Determines whether the {@link module:image/image/imageinlineediting~ImageInlineEditing `ImageInlineEditing`} plugin has been loaded.
 * @param {module:image/imagestyle~ImageStyleConfig} config.configuredStyles
 * The image styles configuration provided in the image styles {@link module:image/image~ImageConfig#styles configuration}
 * as a default or custom value.
 * @returns {module:image/imagestyle~ImageStyleConfig}
 * * Each of options contains a complete icon markup.
 * * The image style options not supported by any of the loaded plugins are filtered out.
 */
declare function normalizeStyles(config: {
    isInlinePluginLoaded: boolean;
    isBlockPluginLoaded: boolean;
    configuredStyles: any;
}): any;
/**
 * Returns the default image styles configuration depending on the loaded image editing plugins.
 * @protected
 *
 * @param {Boolean} isInlinePluginLoaded
 * Determines whether the {@link module:image/image/imageblockediting~ImageBlockEditing `ImageBlockEditing`} plugin has been loaded.
 *
 * @param {Boolean} isBlockPluginLoaded
 * Determines whether the {@link module:image/image/imageinlineediting~ImageInlineEditing `ImageInlineEditing`} plugin has been loaded.
 *
 * @returns {Object<String,Array>}
 * It returns an object with the lists of the image style options and groups defined as strings related to the
 * {@link module:image/imagestyle/utils~DEFAULT_OPTIONS default options}
 */
declare function getDefaultStylesConfiguration(isBlockPluginLoaded: boolean, isInlinePluginLoaded: boolean): any;
/**
 * Returns a list of the available predefined drop-downs' definitions depending on the loaded image editing plugins.
 * @protected
 *
 * @param {module:core/plugincollection~PluginCollection} pluginCollection
 * @returns {Array.<module:image/imagestyle/imagestyleui~ImageStyleDropdownDefinition>}
 */
declare function getDefaultDropdownDefinitions(pluginCollection: any): Array<NodeModule>;
declare function warnInvalidStyle(info: any): void;
/**
 * Default image style options provided by the plugin that can be referred in the {@link module:image/image~ImageConfig#styles}
 * configuration.
 *
 * There are available 5 styles focused on formatting:
 *
 * * **`'alignLeft'`** aligns the inline or block image to the left and wraps it with the text using the `image-style-align-left` class,
 * * **`'alignRight'`** aligns the inline or block image to the right and wraps it with the text using the `image-style-align-right` class,
 * * **`'alignCenter'`** centers the block image using the `image-style-align-center` class,
 * * **`'alignBlockLeft'`** aligns the block image to the left using the `image-style-block-align-left` class,
 * * **`'alignBlockRight'`** aligns the block image to the right using the `image-style-block-align-right` class,
 *
 * and 3 semantic styles:
 *
 * * **`'inline'`** is an inline image without any CSS class,
 * * **`'block'`** is a block image without any CSS class,
 * * **`'side'`** is a block image styled with the `image-style-side` CSS class.
 *
 * @readonly
 * @type {Object.<String,module:image/imagestyle~ImageStyleOptionDefinition>}
 */
declare const DEFAULT_OPTIONS: any;
/**
 * Default image style icons provided by the plugin that can be referred in the {@link module:image/image~ImageConfig#styles}
 * configuration.
 *
 * See {@link module:image/imagestyle~ImageStyleOptionDefinition#icon} to learn more.
 *
 * There are 7 default icons available: `'full'`, `'left'`, `'inlineLeft'`, `'center'`, `'right'`, `'inlineRight'`, and `'inline'`.
 *
 * @readonly
 * @type {Object.<String,String>}
 */
declare const DEFAULT_ICONS: any;
/**
 * Default drop-downs provided by the plugin that can be referred in the {@link module:image/image~ImageConfig#toolbar}
 * configuration. The drop-downs are containers for the {@link module:image/imagestyle~ImageStyleConfig#options image style options}.
 *
 * If both of the `ImageEditing` plugins are loaded, there are 2 predefined drop-downs available:
 *
 * * **`'imageStyle:wrapText'`**, which contains the `alignLeft` and `alignRight` options, that is,
 * those that wraps the text around the image,
 * * **`'imageStyle:breakText'`**, which contains the `alignBlockLeft`, `alignCenter` and `alignBlockRight` options, that is,
 * those that breaks the text around the image.
 *
 * @readonly
 * @type {Array.<module:image/imagestyle/imagestyleui~ImageStyleDropdownDefinition>}
 */
declare const DEFAULT_DROPDOWN_DEFINITIONS: Array<NodeModule>;
