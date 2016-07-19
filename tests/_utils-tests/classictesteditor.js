/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import StandardEditor from '/ckeditor5/editor/standardeditor.js';
import ClassicTestEditor from '/tests/ckeditor5/_utils/classictesteditor.js';
import HtmlDataProcessor from '/ckeditor5/engine/dataprocessor/htmldataprocessor.js';
import BoxedEditorUI from '/ckeditor5/ui/editorui/boxed/boxededitorui.js';
import Feature from '/ckeditor5/feature.js';

import { getData } from '/tests/engine/_utils/model.js';
import testUtils from '/tests/ckeditor5/_utils/utils.js';

testUtils.createSinonSandbox();

describe( 'ClassicTestEditor', () => {
	let editorElement;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );
	} );

	describe( 'constructor', () => {
		it( 'creates an instance of editor', () => {
			const editor = new ClassicTestEditor( editorElement, { foo: 1 } );

			expect( editor ).to.be.instanceof( StandardEditor );

			expect( editor.config.get( 'foo' ) ).to.equal( 1 );
			expect( editor ).to.have.property( 'element', editorElement );
		} );

		it( 'creates model and view roots', () => {
			const editor = new ClassicTestEditor( { foo: 1 } );

			expect( editor.document.getRoot() ).to.have.property( 'name', '$root' );
			expect( editor.editing.view.getRoot() ).to.have.property( 'name', 'div' );
			expect( editor.data.processor ).to.be.instanceof( HtmlDataProcessor );
		} );
	} );

	describe( 'create', () => {
		it( 'creates an instance of editor', () => {
			return ClassicTestEditor.create( editorElement, { foo: 1 } )
				.then( editor => {
					expect( editor ).to.be.instanceof( ClassicTestEditor );

					expect( editor.config.get( 'foo' ) ).to.equal( 1 );
					expect( editor ).to.have.property( 'element', editorElement );
				} );
		} );

		it( 'creates and initilizes the UI', () => {
			return ClassicTestEditor.create( editorElement, { foo: 1 } )
				.then( editor => {
					expect( editor.ui ).to.be.instanceof( BoxedEditorUI );
				} );
		} );

		it( 'loads data from the editor element', () => {
			editorElement.innerHTML = 'foo';

			class FeatureTextInRoot extends Feature {
				init() {
					this.editor.document.schema.allow( { name: '$text', inside: '$root' } );
				}
			}

			return ClassicTestEditor.create( editorElement, { features: [ FeatureTextInRoot ] } )
				.then( editor => {
					expect( getData( editor.document, { withoutSelection: true } ) ).to.equal( 'foo' );
				} );
		} );
	} );

	describe( 'destroy', () => {
		it( 'destroys UI and calls super.destroy()', () => {
			return ClassicTestEditor.create( editorElement, { foo: 1 } )
				.then( editor => {
					const superSpy = testUtils.sinon.spy( StandardEditor.prototype, 'destroy' );
					const uiSpy = sinon.spy( editor.ui, 'destroy' );

					return editor.destroy()
						.then( () => {
							expect( superSpy.calledOnce ).to.be.true;
							expect( uiSpy.calledOnce ).to.be.true;
						} );
				} );
		} );
	} );
} );
