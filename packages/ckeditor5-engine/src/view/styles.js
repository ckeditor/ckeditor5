/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/styles
 */

import { get, has, isObject, isPlainObject, merge, set, unset } from 'lodash-es';

const borderPositionRegExp = /border-(top|right|bottom|left)$/;

const setOnPathStyles = [
	'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
	'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style',
	'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
	'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
	'margin-top', 'margin-right', 'margin-bottom', 'margin-left'
];

/**
 * Styles class.
 *
 * Handles styles normalization.
 */
export default class Styles {
	/**
	 * Creates Styles instance.
	 *
	 * @param {String} styleString Initial styles value.
	 */
	constructor( styleString = '' ) {
		this._styles = {};

		this.setStyle( styleString );
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
	 * @param styleString
	 */
	setStyle( styleString = '' ) {
		this.clear();
		this._parseStyle( styleString );
	}

	/**
	 * Checks if single style rule is set.
	 *
	 * Supports shorthands.
	 *
	 * @param {String} name
	 * @returns {Boolean}
	 */
	hasRule( name ) {
		const nameNorm = this._getPath( name );

		return has( this._styles, nameNorm ) || !!this._styles[ name ];
	}

	/**
	 * Inserts single style rule.
	 *
	 * Supports shorthands.
	 *
	 * @param {String|Object} nameOrObject
	 * @param {String|Object} value
	 * @returns {Boolean}
	 */
	insertRule( nameOrObject, value ) {
		if ( isPlainObject( nameOrObject ) ) {
			for ( const key of Object.keys( nameOrObject ) ) {
				this.insertRule( key, nameOrObject[ key ] );
			}
		} else {
			this._parseRule( nameOrObject, value );
		}
	}

	removeRule( name ) {
		unset( this._styles, this._getPath( name ) );

		delete this._styles[ name ];
	}

	getModel( name ) {
		if ( !name ) {
			return merge( {}, this._styles );
		}

		const path = this._getPath( name );

		if ( has( this._styles, path ) ) {
			return get( this._styles, path );
		} else {
			return this._styles[ name ];
		}
	}

	getInlineStyle() {
		const parsed = [];

		const keys = Object.keys( this._styles ).sort();

		if ( !keys.length ) {
			return;
		}

		for ( const key of keys ) {
			const model = this.getModel( key );

			parsed.push( toInlineStyle( key, model ) );
		}

		return parsed.join( ';' ) + ';';
	}

	getInlineRule( name ) {
		const model = this.getModel( name );

		if ( !model ) {
			// Try return directly
			return this._styles[ name ];
		}

		if ( isObject( model ) ) {
			return toInlineStyle( name, model, true );
		}
		// String value
		else {
			return model;
		}
	}

	// TODO: expandShortHands: true/false?
	getStyleNames() {
		const inlineStyle = this.getInlineStyle();

		// TODO: probably not good enough.
		// TODO: consumables must have different names or support shorthands.
		return inlineStyle.split( ';' ).filter( f => f !== '' ).map( abc => abc.split( ':' )[ 0 ] ).sort();
	}

	clear() {
		this._styles = {};
	}

	_getPath( name ) {
		return name.replace( '-', '.' );
	}

	_parseStyle( string ) {
		const map = parseInlineStyles( string );

		for ( const key of map.keys() ) {
			const value = map.get( key );

			this._parseRule( key, value );
		}
	}

	_appendStyleValue( nameOrPath, valueOrObject ) {
		if ( typeof valueOrObject === 'object' ) {
			if ( nameOrPath.includes( '.' ) ) {
				const got = get( this._styles, nameOrPath );
				set( this._styles, nameOrPath, merge( {}, got, valueOrObject ) );
			} else {
				this._styles[ nameOrPath ] = merge( {}, this._styles[ nameOrPath ], valueOrObject );
			}
		} else {
			set( this._styles, nameOrPath, valueOrObject );
		}
	}

	_parseRule( key, value ) {
		if ( isPlainObject( value ) ) {
			this._appendStyleValue( key, value );
			return;
		}

		const baseKey = key.split( '-' )[ 0 ];

		// Set directly to object.
		if ( setOnPathStyles.includes( key ) ) {
			this._appendStyleValue( this._getPath( key ), value );

			return;
		}

		let processed;

		if ( baseKey === 'border' ) {
			processed = processBorder( key, value );
		}

		if ( key === 'margin' || key === 'padding' ) {
			processed = { key, value: getTopRightBottomLeftValues( value ) };
		}

		let processedKey = key;
		let processedValue = value;

		if ( processed ) {
			processedKey = processed.key;
			processedValue = processed.value;
		}

		this._appendStyleValue( processedKey, processedValue );
	}
}

function getTopRightBottomLeftValues( value ) {
	const values = value.split( ' ' );

	const top = values[ 0 ];
	const bottom = values[ 2 ] || top;
	const right = values[ 1 ] || top;
	const left = values[ 3 ] || right;

	return { top, bottom, right, left };
}

function toBorderPropertyShorthand( value, property ) {
	const { top, bottom, right, left } = getTopRightBottomLeftValues( value );

	return {
		top: { [ property ]: top },
		right: { [ property ]: right },
		bottom: { [ property ]: bottom },
		left: { [ property ]: left }
	};
}

function processBorder( key, value ) {
	if ( key === 'border' ) {
		const parsedBorder = parseShorthandBorderAttribute( value );

		const border = {
			top: parsedBorder,
			right: parsedBorder,
			bottom: parsedBorder,
			left: parsedBorder
		};

		return { key: 'border', value: border };
	}

	if ( borderPositionRegExp.test( key ) ) {
		return { key: key.replace( '-', '.' ), value: parseShorthandBorderAttribute( value ) };
	}

	if ( key === 'border-color' ) {
		return {
			key: 'border',
			value: toBorderPropertyShorthand( value, 'color' )
		};
	}

	if ( key === 'border-style' ) {
		return {
			key: 'border',
			value: toBorderPropertyShorthand( value, 'style' )
		};
	}

	if ( key === 'border-width' ) {
		return {
			key: 'border',
			value: toBorderPropertyShorthand( value, 'width' )
		};
	}
}

function parseShorthandBorderAttribute( string ) {
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

function isColor( string ) {
	return /^([#0-9A-Fa-f]{3,8}|[a-zA-Z]+)$/.test( string ) && !isLineStyle( string );
}

function isLineStyle( string ) {
	return /^(none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset)$/.test( string );
}

function isLength( string ) {
	return /^[+-]?[0-9]?[.]?[0-9]+([a-z]+|%)$/.test( string );
}

function printSingleValues( { top, right, bottom, left }, prefix ) {
	const ret = [];

	if ( top ) {
		ret.push( prefix + '-top:' + top );
	}

	if ( right ) {
		ret.push( prefix + '-right:' + right );
	}

	if ( bottom ) {
		ret.push( prefix + '-bottom:' + bottom );
	}

	if ( left ) {
		ret.push( prefix + '-left:' + left );
	}

	return ret.join( ';' );
}

function outputShorthandableValue( styleObject, strict, styleShorthand ) {
	const { top, right, bottom, left } = styleObject;

	if ( top === left && left === bottom && bottom === right ) {
		return ( strict ? '' : styleShorthand + ':' ) + top;
	} else if ( ![ top, right, left, bottom ].every( value => !!value ) ) {
		return printSingleValues( { top, right, bottom, left }, 'margin' );
	} else {
		const out = [];

		if ( left !== right ) {
			out.push( top, right, bottom, left );
		} else if ( bottom !== top ) {
			out.push( top, right, bottom );
		} else if ( right != top ) {
			out.push( top, right );
		} else {
			out.push( top );
		}

		return `${ strict ? '' : styleShorthand + ':' }${ out.join( ' ' ) }`;
	}
}

function toInlineStyle( styleName, styleObjectOrString, strict = false ) {
	if ( styleName === 'border' ) {
		const top = toInlineBorder( styleObjectOrString.top );
		const right = toInlineBorder( styleObjectOrString.right );
		const bottom = toInlineBorder( styleObjectOrString.bottom );
		const left = toInlineBorder( styleObjectOrString.left );

		if ( top === right && right === bottom && bottom === left ) {
			return ( strict ? '' : 'border:' ) + top;
		} else if ( !strict ) {
			return printSingleValues( { top, right, bottom, left }, 'border' );
		}

		return;
	}

	if ( borderPositionRegExp.test( styleName ) ) {
		return toInlineBorder( styleObjectOrString );
	}

	if ( styleName === 'margin' ) {
		return outputShorthandableValue( styleObjectOrString, strict, 'margin' );
	}

	return ( strict ? '' : styleName + ':' ) + styleObjectOrString;
}

function toInlineBorder( object = {} ) {
	const style = [];

	if ( object.width ) {
		style.push( object.width );
	}

	if ( object.style ) {
		style.push( object.style );
	}

	if ( object.color ) {
		style.push( object.color );
	}

	return style.join( ' ' );
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
