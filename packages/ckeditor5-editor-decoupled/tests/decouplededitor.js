/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { DecoupledEditor } from '../src/decouplededitor.js';
import { DecoupledEditorUI } from '../src/decouplededitorui.js';
import { DecoupledEditorUIView } from '../src/decouplededitoruiview.js';

import { HtmlDataProcessor, ModelRootElement } from '@ckeditor/ckeditor5-engine';

import { Context, Plugin } from '@ckeditor/ckeditor5-core';
import { EditorWatchdog, ContextWatchdog } from '@ckeditor/ckeditor5-watchdog';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Bold } from '@ckeditor/ckeditor5-basic-styles';
import { CKEditorError } from '@ckeditor/ckeditor5-utils';

import { testUtils } from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import { assertCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

const editorData = '<p><strong>foo</strong> bar</p>';

describe( 'DecoupledEditor', () => {
	let editor;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		testUtils.sinon.stub( console, 'warn' ).callsFake( () => {} );
	} );

	describe( 'constructor()', () => {
		beforeEach( () => {
			editor = new DecoupledEditor();
		} );

		afterEach( async () => {
			editor.fire( 'ready' );
			await editor.destroy();
		} );

		it( 'uses HTMLDataProcessor', () => {
			expect( editor.data.processor ).to.be.instanceof( HtmlDataProcessor );
		} );

		it( 'it\'s possible to extract editor name from editor instance', () => {
			expect( Object.getPrototypeOf( editor ).constructor.editorName ).to.be.equal( 'DecoupledEditor' );
		} );

		it( 'has a Data Interface', () => {
			expect( DecoupledEditor.prototype ).have.property( 'setData' ).to.be.a( 'function' );
			expect( DecoupledEditor.prototype ).have.property( 'getData' ).to.be.a( 'function' );
		} );

		it( 'creates main root element', () => {
			expect( editor.model.document.getRoot( 'main' ) ).to.instanceof( ModelRootElement );
			expect( editor.model.document.getRoot( 'main' ).name ).to.equal( '$root' );
		} );

		it( 'creates main root element with the given modelElement name', () => {
			const customEditor = new DecoupledEditor( {
				root: {
					modelElement: 'customRoot',
					initialData: ''
				}
			} );

			expect( customEditor.model.document.getRoot( 'main' ).name ).to.equal( 'customRoot' );

			customEditor.fire( 'ready' );

			return customEditor.destroy();
		} );

		describe( 'ui', () => {
			it( 'is created', () => {
				editor.ui.init();

				expect( editor.ui ).to.be.instanceof( DecoupledEditorUI );
				expect( editor.ui.view ).to.be.instanceof( DecoupledEditorUIView );

				editor.ui.destroy();
			} );

			describe( 'automatic toolbar items groupping', () => {
				it( 'should be on by default', async () => {
					const editorElement = document.createElement( 'div' );
					const editor = new DecoupledEditor( editorElement );

					expect( editor.ui.view.toolbar.options.shouldGroupWhenFull ).to.be.true;

					editorElement.remove();

					editor.fire( 'ready' );
					await editor.destroy();
				} );

				it( 'can be disabled using config.toolbar.shouldNotGroupWhenFull', async () => {
					const editorElement = document.createElement( 'div' );
					const editor = new DecoupledEditor( editorElement, {
						toolbar: {
							shouldNotGroupWhenFull: true
						}
					} );

					expect( editor.ui.view.toolbar.options.shouldGroupWhenFull ).to.be.false;

					editorElement.remove();

					editor.fire( 'ready' );
					await editor.destroy();
				} );
			} );

			describe( 'configurable editor label (aria-label)', () => {
				let editorElement;

				beforeEach( () => {
					editorElement = document.createElement( 'div' );

					document.body.appendChild( editorElement );
				} );

				afterEach( () => {
					editorElement.remove();
				} );

				it( 'should be set to the defaut value if not configured', async () => {
					const editor = await DecoupledEditor.create( editorElement, {
						plugins: [ Paragraph, Bold ]
					} );

					expect( editor.editing.view.getDomRoot().getAttribute( 'aria-label' ) ).to.equal(
						'Rich Text Editor. Editing area: main'
					);

					await editor.destroy();
				} );

				it( 'should support the legacy config.label string format', async () => {
					const editor = await DecoupledEditor.create( editorElement, {
						plugins: [ Paragraph, Bold ],
						label: 'Custom label'
					} );

					expect( editor.editing.view.getDomRoot().getAttribute( 'aria-label' ) ).to.equal(
						'Custom label'
					);

					await editor.destroy();
				} );

				it( 'should support the legacy config.label object format', async () => {
					const editor = await DecoupledEditor.create( editorElement, {
						plugins: [ Paragraph, Bold ],
						label: {
							main: 'Custom label'
						}
					} );

					expect( editor.editing.view.getDomRoot().getAttribute( 'aria-label' ) ).to.equal(
						'Custom label'
					);

					await editor.destroy();
				} );

				it( 'should keep an existing value from the source DOM element', async () => {
					editorElement.setAttribute( 'aria-label', 'Pre-existing value' );
					const editor = await DecoupledEditor.create( editorElement, {
						plugins: [ Paragraph, Bold ]
					} );

					expect( editor.editing.view.getDomRoot().getAttribute( 'aria-label' ), 'Keep value' ).to.equal(
						'Pre-existing value'
					);

					await editor.destroy();

					expect( editorElement.getAttribute( 'aria-label' ), 'Restore value' ).to.equal( 'Pre-existing value' );
				} );

				it( 'should override the existing value from the source DOM element (legacy config.label)', async () => {
					editorElement.setAttribute( 'aria-label', 'Pre-existing value' );
					const editor = await DecoupledEditor.create( editorElement, {
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
					const editor = await DecoupledEditor.create( '<p>Initial data</p>', {
						plugins: [ Paragraph, Bold ]
					} );

					expect( editor.editing.view.getDomRoot().getAttribute( 'aria-label' ), 'Override value' ).to.equal(
						'Rich Text Editor. Editing area: main'
					);

					await editor.destroy();
				} );

				it( 'should set custom label when creating an editor from initial data rather than a DOM element', async () => {
					const editor = await DecoupledEditor.create( '<p>Initial data</p>', {
						plugins: [ Paragraph, Bold ],
						label: 'Custom label'
					} );

					expect( editor.editing.view.getDomRoot().getAttribute( 'aria-label' ), 'Override value' ).to.equal(
						'Custom label'
					);

					await editor.destroy();
				} );

				it( 'should support root.label format', async () => {
					const editor = await DecoupledEditor.create( editorElement, {
						plugins: [ Paragraph, Bold ],
						root: { label: 'Root label' }
					} );

					expect( editor.editing.view.getDomRoot().getAttribute( 'aria-label' ) ).to.equal(
						'Root label'
					);

					await editor.destroy();
				} );

				it( 'should support root.label in config-only constructor', async () => {
					const editor = await DecoupledEditor.create( {
						plugins: [ Paragraph, Bold ],
						root: { initialData: '<p>Foo</p>', label: 'Root label' }
					} );

					expect( editor.editing.view.getDomRoot().getAttribute( 'aria-label' ) ).to.equal(
						'Root label'
					);

					await editor.destroy();
				} );
			} );
		} );

		describe( 'config.roots.main.initialData', () => {
			it( 'if not set, is set using DOM element data', async () => {
				const editorElement = document.createElement( 'div' );
				editorElement.innerHTML = '<p>Foo</p>';

				const editor = new DecoupledEditor( editorElement );

				expect( editor.config.get( 'roots.main.initialData' ) ).to.equal( '<p>Foo</p>' );

				editor.fire( 'ready' );
				await editor.destroy();
			} );

			it( 'if not set, is set using data passed in constructor', async () => {
				const editor = new DecoupledEditor( '<p>Foo</p>' );

				expect( editor.config.get( 'roots.main.initialData' ) ).to.equal( '<p>Foo</p>' );

				editor.fire( 'ready' );
				await editor.destroy();
			} );

			it( 'if set, is not overwritten with DOM element data (legacy config.initialData)', async () => {
				const editorElement = document.createElement( 'div' );
				editorElement.innerHTML = '<p>Foo</p>';

				const editor = new DecoupledEditor( editorElement, { initialData: '<p>Bar</p>' } );

				expect( editor.config.get( 'roots.main.initialData' ) ).to.equal( '<p>Bar</p>' );

				editor.fire( 'ready' );
				await editor.destroy();
			} );

			it( 'it should throw if legacy config.initialData is set and initial data is passed in constructor', () => {
				expect( () => {
					// eslint-disable-next-line no-new
					new DecoupledEditor( '<p>Foo</p>', { initialData: '<p>Bar</p>' } );
				} ).to.throw( CKEditorError, 'editor-create-initial-data-overspecified' );
			} );

			it( 'it should throw if config.root.initialData is set and initial data is passed in constructor', () => {
				expect( () => {
					// eslint-disable-next-line no-new
					new DecoupledEditor( '<p>Foo</p>', { root: { initialData: '<p>Bar</p>' } } );
				} ).to.throw( CKEditorError, 'editor-create-root-initial-data-overspecified' );
			} );

			it( 'it should throw if config.roots.main.initialData is set and initial data is passed in constructor', () => {
				expect( () => {
					// eslint-disable-next-line no-new
					new DecoupledEditor( '<p>Foo</p>', { roots: { main: { initialData: '<p>Bar</p>' } } } );
				} ).to.throw( CKEditorError, 'editor-create-root-initial-data-overspecified' );
			} );

			it( 'it should throw if config.root and config.roots.main is set', () => {
				const editorElement = document.createElement( 'div' );
				editorElement.innerHTML = '<p>Foo</p>';

				expect( () => {
					// eslint-disable-next-line no-new
					new DecoupledEditor( editorElement, {
						root: { initialData: '<p>abc</p>' },
						roots: { main: { initialData: '<p>Bar</p>' } }
					} );
				} ).to.throw( CKEditorError, 'editor-create-roots-with-main' );
			} );

			it( 'it should throw if legacy config.initialData and config.root.initialData is set', () => {
				const editorElement = document.createElement( 'div' );
				editorElement.innerHTML = '<p>Foo</p>';

				expect( () => {
					// eslint-disable-next-line no-new
					new DecoupledEditor( editorElement, {
						initialData: '<p>abc</p>',
						root: { initialData: '<p>abc</p>' }
					} );
				} ).to.throw( CKEditorError, 'editor-create-legacy-initial-data-overspecified' );
			} );

			it( 'it should throw if legacy config.initialData and config.roots.main.initialData is set', () => {
				const editorElement = document.createElement( 'div' );
				editorElement.innerHTML = '<p>Foo</p>';

				expect( () => {
					// eslint-disable-next-line no-new
					new DecoupledEditor( editorElement, {
						initialData: '<p>abc</p>',
						roots: { main: { initialData: '<p>abc</p>' } }
					} );
				} ).to.throw( CKEditorError, 'editor-create-legacy-initial-data-overspecified' );
			} );

			it( 'it should throw if source element and config.root.element are both set', () => {
				const sourceElement = document.createElement( 'div' );
				sourceElement.innerHTML = '<p>Foo</p>';

				const existingElement = document.createElement( 'div' );

				expect( () => {
					// eslint-disable-next-line no-new
					new DecoupledEditor( sourceElement, { root: { element: existingElement } } );
				} ).to.throw( CKEditorError, 'editor-create-root-element-overspecified' );
			} );
		} );

		describe( 'config.root.placeholder', () => {
			it( 'should normalize config.root.placeholder to config.roots.main.placeholder', () => {
				const editor = new DecoupledEditor( '<p>Foo</p>', {
					root: { placeholder: 'Type here...' }
				} );

				expect( editor.config.get( 'roots.main.placeholder' ) ).to.equal( 'Type here...' );
			} );

			it( 'should normalize legacy config.placeholder to config.roots.main.placeholder (legacy)', () => {
				const editor = new DecoupledEditor( '<p>Foo</p>', {
					placeholder: 'Type here...'
				} );

				expect( editor.config.get( 'roots.main.placeholder' ) ).to.equal( 'Type here...' );
			} );
		} );

		describe( 'config.root.label', () => {
			it( 'should normalize config.root.label to config.roots.main.label', () => {
				const editor = new DecoupledEditor( '<p>Foo</p>', {
					root: { label: 'Custom label' }
				} );

				expect( editor.config.get( 'roots.main.label' ) ).to.equal( 'Custom label' );
			} );

			it( 'should normalize legacy config.label to config.roots.main.label (legacy)', () => {
				const editor = new DecoupledEditor( '<p>Foo</p>', {
					label: 'Custom label'
				} );

				expect( editor.config.get( 'roots.main.label' ) ).to.equal( 'Custom label' );
			} );
		} );

		describe( 'config.roots.main.modelAttributes', () => {
			it( 'should be possible to pass model attributes through config', async () => {
				const editor = await DecoupledEditor.create( {
					roots: {
						main: {
							modelAttributes: {
								foo: 1,
								bar: 2
							}
						}
					}
				} );

				const root = editor.model.document.getRoot();

				expect( root.getAttribute( 'foo' ) ).to.be.equal( 1 );
				expect( root.getAttribute( 'bar' ) ).to.be.equal( 2 );

				expect( editor.getRootAttributes() ).to.be.deep.equal( {
					foo: 1,
					bar: 2
				} );

				await editor.destroy();
			} );
		} );

		describe( 'config.root.modelAttributes', () => {
			it( 'should be possible to pass model attributes through config', async () => {
				const editor = await DecoupledEditor.create( {
					root: {
						modelAttributes: {
							foo: 1,
							bar: 2
						}
					}
				} );

				const root = editor.model.document.getRoot();

				expect( root.getAttribute( 'foo' ) ).to.be.equal( 1 );
				expect( root.getAttribute( 'bar' ) ).to.be.equal( 2 );

				expect( editor.getRootAttributes() ).to.be.deep.equal( {
					foo: 1,
					bar: 2
				} );

				await editor.destroy();
			} );
		} );

		describe( 'config-only constructor', () => {
			it( 'should create editor with config.root.initialData', async () => {
				const editor = new DecoupledEditor( {
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

				const editor = new DecoupledEditor( {
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

				const editor = new DecoupledEditor( {
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

			it( 'should throw when config.attachTo is set', () => {
				const el = document.createElement( 'div' );

				expect( () => {
					// eslint-disable-next-line no-new
					new DecoupledEditor( {
						attachTo: el,
						root: {
							initialData: '<p>Foo</p>'
						}
					} );
				} ).to.throw( CKEditorError, 'editor-create-attachto-ignored' );
			} );

			it( 'should throw when config.root.element is a textarea', () => {
				expect( () => {
					// eslint-disable-next-line no-new
					new DecoupledEditor( {
						root: {
							element: document.createElement( 'textarea' )
						}
					} );
				} ).to.throw( CKEditorError, 'editor-wrong-element' );
			} );
		} );
	} );

	describe( 'create()', () => {
		it( 'should properly handled async data initialization', done => {
			const spy = sinon.spy();
			let resolver;

			class AsyncDataInit extends Plugin {
				init() {
					this.editor.data.on( 'ready', () => spy( 'ready' ) );

					this.editor.data.on( 'init', evt => {
						evt.stop();
						evt.return = new Promise( resolve => {
							resolver = () => {
								spy( 'asyncInit' );
								// Since we stop `init` event, `data#ready` needs to be fired manually.
								this.editor.data.fire( 'ready' );
								resolve();
							};
						} );
					}, { priority: 'high' } );
				}
			}

			DecoupledEditor.create( '<p>foo bar</p>', {
				plugins: [ Paragraph, Bold, AsyncDataInit ]
			} ).then( editor => {
				sinon.assert.calledWith( spy.firstCall, 'asyncInit' );
				sinon.assert.calledWith( spy.secondCall, 'ready' );

				editor.destroy().then( done );
			} );

			// Resolve init promise in next cycle to hold data initialization.
			setTimeout( () => resolver() );
		} );

		it( 'should reject if a root element is not a limit element', async () => {
			class NonLimitRootPlugin extends Plugin {
				init() {
					this.editor.model.schema.register( 'nonLimit', { isBlock: true } );
				}
			}

			try {
				await DecoupledEditor.create( {
					plugins: [ Paragraph, NonLimitRootPlugin ],
					root: { modelElement: 'nonLimit' }
				} );
				expect.fail( 'Promise should have been rejected' );
			} catch ( err ) {
				expect( err ).to.be.instanceof( CKEditorError );
				expect( err.message ).to.match( /editor-root-element-is-not-limit/ );
			}
		} );

		describe( 'editor with data', () => {
			test( () => editorData );
		} );

		describe( 'editor with editable element', () => {
			let editableElement;

			beforeEach( () => {
				editableElement = document.createElement( 'div' );
				editableElement.innerHTML = editorData;
			} );

			test( () => editableElement );
		} );

		it( 'initializes with legacy config.initialData', () => {
			return DecoupledEditor.create( document.createElement( 'div' ), {
				initialData: '<p>Hello world!</p>',
				plugins: [ Paragraph ]
			} ).then( editor => {
				expect( editor.getData() ).to.equal( '<p>Hello world!</p>' );

				return editor.destroy();
			} );
		} );

		// https://github.com/ckeditor/ckeditor5/issues/8974
		it( 'initializes with empty content if legacy config.initialData is set to an empty string', () => {
			return DecoupledEditor.create( document.createElement( 'div' ), {
				initialData: '',
				plugins: [ Paragraph ]
			} ).then( editor => {
				expect( editor.getData() ).to.equal( '' );

				return editor.destroy();
			} );
		} );

		// See: https://github.com/ckeditor/ckeditor5/issues/746
		it( 'should throw when trying to create the editor using the same source element more than once', done => {
			const sourceElement = document.createElement( 'div' );

			// eslint-disable-next-line no-new
			new DecoupledEditor( sourceElement );

			DecoupledEditor.create( sourceElement )
				.then(
					() => {
						expect.fail( 'Decoupled editor should not initialize on an element already used by other instance.' );
					},
					err => {
						assertCKEditorError( err, 'editor-source-element-already-used' );
					}
				)
				.then( done )
				.catch( done );
		} );

		it( 'throws error if it is initialized in textarea', done => {
			DecoupledEditor.create( document.createElement( 'textarea' ) )
				.then(
					() => {
						expect.fail( 'Decoupled editor should throw an error when is initialized in textarea.' );
					},
					err => {
						assertCKEditorError( err, 'editor-wrong-element', null );
					}
				)
				.then( done )
				.catch( done );
		} );

		it( 'creates editor from config-only', () => {
			return DecoupledEditor
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

			return DecoupledEditor
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

			return DecoupledEditor
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

		function test( getElementOrData ) {
			it( 'creates an instance which inherits from the DecoupledEditor', () => {
				return DecoupledEditor
					.create( getElementOrData(), {
						plugins: [ Paragraph, Bold ]
					} )
					.then( newEditor => {
						expect( newEditor ).to.be.instanceof( DecoupledEditor );

						return newEditor.destroy();
					} );
			} );

			it( 'loads the initial data', () => {
				return DecoupledEditor
					.create( getElementOrData(), {
						plugins: [ Paragraph, Bold ]
					} )
					.then( newEditor => {
						expect( newEditor.getData() ).to.equal( '<p><strong>foo</strong> bar</p>' );

						return newEditor.destroy();
					} );
			} );

			it( 'should not require config object', () => {
				// Just being safe with `builtinPlugins` static property.
				class CustomDecoupledEditor extends DecoupledEditor {}
				CustomDecoupledEditor.builtinPlugins = [ Paragraph, Bold ];

				return CustomDecoupledEditor.create( getElementOrData() )
					.then( newEditor => {
						expect( newEditor.getData() ).to.equal( '<p><strong>foo</strong> bar</p>' );

						return newEditor.destroy();
					} );
			} );

			// https://github.com/ckeditor/ckeditor5-editor-classic/issues/53
			it( 'creates an instance of a DecoupledEditor child class', () => {
				class CustomDecoupledEditor extends DecoupledEditor {}

				return CustomDecoupledEditor
					.create( getElementOrData(), {
						plugins: [ Paragraph, Bold ]
					} )
					.then( newEditor => {
						expect( newEditor ).to.be.instanceof( CustomDecoupledEditor );
						expect( newEditor ).to.be.instanceof( DecoupledEditor );

						expect( newEditor.getData() ).to.equal( '<p><strong>foo</strong> bar</p>' );

						return newEditor.destroy();
					} );
			} );

			// https://github.com/ckeditor/ckeditor5-editor-decoupled/issues/3
			it( 'initializes the data controller', () => {
				let dataInitSpy;

				class DataInitAssertPlugin extends Plugin {
					constructor( editor ) {
						super();

						this.editor = editor;
					}

					init() {
						dataInitSpy = sinon.spy( this.editor.data, 'init' );
					}
				}

				return DecoupledEditor
					.create( getElementOrData(), {
						plugins: [ Paragraph, Bold, DataInitAssertPlugin ]
					} )
					.then( newEditor => {
						sinon.assert.calledOnce( dataInitSpy );

						return newEditor.destroy();
					} );
			} );

			describe( 'events', () => {
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

					return DecoupledEditor
						.create( getElementOrData(), {
							plugins: [ EventWatcher ]
						} )
						.then( newEditor => {
							expect( fired ).to.deep.equal( [
								'ready-decouplededitorui',
								'ready-datacontroller',
								'ready-decouplededitor'
							] );

							return newEditor.destroy();
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

					return DecoupledEditor
						.create( getElementOrData(), {
							plugins: [ EventWatcher ]
						} )
						.then( newEditor => {
							expect( isReady ).to.be.true;

							return newEditor.destroy();
						} );
				} );
			} );
		}
	} );

	describe( 'destroy', () => {
		describe( 'editor with data', () => {
			beforeEach( function() {
				return DecoupledEditor
					.create( editorData, { plugins: [ Paragraph ] } )
					.then( newEditor => {
						editor = newEditor;
					} );
			} );

			test( () => editorData );
		} );

		describe( 'editor with editable element', () => {
			let editableElement;

			beforeEach( function() {
				editableElement = document.createElement( 'div' );
				editableElement.innerHTML = editorData;

				return DecoupledEditor
					.create( editableElement, { plugins: [ Paragraph ] } )
					.then( newEditor => {
						editor = newEditor;
					} );
			} );

			// We don't update the source element by default, so after destroy, it should become empty.
			it( 'don\'t set data back to the element', () => {
				editor.setData( '<p>foo</p><p>bar</p>' );

				return editor.destroy()
					.then( () => {
						expect( editableElement.innerHTML ).to.equal( '' );
					} );
			} );

			// Adding `updateSourceElementOnDestroy` config to the editor allows setting the data
			// back to the source element after destroy.
			it( 'sets data back to the element', () => {
				editor.config.set( 'updateSourceElementOnDestroy', true );
				editor.setData( '<p>foo</p>' );

				return editor.destroy()
					.then( () => {
						expect( editableElement.innerHTML ).to.equal( '<p>foo</p>' );
					} );
			} );

			test( () => editableElement );
		} );

		function test() {
			it( 'destroys the UI', () => {
				const spy = sinon.spy( editor.ui, 'destroy' );

				return editor.destroy()
					.then( () => {
						sinon.assert.calledOnce( spy );
					} );
			} );
		}
	} );

	describe( 'static fields', () => {
		it( 'DecoupledEditor.Context', () => {
			expect( DecoupledEditor.Context ).to.equal( Context );
		} );

		it( 'DecoupledEditor.EditorWatchdog', () => {
			expect( DecoupledEditor.EditorWatchdog ).to.equal( EditorWatchdog );
		} );

		it( 'DecoupledEditor.ContextWatchdog', () => {
			expect( DecoupledEditor.ContextWatchdog ).to.equal( ContextWatchdog );
		} );
	} );
} );
