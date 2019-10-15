/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { getTopRightBottomLeftValues, getTopRightBottomLeftValueReducer, isColor, isLength, isLineStyle } from './utils';

/**
 * @module engine/view/styles
 */
export default class BorderStyles {
	static attach( stylesConverter ) {
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

		stylesConverter.on( 'extract:border-top', borderPositionExtractor( 'top' ) );
		stylesConverter.on( 'extract:border-right', borderPositionExtractor( 'right' ) );
		stylesConverter.on( 'extract:border-bottom', borderPositionExtractor( 'bottom' ) );
		stylesConverter.on( 'extract:border-left', borderPositionExtractor( 'left' ) );

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
		stylesConverter.on( 'reduce:border-top',
			( evt, data ) => ( data.reduced = getBorderPositionReducer( 'top' )( data.value ) ) );
		stylesConverter.on( 'reduce:border-right',
			( evt, data ) => ( data.reduced = getBorderPositionReducer( 'right' )( data.value ) ) );
		stylesConverter.on( 'reduce:border-bottom',
			( evt, data ) => ( data.reduced = getBorderPositionReducer( 'bottom' )( data.value ) ) );
		stylesConverter.on( 'reduce:border-left',
			( evt, data ) => ( data.reduced = getBorderPositionReducer( 'left' )( data.value ) ) );
		stylesConverter.on( 'reduce:border', getBorderReducer );
	}
}

function toBorderPropertyShorthand( value, property ) {
	return {
		[ property ]: getTopRightBottomLeftValues( value )
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
	return ( evt, data ) => {
		const border = data.styles.border;

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

		data.value = value.join( ' ' );
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

function getBorderReducer( evt, data ) {
	const ret = [];

	ret.push( ...getBorderPositionReducer( 'top' )( data.value ) );
	ret.push( ...getBorderPositionReducer( 'right' )( data.value ) );
	ret.push( ...getBorderPositionReducer( 'bottom' )( data.value ) );
	ret.push( ...getBorderPositionReducer( 'left' )( data.value ) );

	data.reduced = ret;
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
