/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/fontfamily/fontfamilyediting
 */

/**
 * Returns {@link module:font/fontfamily/fontfamilyediting~FontFamilyConfig#options} array with options normalized in the
 * {@link module:font/fontfamily/fontfamilyediting~FontFamilyOption} format, translated
 * `title` for each style.
 *
 * @returns {Array.<module:font/fontfamily/fontfamilyediting~FontFamilyOption>}
 */
export function normalizeOptions( configuredOptions ) {
	const options = [];
	for ( const item of configuredOptions ) {
		const itemDefinition = getItemDefinition( item );

		// Set only valid definitions.
		if ( itemDefinition ) {
			options.push( itemDefinition );
		}
	}

	return options;
}

// Returns item definition from preset
function getItemDefinition( item ) {
	// Probably it is full item definition so return it.
	if ( typeof item === 'object' ) {
		return item;
	}

	// Handle 'default' string as a special case. It will be used to remove the fontFamily attribute.
	if ( item === 'default' ) {
		return {
			title: 'Default',
			model: undefined
		};
	}

	// Ignore values that we cannot parse to a definition.
	if ( typeof item !== 'string' ) {
		return;
	}

	return generateFontPreset( item );
}

// Creates a predefined preset for pixel size. It deconstructs font-family like string into full configuration option.
// A font definition is passed as coma delimited set of font family names. Font names might be quoted.
//
// @param {String} A font definition form configuration.
function generateFontPreset( fontDefinition ) {
	// Remove quotes from font names - will be normalized later.
	const fontNames = fontDefinition.replace( /"|'/g, '' ).split( ',' );

	// The first matched font name will be used as dropdown list item title and as model value
	const firstFontName = fontNames[ 0 ];

	const cssFontNames = fontNames.map( normalizeFontName );

	// TODO: Maybe we can come with something better here?
	// TODO: Also document this behavior in engine as it uses matcher~Pattern not ViewElementDefinition.
	// TODO: Maybe a better solution will be a callback here? (also needs documentation)
	// This will match any quote type with whitespace.
	const quotesMatch = '("|\'|&qout;|\\W){0,2}';
	// Full regex will catch any style of quotation used in view.
	// Example:
	// from string: "Font Foo Foo, Font Bar"
	// it will create a regex that will match any quotation mix:
	//     - "Font Foo Foo", Font Bar
	//     - 'Font Foo Foo', "Font Bar"
	//     - ... etc.
	const regexString = `${ quotesMatch }${ fontNames.map( n => n.trim() ).join( `${ quotesMatch },${ quotesMatch }` ) }${ quotesMatch }`;

	return {
		title: firstFontName,
		model: firstFontName,
		view: {
			name: 'span',
			style: {
				'font-family': cssFontNames.join( ', ' )
			}
		},
		acceptsAlso: [
			{
				name: 'span',
				style: {
					'font-family': new RegExp( regexString )
				}
			}
		]
	};
}

// Normalizes font name for the view style attribute.
//
// @param {String} fontName
// @returns {String}
function normalizeFontName( fontName ) {
	fontName = fontName.trim();

	// Compound font names should be quoted.
	if ( fontName.indexOf( ' ' ) > 0 ) {
		fontName = `'${ fontName }'`;
	}

	return fontName;
}
