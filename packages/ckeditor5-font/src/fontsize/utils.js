/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/fontsize/utils
 */

/**
 * Returns {@link module:font/fontsize/fontsizeediting~FontSizeConfig#options} array with options normalized in the
 * {@link module:font/fontsize/fontsizeediting~FontSizeOption} format, translated
 * `title` for each style.
 *
 * @returns {Array.<module:font/fontsize/fontsizeediting~FontSizeOption>}
 */
export function normalizeOptions( configuredOptions ) {
	const options = [];

	for ( const option of configuredOptions ) {
		const definition = getOptionDefinition( option );

		if ( definition ) {
			options.push( definition );
		}
	}
	return options;
}

const namedPresets = {
	tiny: {
		title: 'Tiny',
		model: 'text-tiny',
		view: {
			name: 'span',
			class: 'text-tiny'
		}
	},
	small: {
		title: 'Small',
		model: 'text-small',
		view: {
			name: 'span',
			class: 'text-small'
		}
	},
	big: {
		title: 'Big',
		model: 'text-big',
		view: {
			name: 'span',
			class: 'text-big'
		}
	},
	huge: {
		title: 'Huge',
		model: 'text-huge',
		view: {
			name: 'span',
			class: 'text-huge'
		}
	}
};

// Returns item definition from preset. Returns undefined for unparsable item. If object is passed then this method will return it without
// alternating.
//
// @param {String|Number|Object} item
// @returns {undefinde|module:font/fontsize/fontsizeediting~FontSizeOption}
function getOptionDefinition( item ) {
	// Named preset exist so return it
	if ( namedPresets[ item ] ) {
		return namedPresets[ item ];
	}

	// Probably it is full item definition so return it
	if ( typeof item === 'object' ) {
		return item;
	}

	if ( item === 'normal' ) {
		return {
			model: undefined,
			title: 'Normal'
		};
	}

	// At this stage we probably have numerical value to generate a preset so parse it's value.
	const sizePreset = parseInt( item ); // TODO: Should we parse floats? 🤔

	// Discard any faulty values.
	if ( isNaN( sizePreset ) ) {
		return;
	}

	return generatePixelPreset( sizePreset );
}

// Creates a predefined preset for pixel size.
//
// @param {Number} size Font size in pixels.
// @returns {module:font/fontsize/fontsizeediting~FontSizeOption}
function generatePixelPreset( size ) {
	const sizeName = String( size );

	return {
		title: sizeName,
		model: sizeName,
		view: {
			name: 'span',
			style: {
				'font-size': `${ size }px`
			}
		}
	};
}
