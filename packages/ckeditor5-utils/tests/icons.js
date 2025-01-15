/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { registerIcon, useIcon } from '../src/icons.js';

describe( 'icons', () => {
	describe( 'registerIcon', () => {
		it( 'can register icons', () => {
			registerIcon( 'icons_test1', 'bar' );

			expect( useIcon( 'icons_test1' ) ).to.equal( 'bar' );
		} );

		it( 'returns `useIcon` function', () => {
			const icon = registerIcon( 'icons_test2', 'bar' );

			expect( icon() ).to.equal( useIcon( 'icons_test2' ) );
		} );

		it( 'doesnt override existing icon by default', () => {
			registerIcon( 'icons_test3', 'bar' );
			registerIcon( 'icons_test3', 'baz' );

			expect( useIcon( 'icons_test3' ) ).to.equal( 'bar' );
		} );

		it( 'overrides existing icon if `force` is set to `true`', () => {
			registerIcon( 'icons_test4', 'bar' );
			registerIcon( 'icons_test4', 'baz', true );

			expect( useIcon( 'icons_test4' ) ).to.equal( 'baz' );
		} );
	} );

	describe( 'useIcon', () => {
		it( 'returns `undefined` if icon is not registered', () => {
			expect( useIcon( 'icons_test5' ) ).to.be.undefined;
		} );

		it( 'returns icon value if icon is registered', () => {
			registerIcon( 'icons_test6', 'bar' );

			expect( useIcon( 'icons_test6' ) ).to.equal( 'bar' );
		} );
	} );
} );
