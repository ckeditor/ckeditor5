/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	getListTypeFromListStyleType,
	getTypeAttributeFromListStyleType,
	getListStyleTypeFromTypeAttribute,
	normalizeListStyle
} from '../../../src/listproperties/utils/style.js';

describe( 'ListProperties - utils - style', () => {
	describe( 'getListTypeFromListStyleType()', () => {
		const testData = [
			[ 'decimal', 'numbered' ],
			[ 'decimal-leading-zero', 'numbered' ],
			[ 'lower-roman', 'numbered' ],
			[ 'upper-roman', 'numbered' ],
			[ 'lower-latin', 'numbered' ],
			[ 'upper-latin', 'numbered' ],
			[ 'disc', 'bulleted' ],
			[ 'circle', 'bulleted' ],
			[ 'square', 'bulleted' ],
			[ 'default', null ],
			[ 'style-type-that-is-not-possibly-supported-by-css', null ]
		];

		for ( const [ style, type ] of testData ) {
			it( `shoud return "${ type }" for "${ style }" style`, () => {
				expect( getListTypeFromListStyleType( style ) ).to.equal( type );
			} );
		}
	} );

	describe( 'converting between `style:list-style-type` and `type`', () => {
		const testData = [
			[ 'decimal', '1' ],
			[ 'lower-roman', 'i' ],
			[ 'upper-roman', 'I' ],
			[ 'lower-alpha', 'a' ],
			[ 'upper-alpha', 'A' ],
			[ 'lower-latin', 'a' ],
			[ 'upper-latin', 'A' ]
		];

		describe( 'getTypeAttributeFromListStyleType()', () => {
			for ( const [ styleType, typeAttribute ] of testData ) {
				it( `should return "${ typeAttribute }" for "${ styleType }" style`, () => {
					expect( getTypeAttributeFromListStyleType( styleType ) ).to.equal( typeAttribute );
				} );
			}

			it( 'should return null for "default" style', () => {
				expect( getTypeAttributeFromListStyleType( 'default' ) ).to.be.null;
			} );

			it( 'should return null for unknown style', () => {
				expect( getTypeAttributeFromListStyleType( 'strange-style' ) ).to.be.null;
			} );
		} );

		describe( 'getListStyleTypeFromTypeAttribute()', () => {
			for ( const [ styleType, typeAttribute ] of testData.filter( ( [ style ] ) => !style.endsWith( '-alpha' ) ) ) {
				it( `should return "${ typeAttribute }" for "${ styleType }" attribute value`, () => {
					expect( getListStyleTypeFromTypeAttribute( typeAttribute ) ).to.equal( styleType );
				} );
			}

			it( 'should return null for unknown attribute value', () => {
				expect( getListStyleTypeFromTypeAttribute( 'Q' ) ).to.be.null;
			} );
		} );
	} );

	describe( 'normalizeListStyle()', () => {
		const testData = [
			[ 'lower-alpha', 'lower-latin' ],
			[ 'upper-alpha', 'upper-latin' ],
			[ 'disc', 'disc' ],
			[ 'circle', 'circle' ],
			[ 'square', 'square' ],
			[ 'decimal', 'decimal' ],
			[ 'lower-roman', 'lower-roman' ],
			[ 'upper-roman', 'upper-roman' ],
			[ 'lower-latin', 'lower-latin' ],
			[ 'upper-latin', 'upper-latin' ]
		];

		for ( const [ input, expected ] of testData ) {
			it( `should convert "${ input }" to "${ expected }"`, () => {
				expect( normalizeListStyle( input ) ).to.equal( expected );
			} );
		}
	} );
} );
