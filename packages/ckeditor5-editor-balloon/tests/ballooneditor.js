/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BalloonEditor } from '../src/ballooneditor.js';
import { BalloonEditorUI } from '../src/ballooneditorui.js';
import { BalloonEditorUIView } from '../src/ballooneditoruiview.js';

import { HtmlDataProcessor, ModelRootElement } from '@ckeditor/ckeditor5-engine';

import { Plugin, Context } from '@ckeditor/ckeditor5-core';
import { EditorWatchdog, ContextWatchdog } from '@ckeditor/ckeditor5-watchdog';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Bold } from '@ckeditor/ckeditor5-basic-styles';
import { BalloonToolbar } from '@ckeditor/ckeditor5-ui';

import { assertCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { CKEditorError } from '@ckeditor/ckeditor5-utils';

describe( 'BalloonEditor', () => {
	let editor, editorElement;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		editorElement.innerHTML = '<p><strong>foo</strong> bar</p>';

		document.body.appendChild( editorElement );

		vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
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
			expect( Object.getPrototypeOf( editor ).constructor.editorName ).toBe( 'BalloonEditor' );
		} );

		it( 'pushes BalloonToolbar to the list of plugins', () => {
			expect( editor.config.get( 'plugins' ) ).toContain( BalloonToolbar );
		} );

		it( 'pipes config#toolbar to config#balloonToolbar', () => {
			expect( editor.config.get( 'balloonToolbar' ) ).toEqual( [ 'Bold' ] );
		} );

		it( 'uses HTMLDataProcessor', () => {
			expect( editor.data.processor ).toBeInstanceOf( HtmlDataProcessor );
		} );

		it( 'has a Element Interface', () => {
			expect( BalloonEditor.prototype ).toHaveProperty( 'updateSourceElement', expect.any( Function ) );
		} );

		it( 'creates main root element', () => {
			expect( editor.model.document.getRoot( 'main' ) ).toBeInstanceOf( ModelRootElement );
			expect( editor.model.document.getRoot( 'main' ).name ).toBe( '$root' );
		} );

		it( 'creates main root element with the given modelElement name', () => {
			const customEditor = new BalloonEditor( {
				root: {
					modelElement: 'customRoot',
					initialData: ''
				}
			} );

			expect( customEditor.model.document.getRoot( 'main' ).name ).toBe( 'customRoot' );

			customEditor.fire( 'ready' );

			return customEditor.destroy();
		} );

		it( 'should have undefined the #sourceElement if editor was initialized with data', () => {
			return BalloonEditor
				.create( '<p>Foo.</p>', {
					plugins: [ Paragraph, Bold ]
				} )
				.then( newEditor => {
					expect( newEditor.sourceElement ).toBeUndefined();

					return newEditor.destroy();
				} );
		} );

		// See: https://github.com/ckeditor/ckeditor5/issues/746
		it( 'should throw when trying to create the editor using the same source element more than once', () => {
			return BalloonEditor.create( editorElement )
				.then(
					() => {
						expect.fail( 'Balloon editor should not initialize on an element already used by other instance.' );
					},
					err => {
						assertCKEditorError( err, 'editor-source-element-already-used' );
					}
				);
		} );

		describe( 'config.roots.main.initialData', () => {
			it( 'if not set, is set using DOM element data', async () => {
				const editorElement = document.createElement( 'div' );
				editorElement.innerHTML = '<p>Foo</p>';

				const editor = new BalloonEditor( editorElement );

				expect( editor.config.get( 'roots.main.initialData' ) ).toBe( '<p>Foo</p>' );

				editor.fire( 'ready' );
				await editor.destroy();
			} );

			it( 'if not set, is set using data passed in constructor', async () => {
				const editor = new BalloonEditor( '<p>Foo</p>' );

				expect( editor.config.get( 'roots.main.initialData' ) ).toBe( '<p>Foo</p>' );

				editor.fire( 'ready' );
				await editor.destroy();
			} );

			it( 'if set, is not overwritten with DOM element data (legacy config.initialData)', async () => {
				const editorElement = document.createElement( 'div' );
				editorElement.innerHTML = '<p>Foo</p>';

				const editor = new BalloonEditor( editorElement, { initialData: '<p>Bar</p>' } );

				expect( editor.config.get( 'roots.main.initialData' ) ).toBe( '<p>Bar</p>' );

				editor.fire( 'ready' );
				await editor.destroy();
			} );

			it( 'it should throw if legacy config.initialData is set and initial data is passed in constructor', () => {
				expect( () => {
					// eslint-disable-next-line no-new
					new BalloonEditor( '<p>Foo</p>', { initialData: '<p>Bar</p>' } );
				} ).toThrow( CKEditorError, 'editor-create-initial-data-overspecified' );
			} );

			it( 'it should throw if config.root.initialData is set and initial data is passed in constructor', () => {
				expect( () => {
					// eslint-disable-next-line no-new
					new BalloonEditor( '<p>Foo</p>', { root: { initialData: '<p>Bar</p>' } } );
				} ).toThrow( CKEditorError, 'editor-create-root-initial-data-overspecified' );
			} );

			it( 'it should throw if config.roots.main.initialData is set and initial data is passed in constructor', () => {
				expect( () => {
					// eslint-disable-next-line no-new
					new BalloonEditor( '<p>Foo</p>', { roots: { main: { initialData: '<p>Bar</p>' } } } );
				} ).toThrow( CKEditorError, 'editor-create-root-initial-data-overspecified' );
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
				} ).toThrow( CKEditorError, 'editor-create-roots-with-main' );
			} );

			it( 'it should throw if legacy config.initialData and config.root.initialData is set', () => {
				const editorElement = document.createElement( 'div' );
				editorElement.innerHTML = '<p>Foo</p>';

				expect( () => {
					// eslint-disable-next-line no-new
					new BalloonEditor( editorElement, {
						initialData: '<p>abc</p>',
						root: { initialData: '<p>abc</p>' }
					} );
				} ).toThrow( CKEditorError, 'editor-create-legacy-initial-data-overspecified' );
			} );

			it( 'it should throw if legacy config.initialData and config.roots.main.initialData is set', () => {
				const editorElement = document.createElement( 'div' );
				editorElement.innerHTML = '<p>Foo</p>';

				expect( () => {
					// eslint-disable-next-line no-new
					new BalloonEditor( editorElement, {
						initialData: '<p>abc</p>',
						roots: { main: { initialData: '<p>abc</p>' } }
					} );
				} ).toThrow( CKEditorError, 'editor-create-legacy-initial-data-overspecified' );
			} );

			it( 'it should throw if source element and config.root.element are both set', () => {
				const sourceElement = document.createElement( 'div' );
				sourceElement.innerHTML = '<p>Foo</p>';

				const existingElement = document.createElement( 'div' );

				expect( () => {
					// eslint-disable-next-line no-new
					new BalloonEditor( sourceElement, { root: { element: existingElement } } );
				} ).toThrow( CKEditorError, 'editor-create-root-element-overspecified' );
			} );
		} );

		describe( 'config.root.placeholder', () => {
			it( 'should normalize config.root.placeholder to config.roots.main.placeholder', () => {
				const editor = new BalloonEditor( '<p>Foo</p>', {
					root: { placeholder: 'Type here...' }
				} );

				expect( editor.config.get( 'roots.main.placeholder' ) ).toBe( 'Type here...' );
			} );

			it( 'should normalize legacy config.placeholder to config.roots.main.placeholder (legacy)', () => {
				const editor = new BalloonEditor( '<p>Foo</p>', {
					placeholder: 'Type here...'
				} );

				expect( editor.config.get( 'roots.main.placeholder' ) ).toBe( 'Type here...' );
			} );
		} );

		describe( 'config.root.label', () => {
			it( 'should normalize config.root.label to config.roots.main.label', () => {
				const editor = new BalloonEditor( '<p>Foo</p>', {
					root: { label: 'Custom label' }
				} );

				expect( editor.config.get( 'roots.main.label' ) ).toBe( 'Custom label' );
			} );

			it( 'should normalize legacy config.label to config.roots.main.label (legacy)', () => {
				const editor = new BalloonEditor( '<p>Foo</p>', {
					label: 'Custom label'
				} );

				expect( editor.config.get( 'roots.main.label' ) ).toBe( 'Custom label' );
			} );
		} );

		describe( 'config.roots.main.modelAttributes', () => {
			it( 'should be possible to pass model attributes through config', async () => {
				const editor = await BalloonEditor.create( {
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

				expect( root.getAttribute( 'foo' ) ).toBe( 1 );
				expect( root.getAttribute( 'bar' ) ).toBe( 2 );

				expect( editor.getRootAttributes() ).toEqual( {
					foo: 1,
					bar: 2
				} );

				await editor.destroy();
			} );
		} );

		describe( 'config.root.modelAttributes', () => {
			it( 'should be possible to pass model attributes through config', async () => {
				const editor = await BalloonEditor.create( {
					root: {
						modelAttributes: {
							foo: 1,
							bar: 2
						}
					}
				} );

				const root = editor.model.document.getRoot();

				expect( root.getAttribute( 'foo' ) ).toBe( 1 );
				expect( root.getAttribute( 'bar' ) ).toBe( 2 );

				expect( editor.getRootAttributes() ).toEqual( {
					foo: 1,
					bar: 2
				} );

				await editor.destroy();
			} );
		} );

		describe( 'config-only constructor', () => {
			it( 'should create editor with config.root.initialData', async () => {
				const editor = new BalloonEditor( {
					root: {
						initialData: '<p>Foo</p>'
					}
				} );

				expect( editor.config.get( 'roots.main.initialData' ) ).toBe( '<p>Foo</p>' );

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

				expect( editor.sourceElement ).toBe( el );
				expect( editor.config.get( 'roots.main.initialData' ) ).toBe( '<p>Bar</p>' );

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

				expect( editor.sourceElement ).toBe( el );
				expect( editor.config.get( 'roots.main.initialData' ) ).toBe( '<p>Bar</p>' );

				editor.fire( 'ready' );
				await editor.destroy();
			} );

			it( 'should throw when config.attachTo is set', () => {
				const el = document.createElement( 'div' );

				expect( () => {
					// eslint-disable-next-line no-new
					new BalloonEditor( {
						attachTo: el,
						root: {
							initialData: '<p>Foo</p>'
						}
					} );
				} ).toThrow( CKEditorError, 'editor-create-attachto-ignored' );
			} );

			it( 'should throw when config.root.element is a textarea', () => {
				expect( () => {
					// eslint-disable-next-line no-new
					new BalloonEditor( {
						root: {
							element: document.createElement( 'textarea' )
						}
					} );
				} ).toThrow( CKEditorError, 'editor-wrong-element' );
			} );

			it( 'should throw when config.root.element is an input', () => {
				expect( () => {
					// eslint-disable-next-line no-new
					new BalloonEditor( {
						root: {
							element: document.createElement( 'input' )
						}
					} );
				} ).toThrow( CKEditorError, 'editor-wrong-element' );
			} );
		} );

		describe( 'config.root.element', () => {
			describe( 'as a tag name string', () => {
				it( 'should create the editable element with the given tag name', async () => {
					const newEditor = await BalloonEditor.create( {
						plugins: [ Paragraph ],
						root: { element: 'h1' }
					} );

					const editable = newEditor.ui.getEditableElement( 'main' );

					expect( editable.tagName ).toBe( 'H1' );

					await newEditor.destroy();
				} );

				it( 'should reflect the tag name on the view root', async () => {
					const newEditor = await BalloonEditor.create( {
						plugins: [ Paragraph ],
						root: { element: 'h1' }
					} );

					expect( newEditor.editing.view.document.getRoot( 'main' ).name ).toBe( 'h1' );

					await newEditor.destroy();
				} );

				it( 'should leave editor.sourceElement undefined', async () => {
					const newEditor = await BalloonEditor.create( {
						plugins: [ Paragraph ],
						root: { element: 'h1' }
					} );

					expect( newEditor.sourceElement ).toBeUndefined();

					await newEditor.destroy();
				} );

				it( 'should not treat the tag name as initial data', async () => {
					const newEditor = await BalloonEditor.create( {
						plugins: [ Paragraph ],
						root: { element: 'h1' }
					} );

					expect( newEditor.getData() ).toBe( '' );

					await newEditor.destroy();
				} );

				it( 'should keep initial data from the constructor argument', async () => {
					const newEditor = await BalloonEditor.create( '<p>Hello</p>', {
						plugins: [ Paragraph ],
						root: { element: 'h1' }
					} );

					expect( newEditor.getData() ).toBe( '<p>Hello</p>' );

					await newEditor.destroy();
				} );

				it( 'should throw when the tag name is `textarea`', () => {
					expect( () => {
						// eslint-disable-next-line no-new
						new BalloonEditor( { root: { element: 'textarea' } } );
					} ).toThrow( CKEditorError, 'editor-wrong-element' );
				} );

				it( 'should throw when the tag name is `input`', () => {
					expect( () => {
						// eslint-disable-next-line no-new
						new BalloonEditor( { root: { element: 'input' } } );
					} ).toThrow( CKEditorError, 'editor-wrong-element' );
				} );

				it( 'should allow two editors with the same tag name', async () => {
					const a = await BalloonEditor.create( {
						plugins: [ Paragraph ],
						root: { element: 'h1' }
					} );
					const b = await BalloonEditor.create( {
						plugins: [ Paragraph ],
						root: { element: 'h1' }
					} );

					expect( a.ui.getEditableElement( 'main' ).tagName ).toBe( 'H1' );
					expect( b.ui.getEditableElement( 'main' ).tagName ).toBe( 'H1' );
					expect( a.ui.getEditableElement( 'main' ) ).not.toBe( b.ui.getEditableElement( 'main' ) );

					await a.destroy();
					await b.destroy();
				} );
			} );

			describe( 'as a view element definition object', () => {
				it( 'should create the editable element with the given tag name', async () => {
					const newEditor = await BalloonEditor.create( {
						plugins: [ Paragraph ],
						root: { element: { name: 'section' } }
					} );

					expect( newEditor.ui.getEditableElement( 'main' ).tagName ).toBe( 'SECTION' );

					await newEditor.destroy();
				} );

				it( 'should reflect the element shape on the view root', async () => {
					const newEditor = await BalloonEditor.create( {
						plugins: [ Paragraph ],
						root: {
							element: {
								name: 'section',
								classes: [ 'foo' ],
								attributes: { 'data-id': '123' }
							}
						}
					} );

					const viewRoot = newEditor.editing.view.document.getRoot( 'main' );

					expect( viewRoot.name ).toBe( 'section' );
					expect( viewRoot.hasClass( 'foo' ) ).toBe( true );
					expect( viewRoot.getAttribute( 'data-id' ) ).toBe( '123' );

					await newEditor.destroy();
				} );

				it( 'should apply the `classes` array on top of the editor classes', async () => {
					const newEditor = await BalloonEditor.create( {
						plugins: [ Paragraph ],
						root: { element: { name: 'section', classes: [ 'foo', 'bar' ] } }
					} );

					const editable = newEditor.ui.getEditableElement( 'main' );

					expect( editable.classList.contains( 'ck' ) ).toBe( true );
					expect( editable.classList.contains( 'ck-content' ) ).toBe( true );
					expect( editable.classList.contains( 'foo' ) ).toBe( true );
					expect( editable.classList.contains( 'bar' ) ).toBe( true );

					await newEditor.destroy();
				} );

				it( 'should accept `classes` as a string', async () => {
					const newEditor = await BalloonEditor.create( {
						plugins: [ Paragraph ],
						root: { element: { name: 'section', classes: 'foo bar' } }
					} );

					const editable = newEditor.ui.getEditableElement( 'main' );

					expect( editable.classList.contains( 'foo' ) ).toBe( true );
					expect( editable.classList.contains( 'bar' ) ).toBe( true );

					await newEditor.destroy();
				} );

				it( 'should apply the `styles` object', async () => {
					const newEditor = await BalloonEditor.create( {
						plugins: [ Paragraph ],
						root: {
							element: {
								name: 'section',
								styles: { color: 'rgb(255, 0, 0)', 'font-weight': 'bold' }
							}
						}
					} );

					const editable = newEditor.ui.getEditableElement( 'main' );

					expect( editable.style.color ).toBe( 'rgb(255, 0, 0)' );
					expect( editable.style.fontWeight ).toBe( 'bold' );

					await newEditor.destroy();
				} );

				it( 'should apply arbitrary attributes', async () => {
					const newEditor = await BalloonEditor.create( {
						plugins: [ Paragraph ],
						root: {
							element: {
								name: 'section',
								attributes: { 'data-id': '123', 'data-role': 'editor' }
							}
						}
					} );

					const editable = newEditor.ui.getEditableElement( 'main' );

					expect( editable.getAttribute( 'data-id' ) ).toBe( '123' );
					expect( editable.getAttribute( 'data-role' ) ).toBe( 'editor' );

					await newEditor.destroy();
				} );

				it( 'should support `class` shorthand inside `attributes`', async () => {
					const newEditor = await BalloonEditor.create( {
						plugins: [ Paragraph ],
						root: {
							element: {
								name: 'section',
								attributes: { class: 'foo bar' }
							}
						}
					} );

					const editable = newEditor.ui.getEditableElement( 'main' );

					expect( editable.classList.contains( 'foo' ) ).toBe( true );
					expect( editable.classList.contains( 'bar' ) ).toBe( true );

					await newEditor.destroy();
				} );

				it( 'should support `style` shorthand inside `attributes`', async () => {
					const newEditor = await BalloonEditor.create( {
						plugins: [ Paragraph ],
						root: {
							element: {
								name: 'section',
								attributes: { style: 'color: rgb(255, 0, 0); font-weight: bold' }
							}
						}
					} );

					const editable = newEditor.ui.getEditableElement( 'main' );

					expect( editable.style.color ).toBe( 'rgb(255, 0, 0)' );
					expect( editable.style.fontWeight ).toBe( 'bold' );

					await newEditor.destroy();
				} );

				it( 'should concatenate `classes` with `attributes.class`', async () => {
					const newEditor = await BalloonEditor.create( {
						plugins: [ Paragraph ],
						root: {
							element: {
								name: 'section',
								classes: [ 'foo' ],
								attributes: { class: 'bar' }
							}
						}
					} );

					const editable = newEditor.ui.getEditableElement( 'main' );

					expect( editable.classList.contains( 'foo' ) ).toBe( true );
					expect( editable.classList.contains( 'bar' ) ).toBe( true );

					await newEditor.destroy();
				} );

				it( 'should prefer `styles` object over `attributes.style` string when both are set', async () => {
					const newEditor = await BalloonEditor.create( {
						plugins: [ Paragraph ],
						root: {
							element: {
								name: 'section',
								styles: { color: 'rgb(0, 128, 0)' },
								attributes: { style: 'color: rgb(255, 0, 0)' }
							}
						}
					} );

					const editable = newEditor.ui.getEditableElement( 'main' );

					expect( editable.style.color ).toBe( 'rgb(0, 128, 0)' );

					await newEditor.destroy();
				} );

				it( 'should throw when the name is `textarea`', () => {
					expect( () => {
						// eslint-disable-next-line no-new
						new BalloonEditor( { root: { element: { name: 'textarea' } } } );
					} ).toThrow( CKEditorError, 'editor-wrong-element' );
				} );

				it( 'should throw when the name is `input`', () => {
					expect( () => {
						// eslint-disable-next-line no-new
						new BalloonEditor( { root: { element: { name: 'input' } } } );
					} ).toThrow( CKEditorError, 'editor-wrong-element' );
				} );

				it( 'should leave editor.sourceElement undefined', async () => {
					const newEditor = await BalloonEditor.create( {
						plugins: [ Paragraph ],
						root: { element: { name: 'section' } }
					} );

					expect( newEditor.sourceElement ).toBeUndefined();

					await newEditor.destroy();
				} );
			} );

			describe( 'omitted', () => {
				it( 'should default to a `<div>` editable when no element is provided', async () => {
					const newEditor = await BalloonEditor.create( {
						plugins: [ Paragraph ],
						root: { initialData: '<p>Foo</p>' }
					} );

					expect( newEditor.ui.getEditableElement( 'main' ).tagName ).toBe( 'DIV' );

					await newEditor.destroy();
				} );
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
			expect( editor ).toBeInstanceOf( BalloonEditor );
		} );

		it( 'creates element–less UI view', () => {
			expect( editor.ui.view.element ).toBeNull();
		} );

		it( 'attaches editable UI as view\'s DOM root', () => {
			const domRoot = editor.editing.view.getDomRoot();

			expect( domRoot ).toBe( editor.ui.view.editable.element );
		} );

		it( 'creates the UI using BalloonEditorUI classes', () => {
			expect( editor.ui ).toBeInstanceOf( BalloonEditorUI );
			expect( editor.ui.view ).toBeInstanceOf( BalloonEditorUIView );
		} );

		it( 'loads data from the editor element', () => {
			expect( editor.getData() ).toBe( '<p><strong>foo</strong> bar</p>' );
		} );

		it( 'should not require config object', () => {
			const editorElement = document.createElement( 'div' );
			editorElement.innerHTML = '<p><strong>foo</strong> bar</p>';

			// Just being safe with `builtinPlugins` static property.
			class CustomBalloonEditor extends BalloonEditor {}
			CustomBalloonEditor.builtinPlugins = [ Paragraph, Bold ];

			return CustomBalloonEditor.create( editorElement )
				.then( newEditor => {
					expect( newEditor.getData() ).toBe( '<p><strong>foo</strong> bar</p>' );

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
				expect( editor.getData() ).toBe( '<p>Hello world!</p>' );

				return editor.destroy();
			} );
		} );

		it( 'initializes with legacy config.initialData', () => {
			const editorElement = document.createElement( 'div' );
			editorElement.innerHTML = '<p><strong>foo</strong> bar</p>';

			return BalloonEditor.create( editorElement, {
				initialData: '<p>Hello world!</p>',
				plugins: [ Paragraph ]
			} ).then( editor => {
				expect( editor.getData() ).toBe( '<p>Hello world!</p>' );

				return editor.destroy();
			} ).then( () => {
				editorElement.remove();
			} );
		} );

		// https://github.com/ckeditor/ckeditor5/issues/8974
		it( 'initializes with empty content if legacy config.initialData is set to an empty string', () => {
			const editorElement = document.createElement( 'div' );
			editorElement.innerHTML = '<p><strong>foo</strong> bar</p>';

			return BalloonEditor.create( editorElement, {
				initialData: '',
				plugins: [ Paragraph ]
			} ).then( editor => {
				expect( editor.getData() ).toBe( '' );

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
					expect( newEditor ).toBeInstanceOf( CustomBalloonEditor );
					expect( newEditor ).toBeInstanceOf( BalloonEditor );

					expect( newEditor.getData() ).toBe( '<p><strong>foo</strong> bar</p>' );

					editorElement.remove();

					return newEditor.destroy();
				} );
		} );

		it( 'throws an error when is initialized in textarea', () => {
			return BalloonEditor.create( document.createElement( 'textarea' ) )
				.then(
					() => {
						expect.fail( 'Balloon editor should throw an error when is initialized in textarea.' );
					},
					err => {
						assertCKEditorError( err, 'editor-wrong-element', null );
					}
				);
		} );

		it( 'throws an error when is initialized in input', () => {
			return BalloonEditor.create( document.createElement( 'input' ) )
				.then(
					() => {
						expect.fail( 'Balloon editor should throw an error when is initialized in input.' );
					},
					err => {
						assertCKEditorError( err, 'editor-wrong-element', null );
					}
				);
		} );

		it( 'creates editor from config-only', () => {
			return BalloonEditor
				.create( {
					root: { initialData: '<p>Hello world!</p>' },
					plugins: [ Paragraph ]
				} )
				.then( newEditor => {
					expect( newEditor.getData() ).toBe( '<p>Hello world!</p>' );
					expect( newEditor.sourceElement ).toBeUndefined();

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
					expect( newEditor.getData() ).toBe( '<p>Hello world!</p>' );
					expect( newEditor.sourceElement ).toBe( el );

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
					expect( newEditor.getData() ).toBe( '<p>Hello world!</p>' );
					expect( newEditor.sourceElement ).toBe( el );

					return newEditor.destroy();
				} )
				.then( () => {
					el.remove();
				} );
		} );

		it( 'should reject if a root element is not a limit element', async () => {
			class NonLimitRootPlugin extends Plugin {
				init() {
					this.editor.model.schema.register( 'nonLimit', { isBlock: true } );
				}
			}

			try {
				await BalloonEditor.create( {
					plugins: [ Paragraph, NonLimitRootPlugin ],
					root: { modelElement: 'nonLimit' }
				} );
				expect.fail( 'Promise should have been rejected' );
			} catch ( err ) {
				expect( err ).toBeInstanceOf( CKEditorError );
				expect( err.message ).toMatch( /editor-root-element-is-not-limit/ );
			}
		} );

		describe( 'configurable editor label (aria-label)', () => {
			it( 'should be set to the defaut value if not configured', () => {
				expect( editor.editing.view.getDomRoot().getAttribute( 'aria-label' ) ).toBe(
					'Rich Text Editor. Editing area: main'
				);
			} );

			it( 'should support the legacy config.label string format', async () => {
				await editor.destroy();

				editor = await BalloonEditor.create( editorElement, {
					plugins: [ Paragraph, Bold ],
					label: 'Custom label'
				} );

				expect( editor.editing.view.getDomRoot().getAttribute( 'aria-label' ) ).toBe(
					'Custom label'
				);
			} );

			it( 'should support the legacy config.label object format', async () => {
				await editor.destroy();

				editor = await BalloonEditor.create( editorElement, {
					plugins: [ Paragraph, Bold ],
					label: {
						main: 'Custom label'
					}
				} );

				expect( editor.editing.view.getDomRoot().getAttribute( 'aria-label' ) ).toBe(
					'Custom label'
				);
			} );

			it( 'should keep an existing value from the source DOM element', async () => {
				await editor.destroy();

				editorElement.setAttribute( 'aria-label', 'Pre-existing value' );
				const newEditor = await BalloonEditor.create( editorElement, {
					plugins: [ Paragraph, Bold ]
				} );

				expect( newEditor.editing.view.getDomRoot().getAttribute( 'aria-label' ), 'Keep value' ).toBe(
					'Pre-existing value'
				);

				await newEditor.destroy();

				expect( editorElement.getAttribute( 'aria-label' ), 'Restore value' ).toBe( 'Pre-existing value' );
			} );

			it( 'should override the existing value from the source DOM element (legacy config.label)', async () => {
				await editor.destroy();

				editorElement.setAttribute( 'aria-label', 'Pre-existing value' );
				editor = await BalloonEditor.create( editorElement, {
					plugins: [ Paragraph, Bold ],
					label: 'Custom label'
				} );

				expect( editor.editing.view.getDomRoot().getAttribute( 'aria-label' ), 'Override value' ).toBe(
					'Custom label'
				);

				await editor.destroy();

				expect( editorElement.getAttribute( 'aria-label' ), 'Restore value' ).toBe( 'Pre-existing value' );
			} );

			it( 'should use default label when creating an editor from initial data rather than a DOM element', async () => {
				await editor.destroy();

				editor = await BalloonEditor.create( '<p>Initial data</p>', {
					plugins: [ Paragraph, Bold ]
				} );

				expect( editor.editing.view.getDomRoot().getAttribute( 'aria-label' ), 'Override value' ).toBe(
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

				expect( editor.editing.view.getDomRoot().getAttribute( 'aria-label' ), 'Override value' ).toBe(
					'Custom label'
				);

				await editor.destroy();
			} );

			it( 'should support root.label format', async () => {
				await editor.destroy();

				editor = await BalloonEditor.create( editorElement, {
					plugins: [ Paragraph, Bold ],
					root: { label: 'Root label' }
				} );

				expect( editor.editing.view.getDomRoot().getAttribute( 'aria-label' ) ).toBe(
					'Root label'
				);
			} );

			it( 'should support root.label in config-only constructor', async () => {
				await editor.destroy();

				editor = await BalloonEditor.create( {
					plugins: [ Paragraph, Bold ],
					root: { initialData: '<p>Foo</p>', label: 'Root label' }
				} );

				expect( editor.editing.view.getDomRoot().getAttribute( 'aria-label' ) ).toBe(
					'Root label'
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
					expect( fired ).toEqual(
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
					expect( isRendered ).toBe( true );

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
					expect( editorElement.innerHTML ).toBe( '' );
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
						.toBe( '<p>a</p><heading>b</heading>' );
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
			expect( BalloonEditor.Context ).toBe( Context );
		} );

		it( 'BalloonEditor.EditorWatchdog', () => {
			expect( BalloonEditor.EditorWatchdog ).toBe( EditorWatchdog );
		} );

		it( 'BalloonEditor.ContextWatchdog', () => {
			expect( BalloonEditor.ContextWatchdog ).toBe( ContextWatchdog );
		} );
	} );
} );
