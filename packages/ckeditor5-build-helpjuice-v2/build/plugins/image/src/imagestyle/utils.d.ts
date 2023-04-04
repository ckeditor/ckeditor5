/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module image/imagestyle/utils
 */
import { type Editor, type PluginCollection } from 'ckeditor5/src/core';
import type { ImageStyleConfig, ImageStyleDropdownDefinition, ImageStyleOptionDefinition } from '../imageconfig';
/**
 * Default image style options provided by the plugin that can be referred in the {@link module:image/imageconfig~ImageConfig#styles}
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
 */
export declare const DEFAULT_OPTIONS: Record<string, ImageStyleOptionDefinition>;
/**
 * Default image style icons provided by the plugin that can be referred in the {@link module:image/imageconfig~ImageConfig#styles}
 * configuration.
 *
 * See {@link module:image/imageconfig~ImageStyleOptionDefinition#icon} to learn more.
 *
 * There are 7 default icons available: `'full'`, `'left'`, `'inlineLeft'`, `'center'`, `'right'`, `'inlineRight'`, and `'inline'`.
 */
export declare const DEFAULT_ICONS: Record<string, string>;
/**
 * Default drop-downs provided by the plugin that can be referred in the {@link module:image/imageconfig~ImageConfig#toolbar}
 * configuration. The drop-downs are containers for the {@link module:image/imageconfig~ImageStyleConfig#options image style options}.
 *
 * If both of the `ImageEditing` plugins are loaded, there are 2 predefined drop-downs available:
 *
 * * **`'imageStyle:wrapText'`**, which contains the `alignLeft` and `alignRight` options, that is,
 * those that wraps the text around the image,
 * * **`'imageStyle:breakText'`**, which contains the `alignBlockLeft`, `alignCenter` and `alignBlockRight` options, that is,
 * those that breaks the text around the image.
 */
export declare const DEFAULT_DROPDOWN_DEFINITIONS: Array<ImageStyleDropdownDefinition>;
/**
 * Returns a list of the normalized and validated image style options.
 *
 * @param config
 * @param config.isInlinePluginLoaded
 * Determines whether the {@link module:image/image/imageblockediting~ImageBlockEditing `ImageBlockEditing`} plugin has been loaded.
 * @param config.isBlockPluginLoaded
 * Determines whether the {@link module:image/image/imageinlineediting~ImageInlineEditing `ImageInlineEditing`} plugin has been loaded.
 * @param config.configuredStyles
 * The image styles configuration provided in the image styles {@link module:image/imageconfig~ImageConfig#styles configuration}
 * as a default or custom value.
 * @returns
 * * Each of options contains a complete icon markup.
 * * The image style options not supported by any of the loaded plugins are filtered out.
 */
declare function normalizeStyles(config: {
    isInlinePluginLoaded: boolean;
    isBlockPluginLoaded: boolean;
    configuredStyles: ImageStyleConfig;
}): Array<ImageStyleOptionDefinition>;
/**
 * Returns the default image styles configuration depending on the loaded image editing plugins.
 *
 * @param isInlinePluginLoaded
 * Determines whether the {@link module:image/image/imageblockediting~ImageBlockEditing `ImageBlockEditing`} plugin has been loaded.
 *
 * @param isBlockPluginLoaded
 * Determines whether the {@link module:image/image/imageinlineediting~ImageInlineEditing `ImageInlineEditing`} plugin has been loaded.
 *
 * @returns
 * It returns an object with the lists of the image style options and groups defined as strings related to the
 * {@link module:image/imagestyle/utils#DEFAULT_OPTIONS default options}
 */
declare function getDefaultStylesConfiguration(isBlockPluginLoaded: boolean, isInlinePluginLoaded: boolean): ImageStyleConfig;
/**
 * Returns a list of the available predefined drop-downs' definitions depending on the loaded image editing plugins.
 */
declare function getDefaultDropdownDefinitions(pluginCollection: PluginCollection<Editor>): Array<ImageStyleDropdownDefinition>;
/**
 * Displays a console warning with the 'image-style-configuration-definition-invalid' error.
 */
declare function warnInvalidStyle(info: object): void;
declare const _default: {
    normalizeStyles: typeof normalizeStyles;
    getDefaultStylesConfiguration: typeof getDefaultStylesConfiguration;
    getDefaultDropdownDefinitions: typeof getDefaultDropdownDefinitions;
    warnInvalidStyle: typeof warnInvalidStyle;
    DEFAULT_OPTIONS: Record<string, ImageStyleOptionDefinition>;
    DEFAULT_ICONS: Record<string, string>;
    DEFAULT_DROPDOWN_DEFINITIONS: ImageStyleDropdownDefinition[];
};
export default _default;
