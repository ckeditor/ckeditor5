/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagestyle/utils
 */

import { icons } from 'ckeditor5/src/core';
import { logWarning } from 'ckeditor5/src/utils';

const {
	objectFullWidth,
	objectInline,
	objectLeft,	objectRight, objectCenter,
	objectBlockLeft, objectBlockRight
} = icons;

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
const DEFAULT_OPTIONS = {
	// This style represents an image placed in the line of text.
	get inline() {
		return {
			name: 'inline',
			title: 'In line',
			icon: objectInline,
			modelElements: [ 'imageInline' ],
			isDefault: true
		};
	},

	// This style represents an image aligned to the left and wrapped with text.
	get alignLeft() {
		return {
			name: 'alignLeft',
			title: 'Left aligned image',
			icon: objectLeft,
			modelElements: [ 'imageBlock', 'imageInline' ],
			className: 'image-style-align-left'
		};
	},

	// This style represents an image aligned to the left.
	get alignBlockLeft() {
		return {
			name: 'alignBlockLeft',
			title: 'Left aligned image',
			icon: objectBlockLeft,
			modelElements: [ 'imageBlock' ],
			className: 'image-style-block-align-left'
		};
	},

	// This style represents a centered image.
	get alignCenter() {
		return {
			name: 'alignCenter',
			title: 'Centered image',
			icon: objectCenter,
			modelElements: [ 'imageBlock' ],
			className: 'image-style-align-center'
		};
	},

	// This style represents an image aligned to the right and wrapped with text.
	get alignRight() {
		return {
			name: 'alignRight',
			title: 'Right aligned image',
			icon: objectRight,
			modelElements: [ 'imageBlock', 'imageInline' ],
			className: 'image-style-align-right'
		};
	},

	// This style represents an image aligned to the right.
	get alignBlockRight() {
		return {
			name: 'alignBlockRight',
			title: 'Right aligned image',
			icon: objectBlockRight,
			modelElements: [ 'imageBlock' ],
			className: 'image-style-block-align-right'
		};
	},

	// This option is equal to the situation when no style is applied.
	get block() {
		return {
			name: 'block',
			title: 'Centered image',
			icon: objectCenter,
			modelElements: [ 'imageBlock' ],
			isDefault: true
		};
	},

	// This represents a side image.
	get side() {
		return {
			name: 'side',
			title: 'Side image',
			icon: objectRight,
			modelElements: [ 'imageBlock' ],
			className: 'image-style-side'
		};
	}
};

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
const DEFAULT_ICONS = {
	full: objectFullWidth,
	left: objectBlockLeft,
	right: objectBlockRight,
	center: objectCenter,
	inlineLeft: objectLeft,
	inlineRight: objectRight,
	inline: objectInline
};

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
const DEFAULT_DROPDOWN_DEFINITIONS = [ {
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
function normalizeStyles( config ) {
	const configuredStyles = config.configuredStyles.options || [];

	const styles = configuredStyles
		.map( arrangement => normalizeDefinition( arrangement ) )
		.filter( arrangement => isValidOption( arrangement, config ) );

	return styles;
}

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
function getDefaultStylesConfiguration( isBlockPluginLoaded, isInlinePluginLoaded ) {
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
 * @protected
 *
 * @param {module:core/plugincollection~PluginCollection} pluginCollection
 * @returns {Array.<module:image/imagestyle/imagestyleui~ImageStyleDropdownDefinition>}
 */
function getDefaultDropdownDefinitions( pluginCollection ) {
	if ( pluginCollection.has( 'ImageBlockEditing' ) && pluginCollection.has( 'ImageInlineEditing' ) ) {
		return [ ...DEFAULT_DROPDOWN_DEFINITIONS ];
	} else {
		return [];
	}
}

// Normalizes an image style option or group provided in the {@link module:image/image~ImageConfig#styles}
// and returns it in a {@link module:image/imagestyle~ImageStyleOptionDefinition}/
//
// @param {Object|String} definition
//
// @returns {module:image/imagestyle~ImageStyleOptionDefinition}}
function normalizeDefinition( definition ) {
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

	return definition;
}

// Checks if the image style option is valid:
// * if it has the modelElements fields defined and filled,
// * if the defined modelElements are supported by any of the loaded image editing plugins.
// It also displays a console warning these conditions are not met.
//
// @param {module:image/imagestyle~ImageStyleOptionDefinition} image style option
// @param {Object.<String,Boolean>} { isBlockPluginLoaded, isInlinePluginLoaded }
//
// @returns Boolean
function isValidOption( option, { isBlockPluginLoaded, isInlinePluginLoaded } ) {
	const { modelElements, name } = option;

	if ( !modelElements || !modelElements.length || !name ) {
		warnInvalidStyle( { style: option } );

		return false;
	} else {
		const supportedElements = [ isBlockPluginLoaded ? 'imageBlock' : null, isInlinePluginLoaded ? 'imageInline' : null ];

		// Check if the option is supported by any of the loaded plugins.
		if ( !modelElements.some( elementName => supportedElements.includes( elementName ) ) ) {
			/**
			 * In order to work correctly, each image style {@link module:image/imagestyle~ImageStyleOptionDefinition option}
			 * requires specific model elements (also: types of images) to be supported by the editor.
			 *
			 * Model element names to which the image style option can be applied are defined in the
			 * {@link module:image/imagestyle~ImageStyleOptionDefinition#modelElements} property of the style option
			 * definition.
			 *
			 * Explore the warning in the console to find out precisely which option is not supported and which editor plugins
			 * are missing. Make sure these plugins are loaded in your editor to get this image style option working.
			 *
			 * @error image-style-missing-dependency
			 * @param {String} [option] The name of the unsupported option.
			 * @param {String} [missingPlugins] The names of the plugins one of which has to be loaded for the particular option.
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

// Extends the default style with a style provided by the developer.
// Note: Don't override the custom–defined style object, clone it instead.
//
// @param {module:image/imagestyle~ImageStyleOptionDefinition} source
// @param {Object} style
//
// @returns {module:image/imagestyle~ImageStyleOptionDefinition}
function extendStyle( source, style ) {
	const extendedStyle = { ...style };

	for ( const prop in source ) {
		if ( !Object.prototype.hasOwnProperty.call( style, prop ) ) {
			extendedStyle[ prop ] = source[ prop ];
		}
	}

	return extendedStyle;
}

// Displays a console warning with the 'image-style-configuration-definition-invalid' error.
// @param {Object} info
function warnInvalidStyle( info ) {
	/**
	 * The image style definition provided in the configuration is invalid.
	 *
	 * Please make sure the definition implements properly one of the following:
	 *
	 * * {@link module:image/imagestyle~ImageStyleOptionDefinition image style option definition},
	 * * {@link module:image/imagestyle/imagestyleui~ImageStyleDropdownDefinition image style dropdown definition}
	 *
	 * @error image-style-configuration-definition-invalid
	 * @param {String} [dropdown] The name of the invalid drop-down
	 * @param {String} [style] The name of the invalid image style option
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
