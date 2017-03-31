/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import DeltaReplayer from '../../src/dev-utils/deltareplayer';

describe( 'DeltaReplayer', () => {
	describe( 'constructor()', () => {
		it( 'should be able to initialize replayer without deltas', () => {
			const fakeDocument = {};
			const stringifiedDeltas = '';
			const deltaReplayer = new DeltaReplayer( fakeDocument, '---', stringifiedDeltas );

			expect( deltaReplayer._deltaToReplay ).to.deep.equal( [] );
			expect( deltaReplayer._document ).to.deep.equal( fakeDocument );
			expect( deltaReplayer._logSeparator ).to.deep.equal( '---' );
		} );
	} );
} );
