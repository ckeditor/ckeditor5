/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import EditorUI from '../../src/editor/editorui';
import Editor from '../../src/editor/editor';

import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import ComponentFactory from '@ckeditor/ckeditor5-ui/src/componentfactory';

import testUtils from '../_utils/utils';

import ArticlePluginSet from '../_utils/articlepluginset';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import { Image, ImageCaption, ImageToolbar, ImageStyle } from '@ckeditor/ckeditor5-image';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';

/* global document, console */

describe( 'EditorUI', () => {
	let editor, ui;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editor = new Editor();
		ui = new EditorUI( editor );
	} );

	afterEach( () => {
		ui.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should set #editor', () => {
			expect( ui.editor ).to.equal( editor );
		} );

		it( 'should create #componentFactory factory', () => {
			expect( ui.componentFactory ).to.be.instanceOf( ComponentFactory );
		} );

		it( 'should create #focusTracker', () => {
			expect( ui.focusTracker ).to.be.instanceOf( FocusTracker );
		} );

		it( 'should have #element getter', () => {
			expect( ui.element ).to.null;
		} );

		it( 'should fire update event after viewDocument#layoutChanged', () => {
			const spy = sinon.spy();

			ui.on( 'update', spy );

			editor.editing.view.document.fire( 'layoutChanged' );

			sinon.assert.calledOnce( spy );

			editor.editing.view.document.fire( 'layoutChanged' );

			sinon.assert.calledTwice( spy );
		} );
	} );

	describe( 'update()', () => {
		it( 'should fire update event', () => {
			const spy = sinon.spy();

			ui.on( 'update', spy );

			ui.update();

			sinon.assert.calledOnce( spy );

			ui.update();

			sinon.assert.calledTwice( spy );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should stop listening', () => {
			const spy = sinon.spy( ui, 'stopListening' );

			ui.destroy();

			sinon.assert.called( spy );
		} );

		it( 'should reset editables array', () => {
			ui.setEditableElement( 'foo', {} );
			ui.setEditableElement( 'bar', {} );

			expect( [ ...ui.getEditableElementsNames() ] ).to.deep.equal( [ 'foo', 'bar' ] );

			ui.destroy();

			expect( [ ...ui.getEditableElementsNames() ] ).to.have.length( 0 );
		} );

		it( 'removes domElement#ckeditorInstance references from registered root elements', () => {
			const fooElement = document.createElement( 'foo' );
			const barElement = document.createElement( 'bar' );

			ui.setEditableElement( 'foo', fooElement );
			ui.setEditableElement( 'bar', barElement );

			expect( fooElement.ckeditorInstance ).to.equal( editor );
			expect( barElement.ckeditorInstance ).to.equal( editor );

			ui.destroy();

			expect( fooElement.ckeditorInstance ).to.be.null;
			expect( barElement.ckeditorInstance ).to.be.null;
		} );
	} );

	describe( 'setEditableElement()', () => {
		it( 'should register the editable element under a name', () => {
			const ui = new EditorUI( editor );
			const element = document.createElement( 'div' );

			ui.setEditableElement( 'main', element );

			expect( ui.getEditableElement( 'main' ) ).to.equal( element );
		} );

		it( 'puts a reference to the editor instance in domElement#ckeditorInstance', () => {
			const ui = new EditorUI( editor );
			const element = document.createElement( 'div' );

			ui.setEditableElement( 'main', element );

			expect( element.ckeditorInstance ).to.equal( editor );
		} );

		it( 'does not override a reference to the editor instance in domElement#ckeditorInstance', () => {
			const ui = new EditorUI( editor );
			const element = document.createElement( 'div' );

			element.ckeditorInstance = 'foo';

			ui.setEditableElement( 'main', element );

			expect( element.ckeditorInstance ).to.equal( 'foo' );
		} );

		it( 'fires `registerFOcusableEditingArea`', () => {
			const ui = new EditorUI( editor );
			const spy = sinon.spy( ui, 'registerFocusableEditingArea' );
			const element = document.createElement( 'div' );

			ui.setEditableElement( 'main', element );

			expect( spy.callCount ).to.equal( 1 );
		} );
	} );

	describe( 'getEditableElement()', () => {
		it( 'should return editable element (default root name)', () => {
			const ui = new EditorUI( editor );
			const editableMock = { name: 'main', element: document.createElement( 'div' ) };

			ui.setEditableElement( editableMock.name, editableMock.element );

			expect( ui.getEditableElement() ).to.equal( editableMock.element );
		} );

		it( 'should return editable element (custom root name)', () => {
			const ui = new EditorUI( editor );
			const editableMock1 = { name: 'root1', element: document.createElement( 'div' ) };
			const editableMock2 = { name: 'root2', element: document.createElement( 'p' ) };

			ui.setEditableElement( editableMock1.name, editableMock1.element );
			ui.setEditableElement( editableMock2.name, editableMock2.element );

			expect( ui.getEditableElement( 'root1' ) ).to.equal( editableMock1.element );
			expect( ui.getEditableElement( 'root2' ) ).to.equal( editableMock2.element );
		} );

		it( 'should return null if editable with specified name does not exist', () => {
			const ui = new EditorUI( editor );

			expect( ui.getEditableElement() ).to.be.undefined;
		} );
	} );

	describe( 'getEditableElementsNames()', () => {
		it( 'should return iterable object of names', () => {
			const ui = new EditorUI( editor );
			const editableMock1 = { name: 'main', element: document.createElement( 'div' ) };
			const editableMock2 = { name: 'root2', element: document.createElement( 'p' ) };

			ui.setEditableElement( editableMock1.name, editableMock1.element );
			ui.setEditableElement( editableMock2.name, editableMock2.element );

			const names = ui.getEditableElementsNames();
			expect( names[ Symbol.iterator ] ).to.instanceof( Function );
			expect( Array.from( names ) ).to.deep.equal( [ 'main', 'root2' ] );
		} );

		it( 'should return empty array if no editables', () => {
			const ui = new EditorUI( editor );

			expect( ui.getEditableElementsNames() ).to.be.empty;
		} );
	} );

	describe( '_editableElements()', () => {
		it( 'should warn about deprecation', () => {
			const ui = new EditorUI( editor );
			const stub = testUtils.sinon.stub( console, 'warn' );

			expect( ui._editableElements ).to.be.instanceOf( Map );
			sinon.assert.calledWithMatch( stub, 'editor-ui-deprecated-editable-elements' );
		} );
	} );

	describe( 'viewportOffset', () => {
		it( 'should return offset object', () => {
			const stub = testUtils.sinon.stub( editor.config, 'get' )
				.withArgs( 'ui.viewportOffset' )
				.returns( { top: 200 } );

			const ui = new EditorUI( editor );

			expect( ui.viewportOffset ).to.deep.equal( { top: 200 } );
			sinon.assert.calledOnce( stub );
		} );

		it( 'should warn about deprecation', () => {
			testUtils.sinon.stub( editor.config, 'get' )
				.withArgs( 'ui.viewportOffset' )
				.returns( null )
				.withArgs( 'toolbar.viewportTopOffset' )
				.returns( 200 );

			const consoleStub = testUtils.sinon.stub( console, 'warn' );

			const ui = new EditorUI( editor );

			expect( ui.viewportOffset ).to.deep.equal( { top: 200 } );
			sinon.assert.calledWithMatch( consoleStub, 'editor-ui-deprecated-viewport-offset-config' );
		} );
	} );

	describe( 'focus related method', () => {
		describe( 'registerFocusableToolbar', () => {
			let locale, toolbar;

			beforeEach( () => {
				ui = new EditorUI( editor );
				locale = { t: val => val };
				toolbar = new ToolbarView( locale );
			} );

			it( 'adds toolbarView.element to focusTracker', () => {
				const spy = testUtils.sinon.spy( ui.focusTracker, 'add' );
				toolbar.render();
				ui.registerFocusableToolbar( toolbar );

				sinon.assert.calledOnce( spy );
			} );

			it( 'adds a new editor keystrokes listener', () => {
				const spy = sinon.spy( editor.keystrokes, 'listenTo' );
				toolbar.render();
				ui.registerFocusableToolbar( toolbar );

				sinon.assert.calledOnce( spy );
			} );

			it( 'adds a keystroke listener, updates focusTracker once the toolbar has been rendered', async () => {
				const spy = sinon.spy( editor.keystrokes, 'listenTo' );
				const spy2 = testUtils.sinon.spy( ui.focusTracker, 'add' );
				ui.registerFocusableToolbar( toolbar );

				await new Promise( resolve => {
					toolbar.once( 'render', () => {
						sinon.assert.calledOnce( spy );
						sinon.assert.calledOnce( spy2 );

						resolve();
					} );

					toolbar.render();
				} );
			} );

			it( 'adds toolbar to the `_focusableToolbars` array', () => {
				ui.registerFocusableToolbar( toolbar );

				expect( ui._focusableToolbars.length ).to.equal( 1 );
			} );

			it( 'adds toolbar to the `_focusableToolbars` array with passed options', () => {
				ui.registerFocusableToolbar( toolbar, { isContextual: true } );

				expect( ui._focusableToolbars.length ).to.equal( 1 );
				expect( ui._focusableToolbars[ 0 ].options ).to.not.be.undefined;
			} );
		} );

		describe( 'registerFocusableEditingArea', () => {
			let element;

			beforeEach( () => {
				editor = new Editor();
				ui = new EditorUI( editor );
				element = document.createElement( 'div' );
			} );

			describe( 'if isElement', () => {
				it( 'adds passed element to focusTracker ', () => {
					ui._editableElementsMap.set( 'main', element );
					ui.registerFocusableEditingArea( element );

					expect( ui.focusTracker._elements.size ).to.equal( 1 );
				} );

				it( 'does not add keystroke listener on passed element if editor is already listening to the editing view', () => {
					const spy = sinon.spy( editor.keystrokes, 'listenTo' );
					ui._editableElementsMap.set( 'main', element );
					ui.registerFocusableEditingArea( element );

					sinon.assert.notCalled( spy );
				} );

				it( 'adds keystroke listener on passed element if editor is not yet listening to the editing view ', () => {
					const spy = sinon.spy( editor.keystrokes, 'listenTo' );
					ui.registerFocusableEditingArea( element );

					sinon.assert.calledOnce( spy );
				} );
			} );

			it( 'updates the _focusableEditingAreas set', () => {
				ui._editableElementsMap.set( 'main', element );
				ui.registerFocusableEditingArea( element );

				expect( ui._focusableEditingAreas.size ).to.equal( 1 );
			} );
		} );

		describe( '_initFocusTracking', () => {
			describe( 'sets keystroke for alt+f10', () => {
				it( '', () => {
					console.log( editor.keystrokes );
					const spy = sinon.spy( editor, 'execute' );
					const keyEventData = {
						keyCode: keyCodes.f10,
						altKey: true,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					};

					const wasHandled = editor.keystrokes.press( keyEventData );

					expect( wasHandled ).to.be.true;
					expect( spy.calledOnce ).to.be.true;
					expect( keyEventData.preventDefault.calledOnce ).to.be.true;
				} );
			} );

			describe( 'sets keytsroke for esc', () => {
				it( '', () => { } );
			} );
		} );

		describe( '_getToolbarDefinitionWeight', () => {
			it( 'takes correct parameter', () => { } );
			it( 'returns correct ', () => { } );
		} );

		describe( '_getFocusableToolbarDefinitions', () => {
			let element, ui;

			beforeEach( async () => {
				element = document.body.appendChild( document.createElement( 'div' ) );

				editor = await ClassicEditor.create( element, {
					plugins: [ ArticlePluginSet, Paragraph, Image, ImageToolbar, ImageCaption, ImageStyle ],
					toolbar: [ 'bold', 'italic' ],
					image: {
						toolbar: [ 'imageStyle:block', 'imageStyle:side', '|', 'toggleImageCaption', 'imageTextAlternative' ]
					}
				} );

				ui = editor.ui;
			} );

			afterEach( () => {
				element.remove();

				return editor.destroy();
			} );

			it( 'creates and updates an definitions array', () => {
				setData( editor.model, '<paragraph>foo[]</paragraph>' );

				editor.keystrokes.press( {
					keyCode: keyCodes.f10,
					altKey: true,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				} );

				console.log( 'test', ui._getFocusableToolbarDefinitions() );
			} );

			it( 'calls _getToolbarDefinitionWeight to sort the definitions', () => {
				const spy = sinon.spy( ui, '_getToolbarDefinitionWeight' );
				setData( editor.model, '<paragraph>foo[]</paragraph>' );

				editor.keystrokes.press( {
					keyCode: keyCodes.f10,
					altKey: true,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				} );

				sinon.assert.calledOnce( spy );
			} );
		} );
	} );
} );
