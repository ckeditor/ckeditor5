/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module font/fontfamily/utils
 */

/**
 * Normalizes the {@link module:font/fontfamily~FontFamilyConfig#options configuration options}
 * to the {@link module:font/fontfamily~FontFamilyOption} format.
 *
 * @param {Array.<String|Object>} configuredOptions An array of options taken from the configuration.
 * @returns {Array.<module:font/fontfamily~FontFamilyOption>}
 */
export function normalizeOptions( configuredOptions ) {
	// Convert options to objects.
	return configuredOptions
		.map( getOptionDefinition )
		// Filter out undefined values that `getOptionDefinition` might return.
		.filter( option => !!option );
}

// Returns an option definition either created from string shortcut.
// If object is passed then this method will return it without alternating it. Returns undefined for item than cannot be parsed.
//
// @param {String|Object} option
// @returns {undefined|module:font/fontfamily~FontFamilyOption}
function getOptionDefinition( option ) {
	// Treat any object as full item definition provided by user in configuration.
	if ( typeof option === 'object' ) {
		return option;
	}

	// Handle 'default' string as a special case. It will be used to remove the fontFamily attribute.
	if ( option === 'default' ) {
		return {
			title: 'Default',
			model: undefined
		};
	}

	// Ignore values that we cannot parse to a definition.
	if ( typeof option !== 'string' ) {
		return;
	}

	// Return font family definition from font string.
	return generateFontPreset( option );
}

// Creates a predefined preset for pixel size. It deconstructs font-family like string into full configuration option.
// A font definition is passed as coma delimited set of font family names. Font names might be quoted.
//
// @param {String} A font definition form configuration.
function generateFontPreset( fontDefinition ) {
	// Remove quotes from font names. They will be normalized later.
	const fontNames = fontDefinition.replace( /"|'/g, '' ).split( ',' );

	// The first matched font name will be used as dropdown list item title and as model value.
	const firstFontName = fontNames[ 0 ];

	// CSS-compatible font names.
	const cssFontNames = fontNames.map( normalizeFontNameForCSS ).join( ', ' );

	return {
		title: firstFontName,
		model: firstFontName,
		view: {
			name: 'span',
			styles: {
				'font-family': cssFontNames
			},
			priority: 7
		}
	};
}

// Normalizes font name for the style attribute. It adds braces (') if font name contains spaces.
//
// @param {String} fontName
// @returns {String}
function normalizeFontNameForCSS( fontName ) {
	fontName = fontName.trim();

	// Compound font names should be quoted.
	if ( fontName.indexOf( ' ' ) > 0 ) {
		fontName = `'${ fontName }'`;
	}

	return fontName;
}
