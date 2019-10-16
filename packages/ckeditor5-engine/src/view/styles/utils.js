/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/styles/utils
 */

const colorRegExp = /^([#0-9A-Fa-f]{3,9}$|rgba?\(|hsla?\(|^currentColor|0)$/;

export function isColor( string ) {
	return colorRegExp.test( string );
}

const lineStyleValues = [ 'none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset' ];

export function isLineStyle( string ) {
	return lineStyleValues.includes( string );
}

const lengthRegExp = /^([+-]?[0-9]*[.]?[0-9]+([a-z]+|%)|0)$/;

export function isLength( string ) {
	return lengthRegExp.test( string );
}

const repeatValues = [ 'repeat-x', 'repeat-y', 'repeat', 'space', 'round', 'no-repeat' ];

export function isRepeat( string ) {
	return repeatValues.includes( string );
}

const positionValues = [ 'center', 'top', 'bottom', 'left', 'right' ];

export function isPosition( string ) {
	return positionValues.includes( string );
}

const attachmentValues = [ 'fixed', 'scroll', 'local' ];

export function isAttachment( string ) {
	return attachmentValues.includes( string );
}

const urlRegExp = /^url\(/;

export function isURL( string ) {
	return urlRegExp.test( string );
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
