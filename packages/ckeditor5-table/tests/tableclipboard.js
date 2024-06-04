/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import ClipboardPipeline from '@ckeditor/ckeditor5-clipboard/src/clipboardpipeline.js';

import TableSelection from '../src/tableselection.js';
import TableUtils from '../src/tableutils.js';

import TableClipboard from '../src/tableclipboard.js';

describe( 'table clipboard', () => {
	let editor;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ TableClipboard, Paragraph, ClipboardPipeline ]
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
