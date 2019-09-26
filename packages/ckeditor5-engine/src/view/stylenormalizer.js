/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import { parseInlineStyles } from './element';

function parseBorder( entry, value, styleObject ) {
	if ( entry === 'border' ) {
		const parsedBorder = parseBorderAttribute( value );

		const border = {
			top: parsedBorder,
			right: parsedBorder,
			bottom: parsedBorder,
			left: parsedBorder
		};

		addStyle( styleObject, 'border', border );
	} else {
		const borderPositionRegExp = /border-(top|right|bottom|left)$/;

		if ( borderPositionRegExp.test( entry ) ) {
			const border = {};
			const which = borderPositionRegExp.exec( entry )[ 1 ];

			border[ which ] = parseBorderAttribute( value );

			addStyle( styleObject, 'border', border );
		} else {
			addStyle( styleObject, entry, value );
		}
	}
}

export function parseStyle( string ) {
	const map = new Map();

	parseInlineStyles( map, string );

	const styleObject = {};

	for ( const key of map.keys() ) {
		const value = map.get( key );

		parseBorder( key, value, styleObject );
	}

	return styleObject;
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

export function toInlineStyle( styleName, styleObject ) {
	if ( styleName === 'border' ) {
		const top = toInlineBorder( styleObject.top );
		const right = toInlineBorder( styleObject.right );
		const bottom = toInlineBorder( styleObject.bottom );
		const left = toInlineBorder( styleObject.left );

		if ( top === right && right === bottom && bottom === left ) {
			return 'border:' + top;
		} else {
			return [
				'border-top:' + top,
				'border-right:' + right,
				'border-bottom:' + bottom,
				'border-left:' + left
			].join( ';' );
		}
	}
}

function toInlineBorder( object ) {
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
