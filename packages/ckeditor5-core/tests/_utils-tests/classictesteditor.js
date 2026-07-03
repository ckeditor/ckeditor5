/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { Editor } from '../../src/editor/editor.js';
import { ClassicTestEditor } from '../../tests/_utils/classictesteditor.js';

import { Plugin } from '../../src/plugin.js';
import { HtmlDataProcessor, ModelRootElement, _getModelData } from '@ckeditor/ckeditor5-engine';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

import { EditorUI, BoxedEditorUIView, InlineEditableUIView } from '@ckeditor/ckeditor5-ui';

import { assertCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { removeEditorBodyOrphans } from '../_utils/cleanup.js';

describe( 'ClassicTestEditor', () => {
	let editorElement;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );
	} );

	afterEach( () => {
		editorElement.remove();
	} );

	describe( 'constructor()', () => {
		it( 'creates an instance of editor', async () => {
			const editor = new ClassicTestEditor( editorElement, { foo: 1 } );

			expect( editor ).toBeInstanceOf( Editor );
			expect( editor.config.get( 'foo' ) ).toBe( 1 );
			expect( editor.sourceElement ).toBe( editorElement );
			expect( editor.ui ).toBeInstanceOf( EditorUI );
			expect( editor.ui.view ).toBeInstanceOf( BoxedEditorUIView );
			expect( editor.data.processor ).toBeInstanceOf( HtmlDataProcessor );
			expect( editor.model.document.getRoot( 'main' ).name ).toBe( '$root' );

			editor.fire( 'ready' );
			await editor.destroy();
		} );

		it( 'creates the instance of the editable (without rendering)', async () => {
			const editor = new ClassicTestEditor( editorElement );

			expect( editor.ui.view.editable ).toBeInstanceOf( InlineEditableUIView );
			expect( editor.ui.view.editable.isRendered ).toBe( false );

			editor.fire( 'ready' );
			await editor.destroy();
		} );

		it( 'creates the #ui and ui#view (without rendering)', async () => {
			const editor = new ClassicTestEditor( editorElement );

			expect( editor.ui ).toBeInstanceOf( EditorUI );
			expect( editor.ui.view ).toBeInstanceOf( BoxedEditorUIView );
			expect( editor.ui.view.isRendered ).toBe( false );
			expect( editor.ui.getEditableElement() ).toBeUndefined();

			editor.fire( 'ready' );
			await editor.destroy();
		} );

		it( 'creates main root element', async () => {
			const editor = new ClassicTestEditor( editorElement );

			expect( editor.model.document.getRoot( 'main' ) ).toBeInstanceOf( ModelRootElement );

			editor.fire( 'ready' );
			await editor.destroy();
		} );

		it( 'creates main root element with the given modelElement name', async () => {
			const editor = new ClassicTestEditor( {
				root: {
					modelElement: 'customRoot',
					initialData: ''
				}
			} );

			expect( editor.model.document.getRoot( 'main' ).name ).toBe( 'customRoot' );

			editor.fire( 'ready' );
			await editor.destroy();
		} );

		it( 'mixes ElementApiMixin', () => {
			expect( ClassicTestEditor.prototype ).toHaveProperty( 'updateSourceElement' );
			expect( typeof ClassicTestEditor.prototype.updateSourceElement ).toBe( 'function' );
		} );
	} );

	describe( 'create()', () => {
		it( 'creates an instance of editor', () => {
			return ClassicTestEditor.create( editorElement, { foo: 1 } )
				.then( editor => {
					expect( editor ).toBeInstanceOf( ClassicTestEditor );

					expect( editor.config.get( 'foo' ) ).toBe( 1 );
					expect( editor.sourceElement ).toBe( editorElement );

					return editor.destroy();
				} );
		} );

		it( 'renders the view including #editable and sets #editableElement', () => {
			return ClassicTestEditor.create( editorElement, { foo: 1 } )
				.then( editor => {
					const ui = editor.ui;
					const view = ui.view;

					expect( view.isRendered ).toBe( true );
					expect( ui.getEditableElement().tagName ).toBe( 'DIV' );
					expect( ui.getEditableElement() ).toBe( view.editable.element );
					expect( view.editable.name ).toBe( 'main' );

					return editor.destroy();
				} );
		} );

		it( 'loads data from the editor element', () => {
			editorElement.innerHTML = 'foo';

			class PluginTextInRoot extends Plugin {
				init() {
					this.editor.model.schema.extend( '$text', { allowIn: '$root' } );
				}
			}

			return ClassicTestEditor.create( editorElement, { plugins: [ PluginTextInRoot ] } )
				.then( editor => {
					expect( _getModelData( editor.model, { withoutSelection: true } ) ).toBe( 'foo' );

					return editor.destroy();
				} );
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

			return ClassicTestEditor
				.create( editorElement, {
					plugins: [ EventWatcher ]
				} )
				.then( editor => {
					expect( fired ).toEqual( [
						'ready-classictesteditorui',
						'ready-datacontroller',
						'ready-classictesteditor'
					] );

					return editor.destroy();
				} );
		} );

		it( 'sets proper states', () => {
			const baseEditor = new ClassicTestEditor();

			expect( baseEditor.state ).toBe( 'initializing' );

			return ClassicTestEditor.create( editorElement ).then( editor => {
				expect( editor.state ).toBe( 'ready' );

				return editor.destroy().then( () => {
					expect( editor.state ).toBe( 'destroyed' );

					baseEditor.fire( 'ready' );
					return baseEditor.destroy();
				} );
			} );
		} );

		it( 'inserts editor UI next to editor element', () => {
			return ClassicTestEditor.create( editorElement )
				.then( editor => {
					expect( editor.ui.view.element.previousSibling ).toBe( editorElement );

					return editor.destroy();
				} );
		} );

		it( 'attaches editable UI as view\'s DOM root', () => {
			return ClassicTestEditor.create( editorElement )
				.then( editor => {
					expect( editor.editing.view.getDomRoot() ).toBe( editor.ui.view.editable.element );

					return editor.destroy();
				} );
		} );

		it( 'initializes the data controller with `config.initialData` if this option is provided', () => {
			return ClassicTestEditor.create( editorElement, { initialData: '<p>foo</p>', plugins: [ Paragraph ] } )
				.then( editor => {
					expect( editor.getData() ).toBe( '<p>foo</p>' );

					return editor.destroy();
				} );
		} );

		it( 'initializes the data controller with an empty string if the `config.initialData` is not provided', () => {
			return ClassicTestEditor.create( editorElement )
				.then( editor => {
					expect( editor.getData() ).toBe( '' );

					return editor.destroy();
				} );
		} );

		it( 'initializes the data controller with the data from the source element', () => {
			editorElement.innerHTML = '<p>foo</p>';

			return ClassicTestEditor.create( editorElement, { plugins: [ Paragraph ] } )
				.then( editor => {
					expect( editor.getData() ).toBe( '<p>foo</p>' );

					return editor.destroy();
				} );
		} );

		it( 'initializes the data controller with the data from the first argument if it is a string', () => {
			return ClassicTestEditor.create( '<p>foo</p>', { plugins: [ Paragraph ] } )
				.then( editor => {
					expect( editor.getData() ).toBe( '<p>foo</p>' );

					return editor.destroy();
				} );
		} );

		it( 'throws when the data is passed from as the first argument and as a `config.initialData` at the same time', () => {
			return ClassicTestEditor.create( '<p>foo</p>', { initialData: '<p>bar</p>' } )
				.then( () => {
					throw new Error( 'It should throw an error' );
				}, err => {
					assertCKEditorError( err, 'editor-create-initial-data-overspecified', null );
					removeEditorBodyOrphans();
				} );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'destroys UI and calls super.destroy()', () => {
			return ClassicTestEditor.create( editorElement, { foo: 1 } )
				.then( editor => {
					const superSpy = vi.spyOn( Editor.prototype, 'destroy' );
					const uiSpy = vi.spyOn( editor.ui, 'destroy' );

					return editor.destroy()
						.then( () => {
							expect( superSpy ).toHaveBeenCalledOnce();
							expect( uiSpy ).toHaveBeenCalledOnce();
						} );
				} );
		} );

		it( 'restores the editor element', () => {
			return ClassicTestEditor.create( editorElement, { foo: 1 } )
				.then( editor => {
					expect( editor.sourceElement.style.display ).toBe( 'none' );

					return editor.destroy()
						.then( () => {
							expect( editor.sourceElement.style.display ).toBe( '' );
						} );
				} );
		} );

		it( 'should call parent EditorUI#destroy() first before destroying the view', async () => {
			const newEditor = await ClassicTestEditor.create( editorElement, { foo: 1 } );
			const parentEditorUIPrototype = Object.getPrototypeOf( newEditor.ui.constructor.prototype );

			const parentDestroySpy = vi.spyOn( parentEditorUIPrototype, 'destroy' );
			const viewDestroySpy = vi.spyOn( newEditor.ui.view, 'destroy' );

			await newEditor.destroy();

			expect( parentDestroySpy ).toHaveBeenCalled();
			expect( viewDestroySpy ).toHaveBeenCalled();

			// Verify call order by checking invocation order
			const parentCallOrder = parentDestroySpy.mock.invocationCallOrder[ 0 ];
			const viewCallOrder = viewDestroySpy.mock.invocationCallOrder[ 0 ];
			expect( parentCallOrder ).toBeLessThan( viewCallOrder );
		} );
	} );
} );
