/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { FontFamilyOption } from '../fontconfig.js';

/**
 * @module font/fontfamily/utils
 */

/**
 * Normalizes the {@link module:font/fontconfig~FontFamilyConfig#options configuration options}
 * to the {@link module:font/fontconfig~FontFamilyOption} format.
 *
 * @param configuredOptions An array of options taken from the configuration.
 */
export function normalizeOptions( configuredOptions: Array<string | FontFamilyOption> ): Array<FontFamilyOption> {
	// Convert options to objects.
	return configuredOptions
		.map( getOptionDefinition )
		// Filter out undefined values that `getOptionDefinition` might return.
		.filter( option => option !== undefined ) as Array<FontFamilyOption>;
}

/**
 * Normalizes the CSS `font-family` property value to an array of unquoted and trimmed font faces.
 *
 * @internal
 */
export function normalizeFontFamilies( fontDefinition: string ): Array<string> {
	return fontDefinition
		.replace( /["']/g, '' ).split( ',' )
		.map( name => name.trim() );
}

/**
 * Returns an option definition either created from string shortcut.
 * If object is passed then this method will return it without alternating it. Returns undefined for item than cannot be parsed.
 *
 */
function getOptionDefinition( option: string | FontFamilyOption ): FontFamilyOption | undefined {
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
		return undefined;
	}

	// Return font family definition from font string.
	return generateFontPreset( option );
}

/**
 * Creates a predefined preset for pixel size. It deconstructs font-family like string into full configuration option.
 * A font definition is passed as coma delimited set of font family names. Font names might be quoted.
 *
 * @param fontDefinition A font definition form configuration.
 */
function generateFontPreset( fontDefinition: string ): FontFamilyOption {
	// Remove quotes from font names. They will be normalized later.
	const fontNames = normalizeFontFamilies( fontDefinition );

	// The first matched font name will be used as dropdown list item title and as model value.
	const firstFontName = fontNames[ 0 ];

	// CSS-compatible font names.
	const cssFontNames = fontNames.map( normalizeFontNameForCSS ).join( ', ' );

	return {
		title: firstFontName,
		model: cssFontNames,
		view: {
			name: 'span',
			styles: {
				'font-family': cssFontNames
			},
			priority: 7
		}
	};
}

/**
 * Normalizes font name for the style attribute. It adds braces (') if font name contains spaces.
 */
function normalizeFontNameForCSS( fontName: string ): string {
	fontName = fontName.trim();

	// Compound font names should be quoted.
	if ( fontName.indexOf( ' ' ) > 0 ) {
		fontName = `'${ fontName }'`;
	}

	return fontName;
}
