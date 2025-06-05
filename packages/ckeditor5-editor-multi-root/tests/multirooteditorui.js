/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import MultiRootEditor from '../src/multirooteditor.js';
import EditorUI from '@ckeditor/ckeditor5-ui/src/editorui/editorui.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import View from '@ckeditor/ckeditor5-ui/src/view.js';

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

	afterEach( async () => {
		await editor.destroy();
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

		it( 'adds initial editables', () => {
			expect( ui.getEditableElement( 'foo' ) ).not.to.be.null;
			expect( ui.getEditableElement( 'bar' ) ).not.to.be.null;
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

	describe( 'addEditable()', () => {
		describe( 'editable', () => {
			let editable, element;

			beforeEach( () => {
				editor.model.document.createRoot( '$root', 'new' ); // It is required to create model root first.
				editable = view.createEditable( 'new' );
				element = editable.element;
				ui.addEditable( editable );
			} );

			it( 'registers `editable#element` in the editor focus tracker', () => {
				ui.focusTracker.isFocused = false;

				element.dispatchEvent( new Event( 'focus' ) );
				expect( ui.focusTracker.isFocused ).to.true;

				ui.focusTracker.isFocused = false;

				element.dispatchEvent( new Event( 'focus' ) );
				expect( ui.focusTracker.isFocused ).to.true;
			} );

			it( 'sets view.editables #name', () => {
				expect( editable.name ).to.equal( 'new' );
			} );

			it( 'registers editable element', () => {
				expect( ui.getEditableElement( 'new' ) ).to.equal( element );
			} );

			it( 'attaches editable UI as view DOM root', () => {
				expect( editor.editing.view.getDomRoot( 'new' ) ).to.equal( element );
			} );
		} );

		describe( 'placeholder', () => {
			it( 'sets placeholder from editor.config.placeholder - string', () => {
				return MultiRootEditor
					.create( { foo: '', bar: '' }, {
						extraPlugins: [ Paragraph ],
						placeholder: 'Type here...'
					} )
					.then( newEditor => {
						ui = newEditor.ui;
						view = ui.view;

						// Initial editables:
						const fooP = newEditor.editing.view.document.getRoot( 'foo' ).getChild( 0 );
						expect( fooP.getAttribute( 'data-placeholder' ) ).to.equal( 'Type here...' );

						const barP = newEditor.editing.view.document.getRoot( 'bar' ).getChild( 0 );
						expect( barP.getAttribute( 'data-placeholder' ) ).to.equal( 'Type here...' );

						// New editable:
						// Placeholder set to the string value from the config.
						newEditor.model.change( writer => {
							writer.addRoot( 'new' );
							const editable = view.createEditable( 'new' );
							ui.addEditable( editable );
						} );

						const newP = newEditor.editing.view.document.getRoot( 'new' ).getChild( 0 );
						expect( newP.getAttribute( 'data-placeholder' ) ).to.equal( 'Type here...' );

						return newEditor.destroy();
					} );
			} );

			it( 'sets placeholder from editor.config.placeholder - object', () => {
				return MultiRootEditor
					.create( { foo: '', bar: '', baz: '' }, {
						extraPlugins: [ Paragraph ],
						placeholder: {
							foo: 'Type foo...',
							bar: 'Type bar...',
							abc: 'Type abc...'
						}
					} )
					.then( newEditor => {
						ui = newEditor.ui;
						view = ui.view;

						// Initial roots:
						const fooP = newEditor.editing.view.document.getRoot( 'foo' ).getChild( 0 );
						expect( fooP.getAttribute( 'data-placeholder' ) ).to.equal( 'Type foo...' );

						const barP = newEditor.editing.view.document.getRoot( 'bar' ).getChild( 0 );
						expect( barP.getAttribute( 'data-placeholder' ) ).to.equal( 'Type bar...' );

						// Placeholder not set as it was not defined in the config object.
						const bazP = newEditor.editing.view.document.getRoot( 'baz' ).getChild( 0 );
						expect( bazP.hasAttribute( 'data-placeholder' ) ).to.be.false;

						// New editable:
						// Placeholder as it was defined in the config objects.
						newEditor.model.change( writer => {
							writer.addRoot( 'abc' );
							const editable = view.createEditable( 'abc' );
							ui.addEditable( editable );
						} );

						const abcP = newEditor.editing.view.document.getRoot( 'abc' ).getChild( 0 );
						expect( abcP.getAttribute( 'data-placeholder' ) ).to.equal( 'Type abc...' );

						// Placeholder not set as it was not defined in the config object.
						newEditor.model.change( writer => {
							writer.addRoot( 'new' );
							const editable = view.createEditable( 'new' );
							ui.addEditable( editable );
						} );

						const newP = newEditor.editing.view.document.getRoot( 'new' ).getChild( 0 );
						expect( newP.hasAttribute( 'data-placeholder' ) ).to.be.false;

						return newEditor.destroy();
					} );
			} );

			it( 'sets placeholder as given in the parameter', () => {
				return MultiRootEditor
					.create( { foo: '' }, {
						extraPlugins: [ Paragraph ],
						placeholder: {
							foo: 'Type foo...',
							abc: 'Type abc...'
						}
					} )
					.then( newEditor => {
						ui = newEditor.ui;
						view = ui.view;

						// Placeholder as set in the parameter, even when defined in config:
						newEditor.model.change( writer => {
							writer.addRoot( 'abc' );
							const editable = view.createEditable( 'abc' );
							ui.addEditable( editable, 'Abc...' );
						} );

						const abcP = newEditor.editing.view.document.getRoot( 'abc' ).getChild( 0 );
						expect( abcP.getAttribute( 'data-placeholder' ) ).to.equal( 'Abc...' );

						// Placeholder as set in the parameter, when not defined in config:
						newEditor.model.change( writer => {
							writer.addRoot( 'new' );
							const editable = view.createEditable( 'new' );
							ui.addEditable( editable, 'New...' );
						} );

						const newP = newEditor.editing.view.document.getRoot( 'new' ).getChild( 0 );
						expect( newP.getAttribute( 'data-placeholder' ) ).to.equal( 'New...' );

						return newEditor.destroy();
					} );
			} );
		} );
	} );

	describe( 'removeEditable()', () => {
		let element;

		beforeEach( () => {
			element = ui.getEditableElement( 'foo' );
			ui.removeEditable( ui.view.editables.foo );
			ui.view.removeEditable( 'foo' );
		} );

		it( 'deregisters `editable#element` in the editor focus tracker', () => {
			ui.focusTracker.isFocused = false;

			element.dispatchEvent( new Event( 'focus' ) );
			expect( ui.focusTracker.isFocused ).to.be.false;
		} );

		it( 'deregisters editable element', () => {
			expect( ui.getEditableElement( 'foo' ) ).to.be.undefined;
		} );

		it( 'detaches editable UI from view DOM root', () => {
			expect( editor.editing.view.getDomRoot( 'foo' ) ).to.be.undefined;
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

		// Some of integrations might detach the DOM editing view *before* destroying the editor.
		// It happens quite often in the strict mode of the React integration. In such case, the editor
		// component is being unmounted after editable component is detached from the DOM. In such scenario,
		// the root doesn't contain the DOM editable anymore. This test ensures that the editor does not throw.
		// Issue: https://github.com/ckeditor/ckeditor5/issues/16561
		it( 'should not throw when trying to detach a DOM root that was not attached to editing view', async () => {
			const newEditor = await MultiRootEditor.create( { foo: '', bar: '' } );
			const editingView = newEditor.editing.view;

			// Simulate unmounting the editable child component before the editor component.
			editingView.detachDomRoot( 'foo' );

			// This should not throw
			await newEditor.destroy();
		} );

		// Issue: https://github.com/ckeditor/ckeditor5/issues/16561
		it( 'should not throw error when it was called twice', async () => {
			const newEditor = await MultiRootEditor.create( { foo: '', bar: '' } );

			await newEditor.destroy();
			await newEditor.destroy(); // This should not throw
		} );
	} );
} );
