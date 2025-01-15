/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* global globalThis */

import { registerIcon, useIcon } from '../src/icons.js';

describe( 'icons', () => {
	beforeEach( () => {
		delete globalThis.CKEDITOR_ICONS;
	} );

	describe( 'registerIcon', () => {
		it( 'can register icons', () => {
			registerIcon( 'foo', 'bar' );

			expect( useIcon( 'foo' ) ).to.equal( 'bar' );
		} );

		it( 'returns `useIcon` function', () => {
			const icon = registerIcon( 'foo', 'bar' );

			expect( icon() ).to.equal( useIcon( 'foo' ) );
		} );

		it( 'registers `CKEDITOR_ICONS` if it doesnt exist yet', () => {
			expect( globalThis.CKEDITOR_ICONS ).to.be.undefined;

			registerIcon( 'foo', 'bar' );

			expect( globalThis.CKEDITOR_ICONS ).to.deep.equal( { foo: 'bar' } );
		} );

		it( 'doesnt override existing icon by default', () => {
			registerIcon( 'foo', 'bar' );
			registerIcon( 'foo', 'baz' );

			expect( useIcon( 'foo' ) ).to.equal( 'bar' );
		} );

		it( 'overrides existing icon if `force` is set to `true`', () => {
			registerIcon( 'foo', 'bar' );
			registerIcon( 'foo', 'baz', true );

			expect( useIcon( 'foo' ) ).to.equal( 'baz' );
		} );
	} );

	describe( 'useIcon', () => {
		it( 'returns `undefined` if icon is not registered', () => {
			expect( useIcon( 'foo' ) ).to.be.undefined;
		} );

		it( 'returns icon value if icon is registered', () => {
			registerIcon( 'foo', 'bar' );

			expect( useIcon( 'foo' ) ).to.equal( 'bar' );
		} );
	} );
} );
