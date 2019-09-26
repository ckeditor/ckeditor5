/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import { parseStyle, toInlineStyle } from '../../src/view/stylenormalizer';

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

	it( 'should output', () => {
		const border = {
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
		};

		expect( toInlineStyle( 'border', border ) ).to.equal( 'border:1px solid blue' );
	} );

	it( 'should output', () => {
		const border = {
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
		};

		expect( toInlineStyle( 'border', border ) ).to.equal(
			'border-top:7px dotted #ccc;border-right:1px solid blue;border-bottom:1px solid blue;border-left:2.7em dashed #665511'
		);
	} );
} );
