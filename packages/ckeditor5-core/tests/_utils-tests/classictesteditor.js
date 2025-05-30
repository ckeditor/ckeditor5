/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Editor from '../../src/editor/editor.js';
import ClassicTestEditor from '../../tests/_utils/classictesteditor.js';

import Plugin from '../../src/plugin.js';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';

import EditorUI from '@ckeditor/ckeditor5-ui/src/editorui/editorui.js';
import BoxedEditorUIView from '@ckeditor/ckeditor5-ui/src/editorui/boxed/boxededitoruiview.js';
import InlineEditableUIView from '@ckeditor/ckeditor5-ui/src/editableui/inline/inlineeditableuiview.js';

import RootElement from '@ckeditor/ckeditor5-engine/src/model/rootelement.js';

import { getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import testUtils from '../../tests/_utils/utils.js';
import { assertCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { removeEditorBodyOrphans } from '../_utils/cleanup.js';

describe( 'ClassicTestEditor', () => {
	let editorElement;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );
	} );

	afterEach( () => {
		editorElement.remove();
	} );

	describe( 'constructor()', () => {
		it( 'creates an instance of editor', async () => {
			const editor = new ClassicTestEditor( editorElement, { foo: 1 } );

			expect( editor ).to.be.instanceof( Editor );
			expect( editor.config.get( 'foo' ) ).to.equal( 1 );
			expect( editor.sourceElement ).to.equal( editorElement );
			expect( editor.ui ).to.be.instanceOf( EditorUI );
			expect( editor.ui.view ).to.be.instanceOf( BoxedEditorUIView );
			expect( editor.data.processor ).to.be.instanceof( HtmlDataProcessor );

			editor.fire( 'ready' );
			await editor.destroy();
		} );

		it( 'creates the instance of the editable (without rendering)', async () => {
			const editor = new ClassicTestEditor( editorElement );

			expect( editor.ui.view.editable ).to.be.instanceOf( InlineEditableUIView );
			expect( editor.ui.view.editable.isRendered ).to.be.false;

			editor.fire( 'ready' );
			await editor.destroy();
		} );

		it( 'creates the #ui and ui#view (without rendering)', async () => {
			const editor = new ClassicTestEditor( editorElement );

			expect( editor.ui ).to.be.instanceOf( EditorUI );
			expect( editor.ui.view ).to.be.instanceOf( BoxedEditorUIView );
			expect( editor.ui.view.isRendered ).to.be.false;
			expect( editor.ui.getEditableElement() ).to.be.undefined;

			editor.fire( 'ready' );
			await editor.destroy();
		} );

		it( 'creates main root element', async () => {
			const editor = new ClassicTestEditor( editorElement );

			expect( editor.model.document.getRoot( 'main' ) ).to.instanceof( RootElement );

			editor.fire( 'ready' );
			await editor.destroy();
		} );

		it( 'mixes ElementApiMixin', () => {
			expect( ClassicTestEditor.prototype ).have.property( 'updateSourceElement' ).to.be.a( 'function' );
		} );
	} );

	describe( 'create()', () => {
		it( 'creates an instance of editor', () => {
			return ClassicTestEditor.create( editorElement, { foo: 1 } )
				.then( editor => {
					expect( editor ).to.be.instanceof( ClassicTestEditor );

					expect( editor.config.get( 'foo' ) ).to.equal( 1 );
					expect( editor.sourceElement ).to.equal( editorElement );

					return editor.destroy();
				} );
		} );

		it( 'renders the view including #editable and sets #editableElement', () => {
			return ClassicTestEditor.create( editorElement, { foo: 1 } )
				.then( editor => {
					const ui = editor.ui;
					const view = ui.view;

					expect( view.isRendered ).to.be.true;
					expect( ui.getEditableElement().tagName ).to.equal( 'DIV' );
					expect( ui.getEditableElement() ).to.equal( view.editable.element );
					expect( view.editable.name ).to.equal( 'main' );

					return editor.destroy();
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

					return editor.destroy();
				} );
		} );

		it( 'fires all events in the right order', () => {
			const fired = [];

			function spy( evt ) {
				fired.push( `${ evt.name }-${ evt.source.constructor.name.toLowerCase() }` );
			}

			class EventWatcher extends Plugin {
				init() {
					this.editor.ui.on( 'ready', spy );
					this.editor.data.on( 'ready', spy );
					this.editor.on( 'ready', spy );
				}
			}

			return ClassicTestEditor
				.create( editorElement, {
					plugins: [ EventWatcher ]
				} )
				.then( editor => {
					expect( fired ).to.deep.equal( [
						'ready-classictesteditorui',
						'ready-datacontroller',
						'ready-classictesteditor'
					] );

					return editor.destroy();
				} );
		} );

		it( 'sets proper states', () => {
			const baseEditor = new ClassicTestEditor();

			expect( baseEditor.state ).to.equal( 'initializing' );

			return ClassicTestEditor.create( editorElement ).then( editor => {
				expect( editor.state ).to.equal( 'ready' );

				return editor.destroy().then( () => {
					expect( editor.state ).to.equal( 'destroyed' );

					baseEditor.fire( 'ready' );
					return baseEditor.destroy();
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

		it( 'initializes the data controller with `config.initialData` if this option is provided', () => {
			return ClassicTestEditor.create( editorElement, { initialData: '<p>foo</p>', plugins: [ Paragraph ] } )
				.then( editor => {
					expect( editor.getData() ).to.equal( '<p>foo</p>' );

					return editor.destroy();
				} );
		} );

		it( 'initializes the data controller with an empty string if the `config.initialData` is not provided', () => {
			return ClassicTestEditor.create( editorElement )
				.then( editor => {
					expect( editor.getData() ).to.equal( '' );

					return editor.destroy();
				} );
		} );

		it( 'initializes the data controller with the data from the source element', () => {
			editorElement.innerHTML = '<p>foo</p>';

			return ClassicTestEditor.create( editorElement, { plugins: [ Paragraph ] } )
				.then( editor => {
					expect( editor.getData() ).to.equal( '<p>foo</p>' );

					return editor.destroy();
				} );
		} );

		it( 'initializes the data controller with the data from the first argument if it is a string', () => {
			return ClassicTestEditor.create( '<p>foo</p>', { plugins: [ Paragraph ] } )
				.then( editor => {
					expect( editor.getData() ).to.equal( '<p>foo</p>' );

					return editor.destroy();
				} );
		} );

		it( 'throws when the data is passed from as the first argument and as a `config.initialData` at the same time', () => {
			return ClassicTestEditor.create( '<p>foo</p>', { initialData: '<p>bar</p>' } )
				.then( () => {
					throw new Error( 'It should throw an error' );
				}, err => {
					assertCKEditorError( err, 'editor-create-initial-data', null );
					removeEditorBodyOrphans();
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
					expect( editor.sourceElement.style.display ).to.equal( 'none' );

					return editor.destroy()
						.then( () => {
							expect( editor.sourceElement.style.display ).to.equal( '' );
						} );
				} );
		} );

		it( 'should call parent EditorUI#destroy() first before destroying the view', async () => {
			const newEditor = await ClassicTestEditor.create( editorElement, { foo: 1 } );
			const parentEditorUIPrototype = Object.getPrototypeOf( newEditor.ui.constructor.prototype );

			const parentDestroySpy = testUtils.sinon.spy( parentEditorUIPrototype, 'destroy' );
			const viewDestroySpy = testUtils.sinon.spy( newEditor.ui.view, 'destroy' );

			await newEditor.destroy();

			sinon.assert.callOrder( parentDestroySpy, viewDestroySpy );
		} );
	} );
} );
