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

// Fixes the color value string.
//
// @param {String} value
// @returns {String}
export function normalizeColorCode( value ) {
	return value.replace( /\s/g, '' );
}

// Creates a normalized color definition from the user-defined configuration.
//
// @param {String|module:ui/colorgrid/colorgrid~ColorDefinition}
// @returns {module:ui/colorgrid/colorgrid~ColorDefinition}
export function normalizeSingleColorDefinition( color ) {
	if ( typeof color === 'string' ) {
		return {
			model: color.replace( / /g, '' ),
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
			model: color.color.replace( / /g, '' ),
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
