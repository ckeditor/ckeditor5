/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ListStylesUI from '../src/liststylesui';

describe( 'ListStylesUI', () => {
	it( 'should be named', () => {
		expect( ListStylesUI.pluginName ).to.equal( 'ListStylesUI' );
	} );

	describe( 'init()', () => {
		it( 'returns null', () => {
			const plugin = new ListStylesUI( {} );

			expect( plugin.init() ).to.equal( null );
		} );
	} );
} );
