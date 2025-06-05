/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';

import ListFormatting from '../src/listformatting.js';
import ListItemFontFamilyIntegration from '../src/listformatting/listitemfontfamilyintegration.js';

describe( 'ListFormatting', () => {
	let editor;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ ListFormatting ]
		} );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( ListFormatting.pluginName ).to.equal( 'ListFormatting' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ListFormatting.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ListFormatting.isPremiumPlugin ).to.be.false;
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ListFormatting ) ).to.be.instanceOf( ListFormatting );
	} );

	it( 'should require integration plugins', () => {
		expect( ListFormatting.requires ).to.deep.equal( [
			ListItemFontFamilyIntegration
		] );
	} );
} );
