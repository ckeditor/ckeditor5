/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

import { assertCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

const editorData = { foo: '<p>Foo</p>', bar: '<p>Bar</p>' };

describe( 'MultiRootEditor', () => {
	let editor;

	beforeEach( () => {
		vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
	} );

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	describe( 'constructor()', () => {
		beforeEach( () => {
			editor = new MultiRootEditor( { foo: '', bar: '' } );
		} );

		it( 'uses HTMLDataProcessor', () => {
			expect( editor.data.processor ).toBeInstanceOf( HtmlDataProcessor );
		} );

		it( 'it\'s possible to extract editor name from editor instance', () => {
			expect( Object.getPrototypeOf( editor ).constructor.editorName ).toBe( 'MultiRootEditor' );
		} );

		it( 'has a Data Interface', () => {
			expect( MultiRootEditor.prototype ).toHaveProperty( 'setData' );
			expect( MultiRootEditor.prototype.setData ).toBeInstanceOf( Function );
			expect( MultiRootEditor.prototype ).toHaveProperty( 'getData' );
			expect( MultiRootEditor.prototype.getData ).toBeInstanceOf( Function );
		} );

		it( 'creates specified roots', () => {
			expect( editor.model.document.getRootNames() ).toEqual( [ 'foo', 'bar' ] );

			expect( editor.model.document.getRoot( 'foo' ) ).toBeInstanceOf( ModelRootElement );
			expect( editor.model.document.getRoot( 'bar' ) ).toBeInstanceOf( ModelRootElement );

			expect( editor.model.document.getRoot( 'foo' ).name ).toBe( '$root' );
			expect( editor.model.document.getRoot( 'bar' ).name ).toBe( '$root' );
		} );

		it( 'creates roots with the given modelElement names', () => {
			const customEditor = new MultiRootEditor( {
				roots: {
					foo: { modelElement: 'customRoot', initialData: '' },
					bar: { initialData: '' }
				}
			} );

			expect( customEditor.model.document.getRoot( 'foo' ).name ).toBe( 'customRoot' );
			expect( customEditor.model.document.getRoot( 'bar' ).name ).toBe( '$root' );

			customEditor.fire( 'ready' );

			return customEditor.destroy();
		} );

		describe( 'ui', () => {
			it( 'is created', () => {
				editor.ui.init();

				expect( editor.ui ).toBeInstanceOf( MultiRootEditorUI );
				expect( editor.ui.view ).toBeInstanceOf( MultiRootEditorUIView );

				editor.ui.destroy();
			} );

			describe( 'automatic toolbar items groupping', () => {
				it( 'should be on by default', () => {
					const editorElement = document.createElement( 'div' );
					const editor = new MultiRootEditor( editorElement );

					expect( editor.ui.view.toolbar.options.shouldGroupWhenFull ).toBe( true );

					editorElement.remove();
				} );

				it( 'can be disabled using config.toolbar.shouldNotGroupWhenFull', () => {
					const editorElement = document.createElement( 'div' );
					const editor = new MultiRootEditor( editorElement, {
						toolbar: {
							shouldNotGroupWhenFull: true
						}
					} );

					expect( editor.ui.view.toolbar.options.shouldGroupWhenFull ).toBe( false );

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

				expect( editor.config.get( 'roots' ).foo.initialData ).toBe( '<p>Foo</p>' );
				expect( editor.config.get( 'roots' ).bar.initialData ).toBe( '<p>Bar</p>' );
			} );

			it( 'if not set, is set using data passed in constructor', () => {
				const editor = new MultiRootEditor( { foo: '<p>Foo</p>', bar: '<p>Bar</p>' } );

				expect( editor.config.get( 'roots' ).foo.initialData ).toBe( '<p>Foo</p>' );
				expect( editor.config.get( 'roots' ).bar.initialData ).toBe( '<p>Bar</p>' );
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

				expect( editor.config.get( 'initialData' ) ).toEqual( { foo: '<p>Foo</p>', bar: '<p>Bar</p>' } );
			} );

			it( 'should throw if legacy config.initialData is set and initial data is passed in constructor', () => {
				expect( () => {
					// eslint-disable-next-line no-new
					new MultiRootEditor(
						{ foo: '<p>Foo</p>', bar: '<p>Bar</p>' },
						{ initialData: { foo: '<p>Foo</p>', bar: '<p>Bar</p>' } }
					);
				} ).toThrow( expect.objectContaining( {
					name: 'CKEditorError',
					message: expect.stringContaining( 'editor-create-initial-data-overspecified' )
				} ) );
			} );

			it( 'it should throw if config.roots.<name>.initialData is set and initial data is passed in constructor', () => {
				expect( () => {
					// eslint-disable-next-line no-new
					new MultiRootEditor(
						{ foo: '<p>Foo</p>', bar: '<p>Bar</p>' },
						{ roots: { foo: { initialData: '<p>Bar</p>' }, bar: { initialData: '<p>Abc</p>' } } }
					);
				} ).toThrow( expect.objectContaining( {
					name: 'CKEditorError',
					message: expect.stringContaining( 'editor-create-root-initial-data-overspecified' )
				} ) );
			} );

			it( 'it should throw if config.root is set', () => {
				const editorElement = document.createElement( 'div' );
				editorElement.innerHTML = '<p>Foo</p>';

				expect( () => {
					// eslint-disable-next-line no-new
					new MultiRootEditor( editorElement, {
						root: { initialData: '<p>abc</p>' }
					} );
				} ).toThrow( expect.objectContaining( {
					name: 'CKEditorError',
					message: expect.stringContaining( 'editor-create-multi-root-with-main' )
				} ) );
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

				expect( editor.config.get( 'roots' ).foo.placeholder ).toBe( 'Type in foo...' );
				expect( editor.config.get( 'roots' ).bar.placeholder ).toBe( 'Type in bar...' );
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

				expect( editor.config.get( 'roots' ).foo.placeholder ).toBe( 'Type in foo...' );
				expect( editor.config.get( 'roots' ).bar.placeholder ).toBe( 'Type in bar...' );
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

				expect( editor.config.get( 'roots' ).foo.label ).toBe( 'Foo label' );
				expect( editor.config.get( 'roots' ).bar.label ).toBe( 'Bar label' );
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

				expect( editor.config.get( 'roots' ).foo.label ).toBe( 'Foo label' );
				expect( editor.config.get( 'roots' ).bar.label ).toBe( 'Bar label' );
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

				expect( editor.config.get( 'roots' ).foo.initialData ).toBe( '<p>Foo</p>' );
				expect( editor.config.get( 'roots' ).bar.initialData ).toBe( '<p>Bar</p>' );
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

				expect( editor.sourceElements.foo ).toBe( fooEl );
				expect( editor.sourceElements.bar ).toBe( barEl );
				expect( editor.config.get( 'roots' ).foo.initialData ).toBe( '<p>Foo</p>' );
				expect( editor.config.get( 'roots' ).bar.initialData ).toBe( '<p>Bar</p>' );
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

				expect( editor.sourceElements.foo ).toBe( fooEl );
				expect( editor.sourceElements.bar ).toBe( barEl );
				expect( editor.config.get( 'roots' ).foo.initialData ).toBe( '<p>Foo</p>' );
				expect( editor.config.get( 'roots' ).bar.initialData ).toBe( '<p>Bar</p>' );
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
				} ).toThrow( expect.objectContaining( {
					name: 'CKEditorError',
					message: expect.stringContaining( 'editor-create-attachto-ignored' )
				} ) );
			} );

			it( 'should throw when config.roots.*.element is a textarea', () => {
				expect( () => {
					// eslint-disable-next-line no-new
					new MultiRootEditor( {
						roots: {
							foo: { element: document.createElement( 'textarea' ) }
						}
					} );
				} ).toThrow( expect.objectContaining( {
					name: 'CKEditorError',
					message: expect.stringContaining( 'editor-wrong-element' )
				} ) );
			} );

			it( 'should throw when config.roots.*.element is an input', () => {
				expect( () => {
					// eslint-disable-next-line no-new
					new MultiRootEditor( {
						roots: {
							foo: { element: document.createElement( 'input' ) }
						}
					} );
				} ).toThrow( expect.objectContaining( {
					name: 'CKEditorError',
					message: expect.stringContaining( 'editor-wrong-element' )
				} ) );
			} );

			it( 'should throw a developer-friendly error when config.roots has a custom prototype', () => {
				expect( () => {
					// eslint-disable-next-line no-new
					new MultiRootEditor( {
						roots: Object.assign( Object.create( {} ), {
							foo: { initialData: '' },
							bar: { initialData: '' }
						} )
					} );
				} ).toThrow( expect.objectContaining( {
					name: 'CKEditorError',
					message: expect.stringContaining( 'editor-create-roots-not-plain-object' )
				} ) );
			} );

			it( 'should throw a developer-friendly error when config.roots is a class instance', () => {
				class CustomRoots {
					constructor() {
						this.foo = { initialData: '' };
						this.bar = { initialData: '' };
					}
				}

				expect( () => {
					// eslint-disable-next-line no-new
					new MultiRootEditor( { roots: new CustomRoots() } );
				} ).toThrow( expect.objectContaining( {
					name: 'CKEditorError',
					message: expect.stringContaining( 'editor-create-roots-not-plain-object' )
				} ) );
			} );
		} );

		describe( 'config.roots.*.element', () => {
			describe( 'as a tag name string', () => {
				it( 'should create per-root editables with the given tag names', async () => {
					const newEditor = await MultiRootEditor.create( {
						plugins: [ Paragraph ],
						roots: {
							foo: { element: 'h1' },
							bar: { element: 'section' }
						}
					} );

					expect( newEditor.ui.getEditableElement( 'foo' ).tagName ).toBe( 'H1' );
					expect( newEditor.ui.getEditableElement( 'bar' ).tagName ).toBe( 'SECTION' );

					await newEditor.destroy();
				} );

				it( 'should reflect the tag name on the view roots', async () => {
					const newEditor = await MultiRootEditor.create( {
						plugins: [ Paragraph ],
						roots: { foo: { element: 'h1' } }
					} );

					expect( newEditor.editing.view.document.getRoot( 'foo' ).name ).toBe( 'h1' );

					await newEditor.destroy();
				} );

				it( 'should leave editor.sourceElements empty', async () => {
					const newEditor = await MultiRootEditor.create( {
						plugins: [ Paragraph ],
						roots: { foo: { element: 'h1' } }
					} );

					expect( newEditor.sourceElements ).toEqual( {} );

					await newEditor.destroy();
				} );

				it( 'should persist the element on $rootEditableOptions for RTC replication', async () => {
					const newEditor = await MultiRootEditor.create( {
						plugins: [ Paragraph ],
						roots: { foo: { element: 'h1' } }
					} );

					expect( newEditor.model.document.getRoot( 'foo' ).getAttribute( '$rootEditableOptions' ) )
						.toEqual( { element: { name: 'h1' } } );

					await newEditor.destroy();
				} );

				it( 'should throw when the tag name is `textarea`', () => {
					expect( () => {
						// eslint-disable-next-line no-new
						new MultiRootEditor( {
							roots: { foo: { element: 'textarea' } }
						} );
					} ).toThrow( expect.objectContaining( {
						name: 'CKEditorError',
						message: expect.stringContaining( 'editor-wrong-element' )
					} ) );
				} );

				it( 'should throw when the tag name is `input`', () => {
					expect( () => {
						// eslint-disable-next-line no-new
						new MultiRootEditor( {
							roots: { foo: { element: 'input' } }
						} );
					} ).toThrow( expect.objectContaining( {
						name: 'CKEditorError',
						message: expect.stringContaining( 'editor-wrong-element' )
					} ) );
				} );
			} );

			describe( 'as a view element definition object', () => {
				it( 'should create the editable element with the given tag name', async () => {
					const newEditor = await MultiRootEditor.create( {
						plugins: [ Paragraph ],
						roots: { foo: { element: { name: 'section' } } }
					} );

					expect( newEditor.ui.getEditableElement( 'foo' ).tagName ).toBe( 'SECTION' );

					await newEditor.destroy();
				} );

				it( 'should reflect the element shape on the view root', async () => {
					const newEditor = await MultiRootEditor.create( {
						plugins: [ Paragraph ],
						roots: {
							foo: {
								element: {
									name: 'section',
									classes: [ 'foo' ],
									attributes: { 'data-id': '123' }
								}
							}
						}
					} );

					const viewRoot = newEditor.editing.view.document.getRoot( 'foo' );

					expect( viewRoot.name ).toBe( 'section' );
					expect( viewRoot.hasClass( 'foo' ) ).toBe( true );
					expect( viewRoot.getAttribute( 'data-id' ) ).toBe( '123' );

					await newEditor.destroy();
				} );

				it( 'should apply classes, styles and attributes to the editable element', async () => {
					const newEditor = await MultiRootEditor.create( {
						plugins: [ Paragraph ],
						roots: {
							foo: {
								element: {
									name: 'section',
									classes: [ 'foo' ],
									styles: { color: 'rgb(255, 0, 0)' },
									attributes: { 'data-id': '123' }
								}
							}
						}
					} );

					const editable = newEditor.ui.getEditableElement( 'foo' );

					expect( editable.classList.contains( 'foo' ) ).toBe( true );
					expect( editable.style.color ).toBe( 'rgb(255, 0, 0)' );
					expect( editable.getAttribute( 'data-id' ) ).toBe( '123' );

					await newEditor.destroy();
				} );

				it( 'should persist the element on $rootEditableOptions in canonical form', async () => {
					const newEditor = await MultiRootEditor.create( {
						plugins: [ Paragraph ],
						roots: {
							foo: {
								element: {
									name: 'section',
									classes: 'foo bar',
									attributes: { class: 'baz', style: 'color: red' }
								}
							}
						}
					} );

					const stored = newEditor.model.document.getRoot( 'foo' ).getAttribute( '$rootEditableOptions' );

					expect( stored ).toHaveProperty( 'element' );
					expect( stored.element.name ).toBe( 'section' );
					// `classes` is always an array of individual tokens post-normalize, and `attributes.class` is lifted into it.
					expect( stored.element.classes ).toEqual( [ 'foo', 'bar', 'baz' ] );
					// `attributes.class` is replaced with an empty-string sentinel so the deep-merge in `Config.set()`
					// does not preserve the user-provided value.
					expect( stored.element.attributes ).toEqual( { class: '', style: 'color: red' } );

					await newEditor.destroy();
				} );

				it( 'should throw when the name is `textarea`', () => {
					expect( () => {
						// eslint-disable-next-line no-new
						new MultiRootEditor( {
							roots: { foo: { element: { name: 'textarea' } } }
						} );
					} ).toThrow( expect.objectContaining( {
						name: 'CKEditorError',
						message: expect.stringContaining( 'editor-wrong-element' )
					} ) );
				} );

				it( 'should throw when the name is `input`', () => {
					expect( () => {
						// eslint-disable-next-line no-new
						new MultiRootEditor( {
							roots: { foo: { element: { name: 'input' } } }
						} );
					} ).toThrow( expect.objectContaining( {
						name: 'CKEditorError',
						message: expect.stringContaining( 'editor-wrong-element' )
					} ) );
				} );
			} );

			describe( 'mixed forms', () => {
				it( 'should allow different forms across roots', async () => {
					const fooEl = document.createElement( 'div' );
					fooEl.innerHTML = '<p>From DOM</p>';

					const newEditor = await MultiRootEditor.create( {
						plugins: [ Paragraph ],
						roots: {
							foo: { element: fooEl },
							bar: { element: 'h1' },
							baz: { element: { name: 'section', classes: [ 'special' ] } }
						}
					} );

					expect( newEditor.sourceElements ).toHaveProperty( 'foo', fooEl );
					expect( newEditor.sourceElements ).not.toHaveProperty( 'bar' );
					expect( newEditor.sourceElements ).not.toHaveProperty( 'baz' );

					expect( newEditor.ui.getEditableElement( 'foo' ) ).toBe( fooEl );
					expect( newEditor.ui.getEditableElement( 'bar' ).tagName ).toBe( 'H1' );
					expect( newEditor.ui.getEditableElement( 'baz' ).tagName ).toBe( 'SECTION' );
					expect( newEditor.ui.getEditableElement( 'baz' ).classList.contains( 'special' ) ).toBe( true );

					await newEditor.destroy();
				} );
			} );

			describe( 'RTC fallback', () => {
				it( 'should recreate the editable from $rootEditableOptions when local config has no element', async () => {
					const newEditor = await MultiRootEditor.create( {
						plugins: [ Paragraph ],
						roots: {
							foo: {
								modelAttributes: {
									$rootEditableOptions: { element: { name: 'h1' } }
								}
							}
						}
					} );

					expect( newEditor.ui.getEditableElement( 'foo' ).tagName ).toBe( 'H1' );

					await newEditor.destroy();
				} );

				it( 'should prefer local config.roots.*.element over $rootEditableOptions', async () => {
					const newEditor = await MultiRootEditor.create( {
						plugins: [ Paragraph ],
						roots: {
							foo: {
								element: 'section',
								modelAttributes: {
									$rootEditableOptions: { element: { name: 'h1' } }
								}
							}
						}
					} );

					expect( newEditor.ui.getEditableElement( 'foo' ).tagName ).toBe( 'SECTION' );

					await newEditor.destroy();
				} );

				it( 'should normalize a raw string element pre-supplied in $rootEditableOptions', async () => {
					const newEditor = await MultiRootEditor.create( {
						plugins: [ Paragraph ],
						roots: {
							foo: {
								modelAttributes: {
									$rootEditableOptions: { element: 'h1' }
								}
							}
						}
					} );

					expect( newEditor.ui.getEditableElement( 'foo' ).tagName ).toBe( 'H1' );

					await newEditor.destroy();
				} );
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
				expect( editor.getData( { rootName: 'foo' } ) ).toBe( editorData.foo );
				expect( editor.getData( { rootName: 'bar' } ) ).toBe( editorData.bar );

				return editor.destroy();
			} );
		} );

		it( 'should reject if a root element is not a limit element', async () => {
			class NonLimitRootPlugin extends Plugin {
				init() {
					this.editor.model.schema.register( 'nonLimit', { isBlock: true } );
				}
			}

			const promise = MultiRootEditor.create( {
				plugins: [ Paragraph, NonLimitRootPlugin ],
				roots: { foo: { modelElement: 'nonLimit' } }
			} );

			await expect( promise ).rejects.toBeInstanceOf( CKEditorError );
			await expect( promise ).rejects.toThrow( /editor-root-element-is-not-limit/ );
		} );

		it( 'should reject if a lazy-loaded root element is not a limit element', async () => {
			class NonLimitRootPlugin extends Plugin {
				init() {
					this.editor.model.schema.register( 'nonLimit', { isBlock: true } );
				}
			}

			const promise = MultiRootEditor.create( {
				plugins: [ Paragraph, NonLimitRootPlugin ],
				roots: {
					foo: { lazyLoad: true, modelElement: 'nonLimit' }
				}
			} );

			await expect( promise ).rejects.toBeInstanceOf( CKEditorError );
			await expect( promise ).rejects.toThrow( /editor-root-element-is-not-limit/ );
		} );

		it( 'should reject if any of multiple roots is not a limit element', async () => {
			class NonLimitRootPlugin extends Plugin {
				init() {
					this.editor.model.schema.register( 'nonLimit', { isBlock: true } );
				}
			}

			const promise = MultiRootEditor.create( {
				plugins: [ Paragraph, NonLimitRootPlugin ],
				roots: {
					foo: {},
					bar: { modelElement: 'nonLimit' },
					baz: {}
				}
			} );

			await expect( promise ).rejects.toBeInstanceOf( CKEditorError );
			await expect( promise ).rejects.toThrow( /editor-root-element-is-not-limit/ );
			await expect( promise ).rejects.toMatchObject( {
				data: {
					rootName: 'bar',
					elementName: 'nonLimit'
				}
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
				expect( editor.getData( { rootName: 'foo' } ) ).toBe( '' );
				expect( editor.getData( { rootName: 'bar' } ) ).toBe( '' );

				return editor.destroy();
			} );
		} );

		it( 'initializes the editor if no roots are specified', () => {
			return MultiRootEditor.create( {} ).then( editor => editor.destroy() );
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
					expect( newEditor.getData( { rootName: 'foo' } ) ).toBe( '<p>Foo</p>' );
					expect( newEditor.getData( { rootName: 'bar' } ) ).toBe( '<p>Bar</p>' );

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
					expect( newEditor.getData( { rootName: 'foo' } ) ).toBe( '<p>Foo</p>' );
					expect( newEditor.getData( { rootName: 'bar' } ) ).toBe( '<p>Bar</p>' );
					expect( newEditor.sourceElements.foo ).toBe( fooEl );
					expect( newEditor.sourceElements.bar ).toBe( barEl );

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
					expect( newEditor.getData( { rootName: 'foo' } ) ).toBe( '<p>Foo</p>' );
					expect( newEditor.getData( { rootName: 'bar' } ) ).toBe( '<p>Bar</p>' );
					expect( newEditor.sourceElements.foo ).toBe( fooEl );
					expect( newEditor.sourceElements.bar ).toBe( barEl );

					return newEditor.destroy();
				} );
		} );

		it( 'should throw when trying to create the editor using the same source element more than once', () => {
			const sourceElement = document.createElement( 'div' );

			// eslint-disable-next-line no-new
			new MultiRootEditor( { sourceElement } );

			return MultiRootEditor.create( { sourceElement } )
				.then(
					() => {
						expect.fail( 'Multi-root editor should not initialize on an element already used by other instance.' );
					},
					err => {
						assertCKEditorError( err, 'editor-source-element-already-used' );
					}
				);
		} );

		it( 'throws error if it is initialized in textarea', () => {
			return MultiRootEditor.create( {
				foo: document.createElement( 'textarea' )
			} )
				.then(
					() => {
						expect.fail( 'Multi-root editor should throw an error when is initialized in textarea.' );
					},
					err => {
						assertCKEditorError( err, 'editor-wrong-element', null );
					}
				);
		} );

		it( 'throws error if it is initialized in input', () => {
			return MultiRootEditor.create( {
				foo: document.createElement( 'input' )
			} )
				.then(
					() => {
						expect.fail( 'Multi-root editor should throw an error when is initialized in input.' );
					},
					err => {
						assertCKEditorError( err, 'editor-wrong-element', null );
					}
				);
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
			} ).toThrow( expect.objectContaining( {
				name: 'CKEditorError',
				message: expect.stringContaining( 'editor-create-root-element-overspecified' )
			} ) );
		} );

		it( 'throws error when deprecated config.lazyRoots is used', () => {
			return MultiRootEditor.create( editorData, {
				lazyRoots: [ 'baz' ]
			} )
				.then(
					() => {
						expect.fail( 'Multi-root editor should throw an error when deprecated lazyRoots config is used.' );
					},
					err => {
						assertCKEditorError( err, 'multi-root-editor-root-deprecated-config-lazy-roots', null );
					}
				);
		} );

		it( 'normalizes legacy config.rootsAttributes to config.roots.<rootName>.modelAttributes', async () => {
			editor = await MultiRootEditor.create( editorData, {
				rootsAttributes: { foo: { order: 1 }, bar: { order: 2 } }
			} );

			const fooRoot = editor.model.document.getRoot( 'foo' );
			const barRoot = editor.model.document.getRoot( 'bar' );

			expect( fooRoot.getAttribute( 'order' ) ).toBe( 1 );
			expect( barRoot.getAttribute( 'order' ) ).toBe( 2 );

			await editor.destroy();
		} );

		it( 'throws error when legacy config.rootsAttributes references a non-existing root', () => {
			return MultiRootEditor.create( editorData, {
				rootsAttributes: { foo: { order: 1 }, nonExisting: { order: 2 } }
			} )
				.then(
					() => {
						expect.fail( 'Expected multi-root-editor-root-attributes-no-root to be thrown.' );
					},
					err => {
						assertCKEditorError( err, 'multi-root-editor-root-attributes-no-root', null );
					}
				);
		} );

		it( 'throws error when legacy config.rootsAttributes conflicts with config.roots.<rootName>.modelAttributes', () => {
			return MultiRootEditor.create( editorData, {
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
				);
		} );

		// This case should not throw as 'foo' and 'bar' roots are defined, but the DOM element for 'foo' is provided
		// and the DOM element for 'bar' is created by the editor.
		it.skip( 'throws error when initial roots are different than initial data - missing root in initial roots', () => {
			return MultiRootEditor.create( {
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
				.finally( () => {
					// Cleanup. This is difficult as we don't have editor instance to destroy.
					document.querySelector( '.ck-body-wrapper' ).remove();
				} );
		} );

		it( 'throws error when initial roots are different than initial data - initialData new root injection', () => {
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

			return MultiRootEditor.create( {
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
				.finally( () => {
					// Cleanup. This is difficult as we don't have editor instance to destroy.
					document.querySelector( '.ck-body-wrapper' ).remove();
				} );
		} );

		it( 'throws error when initial roots are different than initial data - detached root', () => {
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

			return MultiRootEditor.create( {
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
				.finally( () => {
					// Cleanup. This is difficult as we don't have editor instance to destroy.
					document.querySelector( '.ck-body-wrapper' ).remove();
				} );
		} );

		// This case should not throw as 'foo' and 'bar' roots are defined, but the initialData for 'bar' is extracted from the DOM element.
		it.skip( 'throws error when initial roots are different than initial data - missing root in initial data', () => {
			return MultiRootEditor.create( {
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
				.finally( () => {
					// Cleanup. This is difficult as we don't have editor instance to destroy.
					document.querySelector( '.ck-body-wrapper' ).remove();
				} );
		} );

		it( 'throws error when initial roots are different than initial data - initialData for root removed', () => {
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

			return MultiRootEditor.create( {
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

				expect( editor.editing.view.getDomRoot( 'foo' ).getAttribute( 'aria-label' ) ).toBe(
					'Rich Text Editor. Editing area: foo'
				);

				expect( editor.editing.view.getDomRoot( 'bar' ).getAttribute( 'aria-label' ) ).toBe(
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

				expect( editor.editing.view.getDomRoot( 'foo' ).getAttribute( 'aria-label' ) ).toBe(
					'Custom label'
				);

				expect( editor.editing.view.getDomRoot( 'bar' ).getAttribute( 'aria-label' ) ).toBe(
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

				expect( editor.editing.view.getDomRoot( 'foo' ).getAttribute( 'aria-label' ) ).toBe(
					'Foo custom label'
				);

				expect( editor.editing.view.getDomRoot( 'bar' ).getAttribute( 'aria-label' ) ).toBe(
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

				expect( editor.editing.view.getDomRoot( 'foo' ).getAttribute( 'aria-label' ) ).toBe(
					'Rich Text Editor. Editing area: foo'
				);

				expect( editor.editing.view.getDomRoot( 'bar' ).getAttribute( 'aria-label' ) ).toBe(
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

				expect( editor.editing.view.getDomRoot( 'foo' ).getAttribute( 'aria-label' ) ).toBe(
					'Foo pre-existing value'
				);

				expect( editor.editing.view.getDomRoot( 'bar' ).getAttribute( 'aria-label' ) ).toBe(
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

				expect( editor.editing.view.getDomRoot( 'foo' ).getAttribute( 'aria-label' ) ).toBe(
					'Foo override'
				);

				expect( editor.editing.view.getDomRoot( 'bar' ).getAttribute( 'aria-label' ) ).toBe(
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

				expect( editor.editing.view.getDomRoot( 'foo' ).getAttribute( 'aria-label' ), 'Override value' ).toBe(
					'Rich Text Editor. Editing area: foo'
				);

				expect( editor.editing.view.getDomRoot( 'bar' ).getAttribute( 'aria-label' ), 'Override value' ).toBe(
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

				expect( editor.editing.view.getDomRoot( 'foo' ).getAttribute( 'aria-label' ) ).toBe(
					'Foo override'
				);

				expect( editor.editing.view.getDomRoot( 'bar' ).getAttribute( 'aria-label' ) ).toBe(
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

				expect( editor.editing.view.getDomRoot( 'foo' ).getAttribute( 'aria-label' ) ).toBe(
					'Foo root label'
				);

				expect( editor.editing.view.getDomRoot( 'bar' ).getAttribute( 'aria-label' ) ).toBe(
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

				expect( editor.editing.view.getDomRoot( 'foo' ).getAttribute( 'aria-label' ) ).toBe(
					'Foo root label'
				);

				expect( editor.editing.view.getDomRoot( 'bar' ).getAttribute( 'aria-label' ) ).toBe(
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
						expect( newEditor ).toBeInstanceOf( MultiRootEditor );

						return newEditor.destroy();
					} );
			} );

			it( 'loads the initial data', () => {
				return MultiRootEditor
					.create( getElementOrData(), {
						plugins: [ Paragraph, Bold ]
					} )
					.then( newEditor => {
						expect( newEditor.getData( { rootName: 'foo' } ) ).toBe( editorData.foo );
						expect( newEditor.getData( { rootName: 'bar' } ) ).toBe( editorData.bar );

						return newEditor.destroy();
					} );
			} );

			it( 'should not require config object', () => {
				// Just being safe with `builtinPlugins` static property.
				class CustomMultiRootEditor extends MultiRootEditor {}
				CustomMultiRootEditor.builtinPlugins = [ Paragraph, Bold ];

				return CustomMultiRootEditor.create( getElementOrData() )
					.then( newEditor => {
						expect( newEditor.getData( { rootName: 'foo' } ) ).toBe( editorData.foo );
						expect( newEditor.getData( { rootName: 'bar' } ) ).toBe( editorData.bar );

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
						expect( newEditor ).toBeInstanceOf( CustomMultiRootEditor );
						expect( newEditor ).toBeInstanceOf( MultiRootEditor );

						expect( newEditor.getData( { rootName: 'foo' } ) ).toBe( editorData.foo );
						expect( newEditor.getData( { rootName: 'bar' } ) ).toBe( editorData.bar );

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
							expect( fired ).toEqual( [
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
							expect( isReady ).toBe( true );

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

			expect( root ).not.toBeNull();
			expect( root.isAttached() ).toBe( true );

			const op = document.history.getOperation( version );
			expect( op.type ).toBe( 'addRoot' );
			expect( op.rootName ).toBe( 'bar' );

			expect( editor.getData( { rootName: 'bar' } ) ).toBe( '' );

			// By default, `addRoot()` is not undoable.
			expect( editor.commands.get( 'undo' ).isEnabled ).toBe( false );
		} );

		it( 'should init the root with given data', () => {
			editor.addRoot( 'bar', { data: '<p>Foo.</p>' } );

			expect( editor.getData( { rootName: 'bar' } ) ).toBe( '<p>Foo.</p>' );
		} );

		it( 'should add a model root with given element name', () => {
			editor.model.schema.register( 'div', { isLimit: true } );
			editor.addRoot( 'bar', { elementName: 'div' } );

			const root = editor.model.document.getRoot( 'bar' );

			expect( root.name ).toBe( 'div' );
		} );

		it( 'should add a model root with default name', () => {
			editor.addRoot( 'bar', {} );

			const root = editor.model.document.getRoot( 'bar' );

			expect( root.name ).toBe( '$root' );
		} );

		it( 'should add a model root with given modelElement', () => {
			editor.model.schema.register( 'customRoot', { isLimit: true } );
			editor.addRoot( 'bar', { modelElement: 'customRoot' } );

			const root = editor.model.document.getRoot( 'bar' );

			expect( root.name ).toBe( 'customRoot' );
		} );

		it( 'should throw if the model element is not a limit element', () => {
			editor.model.schema.register( 'nonLimit', { isBlock: true } );

			expect( () => {
				editor.addRoot( 'bar', { modelElement: 'nonLimit' } );
			} ).toThrow( expect.objectContaining( {
				name: 'CKEditorError',
				message: expect.stringContaining( 'multi-root-editor-add-root-element-is-not-limit' )
			} ) );
		} );

		it( 'should add a model root with given attributes', () => {
			vi.spyOn( editor, 'registerRootAttribute' );

			editor.addRoot( 'bar', { attributes: { order: 20, isLocked: true } } );

			const root = editor.model.document.getRoot( 'bar' );

			expect( root.getAttribute( 'order' ) ).toBe( 20 );
			expect( root.getAttribute( 'isLocked' ) ).toBe( true );

			expect( editor.registerRootAttribute ).toHaveBeenCalledWith( 'order' );
			expect( editor.registerRootAttribute ).toHaveBeenCalledWith( 'isLocked' );
		} );

		it( 'should add a model root which can be undone by undo feature if `isUndoable` is set to `true`', () => {
			editor.addRoot( 'bar', { data: '<p>Foo.</p>', isUndoable: true } );

			expect( editor.commands.get( 'undo' ).isEnabled ).toBe( true );

			editor.execute( 'undo' );

			const root = editor.model.document.getRoot( 'bar' );

			expect( root ).not.toBeNull();
			expect( root.isAttached() ).toBe( false );
		} );

		it( 'should init the root with given initialData', () => {
			editor.addRoot( 'bar', { initialData: '<p>Foo.</p>' } );

			expect( editor.getData( { rootName: 'bar' } ) ).toBe( '<p>Foo.</p>' );
		} );

		it( 'should add a model root with given modelAttributes', () => {
			vi.spyOn( editor, 'registerRootAttribute' );

			editor.addRoot( 'bar', { modelAttributes: { order: 20, isLocked: true } } );

			const root = editor.model.document.getRoot( 'bar' );

			expect( root.getAttribute( 'order' ) ).toBe( 20 );
			expect( root.getAttribute( 'isLocked' ) ).toBe( true );

			expect( editor.registerRootAttribute ).toHaveBeenCalledWith( 'order' );
			expect( editor.registerRootAttribute ).toHaveBeenCalledWith( 'isLocked' );
		} );

		it( 'should set placeholder as root editable option', () => {
			editor.addRoot( 'bar', { placeholder: 'Type here...' } );

			const root = editor.model.document.getRoot( 'bar' );

			expect( root.getAttribute( '$rootEditableOptions' ) ).toEqual( { placeholder: 'Type here...' } );
		} );

		it( 'should set label as root editable option', () => {
			editor.addRoot( 'bar', { label: 'My label' } );

			const root = editor.model.document.getRoot( 'bar' );

			expect( root.getAttribute( '$rootEditableOptions' ) ).toEqual( { label: 'My label' } );
		} );

		it( 'should set both placeholder and label as root editable options', () => {
			editor.addRoot( 'bar', { placeholder: 'Type here...', label: 'My label' } );

			const root = editor.model.document.getRoot( 'bar' );

			expect( root.getAttribute( '$rootEditableOptions' ) ).toEqual( {
				placeholder: 'Type here...',
				label: 'My label'
			} );
		} );

		it( 'should not overwrite $rootEditableOptions explicitly passed in attributes', () => {
			const explicitOptions = { placeholder: 'From attributes', label: 'From attributes' };

			editor.addRoot( 'bar', {
				attributes: { $rootEditableOptions: explicitOptions },
				placeholder: 'From options',
				label: 'From options'
			} );

			const root = editor.model.document.getRoot( 'bar' );

			expect( root.getAttribute( '$rootEditableOptions' ) ).toEqual( explicitOptions );
		} );

		it( 'should not mutate the attributes object passed by the caller', () => {
			const attributes = { order: 10 };

			editor.addRoot( 'bar', { attributes, placeholder: 'Type here...' } );

			expect( attributes ).toEqual( { order: 10 } );
		} );

		it( 'should prefer initialData over data', () => {
			editor.addRoot( 'bar', { initialData: '<p>New.</p>', data: '<p>Old.</p>' } );

			expect( editor.getData( { rootName: 'bar' } ) ).toBe( '<p>New.</p>' );
		} );

		it( 'should prefer modelAttributes over attributes', () => {
			editor.addRoot( 'bar', { modelAttributes: { order: 10 }, attributes: { order: 20 } } );

			const root = editor.model.document.getRoot( 'bar' );

			expect( root.getAttribute( 'order' ) ).toBe( 10 );
		} );

		it( 'should log warning when options.element is a DOM element', () => {
			const el = document.createElement( 'div' );

			editor.addRoot( 'baz', { element: el } );

			expect( console.warn ).toHaveBeenCalledWith(
				'multi-root-editor-add-root-element-option-ignored',
				expect.any( String )
			);
		} );

		it( 'should drop a DOM element from $rootEditableOptions on warning', () => {
			editor.addRoot( 'baz', { element: document.createElement( 'div' ) } );

			const stored = editor.model.document.getRoot( 'baz' ).getAttribute( '$rootEditableOptions' );

			expect( stored ).not.toHaveProperty( 'element' );
		} );

		it( 'should accept a tag name string and persist it normalized on $rootEditableOptions', () => {
			editor.addRoot( 'baz', { element: 'h1' } );

			const stored = editor.model.document.getRoot( 'baz' ).getAttribute( '$rootEditableOptions' );

			expect( stored ).toEqual( { element: { name: 'h1' } } );
		} );

		it( 'should accept a view element definition and persist it normalized on $rootEditableOptions', () => {
			editor.addRoot( 'baz', {
				element: {
					name: 'section',
					classes: 'foo bar',
					attributes: { class: 'baz', 'data-id': '123' }
				}
			} );

			const stored = editor.model.document.getRoot( 'baz' ).getAttribute( '$rootEditableOptions' );

			expect( stored.element.name ).toBe( 'section' );
			expect( stored.element.classes ).toEqual( [ 'foo', 'bar', 'baz' ] );
			// `attributes.class` is replaced with an empty-string sentinel so the deep-merge in `Config.set()` does
			// not preserve the user-provided value.
			expect( stored.element.attributes ).toEqual( { class: '', 'data-id': '123' } );
		} );

		it( 'should throw when the element tag name is `textarea`', () => {
			expect( () => {
				editor.addRoot( 'baz', { element: 'textarea' } );
			} ).toThrow( expect.objectContaining( {
				name: 'CKEditorError',
				message: expect.stringContaining( 'editor-wrong-element' )
			} ) );
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

			expect( root ).not.toBeNull();
			expect( root.isAttached() ).toBe( false );

			const op = document.history.getOperation( document.version - 1 );
			expect( op.type ).toBe( 'detachRoot' );
			expect( op.rootName ).toBe( 'bar' );

			expect( editor.getData( { rootName: 'bar' } ) ).toBe( '' );

			// By default, `detachRoot()` is not undoable.
			expect( editor.commands.get( 'undo' ).isEnabled ).toBe( false );
		} );

		it( 'should detach given model root which can be undone by undo feature if `isUndoable` is set to `true`', () => {
			editor.detachRoot( 'bar', true );

			expect( editor.commands.get( 'undo' ).isEnabled ).toBe( true );

			editor.execute( 'undo' );

			const root = editor.model.document.getRoot( 'bar' );

			expect( root.isAttached() ).toBe( true );
		} );

		it( 'should detach a dynamically added root', () => {
			editor.addRoot( 'new' );
			editor.detachRoot( 'new' );

			const root = editor.model.document.getRoot( 'new' );

			expect( root ).not.toBeNull();
			expect( root.isAttached() ).toBe( false );
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

				expect( rootFoo ).not.toBeNull();
				expect( rootFoo.rootName ).toBe( 'foo' );
				expect( rootFoo.isAttached() ).toBe( true );
				expect( rootFoo._isLoaded ).toBe( false );

				expect( rootBar ).not.toBeNull();
				expect( rootBar.rootName ).toBe( 'bar' );
				expect( rootBar.isAttached() ).toBe( true );
				expect( rootBar._isLoaded ).toBe( false );

				expect( editor.model.document.getRootNames() ).toEqual( [ 'main' ] );

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

				expect( editor.model.document.getRootNames() ).toEqual( [] );

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
				} ).toThrow( expect.objectContaining( {
					name: 'CKEditorError',
					message: expect.stringContaining( 'multi-root-editor-load-root-no-root' )
				} ) );
			} );

			it( 'should set not-loaded root as loaded and set initial data and attributes', () => {
				vi.spyOn( editor, 'registerRootAttribute' );

				editor.loadRoot( 'foo', { data: '<p>Foo</p>', attributes: { order: 100 } } );

				expect( root._isLoaded ).toBe( true );
				expect( editor.getData( { rootName: 'foo' } ) ).toBe( '<p>Foo</p>' );
				expect( editor.getRootAttributes( 'foo' ) ).toEqual( { order: 100, $rootEditableOptions: {} } );

				expect( editor.registerRootAttribute ).toHaveBeenCalledWith( 'order' );
			} );

			it( 'should load an empty root', () => {
				editor.loadRoot( 'foo' );

				expect( root._isLoaded ).toBe( true );
				expect( editor.getData( { rootName: 'foo' } ) ).toBe( '' );
				expect( editor.getRootAttributes( 'foo' ) ).toEqual( { $rootEditableOptions: {} } );
			} );

			it( 'should log a warning and not do anything when a root is loaded for the second time', () => {
				editor.loadRoot( 'foo', { data: '<p>Foo</p>', attributes: { order: 100 } } );

				const spy = vi.fn();

				editor.on( 'loadRoot', spy );
				editor.loadRoot( 'foo', { data: '<p>Bar</p>', attributes: { order: 200 } } );

				expect( console.warn ).toHaveBeenCalledWith(
					expect.stringMatching( /^multi-root-editor-load-root-already-loaded/ ),
					expect.any( String )
				);

				expect( root._isLoaded ).toBe( true );
				expect( editor.getData( { rootName: 'foo' } ) ).toBe( '<p>Foo</p>' );
				expect( editor.getRootAttributes( 'foo' ) ).toEqual( { order: 100, $rootEditableOptions: {} } );

				expect( spy ).not.toHaveBeenCalled();
			} );

			it( 'should buffer the root in the differ', () => {
				const spy = vi.spyOn( editor.model.document.differ, '_bufferRootLoad' );

				editor.loadRoot( 'foo', { data: '<p>Foo</p>', attributes: { order: 100 } } );

				expect( spy ).toHaveBeenCalledWith( root );
			} );

			it( 'should not be undoable', () => {
				editor.loadRoot( 'foo', { data: '<p>Foo</p>', attributes: { order: 100 } } );

				expect( editor.commands.get( 'undo' ).isEnabled ).toBe( false );
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

			expect( result ).toBe( false );
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

			expect( resultSelection ).toBe( true );
			expect( resultPos ).toBe( true );
			expect( resultRange ).toBe( true );
			expect( resultNode ).toBe( true );
			expect( resultRanges ).toBe( true );
			expect( resultEmptySelection ).toBe( true );
			expect( resultNull ).toBe( true );
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

			expect( resultSelection ).toBe( false );
			expect( resultPos ).toBe( false );
			expect( resultRange ).toBe( false );
			expect( resultNode ).toBe( false );
			expect( resultRanges ).toBe( false );
			expect( resultEmptySelection ).toBe( false );
			expect( resultNull ).toBe( false );
		} );

		it( 'should return false when given root is disabled', () => {
			editor.disableRoot( 'main' );

			const element = editor.model.document.getRoot( 'main' ).getChild( 0 );
			const result = editor.model.canEditAt( element );

			expect( result ).toBe( false );
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

			expect( mainResult ).toBe( true );
			expect( secondResult ).toBe( false );
		} );

		it( 'should throw when trying to disable $graveyard root', () => {
			expect( () => {
				editor.disableRoot( '$graveyard' );
			} ).toThrow( expect.objectContaining( {
				name: 'CKEditorError',
				message: expect.stringContaining( 'multi-root-editor-cannot-disable-graveyard-root' )
			} ) );
		} );

		it( 'should be able to enable disabled root', () => {
			editor.disableRoot( 'second' );

			const element = editor.model.document.getRoot( 'second' ).getChild( 0 );
			let result = editor.model.canEditAt( element );

			expect( result ).toBe( false );

			editor.enableRoot( 'second' );
			result = editor.model.canEditAt( element );

			expect( result ).toBe( true );
		} );

		it( 'should use lockIds for enabling / disabling roots', () => {
			const element = editor.model.document.getRoot( 'second' ).getChild( 0 );

			editor.disableRoot( 'second', 'firstLock' );
			editor.disableRoot( 'second', 'secondLock' );
			editor.disableRoot( 'second', 'secondLock' );

			editor.enableRoot( 'second', 'firstLock' );
			editor.enableRoot( 'second', 'differentLock' );

			let result = editor.model.canEditAt( element );
			expect( result ).toBe( false );

			editor.enableRoot( 'second', 'secondLock' );

			result = editor.model.canEditAt( element );
			expect( result ).toBe( true );
		} );

		it( 'should manage view editables isReadOnly', () => {
			const secondViewRoot = editor.editing.view.document.getRoot( 'second' );
			// Figure, table (0 = div UI element, 1 = table), tbody, tr, td.
			const secondViewTableCell = secondViewRoot.getChild( 0 ).getChild( 1 ).getChild( 0 ).getChild( 0 ).getChild( 0 );

			expect( secondViewRoot.isReadOnly ).toBe( false );
			expect( secondViewTableCell.isReadOnly ).toBe( false );

			editor.disableRoot( 'second' );

			expect( secondViewRoot.isReadOnly ).toBe( true );
			expect( secondViewTableCell.isReadOnly ).toBe( true );

			editor.enableRoot( 'second' );

			expect( secondViewRoot.isReadOnly ).toBe( false );
			expect( secondViewTableCell.isReadOnly ).toBe( false );
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

			expect( fullData ).toEqual( {
				old: '<p>Old.</p>',
				foo: '<p>Foo.</p>',
				new: '<p>New.</p>',
				abc: '<p>Abc.</p>'
			} );
		} );

		it( 'should pass options flags to data controller', () => {
			vi.spyOn( editor.data, 'get' );

			editor.getFullData( { foo: 'bar' } );

			expect( editor.data.get ).toHaveBeenCalledWith( expect.objectContaining( { foo: 'bar' } ) );
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

			expect( element.innerHTML ).toBe( '<p><br data-cke-filler="true"></p>' );
			expect( editor.getData( { rootName: 'new' } ) ).toBe( '' );

			editor.setData( { new: '<p>New.</p>' } );

			expect( element.innerHTML ).toBe( '<p>New.</p>' );

			editor.model.change( writer => {
				const root = editor.model.document.getRoot( 'new' );

				writer.insertText( 'Abc.', root.getChild( 0 ), 0 );
			} );

			expect( element.innerHTML ).toBe( '<p>Abc.New.</p>' );
		} );

		it( 'should create editable in the editor UI view', () => {
			editor.addRoot( 'new' );

			vi.spyOn( editor.ui.view, 'createEditable' );

			editor.createEditable( editor.model.document.getRoot( 'new' ) );

			expect( editor.ui.view.createEditable ).toHaveBeenCalledTimes( 1 );
			expect( editor.ui.view.editables.new ).not.toBeUndefined();
		} );

		it( 'should add an editable to editor UI', () => {
			editor.addRoot( 'new' );

			vi.spyOn( editor.ui, 'addEditable' );

			editor.createEditable( editor.model.document.getRoot( 'new' ) );

			expect( editor.ui.addEditable ).toHaveBeenCalledTimes( 1 );
			expect( editor.ui.getEditableElement( 'new' ) ).not.toBeNull();
		} );

		it( 'should add custom placeholder to the editable', () => {
			editor.addRoot( 'new' );

			editor.createEditable( editor.model.document.getRoot( 'new' ), 'new' );

			const editableElement = editor.ui.view.editables.new.element;

			expect( editableElement.children[ 0 ].dataset.placeholder ).toBe( 'new' );
		} );

		it( 'should allow for setting a custom label to the editable', () => {
			editor.addRoot( 'new' );

			editor.createEditable( editor.model.document.getRoot( 'new' ), undefined, 'Custom label' );

			const editableElement = editor.ui.view.editables.new.element;

			expect( editableElement.getAttribute( 'aria-label' ) ).toBe( 'Custom label' );
		} );

		it( 'should accept options object with placeholder and label', () => {
			editor.addRoot( 'new' );

			editor.createEditable( editor.model.document.getRoot( 'new' ), { placeholder: 'Type...', label: 'My label' } );

			const editableElement = editor.ui.view.editables.new.element;

			expect( editableElement.children[ 0 ].dataset.placeholder ).toBe( 'Type...' );
			expect( editableElement.getAttribute( 'aria-label' ) ).toBe( 'My label' );
		} );

		it( 'should use $rootEditableOptions from root attribute as fallback for placeholder and label', () => {
			editor.addRoot( 'new', { placeholder: 'Root placeholder', label: 'Root label' } );

			editor.createEditable( editor.model.document.getRoot( 'new' ) );

			const editableElement = editor.ui.view.editables.new.element;

			expect( editableElement.children[ 0 ].dataset.placeholder ).toBe( 'Root placeholder' );
			expect( editableElement.getAttribute( 'aria-label' ) ).toBe( 'Root label' );
		} );

		it( 'should work when root has no $rootEditableOptions attribute', () => {
			editor.model.change( writer => {
				writer.addRoot( 'new' );
			} );

			editor.createEditable( editor.model.document.getRoot( 'new' ) );

			const editableElement = editor.ui.view.editables.new.element;

			expect( editableElement ).toBeInstanceOf( HTMLElement );
		} );

		it( 'should accept `element` as a tag name string in options', () => {
			editor.addRoot( 'new' );

			const el = editor.createEditable( editor.model.document.getRoot( 'new' ), { element: 'h1' } );

			expect( el.tagName ).toBe( 'H1' );
		} );

		it( 'should accept `element` as a view element definition in options', () => {
			editor.addRoot( 'new' );

			const el = editor.createEditable( editor.model.document.getRoot( 'new' ), {
				element: {
					name: 'section',
					classes: [ 'foo' ],
					attributes: { 'data-id': '123' }
				}
			} );

			expect( el.tagName ).toBe( 'SECTION' );
			expect( el.classList.contains( 'foo' ) ).toBe( true );
			expect( el.getAttribute( 'data-id' ) ).toBe( '123' );
		} );

		it( 'should fall back to $rootEditableOptions.element when not passed in options', () => {
			editor.addRoot( 'new', { element: 'h1' } );

			const el = editor.createEditable( editor.model.document.getRoot( 'new' ) );

			expect( el.tagName ).toBe( 'H1' );
		} );

		it( 'should prefer options.element over $rootEditableOptions.element', () => {
			editor.addRoot( 'new', { element: 'h1' } );

			const el = editor.createEditable( editor.model.document.getRoot( 'new' ), { element: 'section' } );

			expect( el.tagName ).toBe( 'SECTION' );
		} );

		it( 'should normalize a raw string element stored in $rootEditableOptions', () => {
			editor.addRoot( 'new' );
			editor.model.change( writer => {
				writer.setAttribute( '$rootEditableOptions', { element: 'h1' }, editor.model.document.getRoot( 'new' ) );
			} );

			const el = editor.createEditable( editor.model.document.getRoot( 'new' ) );

			expect( el.tagName ).toBe( 'H1' );
		} );

		it( 'should throw when options.element tag name is `textarea`', () => {
			editor.addRoot( 'new' );

			expect( () => {
				editor.createEditable( editor.model.document.getRoot( 'new' ), { element: 'textarea' } );
			} ).toThrow( expect.objectContaining( {
				name: 'CKEditorError',
				message: expect.stringContaining( 'editor-wrong-element' )
			} ) );
		} );

		it( 'should accept `element` as an existing HTMLElement and return that same element', () => {
			editor.addRoot( 'new' );

			const provided = document.createElement( 'section' );
			const returned = editor.createEditable( editor.model.document.getRoot( 'new' ), { element: provided } );

			expect( returned ).toBe( provided );
			expect( returned.tagName ).toBe( 'SECTION' );
		} );

		it( 'should preserve attributes and classes already set on the provided HTMLElement', () => {
			editor.addRoot( 'new' );

			const provided = document.createElement( 'section' );
			provided.classList.add( 'foo' );
			provided.setAttribute( 'data-id', '123' );

			const returned = editor.createEditable( editor.model.document.getRoot( 'new' ), { element: provided } );

			expect( returned.classList.contains( 'foo' ) ).toBe( true );
			expect( returned.getAttribute( 'data-id' ) ).toBe( '123' );
		} );

		it( 'should render downcasted model data into the provided HTMLElement', () => {
			editor.addRoot( 'new' );

			const provided = document.createElement( 'div' );
			editor.createEditable( editor.model.document.getRoot( 'new' ), { element: provided } );

			editor.setData( { new: '<p>New.</p>' } );

			expect( provided.innerHTML ).toBe( '<p>New.</p>' );
		} );

		it( 'should prefer the provided HTMLElement over $rootEditableOptions.element', () => {
			editor.addRoot( 'new', { element: 'h1' } );

			const provided = document.createElement( 'section' );
			const returned = editor.createEditable( editor.model.document.getRoot( 'new' ), { element: provided } );

			expect( returned ).toBe( provided );
			expect( returned.tagName ).toBe( 'SECTION' );
		} );

		it( 'should not persist the provided HTMLElement in $rootEditableOptions', () => {
			editor.addRoot( 'new' );

			const provided = document.createElement( 'section' );
			editor.createEditable( editor.model.document.getRoot( 'new' ), { element: provided } );

			const storedOptions = editor.model.document.getRoot( 'new' ).getAttribute( '$rootEditableOptions' );

			expect( storedOptions && storedOptions.element ).toBeUndefined();
		} );

		it( 'should throw when the provided HTMLElement has a disallowed tag name', () => {
			editor.addRoot( 'new' );

			const provided = document.createElement( 'textarea' );

			expect( () => {
				editor.createEditable( editor.model.document.getRoot( 'new' ), { element: provided } );
			} ).toThrow( expect.objectContaining( {
				name: 'CKEditorError',
				message: expect.stringContaining( 'editor-wrong-element' )
			} ) );
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

			expect( editableElement.innerHTML ).toBe( '<p>Foo.</p>' );

			const returnedElement = editor.detachEditable( editor.model.document.getRoot( 'foo' ) );

			expect( returnedElement ).toBe( editableElement );

			editor.model.change( writer => {
				const root = editor.model.document.getRoot( 'foo' );

				writer.insertText( 'Bar.', root.getChild( 0 ), 'end' );
			} );

			expect( returnedElement.innerHTML ).toBe( '<p>Foo.</p>' );
		} );

		it( 'should remove the editable from editor UI', () => {
			vi.spyOn( editor.ui, 'removeEditable' );

			const editable = editor.ui.view.editables.foo;

			editor.detachEditable( editor.model.document.getRoot( 'foo' ) );

			expect( editor.ui.removeEditable ).toHaveBeenCalledTimes( 1 );
			expect( editor.ui.removeEditable ).toHaveBeenCalledWith( editable );
		} );

		it( 'should remove the editable from the editor UI view', () => {
			vi.spyOn( editor.ui.view, 'removeEditable' );

			editor.detachEditable( editor.model.document.getRoot( 'foo' ) );

			expect( editor.ui.view.editables.foo ).toBeUndefined();

			expect( editor.ui.view.removeEditable ).toHaveBeenCalledTimes( 1 );
			expect( editor.ui.view.removeEditable ).toHaveBeenCalledWith( 'foo' );
		} );
	} );

	it( 'should fire `addRoot` event when a root is added in model', () => {
		return MultiRootEditor.create( { foo: '' }, { plugins: [ Paragraph, Undo ] } ).then( editor => {
			const addRootPromise = new Promise( resolve => {
				editor.on( 'addRoot', ( evt, root ) => {
					expect( root.rootName ).toBe( 'new' );
					expect( root.name ).toBe( 'div' );

					resolve();
				} );
			} );

			editor.model.change( writer => {
				writer.addRoot( 'new', 'div' );
			} );

			return addRootPromise.finally( () => editor.destroy() );
		} );
	} );

	it( 'should fire `detachRoot` event when a root is detached from model', () => {
		return MultiRootEditor.create( { foo: '' }, { plugins: [ Paragraph, Undo ] } ).then( editor => {
			const detachRootPromise = new Promise( resolve => {
				editor.on( 'detachRoot', ( evt, root ) => {
					expect( root.rootName ).toBe( 'foo' );
					expect( root.name ).toBe( '$root' );

					resolve();
				} );
			} );

			editor.model.change( writer => {
				writer.detachRoot( 'foo' );
			} );

			return detachRootPromise.finally( () => editor.destroy() );
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
			expect( events ).toEqual( [ 'detachRoot', 'addRoot' ] );
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

			expect( fooRoot.getAttribute( '$rootEditableOptions' ) ).toEqual( { placeholder: 'Type here...' } );

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

			expect( fooRoot.getAttribute( 'order' ) ).toBe( 10 );
			expect( fooRoot.hasAttribute( 'isLocked' ) ).toBe( false );

			expect( barRoot.hasAttribute( 'order' ) ).toBe( false );
			expect( barRoot.getAttribute( 'isLocked' ) ).toBe( false );

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

			expect( editor.getRootsAttributes() ).toEqual( {
				foo: { order: 10, isLocked: null, $rootEditableOptions: {} },
				bar: { order: null, isLocked: false, $rootEditableOptions: {} }
			} );

			expect( editor.editing.model.schema.checkAttribute( '$root', 'order' ) ).toBe( true );
			expect( editor.editing.model.schema.checkAttribute( '$root', 'isLocked' ) ).toBe( true );

			await editor.destroy();
		} );

		it.skip( 'should throw when trying to set an attribute on non-existing root', () => {
			return MultiRootEditor.create( { foo: '', bar: '' }, {
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
			);
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

			expect( editor.getRootAttributes( 'foo' ) ).toEqual( {
				isLocked: true,
				order: 30,
				$rootEditableOptions: {}
			} );

			expect( editor.getRootAttributes( 'bar' ) ).toEqual( {
				isLocked: true,
				order: 20,
				$rootEditableOptions: {}
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

			expect( editor.getRootAttributes( 'foo' ) ).toEqual( {
				isLocked: null,
				order: 10,
				$rootEditableOptions: {}
			} );

			expect( editor.getRootAttributes( 'bar' ) ).toEqual( {
				isLocked: true,
				order: null,
				$rootEditableOptions: {}
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

			expect( editor.getRootAttributes( 'foo' ) ).toEqual( {
				isLocked: true,
				order: 10,
				$rootEditableOptions: {}
			} );

			expect( editor.getRootAttributes( 'bar' ) ).toEqual( {
				isLocked: false,
				order: 20,
				$rootEditableOptions: {}
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

			expect( editor.getRootAttributes( 'foo' ) ).toEqual( {
				isLocked: true,
				order: 10,
				$rootEditableOptions: {}
			} );

			expect( editor.getRootAttributes( 'bar' ) ).toEqual( {
				isLocked: false,
				order: null,
				$rootEditableOptions: {}
			} );

			await editor.destroy();
		} );

		it( 'should include $rootEditableOptions when placeholder or label are configured', async () => {
			editor = await MultiRootEditor.create( { foo: '' }, {
				roots: {
					foo: {
						modelAttributes: { order: 10 },
						placeholder: 'Type here...',
						label: 'My label'
					}
				}
			} );

			expect( editor.getRootAttributes( 'foo' ) ).toEqual( {
				order: 10,
				$rootEditableOptions: { placeholder: 'Type here...', label: 'My label' }
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

			expect( editor.getRootAttributes( 'foo' ) ).toEqual( {
				isLocked: null,
				order: 30,
				$rootEditableOptions: {}
			} );

			expect( editor.getRootAttributes( 'bar' ) ).toEqual( {
				isLocked: true,
				order: null,
				$rootEditableOptions: {}
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

			vi.spyOn( editor, 'getRootAttributes' );

			expect( editor.getRootsAttributes() ).toEqual( {
				bar: {
					isLocked: true,
					order: 20,
					$rootEditableOptions: {}
				},
				foo: {
					isLocked: true,
					order: 30,
					$rootEditableOptions: {}
				}
			} );

			expect( editor.getRootAttributes ).toHaveBeenCalledWith( 'foo' );
			expect( editor.getRootAttributes ).toHaveBeenCalledWith( 'bar' );

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

			expect( editor.getRootsAttributes( 'foo' ) ).toEqual( {
				foo: {
					isLocked: null,
					order: 10,
					$rootEditableOptions: {}
				},
				bar: {
					isLocked: true,
					order: null,
					$rootEditableOptions: {}
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

			expect( editor.getRootsAttributes() ).toEqual( {
				abc: {
					isLocked: null,
					order: 30,
					$rootEditableOptions: {}
				},
				foo: {
					isLocked: true,
					order: 10,
					$rootEditableOptions: {}
				},
				xxx: {
					isLocked: false,
					order: 40,
					$rootEditableOptions: {}
				}
			} );

			await editor.destroy();
		} );

		it( 'should include $rootEditableOptions when placeholder or label are configured', async () => {
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

			expect( editor.getRootsAttributes() ).toEqual( {
				foo: {
					order: 10,
					$rootEditableOptions: { placeholder: 'Foo placeholder', label: 'Foo label' }
				},
				bar: {
					order: 20,
					$rootEditableOptions: {}
				}
			} );

			await editor.destroy();
		} );

		it( 'should not overwrite $rootEditableOptions explicitly set via modelAttributes', async () => {
			const explicitOptions = { placeholder: 'From modelAttributes', label: 'From modelAttributes' };

			editor = await MultiRootEditor.create( { foo: '' }, {
				roots: {
					foo: {
						modelAttributes: { $rootEditableOptions: explicitOptions },
						placeholder: 'From config',
						label: 'From config'
					}
				}
			} );

			expect( editor.getRootsAttributes() ).toEqual( {
				foo: {
					$rootEditableOptions: explicitOptions
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
						expect( editableElements.foo.innerHTML ).toBe( '' );
						expect( editableElements.bar.innerHTML ).toBe( '' );
					} );
			} );

			// Adding `updateSourceElementOnDestroy` config to the editor allows setting the data
			// back to the source element after destroy.
			it( 'sets data back to the element', () => {
				editor.config.set( 'updateSourceElementOnDestroy', true );
				editor.setData( { foo: '<p>Abc</p>', bar: '<p>Xyz</p>' } );

				return editor.destroy()
					.then( () => {
						expect( editableElements.foo.innerHTML ).toBe( '<p>Abc</p>' );
						expect( editableElements.bar.innerHTML ).toBe( '<p>Xyz</p>' );
					} );
			} );

			test( () => editableElements );
		} );

		function test() {
			it( 'destroys the UI', () => {
				const spy = vi.spyOn( editor.ui, 'destroy' );

				return editor.destroy()
					.then( () => {
						expect( spy ).toHaveBeenCalledTimes( 1 );
					} );
			} );
		}
	} );

	describe( 'static fields', () => {
		it( 'MultiRootEditor.Context', () => {
			expect( MultiRootEditor.Context ).toBe( Context );
		} );

		it( 'MultiRootEditor.EditorWatchdog', () => {
			expect( MultiRootEditor.EditorWatchdog ).toBe( EditorWatchdog );
		} );

		it( 'MultiRootEditor.ContextWatchdog', () => {
			expect( MultiRootEditor.ContextWatchdog ).toBe( ContextWatchdog );
		} );
	} );
} );
