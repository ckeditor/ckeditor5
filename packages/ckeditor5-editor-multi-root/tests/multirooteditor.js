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
