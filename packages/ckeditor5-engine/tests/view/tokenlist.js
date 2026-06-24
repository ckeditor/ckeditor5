/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ViewTokenList } from '../../src/view/tokenlist.js';

describe( 'TokenList', () => {
	let tokenList;

	beforeEach( () => {
		tokenList = new ViewTokenList();
	} );

	describe( 'size getter', () => {
		it( 'should return 0 if no tokens are set', () => {
			expect( tokenList.size ).toBe( 0 );
			expect( tokenList.isEmpty ).toBe( true );
		} );

		it( 'should return number of set tokens', () => {
			expect( tokenList.isEmpty ).toBe( true );

			tokenList.setTo( 'foo' );
			expect( tokenList.size ).toBe( 1 );
			expect( tokenList.isEmpty ).toBe( false );

			tokenList.setTo( 'bar' );
			expect( tokenList.size ).toBe( 1 );
			expect( tokenList.isEmpty ).toBe( false );

			tokenList.setTo( 'foo bar' );
			expect( tokenList.size ).toBe( 2 );
			expect( tokenList.isEmpty ).toBe( false );
		} );
	} );

	describe( 'setTo()', () => {
		it( 'should reset tokens to a new value', () => {
			tokenList.setTo( 'foo bar' );

			expect( tokenList.keys() ).toEqual( [ 'foo', 'bar' ] );

			tokenList.setTo( 'abcd' );

			expect( tokenList.keys() ).toEqual( [ 'abcd' ] );
		} );
	} );

	describe( 'toString()', () => {
		it( 'should return empty string for empty tokens', () => {
			expect( tokenList.toString() ).toBe( '' );
		} );

		it( 'should return tokens string if tokens are set', () => {
			tokenList.setTo( 'foo bar' );

			expect( tokenList.toString() ).toBe( 'foo bar' );
		} );

		it( 'should return multiple tokens string if tokens are set', () => {
			tokenList.setTo( 'foo bar abc' );

			expect( tokenList.toString() ).toBe( 'foo bar abc' );
		} );
	} );

	describe( 'has()', () => {
		it( 'should return false if token is not set', () => {
			expect( tokenList.has( 'bar' ) ).toBe( false );
		} );

		it( 'should return true if token is set', () => {
			tokenList.setTo( 'foo bar' );

			expect( tokenList.has( 'foo' ) ).toBe( true );
			expect( tokenList.has( 'bar' ) ).toBe( true );
			expect( tokenList.has( 'abc' ) ).toBe( false );
		} );
	} );

	describe( 'set()', () => {
		it( 'should insert new token (empty token list)', () => {
			tokenList.set( 'foo' );

			expect( tokenList.toString() ).toBe( 'foo' );
		} );

		it( 'should insert new token (not empty token list)', () => {
			tokenList.setTo( 'abc 123' );
			expect( tokenList.toString() ).toBe( 'abc 123' );

			tokenList.set( 'foo' );
			expect( tokenList.toString() ).toBe( 'abc 123 foo' );
		} );

		it( 'should insert multiple new tokens', () => {
			tokenList.setTo( 'abc' );
			expect( tokenList.toString() ).toBe( 'abc' );

			tokenList.set( [ 'foo', 'bar' ] );
			expect( tokenList.toString() ).toBe( 'abc foo bar' );
		} );

		it( 'should not insert empty token', () => {
			tokenList.setTo( 'abc' );
			expect( tokenList.toString() ).toBe( 'abc' );

			tokenList.set( '' );
			expect( tokenList.toString() ).toBe( 'abc' );
		} );
	} );

	describe( 'remove()', () => {
		it( 'should do nothing if token is not set', () => {
			tokenList.remove( 'foo' );

			expect( tokenList.toString() ).toBe( '' );
		} );

		it( 'should remove token', () => {
			tokenList.setTo( 'foo bar' );
			expect( tokenList.size ).toBe( 2 );
			expect( tokenList.toString() ).toBe( 'foo bar' );

			tokenList.remove( 'foo' );
			expect( tokenList.size ).toBe( 1 );
			expect( tokenList.toString() ).toBe( 'bar' );
		} );

		it( 'should remove array of tokens', () => {
			tokenList.setTo( 'foo bar abc' );
			expect( tokenList.size ).toBe( 3 );
			expect( tokenList.toString() ).toBe( 'foo bar abc' );

			tokenList.remove( [ 'foo', 'abc' ] );
			expect( tokenList.size ).toBe( 1 );
			expect( tokenList.toString() ).toBe( 'bar' );
		} );
	} );

	describe( 'keys()', () => {
		it( 'should output empty array for empty tokens', () => {
			expect( tokenList.keys() ).toEqual( [] );
		} );

		it( 'should output tokens', () => {
			tokenList.setTo( 'foo bar baz' );

			expect( tokenList.keys() ).toEqual( [ 'foo', 'bar', 'baz' ] );
		} );
	} );

	describe( 'isSimilar()', () => {
		let otherTokenList;

		beforeEach( () => {
			otherTokenList = new ViewTokenList();
		} );

		it( 'should return false if count of tokens differs', () => {
			tokenList.setTo( 'foo' );
			otherTokenList.setTo( 'foo bar' );

			expect( tokenList.isSimilar( otherTokenList ) ).toBe( false );
		} );

		it( 'should return false if some token is not available', () => {
			tokenList.setTo( 'foo bar' );
			otherTokenList.setTo( 'foo abc' );

			expect( tokenList.isSimilar( otherTokenList ) ).toBe( false );
		} );

		it( 'should return true if tokens match exactly', () => {
			tokenList.setTo( 'foo bar' );
			otherTokenList.setTo( 'foo bar' );

			expect( tokenList.isSimilar( otherTokenList ) ).toBe( true );
		} );

		it( 'should return true if tokens match but are defined in a different order', () => {
			tokenList.setTo( 'foo bar' );
			otherTokenList.setTo( 'bar foo' );

			expect( tokenList.isSimilar( otherTokenList ) ).toBe( true );
		} );
	} );

	describe( '_clone()', () => {
		it( 'should create a new instance of TokenList', () => {
			const newTokenList = tokenList._clone();

			expect( newTokenList ).toEqual( tokenList );
			expect( newTokenList ).not.toBe( tokenList );
			expect( newTokenList.isEmpty ).toBe( true );
		} );

		it( 'should have same styles', () => {
			tokenList.setTo( 'foo bar baz' );

			const newTokenList = tokenList._clone();

			expect( newTokenList ).toEqual( tokenList );
			expect( newTokenList ).not.toBe( tokenList );
			expect( newTokenList.toString() ).toBe( 'foo bar baz' );
		} );
	} );

	describe( '_getTokensMatch()', () => {
		beforeEach( () => {
			tokenList.setTo( 'foo bar baz' );
		} );

		it( 'should return undefined if no tokens match', () => {
			expect( tokenList._getTokensMatch( 'xyz' ) ).toBeUndefined();
		} );

		it( 'should match patternToken=true', () => {
			expect( tokenList._getTokensMatch( true ) ).toEqual( [
				'foo',
				'bar',
				'baz'
			] );
		} );

		it( 'should match patternToken=string', () => {
			expect( tokenList._getTokensMatch( 'bar' ) ).toEqual( [
				'bar'
			] );
		} );

		it( 'should match patternToken=string with spaces', () => {
			expect( tokenList._getTokensMatch( 'bar foo' ) ).toEqual( [
				'bar',
				'foo'
			] );
		} );

		it( 'should match patternToken=regexp', () => {
			expect( tokenList._getTokensMatch( /^ba/ ) ).toEqual( [
				'bar',
				'baz'
			] );
		} );

		it( 'should return undefined if regexp does not match to any token', () => {
			expect( tokenList._getTokensMatch( /x/ ) ).toBeUndefined();
		} );
	} );

	describe( '_getConsumables()', () => {
		beforeEach( () => {
			tokenList.setTo( 'foo bar baz' );
		} );

		it( 'should return all consumable tokens', () => {
			expect( tokenList._getConsumables() ).toEqual( [
				'foo',
				'bar',
				'baz'
			] );
		} );

		it( 'should return tokens for a specified token', () => {
			expect( tokenList._getConsumables( 'bar' ) ).toEqual( [
				'bar'
			] );
		} );
	} );

	describe( '_canMergeFrom()', () => {
		let otherTokenList;

		beforeEach( () => {
			otherTokenList = new ViewTokenList();
		} );

		it( 'should return true for empty tokens', () => {
			expect( tokenList._canMergeFrom( otherTokenList ) ).toBe( true );
		} );

		it( 'should return true when tokens not intersect', () => {
			tokenList.setTo( 'foo bar' );
			otherTokenList.setTo( 'baz' );

			expect( tokenList._canMergeFrom( otherTokenList ) ).toBe( true );
		} );

		it( 'should return true when tokens intersect', () => {
			tokenList.setTo( 'foo bar' );
			otherTokenList.setTo( 'bar' );

			expect( tokenList._canMergeFrom( otherTokenList ) ).toBe( true );
		} );
	} );

	describe( '_mergeFrom()', () => {
		let otherTokenList;

		beforeEach( () => {
			otherTokenList = new ViewTokenList();
		} );

		it( 'should merge when tokens not intersect', () => {
			tokenList.setTo( 'foo bar' );
			otherTokenList.setTo( 'abc' );

			tokenList._mergeFrom( otherTokenList );

			expect( tokenList.toString() ).toBe( 'foo bar abc' );
			expect( otherTokenList.toString() ).toBe( 'abc' );
		} );

		it( 'should merge when tokens intersect', () => {
			tokenList.setTo( 'foo bar' );
			otherTokenList.setTo( 'bar baz' );

			tokenList._mergeFrom( otherTokenList );

			expect( tokenList.toString() ).toBe( 'foo bar baz' );
			expect( otherTokenList.toString() ).toBe( 'bar baz' );
		} );
	} );

	describe( '_isMatching()', () => {
		let otherTokenList;

		beforeEach( () => {
			otherTokenList = new ViewTokenList();
		} );

		it( 'should return true when other tokens are empty', () => {
			tokenList.setTo( 'foo bar' );

			expect( tokenList._isMatching( otherTokenList ) ).toBe( true );
		} );

		it( 'should return true when tokens match exactly', () => {
			tokenList.setTo( 'foo bar' );
			otherTokenList.setTo( 'foo bar' );

			expect( tokenList._isMatching( otherTokenList ) ).toBe( true );
		} );

		it( 'should return true when other token list have less tokens', () => {
			tokenList.setTo( 'foo bar' );
			otherTokenList.setTo( 'foo' );

			expect( tokenList._isMatching( otherTokenList ) ).toBe( true );
		} );

		it( 'should return false when other styles have more tokens', () => {
			tokenList.setTo( 'foo' );
			otherTokenList.setTo( 'foo bar' );

			expect( tokenList._isMatching( otherTokenList ) ).toBe( false );
		} );
	} );
} );
