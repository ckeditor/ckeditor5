/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import StylesMap, { StylesProcessor } from '../../src/view/stylesmap.js';
import encodedImage from './_utils/encodedimage.txt';
import { addMarginRules } from '../../src/view/styles/margin.js';
import { addBorderRules } from '../../src/view/styles/border.js';
import { getBoxSidesValueReducer } from '../../src/view/styles/utils.js';

describe( 'StylesMap', () => {
	let stylesMap, stylesProcessor;

	beforeEach( () => {
		stylesProcessor = new StylesProcessor();

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

		it( 'should output full names for known style names - expand = true', () => {
			stylesMap.setTo( 'margin: 1px' );

			expect( stylesMap.getStyleNames( true ) ).to.deep.equal( [
				'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left'
			] );

			stylesMap.setTo( 'margin-top: 1px' );

			expect( stylesMap.getStyleNames( true ) ).to.deep.equal( [ 'margin', 'margin-top' ] );
		} );

		it( 'should output full names for known style names - expand = true - other extractors must not affect the output', () => {
			// Let's add this line to ensure that only matching extractors are used to expand style names.
			addBorderRules( stylesProcessor );

			stylesMap.setTo( 'margin: 1px' );

			expect( stylesMap.getStyleNames( true ) ).to.deep.equal( [
				'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left'
			] );

			stylesMap.setTo( 'margin-top: 1px' );

			expect( stylesMap.getStyleNames( true ) ).to.deep.equal( [ 'margin', 'margin-top' ] );
		} );
	} );

	describe( 'keys()', () => {
		it( 'should output empty array for empty styles', () => {
			expect( stylesMap.keys() ).to.deep.equal( [] );
		} );

		it( 'should output custom style names', () => {
			stylesMap.setTo( 'foo: 2;bar: baz;foo-bar-baz:none;' );

			expect( stylesMap.keys() ).to.deep.equal( [ 'foo', 'bar', 'foo-bar-baz' ] );
		} );

		it( 'should output full names for known style names', () => {
			stylesMap.setTo( 'foo: 1px;foo-top: 2em;' );

			expect( stylesMap.keys() ).to.deep.equal( [ 'foo' ] );
		} );

		it( 'should not output full names for known style names', () => {
			stylesMap.setTo( 'margin: 1px' );

			expect( stylesMap.keys() ).to.deep.equal( [ 'margin' ] );

			stylesMap.setTo( 'margin-top: 1px' );

			expect( stylesMap.keys() ).to.deep.equal( [ 'margin-top' ] );
		} );
	} );

	describe( 'isSimilar()', () => {
		let otherStylesMap;

		beforeEach( () => {
			otherStylesMap = new StylesMap( stylesProcessor );
		} );

		it( 'should return false if count of properties differs', () => {
			stylesMap.setTo( 'color: red;' );
			otherStylesMap.setTo( 'color: red; margin: 3px;' );

			expect( stylesMap.isSimilar( otherStylesMap ) ).to.be.false;
		} );

		it( 'should return false if some property is not available', () => {
			stylesMap.setTo( 'color: red; background: blue;' );
			otherStylesMap.setTo( 'color: red; border: 10px;' );

			expect( stylesMap.isSimilar( otherStylesMap ) ).to.be.false;
		} );

		it( 'should return true if styles match exactly', () => {
			stylesMap.setTo( 'color: red; foo: 2px;' );
			otherStylesMap.setTo( 'color: red; foo: 2px;' );

			expect( stylesMap.isSimilar( otherStylesMap ) ).to.be.true;
		} );

		it( 'should return true if styles match but are defined in a different order', () => {
			stylesMap.setTo( 'color: red; foo: 2px;' );
			otherStylesMap.setTo( 'foo: 2px; color: red;' );

			expect( stylesMap.isSimilar( otherStylesMap ) ).to.be.true;
		} );

		it( 'should return true if styles match but are defined in a different notation', () => {
			stylesMap.setTo( 'color: red; margin: 2px;' );
			otherStylesMap.setTo( 'color: red; margin-top: 2px; margin-right: 2px; margin-bottom: 2px; margin-left: 2px;' );

			expect( stylesMap.isSimilar( otherStylesMap ) ).to.be.true;
		} );
	} );

	describe( '_clone()', () => {
		it( 'should create a new instance of StylesMap', () => {
			const newStylesMap = stylesMap._clone();

			expect( newStylesMap ).to.deep.equal( stylesMap );
			expect( newStylesMap ).to.not.equal( stylesMap );
			expect( newStylesMap.isEmpty ).to.be.true;
		} );

		it( 'should have same styles', () => {
			stylesMap.setTo( 'color: red; margin-top: 2px; margin-right: 2px; margin-bottom: 2px; margin-left: 2px;' );

			const newStylesMap = stylesMap._clone();

			expect( newStylesMap ).to.deep.equal( stylesMap );
			expect( newStylesMap ).to.not.equal( stylesMap );
			expect( newStylesMap.getAsString( 'color' ) ).to.equal( 'red' );
			expect( newStylesMap.getAsString( 'margin' ) ).to.equal( '2px' );
			expect( newStylesMap.getAsString( 'margin-left' ) ).to.equal( '2px' );
		} );
	} );

	describe( '_getTokensMatch()', () => {
		beforeEach( () => {
			stylesMap.setTo( 'color: red; margin-top: 2px; margin-right: 2px; margin-bottom: 2px; margin-left: 2px;' );
		} );

		it( 'should return undefined if no tokens match', () => {
			expect( stylesMap._getTokensMatch( 'border', true ) ).to.be.undefined;
		} );

		it( 'should match patternToken=true, patternValue=true', () => {
			expect( stylesMap._getTokensMatch( true, true ) ).to.deep.equal( [
				'margin',
				'margin-top',
				'margin-right',
				'margin-bottom',
				'margin-left',
				'color'
			] );
		} );

		it( 'should match patternToken=string, patternValue=true', () => {
			expect( stylesMap._getTokensMatch( 'margin', true ) ).to.deep.equal( [
				'margin'
			] );
		} );

		it( 'should match patternToken=regexp, patternValue=true', () => {
			expect( stylesMap._getTokensMatch( /^margin/, true ) ).to.deep.equal( [
				'margin',
				'margin-top',
				'margin-right',
				'margin-bottom',
				'margin-left'
			] );
		} );

		it( 'should match patternToken=string, patternValue=string', () => {
			expect( stylesMap._getTokensMatch( 'margin', '2px' ) ).to.deep.equal( [
				'margin'
			] );
		} );

		it( 'should not match patternToken=string, patternValue=string', () => {
			expect( stylesMap._getTokensMatch( 'margin', '20px' ) ).to.be.undefined;
		} );

		it( 'should match patternToken=string, patternValue=regexp', () => {
			expect( stylesMap._getTokensMatch( 'margin', /px$/ ) ).to.deep.equal( [
				'margin'
			] );
		} );

		it( 'should not match patternToken=string, patternValue=regexp', () => {
			expect( stylesMap._getTokensMatch( 'margin', /cm$/ ) ).to.be.undefined;
		} );
	} );

	describe( '_getConsumables()', () => {
		beforeEach( () => {
			stylesMap.setTo( 'color: red; margin-top: 2px; margin-right: 2px; margin-bottom: 2px; margin-left: 2px;' );
		} );

		it( 'should return all consumable tokens including related notations', () => {
			expect( stylesMap._getConsumables() ).to.deep.equal( [
				'color',
				'margin-top',
				'margin-right',
				'margin-bottom',
				'margin-left',
				'margin'
			] );
		} );

		it( 'should return all consumable tokens for a specified style (short notation)', () => {
			expect( stylesMap._getConsumables( 'margin' ) ).to.deep.equal( [
				'margin',
				'margin-top',
				'margin-right',
				'margin-bottom',
				'margin-left'
			] );
		} );

		it( 'should return all consumable tokens for a specified style (long notation)', () => {
			expect( stylesMap._getConsumables( 'margin-right' ) ).to.deep.equal( [
				'margin-right',
				'margin'
			] );
		} );
	} );

	describe( '_canMergeFrom()', () => {
		let otherStylesMap;

		beforeEach( () => {
			otherStylesMap = new StylesMap( stylesProcessor );
		} );

		it( 'should return true for empty styles', () => {
			expect( stylesMap._canMergeFrom( otherStylesMap ) ).to.be.true;
		} );

		it( 'should return true when styles not intersect (different styles)', () => {
			stylesMap.setTo( 'color: red;' );
			otherStylesMap.setTo( 'margin-top: 2px; margin-right: 2px; margin-bottom: 2px;' );

			expect( stylesMap._canMergeFrom( otherStylesMap ) ).to.be.true;
		} );

		it( 'should return true when styles not intersect (different box sides)', () => {
			stylesMap.setTo( 'margin-left: 10px;' );
			otherStylesMap.setTo( 'margin-top: 10px;' );

			expect( stylesMap._canMergeFrom( otherStylesMap ) ).to.be.true;
		} );

		it( 'should return true when styles intersect (same value)', () => {
			stylesMap.setTo( 'margin: 10px;' );
			otherStylesMap.setTo( 'margin-top: 10px;' );

			expect( stylesMap._canMergeFrom( otherStylesMap ) ).to.be.true;
		} );

		it( 'should return false when styles intersect (different value)', () => {
			stylesMap.setTo( 'margin: 10px;' );
			otherStylesMap.setTo( 'margin-top: 5px;' );

			expect( stylesMap._canMergeFrom( otherStylesMap ) ).to.be.false;
		} );

		it( 'should return false when styles intersect (same token, different value)', () => {
			stylesMap.setTo( 'color: red;' );
			otherStylesMap.setTo( 'color: blue;' );

			expect( stylesMap._canMergeFrom( otherStylesMap ) ).to.be.false;
		} );
	} );

	describe( '_mergeFrom()', () => {
		let otherStylesMap;

		beforeEach( () => {
			otherStylesMap = new StylesMap( stylesProcessor );
		} );

		it( 'should merge when styles not intersect (different styles)', () => {
			stylesMap.setTo( 'color: red;' );
			otherStylesMap.setTo( 'margin-top: 2px; margin-right: 2px; margin-bottom: 2px;' );

			stylesMap._mergeFrom( otherStylesMap );

			expect( stylesMap.toString() ).to.equal( 'color:red;margin-bottom:2px;margin-right:2px;margin-top:2px;' );
			expect( otherStylesMap.toString() ).to.equal( 'margin-bottom:2px;margin-right:2px;margin-top:2px;' );
		} );

		it( 'should merge when styles not intersect (different box sides)', () => {
			stylesMap.setTo( 'margin-left: 10px;' );
			otherStylesMap.setTo( 'margin-top: 10px;' );

			stylesMap._mergeFrom( otherStylesMap );

			expect( stylesMap.toString() ).to.equal( 'margin-left:10px;margin-top:10px;' );
			expect( otherStylesMap.toString() ).to.equal( 'margin-top:10px;' );
		} );

		it( 'should merge when styles intersect (same value)', () => {
			stylesMap.setTo( 'margin-top: 10px;' );
			otherStylesMap.setTo( 'margin: 10px;' );

			stylesMap._mergeFrom( otherStylesMap );

			expect( stylesMap.toString() ).to.equal( 'margin:10px;' );
			expect( otherStylesMap.toString() ).to.equal( 'margin:10px;' );
		} );

		it( 'should not merge when styles intersect (different value)', () => {
			stylesMap.setTo( 'margin: 10px;' );
			otherStylesMap.setTo( 'margin-left: 5px;' );

			stylesMap._mergeFrom( otherStylesMap );

			expect( stylesMap.toString() ).to.equal( 'margin:10px;' );
			expect( otherStylesMap.toString() ).to.equal( 'margin-left:5px;' );
		} );
	} );

	describe( '_isMatching()', () => {
		let otherStylesMap;

		beforeEach( () => {
			otherStylesMap = new StylesMap( stylesProcessor );
		} );

		it( 'should return true when other styles are empty', () => {
			stylesMap.setTo( 'color: red;' );

			expect( stylesMap._isMatching( otherStylesMap ) ).to.be.true;
		} );

		it( 'should return true when styles match exactly', () => {
			stylesMap.setTo( 'color: red;' );
			otherStylesMap.setTo( 'color: red;' );

			expect( stylesMap._isMatching( otherStylesMap ) ).to.be.true;
		} );

		it( 'should return true when other styles have less tokens', () => {
			stylesMap.setTo( 'margin: 3px;' );
			otherStylesMap.setTo( 'margin-left: 3px;' );

			expect( stylesMap._isMatching( otherStylesMap ) ).to.be.true;
		} );

		it( 'should return false when other styles have less tokens but those does not match', () => {
			stylesMap.setTo( 'margin: 3px;' );
			otherStylesMap.setTo( 'margin-left: 5px;' );

			expect( stylesMap._isMatching( otherStylesMap ) ).to.be.false;
		} );

		it( 'should return false when other styles have more tokens', () => {
			stylesMap.setTo( 'margin-left: 3px;' );
			otherStylesMap.setTo( 'margin: 3px;' );

			expect( stylesMap._isMatching( otherStylesMap ) ).to.be.false;
		} );
	} );
} );
