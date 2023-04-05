/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, Event, console */

import ClassicEditor from '../src/classiceditor';
import ClassicEditorUI from '../src/classiceditorui';
import ClassicEditorUIView from '../src/classiceditoruiview';

import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';

import Context from '@ckeditor/ckeditor5-core/src/context';
import EditorWatchdog from '@ckeditor/ckeditor5-watchdog/src/editorwatchdog';
import ContextWatchdog from '@ckeditor/ckeditor5-watchdog/src/contextwatchdog';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import RootElement from '@ckeditor/ckeditor5-engine/src/model/rootelement';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import { describeMemoryUsage, testMemoryUsage } from '@ckeditor/ckeditor5-core/tests/_utils/memory';

describe( 'ClassicEditor', () => {
	let editor, editorElement;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		editorElement.innerHTML = '<p><strong>foo</strong> bar</p>';

		document.body.appendChild( editorElement );

		testUtils.sinon.stub( console, 'warn' ).callsFake( () => {} );
	} );

	afterEach( () => {
		editorElement.remove();
	} );

	describe( 'constructor()', () => {
		beforeEach( () => {
			editor = new ClassicEditor( editorElement );
		} );

		it( 'uses HTMLDataProcessor', () => {
			expect( editor.data.processor ).to.be.instanceof( HtmlDataProcessor );
		} );

		it( 'mixes DataApiMixin', () => {
			expect( ClassicEditor.prototype ).have.property( 'setData' ).to.be.a( 'function' );
			expect( ClassicEditor.prototype ).have.property( 'getData' ).to.be.a( 'function' );
		} );

		it( 'mixes ElementApiMixin', () => {
			expect( ClassicEditor.prototype ).have.property( 'updateSourceElement' ).to.be.a( 'function' );
		} );

		it( 'creates main root element', () => {
			expect( editor.model.document.getRoot( 'main' ) ).to.instanceof( RootElement );
		} );

		it( 'contains the source element as #sourceElement property', () => {
			expect( editor.sourceElement ).to.equal( editorElement );
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

		describe( 'config.initialData', () => {
			it( 'if not set, is set using DOM element data', () => {
				const editorElement = document.createElement( 'div' );
				editorElement.innerHTML = '<p>Foo</p>';

				const editor = new ClassicEditor( editorElement );

				expect( editor.config.get( 'initialData' ) ).to.equal( '<p>Foo</p>' );
			} );

			it( 'if not set, is set using data passed in constructor', () => {
				const editor = new ClassicEditor( '<p>Foo</p>' );

				expect( editor.config.get( 'initialData' ) ).to.equal( '<p>Foo</p>' );
			} );

			it( 'if set, is not overwritten with DOM element data', () => {
				const editorElement = document.createElement( 'div' );
				editorElement.innerHTML = '<p>Foo</p>';

				const editor = new ClassicEditor( editorElement, { initialData: '<p>Bar</p>' } );

				expect( editor.config.get( 'initialData' ) ).to.equal( '<p>Bar</p>' );
			} );

			it( 'it should throw if config.initialData is set and initial data is passed in constructor', () => {
				expect( () => {
					// eslint-disable-next-line no-new
					new ClassicEditor( '<p>Foo</p>', { initialData: '<p>Bar</p>' } );
				} ).to.throw( CKEditorError, 'editor-create-initial-data' );
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
			class CustomClassicEditor extends ClassicEditor {}

			return CustomClassicEditor
				.create( editorElement, {
					plugins: [ Paragraph, Bold ]
				} )
				.then( newEditor => {
					expect( newEditor ).to.be.instanceof( CustomClassicEditor );
					expect( newEditor ).to.be.instanceof( ClassicEditor );

					expect( newEditor.getData() ).to.equal( '<p><strong>foo</strong> bar</p>' );

					return newEditor.destroy();
				} );
		} );

		it( 'should not require config object', () => {
			// Just being safe with `builtinPlugins` static property.
			class CustomClassicEditor extends ClassicEditor {}
			CustomClassicEditor.builtinPlugins = [ Paragraph, Bold ];

			return CustomClassicEditor.create( editorElement )
				.then( newEditor => {
					expect( newEditor.getData() ).to.equal( '<p><strong>foo</strong> bar</p>' );

					return newEditor.destroy();
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
			return ClassicEditor.create( editorElement, {
				initialData: '<p>Hello world!</p>',
				plugins: [ Paragraph ]
			} ).then( editor => {
				expect( editor.getData() ).to.equal( '<p>Hello world!</p>' );

				editor.destroy();
			} );
		} );

		// https://github.com/ckeditor/ckeditor5/issues/8974
		it( 'initializes with empty content if config.initialData is set to an empty string', () => {
			return ClassicEditor.create( editorElement, {
				initialData: '',
				plugins: [ Paragraph ]
			} ).then( editor => {
				expect( editor.getData() ).to.equal( '' );

				editor.destroy();
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

		it( 'don\'t set the data back to the editor element', () => {
			editor.setData( '<p>foo</p>' );

			return editor.destroy()
				.then( () => {
					expect( editorElement.innerHTML ).to.equal( '' );
				} );
		} );

		// Adding `updateSourceElementOnDestroy` config to the editor allows setting the data
		// back to the source element after destroy.
		it( 'sets the data back to the editor element', () => {
			editor.config.set( 'updateSourceElementOnDestroy', true );
			editor.setData( '<p>foo</p>' );

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

	describe( 'static fields', () => {
		it( 'ClassicEditor.Context', () => {
			expect( ClassicEditor.Context ).to.equal( Context );
		} );

		it( 'ClassicEditor.EditorWatchdog', () => {
			expect( ClassicEditor.EditorWatchdog ).to.equal( EditorWatchdog );
		} );

		it( 'ClassicEditor.ContextWatchdog', () => {
			expect( ClassicEditor.ContextWatchdog ).to.equal( ContextWatchdog );
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
						toolbar: [ 'imageStyle:block', 'imageStyle:side', '|', 'imageTextAlternative' ]
					}
				} ) );
	} );
} );
