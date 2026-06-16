/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { diff } from '../src/diff.js';

import { getLongText } from './_utils/longtext.js';

describe( 'diff', () => {
	let fastDiffSpy;

	beforeEach( () => {
		fastDiffSpy = vi.spyOn( diff, 'fastDiff' );
	} );

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	it( 'should diff strings', () => {
		expect( diff( 'aba', 'acca' ) ).toEqual( [ 'equal', 'insert', 'insert', 'delete', 'equal' ] );
		expect( fastDiffSpy ).not.toHaveBeenCalled();
	} );

	it( 'should diff arrays', () => {
		expect( diff( Array.from( 'aba' ), Array.from( 'acca' ) ) ).toEqual( [ 'equal', 'insert', 'insert', 'delete', 'equal' ] );
		expect( fastDiffSpy ).not.toHaveBeenCalled();
	} );

	it( 'should reverse result if the second string is shorter', () => {
		expect( diff( 'acca', 'aba' ) ).toEqual( [ 'equal', 'delete', 'delete', 'insert', 'equal' ] );
		expect( fastDiffSpy ).not.toHaveBeenCalled();
	} );

	it( 'should diff if strings are same', () => {
		expect( diff( 'abc', 'abc' ) ).toEqual( [ 'equal', 'equal', 'equal' ] );
		expect( fastDiffSpy ).not.toHaveBeenCalled();
	} );

	it( 'should diff if one string is empty', () => {
		expect( diff( '', 'abc' ) ).toEqual( [ 'insert', 'insert', 'insert' ] );
		expect( fastDiffSpy ).not.toHaveBeenCalled();
	} );

	it( 'should use custom comparator', () => {
		expect( diff( 'aBc', 'abc' ) ).toEqual( [ 'equal', 'insert', 'delete', 'equal' ] );
		expect( diff( 'aBc', 'abc', ( a, b ) => a.toLowerCase() == b.toLowerCase() ) ).toEqual( [ 'equal', 'equal', 'equal' ] );
		expect( fastDiffSpy ).not.toHaveBeenCalled();
	} );

	it( 'should use fastDiff() internally for strings with 400+ length and length sum of 1400+', () => {
		diff( getLongText( 400 ), getLongText( 1000 ) );
		expect( fastDiffSpy ).toHaveBeenCalled();
	} );

	it( 'should use fastDiff() internally for arrays with 400+ length and length sum of 1400+', () => {
		diff( getLongText( 500 ).split( '' ), getLongText( 950 ).split( '' ) );
		expect( fastDiffSpy ).toHaveBeenCalled();
	} );

	it( 'should use fastDiff() internally for strings with length sum of 2000+', () => {
		diff( getLongText( 100 ), getLongText( 2000 ) );
		expect( fastDiffSpy ).toHaveBeenCalled();
	} );

	it( 'should use fastDiff() internally for strings with length sum of exaclty 2000', () => {
		diff( getLongText( 10 ), getLongText( 1990 ) );
		expect( fastDiffSpy ).toHaveBeenCalled();
	} );

	describe( 'with multi-byte unicode', () => {
		describe( 'simple emoji - single unicode code point', () => {
			// 🙂 = '\ud83d\ude42' = 2 chars
			const emojiLength = '🙂'.length;
			const emojiDiffInsert = new Array( emojiLength ).fill( 'insert' );
			const emojiDiffEqual = new Array( emojiLength ).fill( 'equal' );
			const emojiDiffDelete = new Array( emojiLength ).fill( 'delete' );

			it( 'should properly handle emoji insertion', () => {
				expect( diff( 'abc', 'ab🙂c' ) ).toEqual( [ 'equal', 'equal', ...emojiDiffInsert, 'equal' ] );
			} );

			it( 'should properly handle emoji insertion on the end', () => {
				expect( diff( 'abc', 'abc🙂' ) ).toEqual( [ 'equal', 'equal', 'equal', ...emojiDiffInsert ] );
			} );

			it( 'should properly handle appending to string containing emoji', () => {
				expect( diff( 'abc🙂', 'abc🙂d' ) ).toEqual( [ 'equal', 'equal', 'equal', ...emojiDiffEqual, 'insert' ] );
			} );

			it( 'should properly handle insertion to string containing emoji', () => {
				expect( diff( 'ab🙂cd', 'ab🙂cde' ) ).toEqual( [ 'equal', 'equal', ...emojiDiffEqual, 'equal', 'equal', 'insert' ] );
			} );

			it( 'should properly remove emoji', () => {
				expect( diff( 'a🙂b', 'ab' ) ).toEqual( [ 'equal', ...emojiDiffDelete, 'equal' ] );
			} );

			it( 'should properly replace emoji', () => {
				expect( diff( 'a🙂b', 'axb' ) ).toEqual( [ 'equal', ...emojiDiffDelete, 'insert', 'equal' ] );
			} );

			it( 'should properly replace one emoji with another', () => {
				// 😄 = '\ud83d\ude04' = 2 chars
				// Note both emoji have same first code unit
				expect( diff( 'a🙂b', 'a😄b' ) ).toEqual(
					[ 'equal', 'equal', ...emojiDiffInsert.slice( 1 ), ...emojiDiffDelete.slice( 1 ), 'equal' ]
				);
			} );
		} );

		describe( 'combined emoji - unicode ZWJ sequence', () => {
			// 👩‍🦰 = '\ud83d\udc69\u200d\ud83e\uddB0' = 5 chars
			const emojiLength = '👩‍🦰'.length;
			const emojiDiffInsert = new Array( emojiLength ).fill( 'insert' );
			const emojiDiffEqual = new Array( emojiLength ).fill( 'equal' );
			const emojiDiffDelete = new Array( emojiLength ).fill( 'delete' );

			it( 'should properly handle emoji insertion (with ZWJ)', () => {
				expect( diff( 'abc', 'ab👩‍🦰c' ) ).toEqual( [ 'equal', 'equal', ...emojiDiffInsert, 'equal' ] );
			} );

			it( 'should properly handle emoji insertion on the end (with ZWJ)', () => {
				expect( diff( 'abc', 'abc👩‍🦰' ) ).toEqual( [ 'equal', 'equal', 'equal', ...emojiDiffInsert ] );
			} );

			it( 'should properly handle appending to string containing emoji (with ZWJ)', () => {
				expect( diff( 'ab👩‍🦰', 'ab👩‍🦰c' ) ).toEqual( [ 'equal', 'equal', ...emojiDiffEqual, 'insert' ] );
			} );

			it( 'should properly handle insertion to string containing emoji (with ZWJ)', () => {
				expect( diff( 'a👩‍🦰b', 'a👩‍🦰bc' ) ).toEqual( [ 'equal', ...emojiDiffEqual, 'equal', 'insert' ] );
			} );

			it( 'should properly remove emoji (with ZWJ)', () => {
				expect( diff( 'a👩‍🦰b', 'ab' ) ).toEqual( [ 'equal', ...emojiDiffDelete, 'equal' ] );
			} );

			it( 'should properly replace emoji (with ZWJ)', () => {
				expect( diff( 'a👩‍🦰b', 'axb' ) ).toEqual( [ 'equal', ...emojiDiffDelete, 'insert', 'equal' ] );
			} );

			it( 'should properly replace ZWJ sequence with simple emoji', () => {
				const simpleEmojiDiffInsert = new Array( '🙂'.length ).fill( 'insert' );

				// Note that first char of both emoji is the same.
				expect( diff( 'a👩‍🦰b', 'a🙂b' ) ).toEqual( [
					'equal', 'equal', ...emojiDiffDelete.slice( 1 ), ...simpleEmojiDiffInsert.slice( 1 ), 'equal'
				] );
			} );

			it( 'should properly replace simple emoji with ZWJ sequence', () => {
				const simpleEmojiDiffDelete = new Array( '🙂'.length ).fill( 'delete' );

				// Note that first char of both emoji is the same.
				expect( diff( 'a🙂b', 'a👩‍🦰b' ) ).toEqual( [
					'equal', 'equal', ...emojiDiffInsert.slice( 1 ), ...simpleEmojiDiffDelete.slice( 1 ), 'equal'
				] );
			} );
		} );
	} );
} );
