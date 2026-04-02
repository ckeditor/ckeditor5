/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { MultiRootEditor } from '../src/multirooteditor.js';
import { MultiRootEditorUI } from '../src/multirooteditorui.js';
import { MultiRootEditorUIView } from '../src/multirooteditoruiview.js';

import { HtmlDataProcessor, ModelRootElement } from '@ckeditor/ckeditor5-engine';

import { Context, Plugin } from '@ckeditor/ckeditor5-core';
import { EditorWatchdog, ContextWatchdog } from '@ckeditor/ckeditor5-watchdog';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Bold } from '@ckeditor/ckeditor5-basic-styles';
import { Undo } from '@ckeditor/ckeditor5-undo';
import { Table } from '@ckeditor/ckeditor5-table';
import { ClipboardPipeline } from '@ckeditor/ckeditor5-clipboard';
import { CKEditorError } from '@ckeditor/ckeditor5-utils';

import { testUtils } from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

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

			expect( editor.model.document.getRoot( 'foo' ) ).to.instanceof( ModelRootElement );
			expect( editor.model.document.getRoot( 'bar' ) ).to.instanceof( ModelRootElement );

			expect( editor.model.document.getRoot( 'foo' ).name ).to.equal( '$root' );
			expect( editor.model.document.getRoot( 'bar' ).name ).to.equal( '$root' );
		} );

		it( 'creates roots with the given modelElement names', () => {
			const customEditor = new MultiRootEditor( {
				roots: {
					foo: { modelElement: 'customRoot', initialData: '' },
					bar: { initialData: '' }
				}
			} );

			expect( customEditor.model.document.getRoot( 'foo' ).name ).to.equal( 'customRoot' );
			expect( customEditor.model.document.getRoot( 'bar' ).name ).to.equal( '$root' );

			customEditor.fire( 'ready' );

			return customEditor.destroy();
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

				expect( editor.config.get( 'roots' ).foo.initialData ).to.equal( '<p>Foo</p>' );
				expect( editor.config.get( 'roots' ).bar.initialData ).to.equal( '<p>Bar</p>' );
			} );

			it( 'if not set, is set using data passed in constructor', () => {
				const editor = new MultiRootEditor( { foo: '<p>Foo</p>', bar: '<p>Bar</p>' } );

				expect( editor.config.get( 'roots' ).foo.initialData ).to.equal( '<p>Foo</p>' );
				expect( editor.config.get( 'roots' ).bar.initialData ).to.equal( '<p>Bar</p>' );
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

			it( 'should throw if legacy config.initialData is set and initial data is passed in constructor', () => {
				expect( () => {
					// eslint-disable-next-line no-new
					new MultiRootEditor(
						{ foo: '<p>Foo</p>', bar: '<p>Bar</p>' },
						{ initialData: { foo: '<p>Foo</p>', bar: '<p>Bar</p>' } }
					);
				} ).to.throw( CKEditorError, 'editor-create-initial-data-overspecified' );
			} );

			it( 'it should throw if config.roots.<name>.initialData is set and initial data is passed in constructor', () => {
				expect( () => {
					// eslint-disable-next-line no-new
					new MultiRootEditor(
						{ foo: '<p>Foo</p>', bar: '<p>Bar</p>' },
						{ roots: { foo: { initialData: '<p>Bar</p>' }, bar: { initialData: '<p>Abc</p>' } } }
					);
				} ).to.throw( CKEditorError, 'editor-create-root-initial-data-overspecified' );
			} );

			it( 'it should throw if config.root is set', () => {
				const editorElement = document.createElement( 'div' );
				editorElement.innerHTML = '<p>Foo</p>';

				expect( () => {
					// eslint-disable-next-line no-new
					new MultiRootEditor( editorElement, {
						root: { initialData: '<p>abc</p>' }
					} );
				} ).to.throw( CKEditorError, 'editor-create-multi-root-with-main' );
			} );
		} );

		describe( 'config.roots.*.placeholder', () => {
			it( 'should normalize config.roots.*.placeholder', () => {
				const editor = new MultiRootEditor(
					{ foo: '<p>Foo</p>', bar: '<p>Bar</p>' },
					{
						roots: {
							foo: { placeholder: 'Type in foo...' },
							bar: { placeholder: 'Type in bar...' }
						}
					}
				);

				expect( editor.config.get( 'roots' ).foo.placeholder ).to.equal( 'Type in foo...' );
				expect( editor.config.get( 'roots' ).bar.placeholder ).to.equal( 'Type in bar...' );
			} );

			it( 'should normalize legacy config.placeholder object to config.roots.*.placeholder (legacy)', () => {
				const editor = new MultiRootEditor(
					{ foo: '<p>Foo</p>', bar: '<p>Bar</p>' },
					{
						placeholder: {
							foo: 'Type in foo...',
							bar: 'Type in bar...'
						}
					}
				);

				expect( editor.config.get( 'roots' ).foo.placeholder ).to.equal( 'Type in foo...' );
				expect( editor.config.get( 'roots' ).bar.placeholder ).to.equal( 'Type in bar...' );
			} );
		} );

		describe( 'config.roots.*.label', () => {
			it( 'should normalize config.roots.*.label', () => {
				const editor = new MultiRootEditor(
					{ foo: '<p>Foo</p>', bar: '<p>Bar</p>' },
					{
						roots: {
							foo: { label: 'Foo label' },
							bar: { label: 'Bar label' }
						}
					}
				);

				expect( editor.config.get( 'roots' ).foo.label ).to.equal( 'Foo label' );
				expect( editor.config.get( 'roots' ).bar.label ).to.equal( 'Bar label' );
			} );

			it( 'should normalize legacy config.label object to config.roots.*.label (legacy)', () => {
				const editor = new MultiRootEditor(
					{ foo: '<p>Foo</p>', bar: '<p>Bar</p>' },
					{
						label: {
							foo: 'Foo label',
							bar: 'Bar label'
						}
					}
				);

				expect( editor.config.get( 'roots' ).foo.label ).to.equal( 'Foo label' );
				expect( editor.config.get( 'roots' ).bar.label ).to.equal( 'Bar label' );
			} );
		} );

		describe( 'config-only constructor', () => {
			it( 'should create editor with config.roots.*.initialData', () => {
				const editor = new MultiRootEditor( {
					roots: {
						foo: { initialData: '<p>Foo</p>' },
						bar: { initialData: '<p>Bar</p>' }
					}
				} );

				expect( editor.config.get( 'roots' ).foo.initialData ).to.equal( '<p>Foo</p>' );
				expect( editor.config.get( 'roots' ).bar.initialData ).to.equal( '<p>Bar</p>' );
			} );

			it( 'should create editor with config.roots.*.element', () => {
				const fooEl = document.createElement( 'div' );
				fooEl.innerHTML = '<p>Foo</p>';
				const barEl = document.createElement( 'div' );
				barEl.innerHTML = '<p>Bar</p>';

				const editor = new MultiRootEditor( {
					roots: {
						foo: { element: fooEl },
						bar: { element: barEl }
					}
				} );

				expect( editor.sourceElements.foo ).to.equal( fooEl );
				expect( editor.sourceElements.bar ).to.equal( barEl );
				expect( editor.config.get( 'roots' ).foo.initialData ).to.equal( '<p>Foo</p>' );
				expect( editor.config.get( 'roots' ).bar.initialData ).to.equal( '<p>Bar</p>' );
			} );

			it( 'should create editor with config.roots.*.element and initialData', () => {
				const fooEl = document.createElement( 'div' );
				fooEl.innerHTML = '<p>123</p>';
				const barEl = document.createElement( 'div' );
				barEl.innerHTML = '<p>456</p>';

				const editor = new MultiRootEditor( {
					roots: {
						foo: { element: fooEl, initialData: '<p>Foo</p>' },
						bar: { element: barEl, initialData: '<p>Bar</p>' }
					}
				} );

				expect( editor.sourceElements.foo ).to.equal( fooEl );
				expect( editor.sourceElements.bar ).to.equal( barEl );
				expect( editor.config.get( 'roots' ).foo.initialData ).to.equal( '<p>Foo</p>' );
				expect( editor.config.get( 'roots' ).bar.initialData ).to.equal( '<p>Bar</p>' );
			} );

			it( 'should throw when config.attachTo is set', () => {
				const el = document.createElement( 'div' );

				expect( () => {
					// eslint-disable-next-line no-new
					new MultiRootEditor( {
						attachTo: el,
						roots: {
							foo: { initialData: '' }
						}
					} );
				} ).to.throw( CKEditorError, 'editor-create-attachto-ignored' );
			} );

			it( 'should throw when config.roots.*.element is a textarea', () => {
				expect( () => {
					// eslint-disable-next-line no-new
					new MultiRootEditor( {
						roots: {
							foo: { element: document.createElement( 'textarea' ) }
						}
					} );
				} ).to.throw( CKEditorError, 'editor-wrong-element' );
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

		it( 'initializes with legacy config.initialData', () => {
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

		it( 'initializes with empty content if legacy config.initialData is set to an empty string', () => {
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

		it( 'creates editor from config-only', () => {
			return MultiRootEditor
				.create( {
					roots: {
						foo: { initialData: '<p>Foo</p>' },
						bar: { initialData: '<p>Bar</p>' }
					},
					plugins: [ Paragraph ]
				} )
				.then( newEditor => {
					expect( newEditor.getData( { rootName: 'foo' } ) ).to.equal( '<p>Foo</p>' );
					expect( newEditor.getData( { rootName: 'bar' } ) ).to.equal( '<p>Bar</p>' );

					return newEditor.destroy();
				} );
		} );

		it( 'creates editor from config-only with roots.*.element', () => {
			const fooEl = document.createElement( 'div' );
			fooEl.innerHTML = '<p>Foo</p>';
			const barEl = document.createElement( 'div' );
			barEl.innerHTML = '<p>Bar</p>';

			return MultiRootEditor
				.create( {
					roots: {
						foo: { element: fooEl },
						bar: { element: barEl }
					},
					plugins: [ Paragraph, Bold ]
				} )
				.then( newEditor => {
					expect( newEditor.getData( { rootName: 'foo' } ) ).to.equal( '<p>Foo</p>' );
					expect( newEditor.getData( { rootName: 'bar' } ) ).to.equal( '<p>Bar</p>' );
					expect( newEditor.sourceElements.foo ).to.equal( fooEl );
					expect( newEditor.sourceElements.bar ).to.equal( barEl );

					return newEditor.destroy();
				} );
		} );

		it( 'creates editor from config-only with roots.*.element and initialData', () => {
			const fooEl = document.createElement( 'div' );
			fooEl.innerHTML = '<p>123</p>';
			const barEl = document.createElement( 'div' );
			barEl.innerHTML = '<p>456</p>';

			return MultiRootEditor
				.create( {
					roots: {
						foo: { element: fooEl, initialData: '<p>Foo</p>' },
						bar: { element: barEl, initialData: '<p>Bar</p>' }
					},
					plugins: [ Paragraph, Bold ]
				} )
				.then( newEditor => {
					expect( newEditor.getData( { rootName: 'foo' } ) ).to.equal( '<p>Foo</p>' );
					expect( newEditor.getData( { rootName: 'bar' } ) ).to.equal( '<p>Bar</p>' );
					expect( newEditor.sourceElements.foo ).to.equal( fooEl );
					expect( newEditor.sourceElements.bar ).to.equal( barEl );

					return newEditor.destroy();
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

		it( 'throws error when source element conflicts with config.roots.<rootName>.element', () => {
			const fooEl = document.createElement( 'div' );
			fooEl.innerHTML = '<p>Foo</p>';

			const existingEl = document.createElement( 'div' );

			expect( () => {
				// eslint-disable-next-line no-new
				new MultiRootEditor(
					{ foo: fooEl },
					{ roots: { foo: { element: existingEl } } }
				);
			} ).to.throw( CKEditorError, 'editor-create-root-element-overspecified' );
		} );

		it( 'throws error when deprecated config.lazyRoots is used', done => {
			MultiRootEditor.create( editorData, {
				lazyRoots: [ 'baz' ]
			} )
				.then(
					() => {
						expect.fail( 'Multi-root editor should throw an error when deprecated lazyRoots config is used.' );
					},
					err => {
						assertCKEditorError( err, 'multi-root-editor-root-deprecated-config-lazy-roots', null );
					}
				)
				.then( done )
				.catch( done );
		} );

		it( 'normalizes legacy config.rootsAttributes to config.roots.<rootName>.modelAttributes', async () => {
			editor = await MultiRootEditor.create( editorData, {
				rootsAttributes: { foo: { order: 1 }, bar: { order: 2 } }
			} );

			const fooRoot = editor.model.document.getRoot( 'foo' );
			const barRoot = editor.model.document.getRoot( 'bar' );

			expect( fooRoot.getAttribute( 'order' ) ).to.equal( 1 );
			expect( barRoot.getAttribute( 'order' ) ).to.equal( 2 );

			await editor.destroy();
		} );

		it( 'throws error when legacy config.rootsAttributes references a non-existing root', done => {
			MultiRootEditor.create( editorData, {
				rootsAttributes: { foo: { order: 1 }, nonExisting: { order: 2 } }
			} )
				.then(
					() => {
						expect.fail( 'Expected multi-root-editor-root-attributes-no-root to be thrown.' );
					},
					err => {
						assertCKEditorError( err, 'multi-root-editor-root-attributes-no-root', null );
					}
				)
				.then( done )
				.catch( done );
		} );

		it( 'throws error when legacy config.rootsAttributes conflicts with config.roots.<rootName>.modelAttributes', done => {
			MultiRootEditor.create( editorData, {
				rootsAttributes: { foo: { order: 1 } },
				roots: {
					foo: { modelAttributes: { order: 10 } },
					bar: {}
				}
			} )
				.then(
					() => {
						expect.fail( 'Expected multi-root-editor-root-attributes-conflict to be thrown.' );
					},
					err => {
						assertCKEditorError( err, 'multi-root-editor-root-attributes-conflict', null );
					}
				)
				.then( done )
				.catch( done );
		} );

		// This case should not throw as 'foo' and 'bar' roots are defined, but the DOM element for 'foo' is provided
		// and the DOM element for 'bar' is created by the editor.
		it.skip( 'throws error when initial roots are different than initial data - missing root in initial roots', done => {
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

		it( 'throws error when initial roots are different than initial data - initialData new root injection', done => {
			// Artificial fake plugin that simulates a change in initialData as the editor is initialized.
			class ChangeInitialData {
				constructor( editor ) {
					this.editor = editor;
				}

				init() {
					// Add initial data for some previously undefined root.
					this.editor.config.set( 'roots', {
						...this.editor.config.get( 'roots' ),
						bar: { initialData: '<p>Bar</p>' }
					} );
				}
			}

			MultiRootEditor.create( {
				foo: document.createElement( 'div' )
			}, {
				initialData: {
					foo: '<p>Foo</p>'
				},
				extraPlugins: [ ChangeInitialData ]
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

		// This case should not throw as 'foo' and 'bar' roots are defined, but the initialData for 'bar' is extracted from the DOM element.
		it.skip( 'throws error when initial roots are different than initial data - missing root in initial data', done => {
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

		it( 'throws error when initial roots are different than initial data - initialData for root removed', done => {
			// Artificial fake plugin that simulates a change in initialData as the editor is initialized.
			class ChangeInitialData {
				constructor( editor ) {
					this.editor = editor;
				}

				init() {
					// Remove initial data for some previously defined root.
					this.editor.config.set( 'roots', {
						...this.editor.config.get( 'roots' ),
						bar: {
							...this.editor.config.get( 'roots' ).bar,
							initialData: undefined
						}
					} );
				}
			}

			MultiRootEditor.create( {
				foo: document.createElement( 'div' ),
				bar: document.createElement( 'div' )
			}, {
				initialData: {
					foo: '<p>Foo</p>',
					bar: '<p>Bar</p>'
				},
				extraPlugins: [ ChangeInitialData ]
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

			it( 'should support the legacy config.label string format', async () => {
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

			it( 'should support the legacy config.label object format', async () => {
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

			it( 'should support the legacy config.label object format (mix default and custom label)', async () => {
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

			it( 'should override the existing value from the source DOM element (legacy config.label)', async () => {
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

			it( 'should support roots.<rootName>.label format', async () => {
				const editor = await MultiRootEditor.create( {
					foo: 'Foo content',
					bar: 'Bar content'
				}, {
					plugins: [ Paragraph, Bold ],
					roots: {
						foo: { label: 'Foo root label' },
						bar: { label: 'Bar root label' }
					}
				} );

				expect( editor.editing.view.getDomRoot( 'foo' ).getAttribute( 'aria-label' ) ).to.equal(
					'Foo root label'
				);

				expect( editor.editing.view.getDomRoot( 'bar' ).getAttribute( 'aria-label' ) ).to.equal(
					'Bar root label'
				);

				await editor.destroy();
			} );

			it( 'should support roots.<rootName>.label in config-only constructor', async () => {
				const editor = await MultiRootEditor.create( {
					roots: {
						foo: { initialData: '<p>Foo</p>', label: 'Foo root label' },
						bar: { initialData: '<p>Bar</p>', label: 'Bar root label' }
					},
					plugins: [ Paragraph, Bold ]
				} );

				expect( editor.editing.view.getDomRoot( 'foo' ).getAttribute( 'aria-label' ) ).to.equal(
					'Foo root label'
				);

				expect( editor.editing.view.getDomRoot( 'bar' ).getAttribute( 'aria-label' ) ).to.equal(
					'Bar root label'
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

		it( 'should add a model root with default name', () => {
			editor.addRoot( 'bar', {} );

			const root = editor.model.document.getRoot( 'bar' );

			expect( root.name ).to.equal( '$root' );
		} );

		it( 'should add a model root with given modelElement', () => {
			editor.addRoot( 'bar', { modelElement: 'customRoot' } );

			const root = editor.model.document.getRoot( 'bar' );

			expect( root.name ).to.equal( 'customRoot' );
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

		it( 'should init the root with given initialData', () => {
			editor.addRoot( 'bar', { initialData: '<p>Foo.</p>' } );

			expect( editor.getData( { rootName: 'bar' } ) ).to.equal( '<p>Foo.</p>' );
		} );

		it( 'should add a model root with given modelAttributes', () => {
			sinon.spy( editor, 'registerRootAttribute' );

			editor.addRoot( 'bar', { modelAttributes: { order: 20, isLocked: true } } );

			const root = editor.model.document.getRoot( 'bar' );

			expect( root.getAttribute( 'order' ) ).to.equal( 20 );
			expect( root.getAttribute( 'isLocked' ) ).to.be.true;

			expect( editor.registerRootAttribute.calledWithExactly( 'order' ) );
			expect( editor.registerRootAttribute.calledWithExactly( 'isLocked' ) );
		} );

		it( 'should set placeholder as root editable option', () => {
			editor.addRoot( 'bar', { placeholder: 'Type here...' } );

			const root = editor.model.document.getRoot( 'bar' );

			expect( root.getAttribute( '$rootEditableOptions' ) ).to.deep.equal( { placeholder: 'Type here...' } );
		} );

		it( 'should set label as root editable option', () => {
			editor.addRoot( 'bar', { label: 'My label' } );

			const root = editor.model.document.getRoot( 'bar' );

			expect( root.getAttribute( '$rootEditableOptions' ) ).to.deep.equal( { label: 'My label' } );
		} );

		it( 'should set both placeholder and label as root editable options', () => {
			editor.addRoot( 'bar', { placeholder: 'Type here...', label: 'My label' } );

			const root = editor.model.document.getRoot( 'bar' );

			expect( root.getAttribute( '$rootEditableOptions' ) ).to.deep.equal( {
				placeholder: 'Type here...',
				label: 'My label'
			} );
		} );

		it( 'should prefer initialData over data', () => {
			editor.addRoot( 'bar', { initialData: '<p>New.</p>', data: '<p>Old.</p>' } );

			expect( editor.getData( { rootName: 'bar' } ) ).to.equal( '<p>New.</p>' );
		} );

		it( 'should prefer modelAttributes over attributes', () => {
			editor.addRoot( 'bar', { modelAttributes: { order: 10 }, attributes: { order: 20 } } );

			const root = editor.model.document.getRoot( 'bar' );

			expect( root.getAttribute( 'order' ) ).to.equal( 10 );
		} );

		it( 'should log warning when options.element is a DOM element', () => {
			const el = document.createElement( 'div' );

			editor.addRoot( 'baz', { element: el } );

			sinon.assert.calledWithMatch( console.warn, 'multi-root-editor-add-root-element-option-ignored' );
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
		describe( 'lazyRoots', () => {
			it( 'should create specified, non-loaded roots', async () => {
				editor = await MultiRootEditor.create( { main: '<p>Main.</p>' }, {
					plugins: [ Paragraph, Undo ],
					roots: {
						foo: { lazyLoad: true },
						bar: { lazyLoad: true }
					}
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
					roots: {
						foo: { lazyLoad: true },
						bar: { lazyLoad: true }
					}
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
					roots: {
						foo: { lazyLoad: true },
						bar: { lazyLoad: true }
					}
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
				roots: {
					abc: { lazyLoad: true },
					xyz: { lazyLoad: true }
				}
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

		it( 'should allow for setting a custom label to the editable', () => {
			editor.addRoot( 'new' );

			editor.createEditable( editor.model.document.getRoot( 'new' ), undefined, 'Custom label' );

			const editableElement = editor.ui.view.editables.new.element;

			expect( editableElement.getAttribute( 'aria-label' ) ).to.equal( 'Custom label' );
		} );

		it( 'should accept options object with placeholder and label', () => {
			editor.addRoot( 'new' );

			editor.createEditable( editor.model.document.getRoot( 'new' ), { placeholder: 'Type...', label: 'My label' } );

			const editableElement = editor.ui.view.editables.new.element;

			expect( editableElement.children[ 0 ].dataset.placeholder ).to.equal( 'Type...' );
			expect( editableElement.getAttribute( 'aria-label' ) ).to.equal( 'My label' );
		} );

		it( 'should use $rootEditableOptions from root attribute as fallback for placeholder and label', () => {
			editor.addRoot( 'new', { placeholder: 'Root placeholder', label: 'Root label' } );

			editor.createEditable( editor.model.document.getRoot( 'new' ) );

			const editableElement = editor.ui.view.editables.new.element;

			expect( editableElement.children[ 0 ].dataset.placeholder ).to.equal( 'Root placeholder' );
			expect( editableElement.getAttribute( 'aria-label' ) ).to.equal( 'Root label' );
		} );

		it( 'should work when root has no $rootEditableOptions attribute', () => {
			editor.model.change( writer => {
				writer.addRoot( 'new' );
			} );

			editor.createEditable( editor.model.document.getRoot( 'new' ) );

			const editableElement = editor.ui.view.editables.new.element;

			expect( editableElement ).to.be.instanceOf( HTMLElement );
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

	describe( 'roots attributes', () => {
		it( 'should store placeholder from roots config as $rootEditableOptions attribute', async () => {
			editor = await MultiRootEditor.create( { foo: '' }, {
				roots: {
					foo: {
						placeholder: 'Type here...'
					}
				}
			} );

			const fooRoot = editor.model.document.getRoot( 'foo' );

			expect( fooRoot.getAttribute( '$rootEditableOptions' ) ).to.deep.equal( { placeholder: 'Type here...' } );

			await editor.destroy();
		} );

		it( 'should load attributes from editor configuration', async () => {
			editor = await MultiRootEditor.create( { foo: '', bar: '' }, {
				roots: {
					foo: {
						modelAttributes: { order: 10, isLocked: null }
					},
					bar: {
						modelAttributes: { order: null, isLocked: false }
					}
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
				roots: {
					foo: {
						modelAttributes: { order: 10 }
					},
					bar: {
						modelAttributes: { isLocked: false }
					}
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

		it.skip( 'should throw when trying to set an attribute on non-existing root', done => {
			MultiRootEditor.create( { foo: '', bar: '' }, {
				roots: {
					abc: {
						modelAttributes: { order: 10, isLocked: null }
					}
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
				roots: {
					foo: {
						modelAttributes: { order: 10, isLocked: true }
					},
					bar: {
						modelAttributes: { order: 20, isLocked: false }
					}
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
				roots: {
					foo: {
						modelAttributes: { order: 10 }
					},
					bar: {
						modelAttributes: {}
					}
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
				roots: {
					foo: {
						modelAttributes: { order: 10, isLocked: true }
					},
					bar: {
						modelAttributes: { order: 20, isLocked: false }
					}
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
				roots: {
					foo: {
						modelAttributes: { order: 10, isLocked: null }
					},
					bar: {
						modelAttributes: { order: null, isLocked: false }
					}
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

		it( 'should not include $rootEditableOptions', async () => {
			editor = await MultiRootEditor.create( { foo: '' }, {
				roots: {
					foo: {
						modelAttributes: { order: 10 },
						placeholder: 'Type here...',
						label: 'My label'
					}
				}
			} );

			expect( editor.getRootAttributes( 'foo' ) ).to.deep.equal( { order: 10 } );

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
				roots: {
					foo: {
						modelAttributes: { order: 10, isLocked: true }
					},
					bar: {
						modelAttributes: { order: 20, isLocked: false }
					}
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
				roots: {
					foo: {
						modelAttributes: { order: 10 }
					},
					bar: {
						modelAttributes: {}
					}
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
				roots: {
					foo: {
						modelAttributes: { order: 10, isLocked: true }
					},
					bar: {
						modelAttributes: { order: 20, isLocked: false }
					},
					xxx: { lazyLoad: true },
					yyy: { lazyLoad: true }
				}
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

		it( 'should not include $rootEditableOptions', async () => {
			editor = await MultiRootEditor.create( { foo: '', bar: '' }, {
				roots: {
					foo: {
						modelAttributes: { order: 10 },
						placeholder: 'Foo placeholder',
						label: 'Foo label'
					},
					bar: {
						modelAttributes: { order: 20 }
					}
				}
			} );

			expect( editor.getRootsAttributes() ).to.deep.equal( {
				foo: { order: 10 },
				bar: { order: 20 }
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
} );
