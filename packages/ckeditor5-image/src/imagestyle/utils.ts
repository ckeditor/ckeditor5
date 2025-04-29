/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module image/imagestyle/utils
 */

import { logWarning } from 'ckeditor5/src/utils.js';
import {
	IconObjectCenter,
	IconObjectFullWidth,
	IconObjectInline,
	IconObjectInlineLeft,
	IconObjectInlineRight,
	IconObjectLeft,
	IconObjectRight
} from 'ckeditor5/src/icons.js';
import type { Editor, PluginCollection } from 'ckeditor5/src/core.js';
import type { ImageStyleConfig, ImageStyleDropdownDefinition, ImageStyleOptionDefinition } from '../imageconfig.js';

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
export const DEFAULT_OPTIONS: Record<string, ImageStyleOptionDefinition> = {
	// This style represents an image placed in the line of text.
	get inline() {
		return {
			name: 'inline',
			title: 'In line',
			icon: IconObjectInline,
			modelElements: [ 'imageInline' ],
			isDefault: true
		};
	},

	// This style represents an image aligned to the left and wrapped with text.
	get alignLeft() {
		return {
			name: 'alignLeft',
			title: 'Left aligned image',
			icon: IconObjectInlineLeft,
			modelElements: [ 'imageBlock', 'imageInline' ],
			className: 'image-style-align-left'
		};
	},

	// This style represents an image aligned to the left.
	get alignBlockLeft() {
		return {
			name: 'alignBlockLeft',
			title: 'Left aligned image',
			icon: IconObjectLeft,
			modelElements: [ 'imageBlock' ],
			className: 'image-style-block-align-left'
		};
	},

	// This style represents a centered image.
	get alignCenter() {
		return {
			name: 'alignCenter',
			title: 'Centered image',
			icon: IconObjectCenter,
			modelElements: [ 'imageBlock' ],
			className: 'image-style-align-center'
		};
	},

	// This style represents an image aligned to the right and wrapped with text.
	get alignRight() {
		return {
			name: 'alignRight',
			title: 'Right aligned image',
			icon: IconObjectInlineRight,
			modelElements: [ 'imageBlock', 'imageInline' ],
			className: 'image-style-align-right'
		};
	},

	// This style represents an image aligned to the right.
	get alignBlockRight() {
		return {
			name: 'alignBlockRight',
			title: 'Right aligned image',
			icon: IconObjectRight,
			modelElements: [ 'imageBlock' ],
			className: 'image-style-block-align-right'
		};
	},

	// This option is equal to the situation when no style is applied.
	get block() {
		return {
			name: 'block',
			title: 'Centered image',
			icon: IconObjectCenter,
			modelElements: [ 'imageBlock' ],
			isDefault: true
		};
	},

	// This represents a side image.
	get side() {
		return {
			name: 'side',
			title: 'Side image',
			icon: IconObjectInlineRight,
			modelElements: [ 'imageBlock' ],
			className: 'image-style-side'
		};
	}
};

/**
 * Default image style icons provided by the plugin that can be referred in the {@link module:image/imageconfig~ImageConfig#styles}
 * configuration.
 *
 * See {@link module:image/imageconfig~ImageStyleOptionDefinition#icon} to learn more.
 *
 * There are 7 default icons available: `'full'`, `'left'`, `'inlineLeft'`, `'center'`, `'right'`, `'inlineRight'`, and `'inline'`.
 */
export const DEFAULT_ICONS: Record<string, string> = /* #__PURE__ */ ( () => ( {
	full: IconObjectFullWidth,
	left: IconObjectLeft,
	right: IconObjectRight,
	center: IconObjectCenter,
	inlineLeft: IconObjectInlineLeft,
	inlineRight: IconObjectInlineRight,
	inline: IconObjectInline
} ) )();

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
export const DEFAULT_DROPDOWN_DEFINITIONS: Array<ImageStyleDropdownDefinition> = [ {
	name: 'imageStyle:wrapText',
	title: 'Wrap text',
	defaultItem: 'imageStyle:alignLeft',
	items: [ 'imageStyle:alignLeft', 'imageStyle:alignRight' ]
}, {
	name: 'imageStyle:breakText',
	title: 'Break text',
	defaultItem: 'imageStyle:block',
	items: [ 'imageStyle:alignBlockLeft', 'imageStyle:block', 'imageStyle:alignBlockRight' ]
} ];

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
function normalizeStyles( config: {
	isInlinePluginLoaded: boolean;
	isBlockPluginLoaded: boolean;
	configuredStyles: ImageStyleConfig;
}
): Array<ImageStyleOptionDefinition> {
	const configuredStyles = config.configuredStyles.options || [];

	const styles = configuredStyles
		.map( arrangement => normalizeDefinition( arrangement ) )
		.filter( arrangement => isValidOption( arrangement, config ) );

	return styles;
}

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
function getDefaultStylesConfiguration( isBlockPluginLoaded: boolean, isInlinePluginLoaded: boolean ): ImageStyleConfig {
	if ( isBlockPluginLoaded && isInlinePluginLoaded ) {
		return {
			options: [
				'inline', 'alignLeft', 'alignRight',
				'alignCenter', 'alignBlockLeft', 'alignBlockRight',
				'block', 'side'
			]
		};
	} else if ( isBlockPluginLoaded ) {
		return {
			options: [ 'block', 'side' ]
		};
	} else if ( isInlinePluginLoaded ) {
		return {
			options: [ 'inline', 'alignLeft', 'alignRight' ]
		};
	}

	return {};
}

/**
 * Returns a list of the available predefined drop-downs' definitions depending on the loaded image editing plugins.
 */
function getDefaultDropdownDefinitions( pluginCollection: PluginCollection<Editor> ): Array<ImageStyleDropdownDefinition> {
	if ( pluginCollection.has( 'ImageBlockEditing' ) && pluginCollection.has( 'ImageInlineEditing' ) ) {
		return [ ...DEFAULT_DROPDOWN_DEFINITIONS ];
	} else {
		return [];
	}
}

/**
 * Normalizes an image style option or group provided in the {@link module:image/imageconfig~ImageConfig#styles}
 * and returns it in a {@link module:image/imageconfig~ImageStyleOptionDefinition}/
 */
function normalizeDefinition( definition: string | Partial<ImageStyleOptionDefinition> & { name: string } ): ImageStyleOptionDefinition {
	if ( typeof definition === 'string' ) {
		// Just the name of the style has been passed, but none of the defaults.
		if ( !DEFAULT_OPTIONS[ definition ] ) {
			// Normalize the style anyway to prevent errors.
			definition = { name: definition };
		}
		// Just the name of the style has been passed and it's one of the defaults, just use it.
		// Clone the style to avoid overriding defaults.
		else {
			definition = { ...DEFAULT_OPTIONS[ definition ] };
		}
	} else {
		// If an object style has been passed and if the name matches one of the defaults,
		// extend it with defaults – the user wants to customize a default style.
		// Note: Don't override the user–defined style object, clone it instead.
		definition = extendStyle( DEFAULT_OPTIONS[ definition.name ], definition );
	}

	// If an icon is defined as a string and correspond with a name
	// in default icons, use the default icon provided by the plugin.
	if ( typeof definition.icon === 'string' ) {
		definition.icon = DEFAULT_ICONS[ definition.icon ] || definition.icon;
	}

	return definition as ImageStyleOptionDefinition;
}

/**
 * Checks if the image style option is valid:
 * * if it has the modelElements fields defined and filled,
 * * if the defined modelElements are supported by any of the loaded image editing plugins.
 * It also displays a console warning these conditions are not met.
 *
 * @param option image style option
 */
function isValidOption(
	option: ImageStyleOptionDefinition,
	{ isBlockPluginLoaded, isInlinePluginLoaded }: { isBlockPluginLoaded: boolean; isInlinePluginLoaded: boolean }
): boolean {
	const { modelElements, name } = option;

	if ( !modelElements || !modelElements.length || !name ) {
		warnInvalidStyle( { style: option } );

		return false;
	} else {
		const supportedElements = [ isBlockPluginLoaded ? 'imageBlock' : null, isInlinePluginLoaded ? 'imageInline' : null ];

		// Check if the option is supported by any of the loaded plugins.
		if ( !modelElements.some( elementName => supportedElements.includes( elementName ) ) ) {
			/**
			 * In order to work correctly, each image style {@link module:image/imageconfig~ImageStyleOptionDefinition option}
			 * requires specific model elements (also: types of images) to be supported by the editor.
			 *
			 * Model element names to which the image style option can be applied are defined in the
			 * {@link module:image/imageconfig~ImageStyleOptionDefinition#modelElements} property of the style option
			 * definition.
			 *
			 * Explore the warning in the console to find out precisely which option is not supported and which editor plugins
			 * are missing. Make sure these plugins are loaded in your editor to get this image style option working.
			 *
			 * @error image-style-missing-dependency
			 * @param {string} style The name of the unsupported option.
			 * @param {Array.<string>} missingPlugins The names of the plugins one of which has to be loaded for the particular option.
			 */
			logWarning( 'image-style-missing-dependency', {
				style: option,
				missingPlugins: modelElements.map( name => name === 'imageBlock' ? 'ImageBlockEditing' : 'ImageInlineEditing' )
			} );

			return false;
		}
	}

	return true;
}

/**
 * Extends the default style with a style provided by the developer.
 * Note: Don't override the custom–defined style object, clone it instead.
 */
function extendStyle( source: ImageStyleOptionDefinition, style: Partial<ImageStyleOptionDefinition> ): ImageStyleOptionDefinition {
	const extendedStyle: Record<string, any> = { ...style };

	for ( const prop in source ) {
		if ( !Object.prototype.hasOwnProperty.call( style, prop ) ) {
			extendedStyle[ prop ] = source[ prop as keyof typeof source ];
		}
	}

	return extendedStyle as ImageStyleOptionDefinition;
}

/**
 * Displays a console warning with the 'image-style-configuration-definition-invalid' error.
 */
function warnInvalidStyle( info: object ): void {
	/**
	 * The image style definition provided in the configuration is invalid.
	 *
	 * Please make sure the definition implements properly one of the following:
	 *
	 * * {@link module:image/imageconfig~ImageStyleOptionDefinition image style option definition},
	 * * {@link module:image/imageconfig~ImageStyleDropdownDefinition image style dropdown definition}
	 *
	 * @error image-style-configuration-definition-invalid
	 * @param {object} info The information about the invalid definition.
	 */
	logWarning( 'image-style-configuration-definition-invalid', info );
}

export default {
	normalizeStyles,
	getDefaultStylesConfiguration,
	getDefaultDropdownDefinitions,
	warnInvalidStyle,
	DEFAULT_OPTIONS,
	DEFAULT_ICONS,
	DEFAULT_DROPDOWN_DEFINITIONS
};
