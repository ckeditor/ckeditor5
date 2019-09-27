/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/styles
 */

import { get, has, isObject, isPlainObject, merge, unset } from 'lodash-es';

/**
 * Styles class.
 *
 * Handles styles normalization.
 */
export default class Styles {
	constructor( styleString = '' ) {
		this._styles = {};

		this.setStyle( styleString );
	}

	get size() {
		return Object.keys( this._styles ).length;
	}

	setStyle( styleString = '' ) {
		this._styles = parseStyle( styleString );
	}

	hasRule( name ) {
		const nameNorm = name.replace( '-', '.' );

		return has( this._styles, nameNorm ) || !!this._styles[ name ];
	}

	insertRule( nameOrObject, value ) {
		if ( isPlainObject( nameOrObject ) ) {
			for ( const key of Object.keys( nameOrObject ) ) {
				this.insertRule( key, nameOrObject[ key ] );
			}
		} else {
			parseRule( nameOrObject, value, this._styles );
		}
	}

	removeRule( name ) {
		unset( this._styles, name.replace( '-', '.' ) );
		delete this._styles[ name ];
	}

	getModel( name ) {
		if ( !name ) {
			return this._styles;
		} // TODO: clone

		if ( has( this._styles, name.replace( '-', '.' ) ) ) {
			return get( this._styles, name.replace( '-', '.' ) );
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

	clear() {
		this._styles = {};
	}
}

const borderPositionRegExp = /border-(top|right|bottom|left)$/;
const marginOrPaddingPositionRegExp = /(margin|padding)-(top|right|bottom|left)$/;

function parseStyle( string, styleObject = {} ) {
	const map = new Map();

	parseInlineStyles( map, string );

	for ( const key of map.keys() ) {
		const value = map.get( key );

		parseRule( key, value, styleObject );
	}

	return styleObject;
}

function getTopRightBottomLeftValues( value ) {
	const values = value.split( ' ' );

	const top = values[ 0 ];
	const bottom = values[ 2 ] || top;
	const right = values[ 1 ] || top;
	const left = values[ 3 ] || right;
	return { top, bottom, right, left };
}

function parseRule( key, value, styleObject ) {
	if ( isPlainObject( value ) ) {
		addStyle( styleObject, key, value );
		return;
	}

	if ( key === 'border' ) {
		const parsedBorder = parseBorderAttribute( value );

		const border = {
			top: parsedBorder,
			right: parsedBorder,
			bottom: parsedBorder,
			left: parsedBorder
		};

		addStyle( styleObject, 'border', border );
	} else if ( borderPositionRegExp.test( key ) ) {
		const border = {};
		const which = borderPositionRegExp.exec( key )[ 1 ];

		border[ which ] = parseBorderAttribute( value );

		addStyle( styleObject, 'border', border );
	} else if ( key === 'border-color' ) {
		const { top, bottom, right, left } = getTopRightBottomLeftValues( value );

		addStyle( styleObject, 'border', {
			top: { color: top },
			right: { color: right },
			bottom: { color: bottom },
			left: { color: left }
		} );
	} else if ( key === 'border-style' ) {
		const { top, bottom, right, left } = getTopRightBottomLeftValues( value );

		addStyle( styleObject, 'border', {
			top: { style: top },
			right: { style: right },
			bottom: { style: bottom },
			left: { style: left }
		} );
	} else if ( key === 'border-width' ) {
		const { top, bottom, right, left } = getTopRightBottomLeftValues( value );

		addStyle( styleObject, 'border', {
			top: { width: top },
			right: { width: right },
			bottom: { width: bottom },
			left: { width: left }
		} );
	} else if ( key === 'margin' || key === 'padding' ) {
		addStyle( styleObject, key, getTopRightBottomLeftValues( value ) );
	} else if ( marginOrPaddingPositionRegExp.test( key ) ) {
		const margin = {};
		const match = marginOrPaddingPositionRegExp.exec( key );
		const rule = match[ 1 ];
		const which = match[ 2 ];

		margin[ which ] = value;

		addStyle( styleObject, rule, margin );
	} else {
		addStyle( styleObject, key, value );
	}
}

function parseBorderAttribute( string ) {
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

function addStyle( styleObject, name, value ) {
	if ( typeof value === 'object' ) {
		styleObject[ name ] = merge( {}, styleObject[ name ], value );
	} else {
		styleObject[ name ] = value;
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
			const ret = [];

			// TODO not so nice:
			if ( top ) {
				ret.push( 'border-top:' + top );
			}

			if ( right ) {
				ret.push( 'border-right:' + right );
			}

			if ( bottom ) {
				ret.push( 'border-bottom:' + bottom );
			}

			if ( left ) {
				ret.push( 'border-left:' + left );
			}

			return ret.join( ';' );
		}

		return;
	}

	if ( borderPositionRegExp.test( styleName ) ) {
		return toInlineBorder( styleObjectOrString );
	}

	if ( styleName === 'margin' ) {
		const { top, right, bottom, left } = styleObjectOrString;

		if ( top === left && left === bottom && bottom === right ) {
			return ( strict ? 'margin' : '' ) + top;
		} else if ( ![ top, right, left, bottom ].every( value => !!value ) ) {
			const ret = [];

			// TODO not so nice:
			if ( top ) {
				ret.push( 'margin-top:' + top );
			}

			if ( right ) {
				ret.push( 'margin-right:' + right );
			}

			if ( bottom ) {
				ret.push( 'margin-bottom:' + bottom );
			}

			if ( left ) {
				ret.push( 'margin-left:' + left );
			}

			return ret.join( ';' );
		} else {
			return 'margin...';
		}
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
// Styles map is cleared before insertion.
//
// @param {Map.<String, String>} stylesMap Map to insert parsed properties and values.
// @param {String} stylesString Styles to parse.
function parseInlineStyles( stylesMap, stylesString ) {
	// `null` if no quote was found in input string or last found quote was a closing quote. See below.
	let quoteType = null;
	let propertyNameStart = 0;
	let propertyValueStart = 0;
	let propertyName = null;

	stylesMap.clear();

	// Do not set anything if input string is empty.
	if ( stylesString === '' ) {
		return;
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
}
