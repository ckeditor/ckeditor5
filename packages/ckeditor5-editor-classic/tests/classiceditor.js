/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, Event, console */

import ClassicEditorUI from '../src/classiceditorui';
import ClassicEditorUIView from '../src/classiceditoruiview';

import ClassicEditor from '../src/classiceditor';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import DataApiMixin from '@ckeditor/ckeditor5-core/src/editor/utils/dataapimixin';
import ElementApiMixin from '@ckeditor/ckeditor5-core/src/editor/utils/elementapimixin';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import { describeMemoryUsage, testMemoryUsage } from '@ckeditor/ckeditor5-core/tests/_utils/memory';
import { removeEditorBodyOrphans } from '@ckeditor/ckeditor5-core/tests/_utils/cleanup';

describe( 'ClassicEditor', () => {
	let editor, editorElement;

	testUtils.createSinonSandbox();

	function createElement() {
		const el = document.createElement( 'div' );
		el.innerHTML = '<p><strong>foo</strong> bar</p>';

		document.body.appendChild( el );

		return el;
	}

	beforeEach( () => {
		editorElement = createElement();
		testUtils.sinon.stub( console, 'warn' ).callsFake( () => {} );
	} );

	afterEach( () => {
		editorElement.remove();
	} );

	describe( 'constructor()', () => {
		beforeEach( () => {
			editor = new ClassicEditor( editorElement );
		} );

		it( 'has a Data Interface', () => {
			expect( testUtils.isMixed( ClassicEditor, DataApiMixin ) ).to.true;
		} );

		it( 'has a Element Interface', () => {
			expect( testUtils.isMixed( ClassicEditor, ElementApiMixin ) ).to.true;
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

			return ClassicEditor.create( textarea, {
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

		describe( 'ui', () => {
			it( 'creates the UI using BoxedEditorUI classes', () => {
				expect( editor.ui ).to.be.instanceof( ClassicEditorUI );
				expect( editor.ui.view ).to.be.instanceof( ClassicEditorUIView );
			} );

			describe( 'automatic toolbar items groupping', () => {
				it( 'should be on by default', () => {
					const editorElement = document.createElement( 'div' );
					const editor = new ClassicEditor( editorElement );

					expect( editor.ui.view.toolbar.options.shouldGroupWhenFull ).to.be.true;

					editorElement.remove();
				} );

				it( 'can be disabled using config.toolbar.shouldNotGroupWhenFull', () => {
					const editorElement = document.createElement( 'div' );
					const editor = new ClassicEditor( editorElement, {
						toolbar: {
							shouldNotGroupWhenFull: true
						}
					} );

					expect( editor.ui.view.toolbar.options.shouldGroupWhenFull ).to.be.false;

					editorElement.remove();
				} );
			} );
		} );
	} );

	describe( 'create()', () => {
		beforeEach( () => {
			return ClassicEditor
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

		it( 'creates an instance which inherits from the ClassicEditor', () => {
			expect( editor ).to.be.instanceof( ClassicEditor );
		} );

		it( 'loads data from the editor element', () => {
			expect( editor.getData() ).to.equal( '<p><strong>foo</strong> bar</p>' );
		} );

		// #53
		it( 'creates an instance of a ClassicEditor child class', () => {
			const element = createElement();
			class CustomClassicEditor extends ClassicEditor {}

			return CustomClassicEditor
				.create( element, {
					plugins: [ Paragraph, Bold ]
				} )
				.then( newEditor => {
					expect( newEditor ).to.be.instanceof( CustomClassicEditor );
					expect( newEditor ).to.be.instanceof( ClassicEditor );

					expect( newEditor.getData() ).to.equal( '<p><strong>foo</strong> bar</p>' );

					return newEditor.destroy().then( () => element.remove() );
				} );
		} );

		it( 'should not require config object', () => {
			const element = createElement();
			// Just being safe with `builtinPlugins` static property.
			class CustomClassicEditor extends ClassicEditor {}
			CustomClassicEditor.builtinPlugins = [ Paragraph, Bold ];

			return CustomClassicEditor.create( element )
				.then( newEditor => {
					expect( newEditor.getData() ).to.equal( '<p><strong>foo</strong> bar</p>' );

					return newEditor.destroy().then( () => element.remove() );
				} );
		} );

		it( 'allows to pass data to the constructor', () => {
			return ClassicEditor.create( '<p>Hello world!</p>', {
				plugins: [ Paragraph ]
			} ).then( editor => {
				expect( editor.getData() ).to.equal( '<p>Hello world!</p>' );

				editor.destroy();
			} );
		} );

		it( 'initializes with config.initialData', () => {
			const element = createElement();
			return ClassicEditor.create( element, {
				initialData: '<p>Hello world!</p>',
				plugins: [ Paragraph ]
			} ).then( editor => {
				expect( editor.getData() ).to.equal( '<p>Hello world!</p>' );

				return editor.destroy().then( () => element.remove() );
			} );
		} );

		it( 'throws if initial data is passed in Editor#create and config.initialData is also used', done => {
			ClassicEditor.create( '<p>Hello world!</p>', {
				initialData: '<p>I am evil!</p>',
				plugins: [ Paragraph ]
			} ).catch( () => {
				removeEditorBodyOrphans();
				done();
			} );
		} );

		it( 'should have undefined the #sourceElement if editor was initialized with data', () => {
			return ClassicEditor
				.create( '<p>Foo.</p>', {
					plugins: [ Paragraph, Bold ]
				} )
				.then( newEditor => {
					expect( newEditor.sourceElement ).to.be.undefined;

					return newEditor.destroy();
				} );
		} );

		describe( 'ui', () => {
			it( 'inserts editor UI next to editor element', () => {
				expect( editor.ui.view.element.previousSibling ).to.equal( editorElement );
			} );

			it( 'attaches editable UI as view\'s DOM root', () => {
				expect( editor.editing.view.getDomRoot() ).to.equal( editor.ui.view.editable.element );
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

			return ClassicEditor
				.create( editorElement, {
					plugins: [ EventWatcher ]
				} )
				.then( newEditor => {
					expect( fired ).to.deep.equal(
						[ 'ready-classiceditorui', 'ready-datacontroller', 'ready-classiceditor' ] );

					editor = newEditor;
				} );
		} );

		it( 'fires ready once UI is rendered', () => {
			let isReady;

			class EventWatcher extends Plugin {
				init() {
					this.editor.ui.on( 'ready', () => {
						isReady = this.editor.ui.view.isRendered;
					} );
				}
			}

			return ClassicEditor
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
			return ClassicEditor
				.create( editorElement, { plugins: [ Paragraph ] } )
				.then( newEditor => {
					editor = newEditor;
				} );
		} );

		it( 'sets the data back to the editor element', () => {
			editor.setData( '<p>foo</p>' );

			expect( editor.sourceElement ).to.equal( editorElement );

			return editor.destroy()
				.then( () => {
					expect( editorElement.innerHTML ).to.equal( '<p>foo</p>' );
				} );
		} );

		it( 'does not update the source element if editor was initialized with data', async () => {
			await editor.destroy();

			return ClassicEditor
				.create( '<p>Foo.</p>', {
					plugins: [ Paragraph, Bold ]
				} )
				.then( newEditor => {
					const spy = sinon.stub( newEditor, 'updateSourceElement' );

					return newEditor.destroy()
						.then( () => {
							expect( spy.called ).to.be.false;

							spy.restore();
						} );
				} );
		} );

		it( 'restores the editor element', () => {
			expect( editor.sourceElement.style.display ).to.equal( 'none' );

			return editor.destroy()
				.then( () => {
					expect( editor.sourceElement.style.display ).to.equal( '' );
				} );
		} );
	} );

	describeMemoryUsage( () => {
		testMemoryUsage(
			'should not grow on multiple create/destroy',
			() => ClassicEditor
				.create( document.querySelector( '#mem-editor' ), {
					plugins: [ ArticlePluginSet ],
					toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote' ],
					image: {
						toolbar: [ 'imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative' ]
					}
				} ) );
	} );
} );
