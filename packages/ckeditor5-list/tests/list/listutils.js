/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
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
