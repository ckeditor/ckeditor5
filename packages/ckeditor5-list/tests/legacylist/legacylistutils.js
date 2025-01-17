/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import LegacyListUtils from '../../src/legacylist/legacylistutils.js';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';

describe( 'LegacyListUtils', () => {
	let editor, plugin;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ LegacyListUtils ]
		} );
		plugin = editor.plugins.get( 'LegacyListUtils' );
	} );

	it( 'should be named', () => {
		expect( LegacyListUtils.pluginName ).to.equal( 'LegacyListUtils' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( LegacyListUtils.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( LegacyListUtils.isPremiumPlugin ).to.be.false;
	} );

	describe( 'coverage checks', () => {
		it( 'getListTypeFromListStyleType', () => {
			const mock = 'mock';
			expect( plugin.getListTypeFromListStyleType( mock ) ).to.equal( null );
		} );

		it( 'getSelectedListItems', () => {
			expect( plugin.getSelectedListItems( editor.model ) ).to.be.an( 'array' );
		} );

		it( 'getSiblingNodes', () => {
			const position = editor.model.createPositionAt( editor.model.document.getRoot(), 0 );
			expect( plugin.getSiblingNodes( position, 'forward' ) ).to.be.an( 'array' );
		} );
	} );
} );
