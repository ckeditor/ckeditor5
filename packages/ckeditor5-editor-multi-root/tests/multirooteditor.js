/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import MultiRootEditor from '../src/multirooteditor.js';
import MultiRootEditorUI from '../src/multirooteditorui.js';
import MultiRootEditorUIView from '../src/multirooteditoruiview.js';

import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor.js';

import Context from '@ckeditor/ckeditor5-core/src/context.js';
import EditorWatchdog from '@ckeditor/ckeditor5-watchdog/src/editorwatchdog.js';
import ContextWatchdog from '@ckeditor/ckeditor5-watchdog/src/contextwatchdog.js';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import Undo from '@ckeditor/ckeditor5-undo/src/undo.js';
import Table from '@ckeditor/ckeditor5-table/src/table.js';
import RootElement from '@ckeditor/ckeditor5-engine/src/model/rootelement.js';
import ClipboardPipeline from '@ckeditor/ckeditor5-clipboard/src/clipboardpipeline.js';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror.js';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import { describeMemoryUsage, testMemoryUsage } from '@ckeditor/ckeditor5-core/tests/_utils/memory.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { assertCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

const editorData = { foo: '<p>Foo</p>', bar: '<p>Bar</p>' };

describe( 'MultiRootEditor', () => {
	let editor;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		testUtils.sinon.stub( console, 'warn' ).callsFake( () => {} );
	} );

	describe( 'constructor()', () => {
		beforeEach( () => {
			editor = new MultiRootEditor( { foo: '', bar: '' } );
		} );

		it( 'uses HTMLDataProcessor', () => {
			expect( editor.data.processor ).to.be.instanceof( HtmlDataProcessor );
		} );

		it( 'it\'s possible to extract editor name from editor instance', () => {
			expect( Object.getPrototypeOf( editor ).constructor.editorName ).to.be.equal( 'MultiRootEditor' );
		} );

		it( 'has a Data Interface', () => {
			expect( MultiRootEditor.prototype ).have.property( 'setData' ).to.be.a( 'function' );
			expect( MultiRootEditor.prototype ).have.property( 'getData' ).to.be.a( 'function' );
		} );

		it( 'creates specified roots', () => {
			expect( editor.model.document.getRootNames() ).to.deep.equal( [ 'foo', 'bar' ] );

			expect( editor.model.document.getRoot( 'foo' ) ).to.instanceof( RootElement );
			expect( editor.model.document.getRoot( 'bar' ) ).to.instanceof( RootElement );
		} );

		describe( 'ui', () => {
			it( 'is created', () => {
				editor.ui.init();

				expect( editor.ui ).to.be.instanceof( MultiRootEditorUI );
				expect( editor.ui.view ).to.be.instanceof( MultiRootEditorUIView );

				editor.ui.destroy();
			} );

			describe( 'automatic toolbar items groupping', () => {
				it( 'should be on by default', () => {
					const editorElement = document.createElement( 'div' );
					const editor = new MultiRootEditor( editorElement );

					expect( editor.ui.view.toolbar.options.shouldGroupWhenFull ).to.be.true;

					editorElement.remove();
				} );

				it( 'can be disabled using config.toolbar.shouldNotGroupWhenFull', () => {
					const editorElement = document.createElement( 'div' );
					const editor = new MultiRootEditor( editorElement, {
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
			it( 'if not set, is set using DOM elements data', () => {
				const fooEl = document.createElement( 'div' );
				fooEl.innerHTML = '<p>Foo</p>';

				const barEl = document.createElement( 'div' );
				barEl.innerHTML = '<p>Bar</p>';

				const editor = new MultiRootEditor( { 'foo': fooEl, 'bar': barEl } );

				expect( editor.config.get( 'initialData' ) ).to.deep.equal( { foo: '<p>Foo</p>', bar: '<p>Bar</p>' } );
			} );

			it( 'if not set, is set using data passed in constructor', () => {
				const editor = new MultiRootEditor( { foo: '<p>Foo</p>', bar: '<p>Bar</p>' } );

				expect( editor.config.get( 'initialData' ) ).to.deep.equal( { foo: '<p>Foo</p>', bar: '<p>Bar</p>' } );
			} );

			it( 'if set, is not overwritten with DOM element data', () => {
				const fooEl = document.createElement( 'div' );
				fooEl.innerHTML = '<p></p>';

				const barEl = document.createElement( 'div' );
				barEl.innerHTML = '<p></p>';

				const editor = new MultiRootEditor(
					{ 'foo': fooEl, 'bar': barEl },
					{ initialData: { foo: '<p>Foo</p>', bar: '<p>Bar</p>' } }
				);

				expect( editor.config.get( 'initialData' ) ).to.deep.equal( { foo: '<p>Foo</p>', bar: '<p>Bar</p>' } );
			} );

			it( 'should throw if config.initialData is set and initial data is passed in constructor', () => {
				expect( () => {
					// eslint-disable-next-line no-new
					new MultiRootEditor(
						{ foo: '<p>Foo</p>', bar: '<p>Bar</p>' },
						{ initialData: { foo: '<p>Foo</p>', bar: '<p>Bar</p>' } }
					);
				} ).to.throw( CKEditorError, 'editor-create-initial-data' );
			} );
		} );
	} );

	describe( 'create()', () => {
		describe( 'editor with data', () => {
			test( () => editorData );
		} );

		describe( 'editor with editable elements', () => {
			let editableElements;

			beforeEach( () => {
				editableElements = {
					foo: document.createElement( 'div' ),
					bar: document.createElement( 'div' )
				};

				editableElements.foo.innerHTML = editorData.foo;
				editableElements.bar.innerHTML = editorData.bar;
			} );

			test( () => editableElements );
		} );

		it( 'initializes with config.initialData', () => {
			return MultiRootEditor.create( {
				foo: document.createElement( 'div' ),
				bar: document.createElement( 'div' )
			}, {
				initialData: editorData,
				plugins: [ Paragraph ]
			} ).then( editor => {
				expect( editor.getData( { rootName: 'foo' } ) ).to.equal( editorData.foo );
				expect( editor.getData( { rootName: 'bar' } ) ).to.equal( editorData.bar );

				return editor.destroy();
			} );
		} );

		it( 'initializes with empty content if config.initialData is set to an empty string', () => {
			return MultiRootEditor.create( {
				foo: document.createElement( 'div' ),
				bar: document.createElement( 'div' )
			}, {
				initialData: { foo: '', bar: '' },
				plugins: [ Paragraph ]
			} ).then( editor => {
				expect( editor.getData( { rootName: 'foo' } ) ).to.equal( '' );
				expect( editor.getData( { rootName: 'bar' } ) ).to.equal( '' );

				return editor.destroy();
			} );
		} );

		it( 'initializes the editor if no roots are specified', done => {
			MultiRootEditor.create( {} ).then( editor => editor.destroy() ).then( done );
		} );

		it( 'should throw when trying to create the editor using the same source element more than once', done => {
			const sourceElement = document.createElement( 'div' );

			// eslint-disable-next-line no-new
			new MultiRootEditor( { sourceElement } );

			MultiRootEditor.create( { sourceElement } )
				.then(
					() => {
						expect.fail( 'Multi-root editor should not initialize on an element already used by other instance.' );
					},
					err => {
						assertCKEditorError( err, 'editor-source-element-already-used' );
					}
				)
				.then( done )
				.catch( done );
		} );

		it( 'throws error if it is initialized in textarea', done => {
			MultiRootEditor.create( {
				foo: document.createElement( 'textarea' )
			} )
				.then(
					() => {
						expect.fail( 'Multi-root editor should throw an error when is initialized in textarea.' );
					},
					err => {
						assertCKEditorError( err, 'editor-wrong-element', null );
					}
				)
				.then( done )
				.catch( done );
		} );

		it( 'throws error when initial roots are different than initial data - missing root in initial roots', done => {
			MultiRootEditor.create( {
				foo: document.createElement( 'div' )
			}, {
				initialData: {
					foo: '<p>Foo</p>',
					bar: '<p>Bar</p>'
				}
			} )
				.then(
					() => {
						expect.fail( 'Multi-root editor should throw an error when initital roots and initial data are mismatched.' );
					},
					err => {
						assertCKEditorError( err, 'multi-root-editor-root-initial-data-mismatch', null );
					}
				)
				.then( done )
				.catch( done )
				.finally( () => {
					// Cleanup. This is difficult as we don't have editor instance to destroy.
					document.querySelector( '.ck-body-wrapper' ).remove();
				} );
		} );

		it( 'throws error when initial roots are different than initial data - detached root', done => {
			// Artificial fake plugin that simulates a root being removed as the editor is initialized.
			class RemoveRoot {
				constructor( editor ) {
					this.editor = editor;
				}

				init() {
					const rootFoo = this.editor.model.document.getRoot( 'foo' );

					rootFoo._isAttached = false;
				}
			}

			MultiRootEditor.create( {
				foo: document.createElement( 'div' )
			}, {
				initialData: {
					foo: '<p>Foo</p>'
				},
				extraPlugins: [
					RemoveRoot
				]
			} )
				.then(
					() => {
						expect.fail( 'Multi-root editor should throw an error when initital roots and initial data are mismatched.' );
					},
					err => {
						assertCKEditorError( err, 'multi-root-editor-root-initial-data-mismatch', null );
					}
				)
				.then( done )
				.catch( done )
				.finally( () => {
					// Cleanup. This is difficult as we don't have editor instance to destroy.
					document.querySelector( '.ck-body-wrapper' ).remove();
				} );
		} );

		it( 'throws error when initial roots are different than initial data - missing root in initial data', done => {
			MultiRootEditor.create( {
				foo: document.createElement( 'div' ),
				bar: document.createElement( 'div' )
			}, {
				initialData: {
					foo: '<p>Foo</p>'
				}
			} )
				.then(
					() => {
						expect.fail( 'Multi-root editor should throw an error when initital roots and initial data are mismatched.' );
					},
					err => {
						assertCKEditorError( err, 'multi-root-editor-root-initial-data-mismatch', null );
					}
				)
				.then( done )
				.catch( done )
				.finally( () => {
					// Cleanup. This is difficult as we don't have editor instance to destroy.
					document.querySelector( '.ck-body-wrapper' ).remove();
				} );
		} );

		describe( 'configurable editor label (aria-label)', () => {
			it( 'should be set to the defaut value if not configured', async () => {
				const editor = await MultiRootEditor.create( {
					foo: document.createElement( 'div' ),
					bar: document.createElement( 'div' )
				}, {
					plugins: [ Paragraph, Bold ]
				} );

				expect( editor.editing.view.getDomRoot( 'foo' ).getAttribute( 'aria-label' ) ).to.equal(
					'Rich Text Editor. Editing area: foo'
				);

				expect( editor.editing.view.getDomRoot( 'bar' ).getAttribute( 'aria-label' ) ).to.equal(
					'Rich Text Editor. Editing area: bar'
				);

				await editor.destroy();
			} );

			it( 'should support string format', async () => {
				const editor = await MultiRootEditor.create( {
					foo: document.createElement( 'div' ),
					bar: document.createElement( 'div' )
				}, {
					plugins: [ Paragraph, Bold ],
					label: 'Custom label'
				} );

				expect( editor.editing.view.getDomRoot( 'foo' ).getAttribute( 'aria-label' ) ).to.equal(
					'Custom label'
				);

				expect( editor.editing.view.getDomRoot( 'bar' ).getAttribute( 'aria-label' ) ).to.equal(
					'Custom label'
				);

				await editor.destroy();
			} );

			it( 'should support object format', async () => {
				const editor = await MultiRootEditor.create( {
					foo: document.createElement( 'div' ),
					bar: document.createElement( 'div' )
				}, {
					plugins: [ Paragraph, Bold ],
					label: {
						foo: 'Foo custom label',
						bar: 'Bar custom label'
					}
				} );

				expect( editor.editing.view.getDomRoot( 'foo' ).getAttribute( 'aria-label' ) ).to.equal(
					'Foo custom label'
				);

				expect( editor.editing.view.getDomRoot( 'bar' ).getAttribute( 'aria-label' ) ).to.equal(
					'Bar custom label'
				);

				await editor.destroy();
			} );

			it( 'should support object format (mix default and custom label)', async () => {
				const editor = await MultiRootEditor.create( {
					foo: document.createElement( 'div' ),
					bar: document.createElement( 'div' )
				}, {
					plugins: [ Paragraph, Bold ],
					label: {
						bar: 'Bar custom label'
					}
				} );

				expect( editor.editing.view.getDomRoot( 'foo' ).getAttribute( 'aria-label' ) ).to.equal(
					'Rich Text Editor. Editing area: foo'
				);

				expect( editor.editing.view.getDomRoot( 'bar' ).getAttribute( 'aria-label' ) ).to.equal(
					'Bar custom label'
				);

				await editor.destroy();
			} );

			it( 'should keep an existing value from the source DOM element', async () => {
				const fooElement = document.createElement( 'div' );
				fooElement.setAttribute( 'aria-label', 'Foo pre-existing value' );

				const barElement = document.createElement( 'div' );
				barElement.setAttribute( 'aria-label', 'Bar pre-existing value' );

				const editor = await MultiRootEditor.create( {
					foo: fooElement,
					bar: barElement
				}, {
					plugins: [ Paragraph, Bold ]
				} );

				expect( editor.editing.view.getDomRoot( 'foo' ).getAttribute( 'aria-label' ) ).to.equal(
					'Foo pre-existing value'
				);

				expect( editor.editing.view.getDomRoot( 'bar' ).getAttribute( 'aria-label' ) ).to.equal(
					'Bar pre-existing value'
				);

				await editor.destroy();
			} );

			it( 'should override the existing value from the source DOM element', async () => {
				const fooElement = document.createElement( 'div' );
				fooElement.setAttribute( 'aria-label', 'Foo pre-existing value' );

				const barElement = document.createElement( 'div' );
				barElement.setAttribute( 'aria-label', 'Bar pre-existing value' );

				const editor = await MultiRootEditor.create( {
					foo: fooElement,
					bar: barElement
				}, {
					plugins: [ Paragraph, Bold ],
					label: {
						foo: 'Foo override',
						bar: 'Bar override'
					}
				} );

				expect( editor.editing.view.getDomRoot( 'foo' ).getAttribute( 'aria-label' ) ).to.equal(
					'Foo override'
				);

				expect( editor.editing.view.getDomRoot( 'bar' ).getAttribute( 'aria-label' ) ).to.equal(
					'Bar override'
				);

				await editor.destroy();
			} );

			it( 'should use default label when creating an editor from initial data rather than a DOM element', async () => {
				const editor = await MultiRootEditor.create( {
					foo: 'Foo content',
					bar: 'Bar content'
				}, {
					plugins: [ Paragraph, Bold ]
				} );

				expect( editor.editing.view.getDomRoot( 'foo' ).getAttribute( 'aria-label' ), 'Override value' ).to.equal(
					'Rich Text Editor. Editing area: foo'
				);

				expect( editor.editing.view.getDomRoot( 'bar' ).getAttribute( 'aria-label' ), 'Override value' ).to.equal(
					'Rich Text Editor. Editing area: bar'
				);

				await editor.destroy();
			} );

			it( 'should set custom label when creating an editor from initial data rather than a DOM element', async () => {
				const editor = await MultiRootEditor.create( {
					foo: 'Foo content',
					bar: 'Bar content'
				}, {
					plugins: [ Paragraph, Bold ],
					label: {
						foo: 'Foo override',
						bar: 'Bar override'
					}
				} );

				expect( editor.editing.view.getDomRoot( 'foo' ).getAttribute( 'aria-label' ) ).to.equal(
					'Foo override'
				);

				expect( editor.editing.view.getDomRoot( 'bar' ).getAttribute( 'aria-label' ) ).to.equal(
					'Bar override'
				);

				await editor.destroy();
			} );
		} );

		function test( getElementOrData ) {
			it( 'creates an instance which inherits from the MultiRootEditor', () => {
				return MultiRootEditor
					.create( getElementOrData(), {
						plugins: [ Paragraph, Bold ]
					} )
					.then( newEditor => {
						expect( newEditor ).to.be.instanceof( MultiRootEditor );

						return newEditor.destroy();
					} );
			} );

			it( 'loads the initial data', () => {
				return MultiRootEditor
					.create( getElementOrData(), {
						plugins: [ Paragraph, Bold ]
					} )
					.then( newEditor => {
						expect( newEditor.getData( { rootName: 'foo' } ) ).to.equal( editorData.foo );
						expect( newEditor.getData( { rootName: 'bar' } ) ).to.equal( editorData.bar );

						return newEditor.destroy();
					} );
			} );

			it( 'should not require config object', () => {
				// Just being safe with `builtinPlugins` static property.
				class CustomMultiRootEditor extends MultiRootEditor {}
				CustomMultiRootEditor.builtinPlugins = [ Paragraph, Bold ];

				return CustomMultiRootEditor.create( getElementOrData() )
					.then( newEditor => {
						expect( newEditor.getData( { rootName: 'foo' } ) ).to.equal( editorData.foo );
						expect( newEditor.getData( { rootName: 'bar' } ) ).to.equal( editorData.bar );

						return newEditor.destroy();
					} );
			} );

			// https://github.com/ckeditor/ckeditor5-editor-classic/issues/53
			it( 'creates an instance of a MultiRootEditor child class', () => {
				class CustomMultiRootEditor extends MultiRootEditor {}

				return CustomMultiRootEditor
					.create( getElementOrData(), {
						plugins: [ Paragraph, Bold ]
					} )
					.then( newEditor => {
						expect( newEditor ).to.be.instanceof( CustomMultiRootEditor );
						expect( newEditor ).to.be.instanceof( MultiRootEditor );

						expect( newEditor.getData( { rootName: 'foo' } ) ).to.equal( editorData.foo );
						expect( newEditor.getData( { rootName: 'bar' } ) ).to.equal( editorData.bar );

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

					return MultiRootEditor
						.create( getElementOrData(), {
							plugins: [ EventWatcher ]
						} )
						.then( newEditor => {
							expect( fired ).to.deep.equal( [
								'ready-multirooteditorui',
								'ready-datacontroller',
								'ready-multirooteditor'
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

					return MultiRootEditor
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

	describe( 'addRoot()', () => {
		beforeEach( async () => {
			editor = await MultiRootEditor.create( { foo: '' }, { plugins: [ Paragraph, Undo ] } );
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should add a model root with given root name using operations', () => {
			const document = editor.model.document;
			const version = document.version;

			editor.addRoot( 'bar' );

			const root = document.getRoot( 'bar' );

			expect( root ).not.to.be.null;
			expect( root.isAttached() ).to.be.true;

			const op = document.history.getOperation( version );
			expect( op.type ).to.equal( 'addRoot' );
			expect( op.rootName ).to.equal( 'bar' );

			expect( editor.getData( { rootName: 'bar' } ) ).to.equal( '' );

			// By default, `addRoot()` is not undoable.
			expect( editor.commands.get( 'undo' ).isEnabled ).to.be.false;
		} );

		it( 'should init the root with given data', () => {
			editor.addRoot( 'bar', { data: '<p>Foo.</p>' } );

			expect( editor.getData( { rootName: 'bar' } ) ).to.equal( '<p>Foo.</p>' );
		} );

		it( 'should add a model root with given element name', () => {
			editor.addRoot( 'bar', { elementName: 'div' } );

			const root = editor.model.document.getRoot( 'bar' );

			expect( root.name ).to.equal( 'div' );
		} );

		it( 'should add a model root with given attributes', () => {
			sinon.spy( editor, 'registerRootAttribute' );

			editor.addRoot( 'bar', { attributes: { order: 20, isLocked: true } } );

			const root = editor.model.document.getRoot( 'bar' );

			expect( root.getAttribute( 'order' ) ).to.equal( 20 );
			expect( root.getAttribute( 'isLocked' ) ).to.be.true;

			expect( editor.registerRootAttribute.calledWithExactly( 'order' ) );
			expect( editor.registerRootAttribute.calledWithExactly( 'isLocked' ) );
		} );

		it( 'should add a model root which can be undone by undo feature if `isUndoable` is set to `true`', () => {
			editor.addRoot( 'bar', { data: '<p>Foo.</p>', isUndoable: true } );

			expect( editor.commands.get( 'undo' ).isEnabled ).to.be.true;

			editor.execute( 'undo' );

			const root = editor.model.document.getRoot( 'bar' );

			expect( root ).not.to.be.null;
			expect( root.isAttached() ).to.be.false;
		} );
	} );

	describe( 'detachRoot()', () => {
		beforeEach( async () => {
			editor = await MultiRootEditor.create( { foo: '<p>Foo.</p>', bar: '<p>Bar.</p>' }, { plugins: [ Paragraph, Undo ] } );
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should detach given model root using operations', () => {
			const document = editor.model.document;

			editor.detachRoot( 'bar' );

			const root = document.getRoot( 'bar' );

			expect( root ).not.to.be.null;
			expect( root.isAttached() ).to.be.false;

			const op = document.history.getOperation( document.version - 1 );
			expect( op.type ).to.equal( 'detachRoot' );
			expect( op.rootName ).to.equal( 'bar' );

			expect( editor.getData( { rootName: 'bar' } ) ).to.equal( '' );

			// By default, `detachRoot()` is not undoable.
			expect( editor.commands.get( 'undo' ).isEnabled ).to.be.false;
		} );

		it( 'should detach given model root which can be undone by undo feature if `isUndoable` is set to `true`', () => {
			editor.detachRoot( 'bar', true );

			expect( editor.commands.get( 'undo' ).isEnabled ).to.be.true;

			editor.execute( 'undo' );

			const root = editor.model.document.getRoot( 'bar' );

			expect( root.isAttached() ).to.be.true;
		} );

		it( 'should detach a dynamically added root', () => {
			editor.addRoot( 'new' );
			editor.detachRoot( 'new' );

			const root = editor.model.document.getRoot( 'new' );

			expect( root ).not.to.be.null;
			expect( root.isAttached() ).to.be.false;
		} );
	} );

	describe( 'loading roots', () => {
		describe( 'config.lazyRoots', () => {
			it( 'should create specified, non-loaded roots', async () => {
				editor = await MultiRootEditor.create( { main: '<p>Main.</p>' }, {
					plugins: [ Paragraph, Undo ],
					lazyRoots: [ 'foo', 'bar' ]
				} );

				const rootFoo = editor.model.document.getRoot( 'foo' );
				const rootBar = editor.model.document.getRoot( 'bar' );

				expect( rootFoo ).not.to.be.null;
				expect( rootFoo.rootName ).to.equal( 'foo' );
				expect( rootFoo.isAttached() ).to.be.true;
				expect( rootFoo._isLoaded ).to.be.false;

				expect( rootBar ).not.to.be.null;
				expect( rootBar.rootName ).to.equal( 'bar' );
				expect( rootBar.isAttached() ).to.be.true;
				expect( rootBar._isLoaded ).to.be.false;

				expect( editor.model.document.getRootNames() ).to.deep.equal( [ 'main' ] );

				return editor.destroy();
			} );

			it( 'should work correctly when there are no initial loaded roots', async () => {
				editor = await MultiRootEditor.create( {}, {
					plugins: [ Paragraph, Undo ],
					lazyRoots: [ 'foo', 'bar' ]
				} );

				expect( editor.model.document.getRootNames() ).to.deep.equal( [] );

				return editor.destroy();
			} );
		} );

		describe( 'loadRoot()', () => {
			let root;

			beforeEach( async () => {
				editor = await MultiRootEditor.create( {}, {
					plugins: [ Paragraph, Undo ],
					lazyRoots: [ 'foo', 'bar' ]
				} );

				root = editor.model.document.getRoot( 'foo' );
			} );

			afterEach( async () => {
				await editor.destroy();
			} );

			it( 'should throw if given root does not exist', async () => {
				expect( () => {
					editor.loadRoot( 'xyz' );
				} ).to.throw( CKEditorError, 'multi-root-editor-load-root-no-root' );
			} );

			it( 'should set not-loaded root as loaded and set initial data and attributes', () => {
				sinon.spy( editor, 'registerRootAttribute' );

				editor.loadRoot( 'foo', { data: '<p>Foo</p>', attributes: { order: 100 } } );

				expect( root._isLoaded ).to.be.true;
				expect( editor.getData( { rootName: 'foo' } ) ).to.equal( '<p>Foo</p>' );
				expect( editor.getRootAttributes( 'foo' ) ).to.deep.equal( { order: 100 } );

				expect( editor.registerRootAttribute.calledWithExactly( 'order' ) );
			} );

			it( 'should load an empty root', () => {
				editor.loadRoot( 'foo' );

				expect( root._isLoaded ).to.be.true;
				expect( editor.getData( { rootName: 'foo' } ) ).to.equal( '' );
				expect( editor.getRootAttributes( 'foo' ) ).to.deep.equal( {} );
			} );

			it( 'should log a warning and not do anything when a root is loaded for the second time', () => {
				editor.loadRoot( 'foo', { data: '<p>Foo</p>', attributes: { order: 100 } } );

				const spy = sinon.spy();

				editor.on( 'loadRoot', spy );
				editor.loadRoot( 'foo', { data: '<p>Bar</p>', attributes: { order: 200 } } );

				expect( console.warn.calledWith( sinon.match( /^multi-root-editor-load-root-already-loaded/ ) ) ).to.be.true;

				expect( root._isLoaded ).to.be.true;
				expect( editor.getData( { rootName: 'foo' } ) ).to.equal( '<p>Foo</p>' );
				expect( editor.getRootAttributes( 'foo' ) ).to.deep.equal( { order: 100 } );

				expect( spy.notCalled ).to.be.true;
			} );

			it( 'should buffer the root in the differ', () => {
				const spy = sinon.spy( editor.model.document.differ, '_bufferRootLoad' );

				editor.loadRoot( 'foo', { data: '<p>Foo</p>', attributes: { order: 100 } } );

				expect( spy.calledWithExactly( root ) ).to.be.true;
			} );

			it( 'should not be undoable', () => {
				editor.loadRoot( 'foo', { data: '<p>Foo</p>', attributes: { order: 100 } } );

				expect( editor.commands.get( 'undo' ).isEnabled ).to.be.false;
			} );
		} );
	} );

	describe( 'model.canEditAt()', () => {
		beforeEach( async () => {
			editor = await MultiRootEditor.create( { main: '<p>Main.</p>' }, { plugins: [ Paragraph, Undo ] } );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'should return false when editor is in read-only mode', () => {
			editor.enableReadOnlyMode( 'test' );
			const result = editor.model.canEditAt( null );

			expect( result ).to.be.false;
		} );

		it( 'should work with all kind of selectables', () => {
			const element = editor.model.document.getRoot( 'main' ).getChild( 0 );
			const position = editor.model.createPositionAt( element, 0 );
			const range = editor.model.createRangeOn( element );
			const ranges = [ range ];
			const emptySelection = editor.model.createSelection();

			const resultSelection = editor.model.canEditAt( editor.model.document.selection );
			const resultPos = editor.model.canEditAt( position );
			const resultRange = editor.model.canEditAt( range );
			const resultNode = editor.model.canEditAt( element );
			const resultRanges = editor.model.canEditAt( ranges );
			const resultEmptySelection = editor.model.canEditAt( emptySelection );
			const resultNull = editor.model.canEditAt( null );

			expect( resultSelection ).to.be.true;
			expect( resultPos ).to.be.true;
			expect( resultRange ).to.be.true;
			expect( resultNode ).to.be.true;
			expect( resultRanges ).to.be.true;
			expect( resultEmptySelection ).to.be.true;
			expect( resultNull ).to.be.true;
		} );

		it( 'should always return false if editor is in read-only state', () => {
			editor.enableReadOnlyMode( 'test' );

			const element = editor.model.document.getRoot( 'main' ).getChild( 0 );
			const position = editor.model.createPositionAt( element, 0 );
			const range = editor.model.createRangeOn( element );
			const ranges = [ range ];
			const emptySelection = editor.model.createSelection();

			const resultSelection = editor.model.canEditAt( editor.model.document.selection );
			const resultPos = editor.model.canEditAt( position );
			const resultRange = editor.model.canEditAt( range );
			const resultNode = editor.model.canEditAt( element );
			const resultRanges = editor.model.canEditAt( ranges );
			const resultEmptySelection = editor.model.canEditAt( emptySelection );
			const resultNull = editor.model.canEditAt( null );

			expect( resultSelection ).to.be.false;
			expect( resultPos ).to.be.false;
			expect( resultRange ).to.be.false;
			expect( resultNode ).to.be.false;
			expect( resultRanges ).to.be.false;
			expect( resultEmptySelection ).to.be.false;
			expect( resultNull ).to.be.false;
		} );

		it( 'should return false when given root is disabled', () => {
			editor.disableRoot( 'main' );

			const element = editor.model.document.getRoot( 'main' ).getChild( 0 );
			const result = editor.model.canEditAt( element );

			expect( result ).to.be.false;
		} );
	} );

	describe( 'enabling / disabling root', () => {
		beforeEach( async () => {
			editor = await MultiRootEditor.create(
				{ main: '<p>Main.</p>', second: '<table><tr><td>Foo.</td></tr></table>' },
				{ plugins: [ Paragraph, Table, Undo, ClipboardPipeline ] }
			);
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'should be able to disable particular root', () => {
			editor.disableRoot( 'second' );

			const mainElement = editor.model.document.getRoot( 'main' ).getChild( 0 );
			const secondElement = editor.model.document.getRoot( 'second' ).getChild( 0 );

			const mainResult = editor.model.canEditAt( mainElement );
			const secondResult = editor.model.canEditAt( secondElement );

			expect( mainResult ).to.be.true;
			expect( secondResult ).to.be.false;
		} );

		it( 'should throw when trying to disable $graveyard root', () => {
			expect( () => {
				editor.disableRoot( '$graveyard' );
			} ).to.throw( CKEditorError, 'multi-root-editor-cannot-disable-graveyard-root' );
		} );

		it( 'should be able to enable disabled root', () => {
			editor.disableRoot( 'second' );

			const element = editor.model.document.getRoot( 'second' ).getChild( 0 );
			let result = editor.model.canEditAt( element );

			expect( result ).to.be.false;

			editor.enableRoot( 'second' );
			result = editor.model.canEditAt( element );

			expect( result ).to.be.true;
		} );

		it( 'should use lockIds for enabling / disabling roots', () => {
			const element = editor.model.document.getRoot( 'second' ).getChild( 0 );

			editor.disableRoot( 'second', 'firstLock' );
			editor.disableRoot( 'second', 'secondLock' );
			editor.disableRoot( 'second', 'secondLock' );

			editor.enableRoot( 'second', 'firstLock' );
			editor.enableRoot( 'second', 'differentLock' );

			let result = editor.model.canEditAt( element );
			expect( result ).to.be.false;

			editor.enableRoot( 'second', 'secondLock' );

			result = editor.model.canEditAt( element );
			expect( result ).to.be.true;
		} );

		it( 'should manage view editables isReadOnly', () => {
			const secondViewRoot = editor.editing.view.document.getRoot( 'second' );
			// Figure, table (0 = div UI element, 1 = table), tbody, tr, td.
			const secondViewTableCell = secondViewRoot.getChild( 0 ).getChild( 1 ).getChild( 0 ).getChild( 0 ).getChild( 0 );

			expect( secondViewRoot.isReadOnly ).to.be.false;
			expect( secondViewTableCell.isReadOnly ).to.be.false;

			editor.disableRoot( 'second' );

			expect( secondViewRoot.isReadOnly ).to.be.true;
			expect( secondViewTableCell.isReadOnly ).to.be.true;

			editor.enableRoot( 'second' );

			expect( secondViewRoot.isReadOnly ).to.be.false;
			expect( secondViewTableCell.isReadOnly ).to.be.false;
		} );
	} );

	describe( 'getFullData()', () => {
		beforeEach( async () => {
			editor = await MultiRootEditor.create( { main: '<p>Main.</p>', old: '<p>Old.</p>' }, {
				plugins: [ Paragraph, Undo ],
				lazyRoots: [ 'abc', 'xyz' ]
			} );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'should return document data for all attached roots and only attached roots', () => {
			editor.addRoot( 'new', { data: '<p>New.</p>' } );
			editor.detachRoot( 'main' );
			editor.addRoot( 'foo', { data: '<p>Foo.</p>' } );
			editor.loadRoot( 'abc', { data: '<p>Abc.</p>' } );

			const fullData = editor.getFullData();

			expect( fullData ).to.deep.equal( {
				old: '<p>Old.</p>',
				foo: '<p>Foo.</p>',
				new: '<p>New.</p>',
				abc: '<p>Abc.</p>'
			} );
		} );

		it( 'should pass options flags to data controller', () => {
			sinon.spy( editor.data, 'get' );

			editor.getFullData( { foo: 'bar' } );

			expect( editor.data.get.calledWith( sinon.match( { foo: 'bar' } ) ) ).to.be.true;
		} );
	} );

	describe( 'createEditable()', () => {
		beforeEach( async () => {
			editor = await MultiRootEditor.create( { foo: '<p>Foo.</p>' }, { plugins: [ Paragraph, Undo ] } );
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should return an HTMLElement which is updated with the downcasted model data', () => {
			editor.addRoot( 'new' );

			const element = editor.createEditable( editor.model.document.getRoot( 'new' ) );

			expect( element.innerHTML ).to.equal( '<p><br data-cke-filler="true"></p>' );
			expect( editor.getData( { rootName: 'new' } ) ).to.equal( '' );

			editor.setData( { new: '<p>New.</p>' } );

			expect( element.innerHTML ).to.equal( '<p>New.</p>' );

			editor.model.change( writer => {
				const root = editor.model.document.getRoot( 'new' );

				writer.insertText( 'Abc.', root.getChild( 0 ), 0 );
			} );

			expect( element.innerHTML ).to.equal( '<p>Abc.New.</p>' );
		} );

		it( 'should create editable in the editor UI view', () => {
			editor.addRoot( 'new' );

			sinon.spy( editor.ui.view, 'createEditable' );

			editor.createEditable( editor.model.document.getRoot( 'new' ) );

			expect( editor.ui.view.createEditable.calledOnce ).to.be.true;
			expect( editor.ui.view.editables.new ).not.to.be.undefined;
		} );

		it( 'should add an editable to editor UI', () => {
			editor.addRoot( 'new' );

			sinon.spy( editor.ui, 'addEditable' );

			editor.createEditable( editor.model.document.getRoot( 'new' ) );

			expect( editor.ui.addEditable.calledOnce ).to.be.true;
			expect( editor.ui.getEditableElement( 'new' ) ).not.to.be.null;
		} );

		it( 'should add custom placeholder to the editable', () => {
			editor.addRoot( 'new' );

			editor.createEditable( editor.model.document.getRoot( 'new' ), 'new' );

			const editableElement = editor.ui.view.editables.new.element;

			expect( editableElement.children[ 0 ].dataset.placeholder ).to.equal( 'new' );
		} );

		it( 'should alow for setting a custom label to the editable', () => {
			editor.addRoot( 'new' );

			editor.createEditable( editor.model.document.getRoot( 'new' ), undefined, 'Custom label' );

			const editableElement = editor.ui.view.editables.new.element;

			expect( editableElement.getAttribute( 'aria-label' ) ).to.equal( 'Custom label' );
		} );
	} );

	describe( 'detachEditable()', () => {
		beforeEach( async () => {
			editor = await MultiRootEditor.create( { foo: '<p>Foo.</p>' }, { plugins: [ Paragraph, Undo ] } );
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should detach the editable element from the model root and return the editable DOM element', () => {
			const editableElement = editor.ui.view.editables.foo.element;

			expect( editableElement.innerHTML ).to.equal( '<p>Foo.</p>' );

			const returnedElement = editor.detachEditable( editor.model.document.getRoot( 'foo' ) );

			expect( returnedElement ).to.equal( editableElement );

			editor.model.change( writer => {
				const root = editor.model.document.getRoot( 'foo' );

				writer.insertText( 'Bar.', root.getChild( 0 ), 'end' );
			} );

			expect( returnedElement.innerHTML ).to.equal( '<p>Foo.</p>' );
		} );

		it( 'should remove the editable from editor UI', () => {
			sinon.spy( editor.ui, 'removeEditable' );

			const editable = editor.ui.view.editables.foo;

			editor.detachEditable( editor.model.document.getRoot( 'foo' ) );

			expect( editor.ui.removeEditable.calledOnce ).to.be.true;
			expect( editor.ui.removeEditable.calledWithExactly( editable ) ).to.be.true;
		} );

		it( 'should remove the editable from the editor UI view', () => {
			sinon.spy( editor.ui.view, 'removeEditable' );

			editor.detachEditable( editor.model.document.getRoot( 'foo' ) );

			expect( editor.ui.view.editables.foo ).to.be.undefined;

			expect( editor.ui.view.removeEditable.calledOnce ).to.be.true;
			expect( editor.ui.view.removeEditable.calledWithExactly( 'foo' ) ).to.be.true;
		} );
	} );

	it( 'should fire `addRoot` event when a root is added in model', done => {
		MultiRootEditor.create( { foo: '' }, { plugins: [ Paragraph, Undo ] } ).then( editor => {
			editor.on( 'addRoot', ( evt, root ) => {
				expect( root.rootName ).to.equal( 'new' );
				expect( root.name ).to.equal( 'div' );

				done();
			} );

			editor.model.change( writer => {
				writer.addRoot( 'new', 'div' );
			} );

			return editor.destroy();
		} );
	} );

	it( 'should fire `detachRoot` event when a root is detached from model', done => {
		MultiRootEditor.create( { foo: '' }, { plugins: [ Paragraph, Undo ] } ).then( editor => {
			editor.on( 'detachRoot', ( evt, root ) => {
				expect( root.rootName ).to.equal( 'foo' );
				expect( root.name ).to.equal( '$root' );

				done();
			} );

			editor.model.change( writer => {
				writer.detachRoot( 'foo' );
			} );

			return editor.destroy();
		} );
	} );

	it( 'should first fire `detachRoot` event then `addRoot` event', () => {
		const events = [];

		return MultiRootEditor.create( { foo: '' }, { plugins: [ Paragraph, Undo ] } ).then( editor => {
			editor.on( 'addRoot', () => {
				events.push( 'addRoot' );
			} );

			editor.on( 'detachRoot', () => {
				events.push( 'detachRoot' );
			} );

			editor.model.change( writer => {
				writer.addRoot( 'bar' );
				writer.detachRoot( 'foo' );
			} );

			return editor.destroy();
		} ).then( () => {
			expect( events ).to.deep.equal( [ 'detachRoot', 'addRoot' ] );
		} );
	} );

	describe( 'EditorConfig#rootsAttributes', () => {
		it( 'should load attributes from editor configuration', async () => {
			editor = await MultiRootEditor.create( { foo: '', bar: '' }, {
				rootsAttributes: {
					foo: { order: 10, isLocked: null },
					bar: { order: null, isLocked: false }
				}
			} );

			const fooRoot = editor.model.document.getRoot( 'foo' );
			const barRoot = editor.model.document.getRoot( 'bar' );

			expect( fooRoot.getAttribute( 'order' ) ).to.equal( 10 );
			expect( fooRoot.hasAttribute( 'isLocked' ) ).to.be.false;

			expect( barRoot.hasAttribute( 'order' ) ).to.be.false;
			expect( barRoot.getAttribute( 'isLocked' ) ).to.be.false;

			await editor.destroy();
		} );

		it( 'should register all root attributes passed in the config', async () => {
			editor = await MultiRootEditor.create( { foo: '', bar: '' }, {
				rootsAttributes: {
					foo: { order: 10 },
					bar: { isLocked: false }
				}
			} );

			expect( editor.getRootsAttributes() ).to.deep.equal( {
				foo: { order: 10, isLocked: null },
				bar: { order: null, isLocked: false }
			} );

			expect( editor.editing.model.schema.checkAttribute( '$root', 'order' ) ).to.be.true;
			expect( editor.editing.model.schema.checkAttribute( '$root', 'isLocked' ) ).to.be.true;

			await editor.destroy();
		} );

		it( 'should throw when trying to set an attribute on non-existing root', done => {
			MultiRootEditor.create( { foo: '', bar: '' }, {
				rootsAttributes: {
					abc: { order: 10, isLocked: null }
				}
			} ).then(
				() => {
					expect.fail( 'Expected multi-root-editor-root-attributes-no-root to be thrown.' );
				},
				err => {
					assertCKEditorError( err, 'multi-root-editor-root-attributes-no-root' );
				}
			)
				.then( done )
				.catch( done );
		} );
	} );

	describe( '#getRootAttributes()', () => {
		it( 'should return current values of attributes of the given root', async () => {
			editor = await MultiRootEditor.create( { foo: '', bar: '' }, {
				rootsAttributes: {
					foo: { order: 10, isLocked: true },
					bar: { order: 20, isLocked: false }
				}
			} );

			editor.model.change( writer => {
				writer.setAttribute( 'order', 30, editor.model.document.getRoot( 'foo' ) );
				writer.setAttribute( 'isLocked', true, editor.model.document.getRoot( 'bar' ) );
			} );

			expect( editor.getRootAttributes( 'foo' ) ).to.deep.equal( {
				isLocked: true,
				order: 30
			} );

			expect( editor.getRootAttributes( 'bar' ) ).to.deep.equal( {
				isLocked: true,
				order: 20
			} );

			await editor.destroy();
		} );

		it( 'should return roots attributes that were registered', async () => {
			editor = await MultiRootEditor.create( { foo: '', bar: '' }, {
				rootsAttributes: {
					foo: { order: 10 },
					bar: {}
				}
			} );

			editor.registerRootAttribute( 'isLocked' );

			editor.model.change( writer => {
				writer.setAttribute( 'isLocked', true, editor.model.document.getRoot( 'bar' ) );
			} );

			expect( editor.getRootAttributes( 'foo' ) ).to.deep.equal( {
				isLocked: null,
				order: 10
			} );

			expect( editor.getRootAttributes( 'bar' ) ).to.deep.equal( {
				isLocked: true,
				order: null
			} );

			await editor.destroy();
		} );

		it( 'should not return roots attributes that were not registered', async () => {
			editor = await MultiRootEditor.create( { foo: '', bar: '' }, {
				rootsAttributes: {
					foo: { order: 10, isLocked: true },
					bar: { order: 20, isLocked: false }
				}
			} );

			editor.model.change( writer => {
				writer.setAttribute( 'keyA', 'foo', editor.model.document.getRoot( 'foo' ) );
				writer.setAttribute( 'keyB', 'bar', editor.model.document.getRoot( 'bar' ) );
			} );

			expect( editor.getRootAttributes( 'foo' ) ).to.deep.equal( {
				isLocked: true,
				order: 10
			} );

			expect( editor.getRootAttributes( 'bar' ) ).to.deep.equal( {
				isLocked: false,
				order: 20
			} );

			await editor.destroy();
		} );

		it( 'should properly handle null values', async () => {
			editor = await MultiRootEditor.create( { foo: '', bar: '' }, {
				rootsAttributes: {
					foo: { order: 10, isLocked: null },
					bar: { order: null, isLocked: false }
				}
			} );

			editor.model.change( writer => {
				writer.setAttribute( 'isLocked', true, editor.model.document.getRoot( 'foo' ) );
			} );

			expect( editor.getRootAttributes( 'foo' ) ).to.deep.equal( {
				isLocked: true,
				order: 10
			} );

			expect( editor.getRootAttributes( 'bar' ) ).to.deep.equal( {
				isLocked: false,
				order: null
			} );

			await editor.destroy();
		} );

		it( 'should return attributes added while adding roots', async () => {
			// Empty multi-root, no roots, no roots attributes.
			editor = await MultiRootEditor.create( {} );

			editor.addRoot( 'foo', { attributes: { order: 10, isLocked: null } } );
			editor.addRoot( 'bar', { attributes: { order: null, isLocked: true } } );

			editor.model.change( writer => {
				writer.setAttribute( 'order', 30, editor.model.document.getRoot( 'foo' ) );
			} );

			expect( editor.getRootAttributes( 'foo' ) ).to.deep.equal( {
				isLocked: null,
				order: 30
			} );

			expect( editor.getRootAttributes( 'bar' ) ).to.deep.equal( {
				isLocked: true,
				order: null
			} );

			await editor.destroy();
		} );
	} );

	describe( '#getRootsAttributes()', () => {
		it( 'should return current values of roots attributes', async () => {
			editor = await MultiRootEditor.create( { foo: '', bar: '' }, {
				rootsAttributes: {
					foo: { order: 10, isLocked: true },
					bar: { order: 20, isLocked: false }
				}
			} );

			editor.model.change( writer => {
				writer.setAttribute( 'order', 30, editor.model.document.getRoot( 'foo' ) );
				writer.setAttribute( 'isLocked', true, editor.model.document.getRoot( 'bar' ) );
			} );

			sinon.spy( editor, 'getRootAttributes' );

			expect( editor.getRootsAttributes() ).to.deep.equal( {
				bar: {
					isLocked: true,
					order: 20
				},
				foo: {
					isLocked: true,
					order: 30
				}
			} );

			expect( editor.getRootAttributes.calledWith( 'foo' ) ).to.be.true;
			expect( editor.getRootAttributes.calledWith( 'bar' ) ).to.be.true;

			await editor.destroy();
		} );

		it( 'should return all and only roots attributes that were registered', async () => {
			editor = await MultiRootEditor.create( { foo: '', bar: '' }, {
				rootsAttributes: {
					foo: { order: 10 },
					bar: {}
				}
			} );

			editor.registerRootAttribute( 'isLocked' );

			editor.model.change( writer => {
				writer.setAttribute( 'isLocked', true, editor.model.document.getRoot( 'bar' ) );

				// Not registered:
				writer.setAttribute( 'abc', true, editor.model.document.getRoot( 'foo' ) );
				writer.setAttribute( 'abc', false, editor.model.document.getRoot( 'bar' ) );
			} );

			expect( editor.getRootsAttributes( 'foo' ) ).to.deep.equal( {
				foo: {
					isLocked: null,
					order: 10
				},
				bar: {
					isLocked: true,
					order: null
				}
			} );

			await editor.destroy();
		} );

		it( 'should return attributes for all and only currently attached roots', async () => {
			editor = await MultiRootEditor.create( { foo: '', bar: '' }, {
				rootsAttributes: {
					foo: { order: 10, isLocked: true },
					bar: { order: 20, isLocked: false }
				},
				lazyRoots: [ 'xxx', 'yyy' ]
			} );

			editor.detachRoot( 'bar' );
			editor.addRoot( 'abc', { attributes: { order: 30 } } );
			editor.loadRoot( 'xxx', { data: '', attributes: { order: 40, isLocked: false } } );

			expect( editor.getRootsAttributes() ).to.deep.equal( {
				abc: {
					isLocked: null,
					order: 30
				},
				foo: {
					isLocked: true,
					order: 10
				},
				xxx: {
					isLocked: false,
					order: 40
				}
			} );

			await editor.destroy();
		} );
	} );

	describe( 'destroy', () => {
		describe( 'editor with data', () => {
			beforeEach( function() {
				return MultiRootEditor
					.create( editorData, { plugins: [ Paragraph ] } )
					.then( newEditor => {
						editor = newEditor;
					} );
			} );

			test( () => editorData );
		} );

		describe( 'editor with editable element', () => {
			let editableElements;

			beforeEach( function() {
				editableElements = {
					foo: document.createElement( 'div' ),
					bar: document.createElement( 'div' )
				};

				editableElements.foo.innerHTML = editorData.foo;
				editableElements.bar.innerHTML = editorData.bar;

				return MultiRootEditor
					.create( editableElements, { plugins: [ Paragraph ] } )
					.then( newEditor => {
						editor = newEditor;
					} );
			} );

			// We don't update the source element by default, so after destroy, it should become empty.
			it( 'don\'t set data back to the element', () => {
				editor.setData( { foo: '<p>Abc</p>', bar: '<p>Xyz</p>' } );

				return editor.destroy()
					.then( () => {
						expect( editableElements.foo.innerHTML ).to.equal( '' );
						expect( editableElements.bar.innerHTML ).to.equal( '' );
					} );
			} );

			// Adding `updateSourceElementOnDestroy` config to the editor allows setting the data
			// back to the source element after destroy.
			it( 'sets data back to the element', () => {
				editor.config.set( 'updateSourceElementOnDestroy', true );
				editor.setData( { foo: '<p>Abc</p>', bar: '<p>Xyz</p>' } );

				return editor.destroy()
					.then( () => {
						expect( editableElements.foo.innerHTML ).to.equal( '<p>Abc</p>' );
						expect( editableElements.bar.innerHTML ).to.equal( '<p>Xyz</p>' );
					} );
			} );

			test( () => editableElements );
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
		it( 'MultiRootEditor.Context', () => {
			expect( MultiRootEditor.Context ).to.equal( Context );
		} );

		it( 'MultiRootEditor.EditorWatchdog', () => {
			expect( MultiRootEditor.EditorWatchdog ).to.equal( EditorWatchdog );
		} );

		it( 'MultiRootEditor.ContextWatchdog', () => {
			expect( MultiRootEditor.ContextWatchdog ).to.equal( ContextWatchdog );
		} );
	} );

	describeMemoryUsage( () => {
		testMemoryUsage(
			'should not grow on multiple create/destroy',
			() => MultiRootEditor
				.create( {
					foo: document.querySelector( '#mem-editor' )
				}, {
					plugins: [ ArticlePluginSet ],
					toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote' ],
					image: {
						toolbar: [ 'imageStyle:block', 'imageStyle:wrapText', '|', 'imageTextAlternative' ]
					}
				} ) );
	} );
} );
