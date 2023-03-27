/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, console */

import MultiRootEditor from '../src/multirooteditor';
import MultiRootEditorUI from '../src/multirooteditorui';
import MultiRootEditorUIView from '../src/multirooteditoruiview';

import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';

import Context from '@ckeditor/ckeditor5-core/src/context';
import EditorWatchdog from '@ckeditor/ckeditor5-watchdog/src/editorwatchdog';
import ContextWatchdog from '@ckeditor/ckeditor5-watchdog/src/contextwatchdog';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import RootElement from '@ckeditor/ckeditor5-engine/src/model/rootelement';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import { describeMemoryUsage, testMemoryUsage } from '@ckeditor/ckeditor5-core/tests/_utils/memory';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import { assertCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

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

				editor.destroy();
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

				editor.destroy();
			} );
		} );

		it( 'initializes the editor if no roots are specified', done => {
			MultiRootEditor.create( {} ).then( editor => {
				editor.destroy();
				done();
			} );
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
						toolbar: [ 'imageStyle:block', 'imageStyle:side', '|', 'imageTextAlternative' ]
					}
				} ) );
	} );
} );
