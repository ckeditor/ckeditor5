/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import InlineEditor from '../src/inlineeditor.js';
import InlineEditorUI from '../src/inlineeditorui.js';
import InlineEditorUIView from '../src/inlineeditoruiview.js';

import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor.js';

import Context from '@ckeditor/ckeditor5-core/src/context.js';
import EditorWatchdog from '@ckeditor/ckeditor5-watchdog/src/editorwatchdog.js';
import ContextWatchdog from '@ckeditor/ckeditor5-watchdog/src/contextwatchdog.js';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import RootElement from '@ckeditor/ckeditor5-engine/src/model/rootelement.js';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { describeMemoryUsage, testMemoryUsage } from '@ckeditor/ckeditor5-core/tests/_utils/memory.js';
import { assertCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror.js';

describe( 'InlineEditor', () => {
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
			editor = new InlineEditor( editorElement );
		} );

		it( 'it\'s possible to extract editor name from editor instance', () => {
			expect( Object.getPrototypeOf( editor ).constructor.editorName ).to.be.equal( 'InlineEditor' );
		} );

		it( 'creates the UI using BoxedEditorUI classes', () => {
			expect( editor.ui ).to.be.instanceof( InlineEditorUI );
			expect( editor.ui.view ).to.be.instanceof( InlineEditorUIView );
		} );

		it( 'uses HTMLDataProcessor', () => {
			expect( editor.data.processor ).to.be.instanceof( HtmlDataProcessor );
		} );

		it( 'mixes ElementApiMixin', () => {
			expect( InlineEditor.prototype ).have.property( 'updateSourceElement' ).to.be.a( 'function' );
		} );

		it( 'creates main root element', () => {
			expect( editor.model.document.getRoot( 'main' ) ).to.instanceof( RootElement );
		} );

		it( 'should have undefined the #sourceElement if editor was initialized with data', () => {
			return InlineEditor.create( '<p>Hello world!</p>', {
				plugins: [ Paragraph ]
			} ).then( editor => {
				expect( editor.sourceElement ).to.be.undefined;

				return editor.destroy();
			} );
		} );

		it( 'editor.ui.element should contain the whole editor (with UI) element', () => {
			return InlineEditor.create( '<p>Hello world!</p>', {
				plugins: [ Paragraph ]
			} ).then( editor => {
				expect( editor.editing.view.getDomRoot() ).to.equal( editor.ui.element );

				return editor.destroy();
			} );
		} );

		// See: https://github.com/ckeditor/ckeditor5/issues/746
		it( 'should throw when trying to create the editor using the same source element more than once', done => {
			InlineEditor.create( editorElement )
				.then(
					() => {
						expect.fail( 'Inline editor should not initialize on an element already used by other instance.' );
					},
					err => {
						assertCKEditorError( err, 'editor-source-element-already-used' );
					}
				)
				.then( done )
				.catch( done );
		} );

		describe( 'config.initialData', () => {
			it( 'if not set, is set using DOM element data', () => {
				const editorElement = document.createElement( 'div' );
				editorElement.innerHTML = '<p>Foo</p>';

				const editor = new InlineEditor( editorElement );

				expect( editor.config.get( 'initialData' ) ).to.equal( '<p>Foo</p>' );
			} );

			it( 'if not set, is set using data passed in constructor', () => {
				const editor = new InlineEditor( '<p>Foo</p>' );

				expect( editor.config.get( 'initialData' ) ).to.equal( '<p>Foo</p>' );
			} );

			it( 'if set, is not overwritten with DOM element data', () => {
				const editorElement = document.createElement( 'div' );
				editorElement.innerHTML = '<p>Foo</p>';

				const editor = new InlineEditor( editorElement, { initialData: '<p>Bar</p>' } );

				expect( editor.config.get( 'initialData' ) ).to.equal( '<p>Bar</p>' );
			} );

			it( 'it should throw if config.initialData is set and initial data is passed in constructor', () => {
				expect( () => {
					// eslint-disable-next-line no-new
					new InlineEditor( '<p>Foo</p>', { initialData: '<p>Bar</p>' } );
				} ).to.throw( CKEditorError, 'editor-create-initial-data' );
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

		afterEach( async () => {
			if ( editor.state !== 'destroyed' ) {
				await editor.destroy();
			}
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
			const editorElement = document.createElement( 'div' );
			editorElement.innerHTML = '<p><strong>foo</strong> bar</p>';

			// Just being safe with `builtinPlugins` static property.
			class CustomInlineEditor extends InlineEditor {}
			CustomInlineEditor.builtinPlugins = [ Paragraph, Bold ];

			return CustomInlineEditor.create( editorElement )
				.then( newEditor => {
					expect( newEditor.getData() ).to.equal( '<p><strong>foo</strong> bar</p>' );

					return newEditor.destroy();
				} )
				.then( () => {
					editorElement.remove();
				} );
		} );

		it( 'allows to pass data to the constructor', () => {
			return InlineEditor.create( '<p>Hello world!</p>', {
				plugins: [ Paragraph ]
			} ).then( editor => {
				expect( editor.getData() ).to.equal( '<p>Hello world!</p>' );

				return editor.destroy();
			} );
		} );

		it( 'initializes with config.initialData', () => {
			const editorElement = document.createElement( 'div' );
			editorElement.innerHTML = '<p>Hello world!</p>';

			return InlineEditor.create( editorElement, {
				initialData: '<p>Hello world!</p>',
				plugins: [ Paragraph ]
			} ).then( editor => {
				expect( editor.getData() ).to.equal( '<p>Hello world!</p>' );

				return editor.destroy();
			} ).then( () => {
				editorElement.remove();
			} );
		} );

		// https://github.com/ckeditor/ckeditor5/issues/8974
		it( 'initializes with empty content if config.initialData is set to an empty string', () => {
			const editorElement = document.createElement( 'div' );
			editorElement.innerHTML = '<p>Hello world!</p>';

			return InlineEditor.create( editorElement, {
				initialData: '',
				plugins: [ Paragraph ]
			} ).then( editor => {
				expect( editor.getData() ).to.equal( '' );

				return editor.destroy();
			} ).then( () => {
				editorElement.remove();
			} );
		} );

		it( 'should pass the config.toolbar.shouldNotGroupWhenFull configuration to the view', () => {
			const editorElement = document.createElement( 'div' );

			return InlineEditor.create( editorElement, {
				toolbar: {
					shouldNotGroupWhenFull: true
				}
			} ).then( editor => {
				expect( editor.ui.view.toolbar.options.shouldGroupWhenFull ).to.be.false;

				return editor.destroy();
			} ).then( () => {
				editorElement.remove();
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

		it( 'throws an error when is initialized in textarea', done => {
			InlineEditor.create( document.createElement( 'textarea' ) )
				.then(
					() => {
						expect.fail( 'Inline editor should throw an error when is initialized in textarea.' );
					},
					err => {
						assertCKEditorError( err, 'editor-wrong-element', null );
					}
				)
				.then( done )
				.catch( done );
		} );

		describe( 'configurable editor label (aria-label)', () => {
			it( 'should be set to the defaut value if not configured', () => {
				expect( editor.editing.view.getDomRoot().getAttribute( 'aria-label' ) ).to.equal(
					'Rich Text Editor. Editing area: main'
				);
			} );

			it( 'should support the string format', async () => {
				await editor.destroy();

				editor = await InlineEditor.create( editorElement, {
					plugins: [ Paragraph, Bold ],
					label: 'Custom label'
				} );

				expect( editor.editing.view.getDomRoot().getAttribute( 'aria-label' ) ).to.equal(
					'Custom label'
				);
			} );

			it( 'should support object format', async () => {
				await editor.destroy();

				editor = await InlineEditor.create( editorElement, {
					plugins: [ Paragraph, Bold ],
					label: {
						main: 'Custom label'
					}
				} );

				expect( editor.editing.view.getDomRoot().getAttribute( 'aria-label' ) ).to.equal(
					'Custom label'
				);
			} );

			it( 'should keep an existing value from the source DOM element', async () => {
				await editor.destroy();

				editorElement.setAttribute( 'aria-label', 'Pre-existing value' );
				editor = await InlineEditor.create( editorElement, {
					plugins: [ Paragraph, Bold ]
				} );

				expect( editor.editing.view.getDomRoot().getAttribute( 'aria-label' ), 'Keep value' ).to.equal(
					'Pre-existing value'
				);

				await editor.destroy();

				expect( editorElement.getAttribute( 'aria-label' ), 'Restore value' ).to.equal( 'Pre-existing value' );
			} );

			it( 'should override the existing value from the source DOM element', async () => {
				await editor.destroy();

				editorElement.setAttribute( 'aria-label', 'Pre-existing value' );
				editor = await InlineEditor.create( editorElement, {
					plugins: [ Paragraph, Bold ],
					label: 'Custom label'
				} );

				expect( editor.editing.view.getDomRoot().getAttribute( 'aria-label' ), 'Override value' ).to.equal(
					'Custom label'
				);

				await editor.destroy();

				expect( editorElement.getAttribute( 'aria-label' ), 'Restore value' ).to.equal( 'Pre-existing value' );
			} );

			it( 'should use default label when creating an editor from initial data rather than a DOM element', async () => {
				await editor.destroy();

				editor = await InlineEditor.create( '<p>Initial data</p>', {
					plugins: [ Paragraph, Bold ]
				} );

				expect( editor.editing.view.getDomRoot().getAttribute( 'aria-label' ), 'Override value' ).to.equal(
					'Rich Text Editor. Editing area: main'
				);

				await editor.destroy();
			} );

			it( 'should set custom label when creating an editor from initial data rather than a DOM element', async () => {
				await editor.destroy();

				editor = await InlineEditor.create( '<p>Initial data</p>', {
					plugins: [ Paragraph, Bold ],
					label: 'Custom label'
				} );

				expect( editor.editing.view.getDomRoot().getAttribute( 'aria-label' ), 'Override value' ).to.equal(
					'Custom label'
				);

				await editor.destroy();
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

					schema.register( 'heading', {
						allowIn: '$root',
						allowChildren: '$text'
					} );

					editor.conversion.for( 'upcast' ).elementToElement( { model: 'heading', view: 'heading' } );
					editor.conversion.for( 'dataDowncast' ).elementToElement( { model: 'heading', view: 'heading' } );
					editor.conversion.for( 'editingDowncast' ).elementToElement( {
						model: 'heading',
						view: 'heading-editing-representation'
					} );
				} );
		} );

		// We don't update the source element by default, so after destroy, it should contain the data
		// from the editing pipeline.
		it( 'don\'t set the data back to the editor element', () => {
			editor.setData( '<p>a</p><heading>b</heading>' );

			return editor.destroy()
				.then( () => {
					expect( editorElement.innerHTML ).to.equal( '' );
				} );
		} );

		// Adding `updateSourceElementOnDestroy` config to the editor allows setting the data
		// back to the source element after destroy.
		it( 'sets the data back to the editor element', () => {
			editor.config.set( 'updateSourceElementOnDestroy', true );
			editor.setData( '<p>a</p><heading>b</heading>' );

			return editor.destroy()
				.then( () => {
					expect( editorElement.innerHTML )
						.to.equal( '<p>a</p><heading>b</heading>' );
				} );
		} );

		it( 'should not throw an error if editor was initialized with the data', async () => {
			await editor.destroy();

			return InlineEditor
				.create( '<p>Foo.</p>', {
					plugins: [ Paragraph, Bold ]
				} )
				.then( newEditor => newEditor.destroy() );
		} );
	} );

	describe( 'static fields', () => {
		it( 'InlineEditor.Context', () => {
			expect( InlineEditor.Context ).to.equal( Context );
		} );

		it( 'InlineEditor.EditorWatchdog', () => {
			expect( InlineEditor.EditorWatchdog ).to.equal( EditorWatchdog );
		} );

		it( 'InlineEditor.ContextWatchdog', () => {
			expect( InlineEditor.ContextWatchdog ).to.equal( ContextWatchdog );
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
						toolbar: [ 'imageStyle:block', 'imageStyle:wrapText', '|', 'imageTextAlternative' ]
					}
				} ) );
	} );
} );
