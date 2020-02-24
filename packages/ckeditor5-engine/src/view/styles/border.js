/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/styles/border
 */

import { getShorthandValues, getBoxSidesValueReducer, getBoxSidesValues, isLength, isLineStyle } from './utils';

/**
 * Adds a border CSS styles processing rules.
 *
 *		editor.data.addStyleProcessorRules( addBorderRules );
 *
 * This rules merges all [border](https://developer.mozilla.org/en-US/docs/Web/CSS/border) styles notation shorthands:
 *
 * - border
 * - border-top
 * - border-right
 * - border-bottom
 * - border-left
 * - border-color
 * - border-style
 * - border-width
 *
 * and all corresponding longhand forms (like `border-top-color`, `border-top-style`, etc).
 *
 * It does not handle other shorthands (like `border-radius` or `border-image`).
 *
 * The normalized model stores border values as:
 *
 *		const styles = {
 *			border: {
 *				color: { top, right, bottom, left },
 *				style: { top, right, bottom, left },
 *				width: { top, right, bottom, left },
 *			}
 *		};
 *
 * The `border` value is reduced to a 4 values for each box edge (even if they could be further reduces to a single
 * `border:<width> <style> <color>` style.
 *
 * @param {module:engine/view/stylesmap~StylesProcessor} stylesProcessor
 */
export function addBorderRules( stylesProcessor ) {
	stylesProcessor.setNormalizer( 'border', borderNormalizer );

	// Border-position shorthands.
	stylesProcessor.setNormalizer( 'border-top', getBorderPositionNormalizer( 'top' ) );
	stylesProcessor.setNormalizer( 'border-right', getBorderPositionNormalizer( 'right' ) );
	stylesProcessor.setNormalizer( 'border-bottom', getBorderPositionNormalizer( 'bottom' ) );
	stylesProcessor.setNormalizer( 'border-left', getBorderPositionNormalizer( 'left' ) );

	// Border-property shorthands.
	stylesProcessor.setNormalizer( 'border-color', getBorderPropertyNormalizer( 'color' ) );
	stylesProcessor.setNormalizer( 'border-width', getBorderPropertyNormalizer( 'width' ) );
	stylesProcessor.setNormalizer( 'border-style', getBorderPropertyNormalizer( 'style' ) );

	// Border longhands.
	stylesProcessor.setNormalizer( 'border-top-color', getBorderPropertyPositionNormalizer( 'color', 'top' ) );
	stylesProcessor.setNormalizer( 'border-top-style', getBorderPropertyPositionNormalizer( 'style', 'top' ) );
	stylesProcessor.setNormalizer( 'border-top-width', getBorderPropertyPositionNormalizer( 'width', 'top' ) );

	stylesProcessor.setNormalizer( 'border-right-color', getBorderPropertyPositionNormalizer( 'color', 'right' ) );
	stylesProcessor.setNormalizer( 'border-right-style', getBorderPropertyPositionNormalizer( 'style', 'right' ) );
	stylesProcessor.setNormalizer( 'border-right-width', getBorderPropertyPositionNormalizer( 'width', 'right' ) );

	stylesProcessor.setNormalizer( 'border-bottom-color', getBorderPropertyPositionNormalizer( 'color', 'bottom' ) );
	stylesProcessor.setNormalizer( 'border-bottom-style', getBorderPropertyPositionNormalizer( 'style', 'bottom' ) );
	stylesProcessor.setNormalizer( 'border-bottom-width', getBorderPropertyPositionNormalizer( 'width', 'bottom' ) );

	stylesProcessor.setNormalizer( 'border-left-color', getBorderPropertyPositionNormalizer( 'color', 'left' ) );
	stylesProcessor.setNormalizer( 'border-left-style', getBorderPropertyPositionNormalizer( 'style', 'left' ) );
	stylesProcessor.setNormalizer( 'border-left-width', getBorderPropertyPositionNormalizer( 'width', 'left' ) );

	stylesProcessor.setExtractor( 'border-top', getBorderPositionExtractor( 'top' ) );
	stylesProcessor.setExtractor( 'border-right', getBorderPositionExtractor( 'right' ) );
	stylesProcessor.setExtractor( 'border-bottom', getBorderPositionExtractor( 'bottom' ) );
	stylesProcessor.setExtractor( 'border-left', getBorderPositionExtractor( 'left' ) );

	stylesProcessor.setExtractor( 'border-top-color', 'border.color.top' );
	stylesProcessor.setExtractor( 'border-right-color', 'border.color.right' );
	stylesProcessor.setExtractor( 'border-bottom-color', 'border.color.bottom' );
	stylesProcessor.setExtractor( 'border-left-color', 'border.color.left' );

	stylesProcessor.setExtractor( 'border-top-width', 'border.width.top' );
	stylesProcessor.setExtractor( 'border-right-width', 'border.width.right' );
	stylesProcessor.setExtractor( 'border-bottom-width', 'border.width.bottom' );
	stylesProcessor.setExtractor( 'border-left-width', 'border.width.left' );

	stylesProcessor.setExtractor( 'border-top-style', 'border.style.top' );
	stylesProcessor.setExtractor( 'border-right-style', 'border.style.right' );
	stylesProcessor.setExtractor( 'border-bottom-style', 'border.style.bottom' );
	stylesProcessor.setExtractor( 'border-left-style', 'border.style.left' );

	stylesProcessor.setReducer( 'border-color', getBoxSidesValueReducer( 'border-color' ) );
	stylesProcessor.setReducer( 'border-style', getBoxSidesValueReducer( 'border-style' ) );
	stylesProcessor.setReducer( 'border-width', getBoxSidesValueReducer( 'border-width' ) );
	stylesProcessor.setReducer( 'border-top', getBorderPositionReducer( 'top' ) );
	stylesProcessor.setReducer( 'border-right', getBorderPositionReducer( 'right' ) );
	stylesProcessor.setReducer( 'border-bottom', getBorderPositionReducer( 'bottom' ) );
	stylesProcessor.setReducer( 'border-left', getBorderPositionReducer( 'left' ) );
	stylesProcessor.setReducer( 'border', borderReducer );

	stylesProcessor.setStyleRelation( 'border', [
		'border-color', 'border-style', 'border-width',
		'border-top', 'border-right', 'border-bottom', 'border-left',
		'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
		'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style',
		'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width'
	] );

	stylesProcessor.setStyleRelation( 'border-color', [
		'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color'
	] );
	stylesProcessor.setStyleRelation( 'border-style', [
		'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style'
	] );
	stylesProcessor.setStyleRelation( 'border-width', [
		'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width'
	] );

	stylesProcessor.setStyleRelation( 'border-top', [ 'border-top-color', 'border-top-style', 'border-top-width' ] );
	stylesProcessor.setStyleRelation( 'border-right', [ 'border-right-color', 'border-right-style', 'border-right-width' ] );
	stylesProcessor.setStyleRelation( 'border-bottom', [ 'border-bottom-color', 'border-bottom-style', 'border-bottom-width' ] );
	stylesProcessor.setStyleRelation( 'border-left', [ 'border-left-color', 'border-left-style', 'border-left-width' ] );
}

function borderNormalizer( value ) {
	const { color, style, width } = normalizeBorderShorthand( value );

	return {
		path: 'border',
		value: {
			color: getBoxSidesValues( color ),
			style: getBoxSidesValues( style ),
			width: getBoxSidesValues( width )
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

		return {
			path: 'border',
			value: border
		};
	};
}

function getBorderPropertyNormalizer( propertyName ) {
	return value => {
		return {
			path: 'border',
			value: toBorderPropertyShorthand( value, propertyName )
		};
	};
}

function toBorderPropertyShorthand( value, property ) {
	return {
		[ property ]: getBoxSidesValues( value )
	};
}

function getBorderPropertyPositionNormalizer( property, side ) {
	return value => {
		return {
			path: 'border',
			value: {
				[ property ]: {
					[ side ]: value
				}
			}
		};
	};
}

function getBorderPositionExtractor( which ) {
	return ( name, styles ) => {
		if ( styles.border ) {
			return extractBorderPosition( styles.border, which );
		}
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

	const parts = getShorthandValues( string );

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

function borderReducer( value ) {
	const reduced = [];

	reduced.push( ...reduceBorderPosition( extractBorderPosition( value, 'top' ), 'top' ) );
	reduced.push( ...reduceBorderPosition( extractBorderPosition( value, 'right' ), 'right' ) );
	reduced.push( ...reduceBorderPosition( extractBorderPosition( value, 'bottom' ), 'bottom' ) );
	reduced.push( ...reduceBorderPosition( extractBorderPosition( value, 'left' ), 'left' ) );

	return reduced;
}

function getBorderPositionReducer( which ) {
	return value => reduceBorderPosition( value, which );
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
