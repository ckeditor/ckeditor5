/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document, Event */

import InlineEditorUI from '../src/inlineeditorui';
import InlineEditorUIView from '../src/inlineeditoruiview';

import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';

import InlineEditor from '../src/inlineeditor';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import DataApiMixin from '@ckeditor/ckeditor5-core/src/editor/utils/dataapimixin';
import ElementApiMixin from '@ckeditor/ckeditor5-core/src/editor/utils/elementapimixin';
import RootElement from '@ckeditor/ckeditor5-engine/src/model/rootelement';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import log from '@ckeditor/ckeditor5-utils/src/log';

import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import { describeMemoryUsage, testMemoryUsage } from '@ckeditor/ckeditor5-core/tests/_utils/memory';

describe( 'InlineEditor', () => {
	let editor, editorElement;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		editorElement.innerHTML = '<p><strong>foo</strong> bar</p>';

		document.body.appendChild( editorElement );

		testUtils.sinon.stub( log, 'warn' ).callsFake( () => {} );
	} );

	afterEach( () => {
		editorElement.remove();
	} );

	describe( 'constructor()', () => {
		beforeEach( () => {
			editor = new InlineEditor( editorElement );
		} );

		it( 'creates the UI using BoxedEditorUI classes', () => {
			expect( editor.ui ).to.be.instanceof( InlineEditorUI );
			expect( editor.ui.view ).to.be.instanceof( InlineEditorUIView );
		} );

		it( 'uses HTMLDataProcessor', () => {
			expect( editor.data.processor ).to.be.instanceof( HtmlDataProcessor );
		} );

		it( 'has a Data Interface', () => {
			expect( testUtils.isMixed( InlineEditor, DataApiMixin ) ).to.be.true;
		} );

		it( 'has a Element Interface', () => {
			expect( testUtils.isMixed( InlineEditor, ElementApiMixin ) ).to.be.true;
		} );

		it( 'creates main root element', () => {
			expect( editor.model.document.getRoot( 'main' ) ).to.instanceof( RootElement );
		} );

		it( 'handles form element', () => {
			const form = document.createElement( 'form' );
			const textarea = document.createElement( 'textarea' );
			form.appendChild( textarea );
			document.body.appendChild( form );

			// Prevents page realods in Firefox ;|
			form.addEventListener( 'submit', evt => {
				evt.preventDefault();
			} );

			return InlineEditor.create( textarea, {
				plugins: [ Paragraph ]
			} ).then( editor => {
				expect( textarea.value ).to.equal( '' );

				editor.setData( '<p>Foo</p>' );

				form.dispatchEvent( new Event( 'submit', {
					// We need to be able to do preventDefault() to prevent page reloads in Firefox.
					cancelable: true
				} ) );

				expect( textarea.value ).to.equal( '<p>Foo</p>' );

				return editor.destroy().then( () => {
					form.remove();
				} );
			} );
		} );

		it( 'should have undefined the #sourceElement if editor was initialized with data', () => {
			return InlineEditor.create( '<p>Hello world!</p>', {
				plugins: [ Paragraph ]
			} ).then( editor => {
				expect( editor.sourceElement ).to.be.undefined;
			} );
		} );

		it( 'editor.ui.element should contain the whole editor (with UI) element', () => {
			return InlineEditor.create( '<p>Hello world!</p>', {
				plugins: [ Paragraph ]
			} ).then( editor => {
				expect( editor.editing.view.getDomRoot() ).to.equal( editor.ui.element );
			} );
		} );
	} );

	describe( 'create()', () => {
		beforeEach( function() {
			return InlineEditor
				.create( editorElement, {
					plugins: [ Paragraph, Bold ]
				} )
				.then( newEditor => {
					editor = newEditor;
				} );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'creates an instance which inherits from the InlineEditor', () => {
			expect( editor ).to.be.instanceof( InlineEditor );
		} );

		it( 'creates element–less UI view', () => {
			expect( editor.ui.view.element ).to.be.null;
		} );

		it( 'attaches editable UI as view\'s DOM root', () => {
			expect( editor.editing.view.getDomRoot() ).to.equal( editor.ui.view.editable.element );
		} );

		it( 'loads data from the editor element', () => {
			expect( editor.getData() ).to.equal( '<p><strong>foo</strong> bar</p>' );
		} );

		it( 'should not require config object', () => {
			// Just being safe with `builtinPlugins` static property.
			class CustomInlineEditor extends InlineEditor {}
			CustomInlineEditor.builtinPlugins = [ Paragraph, Bold ];

			return CustomInlineEditor.create( editorElement )
				.then( newEditor => {
					expect( newEditor.getData() ).to.equal( '<p><strong>foo</strong> bar</p>' );

					return newEditor.destroy();
				} );
		} );

		it( 'allows to pass data to the constructor', () => {
			return InlineEditor.create( '<p>Hello world!</p>', {
				plugins: [ Paragraph ]
			} ).then( editor => {
				expect( editor.getData() ).to.equal( '<p>Hello world!</p>' );

				editor.destroy();
			} );
		} );

		it( 'initializes with config.initialData', () => {
			return InlineEditor.create( editorElement, {
				initialData: '<p>Hello world!</p>',
				plugins: [ Paragraph ]
			} ).then( editor => {
				expect( editor.getData() ).to.equal( '<p>Hello world!</p>' );

				editor.destroy();
			} );
		} );

		it( 'throws if initial data is passed in Editor#create and config.initialData is also used', done => {
			InlineEditor.create( '<p>Hello world!</p>', {
				initialData: '<p>I am evil!</p>',
				plugins: [ Paragraph ]
			} ).catch( () => {
				done();
			} );
		} );

		// #25
		it( 'creates an instance of a InlineEditor child class', () => {
			// Fun fact: Remove the next 3 lines and you'll get a lovely inf loop due to two
			// editor being initialized on one element.
			const editorElement = document.createElement( 'div' );
			editorElement.innerHTML = '<p><strong>foo</strong> bar</p>';

			document.body.appendChild( editorElement );

			class CustomInlineEditor extends InlineEditor {}

			return CustomInlineEditor
				.create( editorElement, {
					plugins: [ Paragraph, Bold ]
				} )
				.then( newEditor => {
					expect( newEditor ).to.be.instanceof( CustomInlineEditor );
					expect( newEditor ).to.be.instanceof( InlineEditor );

					expect( newEditor.getData() ).to.equal( '<p><strong>foo</strong> bar</p>' );

					editorElement.remove();

					return newEditor.destroy();
				} );
		} );
	} );

	describe( 'create - events', () => {
		afterEach( () => {
			return editor.destroy();
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

			return InlineEditor
				.create( editorElement, {
					plugins: [ EventWatcher ]
				} )
				.then( newEditor => {
					expect( fired ).to.deep.equal( [
						'ready-inlineeditorui', 'ready-datacontroller', 'ready-inlineeditor' ] );

					editor = newEditor;
				} );
		} );

		it( 'fires ready once UI is ready', () => {
			let isReady;

			class EventWatcher extends Plugin {
				init() {
					this.editor.ui.on( 'ready', () => {
						isReady = this.editor.ui.view.isRendered;
					} );
				}
			}

			return InlineEditor
				.create( editorElement, {
					plugins: [ EventWatcher ]
				} )
				.then( newEditor => {
					expect( isReady ).to.be.true;

					editor = newEditor;
				} );
		} );
	} );

	describe( 'destroy', () => {
		beforeEach( function() {
			return InlineEditor
				.create( editorElement, { plugins: [ Paragraph ] } )
				.then( newEditor => {
					editor = newEditor;

					const schema = editor.model.schema;

					schema.register( 'heading' );
					schema.extend( 'heading', { allowIn: '$root' } );
					schema.extend( '$text', { allowIn: 'heading' } );

					editor.conversion.for( 'upcast' ).elementToElement( { model: 'heading', view: 'heading' } );
					editor.conversion.for( 'dataDowncast' ).elementToElement( { model: 'heading', view: 'heading' } );
					editor.conversion.for( 'editingDowncast' ).elementToElement( {
						model: 'heading',
						view: 'heading-editing-representation'
					} );
				} );
		} );

		it( 'sets the data back to the editor element', () => {
			editor.setData( '<p>a</p><heading>b</heading>' );

			return editor.destroy()
				.then( () => {
					expect( editorElement.innerHTML )
						.to.equal( '<p>a</p><heading>b</heading>' );
				} );
		} );

		it( 'should not throw an error if editor was initialized with the data', () => {
			return InlineEditor
				.create( '<p>Foo.</p>', {
					plugins: [ Paragraph, Bold ]
				} )
				.then( newEditor => newEditor.destroy() );
		} );
	} );

	describeMemoryUsage( () => {
		testMemoryUsage(
			'should not grow on multiple create/destroy',
			() => InlineEditor
				.create( document.querySelector( '#mem-editor' ), {
					plugins: [ ArticlePluginSet ],
					toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote' ],
					image: {
						toolbar: [ 'imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative' ]
					}
				} ) );
	} );
} );
