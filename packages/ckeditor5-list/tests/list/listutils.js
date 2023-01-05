/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ListUtils from '../../src/list/listutils';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';

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
