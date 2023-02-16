/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import EditorUI from '../../src/editorui/editorui';

import ComponentFactory from '../../src/componentfactory';
import ToolbarView from '../../src/toolbar/toolbarview';
import TooltipManager from '../../src/tooltipmanager';

import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

import { Editor } from '@ckeditor/ckeditor5-core';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

/* global document, console */

describe( 'EditorUI', () => {
	let editor, ui;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editor = new Editor();
		editor.ui = ui = new EditorUI( editor );
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

		it( 'should create #tooltipManager', () => {
			expect( ui.tooltipManager ).to.be.instanceOf( TooltipManager );
		} );

		it( 'should have #element getter', () => {
			expect( ui.element ).to.null;
		} );

		it( 'should set isReady to false', () => {
			expect( ui.isReady ).to.be.false;
		} );

		it( 'should set isReady to true after #ready is fired', () => {
			ui.fire( 'ready' );
			expect( ui.isReady ).to.be.true;
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

		it( 'should destroy #focusTracker', () => {
			const destroySpy = sinon.spy( ui.focusTracker, 'destroy' );

			ui.destroy();

			sinon.assert.calledOnce( destroySpy );
		} );

		it( 'should destroy #tooltipManager', () => {
			const destroySpy = sinon.spy( ui.tooltipManager, 'destroy' );

			ui.destroy();

			sinon.assert.calledOnce( destroySpy );
			sinon.assert.calledWithExactly( destroySpy, editor );
		} );
	} );

	describe( 'setEditableElement()', () => {
		let element;

		beforeEach( () => {
			element = document.createElement( 'div' );
		} );

		it( 'should register the editable element under a name', () => {
			const ui = new EditorUI( editor );

			ui.setEditableElement( 'main', element );

			expect( ui.getEditableElement( 'main' ) ).to.equal( element );
		} );

		it( 'puts a reference to the editor instance in domElement#ckeditorInstance', () => {
			const ui = new EditorUI( editor );

			ui.setEditableElement( 'main', element );

			expect( element.ckeditorInstance ).to.equal( editor );
		} );

		it( 'does not override a reference to the editor instance in domElement#ckeditorInstance', () => {
			const ui = new EditorUI( editor );

			element.ckeditorInstance = 'foo';

			ui.setEditableElement( 'main', element );

			expect( element.ckeditorInstance ).to.equal( 'foo' );
		} );

		describe( 'Focus tracking and accessibility', () => {
			it( 'should add the passed DOM element to EditorUI#focusTracker ', () => {
				const spy = testUtils.sinon.spy( ui.focusTracker, 'add' );

				ui.setEditableElement( 'main', element );

				sinon.assert.calledOnce( spy );
				sinon.assert.calledWithExactly( spy, element );
			} );

			it( 'should add a DOM element to Editor#keystokeHandler', () => {
				const spy = sinon.spy( editor.keystrokes, 'listenTo' );

				ui.setEditableElement( 'main', element );
				ui.fire( 'ready' );

				sinon.assert.calledOnce( spy );
				sinon.assert.calledWithExactly( spy, element );
			} );

			it( 'should not add a DOM element to Editor#keystokeHandler if an editing DOM root (to avoid duplication)', () => {
				const keystorkesSpy = sinon.spy( editor.keystrokes, 'listenTo' );

				ui.setEditableElement( 'main', element );
				editor.model.document.createRoot();
				editor.editing.view.attachDomRoot( element );
				ui.fire( 'ready' );

				sinon.assert.notCalled( keystorkesSpy );
			} );

			it( 'should enable accessibility features after the editor UI was ready', () => {
				const focusTrackerSpy = testUtils.sinon.spy( ui.focusTracker, 'add' );
				const keystrokesSpy = sinon.spy( editor.keystrokes, 'listenTo' );

				ui.fire( 'ready' );
				ui.setEditableElement( 'main', element );

				sinon.assert.calledOnce( focusTrackerSpy );
				sinon.assert.calledWithExactly( focusTrackerSpy, element );

				sinon.assert.calledOnce( keystrokesSpy );
				sinon.assert.calledWithExactly( keystrokesSpy, element );
			} );
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

	describe( 'Focus handling and navigation between editable areas and editor toolbars', () => {
		describe( 'addToolbar()', () => {
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

					ui.addToolbar( toolbar );

					sinon.assert.calledOnce( spy );
				} );

				it( 'adds ToolbarView#element to Editor#keystokeHandler', () => {
					const spy = sinon.spy( editor.keystrokes, 'listenTo' );
					toolbar.render();

					ui.addToolbar( toolbar );

					sinon.assert.calledOnce( spy );
				} );
			} );

			describe( 'for a toolbar that has not been yet rendered', () => {
				it( 'delayes changes to EditorUI#focusTracker and Editor#keystokeHandler until the toolbar gets rendered', async () => {
					const spy = sinon.spy( editor.keystrokes, 'listenTo' );
					const spy2 = testUtils.sinon.spy( ui.focusTracker, 'add' );

					ui.addToolbar( toolbar );

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
				ui.addToolbar( toolbar );

				expect( ui._focusableToolbarDefinitions.length ).to.equal( 1 );
			} );

			it( 'adds toolbar to the `_focusableToolbarDefinitions` array with passed options', () => {
				ui.addToolbar( toolbar, { isContextual: true } );

				expect( ui._focusableToolbarDefinitions.length ).to.equal( 1 );
				expect( ui._focusableToolbarDefinitions[ 0 ].options ).to.not.be.undefined;
			} );
		} );

		describe( 'Focusing toolbars on Alt+F10 key press', () => {
			let locale, visibleToolbar, invisibleToolbar, visibleContextualToolbar, toolbarWithSetupAndCleanup;
			let editingArea;
			let visibleSpy, visibleContextualSpy, invisibleSpy, toolbarWithSetupAndCleanupSpy;

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

				toolbarWithSetupAndCleanup = new ToolbarView( locale );
				toolbarWithSetupAndCleanup.ariaLabel = 'with before focus';
				toolbarWithSetupAndCleanup.render();

				ui.addToolbar( visibleToolbar );
				ui.addToolbar( visibleContextualToolbar, { isContextual: true } );
				ui.addToolbar( invisibleToolbar );

				// E.g. a contextual balloon toolbar.
				ui.addToolbar( toolbarWithSetupAndCleanup, {
					beforeFocus: () => {
						document.body.appendChild( toolbarWithSetupAndCleanup.element );
					},
					afterBlur: () => {
						toolbarWithSetupAndCleanup.element.remove();
					}
				} );

				editingArea = document.createElement( 'div' );
				document.body.appendChild( editingArea );

				ui.setEditableElement( 'main', editingArea );
				ui.fire( 'ready' );

				// Let's start with the editing root already focused.
				ui.focusTracker.isFocused = true;
				ui.focusTracker.focusedElement = editingArea;

				visibleSpy = sinon.spy( visibleToolbar, 'focus' ).named( 'visible' );
				visibleContextualSpy = sinon.spy( visibleContextualToolbar, 'focus' ).named( 'visibleContextual' );
				invisibleSpy = sinon.spy( invisibleToolbar, 'focus' ).named( 'invisible' );
				toolbarWithSetupAndCleanupSpy = sinon.spy( toolbarWithSetupAndCleanup, 'focus' ).named( 'withSetupAndCleanup' );
			} );

			afterEach( () => {
				visibleToolbar.element.remove();
				visibleContextualToolbar.element.remove();
				toolbarWithSetupAndCleanup.element.remove();

				editingArea.remove();

				visibleToolbar.destroy();
				visibleContextualToolbar.destroy();
				invisibleToolbar.destroy();
				toolbarWithSetupAndCleanup.destroy();
			} );

			it( 'should do nothing if no focusable toolbar was found', () => {
				visibleContextualToolbar.element.remove();
				visibleToolbar.element.remove();
				toolbarWithSetupAndCleanup.element.style.display = 'none';

				pressAltF10();

				sinon.assert.notCalled( visibleContextualSpy );
				sinon.assert.notCalled( visibleContextualSpy );
				sinon.assert.notCalled( toolbarWithSetupAndCleanupSpy );
				sinon.assert.notCalled( invisibleSpy );
			} );

			it( 'should do nothing if no toolbars were registered', () => {
				const editor = new Editor();
				const ui = editor.ui = new EditorUI( editor );
				const editingArea = document.createElement( 'div' );
				document.body.appendChild( editingArea );

				ui.setEditableElement( 'main', editingArea );
				ui.fire( 'ready' );

				expect( () => {
					pressAltF10( editor );
				} ).to.not.throw();

				editingArea.remove();
				editor.destroy();
				ui.destroy();
			} );

			it( 'should do nothing if the toolbar is already focused and there is nowhere else for the focus to go ' +
				'(a toolbar without beforeFocus() / afterBlur())',
			() => {
				visibleToolbar.element.remove();
				toolbarWithSetupAndCleanup.element.style.display = 'none';

				pressAltF10();
				ui.focusTracker.focusedElement = visibleContextualToolbar.element;

				sinon.assert.calledOnce( visibleContextualSpy );

				pressAltF10();
				sinon.assert.calledOnce( visibleContextualSpy );
				sinon.assert.notCalled( visibleSpy );
				sinon.assert.notCalled( toolbarWithSetupAndCleanupSpy );
				sinon.assert.notCalled( invisibleSpy );

				expect( visibleContextualToolbar.element.parentNode ).to.equal( document.body );
			} );

			it( 'should do nothing if the toolbar is already focused and there is nowhere else for the focus to go ' +
				'(a toolbar with beforeFocus() / afterBlur())',
			() => {
				visibleToolbar.element.remove();
				visibleContextualToolbar.element.style.display = 'none';

				pressAltF10();
				ui.focusTracker.focusedElement = toolbarWithSetupAndCleanup.element;

				sinon.assert.calledOnce( toolbarWithSetupAndCleanupSpy );

				pressAltF10();
				sinon.assert.calledOnce( toolbarWithSetupAndCleanupSpy );
				sinon.assert.notCalled( visibleSpy );
				sinon.assert.notCalled( visibleContextualSpy );
				sinon.assert.notCalled( invisibleSpy );

				expect( toolbarWithSetupAndCleanup.element.parentNode ).to.equal( document.body );
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
				ui.focusTracker.focusedElement = toolbarWithSetupAndCleanup.element;

				pressAltF10();
				ui.focusTracker.focusedElement = visibleContextualToolbar.element;

				sinon.assert.callOrder( visibleContextualSpy, visibleSpy, toolbarWithSetupAndCleanupSpy, visibleContextualSpy );
				sinon.assert.notCalled( invisibleSpy );
			} );

			it( 'should avoid race betwen toolbars with beforeFocus()/afterBlur()', () => {
				const secondToolbarWithSetupAndCleanup = new ToolbarView( locale );
				secondToolbarWithSetupAndCleanup.ariaLabel = 'second with before focus';
				secondToolbarWithSetupAndCleanup.render();

				visibleToolbar.element.style.display = 'none';

				const secondToolbarWithSetupAndCleanupSpy = sinon.spy( secondToolbarWithSetupAndCleanup, 'focus' )
					.named( 'secondWithSetupAndCleanup' );

				ui.addToolbar( secondToolbarWithSetupAndCleanup, {
					beforeFocus: () => {
						document.body.appendChild( secondToolbarWithSetupAndCleanup.element );
					},
					afterBlur: () => {
						secondToolbarWithSetupAndCleanup.element.remove();
					}
				} );

				// ----------------------------------------

				pressAltF10();
				ui.focusTracker.focusedElement = visibleContextualToolbar.element;

				pressAltF10();
				ui.focusTracker.focusedElement = toolbarWithSetupAndCleanup.element;

				pressAltF10();
				ui.focusTracker.focusedElement = secondToolbarWithSetupAndCleanup.element;

				pressAltF10();
				ui.focusTracker.focusedElement = visibleContextualToolbar.element;

				pressAltF10();
				ui.focusTracker.focusedElement = toolbarWithSetupAndCleanup.element;

				sinon.assert.callOrder(
					visibleContextualSpy,
					toolbarWithSetupAndCleanupSpy,
					secondToolbarWithSetupAndCleanupSpy,
					visibleContextualSpy,
					toolbarWithSetupAndCleanupSpy
				);

				sinon.assert.notCalled( invisibleSpy );

				// ----------------------------------------

				secondToolbarWithSetupAndCleanup.element.remove();
			} );

			// https://github.com/ckeditor/ckeditor5/issues/12339
			it( 'should work if the focus was already in the toolbar (e.g. a user clicked an item)', () => {
				ui.focusTracker.focusedElement = visibleContextualToolbar.element;

				pressAltF10();
				ui.focusTracker.focusedElement = visibleToolbar.element;

				sinon.assert.calledOnce( visibleSpy );
				sinon.assert.notCalled( visibleContextualSpy );
			} );
		} );

		describe( 'Restoring focus on Esc key press', () => {
			let locale, visibleToolbarA, visibleToolbarB, editingAreaA, editingAreaB, nonEngineEditingArea, invisibleEditingArea;
			let editingFocusSpy, editingAreaASpy, editingAreaBSpy, nonEngineEditingAreaSpy, invisibleEditingAreaSpy;

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

				ui.addToolbar( visibleToolbarA );
				ui.addToolbar( visibleToolbarB );

				editingAreaA = document.createElement( 'div' );
				editingAreaB = document.createElement( 'div' );
				nonEngineEditingArea = document.createElement( 'div' );
				invisibleEditingArea = document.createElement( 'div' );

				editingAreaA.setAttribute( 'id', 'A' );
				editingAreaB.setAttribute( 'id', 'B' );
				nonEngineEditingArea.setAttribute( 'id', 'non-engine' );
				invisibleEditingArea.setAttribute( 'id', 'invisible' );

				document.body.appendChild( editingAreaA );
				document.body.appendChild( editingAreaB );
				document.body.appendChild( nonEngineEditingArea );
				document.body.appendChild( invisibleEditingArea );

				// Simulate e.g. a hidden source area.
				invisibleEditingArea.style.display = 'none';

				editor.model.document.createRoot( '$root', 'invisible' );
				editor.model.document.createRoot( '$root', 'areaA' );
				editor.model.document.createRoot( '$root', 'areaB' );
				editor.editing.view.attachDomRoot( invisibleEditingArea, 'invisible' );
				editor.editing.view.attachDomRoot( editingAreaA, 'areaA' );
				editor.editing.view.attachDomRoot( editingAreaB, 'areaB' );

				ui.setEditableElement( 'invisible', invisibleEditingArea );
				ui.setEditableElement( 'areaA', editingAreaA );
				ui.setEditableElement( 'areaB', editingAreaB );
				ui.setEditableElement( 'nonEngine', nonEngineEditingArea );
				ui.fire( 'ready' );

				// Let's start with the editing root "A" already focused.
				ui.focusTracker.isFocused = true;
				ui.focusTracker.focusedElement = editingAreaA;

				editingFocusSpy = sinon.spy( editor.editing.view, 'focus' );
				editingAreaASpy = sinon.spy( editingAreaA, 'focus' );
				editingAreaBSpy = sinon.spy( editingAreaB, 'focus' );
				nonEngineEditingAreaSpy = sinon.spy( nonEngineEditingArea, 'focus' );
				invisibleEditingAreaSpy = sinon.spy( invisibleEditingArea, 'focus' );
			} );

			afterEach( () => {
				visibleToolbarA.element.remove();
				visibleToolbarB.element.remove();

				editingAreaA.remove();
				editingAreaB.remove();
				nonEngineEditingArea.remove();
				invisibleEditingArea.remove();

				visibleToolbarA.destroy();
				visibleToolbarB.destroy();
			} );

			it( 'should do nothing if no toolbar is focused', () => {
				expect( () => {
					pressEsc();
				} ).to.not.throw();
			} );

			it( 'should return focus back to the editing view if it came from there', () => {
				// Catches the `There is no selection in any editable to focus.` warning.
				sinon.stub( console, 'warn' );

				ui.focusTracker.focusedElement = editor.editing.view.getDomRoot();

				pressAltF10();
				ui.focusTracker.focusedElement = visibleToolbarA.element;

				pressEsc();

				sinon.assert.calledOnce( editingFocusSpy );
				sinon.assert.notCalled( editingAreaASpy );
				sinon.assert.notCalled( editingAreaBSpy );
				sinon.assert.notCalled( nonEngineEditingAreaSpy );
				sinon.assert.notCalled( invisibleEditingAreaSpy );
			} );

			it( 'should return focus back to the last focused editing area that does not belong to the editing view', () => {
				ui.focusTracker.focusedElement = nonEngineEditingArea;

				pressAltF10();
				ui.focusTracker.focusedElement = visibleToolbarA.element;

				pressEsc();

				sinon.assert.calledOnce( nonEngineEditingAreaSpy );
				sinon.assert.notCalled( editingAreaASpy );
				sinon.assert.notCalled( editingAreaBSpy );
				sinon.assert.notCalled( invisibleEditingAreaSpy );
			} );

			it( 'should return focus back to the last focused editing area after navigating across multiple toolbars', () => {
				// Catches the `There is no selection in any editable to focus.` warning.
				sinon.stub( console, 'warn' );

				ui.focusTracker.focusedElement = editingAreaB;

				pressAltF10();
				ui.focusTracker.focusedElement = visibleToolbarA.element;

				pressAltF10();
				ui.focusTracker.focusedElement = visibleToolbarB.element;

				pressEsc();

				sinon.assert.calledOnce( editingFocusSpy );
				sinon.assert.notCalled( editingAreaBSpy );
				sinon.assert.notCalled( editingAreaASpy );
				sinon.assert.notCalled( nonEngineEditingAreaSpy );
				sinon.assert.notCalled( invisibleEditingAreaSpy );
			} );

			it( 'should focus the first editing area if the focus went straight to the toolbar without focusing any editing areas', () => {
				// Catches the `There is no selection in any editable to focus.` warning.
				sinon.stub( console, 'warn' );

				ui.focusTracker.focusedElement = visibleToolbarA.element;

				pressEsc();

				sinon.assert.calledOnce( editingFocusSpy );
				sinon.assert.notCalled( editingAreaASpy );
				sinon.assert.notCalled( editingAreaBSpy );
				sinon.assert.notCalled( nonEngineEditingAreaSpy );
				sinon.assert.notCalled( invisibleEditingAreaSpy );
			} );

			it( 'should clean up after a focused toolbar that had afterBlur() defined in options', () => {
				// Catches the `There is no selection in any editable to focus.` warning.
				sinon.stub( console, 'warn' );

				const toolbarWithCallbacks = new ToolbarView( locale );
				toolbarWithCallbacks.ariaLabel = 'with callbacks';
				toolbarWithCallbacks.render();

				// E.g. a contextual balloon toolbar.
				ui.addToolbar( toolbarWithCallbacks, {
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
				sinon.assert.calledOnce( editingFocusSpy );
				sinon.assert.notCalled( editingAreaASpy );
				sinon.assert.notCalled( editingAreaBSpy );
				sinon.assert.notCalled( nonEngineEditingAreaSpy );
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
