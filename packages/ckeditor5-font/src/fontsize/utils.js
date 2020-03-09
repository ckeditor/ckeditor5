/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module font/fontsize/utils
 */

/**
 * Normalizes and translates the {@link module:font/fontsize~FontSizeConfig#options configuration options}
 * to the {@link module:font/fontsize~FontSizeOption} format.
 *
 * @param {Array.<String|Number|Object>} configuredOptions An array of options taken from the configuration.
 * @param {Object} [options={}]
 * @param {Boolean} [options.disableValueMatching=false]
 * @returns {Array.<module:font/fontsize~FontSizeOption>}
 */
export function normalizeOptions( configuredOptions, options = {} ) {
	const disableValueMatching = options.disableValueMatching || false;

	// Convert options to objects.
	return configuredOptions
		.map( item => getOptionDefinition( item, disableValueMatching ) )
		// Filter out undefined values that `getOptionDefinition` might return.
		.filter( option => !!option );
}

// The values should be synchronized with "/theme/fontsize.css" file.
export const FONT_SIZE_PRESET_UNITS = {
	tiny: '0.7em',
	small: '0.85em',
	big: '1.4em',
	huge: '1.8em'
};

// Default named presets map.
const namedPresets = {
	tiny: {
		title: 'Tiny',
		model: 'tiny',
		view: {
			name: 'span',
			classes: 'text-tiny',
			priority: 7
		}
	},
	small: {
		title: 'Small',
		model: 'small',
		view: {
			name: 'span',
			classes: 'text-small',
			priority: 7
		}
	},
	big: {
		title: 'Big',
		model: 'big',
		view: {
			name: 'span',
			classes: 'text-big',
			priority: 7
		}
	},
	huge: {
		title: 'Huge',
		model: 'huge',
		view: {
			name: 'span',
			classes: 'text-huge',
			priority: 7
		}
	}
};

// Returns an option definition either from preset or creates one from number shortcut.
// If object is passed then this method will return it without alternating it. Returns undefined for item than cannot be parsed.
// If disableValueMatching=true, model will be set to a specified unit value instead of text.
//
// @param {String|Number|Object} item
// @param {Boolean} disableValueMatching
// @returns {undefined|module:font/fontsize~FontSizeOption}
function getOptionDefinition( option, disableValueMatching ) {
	// Treat any object as full item definition provided by user in configuration.
	if ( typeof option === 'object' ) {
		return option;
	}

	// Item is a named preset.
	if ( namedPresets[ option ] ) {
		const preset = namedPresets[ option ];

		if ( disableValueMatching ) {
			preset.model = FONT_SIZE_PRESET_UNITS[ option ];
		}

		return preset;
	}

	// 'Default' font size. It will be used to remove the fontSize attribute.
	if ( option === 'default' ) {
		return {
			model: undefined,
			title: 'Default'
		};
	}

	// At this stage we probably have numerical value to generate a preset so parse it's value.
	const sizePreset = parseFloat( option );

	// Discard any faulty values.
	if ( isNaN( sizePreset ) ) {
		return;
	}

	// Return font size definition from size value.
	return generatePixelPreset( sizePreset );
}

// Creates a predefined preset for pixel size.
//
// @param {Number} size Font size in pixels.
// @returns {module:font/fontsize~FontSizeOption}
function generatePixelPreset( size ) {
	const sizeName = String( size );

	return {
		title: sizeName,
		model: size,
		view: {
			name: 'span',
			styles: {
				'font-size': `${ size }px`
			},
			priority: 7
		}
	};
}
