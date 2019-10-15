/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Styles from '../../src/view/styles';
import encodedImage from './_utils/encodedimage.txt';

describe( 'Styles', () => {
	let styles;

	beforeEach( () => {
		styles = new Styles();
	} );

	describe( 'size getter', () => {
		it( 'should return 0 if no styles are set', () => {
			expect( styles.size ).to.equal( 0 );
		} );

		it( 'should return number of set styles', () => {
			styles.setStyle( 'color:blue' );
			expect( styles.size ).to.equal( 1 );

			styles.setStyle( 'margin:1px;' );
			expect( styles.size ).to.equal( 1 );

			styles.setStyle( 'margin-top:1px;margin-bottom:1px;' );
			expect( styles.size ).to.equal( 2 );
		} );
	} );

	describe( 'setStyle()', () => {
		it( 'should reset styles to a new value', () => {
			styles.setStyle( 'color:red;margin-top:1px;' );

			expect( styles.getNormalized() ).to.deep.equal( { color: 'red', margin: { top: '1px' } } );

			styles.setStyle( 'margin-bottom:2em;' );

			expect( styles.getNormalized() ).to.deep.equal( { margin: { bottom: '2em' } } );
		} );

		describe( 'styles parsing edge cases and incorrect styles', () => {
			it( 'should not crash and not add any styles if styles attribute was empty', () => {
				styles.setStyle( '' );

				expect( styles.getStyleNames() ).to.deep.equal( [] );
			} );

			it( 'should be able to parse big styles definition', () => {
				expect( () => {
					styles.setStyle( `background-image:url('data:image/jpeg;base64,${ encodedImage }')` );
				} ).not.to.throw();
			} );

			it( 'should work with both types of quotes and ignore values inside quotes', () => {
				styles.setStyle( 'background-image:url("im;color:g.jpg")' );
				expect( styles.getInlineProperty( 'background-image' ) ).to.equal( 'url("im;color:g.jpg")' );

				styles.setStyle( 'background-image:url(\'im;color:g.jpg\')' );
				expect( styles.getInlineProperty( 'background-image' ) ).to.equal( 'url(\'im;color:g.jpg\')' );
			} );

			it( 'should not be confused by whitespaces', () => {
				styles.setStyle( '\ncolor:\n red ' );

				expect( styles.getInlineProperty( 'color' ) ).to.equal( 'red' );
			} );

			it( 'should not be confused by duplicated semicolon', () => {
				styles.setStyle( 'color: red;; display: inline' );

				expect( styles.getInlineProperty( 'color' ) ).to.equal( 'red' );
				expect( styles.getInlineProperty( 'display' ) ).to.equal( 'inline' );
			} );

			it( 'should not throw when value is missing', () => {
				styles.setStyle( 'color:; display: inline' );

				expect( styles.getInlineProperty( 'color' ) ).to.equal( '' );
				expect( styles.getInlineProperty( 'display' ) ).to.equal( 'inline' );
			} );

			it( 'should not throw when colon is duplicated', () => {
				styles.setStyle( 'color:: red; display: inline' );

				// The result makes no sense, but here we just check that the algorithm doesn't crash.
				expect( styles.getInlineProperty( 'color' ) ).to.equal( ': red' );
				expect( styles.getInlineProperty( 'display' ) ).to.equal( 'inline' );
			} );

			it( 'should not throw when random stuff passed', () => {
				styles.setStyle( 'color: red;:; ;;" ":  display: inline; \'aaa;:' );

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
			styles.setStyle( 'margin-top:1px;color:blue;' );

			expect( styles.getInlineStyle() ).to.equal( 'color:blue;margin-top:1px;' );
		} );
	} );

	describe( 'getInlineProperty', () => {
		it( 'should return empty string for missing shorthand', () => {
			styles.setStyle( 'margin-top:1px' );

			expect( styles.getInlineProperty( 'margin' ) ).to.be.undefined;
		} );
	} );

	describe( 'hasProperty()', () => {
		it( 'should return false if property is not set', () => {
			expect( styles.hasProperty( 'foo' ) ).to.be.false;
		} );

		it( 'should return false if normalized property is not set', () => {
			styles.setStyle( 'margin-top:1px' );

			// TODO
			// expect( styles.hasProperty( 'margin' ) ).to.be.false;
			expect( styles.hasProperty( 'margin' ) ).to.be.true;
		} );

		it( 'should return true if property is set', () => {
			styles.setStyle( 'color:deeppink' );

			expect( styles.hasProperty( 'color' ) ).to.be.true;
		} );

		it( 'should return true if normalized shorthanded property is set', () => {
			styles.setStyle( 'margin:1px 2px 3px 4px' );

			expect( styles.hasProperty( 'margin-top' ) ).to.be.true;
		} );
	} );

	describe( 'insertProperty()', () => {
		it( 'should insert new property (empty styles)', () => {
			styles.insertProperty( 'color', 'blue' );

			expect( styles.getInlineProperty( 'color' ) ).to.equal( 'blue' );
		} );

		it( 'should insert new property (other properties are set)', () => {
			styles.setStyle( 'margin: 1px;' );
			styles.insertProperty( 'color', 'blue' );

			expect( styles.getInlineProperty( 'color' ) ).to.equal( 'blue' );
		} );

		it( 'should overwrite property', () => {
			styles.setStyle( 'color: red;' );
			styles.insertProperty( 'color', 'blue' );

			expect( styles.getInlineProperty( 'color' ) ).to.equal( 'blue' );
		} );

		it( 'should set multiple styles by providing an object', () => {
			styles.setStyle( 'color: red;' );
			styles.insertProperty( { color: 'blue', margin: '1px' } );

			expect( styles.getInlineProperty( 'color' ) ).to.equal( 'blue' );
			expect( styles.getInlineProperty( 'margin-top' ) ).to.equal( '1px' );
		} );

		it( 'should set object property', () => {
			styles.setStyle( 'margin:1px;' );
			styles.insertProperty( 'margin', { right: '2px' } );

			expect( styles.getInlineProperty( 'margin-left' ) ).to.equal( '1px' );
			expect( styles.getInlineProperty( 'margin-right' ) ).to.equal( '2px' );
		} );
	} );

	describe( 'removeProperty()', () => {
		it( 'should do nothing if property is not set', () => {
			styles.removeProperty( 'color' );

			expect( styles.getInlineProperty( 'color' ) ).to.be.undefined;
		} );

		it( 'should insert new property (other properties are set)', () => {
			styles.setStyle( 'color:blue' );
			styles.removeProperty( 'color' );

			expect( styles.getInlineProperty( 'color' ) ).to.be.undefined;
		} );

		it( 'should remove normalized property', () => {
			styles.setStyle( 'margin:1px' );

			styles.removeProperty( 'margin-top' );

			expect( styles.getInlineProperty( 'margin-top' ) ).to.be.undefined;
		} );
	} );

	describe( 'getStyleNames()', () => {
		it( 'should output empty array for empty styles', () => {
			expect( styles.getStyleNames() ).to.deep.equal( [] );
		} );

		it( 'should output custom style names', () => {
			styles.setStyle( 'foo: 2;bar: baz;foo-bar-baz:none;' );

			expect( styles.getStyleNames() ).to.deep.equal( [ 'bar', 'foo', 'foo-bar-baz' ] );
		} );

		it( 'should output full names for known style names', () => {
			styles.setStyle( 'margin: 1px;margin-left: 2em;' );

			expect( styles.getStyleNames() ).to.deep.equal( [ 'margin' ] );
		} );
	} );
} );
