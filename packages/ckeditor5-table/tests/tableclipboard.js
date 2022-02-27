/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
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
		it( 'should be a named plugin', () => {
			expect( editor.plugins.get( 'TableClipboard' ) ).to.be.instanceOf( TableClipboard );
		} );

		it( 'requires TableSelection plugins and utilities', () => {
			expect( editor.plugins.has( TableSelection ) ).to.be.true;
			expect( editor.plugins.has( TableUtils ) ).to.be.true;
		} );
	} );
} );
