/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import DocumentListUtils from '../../src/documentlist/documentlistutils';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';

describe( 'DocumentListUtils', () => {
	let editor, plugin;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ DocumentListUtils ]
		} );
		plugin = editor.plugins.get( 'DocumentListUtils' );
	} );

	it( 'should be named', () => {
		expect( DocumentListUtils.pluginName ).to.equal( 'DocumentListUtils' );
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
	} );
} );
