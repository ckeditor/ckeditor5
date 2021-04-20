/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/styles/utils
 */

const HEX_COLOR_REGEXP = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const RGB_COLOR_REGEXP = /^rgb\([ ]?([0-9]{1,3}[ %]?,[ ]?){2,3}[0-9]{1,3}[ %]?\)$/i;
const RGBA_COLOR_REGEXP = /^rgba\([ ]?([0-9]{1,3}[ %]?,[ ]?){3}(1|[0-9]+%|[0]?\.?[0-9]+)\)$/i;
const HSL_COLOR_REGEXP = /^hsl\([ ]?([0-9]{1,3}[ %]?[,]?[ ]*){3}(1|[0-9]+%|[0]?\.?[0-9]+)?\)$/i;
const HSLA_COLOR_REGEXP = /^hsla\([ ]?([0-9]{1,3}[ %]?,[ ]?){2,3}(1|[0-9]+%|[0]?\.?[0-9]+)\)$/i;

const COLOR_NAMES = new Set( [
	// CSS Level 1
	'black', 'silver', 'gray', 'white', 'maroon', 'red', 'purple', 'fuchsia',
	'green', 'lime', 'olive', 'yellow', 'navy', 'blue', 'teal', 'aqua',
	// CSS Level 2 (Revision 1)
	'orange',
	// CSS Color Module Level 3
	'aliceblue', 'antiquewhite', 'aquamarine', 'azure', 'beige', 'bisque', 'blanchedalmond', 'blueviolet', 'brown',
	'burlywood', 'cadetblue', 'chartreuse', 'chocolate', 'coral', 'cornflowerblue', 'cornsilk', 'crimson', 'cyan',
	'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen', 'darkgrey', 'darkkhaki', 'darkmagenta',
	'darkolivegreen', 'darkorange', 'darkorchid', 'darkred', 'darksalmon', 'darkseagreen', 'darkslateblue',
	'darkslategray', 'darkslategrey', 'darkturquoise', 'darkviolet', 'deeppink', 'deepskyblue', 'dimgray', 'dimgrey',
	'dodgerblue', 'firebrick', 'floralwhite', 'forestgreen', 'gainsboro', 'ghostwhite', 'gold', 'goldenrod',
	'greenyellow', 'grey', 'honeydew', 'hotpink', 'indianred', 'indigo', 'ivory', 'khaki', 'lavender', 'lavenderblush',
	'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral', 'lightcyan', 'lightgoldenrodyellow', 'lightgray',
	'lightgreen', 'lightgrey', 'lightpink', 'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightslategray',
	'lightslategrey', 'lightsteelblue', 'lightyellow', 'limegreen', 'linen', 'magenta', 'mediumaquamarine',
	'mediumblue', 'mediumorchid', 'mediumpurple', 'mediumseagreen', 'mediumslateblue', 'mediumspringgreen',
	'mediumturquoise', 'mediumvioletred', 'midnightblue', 'mintcream', 'mistyrose', 'moccasin', 'navajowhite',
	'oldlace', 'olivedrab', 'orangered', 'orchid', 'palegoldenrod', 'palegreen', 'paleturquoise', 'palevioletred',
	'papayawhip', 'peachpuff', 'peru', 'pink', 'plum', 'powderblue', 'rosybrown', 'royalblue', 'saddlebrown', 'salmon',
	'sandybrown', 'seagreen', 'seashell', 'sienna', 'skyblue', 'slateblue', 'slategray', 'slategrey', 'snow',
	'springgreen', 'steelblue', 'tan', 'thistle', 'tomato', 'turquoise', 'violet', 'wheat', 'whitesmoke', 'yellowgreen',
	// CSS Color Module Level 4
	'rebeccapurple',
	// Keywords
	'currentcolor', 'transparent'
] );

/**
 * Checks if string contains [color](https://developer.mozilla.org/en-US/docs/Web/CSS/color) CSS value.
 *
 *		isColor( '#f00' );						// true
 *		isColor( '#AA00BB33' );					// true
 *		isColor( 'rgb(0, 0, 250)' );			// true
 *		isColor( 'hsla(240, 100%, 50%, .7)' );	// true
 *		isColor( 'deepskyblue' );				// true
 *
 * **Note**: It does not support CSS Level 4 whitespace syntax, system colors and radius values for HSL colors.
 *
 * @param {String} string
 * @returns {Boolean}
 */
export function isColor( string ) {
	// As far as I was able to test checking some pre-conditions is faster than joining each test with ||.
	if ( string.startsWith( '#' ) ) {
		return HEX_COLOR_REGEXP.test( string );
	}

	if ( string.startsWith( 'rgb' ) ) {
		return RGB_COLOR_REGEXP.test( string ) || RGBA_COLOR_REGEXP.test( string );
	}

	if ( string.startsWith( 'hsl' ) ) {
		return HSL_COLOR_REGEXP.test( string ) || HSLA_COLOR_REGEXP.test( string );
	}

	// Array check > RegExp test.
	return COLOR_NAMES.has( string.toLowerCase() );
}

const lineStyleValues = [ 'none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset' ];

/**
 * Checks if string contains [line style](https://developer.mozilla.org/en-US/docs/Web/CSS/border-style) CSS value.
 *
 * @param {String} string
 * @returns {Boolean}
 */
export function isLineStyle( string ) {
	return lineStyleValues.includes( string );
}

const lengthRegExp = /^([+-]?[0-9]*([.][0-9]+)?(px|cm|mm|in|pc|pt|ch|em|ex|rem|vh|vw|vmin|vmax)|0)$/;

/**
 * Checks if string contains [length](https://developer.mozilla.org/en-US/docs/Web/CSS/length) CSS value.
 *
 * @param {String} string
 * @returns {Boolean}
 */
export function isLength( string ) {
	return lengthRegExp.test( string );
}

const PERCENTAGE_VALUE_REGEXP = /^[+-]?[0-9]*([.][0-9]+)?%$/;

/**
 * Checks if string contains [percentage](https://developer.mozilla.org/en-US/docs/Web/CSS/percentage) CSS value.
 *
 * @param {String} string
 * @returns {Boolean}
 */
export function isPercentage( string ) {
	return PERCENTAGE_VALUE_REGEXP.test( string );
}

const repeatValues = [ 'repeat-x', 'repeat-y', 'repeat', 'space', 'round', 'no-repeat' ];

/**
 * Checks if string contains [background repeat](https://developer.mozilla.org/en-US/docs/Web/CSS/background-repeat) CSS value.
 *
 * @param {String} string
 * @returns {Boolean}
 */
export function isRepeat( string ) {
	return repeatValues.includes( string );
}

const positionValues = [ 'center', 'top', 'bottom', 'left', 'right' ];

/**
 * Checks if string contains [background position](https://developer.mozilla.org/en-US/docs/Web/CSS/background-position) CSS value.
 *
 * @param {String} string
 * @returns {Boolean}
 */
export function isPosition( string ) {
	return positionValues.includes( string );
}

const attachmentValues = [ 'fixed', 'scroll', 'local' ];

/**
 * Checks if string contains [background attachment](https://developer.mozilla.org/en-US/docs/Web/CSS/background-attachment) CSS value.
 *
 * @param {String} string
 * @returns {Boolean}
 */
export function isAttachment( string ) {
	return attachmentValues.includes( string );
}

const urlRegExp = /^url\(/;

/**
 * Checks if string contains [URL](https://developer.mozilla.org/en-US/docs/Web/CSS/url) CSS value.
 *
 * @param {String} string
 * @returns {Boolean}
 */
export function isURL( string ) {
	return urlRegExp.test( string );
}

export function getBoxSidesValues( value = '' ) {
	if ( value === '' ) {
		return { top: undefined, right: undefined, bottom: undefined, left: undefined };
	}

	const values = getShorthandValues( value );

	const top = values[ 0 ];
	const bottom = values[ 2 ] || top;
	const right = values[ 1 ] || top;
	const left = values[ 3 ] || right;

	return { top, bottom, right, left };
}

/**
 * Default reducer for CSS properties that concerns edges of a box
 * [shorthand](https://developer.mozilla.org/en-US/docs/Web/CSS/Shorthand_properties) notations:
 *
 *		stylesProcessor.setReducer( 'padding', getBoxSidesValueReducer( 'padding' ) );
 *
 * @param {String} styleShorthand
 * @returns {Function}
 */
export function getBoxSidesValueReducer( styleShorthand ) {
	return value => {
		const { top, right, bottom, left } = value;

		const reduced = [];

		if ( ![ top, right, left, bottom ].every( value => !!value ) ) {
			if ( top ) {
				reduced.push( [ styleShorthand + '-top', top ] );
			}

			if ( right ) {
				reduced.push( [ styleShorthand + '-right', right ] );
			}

			if ( bottom ) {
				reduced.push( [ styleShorthand + '-bottom', bottom ] );
			}

			if ( left ) {
				reduced.push( [ styleShorthand + '-left', left ] );
			}
		} else {
			reduced.push( [ styleShorthand, getBoxSidesShorthandValue( value ) ] );
		}

		return reduced;
	};
}

/**
 * Returns a [shorthand](https://developer.mozilla.org/en-US/docs/Web/CSS/Shorthand_properties) notation
 * of a CSS property value.
 *
 *		getBoxSidesShorthandValue( { top: '1px', right: '1px', bottom: '2px', left: '1px' } );
 *		// will return '1px 1px 2px'
 *
 * @param {module:engine/view/stylesmap~BoxSides} styleShorthand
 * @returns {Function}
 */
export function getBoxSidesShorthandValue( { top, right, bottom, left } ) {
	const out = [];

	if ( left !== right ) {
		out.push( top, right, bottom, left );
	} else if ( bottom !== top ) {
		out.push( top, right, bottom );
	} else if ( right !== top ) {
		out.push( top, right );
	} else {
		out.push( top );
	}

	return out.join( ' ' );
}

/**
 * Creates a normalizer for a [shorthand](https://developer.mozilla.org/en-US/docs/Web/CSS/Shorthand_properties) 1-to-4 value.
 *
 *		stylesProcessor.setNormalizer( 'margin', getPositionShorthandNormalizer( 'margin' ) );
 *
 * @param {String} shorthand
 * @returns {Function}
 */
export function getPositionShorthandNormalizer( shorthand ) {
	return value => {
		return {
			path: shorthand,
			value: getBoxSidesValues( value )
		};
	};
}

/**
 * Parses parts of a 1-to-4 value notation - handles some CSS values with spaces (like RGB()).
 *
 *		getShorthandValues( 'red blue RGB(0, 0, 0)');
 *		// will return [ 'red', 'blue', 'RGB(0, 0, 0)' ]
 *
 * @param {String} string
 * @returns {Array.<String>}
 */
export function getShorthandValues( string ) {
	return string
		.replace( /, /g, ',' ) // Exclude comma from spaces evaluation as values are separated by spaces.
		.split( ' ' )
		.map( string => string.replace( /,/g, ', ' ) ); // Restore original notation.
}
