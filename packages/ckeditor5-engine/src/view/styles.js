/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/styles
 */

import { get, has, isObject, merge, set, unset } from 'lodash-es';

const setOnPathStyles = [
	// Margin & padding.
	'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
	'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
	// Background.
	'background-color'
];

/**
 * Styles class.
 *
 * Handles styles normalization.
 */
export default class Styles {
	/**
	 * Creates Styles instance.
	 */
	constructor() {
		/**
		 * @type {{}}
		 * @private
		 */
		this._styles = {};

		/**
		 * Holds shorthand properties normalizers.
		 *
		 * Shorthand properties must be normalized as they can be written in various ways.
		 * Normalizer must return object describing given shorthand.
		 *
		 * Example:
		 * The `border-color` style is a shorthand property for `border-top-color`, `border-right-color`, `border-bottom-color`
		 * and `border-left-color`. Similarly there are shorthand for border width (`border-width`) and style (`border-style`).
		 *
		 * For `border-color` the given shorthand:
		 *
		 *		border-color: #f00 #ba7;
		 *
		 * might be written as:
		 *
		 *		border-color-top: #f00;
		 *		border-color-right: #ba7;
		 *		border-color-bottom: #f00;
		 *		border-color-left: #ba7;
		 *
		 * Normalizers produces coherent object representation for both shorthand and longhand forms:
		 *
		 *		const style = {
		 *			border: {
		 *				color: {
		 *					top: '#f00',
		 *					right: '#ba7',
		 *					bottom: '#f00',
		 *					left: '#ba7'
		 *				}
		 *			}
		 *		}
		 *
		 * @type {Map<String, Function>}
		 */
		this.normalizers = new Map();

		this.normalizers.set( 'border', normalizeBorder );
		this.normalizers.set( 'border-top', getBorderPositionNormalizer( 'top' ) );
		this.normalizers.set( 'border-right', getBorderPositionNormalizer( 'right' ) );
		this.normalizers.set( 'border-bottom', getBorderPositionNormalizer( 'bottom' ) );
		this.normalizers.set( 'border-left', getBorderPositionNormalizer( 'left' ) );
		this.normalizers.set( 'border-color', getBorderPropertyNormalizer( 'color' ) );
		this.normalizers.set( 'border-width', getBorderPropertyNormalizer( 'width' ) );
		this.normalizers.set( 'border-style', getBorderPropertyNormalizer( 'style' ) );

		this.normalizers.set( 'background', normalizeBackground );

		this.normalizers.set( 'margin', getPositionShorthandNormalizer( 'margin' ) );
		this.normalizers.set( 'padding', getPositionShorthandNormalizer( 'padding' ) );

		this.extractors = new Map();
		this.extractors.set( 'border-top', borderPositionExtractor( 'top' ) );
		this.extractors.set( 'border-right', borderPositionExtractor( 'right' ) );
		this.extractors.set( 'border-bottom', borderPositionExtractor( 'bottom' ) );
		this.extractors.set( 'border-left', borderPositionExtractor( 'left' ) );

		/**
		 * Holds style normalize object reducers.
		 *
		 * An style inliner takes normalized object of style property and outputs array of normalized property-value pairs that can
		 * be later used to inline a style.
		 *
		 * Those work in opposite direction to {@link #normalizers} and always outputs style in the same way.
		 *
		 * If normalized style is represented as:
		 *
		 *		const style = {
		 *			border: {
		 *				color: {
		 *					top: '#f00',
		 *					right: '#ba7',
		 *					bottom: '#f00',
		 *					left: '#ba7'
		 *				}
		 *			}
		 *		}
		 *
		 * The border reducer will output:
		 *
		 *		const reduced = [
		 *			[ 'border-color', '#f00 #ba7' ]
		 *		];
		 *
		 * which can be used to return the inline style string:
		 *
		 *		style="border-color:#f00 #ba7;"
		 *
		 * @type {Map<String, Function>}
		 */
		this.reducers = new Map();

		this.reducers.set( 'border-color', getTopRightBottomLeftValueReducer( 'border-color' ) );
		this.reducers.set( 'border-style', getTopRightBottomLeftValueReducer( 'border-style' ) );
		this.reducers.set( 'border-width', getTopRightBottomLeftValueReducer( 'border-width' ) );
		this.reducers.set( 'border-top', getBorderPositionReducer( 'top' ) );
		this.reducers.set( 'border-right', getBorderPositionReducer( 'right' ) );
		this.reducers.set( 'border-bottom', getBorderPositionReducer( 'bottom' ) );
		this.reducers.set( 'border-left', getBorderPositionReducer( 'left' ) );
		this.reducers.set( 'border', getBorderReducer );

		this.reducers.set( 'margin', getTopRightBottomLeftValueReducer( 'margin' ) );
		this.reducers.set( 'padding', getTopRightBottomLeftValueReducer( 'padding' ) );

		this.reducers.set( 'background', value => {
			const ret = [];

			ret.push( [ 'background-color', value.color ] );

			return ret;
		} );
	}

	/**
	 * Number of styles defined.
	 *
	 * @type {Number}
	 */
	get size() {
		return this.getStyleNames().length;
	}

	/**
	 * Re-sets internal styles definition.
	 *
	 * @param {String} styleString
	 */
	setStyle( styleString ) {
		this.clear();

		const map = parseInlineStyles( styleString );

		for ( const key of map.keys() ) {
			const value = map.get( key );

			this._toNormalizedForm( key, value );
		}
	}

	/**
	 * Checks if single style rule is set.
	 *
	 * Supports shorthands.
	 *
	 * @param {String} name
	 * @returns {Boolean}
	 */
	hasProperty( name ) {
		const nameNorm = toPath( name );

		return has( this._styles, nameNorm ) || !!this._styles[ name ];
	}

	/**
	 * Inserts single style property.
	 *
	 * Can insert one by one
	 *
	 *		styles.insertProperty( 'color', 'blue' );
	 *		styles.insertProperty( 'margin-right', '1em' );
	 *
	 * or many styles at once:
	 *
	 *		styles.insertProperty( {
	 *			color: 'blue',
	 *			'margin-right': '1em'
	 *		} );
	 *
	 * Supports shorthands.
	 *
	 * @param {String|Object} nameOrObject
	 * @param {String|Object} value
	 * @returns {Boolean}
	 */
	insertProperty( nameOrObject, value ) {
		if ( isObject( nameOrObject ) ) {
			for ( const key of Object.keys( nameOrObject ) ) {
				this.insertProperty( key, nameOrObject[ key ] );
			}
		} else {
			this._toNormalizedForm( nameOrObject, value );
		}
	}

	/**
	 * Removes styles property.
	 *
	 * @param name
	 */
	removeProperty( name ) {
		unset( this._styles, toPath( name ) );
		delete this._styles[ name ];
	}

	/**
	 * Return normalized style object;
	 *
	 *		const styles = new Styles();
	 *		styles.setStyle( 'margin:1px 2px 3em;' );
	 *
	 *		console.log( styles.getNormalized( 'margin' ) );
	 *		// will log:
	 *		// {
	 *		//     top: '1px',
	 *		//     right: '2px',
	 *		//     bottom: '3em',
	 *		//     left: '2px'
	 *		// }
	 *
	 * @param {String} name
	 * @returns {Object|undefined}
	 */
	getNormalized( name ) {
		if ( !name ) {
			return merge( {}, this._styles );
		}

		if ( this.extractors.has( name ) ) {
			return this.extractors.get( name )( this );
		}

		const path = toPath( name );

		if ( has( this._styles, path ) ) {
			return get( this._styles, path );
		} else {
			return this._styles[ name ];
		}
	}

	/**
	 * Returns a string containing normalized styles string or undefined if no style properties are set.
	 *
	 * @returns {String|undefined}
	 */
	getInlineStyle() {
		const entries = this._getStylesEntries();

		// Return undefined for empty styles map.
		if ( !entries.length ) {
			return;
		}

		return entries.map( arr => arr.join( ':' ) ).join( ';' ) + ';';
	}

	/**
	 * Returns property value string.
	 *
	 * @param {String} propertyName
	 * @returns {String|undefined}
	 */
	getInlineProperty( propertyName ) {
		const normalized = this.getNormalized( propertyName );

		if ( !normalized ) {
			// Try return styles set directly - values that are not parsed.
			return this._styles[ propertyName ];
		}

		if ( isObject( normalized ) ) {
			const styles = this._getReduceForm( propertyName, normalized );

			const propertyDescriptor = styles.find( ( [ property ] ) => property === propertyName );

			// Only return a value if it is set;
			if ( Array.isArray( propertyDescriptor ) ) {
				return propertyDescriptor[ 1 ];
			}
		} else {
			return normalized;
		}
	}

	/**
	 * Returns style properties names as the would appear when using {@link #getInlineStyle()}
	 *
	 * @returns {Array.<String>}
	 */
	getStyleNames() {
		const entries = this._getStylesEntries();

		return entries.map( ( [ key ] ) => key );
	}

	/**
	 * Removes all styles.
	 */
	clear() {
		this._styles = {};
	}

	/**
	 * Returns normalized styles entries for further processing.
	 *
	 * @private
	 * @returns {Array.<Array.<String, String>> ]}
	 */
	_getStylesEntries() {
		const parsed = [];

		const keys = Object.keys( this._styles ).sort();

		for ( const key of keys ) {
			const normalized = this.getNormalized( key );

			parsed.push( ...this._getReduceForm( key, normalized ) );
		}

		return parsed;
	}

	/**
	 * Parse style property value to a normalized form.
	 *
	 * @param {String} propertyName Name of style property.
	 * @param {String} value Value of style property.
	 * @private
	 */
	_toNormalizedForm( propertyName, value ) {
		if ( isObject( value ) ) {
			appendStyleValue( this._styles, toPath( propertyName ), value );
			return;
		}

		// Set directly to an object.
		if ( setOnPathStyles.includes( propertyName ) ) {
			appendStyleValue( this._styles, toPath( propertyName ), value );

			return;
		}

		if ( this.normalizers.has( propertyName ) ) {
			const parser = this.normalizers.get( propertyName );

			// TODO: merge with appendStyleValue?
			this._styles = merge( {}, this._styles, parser( value ) );
		} else {
			appendStyleValue( this._styles, propertyName, value );
		}
	}

	/**
	 * Returns reduced form of style property form normalized object.
	 *
	 * @private
	 * @param {String} styleName
	 * @param {Object|String} normalizedValue
	 * @returns {Array.<Array.<String, String>>}
	 */
	_getReduceForm( styleName, normalizedValue ) {
		if ( this.reducers.has( styleName ) ) {
			const styleGetter = this.reducers.get( styleName );

			return styleGetter( normalizedValue );
		}

		return [ [ styleName, normalizedValue ] ];
	}
}

function getTopRightBottomLeftValues( value = '' ) {
	if ( value === '' ) {
		return { top: undefined, right: undefined, bottom: undefined, left: undefined };
	}

	const values = value.split( ' ' );

	const top = values[ 0 ];
	const bottom = values[ 2 ] || top;
	const right = values[ 1 ] || top;
	const left = values[ 3 ] || right;

	return { top, bottom, right, left };
}

function toBorderPropertyShorthand( value, property ) {
	return {
		[ property ]: getTopRightBottomLeftValues( value )
	};
}

function getPositionShorthandNormalizer( longhand ) {
	return value => {
		return { [ longhand ]: getTopRightBottomLeftValues( value ) };
	};
}

function normalizeBorder( value ) {
	const { color, style, width } = normalizeBorderShorthand( value );

	return {
		border: {
			color: getTopRightBottomLeftValues( color ),
			style: getTopRightBottomLeftValues( style ),
			width: getTopRightBottomLeftValues( width )
		}
	};
}

function getBorderPositionNormalizer( side ) {
	return value => {
		const { color, style, width } = normalizeBorderShorthand( value );

		const border = {};

		if ( color !== undefined ) {
			border.color = { [ side ]: color };
		}

		if ( style !== undefined ) {
			border.style = { [ side ]: style };
		}

		if ( width !== undefined ) {
			border.width = { [ side ]: width };
		}

		return { border };
	};
}

function getBorderPropertyNormalizer( propertyName ) {
	return value => ( { border: toBorderPropertyShorthand( value, propertyName ) } );
}

function borderPositionExtractor( which ) {
	return styles => {
		const border = styles.getNormalized( 'border' );

		const value = [];

		if ( border.width && border.width[ which ] ) {
			value.push( border.width[ which ] );
		}

		if ( border.style && border.style[ which ] ) {
			value.push( border.style[ which ] );
		}

		if ( border.color && border.color[ which ] ) {
			value.push( border.color[ which ] );
		}

		return value.join( ' ' );
	};
}

function normalizeBorderShorthand( string ) {
	const result = {};

	for ( const part of string.split( ' ' ) ) {
		if ( isLength( part ) ) {
			result.width = part;
		}

		if ( isLineStyle( part ) ) {
			result.style = part;
		}

		if ( isColor( part ) ) {
			result.color = part;
		}
	}

	return result;
}

function normalizeBackground( value ) {
	const background = {};

	const parts = value.split( ' ' );

	for ( const part of parts ) {
		if ( isRepeat( part ) ) {
			background.repeat = background.repeat || [];
			background.repeat.push( part );
		} else if ( isPosition( part ) ) {
			background.position = background.position || [];
			background.position.push( part );
		} else if ( isAttachment( part ) ) {
			background.attachment = part;
		} else if ( isColor( part ) ) {
			background.color = part;
		} else if ( isURL( part ) ) {
			background.image = part;
		}
	}

	return { background };
}

function isColor( string ) {
	return /^([#0-9A-Fa-f]{3,8}|[a-zA-Z]+)$/.test( string ) && !isLineStyle( string );
}

function isLineStyle( string ) {
	return /^(none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset)$/.test( string );
}

function isLength( string ) {
	return /^[+-]?[0-9]?[.]?[0-9]+([a-z]+|%)$/.test( string );
}

function isRepeat( string ) {
	return /^(repeat-x|repeat-y|repeat|space|round|no-repeat)$/.test( string );
}

function isPosition( string ) {
	return /^(center|top|bottom|left|right)$/.test( string );
}

function isAttachment( string ) {
	return /^(fixed|scroll|local)$/.test( string );
}

function isURL( string ) {
	return /^url\(/.test( string );
}

function getBorderReducer( value ) {
	const ret = [];

	ret.push( ...getBorderPositionReducer( 'top' )( value ) );
	ret.push( ...getBorderPositionReducer( 'right' )( value ) );
	ret.push( ...getBorderPositionReducer( 'bottom' )( value ) );
	ret.push( ...getBorderPositionReducer( 'left' )( value ) );

	return ret;
}

function getTopRightBottomLeftValueReducer( styleShorthand ) {
	return value => {
		const { top, right, bottom, left } = ( value || {} );

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
			reduced.push( [ styleShorthand, getTopRightBottomLeftShorthandValue( value ) ] );
		}

		return reduced;
	};
}

function getBorderPositionReducer( which ) {
	return value => {
		const reduced = [];

		if ( value && value.width && value.width[ which ] !== undefined ) {
			reduced.push( value.width[ which ] );
		}

		if ( value && value.style && value.style[ which ] !== undefined ) {
			reduced.push( value.style[ which ] );
		}

		if ( value && value.color && value.color[ which ] !== undefined ) {
			reduced.push( value.color[ which ] );
		}

		return [ [ 'border-' + which, reduced.join( ' ' ) ] ];
	};
}

function getTopRightBottomLeftShorthandValue( { left, right, top, bottom } ) {
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

// Parses inline styles and puts property - value pairs into styles map.
//
// @param {String} stylesString Styles to parse.
// @returns {Map.<String, String>} stylesMap Map of parsed properties and values.
function parseInlineStyles( stylesString ) {
	// `null` if no quote was found in input string or last found quote was a closing quote. See below.
	let quoteType = null;
	let propertyNameStart = 0;
	let propertyValueStart = 0;
	let propertyName = null;

	const stylesMap = new Map();

	// Do not set anything if input string is empty.
	if ( stylesString === '' ) {
		return stylesMap;
	}

	// Fix inline styles that do not end with `;` so they are compatible with algorithm below.
	if ( stylesString.charAt( stylesString.length - 1 ) != ';' ) {
		stylesString = stylesString + ';';
	}

	// Seek the whole string for "special characters".
	for ( let i = 0; i < stylesString.length; i++ ) {
		const char = stylesString.charAt( i );

		if ( quoteType === null ) {
			// No quote found yet or last found quote was a closing quote.
			switch ( char ) {
				case ':':
					// Most of time colon means that property name just ended.
					// Sometimes however `:` is found inside property value (for example in background image url).
					if ( !propertyName ) {
						// Treat this as end of property only if property name is not already saved.
						// Save property name.
						propertyName = stylesString.substr( propertyNameStart, i - propertyNameStart );
						// Save this point as the start of property value.
						propertyValueStart = i + 1;
					}

					break;

				case '"':
				case '\'':
					// Opening quote found (this is an opening quote, because `quoteType` is `null`).
					quoteType = char;

					break;

				case ';': {
					// Property value just ended.
					// Use previously stored property value start to obtain property value.
					const propertyValue = stylesString.substr( propertyValueStart, i - propertyValueStart );

					if ( propertyName ) {
						// Save parsed part.
						stylesMap.set( propertyName.trim(), propertyValue.trim() );
					}

					propertyName = null;

					// Save this point as property name start. Property name starts immediately after previous property value ends.
					propertyNameStart = i + 1;

					break;
				}
			}
		} else if ( char === quoteType ) {
			// If a quote char is found and it is a closing quote, mark this fact by `null`-ing `quoteType`.
			quoteType = null;
		}
	}

	return stylesMap;
}

function toPath( name ) {
	return name.replace( '-', '.' );
}

// Appends style definition to the styles object.
//
// @param {String} nameOrPath
// @param {String|Object} valueOrObject
// @private
function appendStyleValue( stylesObject, nameOrPath, valueOrObject ) {
	let valueToSet = valueOrObject;

	if ( isObject( valueOrObject ) ) {
		valueToSet = merge( {}, get( stylesObject, nameOrPath ), valueOrObject );
	}

	set( stylesObject, nameOrPath, valueToSet );
}
