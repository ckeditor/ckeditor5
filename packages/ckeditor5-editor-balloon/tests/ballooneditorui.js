/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import BalloonEditor from '../src/ballooneditor.js';
import BalloonEditorUI from '../src/ballooneditorui.js';
import EditorUI from '@ckeditor/ckeditor5-ui/src/editorui/editorui.js';
import BalloonEditorUIView from '../src/ballooneditoruiview.js';
import BalloonToolbar from '@ckeditor/ckeditor5-ui/src/toolbar/balloon/balloontoolbar.js';
import { Image, ImageCaption, ImageToolbar } from '@ckeditor/ckeditor5-image';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';

import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';
import { isElement } from 'es-toolkit/compat';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { assertBinding } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'BalloonEditorUI', () => {
	let editor, view, ui, viewElement;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		return VirtualBalloonTestEditor
			.create( 'foo', {
				plugins: [ BalloonToolbar ]
			} )
			.then( newEditor => {
				editor = newEditor;
				ui = editor.ui;
				view = ui.view;
				viewElement = view.editable.element;
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
		it( 'initializes the #view', () => {
			expect( view.isRendered ).to.be.true;
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
				return VirtualBalloonTestEditor
					.create( 'foo', {
						extraPlugins: [ BalloonToolbar, Paragraph ],
						placeholder: 'placeholder-text'
					} )
					.then( newEditor => {
						const firstChild = newEditor.editing.view.document.getRoot().getChild( 0 );

						expect( firstChild.getAttribute( 'data-placeholder' ) ).to.equal( 'placeholder-text' );

						return newEditor.destroy();
					} );
			} );

			it( 'sets placeholder from editor.config.placeholder - object', () => {
				return VirtualBalloonTestEditor
					.create( 'foo', {
						extraPlugins: [ BalloonToolbar, Paragraph ],
						placeholder: { main: 'placeholder-text' }
					} )
					.then( newEditor => {
						const firstChild = newEditor.editing.view.document.getRoot().getChild( 0 );

						expect( firstChild.getAttribute( 'data-placeholder' ) ).to.equal( 'placeholder-text' );

						return newEditor.destroy();
					} );
			} );

			it( 'sets placeholder from editor.config.placeholder - object (invalid root name)', () => {
				return VirtualBalloonTestEditor
					.create( 'foo', {
						extraPlugins: [ BalloonToolbar, Paragraph ],
						placeholder: { 'root-name-that-not-exists': 'placeholder-text' }
					} )
					.then( newEditor => {
						const firstChild = newEditor.editing.view.document.getRoot().getChild( 0 );

						expect( firstChild.hasAttribute( 'data-placeholder' ) ).to.equal( false );

						return newEditor.destroy();
					} );
			} );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'detaches the DOM root then destroys the UI view', () => {
			return VirtualBalloonTestEditor
				.create( '', {
					plugins: [ BalloonToolbar ]
				} )
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

			return VirtualBalloonTestEditor
				.create( domElement, {
					plugins: [ BalloonToolbar ]
				} )
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
			const newEditor = await VirtualBalloonTestEditor.create( '' );
			const parentEditorUIPrototype = Object.getPrototypeOf( newEditor.ui.constructor.prototype );

			const parentDestroySpy = testUtils.sinon.spy( parentEditorUIPrototype, 'destroy' );
			const viewDestroySpy = testUtils.sinon.spy( newEditor.ui.view, 'destroy' );

			await newEditor.destroy();

			sinon.assert.callOrder( parentDestroySpy, viewDestroySpy );
		} );

		it( 'should not crash if called twice', async () => {
			const newEditor = await VirtualBalloonTestEditor.create( '' );

			await newEditor.destroy();
			await newEditor.destroy();
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

		editor = await BalloonEditor.create( editorElement, {
			plugins: [ BalloonToolbar, Heading, Paragraph, Image, ImageToolbar, ImageCaption ],
			toolbar: [ 'heading', 'imageTextAlternative' ],
			image: {
				toolbar: [ 'toggleImageCaption' ]
			}
		} );

		domRoot = editor.editing.view.domRoots.get( 'main' );

		ui = editor.ui;
		toolbarView = editor.plugins.get( 'BalloonToolbar' ).toolbarView;
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

class VirtualBalloonTestEditor extends VirtualTestEditor {
	constructor( sourceElementOrData, config ) {
		super( config );

		if ( isElement( sourceElementOrData ) ) {
			this.sourceElement = sourceElementOrData;
		}

		const view = new BalloonEditorUIView( this.locale, this.editing.view );
		this.ui = new BalloonEditorUI( this, view );
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
