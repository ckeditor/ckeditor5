/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/styles/utils
 */

export function isColor( string ) {
	return /(^[#0-9A-Fa-f]{3,9}$|rgba?\(|hsla?\(|^currentColor$)/.test( string );
}

export function isLineStyle( string ) {
	return /^(none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset)$/.test( string );
}

export function isLength( string ) {
	return /(^[+-]?[0-9]*[.]?[0-9]+([a-z]+|%)$|0)/.test( string );
}

export function isRepeat( string ) {
	return /^(repeat-x|repeat-y|repeat|space|round|no-repeat)$/.test( string );
}

export function isPosition( string ) {
	return /^(center|top|bottom|left|right)$/.test( string );
}

export function isAttachment( string ) {
	return /^(fixed|scroll|local)$/.test( string );
}

export function isURL( string ) {
	return /^url\(/.test( string );
}

export function getTopRightBottomLeftValues( value = '' ) {
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

export function getTopRightBottomLeftValueReducer( styleShorthand ) {
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

export function getTopRightBottomLeftShorthandValue( { left, right, top, bottom } ) {
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

export function getPositionShorthandNormalizer( longhand ) {
	return ( evt, data ) => {
		data.path = longhand;
		data.value = getTopRightBottomLeftValues( data.value );
	};
}

export function getShorthandValues( string ) {
	return string.replace( /, /g, ',' ).split( ' ' ).map( string => string.replace( /,/g, ', ' ) );
}
