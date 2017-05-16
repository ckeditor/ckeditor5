/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import spy from '../src/spy';

describe( 'utils', () => {
	describe( 'spy', () => {
		it( 'should not have `called` after creation', () => {
			const fn = spy();

			expect( fn.called ).to.not.be.true;
		} );

		it( 'should register calls', () => {
			const fn1 = spy();
			const fn2 = spy();

			fn1();

			expect( fn1.called ).to.be.true;
			expect( fn2.called ).to.not.be.true;
		} );
	} );
} );
