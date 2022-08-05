/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import EditorUI from '../../src/editor/editorui';
import Editor from '../../src/editor/editor';

import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import ComponentFactory from '@ckeditor/ckeditor5-ui/src/componentfactory';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

import testUtils from '../_utils/utils';

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

		it( 'executes registerFocusableEditingArea()', () => {
			const ui = new EditorUI( editor );
			const spy = sinon.spy( ui, 'registerFocusableEditingArea' );
			const element = document.createElement( 'div' );

			ui.setEditableElement( 'main', element );

			expect( spy.callCount ).to.equal( 1 );
			sinon.assert.calledWithExactly( spy.firstCall, element );
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

	describe( 'focus handling and navigation between editable areas and editor toolbars', () => {
		describe( 'registerFocusableToolbar()', () => {
			let locale, toolbar;

			beforeEach( () => {
				ui = new EditorUI( editor );
				locale = { t: val => val };
				toolbar = new ToolbarView( locale );
			} );

			describe( 'for a ToolbarView that has already been rendered', () => {
				it( 'adds ToolbarView#element to the EditorUI#focusTracker', () => {
					const spy = testUtils.sinon.spy( ui.focusTracker, 'add' );
					toolbar.render();

					ui.registerFocusableToolbar( toolbar );

					sinon.assert.calledOnce( spy );
				} );

				it( 'adds ToolbarView#element to Editor#keystokeHandler', () => {
					const spy = sinon.spy( editor.keystrokes, 'listenTo' );
					toolbar.render();

					ui.registerFocusableToolbar( toolbar );

					sinon.assert.calledOnce( spy );
				} );
			} );

			describe( 'for a toolbar that has not been yet rendered', () => {
				it( 'delayes changes to EditorUI#focusTracker and Editor#keystokeHandler until the toolbar gets rendered', async () => {
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
			} );

			it( 'adds toolbar to the `_focusableToolbarDefinitions` array', () => {
				ui.registerFocusableToolbar( toolbar );

				expect( ui._focusableToolbarDefinitions.length ).to.equal( 1 );
			} );

			it( 'adds toolbar to the `_focusableToolbarDefinitions` array with passed options', () => {
				ui.registerFocusableToolbar( toolbar, { isContextual: true } );

				expect( ui._focusableToolbarDefinitions.length ).to.equal( 1 );
				expect( ui._focusableToolbarDefinitions[ 0 ].options ).to.not.be.undefined;
			} );
		} );

		describe( 'registerFocusableEditingArea()', () => {
			let element;

			beforeEach( () => {
				editor = new Editor();
				ui = new EditorUI( editor );
				element = document.createElement( 'div' );
			} );

			it( 'adds the passed DOM element to EditorUI#focusTracker ', () => {
				const spy = testUtils.sinon.spy( ui.focusTracker, 'add' );

				ui.registerFocusableEditingArea( element );

				sinon.assert.calledOnce( spy );
				sinon.assert.calledWithExactly( spy, element );
			} );

			it( 'adds a DOM element to Editor#keystokeHandler', () => {
				const spy = sinon.spy( editor.keystrokes, 'listenTo' );

				ui.registerFocusableEditingArea( element );

				sinon.assert.calledOnce( spy );
				sinon.assert.calledWithExactly( spy, element );
			} );

			it( 'does not add a DOM element to Editor#keystokeHandler if an editing DOM root (to avoid duplication)', () => {
				const keystorkesSpy = sinon.spy( editor.keystrokes, 'listenTo' );
				const registerSpy = sinon.spy( ui, 'registerFocusableEditingArea' );

				// setEditableElement() calls registerFocusableEditingArea().
				ui.setEditableElement( 'main', element );

				sinon.assert.calledOnce( registerSpy );
				sinon.assert.calledWithExactly( registerSpy, element );
				sinon.assert.notCalled( keystorkesSpy );
			} );

			it( 'updates the _focusableEditingAreas set', () => {
				ui._editableElementsMap.set( 'main', element );

				ui.registerFocusableEditingArea( element );

				expect( ui._focusableEditingAreas.size ).to.equal( 1 );
			} );
		} );

		describe( 'Focusing toolbars on Alt+F10 key press', () => {
			let locale, visibleToolbar, invisibleToolbar, visibleContextualToolbar, toolbarWithBeforeFocus;
			let editingArea;
			let visibleSpy, visibleContextualSpy, invisibleSpy, toolbarWithBeforeFocusSpy;

			beforeEach( () => {
				locale = { t: val => val };

				visibleToolbar = new ToolbarView( locale );
				visibleToolbar.ariaLabel = 'visible';
				visibleToolbar.render();
				document.body.appendChild( visibleToolbar.element );

				visibleContextualToolbar = new ToolbarView( locale );
				visibleContextualToolbar.ariaLabel = 'visible contextual';
				visibleContextualToolbar.render();
				document.body.appendChild( visibleContextualToolbar.element );

				invisibleToolbar = new ToolbarView( locale );
				invisibleToolbar.ariaLabel = 'invisible contextual';
				invisibleToolbar.render();

				toolbarWithBeforeFocus = new ToolbarView( locale );
				toolbarWithBeforeFocus.ariaLabel = 'with before focus';
				toolbarWithBeforeFocus.render();

				ui.registerFocusableToolbar( visibleToolbar );
				ui.registerFocusableToolbar( visibleContextualToolbar, { isContextual: true } );
				ui.registerFocusableToolbar( invisibleToolbar );

				// E.g. a contextual balloon toolbar.
				ui.registerFocusableToolbar( toolbarWithBeforeFocus, {
					beforeFocus: () => {
						document.body.appendChild( toolbarWithBeforeFocus.element );
					},
					afterBlur: () => {
						toolbarWithBeforeFocus.element.remove();
					}
				} );

				editingArea = document.createElement( 'div' );
				document.body.appendChild( editingArea );

				ui.registerFocusableEditingArea( editingArea );

				// Let's start with the editing root already focused.
				ui.focusTracker.isFocused = true;
				ui.focusTracker.focusedElement = editingArea;

				visibleSpy = sinon.spy( visibleToolbar, 'focus' );
				visibleContextualSpy = sinon.spy( visibleContextualToolbar, 'focus' );
				invisibleSpy = sinon.spy( invisibleToolbar, 'focus' );
				toolbarWithBeforeFocusSpy = sinon.spy( toolbarWithBeforeFocus, 'focus' );
			} );

			afterEach( () => {
				visibleToolbar.element.remove();
				visibleContextualToolbar.element.remove();
				toolbarWithBeforeFocus.element.remove();

				editingArea.remove();

				visibleToolbar.destroy();
				visibleContextualToolbar.destroy();
				invisibleToolbar.destroy();
				toolbarWithBeforeFocus.destroy();
			} );

			it( 'should do nothing if no focusable toolbar was found', () => {
				visibleContextualToolbar.element.remove();
				visibleToolbar.element.remove();
				toolbarWithBeforeFocus.element.style.display = 'none';

				pressAltF10();

				sinon.assert.notCalled( visibleContextualSpy );
				sinon.assert.notCalled( visibleContextualSpy );
				sinon.assert.notCalled( toolbarWithBeforeFocusSpy );
				sinon.assert.notCalled( invisibleSpy );
			} );

			it( 'should do nothing if no toolbars were registered', () => {
				const editor = new Editor();
				const ui = new EditorUI( editor );
				const editingArea = document.createElement( 'div' );
				document.body.appendChild( editingArea );

				ui.registerFocusableEditingArea( editingArea );

				expect( () => {
					pressAltF10( editor );
				} ).to.not.throw();

				editingArea.remove();
				editor.destroy();
				ui.destroy();
			} );

			it( 'should focus the first focusable toolbar (and pick the contextual one first)', () => {
				pressAltF10();

				sinon.assert.calledOnce( visibleContextualSpy );
				sinon.assert.notCalled( visibleSpy );
				sinon.assert.notCalled( invisibleSpy );
			} );

			it( 'should focus the next focusable toolbar', () => {
				pressAltF10();
				ui.focusTracker.focusedElement = visibleContextualToolbar.element;

				pressAltF10();
				ui.focusTracker.focusedElement = visibleToolbar.element;

				sinon.assert.callOrder( visibleContextualSpy, visibleSpy );
				sinon.assert.notCalled( invisibleSpy );
			} );

			it( 'should navigate across focusable toolbars and go back to the first one respecting priorities', () => {
				pressAltF10();
				ui.focusTracker.focusedElement = visibleContextualToolbar.element;

				pressAltF10();
				ui.focusTracker.focusedElement = visibleToolbar.element;

				pressAltF10();
				ui.focusTracker.focusedElement = toolbarWithBeforeFocus.element;

				pressAltF10();
				ui.focusTracker.focusedElement = visibleContextualToolbar.element;

				sinon.assert.callOrder( visibleContextualSpy, visibleSpy, toolbarWithBeforeFocusSpy, visibleContextualSpy );
				sinon.assert.notCalled( invisibleSpy );
			} );
		} );

		describe( 'Restoring forcus on Esc key press', () => {
			let locale, visibleToolbarA, visibleToolbarB, editingAreaA, editingAreaB, invisibleEditingArea;
			let editingAreaASpy, editingAreaBSpy, invisibleEditingAreaSpy;

			beforeEach( () => {
				locale = { t: val => val };

				visibleToolbarA = new ToolbarView( locale );
				visibleToolbarA.ariaLabel = 'visible A';
				visibleToolbarA.render();
				document.body.appendChild( visibleToolbarA.element );

				visibleToolbarB = new ToolbarView( locale );
				visibleToolbarB.ariaLabel = 'visible B';
				visibleToolbarB.render();
				document.body.appendChild( visibleToolbarB.element );

				ui.registerFocusableToolbar( visibleToolbarA );
				ui.registerFocusableToolbar( visibleToolbarB );

				editingAreaA = document.createElement( 'div' );
				editingAreaB = document.createElement( 'div' );
				invisibleEditingArea = document.createElement( 'div' );
				document.body.appendChild( editingAreaA );
				document.body.appendChild( editingAreaB );
				document.body.appendChild( invisibleEditingArea );

				// Simulate e.g. a hidden source area.
				invisibleEditingArea.style.display = 'none';

				ui.registerFocusableEditingArea( invisibleEditingArea );
				ui.registerFocusableEditingArea( editingAreaA );
				ui.registerFocusableEditingArea( editingAreaB );

				// Let's start with the editing root "A" already focused.
				ui.focusTracker.isFocused = true;
				ui.focusTracker.focusedElement = editingAreaA;

				editingAreaASpy = sinon.spy( editingAreaA, 'focus' );
				editingAreaBSpy = sinon.spy( editingAreaB, 'focus' );
				invisibleEditingAreaSpy = sinon.spy( invisibleEditingArea, 'focus' );
			} );

			afterEach( () => {
				visibleToolbarA.element.remove();
				visibleToolbarB.element.remove();

				editingAreaA.remove();
				editingAreaB.remove();
				invisibleEditingArea.remove();

				visibleToolbarA.destroy();
				visibleToolbarB.destroy();
			} );

			it( 'should do nothing if no toolbar is focused', () => {
				expect( () => {
					pressEsc();
				} ).to.not.throw();
			} );

			it( 'should return focus back to the last focused editing area', () => {
				pressAltF10();
				ui.focusTracker.focusedElement = visibleToolbarA.element;

				pressEsc();

				sinon.assert.calledOnce( editingAreaASpy );
				sinon.assert.notCalled( editingAreaBSpy );
				sinon.assert.notCalled( invisibleEditingAreaSpy );
			} );

			it( 'should return focus back to the last focused editing area after navigating across multiple toolbars', () => {
				ui.focusTracker.focusedElement = editingAreaB;

				pressAltF10();
				ui.focusTracker.focusedElement = visibleToolbarA.element;

				pressAltF10();
				ui.focusTracker.focusedElement = visibleToolbarB.element;

				pressEsc();

				sinon.assert.calledOnce( editingAreaBSpy );
				sinon.assert.notCalled( editingAreaASpy );
				sinon.assert.notCalled( invisibleEditingAreaSpy );
			} );

			it( 'should focus the first editing area if the focus went straight to the toolbar without focusing any editing areas', () => {
				ui.focusTracker.focusedElement = visibleToolbarA.element;

				pressEsc();

				sinon.assert.calledOnce( editingAreaASpy );
				sinon.assert.notCalled( editingAreaBSpy );
				sinon.assert.notCalled( invisibleEditingAreaSpy );
			} );

			it( 'should clean up after a focused toolbar that had afterBlur() defined in options', () => {
				const toolbarWithCallbacks = new ToolbarView( locale );
				toolbarWithCallbacks.ariaLabel = 'with callbacks';
				toolbarWithCallbacks.render();

				// E.g. a contextual balloon toolbar.
				ui.registerFocusableToolbar( toolbarWithCallbacks, {
					beforeFocus: () => {
						document.body.appendChild( toolbarWithCallbacks.element );
					},
					afterBlur: () => {
						toolbarWithCallbacks.element.remove();
					}
				} );

				pressAltF10();
				ui.focusTracker.focusedElement = visibleToolbarA.element;

				pressAltF10();
				ui.focusTracker.focusedElement = visibleToolbarB.element;

				pressAltF10();
				ui.focusTracker.focusedElement = toolbarWithCallbacks.element;

				pressEsc();
				sinon.assert.calledOnce( editingAreaASpy );
				sinon.assert.notCalled( editingAreaBSpy );
				sinon.assert.notCalled( invisibleEditingAreaSpy );
			} );
		} );

		function pressAltF10( specificEditor ) {
			( specificEditor || editor ).keystrokes.press( {
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
} );
