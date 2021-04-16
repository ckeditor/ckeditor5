/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
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
	stylesProcessor.setReducer( 'border', borderReducer() );

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

// The border reducer.
//
// It tries to produce the most optimal output for the specified styles.
//
// For border style:
//
//      style: {top: "solid", bottom: "solid", right: "solid", left: "solid"}
//
// It will produce: `border-style: top` output.
// For border style and color:
//
//      color: {top: "#ff0", bottom: "#ff0", right: "#ff0", left: "#ff0"}
//      style: {top: "solid", bottom: "solid", right: "solid", left: "solid"}
//
// It will produce: `border-color: #ff0; border-style: solid`
// If all border parameters are specified:
//
//      color: {top: "#ff0", bottom: "#ff0", right: "#ff0", left: "#ff0"}
//      style: {top: "solid", bottom: "solid", right: "solid", left: "solid"}
//      width: {top: "2px", bottom: "2px", right: "2px", left: "2px"}
//
// It will combine everything into the single property: `border: 2px solid #ff0`.
//
// Definitions are merged only if all border selectors have the same values.
//
// @returns {Function}
function borderReducer() {
	return value => {
		const topReducer = reduceBorderPosition( extractBorderPosition( value, 'top' ), 'top' );
		const rightReducer = reduceBorderPosition( extractBorderPosition( value, 'right' ), 'right' );
		const bottomReducer = reduceBorderPosition( extractBorderPosition( value, 'bottom' ), 'bottom' );
		const leftReducer = reduceBorderPosition( extractBorderPosition( value, 'left' ), 'left' );

		if ( shouldMergeAllBordersDefinitions( topReducer, rightReducer, bottomReducer, leftReducer ) ) {
			return [
				// All `border-*` reducers define the same value.
				[ 'border', `${ topReducer[ 0 ][ 1 ] }` ]
			];
		}

		const results = [];
		const borderReducers = [ topReducer, rightReducer, bottomReducer, leftReducer ];

		mergeBorderDefinitions( results, /border-[^-]+-style/, 'border-style', borderReducers );
		mergeBorderDefinitions( results, /border-[^-]+-width/, 'border-width', borderReducers );
		mergeBorderDefinitions( results, /border-[^-]+-color/, 'border-color', borderReducers );

		return [
			...results,
			...topReducer,
			...rightReducer,
			...bottomReducer,
			...leftReducer
		];
	};

	// Checks whether border properties should be merged into the single `border` property.
	//
	// The merge can happen if each `border-*` property returns exactly the same value.
	//
	// @param {Array} topReducer `border-top-*` definitions.
	// @param {Array} rightReducer `border-right-*` definitions.
	// @param {Array} bottomReducer `border-bottom-*` definitions.
	// @param {Array} leftReducer `border-left-*` definitions.
	// @returns {Boolean}
	function shouldMergeAllBordersDefinitions( topReducer, rightReducer, bottomReducer, leftReducer ) {
		return topReducer[ 0 ][ 0 ] === 'border-top' &&
			rightReducer[ 0 ][ 0 ] === 'border-right' &&
			bottomReducer[ 0 ][ 0 ] === 'border-bottom' &&
			leftReducer[ 0 ][ 0 ] === 'border-left' &&
			areEquals( [
				topReducer[ 0 ][ 1 ],
				bottomReducer[ 0 ][ 1 ],
				bottomReducer[ 0 ][ 1 ],
				leftReducer[ 0 ][ 1 ]
			] );
	}

	// Tries to merge the same values definitions for all borders (top, right, bottom, left) into the single one (border-*).
	//
	// The merge is possible if all values for `border-*-(style|color|width)` are identical.
	//
	// After merging, the checked CSS definitions are removed from the initial data.
	//
	// @param {Array} resultsReducers The resulting array where all reducers are being added.
	// @param {RegExp} pattern Definitions returned by reducers must match to this pattern.
	// @param {String} definition The output definition that will be created.
	// @param {Array} reducers All `border-*-(style|color|width` combinations (the initial data).
	function mergeBorderDefinitions( resultsReducers, pattern, definition, reducers ) {
		// The array should contain 4 items that describes the same property (color, width, or style) for each border.
		const patternReducers = [];

		// The initial data contains definitions for all directions (top, right, bottom, left).
		for ( const borderReducers of reducers ) {
			// Find the rule that match to the output `definition`.
			const item = borderReducers.find( item => item[ 0 ].match( pattern ) );

			if ( item ) {
				patternReducers.push( item );
			}
		}

		// Merge can happen only if we have values for all borders...
		if ( patternReducers.length !== 4 ) {
			return;
		}

		// ...and these values must be identical.
		if ( !areEquals( patternReducers.map( item => item[ 1 ] ) ) ) {
			return;
		}

		// Create the new definition...
		resultsReducers.push( [ definition, patternReducers[ 0 ][ 1 ] ] );

		// ...and remove parsed entries from the initial array because they
		// should not be returned to avoid creating improper output.
		patternReducers.forEach( ( item, index ) => {
			reducers[ index ].splice( reducers[ index ].indexOf( item ), 1 );
		} );
	}

	// Returns true if all specified items are identical. Otherwise, returns false.
	//
	// @param {Array.<String>} items
	// @returns {Boolean}
	function areEquals( items ) {
		return new Set( items ).size === 1;
	}
}

function getBorderPositionReducer( which ) {
	return value => reduceBorderPosition( value, which );
}

function reduceBorderPosition( value, which ) {
	const borderToSet = [];

	if ( value && value.width !== undefined ) {
		borderToSet.push( 'width' );
	}

	if ( value && value.style !== undefined ) {
		borderToSet.push( 'style' );
	}

	if ( value && value.color !== undefined ) {
		borderToSet.push( 'color' );
	}

	if ( borderToSet.length === 3 ) {
		return [
			[ `border-${ which }`, borderToSet.map( item => value[ item ] ).join( ' ' ) ]
		];
	}

	const result = [];

	if ( borderToSet.includes( 'width' ) ) {
		result.push( [ `border-${ which }-width`, value.width ] );
	}

	if ( borderToSet.includes( 'style' ) ) {
		result.push( [ `border-${ which }-style`, value.style ] );
	}

	if ( borderToSet.includes( 'color' ) ) {
		result.push( [ `border-${ which }-color`, value.color ] );
	}

	return result;
}
