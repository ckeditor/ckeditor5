/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/colorgrid/utils
 */

/**
 * Returns color configuration options as defined in `editor.config.(fontColor|fontBackgroundColor).colors` or
 * `editor.config.table.(tableProperties|tableCellProperties).(background|border).colors
 * but processed to account for editor localization in the correct language.
 *
 * Note: The reason behind this method is that there is no way to use {@link module:utils/locale~Locale#t}
 * when the user configuration is defined because the editor does not exist yet.
 *
 * @param {module:utils/locale~Locale} locale The {@link module:core/editor/editor~Editor#locale} instance.
 * @param {Array.<module:ui/colorgrid/colorgrid~ColorDefinition>} options
 * @returns {Array.<module:ui/colorgrid/colorgrid~ColorDefinition>}.
 */
export function getLocalizedColorOptions( locale, options ) {
	const t = locale.t;
	const localizedColorNames = {
		Black: t( 'Black' ),
		'Dim grey': t( 'Dim grey' ),
		Grey: t( 'Grey' ),
		'Light grey': t( 'Light grey' ),
		White: t( 'White' ),
		Red: t( 'Red' ),
		Orange: t( 'Orange' ),
		Yellow: t( 'Yellow' ),
		'Light green': t( 'Light green' ),
		Green: t( 'Green' ),
		Aquamarine: t( 'Aquamarine' ),
		Turquoise: t( 'Turquoise' ),
		'Light blue': t( 'Light blue' ),
		Blue: t( 'Blue' ),
		Purple: t( 'Purple' )
	};

	return options.map( colorOption => {
		const label = localizedColorNames[ colorOption.label ];

		if ( label && label != colorOption.label ) {
			colorOption.label = label;
		}

		return colorOption;
	} );
}

/**
 * Creates a unified color definition object from color configuration options.
 * The object contains the information necessary to both render the UI and initialize the conversion.
 *
 * @param {module:ui/colorgrid/colorgrid~ColorDefinition} options
 * @returns {Array.<module:ui/colorgrid/colorgrid~ColorDefinition>}
 */
export function normalizeColorOptions( options ) {
	return options
		.map( normalizeSingleColorDefinition )
		.filter( option => !!option );
}

// Creates a normalized color definition from the user-defined configuration.
// The "normalization" means it will create full
// {@link module:ui/colorgrid/colorgrid~ColorDefinition `ColorDefinition-like`}
// object for string values, and add a `view` property, for each definition.
//
// @param {String|module:ui/colorgrid/colorgrid~ColorDefinition}
// @returns {module:ui/colorgrid/colorgrid~ColorDefinition}
export function normalizeSingleColorDefinition( color ) {
	if ( typeof color === 'string' ) {
		return {
			model: color,
			label: color,
			hasBorder: false,
			view: {
				name: 'span',
				styles: {
					color
				}
			}
		};
	} else {
		return {
			model: color.color,
			label: color.label || color.color,
			hasBorder: color.hasBorder === undefined ? false : color.hasBorder,
			view: {
				name: 'span',
				styles: {
					color: `${ color.color }`
				}
			}
		};
	}
}
