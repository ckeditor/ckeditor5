/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, Event */

import BalloonEditorUI from '../src/ballooneditorui';
import EditorUI from '@ckeditor/ckeditor5-core/src/editor/editorui';
import BalloonEditorUIView from '../src/ballooneditoruiview';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import BalloonToolbar from '@ckeditor/ckeditor5-ui/src/toolbar/balloon/balloontoolbar';
import { BlockToolbar } from '@ckeditor/ckeditor5-ui';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import { isElement } from 'lodash-es';
import BalloonEditor from '../src/ballooneditor';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { Image, ImageCaption, ImageToolbar } from '@ckeditor/ckeditor5-image';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';

import { assertBinding } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

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

	afterEach( () => {
		editor.destroy();
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

		it( 'initializes keyboard navigation between view#toolbar and view#editable', () => {
			const toolbar = editor.plugins.get( 'BalloonToolbar' );
			const toolbarFocusSpy = testUtils.sinon.stub( toolbar.toolbarView, 'focus' ).returns( {} );
			const toolbarShowSpy = testUtils.sinon.stub( toolbar, 'show' ).returns( {} );
			const toolbarHideSpy = testUtils.sinon.stub( toolbar, 'hide' ).returns( {} );
			const editingFocusSpy = testUtils.sinon.stub( editor.editing.view, 'focus' ).returns( {} );

			ui.focusTracker.isFocused = true;

			// #show and #hide are mocked so mocking the focus as well.
			toolbar.toolbarView.focusTracker.isFocused = false;

			editor.keystrokes.press( {
				keyCode: keyCodes.f10,
				altKey: true,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			} );

			sinon.assert.callOrder( toolbarShowSpy, toolbarFocusSpy );
			sinon.assert.notCalled( toolbarHideSpy );
			sinon.assert.notCalled( editingFocusSpy );

			// #show and #hide are mocked so mocking the focus as well.
			toolbar.toolbarView.focusTracker.isFocused = true;

			toolbar.toolbarView.keystrokes.press( {
				keyCode: keyCodes.esc,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			} );

			sinon.assert.callOrder( editingFocusSpy, toolbarHideSpy );
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
			it( 'sets placeholder from editor.config.placeholder', () => {
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

			it( 'sets placeholder from the "placeholder" attribute of a passed <textarea>', () => {
				const element = document.createElement( 'textarea' );

				element.setAttribute( 'placeholder', 'placeholder-text' );

				return VirtualBalloonTestEditor
					.create( element, {
						plugins: [ BalloonToolbar ],
						extraPlugins: [ Paragraph ]
					} )
					.then( newEditor => {
						const firstChild = newEditor.editing.view.document.getRoot().getChild( 0 );

						expect( firstChild.getAttribute( 'data-placeholder' ) ).to.equal( 'placeholder-text' );

						return newEditor.destroy();
					} );
			} );

			it( 'uses editor.config.placeholder rather than the "placeholder" attribute of a passed <textarea>', () => {
				const element = document.createElement( 'textarea' );

				element.setAttribute( 'placeholder', 'placeholder-text' );

				return VirtualBalloonTestEditor
					.create( element, {
						plugins: [ BalloonToolbar ],
						extraPlugins: [ Paragraph ],
						placeholder: 'config takes precedence'
					} )
					.then( newEditor => {
						const firstChild = newEditor.editing.view.document.getRoot().getChild( 0 );

						expect( firstChild.getAttribute( 'data-placeholder' ) ).to.equal( 'config takes precedence' );

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

describe( 'Balloon toolbar focus cycling', () => {
	let editorElement, editor, ui, balloonToolbar, keyEventData;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editorElement = document.body.appendChild( document.createElement( 'div' ) );

		editor = await BalloonEditor.create( editorElement, {
			plugins: [ BalloonToolbar, Paragraph, Heading, Image, ImageToolbar, ImageCaption ],
			toolbar: [ 'heading' ],
			image: {
				toolbar: [ 'toggleImageCaption' ]
			}
		} );

		ui = editor.ui;
		balloonToolbar = editor.plugins.get( BalloonToolbar );

		keyEventData = {
			keyCode: keyCodes.f10,
			altKey: true,
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy()
		};
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	describe( '`alt+f10` keystroke should', () => {
		it( 'focus the main  toolbar', () => {
			const spy = testUtils.sinon.spy( balloonToolbar.toolbarView, 'focus' );
			setModelData( editor.model, '<paragraph>fo[o]</paragraph>' );

			ui.focusTracker.isFocused = true;
			balloonToolbar.focusTracker.isFocused = false;

			editor.keystrokes.press( keyEventData );

			sinon.assert.calledOnce( spy );
		} );

		describe( 'do nothing', () => {
			it( 'if nothing has been focused yet', () => {
				const spy = testUtils.sinon.spy( balloonToolbar.toolbarView, 'focus' );

				setModelData( editor.model, '<paragraph>foo[]</paragraph>' );

				editor.keystrokes.press( keyEventData );

				sinon.assert.notCalled( spy );
			} );

			it( 'if toolbar was already focused', () => {
				const spy = testUtils.sinon.spy( balloonToolbar.toolbarView, 'focus' );

				setModelData( editor.model, '<paragraph>foo[]</paragraph>' );

				ui.focusTracker.isFocused = true;
				balloonToolbar.focusTracker.isFocused = false;

				editor.keystrokes.press( keyEventData );

				editor.keystrokes.press( keyEventData );

				sinon.assert.calledTwice( spy );
			} );
		} );

		it( 'prioritize widget toolbar over global toolbar', () => {
			const widgetToolbarRepository = editor.plugins.get( 'WidgetToolbarRepository' );
			const imageToolbar = widgetToolbarRepository._toolbarDefinitions.get( 'image' ).view;

			const toolbarSpy = testUtils.sinon.spy( balloonToolbar.toolbarView, 'focus' );
			const imageToolbarSpy = testUtils.sinon.spy( imageToolbar, 'focus' );

			setModelData( editor.model,
				'<paragraph>foo</paragraph>' +
				'[<imageBlock src="https://ckeditor.com/docs/ckeditor5/latest/assets/img/warsaw.jpg"><caption>bar</caption></imageBlock>]' +
				'<paragraph>baz</paragraph>'
			);

			ui.focusTracker.isFocused = true;
			balloonToolbar.focusTracker.isFocused = false;

			// select image baloon toolbar
			editor.keystrokes.press( keyEventData );

			sinon.assert.calledOnce( imageToolbarSpy );
			sinon.assert.notCalled( toolbarSpy );
		} );
	} );

	describe( '`esc` keystroke should', () => {
		it( 'do nothing if it was pressed when no toolbar was focused', () => {
			const spy = testUtils.sinon.spy( balloonToolbar.toolbarView, 'focus' );

			setModelData( editor.model, '<paragraph>foo[]</paragraph>' );

			editor.keystrokes.press( {
				keyCode: keyCodes.esc,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			} );

			sinon.assert.notCalled( spy );
		} );
	} );

	describe( 'advanced scenarios', () => {
		it( 'focus toolbar, focus editor back when `esc` was pressed', () => {
			const editorSpy = testUtils.sinon.spy( editor.editing.view.domRoots.get( 'main' ), 'focus' );

			setModelData( editor.model, '<paragraph>foo[]</paragraph>' );

			ui.focusTracker.isFocused = true;
			balloonToolbar.focusTracker.isFocused = false;

			editor.keystrokes.press( keyEventData );

			ui.focusTracker.focusedElement = document.activeElement;

			editor.keystrokes.press( {
				keyCode: keyCodes.esc,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			} );

			sinon.assert.calledOnce( editorSpy );
		} );

		it( 'cycling between the toolbars should not be possible when widget is selected', () => {
			const widgetToolbarRepository = editor.plugins.get( 'WidgetToolbarRepository' );
			const imageToolbar = widgetToolbarRepository._toolbarDefinitions.get( 'image' ).view;

			const toolbarSpy = testUtils.sinon.spy( balloonToolbar.toolbarView, 'focus' );
			const imageToolbarSpy = testUtils.sinon.spy( imageToolbar, 'focus' );

			setModelData( editor.model,
				'<paragraph>foo</paragraph>' +
				'[<imageBlock src="https://ckeditor.com/docs/ckeditor5/latest/assets/img/warsaw.jpg"><caption>bar</caption></imageBlock>]' +
				'<paragraph>baz</paragraph>'
			);

			ui.focusTracker.isFocused = true;
			balloonToolbar.focusTracker.isFocused = false;

			// select image baloon toolbar
			editor.keystrokes.press( keyEventData );

			sinon.assert.calledOnce( imageToolbarSpy );

			// try to switch to global baloon toolbar
			editor.keystrokes.press( keyEventData );
			sinon.assert.calledTwice( imageToolbarSpy );
			sinon.assert.notCalled( toolbarSpy );
		} );

		// TODO
		it.skip( 'switch focus between image/toolbar/image and go back to editor after `esc` was pressed', () => {
			const widgetToolbarRepository = editor.plugins.get( 'WidgetToolbarRepository' );
			const imageToolbar = widgetToolbarRepository._toolbarDefinitions.get( 'image' ).view;

			const toolbarSpy = testUtils.sinon.spy( balloonToolbar.toolbarView, 'focus' );
			const imageToolbarSpy = testUtils.sinon.spy( imageToolbar, 'focus' );
			const editorSpy = testUtils.sinon.spy( editor.editing.view.domRoots.get( 'main' ), 'focus' );

			setModelData( editor.model,
				'<paragraph>foo</paragraph>' +
				'<imageBlock src="https://ckeditor.com/docs/ckeditor5/latest/assets/img/warsaw.jpg"><caption>ba[]r</caption></imageBlock>' +
				'<paragraph>baz</paragraph>'
			);

			ui.focusTracker.isFocused = true;
			balloonToolbar.focusTracker.isFocused = false;

			// select image baloon toolbar
			editor.keystrokes.press( keyEventData );
			ui.focusTracker.focusedElement = document.activeElement;

			sinon.assert.calledOnce( imageToolbarSpy );

			// try to switch to global baloon toolbar
			editor.keystrokes.press( keyEventData );
			balloonToolbar.focusTracker.focusedElement = document.activeElement;

			sinon.assert.calledOnce( toolbarSpy );

			// try to switch back to image baloon toolbar
			editor.keystrokes.press( keyEventData );

			sinon.assert.calledOnce( imageToolbarSpy );
			sinon.assert.calledTwice( toolbarSpy );

			// move selection back inside the editor
			editor.keystrokes.press( {
				keyCode: keyCodes.esc,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			} );
			sinon.assert.calledOnce( editorSpy );
		} );
	} );
} );

describe( 'Block toolbar focus cycling', () => {
	let editorElement, editor, ui, balloonToolbar, blockToolbar, keyEventData, blockToolbarView;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editorElement = document.body.appendChild( document.createElement( 'div' ) );

		editor = await BalloonEditor.create( editorElement, {
			plugins: [ BlockToolbar, Paragraph, Heading, Image, ImageToolbar, ImageCaption ],
			blockToolbar: [ 'heading' ],
			image: {
				toolbar: [ 'toggleImageCaption' ]
			}
		} );

		ui = editor.ui;
		balloonToolbar = editor.plugins.get( BalloonToolbar );
		blockToolbar = editor.plugins.get( BlockToolbar );
		blockToolbarView = blockToolbar.toolbarView;
		keyEventData = {
			keyCode: keyCodes.f10,
			altKey: true,
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy()
		};
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	describe( '`alt+f10` keystroke should', () => {
		it( 'focus the main toolbar', () => {
			const spy = testUtils.sinon.spy( blockToolbarView, 'focus' );
			setModelData( editor.model, '<paragraph>fo[o]</paragraph>' );

			ui.focusTracker.isFocused = true;
			blockToolbarView.focusTracker.isFocused = false;

			editor.keystrokes.press( keyEventData );

			sinon.assert.calledOnce( spy );
		} );

		describe( 'do nothing', () => {
			it( 'if nothing has been focused yet', () => {
				const spy = testUtils.sinon.spy( blockToolbarView, 'focus' );

				setModelData( editor.model, '<paragraph>foo[]</paragraph>' );

				editor.keystrokes.press( keyEventData );

				sinon.assert.notCalled( spy );
			} );

			it( 'if toolbar was already focused', () => {
				const spy = testUtils.sinon.spy( blockToolbarView, 'focus' );

				setModelData( editor.model, '<paragraph>foo[]</paragraph>' );

				ui.focusTracker.isFocused = true;
				blockToolbarView.focusTracker.isFocused = false;

				editor.keystrokes.press( keyEventData );

				editor.keystrokes.press( keyEventData );

				sinon.assert.calledTwice( spy );
			} );
		} );

		it( 'prioritize widget toolbar over global toolbar', () => {
			const widgetToolbarRepository = editor.plugins.get( 'WidgetToolbarRepository' );
			const imageToolbar = widgetToolbarRepository._toolbarDefinitions.get( 'image' ).view;

			const toolbarSpy = testUtils.sinon.spy( blockToolbarView, 'focus' );
			const imageToolbarSpy = testUtils.sinon.spy( imageToolbar, 'focus' );

			setModelData( editor.model,
				'<paragraph>foo</paragraph>' +
				'[<imageBlock src="https://ckeditor.com/docs/ckeditor5/latest/assets/img/warsaw.jpg"><caption>bar</caption></imageBlock>]' +
				'<paragraph>baz</paragraph>'
			);

			ui.focusTracker.isFocused = true;
			blockToolbarView.focusTracker.isFocused = false;

			// select image baloon toolbar
			editor.keystrokes.press( keyEventData );

			sinon.assert.calledOnce( imageToolbarSpy );
			sinon.assert.notCalled( toolbarSpy );
		} );
	} );

	describe( '`esc` keystroke should', () => {
		it( 'do nothing if it was pressed when no toolbar was focused', () => {
			const spy = testUtils.sinon.spy( blockToolbarView, 'focus' );

			setModelData( editor.model, '<paragraph>foo[]</paragraph>' );

			editor.keystrokes.press( {
				keyCode: keyCodes.esc,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			} );

			sinon.assert.notCalled( spy );
		} );
	} );

	describe( 'advanced scenarios', () => {
		it( 'focus toolbar, focus editor back when `esc` was pressed', () => {
			const editorSpy = testUtils.sinon.spy( editor.editing.view.domRoots.get( 'main' ), 'focus' );

			setModelData( editor.model, '<paragraph>foo[]</paragraph>' );

			ui.focusTracker.isFocused = true;
			blockToolbarView.focusTracker.isFocused = false;

			editor.keystrokes.press( keyEventData );

			ui.focusTracker.focusedElement = document.activeElement;

			editor.keystrokes.press( {
				keyCode: keyCodes.esc,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			} );

			sinon.assert.calledOnce( editorSpy );
		} );

		it( 'on widget selection, cycling between its toolbar and block toolbar should be possible', () => {
			const widgetToolbarRepository = editor.plugins.get( 'WidgetToolbarRepository' );
			const imageToolbar = widgetToolbarRepository._toolbarDefinitions.get( 'image' ).view;

			const toolbarSpy = testUtils.sinon.spy( blockToolbarView, 'focus' );
			const imageToolbarSpy = testUtils.sinon.spy( imageToolbar, 'focus' );

			setModelData( editor.model,
				'<paragraph>foo</paragraph>' +
				'[<imageBlock src="https://ckeditor.com/docs/ckeditor5/latest/assets/img/warsaw.jpg"><caption>bar</caption></imageBlock>]' +
				'<paragraph>baz</paragraph>'
			);

			ui.focusTracker.isFocused = true;
			blockToolbarView.focusTracker.isFocused = false;

			// select image baloon toolbar
			editor.keystrokes.press( keyEventData );
			ui.focusTracker.focusedElement = document.activeElement;

			sinon.assert.calledOnce( imageToolbarSpy );

			// try to switch to global baloon toolbar
			editor.keystrokes.press( keyEventData );
			ui.focusTracker.focusedElement = document.activeElement;

			sinon.assert.calledOnce( toolbarSpy );

			// switch to image baloon toolbar again
			editor.keystrokes.press( keyEventData );

			sinon.assert.calledTwice( imageToolbarSpy );
		} );

		it( 'switch focus between image/toolbar/image and go back to editor after `esc` was pressed', () => {
			const widgetToolbarRepository = editor.plugins.get( 'WidgetToolbarRepository' );
			const imageToolbar = widgetToolbarRepository._toolbarDefinitions.get( 'image' ).view;

			const toolbarSpy = testUtils.sinon.spy( blockToolbarView, 'focus' );
			const imageToolbarSpy = testUtils.sinon.spy( imageToolbar, 'focus' );
			const editorSpy = testUtils.sinon.spy( editor.editing.view.domRoots.get( 'main' ), 'focus' );

			setModelData( editor.model,
				'<paragraph>foo</paragraph>' +
				'<imageBlock src="https://ckeditor.com/docs/ckeditor5/latest/assets/img/warsaw.jpg"><caption>ba[]r</caption></imageBlock>' +
				'<paragraph>baz</paragraph>'
			);

			ui.focusTracker.isFocused = true;
			balloonToolbar.focusTracker.isFocused = false;

			// select image baloon toolbar
			editor.keystrokes.press( keyEventData );
			ui.focusTracker.focusedElement = document.activeElement;

			sinon.assert.calledOnce( imageToolbarSpy );

			// try to switch to global baloon toolbar
			editor.keystrokes.press( keyEventData );
			ui.focusTracker.focusedElement = document.activeElement;

			sinon.assert.calledOnce( toolbarSpy );

			// try to switch back to image baloon toolbar
			editor.keystrokes.press( keyEventData );

			sinon.assert.calledTwice( imageToolbarSpy );
			sinon.assert.calledOnce( toolbarSpy );

			// move selection back inside the editor
			editor.keystrokes.press( {
				keyCode: keyCodes.esc,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			} );

			sinon.assert.calledOnce( editorSpy );
		} );
	} );
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
