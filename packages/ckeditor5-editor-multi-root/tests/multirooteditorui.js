/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, Event */

import MultiRootEditor from '../src/multirooteditor';
import EditorUI from '@ckeditor/ckeditor5-ui/src/editorui/editorui';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import View from '@ckeditor/ckeditor5-ui/src/view';

describe( 'MultiRootEditorUI', () => {
	let editor, view, ui;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		return MultiRootEditor
			.create( {
				foo: '',
				bar: ''
			} )
			.then( newEditor => {
				editor = newEditor;

				ui = editor.ui;
				view = ui.view;
			} );
	} );

	afterEach( () => {
		editor.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'extends EditorUI', () => {
			expect( ui ).to.instanceof( EditorUI );
		} );
	} );

	describe( 'init()', () => {
		it( 'renders the #view', () => {
			expect( view.isRendered ).to.be.true;
		} );

		describe( 'editables', () => {
			it( 'registers view.editables #element in the editor focus tracker', () => {
				ui.focusTracker.isFocused = false;

				view.editables.foo.element.dispatchEvent( new Event( 'focus' ) );
				expect( ui.focusTracker.isFocused ).to.true;

				ui.focusTracker.isFocused = false;

				view.editables.bar.element.dispatchEvent( new Event( 'focus' ) );
				expect( ui.focusTracker.isFocused ).to.true;
			} );

			it( 'sets view.editables #name', () => {
				const editableFoo = editor.editing.view.document.getRoot( 'foo' );
				const editableBar = editor.editing.view.document.getRoot( 'bar' );

				expect( view.editables.foo.name ).to.equal( editableFoo.rootName );
				expect( view.editables.bar.name ).to.equal( editableBar.rootName );
			} );

			it( 'registers editable elements', () => {
				expect( ui.getEditableElement( 'foo' ) ).to.equal( view.editables.foo.element );
				expect( ui.getEditableElement( 'bar' ) ).to.equal( view.editables.bar.element );
			} );

			it( 'attaches editable UI as view\'s DOM root', () => {
				expect( editor.editing.view.getDomRoot( 'foo' ) ).to.equal( view.editables.foo.element );
				expect( editor.editing.view.getDomRoot( 'bar' ) ).to.equal( view.editables.bar.element );
			} );
		} );

		it( 'sets placeholder from editor.config.placeholder - string', () => {
			return MultiRootEditor
				.create( { foo: '', bar: '' }, {
					extraPlugins: [ Paragraph ],
					placeholder: 'Type here...'
				} )
				.then( newEditor => {
					const fooP = newEditor.editing.view.document.getRoot( 'foo' ).getChild( 0 );
					expect( fooP.getAttribute( 'data-placeholder' ) ).to.equal( 'Type here...' );

					const barP = newEditor.editing.view.document.getRoot( 'bar' ).getChild( 0 );
					expect( barP.getAttribute( 'data-placeholder' ) ).to.equal( 'Type here...' );

					return newEditor.destroy();
				} );
		} );

		it( 'sets placeholder from editor.config.placeholder - object', () => {
			return MultiRootEditor
				.create( { foo: '', bar: '' }, {
					extraPlugins: [ Paragraph ],
					placeholder: {
						foo: 'Type foo...',
						bar: 'Type bar...'
					}
				} )
				.then( newEditor => {
					const fooP = newEditor.editing.view.document.getRoot( 'foo' ).getChild( 0 );
					expect( fooP.getAttribute( 'data-placeholder' ) ).to.equal( 'Type foo...' );

					const barP = newEditor.editing.view.document.getRoot( 'bar' ).getChild( 0 );
					expect( barP.getAttribute( 'data-placeholder' ) ).to.equal( 'Type bar...' );

					return newEditor.destroy();
				} );
		} );

		describe( 'view.toolbar', () => {
			describe( '#items', () => {
				function ToolbarItems( editor ) {
					function viewCreator( name ) {
						return locale => {
							const view = new View( locale );

							view.name = name;
							view.element = document.createElement( 'a' );

							return view;
						};
					}

					editor.ui.componentFactory.add( 'foo', viewCreator( 'foo' ) );
					editor.ui.componentFactory.add( 'bar', viewCreator( 'bar' ) );
				}

				it( 'are filled with the config.toolbar (specified as an Array)', () => {
					return MultiRootEditor
						.create( { foo: '', bar: '' }, {
							extraPlugins: [ ToolbarItems ],
							toolbar: [ 'foo', 'bar' ]
						} )
						.then( editor => {
							const items = editor.ui.view.toolbar.items;

							expect( items.get( 0 ).name ).to.equal( 'foo' );
							expect( items.get( 1 ).name ).to.equal( 'bar' );

							return editor.destroy();
						} );
				} );

				it( 'are filled with the config.toolbar (specified as an Object)', () => {
					return MultiRootEditor
						.create( { foo: '', bar: '' }, {
							extraPlugins: [ ToolbarItems ],
							toolbar: {
								items: [ 'foo', 'bar' ]
							},
							ui: {
								viewportOffset: {
									top: 100
								}
							}
						} )
						.then( editor => {
							const items = editor.ui.view.toolbar.items;

							expect( items.get( 0 ).name ).to.equal( 'foo' );
							expect( items.get( 1 ).name ).to.equal( 'bar' );

							return editor.destroy();
						} );
				} );

				it( 'can be removed using config.toolbar.removeItems', () => {
					return MultiRootEditor
						.create( { foo: '', bar: '' }, {
							extraPlugins: [ ToolbarItems ],
							toolbar: {
								items: [ 'foo', 'bar' ],
								removeItems: [ 'bar' ]
							}
						} )
						.then( editor => {
							const items = editor.ui.view.toolbar.items;

							expect( items.get( 0 ).name ).to.equal( 'foo' );
							expect( items.length ).to.equal( 1 );

							return editor.destroy();
						} );
				} );
			} );
		} );
	} );

	it( 'should keep the last focused editable still focused if the focus moved to other part of the editor (e.g. UI)', () => {
		const uiDom = document.createElement( 'div' );
		const focusTracker = editor.ui.focusTracker;

		focusTracker.add( uiDom );

		const fooEditable = ui.view.editables.foo;
		const barEditable = ui.view.editables.bar;

		// Starting point. Nothing is focused.
		expect( fooEditable.isFocused ).to.be.false;
		expect( barEditable.isFocused ).to.be.false;
		expect( focusTracker.isFocused ).to.be.false;

		// Focus bar root.
		focusTracker.focusedElement = barEditable.element;
		focusTracker.isFocused = true;

		// It is focused.
		expect( fooEditable.isFocused ).to.be.false;
		expect( barEditable.isFocused ).to.be.true;

		// Move focus to a UI element that is a part of the editor.
		focusTracker.focusedElement = uiDom;

		// Bar root is still focused.
		expect( fooEditable.isFocused ).to.be.false;
		expect( barEditable.isFocused ).to.be.true;

		// Move focus outside of the editor.
		focusTracker.isFocused = false;
		focusTracker.focusedElement = null;

		// Bar root is not focused.
		expect( fooEditable.isFocused ).to.be.false;
		expect( barEditable.isFocused ).to.be.false;

		// Bring the focus back to the UI element.
		focusTracker.focusedElement = uiDom;
		focusTracker.isFocused = true;

		// Neither editable is focused
		expect( fooEditable.isFocused ).to.be.false;
		expect( barEditable.isFocused ).to.be.false;
	} );

	describe( 'destroy()', () => {
		it( 'detaches the DOM roots then destroys the UI view', () => {
			return MultiRootEditor.create( { foo: '', bar: '' } )
				.then( newEditor => {
					const destroySpy = sinon.spy( newEditor.ui.view, 'destroy' );
					const detachSpy = sinon.spy( newEditor.editing.view, 'detachDomRoot' );

					return newEditor.destroy()
						.then( () => {
							expect( detachSpy.calledTwice ).to.be.true;
							expect( detachSpy.calledWith( 'foo' ) ).to.be.true;
							expect( detachSpy.calledWith( 'bar' ) ).to.be.true;

							sinon.assert.callOrder( detachSpy, destroySpy );
						} );
				} );
		} );

		it( 'restores the editor element back to its original state', () => {
			function createElement() {
				const domElement = document.createElement( 'div' );

				domElement.setAttribute( 'foo', 'bar' );
				domElement.setAttribute( 'data-baz', 'qux' );
				domElement.classList.add( 'foo-class' );

				return domElement;
			}

			const fooEl = createElement();
			const barEl = createElement();

			return MultiRootEditor.create( { foo: fooEl, bar: barEl } )
				.then( newEditor => {
					return newEditor.destroy()
						.then( () => {
							for ( const domElement of [ fooEl, barEl ] ) {
								const attributes = {};

								for ( const attribute of Array.from( domElement.attributes ) ) {
									attributes[ attribute.name ] = attribute.value;
								}

								expect( attributes ).to.deep.equal( {
									foo: 'bar',
									'data-baz': 'qux',
									class: 'foo-class'
								} );
							}
						} );
				} );
		} );

		it( 'should call parent EditorUI#destroy() first before destroying the view', async () => {
			const newEditor = await MultiRootEditor.create( '' );
			const parentEditorUIPrototype = Object.getPrototypeOf( newEditor.ui.constructor.prototype );

			const parentDestroySpy = testUtils.sinon.spy( parentEditorUIPrototype, 'destroy' );
			const viewDestroySpy = testUtils.sinon.spy( newEditor.ui.view, 'destroy' );

			await newEditor.destroy();

			sinon.assert.callOrder( parentDestroySpy, viewDestroySpy );
		} );
	} );
} );
