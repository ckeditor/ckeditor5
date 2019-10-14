/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/styles
 */

import { get, has, isObject, merge, set, unset } from 'lodash-es';
import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

class StylesConverter {
	constructor() {
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
		 *		stylesConverter.on( 'normalize:border-color', ( evt, data ) => {
		 *			data.path = 'border.color';
		 *			data.value = {
		 *				top: '#f00',
		 *				right: '#ba7',
		 *				bottom: '#f00',
		 *				left: '#ba7'
		 *			}
		 *		} );
		 *
		 * @event normalize
		 */

		this.extractors = new Map();

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
		const data = {
			value: normalizedValue
		};

		this.fire( 'reduce:' + styleName, data );

		return data.reduced || [ [ styleName, normalizedValue ] ];
	}

	getNormalized( name, styles ) {
		if ( !name ) {
			return merge( {}, styles );
		}

		if ( this.extractors.has( name ) ) {
			const extractor = this.extractors.get( name );

			if ( typeof extractor === 'string' ) {
				return this.getNormalized( extractor, styles );
			}

			return extractor( styles, this );
		}

		const path = toPath( name );

		if ( has( styles, path ) ) {
			return get( styles, path );
		} else {
			return styles[ name ];
		}
	}

	/**
	 * Parse style property value to a normalized form.
	 *
	 * @param {String} propertyName Name of style property.
	 * @param {String} value Value of style property.
	 * @param {Object} styles
	 * @private
	 */
	_toNormalizedForm( propertyName, value, styles ) {
		if ( isObject( value ) ) {
			appendStyleValue( styles, toPath( propertyName ), value );

			return;
		}

		const data = {
			path: propertyName,
			value
		};

		this.fire( 'normalize:' + propertyName, data );

		appendStyleValue( styles, data.path, data.value );
	}
}

mix( StylesConverter, EmitterMixin );

const stylesConverter = new StylesConverter();

stylesConverter.on( 'normalize:border', normalizeBorder );

// Border-position shorthands.
stylesConverter.on( 'normalize:border-top', getBorderPositionNormalizer( 'top' ) );
stylesConverter.on( 'normalize:border-right', getBorderPositionNormalizer( 'right' ) );
stylesConverter.on( 'normalize:border-bottom', getBorderPositionNormalizer( 'bottom' ) );
stylesConverter.on( 'normalize:border-left', getBorderPositionNormalizer( 'left' ) );

// Border-property shorthands.
stylesConverter.on( 'normalize:border-color', getBorderPropertyNormalizer( 'color' ) );
stylesConverter.on( 'normalize:border-width', getBorderPropertyNormalizer( 'width' ) );
stylesConverter.on( 'normalize:border-style', getBorderPropertyNormalizer( 'style' ) );

// Border longhands.
stylesConverter.on( 'normalize:border-top-color', getBorderPropertyPositionNormalizer( 'color', 'top' ) );
stylesConverter.on( 'normalize:border-top-style', getBorderPropertyPositionNormalizer( 'style', 'top' ) );
stylesConverter.on( 'normalize:border-top-width', getBorderPropertyPositionNormalizer( 'width', 'top' ) );

stylesConverter.on( 'normalize:border-right-color', getBorderPropertyPositionNormalizer( 'color', 'right' ) );
stylesConverter.on( 'normalize:border-right-style', getBorderPropertyPositionNormalizer( 'style', 'right' ) );
stylesConverter.on( 'normalize:border-right-width', getBorderPropertyPositionNormalizer( 'width', 'right' ) );

stylesConverter.on( 'normalize:border-bottom-color', getBorderPropertyPositionNormalizer( 'color', 'bottom' ) );
stylesConverter.on( 'normalize:border-bottom-style', getBorderPropertyPositionNormalizer( 'style', 'bottom' ) );
stylesConverter.on( 'normalize:border-bottom-width', getBorderPropertyPositionNormalizer( 'width', 'bottom' ) );

stylesConverter.on( 'normalize:border-left-color', getBorderPropertyPositionNormalizer( 'color', 'left' ) );
stylesConverter.on( 'normalize:border-left-style', getBorderPropertyPositionNormalizer( 'style', 'left' ) );
stylesConverter.on( 'normalize:border-left-width', getBorderPropertyPositionNormalizer( 'width', 'left' ) );

stylesConverter.on( 'normalize:margin', getPositionShorthandNormalizer( 'margin' ) );

stylesConverter.on( 'normalize:margin-top', ( evt, data ) => ( data.path = 'margin.top' ) );
stylesConverter.on( 'normalize:margin-right', ( evt, data ) => ( data.path = 'margin.right' ) );
stylesConverter.on( 'normalize:margin-bottom', ( evt, data ) => ( data.path = 'margin.bottom' ) );
stylesConverter.on( 'normalize:margin-left', ( evt, data ) => ( data.path = 'margin.left' ) );

stylesConverter.on( 'normalize:padding', getPositionShorthandNormalizer( 'padding' ) );
stylesConverter.on( 'normalize:padding-top', ( evt, data ) => ( data.path = 'padding.top' ) );
stylesConverter.on( 'normalize:padding-right', ( evt, data ) => ( data.path = 'padding.right' ) );
stylesConverter.on( 'normalize:padding-bottom', ( evt, data ) => ( data.path = 'padding.bottom' ) );
stylesConverter.on( 'normalize:padding-left', ( evt, data ) => ( data.path = 'padding.left' ) );

stylesConverter.on( 'normalize:background', normalizeBackground );
stylesConverter.on( 'normalize:background-color', ( evt, data ) => ( data.path = 'background.color' ) );

stylesConverter.extractors.set( 'border-top', borderPositionExtractor( 'top' ) );
stylesConverter.extractors.set( 'border-right', borderPositionExtractor( 'right' ) );
stylesConverter.extractors.set( 'border-bottom', borderPositionExtractor( 'bottom' ) );
stylesConverter.extractors.set( 'border-left', borderPositionExtractor( 'left' ) );

stylesConverter.extractors.set( 'border-top-color', 'border.color.top' );
stylesConverter.extractors.set( 'border-right-color', 'border.color.right' );
stylesConverter.extractors.set( 'border-bottom-color', 'border.color.bottom' );
stylesConverter.extractors.set( 'border-left-color', 'border.color.left' );

stylesConverter.extractors.set( 'border-top-width', 'border.width.top' );
stylesConverter.extractors.set( 'border-right-width', 'border.width.right' );
stylesConverter.extractors.set( 'border-bottom-width', 'border.width.bottom' );
stylesConverter.extractors.set( 'border-left-width', 'border.width.left' );

stylesConverter.extractors.set( 'border-top-style', 'border.style.top' );
stylesConverter.extractors.set( 'border-right-style', 'border.style.right' );
stylesConverter.extractors.set( 'border-bottom-style', 'border.style.bottom' );
stylesConverter.extractors.set( 'border-left-style', 'border.style.left' );

stylesConverter.on( 'reduce:border-color', getTopRightBottomLeftValueReducer( 'border-color' ) );
stylesConverter.on( 'reduce:border-style', getTopRightBottomLeftValueReducer( 'border-style' ) );
stylesConverter.on( 'reduce:border-width', getTopRightBottomLeftValueReducer( 'border-width' ) );
stylesConverter.on( 'reduce:border-top', ( evt, data ) => ( data.reduced = getBorderPositionReducer( 'top' )( data.value ) ) );
stylesConverter.on( 'reduce:border-right', ( evt, data ) => ( data.reduced = getBorderPositionReducer( 'right' )( data.value ) ) );
stylesConverter.on( 'reduce:border-bottom', ( evt, data ) => ( data.reduced = getBorderPositionReducer( 'bottom' )( data.value ) ) );
stylesConverter.on( 'reduce:border-left', ( evt, data ) => ( data.reduced = getBorderPositionReducer( 'left' )( data.value ) ) );
stylesConverter.on( 'reduce:border', getBorderReducer );

stylesConverter.on( 'reduce:margin', getTopRightBottomLeftValueReducer( 'margin' ) );
stylesConverter.on( 'reduce:padding', getTopRightBottomLeftValueReducer( 'padding' ) );

stylesConverter.on( 'reduce:background', ( evt, data ) => {
	const ret = [];

	ret.push( [ 'background-color', data.value.color ] );

	data.reduced = ret;
} );

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

			stylesConverter._toNormalizedForm( key, value, this._styles );
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
			stylesConverter._toNormalizedForm( nameOrObject, value, this._styles );
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
		return stylesConverter.getNormalized( name, this._styles );
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
		const normalized = stylesConverter.getNormalized( propertyName, this._styles );

		if ( !normalized ) {
			// Try return styles set directly - values that are not parsed.
			return this._styles[ propertyName ];
		}

		if ( isObject( normalized ) ) {
			const styles = stylesConverter._getReduceForm( propertyName, normalized );

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
			const normalized = stylesConverter.getNormalized( key, this._styles );

			parsed.push( ...stylesConverter._getReduceForm( key, normalized ) );
		}

		return parsed;
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
	return ( evt, data ) => {
		data.path = longhand;
		data.value = getTopRightBottomLeftValues( data.value );
	};
}

function normalizeBorder( evt, data ) {
	const { color, style, width } = normalizeBorderShorthand( data.value );

	data.path = 'border';
	data.value = {
		color: getTopRightBottomLeftValues( color ),
		style: getTopRightBottomLeftValues( style ),
		width: getTopRightBottomLeftValues( width )
	};
}

function getBorderPositionNormalizer( side ) {
	return ( evt, data ) => {
		const { color, style, width } = normalizeBorderShorthand( data.value );

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

		data.path = 'border';
		data.value = border;
	};
}

function getBorderPropertyNormalizer( propertyName ) {
	return ( evt, data ) => {
		data.path = 'border';
		data.value = toBorderPropertyShorthand( data.value, propertyName );
	};
}

function getBorderPropertyPositionNormalizer( property, side ) {
	return ( evt, data ) => {
		data.path = 'border';
		data.value = {
			[ property ]: {
				[ side ]: data.value
			}
		};
	};
}

function borderPositionExtractor( which ) {
	return ( styles, converter ) => {
		const border = converter.getNormalized( 'border', styles );

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

function normalizeBackground( evt, data ) {
	const background = {};

	const parts = data.value.split( ' ' );

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

	data.path = 'background';
	data.value = background;
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

function getBorderReducer( evt, data ) {
	const ret = [];

	ret.push( ...getBorderPositionReducer( 'top' )( data.value ) );
	ret.push( ...getBorderPositionReducer( 'right' )( data.value ) );
	ret.push( ...getBorderPositionReducer( 'bottom' )( data.value ) );
	ret.push( ...getBorderPositionReducer( 'left' )( data.value ) );

	data.reduced = ret;
}

function getTopRightBottomLeftValueReducer( styleShorthand ) {
	return ( evt, data ) => {
		const { top, right, bottom, left } = ( data.value || {} );

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
			reduced.push( [ styleShorthand, getTopRightBottomLeftShorthandValue( data.value ) ] );
		}

		data.reduced = reduced;
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

		if ( reduced.length ) {
			return [ [ 'border-' + which, reduced.join( ' ' ) ] ];
		}

		return [];
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
