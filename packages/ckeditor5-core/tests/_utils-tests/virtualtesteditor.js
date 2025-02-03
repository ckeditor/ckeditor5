/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Editor from '../../src/editor/editor.js';
import VirtualTestEditor from '../../tests/_utils/virtualtesteditor.js';

import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor.js';
import RootElement from '@ckeditor/ckeditor5-engine/src/model/rootelement.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';

import testUtils from '../../tests/_utils/utils.js';

describe( 'VirtualTestEditor', () => {
	testUtils.createSinonSandbox();

	describe( 'constructor()', () => {
		it( 'creates an instance of editor', async () => {
			const editor = new VirtualTestEditor( { foo: 1 } );

			expect( editor ).to.be.instanceof( Editor );
			expect( editor.data.processor ).to.be.instanceof( HtmlDataProcessor );
			expect( editor.config.get( 'foo' ) ).to.equal( 1 );

			editor.fire( 'ready' );
			await editor.destroy();
		} );

		it( 'creates main root element', async () => {
			const editor = new VirtualTestEditor();

			expect( editor.model.document.getRoot( 'main' ) ).to.instanceof( RootElement );

			editor.fire( 'ready' );
			await editor.destroy();
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
