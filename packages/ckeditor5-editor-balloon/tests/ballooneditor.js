/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { BalloonEditor } from '../src/ballooneditor.js';
import { BalloonEditorUI } from '../src/ballooneditorui.js';
import { BalloonEditorUIView } from '../src/ballooneditoruiview.js';

import { HtmlDataProcessor, ModelRootElement } from '@ckeditor/ckeditor5-engine';

import { Plugin, Context, ElementApiMixin } from '@ckeditor/ckeditor5-core';
import { EditorWatchdog, ContextWatchdog } from '@ckeditor/ckeditor5-watchdog';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Bold } from '@ckeditor/ckeditor5-basic-styles';
import { BalloonToolbar } from '@ckeditor/ckeditor5-ui';

import { testUtils } from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import { assertCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { CKEditorError } from '@ckeditor/ckeditor5-utils';

describe( 'BalloonEditor', () => {
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
			editor = new BalloonEditor( editorElement, {
				plugins: [ BalloonToolbar, Bold ],
				toolbar: [ 'Bold' ]
			} );
		} );

		afterEach( async () => {
			editor.fire( 'ready' );
			await editor.destroy();
		} );

		it( 'it\'s possible to extract editor name from editor instance', () => {
			expect( Object.getPrototypeOf( editor ).constructor.editorName ).to.be.equal( 'BalloonEditor' );
		} );

		it( 'pushes BalloonToolbar to the list of plugins', () => {
			expect( editor.config.get( 'plugins' ) ).to.include( BalloonToolbar );
		} );

		it( 'pipes config#toolbar to config#balloonToolbar', () => {
			expect( editor.config.get( 'balloonToolbar' ) ).to.have.members( [ 'Bold' ] );
		} );

		it( 'uses HTMLDataProcessor', () => {
			expect( editor.data.processor ).to.be.instanceof( HtmlDataProcessor );
		} );

		it( 'has a Element Interface', () => {
			testUtils.isMixed( BalloonEditor, ElementApiMixin );
		} );

		it( 'creates main root element', () => {
			expect( editor.model.document.getRoot( 'main' ) ).to.instanceof( ModelRootElement );
		} );

		it( 'should have undefined the #sourceElement if editor was initialized with data', () => {
			return BalloonEditor
				.create( '<p>Foo.</p>', {
					plugins: [ Paragraph, Bold ]
				} )
				.then( newEditor => {
					expect( newEditor.sourceElement ).to.be.undefined;

					return newEditor.destroy();
				} );
		} );

		// See: https://github.com/ckeditor/ckeditor5/issues/746
		it( 'should throw when trying to create the editor using the same source element more than once', done => {
			BalloonEditor.create( editorElement )
				.then(
					() => {
						expect.fail( 'Balloon editor should not initialize on an element already used by other instance.' );
					},
					err => {
						assertCKEditorError( err, 'editor-source-element-already-used' );
					}
				)
				.then( done )
				.catch( done );
		} );

		describe( 'config.roots.main.initialData', () => {
			it( 'if not set, is set using DOM element data', async () => {
				const editorElement = document.createElement( 'div' );
				editorElement.innerHTML = '<p>Foo</p>';

				const editor = new BalloonEditor( editorElement );

				expect( editor.config.get( 'roots.main.initialData' ) ).to.equal( '<p>Foo</p>' );

				editor.fire( 'ready' );
				await editor.destroy();
			} );

			it( 'if not set, is set using data passed in constructor', async () => {
				const editor = new BalloonEditor( '<p>Foo</p>' );

				expect( editor.config.get( 'roots.main.initialData' ) ).to.equal( '<p>Foo</p>' );

				editor.fire( 'ready' );
				await editor.destroy();
			} );

			it( 'if set, is not overwritten with DOM element data', async () => {
				const editorElement = document.createElement( 'div' );
				editorElement.innerHTML = '<p>Foo</p>';

				const editor = new BalloonEditor( editorElement, { initialData: '<p>Bar</p>' } );

				expect( editor.config.get( 'roots.main.initialData' ) ).to.equal( '<p>Bar</p>' );

				editor.fire( 'ready' );
				await editor.destroy();
			} );

			it( 'it should throw if config.initialData is set and initial data is passed in constructor', () => {
				expect( () => {
					// eslint-disable-next-line no-new
					new BalloonEditor( '<p>Foo</p>', { initialData: '<p>Bar</p>' } );
				} ).to.throw( CKEditorError, 'editor-create-initial-data' );
			} );

			it( 'it should throw if config.root.initialData is set and initial data is passed in constructor', () => {
				expect( () => {
					// eslint-disable-next-line no-new
					new BalloonEditor( '<p>Foo</p>', { root: { initialData: '<p>Bar</p>' } } );
				} ).to.throw( CKEditorError, 'editor-create-initial-data' );
			} );

			it( 'it should throw if config.roots.main.initialData is set and initial data is passed in constructor', () => {
				expect( () => {
					// eslint-disable-next-line no-new
					new BalloonEditor( '<p>Foo</p>', { roots: { main: { initialData: '<p>Bar</p>' } } } );
				} ).to.throw( CKEditorError, 'editor-create-initial-data' );
			} );

			it( 'it should throw if config.root and config.roots.main is set', () => {
				const editorElement = document.createElement( 'div' );
				editorElement.innerHTML = '<p>Foo</p>';

				expect( () => {
					// eslint-disable-next-line no-new
					new BalloonEditor( editorElement, {
						root: { initialData: '<p>abc</p>' },
						roots: { main: { initialData: '<p>Bar</p>' } }
					} );
				} ).to.throw( CKEditorError, 'editor-create-roots-initial-data' );
			} );

			it( 'it should throw if config.initialData and config.root.initialData is set', () => {
				const editorElement = document.createElement( 'div' );
				editorElement.innerHTML = '<p>Foo</p>';

				expect( () => {
					// eslint-disable-next-line no-new
					new BalloonEditor( editorElement, {
						initialData: '<p>abc</p>',
						root: { initialData: '<p>abc</p>' }
					} );
				} ).to.throw( CKEditorError, 'editor-create-roots-initial-data' );
			} );

			it( 'it should throw if config.initialData and config.roots.main.initialData is set', () => {
				const editorElement = document.createElement( 'div' );
				editorElement.innerHTML = '<p>Foo</p>';

				expect( () => {
					// eslint-disable-next-line no-new
					new BalloonEditor( editorElement, {
						initialData: '<p>abc</p>',
						roots: { main: { initialData: '<p>abc</p>' } }
					} );
				} ).to.throw( CKEditorError, 'editor-create-roots-initial-data' );
			} );
		} );

		describe( 'config-only constructor', () => {
			it( 'should create editor with config.root.initialData', async () => {
				const editor = new BalloonEditor( {
					root: {
						initialData: '<p>Foo</p>'
					}
				} );

				expect( editor.config.get( 'roots.main.initialData' ) ).to.equal( '<p>Foo</p>' );

				editor.fire( 'ready' );
				await editor.destroy();
			} );

			it( 'should create editor with config.root.element', async () => {
				const el = document.createElement( 'div' );
				el.innerHTML = '<p>Bar</p>';

				const editor = new BalloonEditor( {
					root: {
						element: el
					}
				} );

				expect( editor.sourceElement ).to.equal( el );
				expect( editor.config.get( 'roots.main.initialData' ) ).to.equal( '<p>Bar</p>' );

				editor.fire( 'ready' );
				await editor.destroy();
			} );

			it( 'should create editor with config.root.element and initialData', async () => {
				const el = document.createElement( 'div' );
				el.innerHTML = '<p>Foo</p>';

				const editor = new BalloonEditor( {
					root: {
						element: el,
						initialData: '<p>Bar</p>'
					}
				} );

				expect( editor.sourceElement ).to.equal( el );
				expect( editor.config.get( 'roots.main.initialData' ) ).to.equal( '<p>Bar</p>' );

				editor.fire( 'ready' );
				await editor.destroy();
			} );

			it( 'should prefer legacy source data string over config.root.element for initialData extraction', async () => {
				const el = document.createElement( 'div' );
				el.innerHTML = '<p>from element</p>';

				const editor = new BalloonEditor( '<p>from source</p>', {
					root: {
						element: el
					}
				} );

				expect( editor.sourceElement ).to.equal( el );
				expect( editor.config.get( 'roots.main.initialData' ) ).to.equal( '<p>from source</p>' );

				editor.fire( 'ready' );
				await editor.destroy();
			} );

			it( 'should prefer config.root.element over legacy source element for initialData extraction', async () => {
				const sourceEl = document.createElement( 'div' );
				sourceEl.innerHTML = '<p>from source element</p>';

				const configEl = document.createElement( 'div' );
				configEl.innerHTML = '<p>from config element</p>';

				const editor = new BalloonEditor( sourceEl, {
					root: {
						element: configEl
					}
				} );

				expect( editor.sourceElement ).to.equal( configEl );
				expect( editor.config.get( 'roots.main.initialData' ) ).to.equal( '<p>from config element</p>' );

				editor.fire( 'ready' );
				await editor.destroy();
			} );

			it( 'should log warning when config.attachTo is set', async () => {
				const el = document.createElement( 'div' );

				const editor = new BalloonEditor( {
					attachTo: el,
					root: {
						initialData: '<p>Foo</p>'
					}
				} );

				sinon.assert.calledWithMatch( console.warn, 'editor-create-attachto-ignored' );

				editor.fire( 'ready' );
				await editor.destroy();
			} );

			it( 'should throw when config.root.element is a textarea', () => {
				expect( () => {
					// eslint-disable-next-line no-new
					new BalloonEditor( {
						root: {
							element: document.createElement( 'textarea' )
						}
					} );
				} ).to.throw( CKEditorError, 'editor-wrong-element' );
			} );
		} );
	} );

	describe( 'create()', () => {
		beforeEach( function() {
			return BalloonEditor
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

		it( 'creates an instance which inherits from the BalloonEditor', () => {
			expect( editor ).to.be.instanceof( BalloonEditor );
		} );

		it( 'creates element–less UI view', () => {
			expect( editor.ui.view.element ).to.be.null;
		} );

		it( 'attaches editable UI as view\'s DOM root', () => {
			const domRoot = editor.editing.view.getDomRoot();

			expect( domRoot ).to.equal( editor.ui.view.editable.element );
		} );

		it( 'creates the UI using BalloonEditorUI classes', () => {
			expect( editor.ui ).to.be.instanceof( BalloonEditorUI );
			expect( editor.ui.view ).to.be.instanceof( BalloonEditorUIView );
		} );

		it( 'loads data from the editor element', () => {
			expect( editor.getData() ).to.equal( '<p><strong>foo</strong> bar</p>' );
		} );

		it( 'should not require config object', () => {
			const editorElement = document.createElement( 'div' );
			editorElement.innerHTML = '<p><strong>foo</strong> bar</p>';

			// Just being safe with `builtinPlugins` static property.
			class CustomBalloonEditor extends BalloonEditor {}
			CustomBalloonEditor.builtinPlugins = [ Paragraph, Bold ];

			return CustomBalloonEditor.create( editorElement )
				.then( newEditor => {
					expect( newEditor.getData() ).to.equal( '<p><strong>foo</strong> bar</p>' );

					return newEditor.destroy();
				} )
				.then( () => {
					editorElement.remove();
				} );
		} );

		it( 'allows to pass data to the constructor', () => {
			return BalloonEditor.create( '<p>Hello world!</p>', {
				plugins: [ Paragraph ]
			} ).then( editor => {
				expect( editor.getData() ).to.equal( '<p>Hello world!</p>' );

				editor.destroy();
			} );
		} );

		it( 'initializes with config.initialData', () => {
			const editorElement = document.createElement( 'div' );
			editorElement.innerHTML = '<p><strong>foo</strong> bar</p>';

			return BalloonEditor.create( editorElement, {
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
			editorElement.innerHTML = '<p><strong>foo</strong> bar</p>';

			return BalloonEditor.create( editorElement, {
				initialData: '',
				plugins: [ Paragraph ]
			} ).then( editor => {
				expect( editor.getData() ).to.equal( '' );

				return editor.destroy();
			} ).then( () => {
				editorElement.remove();
			} );
		} );

		// ckeditor/ckeditor5-editor-classic#53
		it( 'creates an instance of a BalloonEditor child class', () => {
			// Fun fact: Remove the next 3 lines and you'll get a lovely inf loop due to two
			// editor being initialized on one element.
			const editorElement = document.createElement( 'div' );
			editorElement.innerHTML = '<p><strong>foo</strong> bar</p>';

			document.body.appendChild( editorElement );

			class CustomBalloonEditor extends BalloonEditor {}

			return CustomBalloonEditor
				.create( editorElement, {
					plugins: [ Paragraph, Bold ]
				} )
				.then( newEditor => {
					expect( newEditor ).to.be.instanceof( CustomBalloonEditor );
					expect( newEditor ).to.be.instanceof( BalloonEditor );

					expect( newEditor.getData() ).to.equal( '<p><strong>foo</strong> bar</p>' );

					editorElement.remove();

					return newEditor.destroy();
				} );
		} );

		it( 'throws an error when is initialized in textarea', done => {
			BalloonEditor.create( document.createElement( 'textarea' ) )
				.then(
					() => {
						expect.fail( 'Balloon editor should throw an error when is initialized in textarea.' );
					},
					err => {
						assertCKEditorError( err, 'editor-wrong-element', null );
					}
				)
				.then( done )
				.catch( done );
		} );

		it( 'creates editor from config-only', () => {
			return BalloonEditor
				.create( {
					root: { initialData: '<p>Hello world!</p>' },
					plugins: [ Paragraph ]
				} )
				.then( newEditor => {
					expect( newEditor.getData() ).to.equal( '<p>Hello world!</p>' );
					expect( newEditor.sourceElement ).to.be.undefined;

					return newEditor.destroy();
				} );
		} );

		it( 'creates editor from config-only with root.element', () => {
			const el = document.createElement( 'div' );
			el.innerHTML = '<p>Hello world!</p>';
			document.body.appendChild( el );

			return BalloonEditor
				.create( {
					root: { element: el },
					plugins: [ Paragraph, Bold ]
				} )
				.then( newEditor => {
					expect( newEditor.getData() ).to.equal( '<p>Hello world!</p>' );
					expect( newEditor.sourceElement ).to.equal( el );

					return newEditor.destroy();
				} )
				.then( () => {
					el.remove();
				} );
		} );

		it( 'creates editor from config-only with root.element and initialData', () => {
			const el = document.createElement( 'div' );
			el.innerHTML = '<p>Foo</p>';
			document.body.appendChild( el );

			return BalloonEditor
				.create( {
					root: { element: el, initialData: '<p>Hello world!</p>' },
					plugins: [ Paragraph, Bold ]
				} )
				.then( newEditor => {
					expect( newEditor.getData() ).to.equal( '<p>Hello world!</p>' );
					expect( newEditor.sourceElement ).to.equal( el );

					return newEditor.destroy();
				} )
				.then( () => {
					el.remove();
				} );
		} );

		describe( 'configurable editor label (aria-label)', () => {
			it( 'should be set to the defaut value if not configured', () => {
				expect( editor.editing.view.getDomRoot().getAttribute( 'aria-label' ) ).to.equal(
					'Rich Text Editor. Editing area: main'
				);
			} );

			it( 'should support the string format', async () => {
				await editor.destroy();

				editor = await BalloonEditor.create( editorElement, {
					plugins: [ Paragraph, Bold ],
					label: 'Custom label'
				} );

				expect( editor.editing.view.getDomRoot().getAttribute( 'aria-label' ) ).to.equal(
					'Custom label'
				);
			} );

			it( 'should support object format', async () => {
				await editor.destroy();

				editor = await BalloonEditor.create( editorElement, {
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
				const newEditor = await BalloonEditor.create( editorElement, {
					plugins: [ Paragraph, Bold ]
				} );

				expect( newEditor.editing.view.getDomRoot().getAttribute( 'aria-label' ), 'Keep value' ).to.equal(
					'Pre-existing value'
				);

				await newEditor.destroy();

				expect( editorElement.getAttribute( 'aria-label' ), 'Restore value' ).to.equal( 'Pre-existing value' );
			} );

			it( 'should override the existing value from the source DOM element', async () => {
				await editor.destroy();

				editorElement.setAttribute( 'aria-label', 'Pre-existing value' );
				editor = await BalloonEditor.create( editorElement, {
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

				editor = await BalloonEditor.create( '<p>Initial data</p>', {
					plugins: [ Paragraph, Bold ]
				} );

				expect( editor.editing.view.getDomRoot().getAttribute( 'aria-label' ), 'Override value' ).to.equal(
					'Rich Text Editor. Editing area: main'
				);

				await editor.destroy();
			} );

			it( 'should set custom label when creating an editor from initial data rather than a DOM element', async () => {
				await editor.destroy();

				editor = await BalloonEditor.create( '<p>Initial data</p>', {
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

			return BalloonEditor
				.create( editorElement, {
					plugins: [ EventWatcher ]
				} )
				.then( newEditor => {
					expect( fired ).to.deep.equal(
						[ 'ready-ballooneditorui', 'ready-datacontroller', 'ready-ballooneditor' ] );

					editor = newEditor;
				} );
		} );

		it( 'fires ready once UI is ready', () => {
			let isRendered;

			class EventWatcher extends Plugin {
				init() {
					this.editor.ui.on( 'ready', () => {
						isRendered = this.editor.ui.view.isRendered;
					} );
				}
			}

			return BalloonEditor
				.create( editorElement, {
					plugins: [ EventWatcher ]
				} )
				.then( newEditor => {
					expect( isRendered ).to.be.true;

					editor = newEditor;
				} );
		} );
	} );

	describe( 'destroy()', () => {
		beforeEach( function() {
			return BalloonEditor
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

			return BalloonEditor
				.create( '<p>Foo.</p>', {
					plugins: [ Paragraph, Bold ]
				} )
				.then( newEditor => newEditor.destroy() );
		} );
	} );

	describe( 'static fields', () => {
		it( 'BalloonEditor.Context', () => {
			expect( BalloonEditor.Context ).to.equal( Context );
		} );

		it( 'BalloonEditor.EditorWatchdog', () => {
			expect( BalloonEditor.EditorWatchdog ).to.equal( EditorWatchdog );
		} );

		it( 'BalloonEditor.ContextWatchdog', () => {
			expect( BalloonEditor.ContextWatchdog ).to.equal( ContextWatchdog );
		} );
	} );
} );
