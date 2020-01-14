/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import StylesMap, { StylesProcessor } from '../../src/view/stylesmap';
import encodedImage from './_utils/encodedimage.txt';
import { addPaddingStylesProcessor } from '../../src/view/styles/paddingstyles';

describe( 'StylesMap', () => {
	let styles, converter;

	beforeEach( () => {
		converter = new StylesProcessor();

		// Define simple "foo" shorthand normalizers, similar to the "margin" shorthand normalizers, for testing purposes.
		converter.setNormalizer( 'foo', value => ( {
			path: 'foo',
			value: { top: value, right: value, bottom: value, left: value }
		} ) );
		converter.setNormalizer( 'foo-top', value => ( {
			path: 'foo',
			value: { top: value }
		} ) );

		addPaddingStylesProcessor( converter );
		styles = new StylesMap( converter );
	} );

	describe( 'size getter', () => {
		it( 'should return 0 if no styles are set', () => {
			expect( styles.size ).to.equal( 0 );
		} );

		it( 'should return number of set styles', () => {
			styles.setTo( 'color:blue' );
			expect( styles.size ).to.equal( 1 );

			styles.setTo( 'margin:1px;' );
			expect( styles.size ).to.equal( 1 );

			styles.setTo( 'margin-top:1px;margin-bottom:1px;' );
			expect( styles.size ).to.equal( 2 );
		} );
	} );

	describe( 'setTo()', () => {
		it( 'should reset styles to a new value', () => {
			styles.setTo( 'color:red;margin:1px;' );

			expect( styles.getNormalized() ).to.deep.equal( { color: 'red', margin: '1px' } );

			styles.setTo( 'overflow:hidden;' );

			expect( styles.getNormalized() ).to.deep.equal( { overflow: 'hidden' } );
		} );

		describe( 'styles parsing edge cases and incorrect styles', () => {
			it( 'should not crash and not add any styles if styles attribute was empty', () => {
				styles.setTo( '' );

				expect( styles.getStyleNames() ).to.deep.equal( [] );
			} );

			it( 'should be able to parse big styles definition', () => {
				expect( () => {
					styles.setTo( `background-image:url('data:image/jpeg;base64,${ encodedImage }')` );
				} ).not.to.throw();
			} );

			it( 'should work with both types of quotes and ignore values inside quotes', () => {
				styles.setTo( 'background-image:url("im;color:g.jpg")' );
				expect( styles.getInlineProperty( 'background-image' ) ).to.equal( 'url("im;color:g.jpg")' );

				styles.setTo( 'background-image:url(\'im;color:g.jpg\')' );
				expect( styles.getInlineProperty( 'background-image' ) ).to.equal( 'url(\'im;color:g.jpg\')' );
			} );

			it( 'should not be confused by whitespaces', () => {
				styles.setTo( '\ncolor:\n red ' );

				expect( styles.getInlineProperty( 'color' ) ).to.equal( 'red' );
			} );

			it( 'should not be confused by duplicated semicolon', () => {
				styles.setTo( 'color: red;; display: inline' );

				expect( styles.getInlineProperty( 'color' ) ).to.equal( 'red' );
				expect( styles.getInlineProperty( 'display' ) ).to.equal( 'inline' );
			} );

			it( 'should not throw when value is missing', () => {
				styles.setTo( 'color:; display: inline' );

				expect( styles.getInlineProperty( 'color' ) ).to.equal( '' );
				expect( styles.getInlineProperty( 'display' ) ).to.equal( 'inline' );
			} );

			it( 'should not throw when colon is duplicated', () => {
				styles.setTo( 'color:: red; display: inline' );

				// The result makes no sense, but here we just check that the algorithm doesn't crash.
				expect( styles.getInlineProperty( 'color' ) ).to.equal( ': red' );
				expect( styles.getInlineProperty( 'display' ) ).to.equal( 'inline' );
			} );

			it( 'should not throw when random stuff passed', () => {
				styles.setTo( 'color: red;:; ;;" ":  display: inline; \'aaa;:' );

				// The result makes no sense, but here we just check that the algorithm doesn't crash.
				expect( styles.getInlineProperty( 'color' ) ).to.equal( 'red' );
				expect( styles.getInlineProperty( 'display' ) ).to.be.undefined;
			} );
		} );
	} );

	describe( 'getInlineStyle()', () => {
		it( 'should return undefined for empty styles', () => {
			expect( styles.getInlineStyle() ).to.be.undefined;
		} );

		it( 'should return sorted styles string if styles are set', () => {
			styles.setTo( 'margin-top:1px;color:blue;' );

			expect( styles.getInlineStyle() ).to.equal( 'color:blue;margin-top:1px;' );
		} );
	} );

	describe( 'getInlineProperty', () => {
		it( 'should return empty string for missing shorthand', () => {
			styles.setTo( 'margin-top:1px' );

			expect( styles.getInlineProperty( 'margin' ) ).to.be.undefined;
		} );
	} );

	describe( 'hasProperty()', () => {
		it( 'should return false if normalized property is not set', () => {
			expect( styles.hasProperty( 'bar' ) ).to.be.false;
		} );

		it( 'should return false if normalized property is not set', () => {
			expect( styles.hasProperty( 'foo' ) ).to.be.false;
		} );

		it( 'should return false if normalized property is not set', () => {
			styles.setTo( 'foo-top:1px' );

			expect( styles.hasProperty( 'foo' ) ).to.be.true;
		} );

		it( 'should return true if property is set', () => {
			styles.setTo( 'bar:deeppink' );

			expect( styles.hasProperty( 'bar' ) ).to.be.true;
		} );

		it( 'should return true if normalized shorthanded property is set', () => {
			styles.setTo( 'foo:1px' );

			expect( styles.hasProperty( 'foo' ) ).to.be.true;
			expect( styles.hasProperty( 'foo-top' ) ).to.be.true;
		} );
	} );

	describe( 'insertProperty()', () => {
		it( 'should insert new property (empty styles)', () => {
			styles.insertProperty( 'color', 'blue' );

			expect( styles.getInlineProperty( 'color' ) ).to.equal( 'blue' );
		} );

		it( 'should insert new property (other properties are set)', () => {
			styles.setTo( 'margin: 1px;' );
			styles.insertProperty( 'color', 'blue' );

			expect( styles.getInlineProperty( 'color' ) ).to.equal( 'blue' );
		} );

		it( 'should overwrite property', () => {
			styles.setTo( 'color: red;' );
			styles.insertProperty( 'color', 'blue' );

			expect( styles.getInlineProperty( 'color' ) ).to.equal( 'blue' );
		} );

		it( 'should set multiple styles by providing an object', () => {
			styles.setTo( 'color: red;' );
			styles.insertProperty( { color: 'blue', foo: '1px' } );

			expect( styles.getInlineProperty( 'color' ) ).to.equal( 'blue' );
			expect( styles.getInlineProperty( 'foo-top' ) ).to.equal( '1px' );
		} );

		it( 'should set object property', () => {
			styles.setTo( 'foo:1px;' );
			styles.insertProperty( 'foo', { right: '2px' } );

			expect( styles.getInlineProperty( 'foo-left' ) ).to.equal( '1px' );
			expect( styles.getInlineProperty( 'foo-right' ) ).to.equal( '2px' );
		} );
	} );

	describe( 'removeProperty()', () => {
		it( 'should do nothing if property is not set', () => {
			styles.removeProperty( 'color' );

			expect( styles.getInlineProperty( 'color' ) ).to.be.undefined;
		} );

		it( 'should insert new property (other properties are set)', () => {
			styles.setTo( 'color:blue' );
			styles.removeProperty( 'color' );

			expect( styles.getInlineProperty( 'color' ) ).to.be.undefined;
		} );

		it( 'should remove normalized property', () => {
			styles.setTo( 'margin:1px' );

			styles.removeProperty( 'margin-top' );

			expect( styles.getInlineProperty( 'margin-top' ) ).to.be.undefined;
		} );
	} );

	describe( 'getStyleNames()', () => {
		it( 'should output empty array for empty styles', () => {
			expect( styles.getStyleNames() ).to.deep.equal( [] );
		} );

		it( 'should output custom style names', () => {
			styles.setTo( 'foo: 2;bar: baz;foo-bar-baz:none;' );

			expect( styles.getStyleNames() ).to.deep.equal( [ 'foo', 'bar', 'foo-bar-baz' ] );
		} );

		it( 'should output full names for known style names', () => {
			styles.setTo( 'foo: 1px;foo-top: 2em;' );

			expect( styles.getStyleNames() ).to.deep.equal( [ 'foo' ] );
		} );
	} );
} );
