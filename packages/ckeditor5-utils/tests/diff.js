/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import diff from '../src/diff';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import getLongText from './_utils/longtext';

describe( 'diff', () => {
	let fastDiffSpy;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		fastDiffSpy = testUtils.sinon.spy( diff, 'fastDiff' );
	} );

	it( 'should diff strings', () => {
		expect( diff( 'aba', 'acca' ) ).to.deep.equal( [ 'equal', 'insert', 'insert', 'delete', 'equal' ] );
		testUtils.sinon.assert.notCalled( fastDiffSpy );
	} );

	it( 'should diff arrays', () => {
		expect( diff( Array.from( 'aba' ), Array.from( 'acca' ) ) ).to.deep.equal( [ 'equal', 'insert', 'insert', 'delete', 'equal' ] );
		testUtils.sinon.assert.notCalled( fastDiffSpy );
	} );

	it( 'should reverse result if the second string is shorter', () => {
		expect( diff( 'acca', 'aba' ) ).to.deep.equal( [ 'equal', 'delete', 'delete', 'insert', 'equal' ] );
		testUtils.sinon.assert.notCalled( fastDiffSpy );
	} );

	it( 'should diff if strings are same', () => {
		expect( diff( 'abc', 'abc' ) ).to.deep.equal( [ 'equal', 'equal', 'equal' ] );
		testUtils.sinon.assert.notCalled( fastDiffSpy );
	} );

	it( 'should diff if one string is empty', () => {
		expect( diff( '', 'abc' ) ).to.deep.equal( [ 'insert', 'insert', 'insert' ] );
		testUtils.sinon.assert.notCalled( fastDiffSpy );
	} );

	it( 'should use custom comparator', () => {
		expect( diff( 'aBc', 'abc' ) ).to.deep.equal( [ 'equal', 'insert', 'delete', 'equal' ] );
		expect( diff( 'aBc', 'abc', ( a, b ) => a.toLowerCase() == b.toLowerCase() ) ).to.deep.equal( [ 'equal', 'equal', 'equal' ] );
		testUtils.sinon.assert.notCalled( fastDiffSpy );
	} );

	it( 'should use fastDiff() internally for strings with 400+ length and length sum of 1400+', () => {
		diff( getLongText( 400 ), getLongText( 1000 ) );
		testUtils.sinon.assert.called( fastDiffSpy );
	} );

	it( 'should use fastDiff() internally for arrays with 400+ length and length sum of 1400+', () => {
		diff( getLongText( 500 ).split( '' ), getLongText( 950 ).split( '' ) );
		testUtils.sinon.assert.called( fastDiffSpy );
	} );

	it( 'should use fastDiff() internally for strings with length sum of 2000+', () => {
		diff( getLongText( 100 ), getLongText( 2000 ) );
		testUtils.sinon.assert.called( fastDiffSpy );
	} );

	it( 'should use fastDiff() internally for strings with length sum of exaclty 2000', () => {
		diff( getLongText( 10 ), getLongText( 1990 ) );
		testUtils.sinon.assert.called( fastDiffSpy );
	} );

	describe( 'with multi-byte unicode', () => {
		describe( 'simple emoji - single unicode code point', () => {
			// 🙂 = '\ud83d\ude42' = 2 chars
			const emojiLength = '🙂'.length;
			const emojiDiffInsert = new Array( emojiLength ).fill( 'insert' );
			const emojiDiffEqual = new Array( emojiLength ).fill( 'equal' );
			const emojiDiffDelete = new Array( emojiLength ).fill( 'delete' );

			it( 'should properly handle emoji insertion', () => {
				expect( diff( 'abc', 'ab🙂c' ) ).to.deep.equal( [ 'equal', 'equal', ...emojiDiffInsert, 'equal' ] );
			} );

			it( 'should properly handle emoji insertion on the end', () => {
				expect( diff( 'abc', 'abc🙂' ) ).to.deep.equal( [ 'equal', 'equal', 'equal', ...emojiDiffInsert ] );
			} );

			it( 'should properly handle appending to string containing emoji', () => {
				expect( diff( 'abc🙂', 'abc🙂d' ) ).to.deep.equal( [ 'equal', 'equal', 'equal', ...emojiDiffEqual, 'insert' ] );
			} );

			it( 'should properly handle insertion to string containing emoji', () => {
				expect( diff( 'ab🙂cd', 'ab🙂cde' ) ).to.deep.equal( [ 'equal', 'equal', ...emojiDiffEqual, 'equal', 'equal', 'insert' ] );
			} );

			it( 'should properly remove emoji', () => {
				expect( diff( 'a🙂b', 'ab' ) ).to.deep.equal( [ 'equal', ...emojiDiffDelete, 'equal' ] );
			} );

			it( 'should properly replace emoji', () => {
				expect( diff( 'a🙂b', 'axb' ) ).to.deep.equal( [ 'equal', ...emojiDiffDelete, 'insert', 'equal' ] );
			} );

			it( 'should properly replace one emoji with another', () => {
				// 😄 = '\ud83d\ude04' = 2 chars
				// Note both emoji have same first code unit
				expect( diff( 'a🙂b', 'a😄b' ) ).to.deep.equal(
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
				expect( diff( 'abc', 'ab👩‍🦰c' ) ).to.deep.equal( [ 'equal', 'equal', ...emojiDiffInsert, 'equal' ] );
			} );

			it( 'should properly handle emoji insertion on the end (with ZWJ)', () => {
				expect( diff( 'abc', 'abc👩‍🦰' ) ).to.deep.equal( [ 'equal', 'equal', 'equal', ...emojiDiffInsert ] );
			} );

			it( 'should properly handle appending to string containing emoji (with ZWJ)', () => {
				expect( diff( 'ab👩‍🦰', 'ab👩‍🦰c' ) ).to.deep.equal( [ 'equal', 'equal', ...emojiDiffEqual, 'insert' ] );
			} );

			it( 'should properly handle insertion to string containing emoji (with ZWJ)', () => {
				expect( diff( 'a👩‍🦰b', 'a👩‍🦰bc' ) ).to.deep.equal( [ 'equal', ...emojiDiffEqual, 'equal', 'insert' ] );
			} );

			it( 'should properly remove emoji (with ZWJ)', () => {
				expect( diff( 'a👩‍🦰b', 'ab' ) ).to.deep.equal( [ 'equal', ...emojiDiffDelete, 'equal' ] );
			} );

			it( 'should properly replace emoji (with ZWJ)', () => {
				expect( diff( 'a👩‍🦰b', 'axb' ) ).to.deep.equal( [ 'equal', ...emojiDiffDelete, 'insert', 'equal' ] );
			} );

			it( 'should properly replace ZWJ sequence with simple emoji', () => {
				const simpleEmojiDiffInsert = new Array( '🙂'.length ).fill( 'insert' );

				// Note that first char of both emoji is the same.
				expect( diff( 'a👩‍🦰b', 'a🙂b' ) ).to.deep.equal( [
					'equal', 'equal', ...emojiDiffDelete.slice( 1 ), ...simpleEmojiDiffInsert.slice( 1 ), 'equal'
				] );
			} );

			it( 'should properly replace simple emoji with ZWJ sequence', () => {
				const simpleEmojiDiffDelete = new Array( '🙂'.length ).fill( 'delete' );

				// Note that first char of both emoji is the same.
				expect( diff( 'a🙂b', 'a👩‍🦰b' ) ).to.deep.equal( [
					'equal', 'equal', ...emojiDiffInsert.slice( 1 ), ...simpleEmojiDiffDelete.slice( 1 ), 'equal'
				] );
			} );
		} );
	} );
} );
