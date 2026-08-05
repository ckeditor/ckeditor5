/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ClassicEditor } from '../src/classiceditor.js';
import { ClassicEditorUI } from '../src/classiceditorui.js';
import { ClassicEditorUIView } from '../src/classiceditoruiview.js';

import { HtmlDataProcessor, ModelRootElement } from '@ckeditor/ckeditor5-engine';

import { Context, Plugin } from '@ckeditor/ckeditor5-core';
import { EditorWatchdog, ContextWatchdog } from '@ckeditor/ckeditor5-watchdog';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Bold } from '@ckeditor/ckeditor5-basic-styles';
import { CKEditorError } from '@ckeditor/ckeditor5-utils';

describe( 'ClassicEditor', () => {
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
			editor = new ClassicEditor( editorElement );
		} );

		afterEach( async () => {
			if ( editor.state !== 'destroyed' ) {
				editor.fire( 'ready' );
				await editor.destroy();
			}
		} );

		it( 'uses HTMLDataProcessor', () => {
			expect( editor.data.processor ).toBeInstanceOf( HtmlDataProcessor );
		} );

		it( 'it\'s possible to extract editor name from editor instance', () => {
			expect( Object.getPrototypeOf( editor ).constructor.editorName ).toBe( 'ClassicEditor' );
		} );

		it( 'mixes ElementApiMixin', () => {
			expect( ClassicEditor.prototype ).toHaveProperty( 'updateSourceElement', expect.any( Function ) );
		} );

		it( 'creates main root element', () => {
			expect( editor.model.document.getRoot( 'main' ) ).toBeInstanceOf( ModelRootElement );
			expect( editor.model.document.getRoot( 'main' ).name ).toBe( '$root' );
		} );

		it( 'creates main root element with the given modelElement name', () => {
			const customEditor = new ClassicEditor( {
				root: {
					modelElement: 'customRoot',
					initialData: ''
				}
			} );

			expect( customEditor.model.document.getRoot( 'main' ).name ).toBe( 'customRoot' );

			customEditor.fire( 'ready' );

			return customEditor.destroy();
		} );

		it( 'contains the source element as #sourceElement property', () => {
			expect( editor.sourceElement ).toBe( editorElement );
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
				expect( textarea.value ).toBe( '' );

				editor.setData( '<p>Foo</p>' );

				form.dispatchEvent( new Event( 'submit', {
					// We need to be able to do preventDefault() to prevent page reloads in Firefox.
					cancelable: true
				} ) );

				expect( textarea.value ).toBe( '<p>Foo</p>' );

				return editor.destroy().then( () => {
					form.remove();
				} );
			} );
		} );

		describe( 'ui', () => {
			it( 'creates the UI using BoxedEditorUI classes', () => {
				expect( editor.ui ).toBeInstanceOf( ClassicEditorUI );
				expect( editor.ui.view ).toBeInstanceOf( ClassicEditorUIView );
			} );

			describe( 'automatic toolbar items groupping', () => {
				it( 'should be on by default', async () => {
					const editorElement = document.body.appendChild( document.createElement( 'div' ) );
					const editor = new ClassicEditor( editorElement );

					expect( editor.ui.view.toolbar.options.shouldGroupWhenFull ).toBe( true );

					editor.fire( 'ready' );
					await editor.destroy();

					editorElement.remove();
				} );

				it( 'can be disabled using config.toolbar.shouldNotGroupWhenFull', async () => {
					const editorElement = document.body.appendChild( document.createElement( 'div' ) );
					const editor = new ClassicEditor( editorElement, {
						toolbar: {
							shouldNotGroupWhenFull: true
						}
					} );

					expect( editor.ui.view.toolbar.options.shouldGroupWhenFull ).toBe( false );

					editor.fire( 'ready' );
					await editor.destroy();

					editorElement.remove();
				} );
			} );
		} );

		describe( 'config.roots.main.initialData', () => {
			let editorElement;

			beforeEach( () => {
				editorElement = document.createElement( 'div' );
				editorElement.innerHTML = '<p>Foo</p>';
				document.body.appendChild( editorElement );
			} );

			afterEach( () => {
				editorElement.remove();
			} );

			it( 'if not set, is set using DOM element data', async () => {
				const editor = new ClassicEditor( editorElement );

				expect( editor.config.get( 'roots.main.initialData' ) ).toBe( '<p>Foo</p>' );

				editor.fire( 'ready' );
				await editor.destroy();
			} );

			it( 'if not set, is set using data passed in constructor', async () => {
				const editor = new ClassicEditor( '<p>Foo</p>' );

				expect( editor.config.get( 'roots.main.initialData' ) ).toBe( '<p>Foo</p>' );

				editor.fire( 'ready' );
				await editor.destroy();
			} );

			it( 'if set, is not overwritten with DOM element data (legacy config.initialData)', async () => {
				const editor = new ClassicEditor( editorElement, { initialData: '<p>Bar</p>' } );

				expect( editor.config.get( 'roots.main.initialData' ) ).toBe( '<p>Bar</p>' );

				editor.fire( 'ready' );
				await editor.destroy();
			} );

			it( 'it should throw if legacy config.initialData is set and initial data is passed in constructor', () => {
				expect( () => {
					// eslint-disable-next-line no-new
					new ClassicEditor( '<p>Foo</p>', { initialData: '<p>Bar</p>' } );
				} ).toThrow( CKEditorError, 'editor-create-initial-data-overspecified' );
			} );

			it( 'it should throw if config.root.initialData is set and initial data is passed in constructor', () => {
				expect( () => {
					// eslint-disable-next-line no-new
					new ClassicEditor( '<p>Foo</p>', { root: { initialData: '<p>Bar</p>' } } );
				} ).toThrow( CKEditorError, 'editor-create-root-initial-data-overspecified' );
			} );

			it( 'it should throw if config.roots.main.initialData is set and initial data is passed in constructor', () => {
				expect( () => {
					// eslint-disable-next-line no-new
					new ClassicEditor( '<p>Foo</p>', { roots: { main: { initialData: '<p>Bar</p>' } } } );
				} ).toThrow( CKEditorError, 'editor-create-root-initial-data-overspecified' );
			} );

			it( 'it should throw if config.root and config.roots.main is set', () => {
				expect( () => {
					// eslint-disable-next-line no-new
					new ClassicEditor( editorElement, {
						root: { initialData: '<p>abc</p>' },
						roots: { main: { initialData: '<p>Bar</p>' } }
					} );
				} ).toThrow( CKEditorError, 'editor-create-roots-with-main' );
			} );

			it( 'it should throw if legacy config.initialData and config.root.initialData is set', () => {
				expect( () => {
					// eslint-disable-next-line no-new
					new ClassicEditor( editorElement, {
						initialData: '<p>abc</p>',
						root: { initialData: '<p>abc</p>' }
					} );
				} ).toThrow( CKEditorError, 'editor-create-legacy-initial-data-overspecified' );
			} );

			it( 'it should throw if legacy config.initialData and config.roots.main.initialData is set', () => {
				expect( () => {
					// eslint-disable-next-line no-new
					new ClassicEditor( editorElement, {
						initialData: '<p>abc</p>',
						roots: { main: { initialData: '<p>abc</p>' } }
					} );
				} ).toThrow( CKEditorError, 'editor-create-legacy-initial-data-overspecified' );
			} );

			it( 'it should throw if source element and config.attachTo are both set', () => {
				const attachToElement = document.createElement( 'div' );

				expect( () => {
					// eslint-disable-next-line no-new
					new ClassicEditor( editorElement, { attachTo: attachToElement } );
				} ).toThrow( CKEditorError, 'editor-create-attachto-overspecified' );
			} );
		} );

		describe( 'config.root.placeholder', () => {
			it( 'should normalize config.root.placeholder to config.roots.main.placeholder', () => {
				const editor = new ClassicEditor( '<p>Foo</p>', {
					root: { placeholder: 'Type here...' }
				} );

				expect( editor.config.get( 'roots.main.placeholder' ) ).toBe( 'Type here...' );
			} );

			it( 'should normalize legacy config.placeholder to config.roots.main.placeholder (legacy)', () => {
				const editor = new ClassicEditor( '<p>Foo</p>', {
					placeholder: 'Type here...'
				} );

				expect( editor.config.get( 'roots.main.placeholder' ) ).toBe( 'Type here...' );
			} );
		} );

		describe( 'config.root.label', () => {
			it( 'should normalize config.root.label to config.roots.main.label', () => {
				const editor = new ClassicEditor( '<p>Foo</p>', {
					root: { label: 'Custom label' }
				} );

				expect( editor.config.get( 'roots.main.label' ) ).toBe( 'Custom label' );
			} );

			it( 'should normalize legacy config.label to config.roots.main.label (legacy)', () => {
				const editor = new ClassicEditor( '<p>Foo</p>', {
					label: 'Custom label'
				} );

				expect( editor.config.get( 'roots.main.label' ) ).toBe( 'Custom label' );
			} );
		} );

		describe( 'config.roots.main.modelAttributes', () => {
			it( 'should be possible to pass model attributes through config', async () => {
				const editor = await ClassicEditor.create( {
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
				const editor = await ClassicEditor.create( {
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
				const editor = new ClassicEditor( {
					root: {
						initialData: '<p>Foo</p>'
					}
				} );

				expect( editor.config.get( 'roots.main.initialData' ) ).toBe( '<p>Foo</p>' );

				editor.fire( 'ready' );
				await editor.destroy();
			} );

			it( 'should create editor with config.attachTo and use data from it', async () => {
				const el = document.body.appendChild( document.createElement( 'div' ) );
				el.innerHTML = '<p>Bar</p>';

				const editor = new ClassicEditor( {
					attachTo: el
				} );

				expect( editor.sourceElement ).toBe( el );
				expect( editor.config.get( 'roots.main.initialData' ) ).toBe( '<p>Bar</p>' );

				editor.fire( 'ready' );
				await editor.destroy();

				el.remove();
			} );

			it( 'should create editor with config.attachTo and use root.initialData', async () => {
				const el = document.body.appendChild( document.createElement( 'div' ) );
				el.innerHTML = '<p>Bar</p>';

				const editor = new ClassicEditor( {
					attachTo: el,
					root: {
						initialData: '<p>Foo</p>'
					}
				} );

				expect( editor.sourceElement ).toBe( el );
				expect( editor.config.get( 'roots.main.initialData' ) ).toBe( '<p>Foo</p>' );

				editor.fire( 'ready' );
				await editor.destroy();

				el.remove();
			} );

			it( 'should log warning when config.root.element is set', async () => {
				const el = document.createElement( 'div' );
				el.innerHTML = '<p>Foo</p>';

				const editor = new ClassicEditor( {
					root: {
						element: el
					}
				} );

				expect( console.warn ).toHaveBeenCalledWith( 'editor-create-root-element-not-supported', expect.any( String ) );

				editor.fire( 'ready' );
				await editor.destroy();
			} );
		} );

		describe( 'config.root.element', () => {
			describe( 'when an HTMLElement is passed', () => {
				it( 'should warn and fall back to a default `<div>` editable', async () => {
					const newEditor = await ClassicEditor.create( {
						plugins: [ Paragraph ],
						root: { element: document.createElement( 'h1' ) }
					} );

					expect( console.warn ).toHaveBeenCalledWith( 'editor-create-root-element-not-supported', expect.any( String ) );
					expect( newEditor.ui.getEditableElement( 'main' ).tagName ).toBe( 'DIV' );

					await newEditor.destroy();
				} );
			} );

			describe( 'as a tag name string', () => {
				it( 'should create the editable element with the given tag name inside the UI box', async () => {
					const newEditor = await ClassicEditor.create( {
						plugins: [ Paragraph ],
						root: { element: 'h1' }
					} );

					expect( newEditor.ui.getEditableElement( 'main' ).tagName ).toBe( 'H1' );

					await newEditor.destroy();
				} );

				it( 'should reflect the tag name on the view root', async () => {
					const newEditor = await ClassicEditor.create( {
						plugins: [ Paragraph ],
						root: { element: 'h1' }
					} );

					expect( newEditor.editing.view.document.getRoot( 'main' ).name ).toBe( 'h1' );

					await newEditor.destroy();
				} );

				it( 'should keep initial data from the constructor argument', async () => {
					const newEditor = await ClassicEditor.create( '<p>Hello</p>', {
						plugins: [ Paragraph ],
						root: { element: 'h1' }
					} );

					expect( newEditor.getData() ).toBe( '<p>Hello</p>' );

					await newEditor.destroy();
				} );

				it( 'should work together with config.attachTo', async () => {
					const sourceElement = document.createElement( 'div' );
					sourceElement.innerHTML = '<p>From source</p>';
					document.body.appendChild( sourceElement );

					const newEditor = await ClassicEditor.create( {
						plugins: [ Paragraph ],
						attachTo: sourceElement,
						root: { element: 'h1' }
					} );

					expect( newEditor.ui.getEditableElement( 'main' ).tagName ).toBe( 'H1' );
					expect( newEditor.getData() ).toBe( '<p>From source</p>' );

					await newEditor.destroy();
					sourceElement.remove();
				} );

				it( 'should throw when the tag name is `textarea`', () => {
					expect( () => {
						// eslint-disable-next-line no-new
						new ClassicEditor( { root: { element: 'textarea' } } );
					} ).toThrow( CKEditorError, 'editor-wrong-element' );
				} );

				it( 'should throw when the tag name is `input`', () => {
					expect( () => {
						// eslint-disable-next-line no-new
						new ClassicEditor( { root: { element: 'input' } } );
					} ).toThrow( CKEditorError, 'editor-wrong-element' );
				} );
			} );

			describe( 'as a view element definition object', () => {
				it( 'should create the editable element with the given tag name', async () => {
					const newEditor = await ClassicEditor.create( {
						plugins: [ Paragraph ],
						root: { element: { name: 'section' } }
					} );

					expect( newEditor.ui.getEditableElement( 'main' ).tagName ).toBe( 'SECTION' );

					await newEditor.destroy();
				} );

				it( 'should reflect the element shape on the view root', async () => {
					const newEditor = await ClassicEditor.create( {
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
					const newEditor = await ClassicEditor.create( {
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

				it( 'should apply the `styles` object', async () => {
					const newEditor = await ClassicEditor.create( {
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
					const newEditor = await ClassicEditor.create( {
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
					const newEditor = await ClassicEditor.create( {
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
					const newEditor = await ClassicEditor.create( {
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
					const newEditor = await ClassicEditor.create( {
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
					const newEditor = await ClassicEditor.create( {
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
						new ClassicEditor( { root: { element: { name: 'textarea' } } } );
					} ).toThrow( CKEditorError, 'editor-wrong-element' );
				} );

				it( 'should throw when the name is `input`', () => {
					expect( () => {
						// eslint-disable-next-line no-new
						new ClassicEditor( { root: { element: { name: 'input' } } } );
					} ).toThrow( CKEditorError, 'editor-wrong-element' );
				} );

				it( 'should default to a `<div>` when the name is omitted, while still applying classes and attributes', async () => {
					const newEditor = await ClassicEditor.create( {
						plugins: [ Paragraph ],
						root: {
							element: {
								classes: [ 'custom-editable' ],
								attributes: { 'data-id': '123' }
							}
						}
					} );

					const editable = newEditor.ui.getEditableElement( 'main' );

					expect( editable.tagName ).toBe( 'DIV' );
					expect( editable.classList.contains( 'custom-editable' ) ).toBe( true );
					expect( editable.getAttribute( 'data-id' ) ).toBe( '123' );

					await newEditor.destroy();
				} );
			} );

			describe( 'omitted', () => {
				it( 'should default to a `<div>` editable when no element is provided', async () => {
					const newEditor = await ClassicEditor.create( {
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
		beforeEach( () => {
			return ClassicEditor
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

		it( 'creates an instance which inherits from the ClassicEditor', () => {
			expect( editor ).toBeInstanceOf( ClassicEditor );
		} );

		it( 'loads data from the editor element', () => {
			expect( editor.getData() ).toBe( '<p><strong>foo</strong> bar</p>' );
		} );

		// #53
		it( 'creates an instance of a ClassicEditor child class', () => {
			class CustomClassicEditor extends ClassicEditor {}

			return CustomClassicEditor
				.create( editorElement, {
					plugins: [ Paragraph, Bold ]
				} )
				.then( newEditor => {
					expect( newEditor ).toBeInstanceOf( CustomClassicEditor );
					expect( newEditor ).toBeInstanceOf( ClassicEditor );

					expect( newEditor.getData() ).toBe( '<p><strong>foo</strong> bar</p>' );

					return newEditor.destroy();
				} );
		} );

		it( 'should not require config object', () => {
			// Just being safe with `builtinPlugins` static property.
			class CustomClassicEditor extends ClassicEditor {}
			CustomClassicEditor.builtinPlugins = [ Paragraph, Bold ];

			return CustomClassicEditor.create( editorElement )
				.then( newEditor => {
					expect( newEditor.getData() ).toBe( '<p><strong>foo</strong> bar</p>' );

					return newEditor.destroy();
				} );
		} );

		it( 'allows to pass data to the constructor', () => {
			return ClassicEditor.create( '<p>Hello world!</p>', {
				plugins: [ Paragraph ]
			} ).then( editor => {
				expect( editor.getData() ).toBe( '<p>Hello world!</p>' );

				return editor.destroy();
			} );
		} );

		it( 'initializes with legacy config.initialData', () => {
			return ClassicEditor.create( editorElement, {
				initialData: '<p>Hello world!</p>',
				plugins: [ Paragraph ]
			} ).then( editor => {
				expect( editor.getData() ).toBe( '<p>Hello world!</p>' );

				return editor.destroy();
			} );
		} );

		// https://github.com/ckeditor/ckeditor5/issues/8974
		it( 'initializes with empty content if legacy config.initialData is set to an empty string', () => {
			return ClassicEditor.create( editorElement, {
				initialData: '',
				plugins: [ Paragraph ]
			} ).then( editor => {
				expect( editor.getData() ).toBe( '' );

				return editor.destroy();
			} );
		} );

		it( 'should have undefined the #sourceElement if editor was initialized with data', () => {
			return ClassicEditor
				.create( '<p>Foo.</p>', {
					plugins: [ Paragraph, Bold ]
				} )
				.then( newEditor => {
					expect( newEditor.sourceElement ).toBeUndefined();

					return newEditor.destroy();
				} );
		} );

		it( 'creates editor from config-only', () => {
			return ClassicEditor
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

		it( 'creates editor from config-only with attachTo and initialData', () => {
			const el = document.createElement( 'div' );
			el.innerHTML = '<p>Bar</p>';
			document.body.appendChild( el );

			return ClassicEditor
				.create( {
					attachTo: el,
					root: { initialData: '<p>Hello world!</p>' },
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

		it( 'creates editor from config-only with attachTo', () => {
			const el = document.createElement( 'div' );
			el.innerHTML = '<p>Hello world!</p>';
			document.body.appendChild( el );

			return ClassicEditor
				.create( {
					attachTo: el,
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

		it( 'should raise exception when editor is being attached to not attached DOM element', async () => {
			const editorElement = document.createElement( 'div' );

			try {
				await ClassicEditor.create( { attachTo: editorElement } );
				expect.fail( 'Promise should have been rejected' );
			} catch ( err ) {
				expect( err ).toBeInstanceOf( CKEditorError );
				expect( err.context ).toBeNull(); // avoid watchdog restart
				expect( err.message ).toContain( 'editor-source-element-not-attached' );
			}
		} );

		it( 'should reject if a root element is not a limit element', async () => {
			class NonLimitRootPlugin extends Plugin {
				init() {
					this.editor.model.schema.register( 'nonLimit', { isBlock: true } );
				}
			}

			try {
				await ClassicEditor.create( {
					plugins: [ Paragraph, NonLimitRootPlugin ],
					root: { modelElement: 'nonLimit' }
				} );
				expect.fail( 'Promise should have been rejected' );
			} catch ( err ) {
				expect( err ).toBeInstanceOf( CKEditorError );
				expect( err.message ).toMatch( /editor-root-element-is-not-limit/ );
			}
		} );

		describe( 'ui', () => {
			it( 'inserts editor UI next to editor element', () => {
				expect( editor.ui.view.element.previousSibling ).toBe( editorElement );
			} );

			it( 'attaches editable UI as view\'s DOM root', () => {
				expect( editor.editing.view.getDomRoot() ).toBe( editor.ui.view.editable.element );
			} );

			describe( 'configurable editor label (aria-label)', () => {
				it( 'should be set to the defaut value if not configured', () => {
					expect( editor.editing.view.getDomRoot().getAttribute( 'aria-label' ) ).toBe(
						'Rich Text Editor. Editing area: main'
					);
				} );

				it( 'should support the legacy config.label string format', async () => {
					await editor.destroy();

					editor = await ClassicEditor.create( editorElement, {
						plugins: [ Paragraph, Bold ],
						label: 'Custom label'
					} );

					expect( editor.editing.view.getDomRoot().getAttribute( 'aria-label' ) ).toBe(
						'Custom label'
					);
				} );

				it( 'should support the legacy config.label object format', async () => {
					await editor.destroy();

					editor = await ClassicEditor.create( editorElement, {
						plugins: [ Paragraph, Bold ],
						label: {
							main: 'Custom label'
						}
					} );

					expect( editor.editing.view.getDomRoot().getAttribute( 'aria-label' ) ).toBe(
						'Custom label'
					);
				} );

				it( 'should use default label when creating an editor from initial data rather than a DOM element', async () => {
					await editor.destroy();

					editor = await ClassicEditor.create( '<p>Initial data</p>', {
						plugins: [ Paragraph, Bold ]
					} );

					expect( editor.editing.view.getDomRoot().getAttribute( 'aria-label' ), 'Override value' ).toBe(
						'Rich Text Editor. Editing area: main'
					);

					await editor.destroy();
				} );

				it( 'should set custom label when creating an editor from initial data rather than a DOM element', async () => {
					await editor.destroy();

					editor = await ClassicEditor.create( '<p>Initial data</p>', {
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

					editor = await ClassicEditor.create( editorElement, {
						plugins: [ Paragraph, Bold ],
						root: { label: 'Root label' }
					} );

					expect( editor.editing.view.getDomRoot().getAttribute( 'aria-label' ) ).toBe(
						'Root label'
					);
				} );

				it( 'should support root.label in config-only constructor', async () => {
					await editor.destroy();

					editor = await ClassicEditor.create( {
						plugins: [ Paragraph, Bold ],
						root: { initialData: '<p>Foo</p>', label: 'Root label' }
					} );

					expect( editor.editing.view.getDomRoot().getAttribute( 'aria-label' ) ).toBe(
						'Root label'
					);
				} );
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
					expect( fired ).toEqual(
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
					expect( isReady ).toBe( true );

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
					expect( editorElement.innerHTML ).toBe( '' );
				} );
		} );

		// Adding `updateSourceElementOnDestroy` config to the editor allows setting the data
		// back to the source element after destroy.
		it( 'sets the data back to the editor element', () => {
			editor.config.set( 'updateSourceElementOnDestroy', true );
			editor.setData( '<p>foo</p>' );

			return editor.destroy()
				.then( () => {
					expect( editorElement.innerHTML ).toBe( '<p>foo</p>' );
				} );
		} );

		it( 'does not update the source element if editor was initialized with data', async () => {
			await editor.destroy();

			return ClassicEditor
				.create( '<p>Foo.</p>', {
					plugins: [ Paragraph, Bold ]
				} )
				.then( newEditor => {
					const spy = vi.spyOn( newEditor, 'updateSourceElement' ).mockImplementation( () => {} );

					return newEditor.destroy()
						.then( () => {
							expect( spy ).not.toHaveBeenCalled();
						} );
				} );
		} );

		it( 'restores the editor element', () => {
			expect( editor.sourceElement.style.display ).toBe( 'none' );

			return editor.destroy()
				.then( () => {
					expect( editor.sourceElement.style.display ).toBe( '' );
				} );
		} );
	} );

	describe( 'static fields', () => {
		it( 'ClassicEditor.Context', () => {
			expect( ClassicEditor.Context ).toBe( Context );
		} );

		it( 'ClassicEditor.EditorWatchdog', () => {
			expect( ClassicEditor.EditorWatchdog ).toBe( EditorWatchdog );
		} );

		it( 'ClassicEditor.ContextWatchdog', () => {
			expect( ClassicEditor.ContextWatchdog ).toBe( ContextWatchdog );
		} );
	} );
} );
