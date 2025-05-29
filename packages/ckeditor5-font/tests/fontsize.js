/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import FontSize from './../src/fontsize.js';
import FontSizeEditing from './../src/fontsize/fontsizeediting.js';
import FontSizeUI from './../src/fontsize/fontsizeui.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';

describe( 'FontSize', () => {
	let element, editor;

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, {
			plugins: [ FontSize ]
		} );
	} );

	afterEach( async () => {
		await editor.destroy();

		document.body.removeChild( element );

		sinon.restore();
	} );

	it( 'requires FontSizeEditing & FontSizeUI', () => {
		expect( FontSize.requires ).to.deep.equal( [ FontSizeEditing, FontSizeUI ] );
	} );

	it( 'defines plugin name', () => {
		expect( FontSize.pluginName ).to.equal( 'FontSize' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( FontSize.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( FontSize.isPremiumPlugin ).to.be.false;
	} );

	describe( 'normalizeSizeOptions()', () => {
		// More tests can be found in tests/fontsize/utils.
		it( 'normalizes size options', () => {
			const fontSize = editor.plugins.get( FontSize );

			const result = fontSize.normalizeSizeOptions( [ 'tiny', 'small', 'default', 'big', 'huge' ] );

			expect( result ).to.deep.equal( [
				{ title: 'Tiny', model: 'tiny', view: { name: 'span', classes: 'text-tiny', priority: 7 } },
				{ title: 'Small', model: 'small', view: { name: 'span', classes: 'text-small', priority: 7 } },
				{ title: 'Default', model: undefined },
				{ title: 'Big', model: 'big', view: { name: 'span', classes: 'text-big', priority: 7 } },
				{ title: 'Huge', model: 'huge', view: { name: 'span', classes: 'text-huge', priority: 7 } }
			] );
		} );
	} );
} );
