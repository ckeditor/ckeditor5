/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Editor from '../../src/editor/editor';
import VirtualTestEditor from '../../tests/_utils/virtualtesteditor';

import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import RootElement from '@ckeditor/ckeditor5-engine/src/model/rootelement';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import testUtils from '../../tests/_utils/utils';

describe( 'VirtualTestEditor', () => {
	testUtils.createSinonSandbox();

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
			expect( VirtualTestEditor.prototype ).have.property( 'setData' ).to.be.a( 'function' );
			expect( VirtualTestEditor.prototype ).have.property( 'getData' ).to.be.a( 'function' );
		} );
	} );

	describe( 'static create()', () => {
		it( 'initializes the data controller with the `config.initialData`', () => {
			return VirtualTestEditor.create( { initialData: '<p>foo</p>', plugins: [ Paragraph ] } )
				.then( editor => {
					expect( editor.getData() ).to.equal( '<p>foo</p>' );

					return editor.destroy();
				} );
		} );

		it( 'initializes the data controller with an empty string if the `config.initialData` is not provided', () => {
			return VirtualTestEditor.create()
				.then( editor => {
					expect( editor.getData() ).to.equal( '' );

					return editor.destroy();
				} );
		} );

		it( 'fires the `data#ready` event once', () => {
			const dataReadySpy = sinon.spy();

			const Plugin = function( editor ) {
				editor.data.on( 'ready', dataReadySpy );
			};

			return VirtualTestEditor.create( { plugins: [ Plugin ] } )
				.then( editor => {
					sinon.assert.calledOnce( dataReadySpy );

					return editor.destroy();
				} );
		} );
	} );
} );
