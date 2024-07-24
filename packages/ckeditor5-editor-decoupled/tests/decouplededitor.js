/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, setTimeout, console */

import DecoupledEditor from '../src/decouplededitor.js';
import DecoupledEditorUI from '../src/decouplededitorui.js';
import DecoupledEditorUIView from '../src/decouplededitoruiview.js';

import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor.js';

import Context from '@ckeditor/ckeditor5-core/src/context.js';
import EditorWatchdog from '@ckeditor/ckeditor5-watchdog/src/editorwatchdog.js';
import ContextWatchdog from '@ckeditor/ckeditor5-watchdog/src/contextwatchdog.js';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import RootElement from '@ckeditor/ckeditor5-engine/src/model/rootelement.js';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror.js';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import { describeMemoryUsage, testMemoryUsage } from '@ckeditor/ckeditor5-core/tests/_utils/memory.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
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

		it( 'uses HTMLDataProcessor', () => {
			expect( editor.data.processor ).to.be.instanceof( HtmlDataProcessor );
		} );

		it( 'has a Data Interface', () => {
			expect( DecoupledEditor.prototype ).have.property( 'setData' ).to.be.a( 'function' );
			expect( DecoupledEditor.prototype ).have.property( 'getData' ).to.be.a( 'function' );
		} );

		it( 'creates main root element', () => {
			expect( editor.model.document.getRoot( 'main' ) ).to.instanceof( RootElement );
		} );

		describe( 'ui', () => {
			it( 'is created', () => {
				editor.ui.init();

				expect( editor.ui ).to.be.instanceof( DecoupledEditorUI );
				expect( editor.ui.view ).to.be.instanceof( DecoupledEditorUIView );

				editor.ui.destroy();
			} );

			describe( 'automatic toolbar items groupping', () => {
				it( 'should be on by default', () => {
					const editorElement = document.createElement( 'div' );
					const editor = new DecoupledEditor( editorElement );

					expect( editor.ui.view.toolbar.options.shouldGroupWhenFull ).to.be.true;

					editorElement.remove();
				} );

				it( 'can be disabled using config.toolbar.shouldNotGroupWhenFull', () => {
					const editorElement = document.createElement( 'div' );
					const editor = new DecoupledEditor( editorElement, {
						toolbar: {
							shouldNotGroupWhenFull: true
						}
					} );

					expect( editor.ui.view.toolbar.options.shouldGroupWhenFull ).to.be.false;

					editorElement.remove();
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

				it( 'should support the string format', async () => {
					const editor = await DecoupledEditor.create( editorElement, {
						plugins: [ Paragraph, Bold ],
						label: 'Custom label'
					} );

					expect( editor.editing.view.getDomRoot().getAttribute( 'aria-label' ) ).to.equal(
						'Custom label'
					);

					await editor.destroy();
				} );

				it( 'should support object format', async () => {
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

				it( 'should override the existing value from the source DOM element', async () => {
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
			} );
		} );

		describe( 'config.initialData', () => {
			it( 'if not set, is set using DOM element data', () => {
				const editorElement = document.createElement( 'div' );
				editorElement.innerHTML = '<p>Foo</p>';

				const editor = new DecoupledEditor( editorElement );

				expect( editor.config.get( 'initialData' ) ).to.equal( '<p>Foo</p>' );
			} );

			it( 'if not set, is set using data passed in constructor', () => {
				const editor = new DecoupledEditor( '<p>Foo</p>' );

				expect( editor.config.get( 'initialData' ) ).to.equal( '<p>Foo</p>' );
			} );

			it( 'if set, is not overwritten with DOM element data', () => {
				const editorElement = document.createElement( 'div' );
				editorElement.innerHTML = '<p>Foo</p>';

				const editor = new DecoupledEditor( editorElement, { initialData: '<p>Bar</p>' } );

				expect( editor.config.get( 'initialData' ) ).to.equal( '<p>Bar</p>' );
			} );

			it( 'it should throw if config.initialData is set and initial data is passed in constructor', () => {
				expect( () => {
					// eslint-disable-next-line no-new
					new DecoupledEditor( '<p>Foo</p>', { initialData: '<p>Bar</p>' } );
				} ).to.throw( CKEditorError, 'editor-create-initial-data' );
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

		it( 'initializes with config.initialData', () => {
			return DecoupledEditor.create( document.createElement( 'div' ), {
				initialData: '<p>Hello world!</p>',
				plugins: [ Paragraph ]
			} ).then( editor => {
				expect( editor.getData() ).to.equal( '<p>Hello world!</p>' );

				editor.destroy();
			} );
		} );

		// https://github.com/ckeditor/ckeditor5/issues/8974
		it( 'initializes with empty content if config.initialData is set to an empty string', () => {
			return DecoupledEditor.create( document.createElement( 'div' ), {
				initialData: '',
				plugins: [ Paragraph ]
			} ).then( editor => {
				expect( editor.getData() ).to.equal( '' );

				editor.destroy();
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

	describeMemoryUsage( () => {
		testMemoryUsage(
			'should not grow on multiple create/destroy',
			() => DecoupledEditor
				.create( document.querySelector( '#mem-editor' ), {
					plugins: [ ArticlePluginSet ],
					toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote' ],
					image: {
						toolbar: [ 'imageStyle:block', 'imageStyle:wrapText', '|', 'imageTextAlternative' ]
					}
				} ) );
	} );
} );
