/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import Editor from '../../src/editor/editor';
import ClassicTestEditor from '../../tests/_utils/classictesteditor';

import Plugin from '../../src/plugin';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';

import EditorUI from '../../src/editor/editorui';
import BoxedEditorUIView from '@ckeditor/ckeditor5-ui/src/editorui/boxed/boxededitoruiview';
import InlineEditableUIView from '@ckeditor/ckeditor5-ui/src/editableui/inline/inlineeditableuiview';

import DataApiMixin from '../../src/editor/utils/dataapimixin';
import ElementApiMixin from '../../src/editor/utils/elementapimixin';
import RootElement from '@ckeditor/ckeditor5-engine/src/model/rootelement';

import { getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import testUtils from '../../tests/_utils/utils';

testUtils.createSinonSandbox();

describe( 'ClassicTestEditor', () => {
	let editorElement;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );
	} );

	describe( 'constructor()', () => {
		it( 'creates an instance of editor', () => {
			const editor = new ClassicTestEditor( editorElement, { foo: 1 } );

			expect( editor ).to.be.instanceof( Editor );
			expect( editor.config.get( 'foo' ) ).to.equal( 1 );
			expect( editor.element ).to.equal( editorElement );
			expect( editor.ui ).to.be.instanceOf( EditorUI );
			expect( editor.ui.view ).to.be.instanceOf( BoxedEditorUIView );
			expect( editor.data.processor ).to.be.instanceof( HtmlDataProcessor );
		} );

		it( 'creates editable DOM', () => {
			const editor = new ClassicTestEditor( editorElement );

			expect( editor.ui.view.editable ).to.be.instanceOf( InlineEditableUIView );

			expect( editor.ui.view.editableElement.tagName ).to.equal( 'DIV' );
			expect( editor.ui.view.editableElement ).to.equal( editor.ui.view.editable.element );
		} );

		it( 'creates main root element', () => {
			const editor = new ClassicTestEditor( editorElement );

			expect( editor.model.document.getRoot( 'main' ) ).to.instanceof( RootElement );
		} );

		it( 'mixes DataApiMixin', () => {
			expect( testUtils.isMixed( ClassicTestEditor, DataApiMixin ) ).to.true;
		} );

		it( 'mixes ElementApiMixin', () => {
			expect( testUtils.isMixed( ClassicTestEditor, ElementApiMixin ) ).to.true;
		} );
	} );

	describe( 'create()', () => {
		it( 'creates an instance of editor', () => {
			return ClassicTestEditor.create( editorElement, { foo: 1 } )
				.then( editor => {
					expect( editor ).to.be.instanceof( ClassicTestEditor );

					expect( editor.config.get( 'foo' ) ).to.equal( 1 );
					expect( editor ).to.have.property( 'element', editorElement );
				} );
		} );

		it( 'creates and initializes the UI', () => {
			return ClassicTestEditor.create( editorElement, { foo: 1 } )
				.then( editor => {
					expect( editor.ui ).to.be.instanceOf( EditorUI );
					expect( editor.ui.view ).to.be.instanceOf( BoxedEditorUIView );
				} );
		} );

		it( 'loads data from the editor element', () => {
			editorElement.innerHTML = 'foo';

			class PluginTextInRoot extends Plugin {
				init() {
					this.editor.model.schema.extend( '$text', { allowIn: '$root' } );
				}
			}

			return ClassicTestEditor.create( editorElement, { plugins: [ PluginTextInRoot ] } )
				.then( editor => {
					expect( getData( editor.model, { withoutSelection: true } ) ).to.equal( 'foo' );
				} );
		} );

		it( 'fires all events in the right order', () => {
			const fired = [];

			function spy( evt ) {
				fired.push( evt.name );
			}

			class EventWatcher extends Plugin {
				init() {
					this.editor.on( 'pluginsReady', spy );
					this.editor.on( 'uiReady', spy );
					this.editor.on( 'dataReady', spy );
					this.editor.on( 'ready', spy );
				}
			}

			return ClassicTestEditor
				.create( editorElement, {
					plugins: [ EventWatcher ]
				} )
				.then( editor => {
					expect( fired ).to.deep.equal( [ 'pluginsReady', 'uiReady', 'dataReady', 'ready' ] );

					return editor.destroy();
				} );
		} );

		it( 'sets proper states', () => {
			const editor = new ClassicTestEditor();

			expect( editor.state ).to.equal( 'initializing' );

			return ClassicTestEditor.create( editorElement ).then( editor => {
				expect( editor.state ).to.equal( 'ready' );

				return editor.destroy().then( () => {
					expect( editor.state ).to.equal( 'destroyed' );
				} );
			} );
		} );

		it( 'inserts editor UI next to editor element', () => {
			return ClassicTestEditor.create( editorElement )
				.then( editor => {
					expect( editor.ui.view.element.previousSibling ).to.equal( editorElement );

					return editor.destroy();
				} );
		} );

		it( 'attaches editable UI as view\'s DOM root', () => {
			return ClassicTestEditor.create( editorElement )
				.then( editor => {
					expect( editor.editing.view.getDomRoot() ).to.equal( editor.ui.view.editable.element );

					return editor.destroy();
				} );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'destroys UI and calls super.destroy()', () => {
			return ClassicTestEditor.create( editorElement, { foo: 1 } )
				.then( editor => {
					const superSpy = testUtils.sinon.spy( Editor.prototype, 'destroy' );
					const uiSpy = sinon.spy( editor.ui, 'destroy' );

					return editor.destroy()
						.then( () => {
							expect( superSpy.calledOnce ).to.be.true;
							expect( uiSpy.calledOnce ).to.be.true;
						} );
				} );
		} );

		it( 'restores the editor element', () => {
			return ClassicTestEditor.create( editorElement, { foo: 1 } )
				.then( editor => {
					expect( editor.element.style.display ).to.equal( 'none' );

					return editor.destroy()
						.then( () => {
							expect( editor.element.style.display ).to.equal( '' );
						} );
				} );
		} );
	} );
} );
