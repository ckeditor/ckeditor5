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
		expect( diff( 'aba', 'acca' ) ).to.deep.equals( [ 'equal', 'insert', 'insert', 'delete', 'equal' ] );
		testUtils.sinon.assert.notCalled( fastDiffSpy );
	} );

	it( 'should diff arrays', () => {
		expect( diff( Array.from( 'aba' ), Array.from( 'acca' ) ) ).to.deep.equals( [ 'equal', 'insert', 'insert', 'delete', 'equal' ] );
		testUtils.sinon.assert.notCalled( fastDiffSpy );
	} );

	it( 'should reverse result if the second string is shorter', () => {
		expect( diff( 'acca', 'aba' ) ).to.deep.equals( [ 'equal', 'delete', 'delete', 'insert', 'equal' ] );
		testUtils.sinon.assert.notCalled( fastDiffSpy );
	} );

	it( 'should diff if strings are same', () => {
		expect( diff( 'abc', 'abc' ) ).to.deep.equals( [ 'equal', 'equal', 'equal' ] );
		testUtils.sinon.assert.notCalled( fastDiffSpy );
	} );

	it( 'should diff if one string is empty', () => {
		expect( diff( '', 'abc' ) ).to.deep.equals( [ 'insert', 'insert', 'insert' ] );
		testUtils.sinon.assert.notCalled( fastDiffSpy );
	} );

	it( 'should use custom comparator', () => {
		expect( diff( 'aBc', 'abc' ) ).to.deep.equals( [ 'equal', 'insert', 'delete', 'equal' ] );
		expect( diff( 'aBc', 'abc', ( a, b ) => a.toLowerCase() == b.toLowerCase() ) ).to.deep.equals( [ 'equal', 'equal', 'equal' ] );
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

	it( 'should use fastDiff() internally for strings with length sum of 2000+', () => {
		diff( getLongText( 10 ), getLongText( 1990 ) );
		testUtils.sinon.assert.called( fastDiffSpy );
	} );

	it( 'should diff insertion on the end handle multi-byte unicode properly', () => {
		expect( diff( '123🙂', '123🙂x' ) ).to.deep.equals( [ 'equal', 'equal', 'equal', 'equal', 'equal', 'insert' ] );
	} );
} );
