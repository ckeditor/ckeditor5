/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import StylesMap, { StylesProcessor } from '../../src/view/stylesmap';
import encodedImage from './_utils/encodedimage.txt';
import { addMarginRules } from '../../src/view/styles/margin';
import { getBoxSidesValueReducer } from '../../src/view/styles/utils';

describe( 'StylesMap', () => {
	let stylesMap;

	beforeEach( () => {
		const stylesProcessor = new StylesProcessor();

		// Define simple "foo" shorthand normalizers, similar to the "margin" shorthand normalizers, for testing purposes.
		stylesProcessor.setNormalizer( 'foo', value => ( {
			path: 'foo',
			value: { top: value, right: value, bottom: value, left: value }
		} ) );
		stylesProcessor.setNormalizer( 'foo-top', value => ( {
			path: 'foo.top',
			value
		} ) );
		stylesProcessor.setReducer( 'foo', getBoxSidesValueReducer( 'foo' ) );

		addMarginRules( stylesProcessor );
		stylesMap = new StylesMap( stylesProcessor );
	} );

	describe( 'size getter', () => {
		it( 'should return 0 if no styles are set', () => {
			expect( stylesMap.size ).to.equal( 0 );
		} );

		it( 'should return number of set styles', () => {
			stylesMap.setTo( 'color:blue' );
			expect( stylesMap.size ).to.equal( 1 );

			stylesMap.setTo( 'margin:1px;' );
			expect( stylesMap.size ).to.equal( 1 );

			stylesMap.setTo( 'margin-top:1px;margin-bottom:1px;' );
			expect( stylesMap.size ).to.equal( 2 );
		} );
	} );

	describe( 'setTo()', () => {
		it( 'should reset styles to a new value', () => {
			stylesMap.setTo( 'color:red;padding:1px;' );

			expect( stylesMap.getNormalized() ).to.deep.equal( { color: 'red', padding: '1px' } );

			stylesMap.setTo( 'overflow:hidden;' );

			expect( stylesMap.getNormalized() ).to.deep.equal( { overflow: 'hidden' } );
		} );

		describe( 'styles parsing edge cases and incorrect styles', () => {
			it( 'should not crash and not add any styles if styles attribute was empty', () => {
				stylesMap.setTo( '' );

				expect( stylesMap.getStyleNames() ).to.deep.equal( [] );
			} );

			it( 'should be able to parse big styles definition', () => {
				expect( () => {
					stylesMap.setTo( `background-image:url('data:image/jpeg;base64,${ encodedImage }')` );
				} ).not.to.throw();
			} );

			it( 'should work with both types of quotes and ignore values inside quotes', () => {
				stylesMap.setTo( 'background-image:url("im;color:g.jpg")' );
				expect( stylesMap.getAsString( 'background-image' ) ).to.equal( 'url("im;color:g.jpg")' );

				stylesMap.setTo( 'background-image:url(\'im;color:g.jpg\')' );
				expect( stylesMap.getAsString( 'background-image' ) ).to.equal( 'url(\'im;color:g.jpg\')' );
			} );

			it( 'should not be confused by whitespaces', () => {
				stylesMap.setTo( '\ncolor:\n red ' );

				expect( stylesMap.getAsString( 'color' ) ).to.equal( 'red' );
			} );

			it( 'should not be confused by duplicated semicolon', () => {
				stylesMap.setTo( 'color: red;; display: inline' );

				expect( stylesMap.getAsString( 'color' ) ).to.equal( 'red' );
				expect( stylesMap.getAsString( 'display' ) ).to.equal( 'inline' );
			} );

			it( 'should not throw when value is missing', () => {
				stylesMap.setTo( 'color:; display: inline' );

				expect( stylesMap.getAsString( 'color' ) ).to.equal( '' );
				expect( stylesMap.getAsString( 'display' ) ).to.equal( 'inline' );
			} );

			it( 'should not throw when colon is duplicated', () => {
				stylesMap.setTo( 'color:: red; display: inline' );

				// The result makes no sense, but here we just check that the algorithm doesn't crash.
				expect( stylesMap.getAsString( 'color' ) ).to.equal( ': red' );
				expect( stylesMap.getAsString( 'display' ) ).to.equal( 'inline' );
			} );

			it( 'should not throw when random stuff passed', () => {
				stylesMap.setTo( 'color: red;:; ;;" ":  display: inline; \'aaa;:' );

				// The result makes no sense, but here we just check that the algorithm doesn't crash.
				expect( stylesMap.getAsString( 'color' ) ).to.equal( 'red' );
				expect( stylesMap.getAsString( 'display' ) ).to.be.undefined;
			} );
		} );
	} );

	describe( 'toString()', () => {
		it( 'should return empty string for empty styles', () => {
			expect( stylesMap.toString() ).to.equal( '' );
		} );

		it( 'should return sorted styles string if styles are set', () => {
			stylesMap.setTo( 'margin-top:1px;color:blue;' );

			expect( stylesMap.toString() ).to.equal( 'color:blue;margin-top:1px;' );
		} );
	} );

	describe( 'getAsString()', () => {
		it( 'should return empty string for missing shorthand', () => {
			stylesMap.setTo( 'margin-top:1px' );

			expect( stylesMap.getAsString( 'margin' ) ).to.be.undefined;
		} );
	} );

	describe( 'has()', () => {
		it( 'should return false if property is not set', () => {
			expect( stylesMap.has( 'bar' ) ).to.be.false;
		} );

		it( 'should return false if normalized longhand property is not set', () => {
			stylesMap.setTo( 'foo-top:1px' );

			expect( stylesMap.has( 'foo' ) ).to.be.false;
		} );

		it( 'should return true if normalized longhand property is set', () => {
			stylesMap.setTo( 'foo-top:1px' );

			expect( stylesMap.has( 'foo-top' ) ).to.be.true;
		} );

		it( 'should return true if non-normalized property is set', () => {
			stylesMap.setTo( 'bar:deeppink' );

			expect( stylesMap.has( 'bar' ) ).to.be.true;
		} );

		it( 'should return true if normalized shorthanded property is set', () => {
			stylesMap.setTo( 'foo:1px' );

			expect( stylesMap.has( 'foo' ) ).to.be.true;
		} );

		it( 'should return true if normalized long-hand property is set', () => {
			stylesMap.setTo( 'foo:1px' );

			expect( stylesMap.has( 'foo-top' ) ).to.be.true;
		} );
	} );

	describe( 'set()', () => {
		it( 'should insert new property (empty styles)', () => {
			stylesMap.set( 'color', 'blue' );

			expect( stylesMap.getAsString( 'color' ) ).to.equal( 'blue' );
		} );

		it( 'should insert new property (other properties are set)', () => {
			stylesMap.setTo( 'margin: 1px;' );
			stylesMap.set( 'color', 'blue' );

			expect( stylesMap.getAsString( 'color' ) ).to.equal( 'blue' );
		} );

		it( 'should overwrite property', () => {
			stylesMap.setTo( 'color: red;' );
			stylesMap.set( 'color', 'blue' );

			expect( stylesMap.getAsString( 'color' ) ).to.equal( 'blue' );
		} );

		it( 'should set multiple styles by providing an object', () => {
			stylesMap.setTo( 'color: red;' );
			stylesMap.set( { color: 'blue', foo: '1px' } );

			expect( stylesMap.getAsString( 'color' ) ).to.equal( 'blue' );
			expect( stylesMap.getAsString( 'foo-top' ) ).to.equal( '1px' );
		} );

		it( 'should set object property', () => {
			stylesMap.setTo( 'foo:1px;' );
			stylesMap.set( 'foo', { right: '2px' } );

			expect( stylesMap.getAsString( 'foo-left' ) ).to.equal( '1px' );
			expect( stylesMap.getAsString( 'foo-right' ) ).to.equal( '2px' );
		} );
	} );

	describe( 'remove()', () => {
		it( 'should do nothing if property is not set', () => {
			stylesMap.remove( 'color' );

			expect( stylesMap.getAsString( 'color' ) ).to.be.undefined;
		} );

		it( 'should insert new property (other properties are set)', () => {
			stylesMap.setTo( 'color:blue' );
			stylesMap.remove( 'color' );

			expect( stylesMap.getAsString( 'color' ) ).to.be.undefined;
		} );

		it( 'should remove normalized property', () => {
			stylesMap.setTo( 'margin:1px' );

			stylesMap.remove( 'margin-top' );

			expect( stylesMap.getAsString( 'margin-top' ) ).to.be.undefined;
		} );

		it( 'should remove normalized properties one by one', () => {
			stylesMap.setTo( 'margin:1px' );

			stylesMap.remove( 'margin-top' );
			stylesMap.remove( 'margin-right' );
			stylesMap.remove( 'margin-bottom' );
			stylesMap.remove( 'margin-left' );

			expect( stylesMap.toString() ).to.equal( '' );
		} );

		it( 'should remove path-like property', () => {
			stylesMap.setTo( 'text-align:left' );

			expect( stylesMap.toString() ).to.equal( 'text-align:left;' );

			stylesMap.remove( 'text-align' );

			expect( stylesMap.toString() ).to.equal( '' );
		} );
	} );

	describe( 'getStyleNames()', () => {
		it( 'should output empty array for empty styles', () => {
			expect( stylesMap.getStyleNames() ).to.deep.equal( [] );
		} );

		it( 'should output custom style names', () => {
			stylesMap.setTo( 'foo: 2;bar: baz;foo-bar-baz:none;' );

			expect( stylesMap.getStyleNames() ).to.deep.equal( [ 'foo', 'bar', 'foo-bar-baz' ] );
		} );

		it( 'should output full names for known style names', () => {
			stylesMap.setTo( 'foo: 1px;foo-top: 2em;' );

			expect( stylesMap.getStyleNames() ).to.deep.equal( [ 'foo' ] );
		} );
	} );
} );
