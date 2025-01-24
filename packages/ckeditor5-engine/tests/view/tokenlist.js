/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import TokenList from '../../src/view/tokenlist.js';

describe( 'TokenList', () => {
	let tokenList;

	beforeEach( () => {
		tokenList = new TokenList();
	} );

	describe( 'size getter', () => {
		it( 'should return 0 if no tokens are set', () => {
			expect( tokenList.size ).to.equal( 0 );
			expect( tokenList.isEmpty ).to.be.true;
		} );

		it( 'should return number of set tokens', () => {
			expect( tokenList.isEmpty ).to.be.true;

			tokenList.setTo( 'foo' );
			expect( tokenList.size ).to.equal( 1 );
			expect( tokenList.isEmpty ).to.be.false;

			tokenList.setTo( 'bar' );
			expect( tokenList.size ).to.equal( 1 );
			expect( tokenList.isEmpty ).to.be.false;

			tokenList.setTo( 'foo bar' );
			expect( tokenList.size ).to.equal( 2 );
			expect( tokenList.isEmpty ).to.be.false;
		} );
	} );

	describe( 'setTo()', () => {
		it( 'should reset tokens to a new value', () => {
			tokenList.setTo( 'foo bar' );

			expect( tokenList.keys() ).to.deep.equal( [ 'foo', 'bar' ] );

			tokenList.setTo( 'abcd' );

			expect( tokenList.keys() ).to.deep.equal( [ 'abcd' ] );
		} );
	} );

	describe( 'toString()', () => {
		it( 'should return empty string for empty tokens', () => {
			expect( tokenList.toString() ).to.equal( '' );
		} );

		it( 'should return tokens string if tokens are set', () => {
			tokenList.setTo( 'foo bar' );

			expect( tokenList.toString() ).to.equal( 'foo bar' );
		} );

		it( 'should return multiple tokens string if tokens are set', () => {
			tokenList.setTo( 'foo bar abc' );

			expect( tokenList.toString() ).to.equal( 'foo bar abc' );
		} );
	} );

	describe( 'has()', () => {
		it( 'should return false if token is not set', () => {
			expect( tokenList.has( 'bar' ) ).to.be.false;
		} );

		it( 'should return true if token is set', () => {
			tokenList.setTo( 'foo bar' );

			expect( tokenList.has( 'foo' ) ).to.be.true;
			expect( tokenList.has( 'bar' ) ).to.be.true;
			expect( tokenList.has( 'abc' ) ).to.be.false;
		} );
	} );

	describe( 'set()', () => {
		it( 'should insert new token (empty token list)', () => {
			tokenList.set( 'foo' );

			expect( tokenList.toString() ).to.equal( 'foo' );
		} );

		it( 'should insert new token (not empty token list)', () => {
			tokenList.setTo( 'abc 123' );
			expect( tokenList.toString() ).to.equal( 'abc 123' );

			tokenList.set( 'foo' );
			expect( tokenList.toString() ).to.equal( 'abc 123 foo' );
		} );

		it( 'should insert multiple new tokens', () => {
			tokenList.setTo( 'abc' );
			expect( tokenList.toString() ).to.equal( 'abc' );

			tokenList.set( [ 'foo', 'bar' ] );
			expect( tokenList.toString() ).to.equal( 'abc foo bar' );
		} );

		it( 'should not insert empty token', () => {
			tokenList.setTo( 'abc' );
			expect( tokenList.toString() ).to.equal( 'abc' );

			tokenList.set( '' );
			expect( tokenList.toString() ).to.equal( 'abc' );
		} );
	} );

	describe( 'remove()', () => {
		it( 'should do nothing if token is not set', () => {
			tokenList.remove( 'foo' );

			expect( tokenList.toString() ).to.equal( '' );
		} );

		it( 'should remove token', () => {
			tokenList.setTo( 'foo bar' );
			expect( tokenList.size ).to.equal( 2 );
			expect( tokenList.toString() ).to.equal( 'foo bar' );

			tokenList.remove( 'foo' );
			expect( tokenList.size ).to.equal( 1 );
			expect( tokenList.toString() ).to.equal( 'bar' );
		} );

		it( 'should remove array of tokens', () => {
			tokenList.setTo( 'foo bar abc' );
			expect( tokenList.size ).to.equal( 3 );
			expect( tokenList.toString() ).to.equal( 'foo bar abc' );

			tokenList.remove( [ 'foo', 'abc' ] );
			expect( tokenList.size ).to.equal( 1 );
			expect( tokenList.toString() ).to.equal( 'bar' );
		} );
	} );

	describe( 'keys()', () => {
		it( 'should output empty array for empty tokens', () => {
			expect( tokenList.keys() ).to.deep.equal( [] );
		} );

		it( 'should output tokens', () => {
			tokenList.setTo( 'foo bar baz' );

			expect( tokenList.keys() ).to.deep.equal( [ 'foo', 'bar', 'baz' ] );
		} );
	} );

	describe( 'isSimilar()', () => {
		let otherTokenList;

		beforeEach( () => {
			otherTokenList = new TokenList();
		} );

		it( 'should return false if count of tokens differs', () => {
			tokenList.setTo( 'foo' );
			otherTokenList.setTo( 'foo bar' );

			expect( tokenList.isSimilar( otherTokenList ) ).to.be.false;
		} );

		it( 'should return false if some token is not available', () => {
			tokenList.setTo( 'foo bar' );
			otherTokenList.setTo( 'foo abc' );

			expect( tokenList.isSimilar( otherTokenList ) ).to.be.false;
		} );

		it( 'should return true if tokens match exactly', () => {
			tokenList.setTo( 'foo bar' );
			otherTokenList.setTo( 'foo bar' );

			expect( tokenList.isSimilar( otherTokenList ) ).to.be.true;
		} );

		it( 'should return true if tokens match but are defined in a different order', () => {
			tokenList.setTo( 'foo bar' );
			otherTokenList.setTo( 'bar foo' );

			expect( tokenList.isSimilar( otherTokenList ) ).to.be.true;
		} );
	} );

	describe( '_clone()', () => {
		it( 'should create a new instance of TokenList', () => {
			const newTokenList = tokenList._clone();

			expect( newTokenList ).to.deep.equal( tokenList );
			expect( newTokenList ).to.not.equal( tokenList );
			expect( newTokenList.isEmpty ).to.be.true;
		} );

		it( 'should have same styles', () => {
			tokenList.setTo( 'foo bar baz' );

			const newTokenList = tokenList._clone();

			expect( newTokenList ).to.deep.equal( tokenList );
			expect( newTokenList ).to.not.equal( tokenList );
			expect( newTokenList.toString() ).to.equal( 'foo bar baz' );
		} );
	} );

	describe( '_getTokensMatch()', () => {
		beforeEach( () => {
			tokenList.setTo( 'foo bar baz' );
		} );

		it( 'should return undefined if no tokens match', () => {
			expect( tokenList._getTokensMatch( 'xyz' ) ).to.be.undefined;
		} );

		it( 'should match patternToken=true', () => {
			expect( tokenList._getTokensMatch( true ) ).to.deep.equal( [
				'foo',
				'bar',
				'baz'
			] );
		} );

		it( 'should match patternToken=string', () => {
			expect( tokenList._getTokensMatch( 'bar' ) ).to.deep.equal( [
				'bar'
			] );
		} );

		it( 'should match patternToken=string with spaces', () => {
			expect( tokenList._getTokensMatch( 'bar foo' ) ).to.deep.equal( [
				'bar',
				'foo'
			] );
		} );

		it( 'should match patternToken=regexp', () => {
			expect( tokenList._getTokensMatch( /^ba/ ) ).to.deep.equal( [
				'bar',
				'baz'
			] );
		} );

		it( 'should return undefined if regexp does not match to any token', () => {
			expect( tokenList._getTokensMatch( /x/ ) ).to.be.undefined;
		} );
	} );

	describe( '_getConsumables()', () => {
		beforeEach( () => {
			tokenList.setTo( 'foo bar baz' );
		} );

		it( 'should return all consumable tokens', () => {
			expect( tokenList._getConsumables() ).to.deep.equal( [
				'foo',
				'bar',
				'baz'
			] );
		} );

		it( 'should return tokens for a specified token', () => {
			expect( tokenList._getConsumables( 'bar' ) ).to.deep.equal( [
				'bar'
			] );
		} );
	} );

	describe( '_canMergeFrom()', () => {
		let otherTokenList;

		beforeEach( () => {
			otherTokenList = new TokenList();
		} );

		it( 'should return true for empty tokens', () => {
			expect( tokenList._canMergeFrom( otherTokenList ) ).to.be.true;
		} );

		it( 'should return true when tokens not intersect', () => {
			tokenList.setTo( 'foo bar' );
			otherTokenList.setTo( 'baz' );

			expect( tokenList._canMergeFrom( otherTokenList ) ).to.be.true;
		} );

		it( 'should return true when tokens intersect', () => {
			tokenList.setTo( 'foo bar' );
			otherTokenList.setTo( 'bar' );

			expect( tokenList._canMergeFrom( otherTokenList ) ).to.be.true;
		} );
	} );

	describe( '_mergeFrom()', () => {
		let otherTokenList;

		beforeEach( () => {
			otherTokenList = new TokenList();
		} );

		it( 'should merge when tokens not intersect', () => {
			tokenList.setTo( 'foo bar' );
			otherTokenList.setTo( 'abc' );

			tokenList._mergeFrom( otherTokenList );

			expect( tokenList.toString() ).to.equal( 'foo bar abc' );
			expect( otherTokenList.toString() ).to.equal( 'abc' );
		} );

		it( 'should merge when tokens intersect', () => {
			tokenList.setTo( 'foo bar' );
			otherTokenList.setTo( 'bar baz' );

			tokenList._mergeFrom( otherTokenList );

			expect( tokenList.toString() ).to.equal( 'foo bar baz' );
			expect( otherTokenList.toString() ).to.equal( 'bar baz' );
		} );
	} );

	describe( '_isMatching()', () => {
		let otherTokenList;

		beforeEach( () => {
			otherTokenList = new TokenList();
		} );

		it( 'should return true when other tokens are empty', () => {
			tokenList.setTo( 'foo bar' );

			expect( tokenList._isMatching( otherTokenList ) ).to.be.true;
		} );

		it( 'should return true when tokens match exactly', () => {
			tokenList.setTo( 'foo bar' );
			otherTokenList.setTo( 'foo bar' );

			expect( tokenList._isMatching( otherTokenList ) ).to.be.true;
		} );

		it( 'should return true when other token list have less tokens', () => {
			tokenList.setTo( 'foo bar' );
			otherTokenList.setTo( 'foo' );

			expect( tokenList._isMatching( otherTokenList ) ).to.be.true;
		} );

		it( 'should return false when other styles have more tokens', () => {
			tokenList.setTo( 'foo' );
			otherTokenList.setTo( 'foo bar' );

			expect( tokenList._isMatching( otherTokenList ) ).to.be.false;
		} );
	} );
} );
