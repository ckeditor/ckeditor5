/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Editor from '../../src/editor/editor';
import VirtualTestEditor from '../../tests/_utils/virtualtesteditor';

import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import DataApiMixin from '../../src/editor/utils/dataapimixin';
import RootElement from '@ckeditor/ckeditor5-engine/src/model/rootelement';

import testUtils from '../../tests/_utils/utils';

testUtils.createSinonSandbox();

describe( 'VirtualTestEditor', () => {
	describe( 'constructor()', () => {
		it( 'creates an instance of editor', () => {
			const editor = new VirtualTestEditor( { foo: 1 } );

			expect( editor ).to.be.instanceof( Editor );
			expect( editor.data.processor ).to.be.instanceof( HtmlDataProcessor );
			expect( editor.config.get( 'foo' ) ).to.equal( 1 );
		} );

		it( 'creates main root element', () => {
			const editor = new VirtualTestEditor();

			expect( editor.model.document.getRoot( 'main' ) ).to.instanceof( RootElement );
		} );

		it( 'mixes DataApiMixin', () => {
			expect( testUtils.isMixed( VirtualTestEditor, DataApiMixin ) ).to.true;
		} );
	} );
} );
