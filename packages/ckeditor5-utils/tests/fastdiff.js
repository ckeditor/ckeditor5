/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import fastDiff from '../src/fastdiff';
import diff from '../src/diff';
import diffToChanges from '../src/difftochanges';

describe( 'fastDiff', () => {
	it( 'should diff identical texts', () => {
		expectDiff( '123', '123', [] );
	} );

	describe( 'insertion', () => {
		it( 'should diff if old text is empty', () => {
			expectDiff( '', '123', [ { index: 0, type: 'insert', values: [ '1', '2', '3' ] } ] );
		} );

		it( 'should diff insertion on the beginning', () => {
			expectDiff( '123', 'abc123', [ { index: 0, type: 'insert', values: [ 'a', 'b', 'c' ] } ] );
		} );

		it( 'should diff insertion on the beginning (repetitive substring)', () => {
			// Do not check compatibility with 'diffToChanges' as it generates:
			// [ { index: 0, type: 'insert', values: [ 'a', 'b' ] }, { index: 5, type: 'insert', values: [ 'c', '1', '2', '3' ] } ]
			expectDiff( '123', 'ab123c123', [ { index: 0, type: 'insert', values: [ 'a', 'b', '1', '2', '3', 'c' ] } ], false );
		} );

		it( 'should diff insertion on the end', () => {
			expectDiff( '123', '123abc', [ { index: 3, type: 'insert', values: [ 'a', 'b', 'c' ] } ] );
		} );

		it( 'should diff insertion on the end (repetitive substring)', () => {
			expectDiff( '123', '123ab123c', [ { index: 3, type: 'insert', values: [ 'a', 'b', '1', '2', '3', 'c' ] } ] );
		} );

		it( 'should diff insertion in the middle', () => {
			expectDiff( '123', '12abc3', [ { index: 2, type: 'insert', values: [ 'a', 'b', 'c' ] } ] );
		} );

		it( 'should diff insertion in the middle (repetitive substring)', () => {
			// Do not check compatibility with 'diffToChanges' as it generates:
			// [ { index: 2, type: 'insert', values: [ 'a', 'b', '1', '2' ] }, { index: 7, type: 'insert', values: [ 'c', '3' ] } ]
			expectDiff( '123', '12ab123c3', [ { index: 2, type: 'insert', values: [ 'a', 'b', '1', '2', '3', 'c' ] } ], false );
		} );

		it( 'should diff insertion of duplicated content', () => {
			expectDiff( '123', '123123', [ { index: 3, type: 'insert', values: [ '1', '2', '3' ] } ] );
		} );

		it( 'should diff insertion of partially duplicated content', () => {
			expectDiff( '123', '12323', [ { index: 3, type: 'insert', values: [ '2', '3' ] } ] );
		} );

		it( 'should diff insertion on both boundaries', () => {
			// Do not check compatibility with 'diffToChanges' as it generates:
			// [ { index: 2, type: 'insert', values: [ 'a', 'b' ] }, { index: 5, type: 'insert', values: [ 'c' ] } ]
			expectDiff( '123', 'ab123c', [
				{ index: 0, type: 'insert', values: [ 'a', 'b', '1', '2', '3', 'c' ] },
				{ index: 6, type: 'delete', howMany: 3 }
			], false );
		} );
	} );

	describe( 'deletion', () => {
		it( 'should diff if new text is empty', () => {
			expectDiff( '123', '', [ { index: 0, type: 'delete', howMany: 3 } ] );
		} );

		it( 'should diff deletion on the beginning', () => {
			expectDiff( 'abc123', '123', [ { index: 0, type: 'delete', howMany: 3 } ] );
		} );

		it( 'should diff deletion on the beginning (repetitive substring)', () => {
			// Do not check compatibility with 'diffToChanges' as it generates:
			// [ { index: 0, type: 'delete', howMany: 2 }, { index: 3, type: 'delete', howMany: 4 } ]
			expectDiff( 'ab123c123', '123', [ { index: 0, type: 'delete', howMany: 6 } ], false );
		} );

		it( 'should diff deletion on the end', () => {
			expectDiff( '123abc', '123', [ { index: 3, type: 'delete', howMany: 3 } ] );
		} );

		it( 'should diff deletion on the end (repetitive substring)', () => {
			expectDiff( '123ab123c', '123', [ { index: 3, type: 'delete', howMany: 6 } ] );
		} );

		it( 'should diff deletion in the middle', () => {
			expectDiff( '12abc3', '123', [ { index: 2, type: 'delete', howMany: 3 } ] );
		} );

		it( 'should diff deletion in the middle (repetitive substring)', () => {
			// Do not check compatibility with 'diffToChanges' as it generates:
			// [ { index: 2, type: 'delete', howMany: 4 }, { index: 3, type: 'delete', howMany: 2 } ]
			expectDiff( '12ab123c3', '123', [ { index: 2, type: 'delete', howMany: 6 } ], false );
		} );

		it( 'should diff deletion on both boundaries', () => {
			// Do not check compatibility with 'diffToChanges' as it generates:
			// [ { index: 0, type: 'delete', howMany: 1 }, { index: 3, type: 'delete', howMany: 2 } ]
			expectDiff( '12abc3', '2ab', [
				{ index: 0, type: 'insert', values: [ '2', 'a', 'b' ] },
				{ index: 3, type: 'delete', howMany: 6 }
			], false );
		} );

		it( 'should diff deletion of duplicated content', () => {
			expectDiff( '123123', '123', [ { index: 3, type: 'delete', howMany: 3 } ] );
		} );

		it( 'should diff deletion of partially duplicated content', () => {
			expectDiff( '12323', '123', [ { index: 3, type: 'delete', howMany: 2 } ] );
		} );

		it( 'should diff deletion of partially duplicated content 2', () => {
			// Do not check compatibility with 'diffToChanges' as it generates:
			// [ { index: 1, type: 'delete', howMany: 2 }, { index: 2, type: 'delete', howMany: 1 } ]
			expectDiff( '11233', '13', [ { index: 1, type: 'delete', howMany: 3 } ], false );
		} );
	} );

	describe( 'replacement', () => {
		it( 'should diff replacement of entire text', () => {
			// Do not check compatibility with 'diffToChanges' as it has changes in reveres order ('delete', 'insert') here.
			expectDiff( '12345', 'abcd', [
				{ index: 0, type: 'insert', values: [ 'a', 'b', 'c', 'd' ] },
				{ index: 4, type: 'delete', howMany: 5 }
			], false );
		} );

		it( 'should diff replacement on the beginning', () => {
			expectDiff( '12345', 'abcd345', [
				{ index: 0, type: 'insert', values: [ 'a', 'b', 'c', 'd' ] },
				{ index: 4, type: 'delete', howMany: 2 }
			] );
		} );

		it( 'should diff replacement on the beginning (repetitive substring)', () => {
			// Do not check compatibility with 'diffToChanges' as it has changes in reveres order ('delete', 'insert') here.
			expectDiff( '12345', '345345', [
				{ index: 0, type: 'insert', values: [ '3', '4', '5' ] },
				{ index: 3, type: 'delete', howMany: 2 }
			], false );
		} );

		it( 'should diff replacement on the end', () => {
			// Do not check compatibility with 'diffToChanges' as it has changes in reveres order ('delete', 'insert') here.
			expectDiff( '12345', '12ab', [
				{ index: 2, type: 'insert', values: [ 'a', 'b' ] },
				{ index: 4, type: 'delete', howMany: 3 }
			], false );
		} );

		it( 'should diff replacement on the end (repetitive substring)', () => {
			// Do not check compatibility with 'diffToChanges' as it generates:
			// [ { index: 3, type: 'insert', values: [ '1', '2', '3' ] }, { index: 7, type: 'delete', howMany: 1 } ]
			expectDiff( '12345', '1231234', [
				{ index: 3, type: 'insert', values: [ '1', '2', '3', '4' ] },
				{ index: 7, type: 'delete', howMany: 2 }
			], false );
		} );

		it( 'should diff insertion of duplicated content', () => {
			expectDiff( '1234', '123123', [
				{ index: 3, type: 'insert', values: [ '1', '2', '3' ] },
				{ index: 6, type: 'delete', howMany: 1 }
			], false );
		} );

		it( 'should diff insertion of duplicated content', () => {
			expectDiff( '1234', '13424', [
				{ index: 1, type: 'insert', values: [ '3', '4', '2' ] },
				{ index: 4, type: 'delete', howMany: 2 }
			], false );
		} );

		it( 'should diff replacement in the middle', () => {
			expectDiff( '12345', '12ab5', [
				{ index: 2, type: 'insert', values: [ 'a', 'b' ] },
				{ index: 4, type: 'delete', howMany: 2 }
			] );
		} );

		it( 'should diff replacement in the middle (repetitive substring)', () => {
			// Do not check compatibility with 'diffToChanges' as it generates:
			// [ { index: 2, type: 'insert', values: [ '1', '2' ] }, { index: 7, type: 'insert', values: [ '5' ] } ]
			expectDiff( '12345', '12123455', [
				{ index: 2, type: 'insert', values: [ '1', '2', '3', '4', '5' ] },
				{ index: 7, type: 'delete', howMany: 2 }
			], false );
		} );

		it( 'should diff replacement of duplicated content', () => {
			// Do not check compatibility with 'diffToChanges' as it has changes in reveres order ('delete', 'insert') here.
			expectDiff( '123123', '123333', [
				{ index: 3, type: 'insert', values: '33'.split( '' ) },
				{ index: 5, type: 'delete', howMany: 2 }
			], false );
		} );
	} );
} );

function expectDiff( oldText, newText, expected, checkDiffToChangesCompatibility = true ) {
	const result = fastDiff( oldText, newText );

	expect( result ).to.deep.equals( expected );

	if ( checkDiffToChangesCompatibility ) {
		expect( result ).to.deep.equals( diffToChanges( diff( oldText, newText ), newText ), 'diffToChanges compatibility' );
	}
}
