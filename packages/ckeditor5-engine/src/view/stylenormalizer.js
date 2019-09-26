/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import { parseInlineStyles } from './element';

import { get, has, isObject, unset } from 'lodash-es';

export function getStyleProxy( styleString ) {
	return new StyleProxy( styleString );
}

// <-- FROM VIEW/MODEL
// proxy.setStyle( 'border: 1px solid blue;' )
//
// <-> MODIFY
// proxy.insertRule( 'border-top', '1px solid blue' ); // obj?
// proxy.removeRule( 'border-top' );
// proxy.clear();
//
// --> TO MODEL
// proxy.getModel(); // full
// proxy.getModel( 'border' );
// proxy.getModel( 'border-top' );
//
// --> TO VIEW
// proxy.getInlineStyle();
// proxy.getInlineRule( 'border' );
// proxy.getInlineRule( 'border-top' );
export class StyleProxy {
	constructor( styleString = '' ) {
		this._styles = {};

		this.setStyle( styleString );
	}

	setStyle( styleString = '' ) {
		this._styles = parseStyle( styleString );
	}

	insertRule( nameOrObject, value ) {
		parseRule( nameOrObject, value, this._styles );
	}

	removeRule( name ) {
		unset( this._styles, name.replace( '-', '.' ) );
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

		for ( const key of Object.keys( this._styles ) ) {
			const model = this.getModel( key );

			parsed.push( toInlineStyle( key, model ) );
		}

		return parsed.join( ';' ) + ( parsed.length ? ';' : '' );
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

export function parseStyle( string, styleObject = {} ) {
	const map = new Map();

	parseInlineStyles( map, string );

	for ( const key of map.keys() ) {
		const value = map.get( key );

		parseRule( key, value, styleObject );
	}

	return styleObject;
}

function parseRule( key, value, styleObject ) {
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
		styleObject[ name ] = Object.assign( {}, styleObject[ name ] || {}, value );
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
