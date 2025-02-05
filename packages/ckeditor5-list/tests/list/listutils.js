/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ListUtils from '../../src/list/listutils.js';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';

describe( 'ListUtils', () => {
	let editor, plugin;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ ListUtils ]
		} );
		plugin = editor.plugins.get( 'ListUtils' );
	} );

	it( 'should be named', () => {
		expect( ListUtils.pluginName ).to.equal( 'ListUtils' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ListUtils.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ListUtils.isPremiumPlugin ).to.be.false;
	} );

	describe( 'coverage checks', () => {
		it( 'isFirstBlockOfListItem', () => {
			const mock = { getAttribute: () => false };
			expect( plugin.isFirstBlockOfListItem( mock ) ).to.be.true;
		} );

		it( 'expandListBlocksToCompleteList', () => {
			const mock = [];
			expect( plugin.expandListBlocksToCompleteList( mock ) ).to.be.an( 'array' );
		} );

		it( 'isListItemBlock', () => {
			const mock = false;
			expect( plugin.isListItemBlock( mock ) ).to.be.false;
		} );

		it( 'expandListBlocksToCompleteItems', () => {
			const mock = [];
			expect( plugin.expandListBlocksToCompleteItems( mock ) ).to.be.an( 'array' );
		} );
	} );
} );
