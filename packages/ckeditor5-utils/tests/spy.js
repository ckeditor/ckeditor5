/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import spy from '../src/spy.js';

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
