/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { getParts, getTopRightBottomLeftValueReducer, getTopRightBottomLeftValues, isLength, isLineStyle } from './utils';

/**
 * @module engine/view/styles
 */
export default class BorderStyles {
	static attach( stylesConverter ) {
		stylesConverter.on( 'normalize:border', borderNormalizer );

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

		stylesConverter.on( 'extract:border-top', getBorderPositionExtractor( 'top' ) );
		stylesConverter.on( 'extract:border-right', getBorderPositionExtractor( 'right' ) );
		stylesConverter.on( 'extract:border-bottom', getBorderPositionExtractor( 'bottom' ) );
		stylesConverter.on( 'extract:border-left', getBorderPositionExtractor( 'left' ) );

		stylesConverter.on( 'extract:border-top-color', ( evt, data ) => ( data.path = 'border.color.top' ) );
		stylesConverter.on( 'extract:border-right-color', ( evt, data ) => ( data.path = 'border.color.right' ) );
		stylesConverter.on( 'extract:border-bottom-color', ( evt, data ) => ( data.path = 'border.color.bottom' ) );
		stylesConverter.on( 'extract:border-left-color', ( evt, data ) => ( data.path = 'border.color.left' ) );

		stylesConverter.on( 'extract:border-top-width', ( evt, data ) => ( data.path = 'border.width.top' ) );
		stylesConverter.on( 'extract:border-right-width', ( evt, data ) => ( data.path = 'border.width.right' ) );
		stylesConverter.on( 'extract:border-bottom-width', ( evt, data ) => ( data.path = 'border.width.bottom' ) );
		stylesConverter.on( 'extract:border-left-width', ( evt, data ) => ( data.path = 'border.width.left' ) );

		stylesConverter.on( 'extract:border-top-style', ( evt, data ) => ( data.path = 'border.style.top' ) );
		stylesConverter.on( 'extract:border-right-style', ( evt, data ) => ( data.path = 'border.style.right' ) );
		stylesConverter.on( 'extract:border-bottom-style', ( evt, data ) => ( data.path = 'border.style.bottom' ) );
		stylesConverter.on( 'extract:border-left-style', ( evt, data ) => ( data.path = 'border.style.left' ) );

		stylesConverter.on( 'reduce:border-color', getTopRightBottomLeftValueReducer( 'border-color' ) );
		stylesConverter.on( 'reduce:border-style', getTopRightBottomLeftValueReducer( 'border-style' ) );
		stylesConverter.on( 'reduce:border-width', getTopRightBottomLeftValueReducer( 'border-width' ) );
		stylesConverter.on( 'reduce:border-top', getBorderPositionReducer( 'top' ) );
		stylesConverter.on( 'reduce:border-right', getBorderPositionReducer( 'right' ) );
		stylesConverter.on( 'reduce:border-bottom', getBorderPositionReducer( 'bottom' ) );
		stylesConverter.on( 'reduce:border-left', getBorderPositionReducer( 'left' ) );
		stylesConverter.on( 'reduce:border', borderReducer );
	}
}

function borderNormalizer( evt, data ) {
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

function toBorderPropertyShorthand( value, property ) {
	return {
		[ property ]: getTopRightBottomLeftValues( value )
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

function getBorderPositionExtractor( which ) {
	return ( evt, data ) => {
		data.value = extractBorderPosition( data.styles.border, which, data );
	};
}

function extractBorderPosition( border, which ) {
	const value = {};

	if ( border.width && border.width[ which ] ) {
		value.width = border.width[ which ];
	}

	if ( border.style && border.style[ which ] ) {
		value.style = border.style[ which ];
	}

	if ( border.color && border.color[ which ] ) {
		value.color = border.color[ which ];
	}

	return value;
}

function normalizeBorderShorthand( string ) {
	const result = {};

	const parts = getParts( string );

	for ( const part of parts ) {
		if ( isLength( part ) || /thin|medium|thick/.test( part ) ) {
			result.width = part;
		} else if ( isLineStyle( part ) ) {
			result.style = part;
		} else {
			result.color = part;
		}
	}

	return result;
}

function borderReducer( evt, data ) {
	const ret = [];

	ret.push( ...reduceBorderPosition( extractBorderPosition( data.value, 'top' ), 'top' ) );
	ret.push( ...reduceBorderPosition( extractBorderPosition( data.value, 'right' ), 'right' ) );
	ret.push( ...reduceBorderPosition( extractBorderPosition( data.value, 'bottom' ), 'bottom' ) );
	ret.push( ...reduceBorderPosition( extractBorderPosition( data.value, 'left' ), 'left' ) );

	data.reduced = ret;
}

function getBorderPositionReducer( which ) {
	return ( evt, data ) => ( data.reduced = reduceBorderPosition( data.value, which ) );
}

function reduceBorderPosition( value, which ) {
	const reduced = [];

	if ( value && value.width !== undefined ) {
		reduced.push( value.width );
	}

	if ( value && value.style !== undefined ) {
		reduced.push( value.style );
	}

	if ( value && value.color !== undefined ) {
		reduced.push( value.color );
	}

	if ( reduced.length ) {
		return [ [ `border-${ which }`, reduced.join( ' ' ) ] ];
	}

	return [];
}
