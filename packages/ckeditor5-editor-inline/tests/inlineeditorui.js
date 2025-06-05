/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import View from '@ckeditor/ckeditor5-ui/src/view.js';

import InlineEditorUI from '../src/inlineeditorui.js';
import EditorUI from '@ckeditor/ckeditor5-ui/src/editorui/editorui.js';
import InlineEditorUIView from '../src/inlineeditoruiview.js';
import InlineEditor from '../src/inlineeditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import { Image, ImageCaption, ImageToolbar } from '@ckeditor/ckeditor5-image';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';

import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';
import env from '@ckeditor/ckeditor5-utils/src/env.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { assertBinding } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { isElement } from 'es-toolkit/compat';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

describe( 'InlineEditorUI', () => {
	let editor, view, ui, viewElement;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		return VirtualInlineTestEditor
			.create( 'foo', {
				toolbar: [ 'foo', 'bar' ]
			} )
			.then( newEditor => {
				editor = newEditor;

				ui = editor.ui;
				view = ui.view;
				viewElement = view.editable.element;
			} );
	} );

	afterEach( async () => {
		if ( editor ) {
			await editor.destroy();
		}
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

		describe( 'panel', () => {
			it( 'binds view.panel#isVisible to editor.ui#focusTracker', () => {
				ui.focusTracker.isFocused = false;
				expect( view.panel.isVisible ).to.be.false;

				ui.focusTracker.isFocused = true;
				expect( view.panel.isVisible ).to.be.true;
			} );

			it( 'doesn\'t set the view#viewportTopOffset, if not specified in the config', () => {
				expect( view.viewportTopOffset ).to.equal( 0 );
			} );

			it( 'sets view#viewportTopOffset, if specified', () => {
				return VirtualInlineTestEditor
					.create( 'foo', {
						ui: {
							viewportOffset: {
								top: 100
							}
						}
					} )
					.then( editor => {
						const ui = editor.ui;
						const view = ui.view;

						expect( ui.viewportOffset.top ).to.equal( 100 );
						expect( view.viewportTopOffset ).to.equal( 100 );

						return editor.destroy();
					} );
			} );

			it( 'sets view#viewportTopOffset if legacy toolbar.vierportTopOffset specified', () => {
				sinon.stub( console, 'warn' );

				return VirtualInlineTestEditor
					.create( 'foo', {
						toolbar: {
							viewportTopOffset: 100
						}
					} )
					.then( editor => {
						const ui = editor.ui;

						expect( ui.viewportOffset.top ).to.equal( 100 );
						expect( ui.view.viewportTopOffset ).to.equal( 100 );

						return editor.destroy();
					} );
			} );

			it( 'warns if legacy toolbar.vierportTopOffset specified', () => {
				const spy = sinon.stub( console, 'warn' );

				return VirtualInlineTestEditor
					.create( 'foo', {
						toolbar: {
							viewportTopOffset: 100
						}
					} )
					.then( editor => {
						sinon.assert.calledWithMatch( spy, 'editor-ui-deprecated-viewport-offset-config' );

						return editor.destroy();
					} );
			} );

			it( 'updates the view#viewportTopOffset to the visible part of viewport top offset (iOS + visual viewport)', () => {
				ui.viewportOffset = { top: 70 };

				let offsetTop = 0;
				sinon.stub( env, 'isiOS' ).get( () => true );
				sinon.stub( window.visualViewport, 'offsetTop' ).get( () => offsetTop );

				offsetTop = 0;
				window.visualViewport.dispatchEvent( new Event( 'scroll' ) );

				expect( ui.view.viewportTopOffset ).to.equal( 70 );

				offsetTop = 10;
				window.visualViewport.dispatchEvent( new Event( 'scroll' ) );

				expect( ui.view.viewportTopOffset ).to.equal( 60 );

				offsetTop = 50;
				window.visualViewport.dispatchEvent( new Event( 'scroll' ) );

				expect( ui.view.viewportTopOffset ).to.equal( 20 );

				offsetTop = 80;
				window.visualViewport.dispatchEvent( new Event( 'scroll' ) );

				expect( ui.view.viewportTopOffset ).to.equal( 0 );
			} );

			// https://github.com/ckeditor/ckeditor5-editor-inline/issues/4
			it( 'pin() is called on editor.ui#update', () => {
				const spy = sinon.stub( view.panel, 'pin' );

				view.panel.show();

				editor.ui.fire( 'update' );
				sinon.assert.calledOnce( spy );
				sinon.assert.calledWithExactly( spy, {
					target: view.editable.element,
					positions: sinon.match.array
				} );
			} );

			it( 'pin() is not called on editor.ui#update when panel is hidden', () => {
				const spy = sinon.stub( view.panel, 'pin' );

				view.panel.hide();

				editor.ui.fire( 'update' );
				sinon.assert.notCalled( spy );
			} );
		} );

		describe( 'editable', () => {
			let editable;

			beforeEach( () => {
				editable = editor.editing.view.document.getRoot();
			} );

			it( 'registers view.editable#element in editor focus tracker', () => {
				ui.focusTracker.isFocused = false;

				view.editable.element.dispatchEvent( new Event( 'focus' ) );
				expect( ui.focusTracker.isFocused ).to.true;
			} );

			it( 'sets view.editable#name', () => {
				expect( view.editable.name ).to.equal( editable.rootName );
			} );

			it( 'binds view.editable#isFocused', () => {
				assertBinding(
					view.editable,
					{ isFocused: false },
					[
						[ ui.focusTracker, { isFocused: true } ]
					],
					{ isFocused: true }
				);
			} );
		} );

		describe( 'placeholder', () => {
			it( 'sets placeholder from editor.config.placeholder - string', () => {
				return VirtualInlineTestEditor
					.create( 'foo', {
						extraPlugins: [ Paragraph ],
						placeholder: 'placeholder-text'
					} )
					.then( newEditor => {
						const firstChild = newEditor.editing.view.document.getRoot().getChild( 0 );

						expect( firstChild.getAttribute( 'data-placeholder' ) ).to.equal( 'placeholder-text' );

						return newEditor.destroy();
					} );
			} );

			it( 'sets placeholder from editor.config.placeholder - object', () => {
				return VirtualInlineTestEditor
					.create( 'foo', {
						extraPlugins: [ Paragraph ],
						placeholder: { main: 'placeholder-text' }
					} )
					.then( newEditor => {
						const firstChild = newEditor.editing.view.document.getRoot().getChild( 0 );

						expect( firstChild.getAttribute( 'data-placeholder' ) ).to.equal( 'placeholder-text' );

						return newEditor.destroy();
					} );
			} );

			it( 'sets placeholder from editor.config.placeholder - object (invalid root name)', () => {
				return VirtualInlineTestEditor
					.create( 'foo', {
						extraPlugins: [ Paragraph ],
						placeholder: { 'root-name-that-not-exists': 'placeholder-text' }
					} )
					.then( newEditor => {
						const firstChild = newEditor.editing.view.document.getRoot().getChild( 0 );

						expect( firstChild.hasAttribute( 'data-placeholder' ) ).to.equal( false );

						return newEditor.destroy();
					} );
			} );
		} );

		describe( 'view.toolbar#items', () => {
			it( 'are filled with the config.toolbar (specified as an Array)', () => {
				return VirtualInlineTestEditor
					.create( '', {
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
				return VirtualInlineTestEditor
					.create( '', {
						toolbar: {
							items: [ 'foo', 'bar' ]
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
				return VirtualInlineTestEditor
					.create( '', {
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

	describe( 'destroy()', () => {
		it( 'detaches the DOM root then destroys the UI view', () => {
			return VirtualInlineTestEditor.create( '' )
				.then( newEditor => {
					const destroySpy = sinon.spy( newEditor.ui.view, 'destroy' );
					const detachSpy = sinon.spy( newEditor.editing.view, 'detachDomRoot' );

					return newEditor.destroy()
						.then( () => {
							sinon.assert.callOrder( detachSpy, destroySpy );
						} );
				} );
		} );

		it( 'restores the editor element back to its original state', () => {
			const domElement = document.createElement( 'div' );

			domElement.setAttribute( 'foo', 'bar' );
			domElement.setAttribute( 'data-baz', 'qux' );
			domElement.classList.add( 'foo-class' );

			return VirtualInlineTestEditor.create( domElement )
				.then( newEditor => {
					return newEditor.destroy()
						.then( () => {
							const attributes = {};

							for ( const attribute of Array.from( domElement.attributes ) ) {
								attributes[ attribute.name ] = attribute.value;
							}

							expect( attributes ).to.deep.equal( {
								foo: 'bar',
								'data-baz': 'qux',
								class: 'foo-class'
							} );
						} );
				} );
		} );

		it( 'should call parent EditorUI#destroy() first before destroying the view', async () => {
			const newEditor = await VirtualInlineTestEditor.create( '' );
			const parentEditorUIPrototype = Object.getPrototypeOf( newEditor.ui.constructor.prototype );

			const parentDestroySpy = testUtils.sinon.spy( parentEditorUIPrototype, 'destroy' );
			const viewDestroySpy = testUtils.sinon.spy( newEditor.ui.view, 'destroy' );

			await newEditor.destroy();

			sinon.assert.callOrder( parentDestroySpy, viewDestroySpy );
		} );

		it( 'should not crash if the editable element is not present', async () => {
			editor.editing.view.detachDomRoot( editor.ui.view.editable.name );

			await editor.destroy();
			editor = null;
		} );

		it( 'should not crash if called twice', async () => {
			const editor = await VirtualInlineTestEditor.create( '' );

			await editor.destroy();
			await editor.destroy();
		} );
	} );

	describe( 'element()', () => {
		it( 'returns correct element instance', () => {
			expect( ui.element ).to.equal( viewElement );
		} );
	} );

	describe( 'getEditableElement()', () => {
		it( 'returns editable element (default)', () => {
			expect( ui.getEditableElement() ).to.equal( view.editable.element );
		} );

		it( 'returns editable element (root name passed)', () => {
			expect( ui.getEditableElement( 'main' ) ).to.equal( view.editable.element );
		} );

		it( 'returns undefined if editable with the given name is absent', () => {
			expect( ui.getEditableElement( 'absent' ) ).to.be.undefined;
		} );
	} );
} );

describe( 'Focus handling and navigation between editing root and editor toolbar', () => {
	let editorElement, editor, ui, toolbarView, domRoot;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editorElement = document.body.appendChild( document.createElement( 'div' ) );

		editor = await InlineEditor.create( editorElement, {
			plugins: [ Paragraph, Image, ImageToolbar, ImageCaption ],
			toolbar: [ 'imageTextAlternative' ],
			menuBar: { isVisible: true },
			image: {
				toolbar: [ 'toggleImageCaption' ]
			}
		} );

		domRoot = editor.editing.view.domRoots.get( 'main' );

		ui = editor.ui;
		toolbarView = ui.view.toolbar;
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	describe( 'Focusing toolbars on Alt+F10 key press', () => {
		beforeEach( () => {
			ui.focusTracker.isFocused = true;
			ui.focusTracker.focusedElement = domRoot;
		} );

		it( 'should focus the main toolbar when the focus is in the editing root', () => {
			const spy = testUtils.sinon.spy( toolbarView, 'focus' );

			setModelData( editor.model, '<paragraph>foo[]</paragraph>' );

			ui.focusTracker.isFocused = true;
			ui.focusTracker.focusedElement = domRoot;

			pressAltF10();

			sinon.assert.calledOnce( spy );
		} );

		it( 'should do nothing if the toolbar is already focused', () => {
			const domRootFocusSpy = testUtils.sinon.spy( domRoot, 'focus' );
			const toolbarFocusSpy = testUtils.sinon.spy( toolbarView, 'focus' );

			setModelData( editor.model, '<paragraph>foo[]</paragraph>' );

			// Focus the toolbar.
			pressAltF10();
			ui.focusTracker.focusedElement = toolbarView.element;

			// Try Alt+F10 again.
			pressAltF10();

			sinon.assert.calledOnce( toolbarFocusSpy );
			sinon.assert.notCalled( domRootFocusSpy );
		} );

		it( 'should prioritize widget toolbar over the global toolbar', () => {
			const widgetToolbarRepository = editor.plugins.get( 'WidgetToolbarRepository' );
			const imageToolbar = widgetToolbarRepository._toolbarDefinitions.get( 'image' ).view;

			const toolbarSpy = testUtils.sinon.spy( toolbarView, 'focus' );
			const imageToolbarSpy = testUtils.sinon.spy( imageToolbar, 'focus' );

			setModelData( editor.model,
				'<paragraph>foo</paragraph>' +
				'[<imageBlock src="https://ckeditor.com/docs/ckeditor5/latest/assets/img/warsaw.jpg"><caption>bar</caption></imageBlock>]' +
				'<paragraph>baz</paragraph>'
			);

			// Focus the image balloon toolbar.
			pressAltF10();
			ui.focusTracker.focusedElement = imageToolbar.element;

			sinon.assert.calledOnce( imageToolbarSpy );
			sinon.assert.notCalled( toolbarSpy );
		} );
	} );

	describe( 'Restoring focus on Esc key press', () => {
		beforeEach( () => {
			ui.focusTracker.isFocused = true;
			ui.focusTracker.focusedElement = domRoot;
		} );

		it( 'should move the focus back from the main toolbar to the editing root', () => {
			const domRootFocusSpy = testUtils.sinon.spy( domRoot, 'focus' );
			const toolbarFocusSpy = testUtils.sinon.spy( toolbarView, 'focus' );

			setModelData( editor.model, '<paragraph>foo[]</paragraph>' );

			// Focus the toolbar.
			pressAltF10();
			ui.focusTracker.focusedElement = toolbarView.element;

			pressEsc();

			sinon.assert.callOrder( toolbarFocusSpy, domRootFocusSpy );
		} );

		it( 'should do nothing if it was pressed when no toolbar was focused', () => {
			const domRootFocusSpy = testUtils.sinon.spy( domRoot, 'focus' );
			const toolbarFocusSpy = testUtils.sinon.spy( toolbarView, 'focus' );

			setModelData( editor.model, '<paragraph>foo[]</paragraph>' );

			pressEsc();

			sinon.assert.notCalled( domRootFocusSpy );
			sinon.assert.notCalled( toolbarFocusSpy );
		} );
	} );

	function pressAltF10() {
		editor.keystrokes.press( {
			keyCode: keyCodes.f10,
			altKey: true,
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy()
		} );
	}

	function pressEsc() {
		editor.keystrokes.press( {
			keyCode: keyCodes.esc,
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy()
		} );
	}
} );

function viewCreator( name ) {
	return locale => {
		const view = new View( locale );

		view.name = name;
		view.element = document.createElement( 'a' );

		return view;
	};
}

class VirtualInlineTestEditor extends VirtualTestEditor {
	constructor( sourceElementOrData, config ) {
		super( config );

		if ( isElement( sourceElementOrData ) ) {
			this.sourceElement = sourceElementOrData;
		}

		const view = new InlineEditorUIView( this.locale, this.editing.view );
		this.ui = new InlineEditorUI( this, view );

		this.ui.componentFactory.add( 'foo', viewCreator( 'foo' ) );
		this.ui.componentFactory.add( 'bar', viewCreator( 'bar' ) );
	}

	destroy() {
		this.ui.destroy();

		return super.destroy();
	}

	static create( sourceElementOrData, config ) {
		return new Promise( resolve => {
			const editor = new this( sourceElementOrData, config );

			resolve(
				editor.initPlugins()
					.then( () => {
						editor.ui.init();

						const initialData = isElement( sourceElementOrData ) ?
							sourceElementOrData.innerHTML :
							sourceElementOrData;

						editor.data.init( initialData );
						editor.fire( 'ready' );
					} )
					.then( () => editor )
			);
		} );
	}
}
