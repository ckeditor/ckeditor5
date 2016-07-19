/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import StandardEditor from '/ckeditor5/editor/standardeditor.js';
import VirtualTestEditor from '/tests/ckeditor5/_utils/virtualtesteditor.js';
import HtmlDataProcessor from '/ckeditor5/engine/dataprocessor/htmldataprocessor.js';

import testUtils from '/tests/ckeditor5/_utils/utils.js';

testUtils.createSinonSandbox();

describe( 'VirtualTestEditor', () => {
	describe( 'constructor', () => {
		it( 'creates an instance of editor', () => {
			const editor = new VirtualTestEditor( { foo: 1 } );

			expect( editor ).to.be.instanceof( StandardEditor );

			expect( editor.config.get( 'foo' ) ).to.equal( 1 );
		} );

		it( 'creates model and view roots', () => {
			const editor = new VirtualTestEditor( { foo: 1 } );

			expect( editor.document.getRoot() ).to.have.property( 'name', '$root' );
			expect( editor.editing.view.getRoot() ).to.have.property( 'name', 'div' );
			expect( editor.data.processor ).to.be.instanceof( HtmlDataProcessor );
		} );
	} );

	describe( 'create', () => {
		it( 'creates an instance of editor', () => {
			return VirtualTestEditor.create( { foo: 1 } )
				.then( editor => {
					expect( editor ).to.be.instanceof( VirtualTestEditor );

					expect( editor.config.get( 'foo' ) ).to.equal( 1 );
				} );
		} );
	} );
} );
