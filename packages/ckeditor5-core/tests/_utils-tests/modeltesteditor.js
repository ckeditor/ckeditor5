/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Editor from '../../src/editor/editor';
import EditingController from '@ckeditor/ckeditor5-engine/src/controller/editingcontroller';
import ModelTestEditor from '../../tests/_utils/modeltesteditor';

import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import DataApiMixin from '../../src/editor/utils/dataapimixin';
import RootElement from '@ckeditor/ckeditor5-engine/src/model/rootelement';

import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import testUtils from '../../tests/_utils/utils';

describe( 'ModelTestEditor', () => {
	testUtils.createSinonSandbox();

	describe( 'constructor()', () => {
		it( 'creates an instance of editor', () => {
			const editor = new ModelTestEditor( { foo: 1 } );

			expect( editor ).to.be.instanceof( Editor );
			expect( editor.config.get( 'foo' ) ).to.equal( 1 );
			expect( editor.data.processor ).to.be.instanceof( HtmlDataProcessor );
		} );

		it( 'should disable editing pipeline', () => {
			const spy = sinon.spy( EditingController.prototype, 'destroy' );

			return ModelTestEditor.create( { foo: 1 } ).then( editor => {
				sinon.assert.calledOnce( spy );

				spy.restore();

				return editor.destroy();
			} );
		} );

		it( 'creates main root element', () => {
			const editor = new ModelTestEditor();

			expect( editor.model.document.getRoot( 'main' ) ).to.instanceof( RootElement );
		} );

		it( 'mixes DataApiMixin', () => {
			expect( testUtils.isMixed( ModelTestEditor, DataApiMixin ) ).to.true;
		} );
	} );

	describe( 'setData', () => {
		let editor;

		beforeEach( () => {
			return ModelTestEditor.create()
				.then( newEditor => {
					editor = newEditor;

					editor.model.schema.extend( '$text', { allowIn: '$root' } );
				} );
		} );

		it( 'should set data of the first root', () => {
			editor.model.document.createRoot( '$root', 'secondRoot' );

			editor.setData( 'foo' );

			expect( getData( editor.model, { rootName: 'main', withoutSelection: true } ) ).to.equal( 'foo' );
		} );
	} );

	describe( 'getData', () => {
		let editor;

		beforeEach( () => {
			return ModelTestEditor.create()
				.then( newEditor => {
					editor = newEditor;

					editor.model.schema.extend( '$text', { allowIn: '$root' } );
				} );
		} );

		it( 'should set data of the first root', () => {
			setData( editor.model, 'foo' );

			expect( editor.getData() ).to.equal( 'foo' );
		} );
	} );
} );
