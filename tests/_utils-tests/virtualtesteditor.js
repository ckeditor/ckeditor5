/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Editor from '/ckeditor5/editor/editor.js';
import VirtualTestEditor from '/tests/ckeditor5/_utils/virtualtesteditor.js';
import VirtualEditingController from '/tests/ckeditor5/_utils/virtualeditingcontroller.js';
import HtmlDataProcessor from '/ckeditor5/engine/dataprocessor/htmldataprocessor.js';
import { getData, setData } from '/tests/engine/_utils/model.js';

describe( 'VirtualTestEditor', () => {
	describe( 'constructor', () => {
		it( 'creates an instance of editor', () => {
			const editor = new VirtualTestEditor( { foo: 1 } );

			expect( editor ).to.be.instanceof( Editor );
		} );

		it( 'sets necessary properties', () => {
			const editor = new VirtualTestEditor( { foo: 1 } );

			expect( editor.config.get( 'foo' ) ).to.equal( 1 );

			expect( editor.editing ).to.be.instanceof( VirtualEditingController );
			expect( editor.data.processor ).to.be.instanceof( HtmlDataProcessor );
		} );
	} );

	describe( 'setData', () => {
		let editor;

		beforeEach( () => {
			editor = new VirtualTestEditor();
			editor.document.schema.allow( { name: '$text', inside: '$root' } );
		} );

		it( 'should set data', () => {
			editor.document.createRoot();

			editor.setData( 'foo' );

			expect( getData( editor.document, { rootName: 'main', withoutSelection: true } ) ).to.equal( 'foo' );
		} );
	} );

	describe( 'getData', () => {
		let editor;

		beforeEach( () => {
			editor = new VirtualTestEditor();
			editor.document.schema.allow( { name: '$text', inside: '$root' } );
		} );

		it( 'should get data', () => {
			editor.document.createRoot();

			setData( editor.document, 'foo' );

			expect( editor.getData() ).to.equal( 'foo' );
		} );
	} );
} );
