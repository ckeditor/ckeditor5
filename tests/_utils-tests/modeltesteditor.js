/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Editor from '/ckeditor5/editor/editor.js';
import ModelTestEditor from '/tests/ckeditor5/_utils/modeltesteditor.js';
import HtmlDataProcessor from '/ckeditor5/engine/dataprocessor/htmldataprocessor.js';
import { getData, setData } from '/tests/engine/_utils/model.js';

import testUtils from '/tests/ckeditor5/_utils/utils.js';

testUtils.createSinonSandbox();

describe( 'ModelTestEditor', () => {
	describe( 'constructor', () => {
		it( 'creates an instance of editor', () => {
			const editor = new ModelTestEditor( { foo: 1 } );

			expect( editor ).to.be.instanceof( Editor );

			expect( editor.config.get( 'foo' ) ).to.equal( 1 );
		} );

		it( 'creates model and view roots', () => {
			const editor = new ModelTestEditor( { foo: 1 } );

			expect( editor.document.getRoot() ).to.have.property( 'name', '$root' );
			expect( editor.data.processor ).to.be.instanceof( HtmlDataProcessor );
		} );
	} );

	describe( 'create', () => {
		it( 'creates an instance of editor', () => {
			return ModelTestEditor.create( { foo: 1 } )
				.then( editor => {
					expect( editor ).to.be.instanceof( ModelTestEditor );

					expect( editor.config.get( 'foo' ) ).to.equal( 1 );
				} );
		} );
	} );

	describe( 'setData', () => {
		let editor;

		beforeEach( () => {
			return ModelTestEditor.create()
				.then( newEditor => {
					editor = newEditor;

					editor.document.schema.allow( { name: '$text', inside: '$root' } );
				} );
		} );

		it( 'should set data of the first root', () => {
			editor.document.createRoot( '$root', 'secondRoot' );

			editor.setData( 'foo' );

			expect( getData( editor.document, { rootName: 'main', withoutSelection: true } ) ).to.equal( 'foo' );
		} );
	} );

	describe( 'getData', () => {
		let editor;

		beforeEach( () => {
			return ModelTestEditor.create()
				.then( newEditor => {
					editor = newEditor;

					editor.document.schema.allow( { name: '$text', inside: '$root' } );
				} );
		} );

		it( 'should set data of the first root', () => {
			setData( editor.document, 'foo' );

			expect( editor.getData() ).to.equal( 'foo' );
		} );
	} );
} );
