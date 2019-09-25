/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import { parseInlineStyles } from '../../src/view/element';

function parseStyle( string ) {
	const map = new Map();

	parseInlineStyles( map, string );

	const styleObject = {};

	for ( const key of map.keys() ) {
		const value = map.get( key );

		if ( key === 'border' ) {
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

			if ( borderPositionRegExp.test( key ) ) {
				const border = {};
				const which = borderPositionRegExp.exec( key )[ 1 ];

				border[ which ] = parseBorderAttribute( value );

				addStyle( styleObject, 'border', border );
			} else {
				addStyle( styleObject, key, value );
			}
		}
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

describe( 'Style normalizer', () => {
	it( 'should parse', () => {
		expect( parseStyle( 'border:1px solid blue;' ) ).to.deep.equal( {
			border: {
				bottom: {
					color: 'blue',
					style: 'solid',
					width: '1px'
				},
				left: {
					color: 'blue',
					style: 'solid',
					width: '1px'
				},
				right: {
					color: 'blue',
					style: 'solid',
					width: '1px'
				},
				top: {
					color: 'blue',
					style: 'solid',
					width: '1px'
				}
			}
		} );
	} );

	it( 'should parse', () => {
		expect( parseStyle( 'border:1px solid blue;border-left:#665511 dashed 2.7em;border-top:7px dotted #ccc;' ) ).to.deep.equal( {
			border: {
				bottom: {
					color: 'blue',
					style: 'solid',
					width: '1px'
				},
				left: {
					color: '#665511',
					style: 'dashed',
					width: '2.7em'
				},
				right: {
					color: 'blue',
					style: 'solid',
					width: '1px'
				},
				top: {
					color: '#ccc',
					style: 'dotted',
					width: '7px'
				}
			}
		} );
	} );
} );
