/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import TableSelection from '../src/tableselection';
import TableUtils from '../src/tableutils';

import TableClipboard from '../src/tableclipboard';

describe( 'table clipboard', () => {
	let editor;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ TableClipboard, Paragraph ]
		} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'TableClipboard', () => {
		it( 'should have pluginName', () => {
			expect( TableClipboard.pluginName ).to.equal( 'TableClipboard' );
		} );

		it( 'requires TableSelection and TableUtils ', () => {
			expect( TableClipboard.requires ).to.deep.equal( [ TableSelection, TableUtils ] );
		} );
	} );
} );
