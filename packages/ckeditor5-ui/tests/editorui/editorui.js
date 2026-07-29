/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { EditorUI } from '../../src/editorui/editorui.js';

import { ComponentFactory } from '../../src/componentfactory.js';
import { ToolbarView } from '../../src/toolbar/toolbarview.js';
import { TooltipManager } from '../../src/tooltipmanager.js';
import { PoweredBy } from '../../src/editorui/poweredby.js';
import { EvaluationBadge } from '../../src/editorui/evaluationbadge.js';
import { AriaLiveAnnouncer } from '../../src/arialiveannouncer.js';
import { EditorUIView, InlineEditableUIView, MenuBarView, View } from '../../src/index.js';

import { FocusTracker, keyCodes, env } from '@ckeditor/ckeditor5-utils';
import { Editor } from '@ckeditor/ckeditor5-core';
import { ClassicTestEditor, ClassicTestEditorUI } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';

class MyEditorUI extends EditorUI {
	constructor( editor ) {
		super( editor );

		this.view = new EditorUIView( editor.locale );
	}

	destroy() {
		this.view.destroy();
		super.destroy();
	}
}

describe( 'EditorUI', () => {
	let editor, ui;

	beforeEach( () => {
		editor = new Editor();
		editor.ui = ui = new MyEditorUI( editor );
		editor.state = 'ready';
	} );

	afterEach( async () => {
		ui.destroy();

		if ( editor.state !== 'destroyed' ) {
			editor.fire( 'ready' );
			await editor.destroy();
		}
	} );

	describe( 'constructor()', () => {
		it( 'should set #editor', () => {
			expect( ui.editor ).toBe( editor );
		} );

		it( 'should create #componentFactory factory', () => {
			expect( ui.componentFactory ).toBeInstanceOf( ComponentFactory );
		} );

		it( 'should create #focusTracker', () => {
			expect( ui.focusTracker ).toBeInstanceOf( FocusTracker );
		} );

		it( 'should create #tooltipManager', () => {
			expect( ui.tooltipManager ).toBeInstanceOf( TooltipManager );
		} );

		it( 'should create #poweredBy', () => {
			expect( ui.poweredBy ).toBeInstanceOf( PoweredBy );
		} );

		it( 'should create #evaluationBadge', () => {
			expect( ui.evaluationBadge ).toBeInstanceOf( EvaluationBadge );
		} );

		it( 'should create the aria live announcer instance', () => {
			expect( ui.ariaLiveAnnouncer ).toBeInstanceOf( AriaLiveAnnouncer );
		} );

		it( 'should have #element getter', () => {
			expect( ui.element ).toBeNull();
		} );

		it( 'should set isReady to false', () => {
			expect( ui.isReady ).toBe( false );
		} );

		it( 'should set isReady to true after #ready is fired', () => {
			ui.fire( 'ready' );
			expect( ui.isReady ).toBe( true );
		} );

		it( 'should fire update event after viewDocument#layoutChanged', () => {
			const spy = vi.fn();

			ui.on( 'update', spy );

			editor.editing.view.document.fire( 'layoutChanged' );

			expect( spy ).toHaveBeenCalledTimes( 1 );

			editor.editing.view.document.fire( 'layoutChanged' );

			expect( spy ).toHaveBeenCalledTimes( 2 );
		} );
	} );

	describe( 'update()', () => {
		it( 'should fire update event', () => {
			const spy = vi.fn();

			ui.on( 'update', spy );

			ui.update();

			expect( spy ).toHaveBeenCalledTimes( 1 );

			ui.update();

			expect( spy ).toHaveBeenCalledTimes( 2 );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should stop listening', () => {
			const spy = vi.spyOn( ui, 'stopListening' );

			ui.destroy();

			expect( spy ).toHaveBeenCalled();
		} );

		it( 'should reset editables array', () => {
			ui.setEditableElement( 'foo', document.createElement( 'div' ) );
			ui.setEditableElement( 'bar', document.createElement( 'div' ) );

			expect( [ ...ui.getEditableElementsNames() ] ).toEqual( [ 'foo', 'bar' ] );

			ui.destroy();

			expect( [ ...ui.getEditableElementsNames() ] ).toHaveLength( 0 );
		} );

		it( 'removes domElement#ckeditorInstance references from registered root elements', () => {
			const fooElement = document.createElement( 'foo' );
			const barElement = document.createElement( 'bar' );

			ui.setEditableElement( 'foo', fooElement );
			ui.setEditableElement( 'bar', barElement );

			expect( fooElement.ckeditorInstance ).toBe( editor );
			expect( barElement.ckeditorInstance ).toBe( editor );

			ui.destroy();

			expect( fooElement.ckeditorInstance ).toBeNull();
			expect( barElement.ckeditorInstance ).toBeNull();
		} );

		it( 'should destroy #focusTracker', () => {
			const destroySpy = vi.spyOn( ui.focusTracker, 'destroy' );

			ui.destroy();

			expect( destroySpy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should remove elements from keystroke handler', () => {
			const fooElement = document.createElement( 'foo' );
			const barElement = document.createElement( 'bar' );

			ui.setEditableElement( 'foo', fooElement );
			ui.setEditableElement( 'bar', barElement );

			const keystrokesSpy = vi.spyOn( editor.keystrokes, 'stopListening' );

			ui.destroy();

			expect( keystrokesSpy ).toHaveBeenCalledTimes( 2 );
			expect( keystrokesSpy ).toHaveBeenCalledWith( fooElement );
			expect( keystrokesSpy ).toHaveBeenCalledWith( barElement );
		} );

		it( 'should destroy #tooltipManager', () => {
			const destroySpy = vi.spyOn( ui.tooltipManager, 'destroy' );

			ui.destroy();

			expect( destroySpy ).toHaveBeenCalledTimes( 1 );
			expect( destroySpy ).toHaveBeenCalledWith( editor );
		} );

		it( 'should destroy #poweredBy', () => {
			const destroySpy = vi.spyOn( ui.poweredBy, 'destroy' );

			ui.destroy();

			expect( destroySpy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should destroy #evaluationBadge', () => {
			const destroySpy = vi.spyOn( ui.evaluationBadge, 'destroy' );

			ui.destroy();

			expect( destroySpy ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'setEditableElement()', () => {
		let element;

		beforeEach( () => {
			element = document.createElement( 'div' );
		} );

		it( 'should register the editable element under a name', () => {
			const ui = new MyEditorUI( editor );

			ui.setEditableElement( 'main', element );

			expect( ui.getEditableElement( 'main' ) ).toBe( element );
		} );

		it( 'puts a reference to the editor instance in domElement#ckeditorInstance', () => {
			const ui = new MyEditorUI( editor );

			ui.setEditableElement( 'main', element );

			expect( element.ckeditorInstance ).toBe( editor );
		} );

		it( 'does not override a reference to the editor instance in domElement#ckeditorInstance', () => {
			const ui = new MyEditorUI( editor );

			element.ckeditorInstance = 'foo';

			ui.setEditableElement( 'main', element );

			expect( element.ckeditorInstance ).toBe( 'foo' );
		} );

		describe( 'Focus tracking and accessibility', () => {
			it( 'should add the passed DOM element to EditorUI#focusTracker', () => {
				const spy = vi.spyOn( ui.focusTracker, 'add' );

				ui.setEditableElement( 'main', element );

				expect( spy ).toHaveBeenCalledTimes( 1 );
				expect( spy ).toHaveBeenCalledWith( element );
			} );

			it( 'should add a DOM element to Editor#keystokeHandler', () => {
				const spy = vi.spyOn( editor.keystrokes, 'listenTo' );

				ui.setEditableElement( 'main', element );
				ui.fire( 'ready' );

				expect( spy ).toHaveBeenCalledTimes( 1 );
				expect( spy ).toHaveBeenCalledWith( element );
			} );

			it( 'should not add a DOM element to Editor#keystokeHandler if an editing DOM root (to avoid duplication)', () => {
				const keystrokesSpy = vi.spyOn( editor.keystrokes, 'listenTo' );

				ui.setEditableElement( 'main', element );

				expect( keystrokesSpy ).not.toHaveBeenCalled();
			} );

			it( 'should enable accessibility features after the editor UI was ready', () => {
				const focusTrackerSpy = vi.spyOn( ui.focusTracker, 'add' );
				const keystrokesSpy = vi.spyOn( editor.keystrokes, 'listenTo' );

				ui.fire( 'ready' );
				ui.setEditableElement( 'main', element );

				expect( focusTrackerSpy ).toHaveBeenCalledTimes( 1 );
				expect( focusTrackerSpy ).toHaveBeenCalledWith( element );

				expect( keystrokesSpy ).toHaveBeenCalledTimes( 1 );
				expect( keystrokesSpy ).toHaveBeenCalledWith( element );
			} );
		} );
	} );

	describe( 'getEditableElement()', () => {
		it( 'should return editable element (default root name)', () => {
			const ui = new MyEditorUI( editor );
			const editableMock = { name: 'main', element: document.createElement( 'div' ) };

			ui.setEditableElement( editableMock.name, editableMock.element );

			expect( ui.getEditableElement() ).toBe( editableMock.element );
		} );

		it( 'should return editable element (custom root name)', () => {
			const ui = new MyEditorUI( editor );
			const editableMock1 = { name: 'root1', element: document.createElement( 'div' ) };
			const editableMock2 = { name: 'root2', element: document.createElement( 'p' ) };

			ui.setEditableElement( editableMock1.name, editableMock1.element );
			ui.setEditableElement( editableMock2.name, editableMock2.element );

			expect( ui.getEditableElement( 'root1' ) ).toBe( editableMock1.element );
			expect( ui.getEditableElement( 'root2' ) ).toBe( editableMock2.element );
		} );

		it( 'should return null if editable with specified name does not exist', () => {
			const ui = new MyEditorUI( editor );

			expect( ui.getEditableElement() ).toBeUndefined();
		} );
	} );

	describe( 'removeEditableElement()', () => {
		let ui, editableMock;

		beforeEach( () => {
			ui = new MyEditorUI( editor );
			const element = document.createElement( 'div' );
			editableMock = { name: 'root1', element };

			ui.setEditableElement( editableMock.name, editableMock.element );
		} );

		it( 'should remove the element from the editor ui', () => {
			ui.removeEditableElement( editableMock.name );

			expect( ui.getEditableElement( editableMock.name ) ).toBeUndefined();
		} );

		it( 'should remove the element from focus tracker', () => {
			const spy = vi.spyOn( ui.focusTracker, 'remove' );

			ui.removeEditableElement( editableMock.name );

			expect( spy ).toHaveBeenCalledTimes( 1 );
			expect( spy ).toHaveBeenCalledWith( editableMock.element );
		} );

		it( 'should remove the element from the keystroke handler', () => {
			const keystrokesSpy = vi.spyOn( editor.keystrokes, 'stopListening' );

			ui.removeEditableElement( editableMock.name );

			expect( keystrokesSpy ).toHaveBeenCalledTimes( 1 );
			expect( keystrokesSpy ).toHaveBeenCalledWith( editableMock.element );
		} );

		it( 'should remove editor instance reference from the element', () => {
			expect( editableMock.element.ckeditorInstance ).not.toBeUndefined();

			ui.removeEditableElement( editableMock.name );

			expect( editableMock.element.ckeditorInstance ).toBeNull();
		} );

		it( 'should not crash if called twice for the same editable', () => {
			ui.removeEditableElement( editableMock.name );

			expect( () => {
				ui.removeEditableElement( editableMock.name );
			} ).not.toThrow();
		} );
	} );

	describe( 'getEditableElementsNames()', () => {
		it( 'should return iterable object of names', () => {
			const ui = new MyEditorUI( editor );
			const editableMock1 = { name: 'main', element: document.createElement( 'div' ) };
			const editableMock2 = { name: 'root2', element: document.createElement( 'p' ) };

			ui.setEditableElement( editableMock1.name, editableMock1.element );
			ui.setEditableElement( editableMock2.name, editableMock2.element );

			const names = ui.getEditableElementsNames();
			expect( names[ Symbol.iterator ] ).toBeInstanceOf( Function );
			expect( Array.from( names ) ).toEqual( [ 'main', 'root2' ] );
		} );

		it( 'should return empty array if no editables', () => {
			const ui = new MyEditorUI( editor );

			expect( Array.from( ui.getEditableElementsNames() ) ).toHaveLength( 0 );
		} );
	} );

	describe( 'viewportOffset', () => {
		it( 'should return offset object', () => {
			const originalGet = editor.config.get.bind( editor.config );
			const stub = vi.spyOn( editor.config, 'get' )
				.mockImplementation( key => {
					if ( key === 'ui.viewportOffset' ) {
						return { top: 200 };
					}
					return originalGet( key );
				} );

			const ui = new MyEditorUI( editor );

			expect( ui.viewportOffset ).toEqual( { top: 200, visualTop: 200 } );
			expect( stub ).toHaveBeenCalledWith( 'ui.viewportOffset' );
		} );

		it( 'should warn about deprecation', () => {
			const originalGet = editor.config.get.bind( editor.config );
			vi.spyOn( editor.config, 'get' )
				.mockImplementation( key => {
					if ( key === 'ui.viewportOffset' ) {
						return null;
					}
					if ( key === 'toolbar.viewportTopOffset' ) {
						return 200;
					}
					return originalGet( key );
				} );

			const consoleStub = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

			const ui = new MyEditorUI( editor );

			expect( ui.viewportOffset ).toEqual( { top: 200, visualTop: 200 } );
			expect( consoleStub ).toHaveBeenCalledWith( expect.stringContaining( 'editor-ui-deprecated-viewport-offset-config' ) );
		} );

		it( 'should generate viewportOffset.visualTop property when viewportOffset is set', () => {
			const ui = new MyEditorUI( editor );

			ui.viewportOffset = { top: 100, left: 20 };

			expect( ui.viewportOffset ).toEqual( { top: 100, visualTop: 100, left: 20 } );
		} );

		it( 'should not create domEmitter if visualViewport is not supported', () => {
			vi.spyOn( window, 'visualViewport', 'get' ).mockReturnValue( null );

			const ui = new MyEditorUI( editor );

			expect( ui._domEmitter ).toBeUndefined();

			expect( () => ui.destroy() ).not.toThrow();
		} );

		describe( 'on iOS', () => {
			beforeEach( () => {
				vi.spyOn( env, 'isiOS', 'get' ).mockReturnValue( true );
			} );

			it( 'should update viewportOffset.visualTop when visual viewport is scrolled', () => {
				let offsetTop = 0;

				vi.spyOn( window.visualViewport, 'offsetTop', 'get' ).mockImplementation( () => offsetTop );

				const ui = new MyEditorUI( editor );

				ui.viewportOffset = { top: 100 };

				// Fully visible top offset.
				expect( ui.viewportOffset ).toEqual( { top: 100, visualTop: 100 } );

				// Partly non-visible top offset.
				offsetTop = 30;
				window.visualViewport.dispatchEvent( new window.Event( 'scroll' ) );

				expect( ui.viewportOffset ).toEqual( { top: 100, visualTop: 70 } );

				// Top offset fully outside the visual viewport.
				offsetTop = 110;
				window.visualViewport.dispatchEvent( new window.Event( 'scroll' ) );

				expect( ui.viewportOffset ).toEqual( { top: 100, visualTop: 0 } );
			} );

			it( 'should update viewportOffset.visualTop when visual viewport is resized', () => {
				let offsetTop = 0;

				vi.spyOn( window.visualViewport, 'offsetTop', 'get' ).mockImplementation( () => offsetTop );

				const ui = new MyEditorUI( editor );

				ui.viewportOffset = { top: 100 };

				// Fully visible top offset.
				expect( ui.viewportOffset ).toEqual( { top: 100, visualTop: 100 } );

				// Partly non-visible top offset.
				offsetTop = 30;
				window.visualViewport.dispatchEvent( new window.Event( 'resize' ) );

				expect( ui.viewportOffset ).toEqual( { top: 100, visualTop: 70 } );

				// Top offset fully outside the visual viewport.
				offsetTop = 110;
				window.visualViewport.dispatchEvent( new window.Event( 'resize' ) );

				expect( ui.viewportOffset ).toEqual( { top: 100, visualTop: 0 } );
			} );
		} );

		describe( 'in Safari', () => {
			beforeEach( () => {
				vi.spyOn( env, 'isSafari', 'get' ).mockReturnValue( true );
			} );

			it( 'should not update viewportOffset.visualTop when visual viewport is scrolled', () => {
				let offsetTop = 0;

				vi.spyOn( window.visualViewport, 'offsetTop', 'get' ).mockImplementation( () => offsetTop );

				const ui = new MyEditorUI( editor );

				ui.viewportOffset = { top: 100 };

				// Fully visible top offset.
				expect( ui.viewportOffset ).toEqual( { top: 100, visualTop: 100 } );

				// Partly non-visible top offset.
				offsetTop = 30;
				window.visualViewport.dispatchEvent( new window.Event( 'scroll' ) );

				expect( ui.viewportOffset ).toEqual( { top: 100, visualTop: 70 } );

				// Top offset fully outside the visual viewport.
				offsetTop = 110;
				window.visualViewport.dispatchEvent( new window.Event( 'scroll' ) );

				expect( ui.viewportOffset ).toEqual( { top: 100, visualTop: 0 } );
			} );

			it( 'should not update viewportOffset.visualTop when visual viewport is resized', () => {
				let offsetTop = 0;

				vi.spyOn( window.visualViewport, 'offsetTop', 'get' ).mockImplementation( () => offsetTop );

				const ui = new MyEditorUI( editor );

				ui.viewportOffset = { top: 100 };

				// Fully visible top offset.
				expect( ui.viewportOffset ).toEqual( { top: 100, visualTop: 100 } );

				// Partly non-visible top offset.
				offsetTop = 30;
				window.visualViewport.dispatchEvent( new window.Event( 'resize' ) );

				expect( ui.viewportOffset ).toEqual( { top: 100, visualTop: 70 } );

				// Top offset fully outside the visual viewport.
				offsetTop = 110;
				window.visualViewport.dispatchEvent( new window.Event( 'resize' ) );

				expect( ui.viewportOffset ).toEqual( { top: 100, visualTop: 0 } );
			} );
		} );

		describe( 'in non-Safari browser', () => {
			beforeEach( () => {
				vi.spyOn( env, 'isSafari', 'get' ).mockReturnValue( false );
				vi.spyOn( env, 'isiOS', 'get' ).mockReturnValue( false );
			} );

			it( 'should not update viewportOffset.visualTop when visual viewport is scrolled', () => {
				let offsetTop = 0;

				vi.spyOn( window.visualViewport, 'offsetTop', 'get' ).mockImplementation( () => offsetTop );

				const ui = new MyEditorUI( editor );

				ui.viewportOffset = { top: 100 };

				// Fully visible top offset.
				expect( ui.viewportOffset ).toEqual( { top: 100, visualTop: 100 } );

				// Partly non-visible top offset.
				offsetTop = 30;
				window.visualViewport.dispatchEvent( new window.Event( 'scroll' ) );

				expect( ui.viewportOffset ).toEqual( { top: 100, visualTop: 100 } );

				// Top offset fully outside the visual viewport.
				offsetTop = 110;
				window.visualViewport.dispatchEvent( new window.Event( 'scroll' ) );

				expect( ui.viewportOffset ).toEqual( { top: 100, visualTop: 100 } );
			} );

			it( 'should not update viewportOffset.visualTop when visual viewport is resized', () => {
				let offsetTop = 0;

				vi.spyOn( window.visualViewport, 'offsetTop', 'get' ).mockImplementation( () => offsetTop );

				const ui = new MyEditorUI( editor );

				ui.viewportOffset = { top: 100 };

				// Fully visible top offset.
				expect( ui.viewportOffset ).toEqual( { top: 100, visualTop: 100 } );

				// Partly non-visible top offset.
				offsetTop = 30;
				window.visualViewport.dispatchEvent( new window.Event( 'resize' ) );

				expect( ui.viewportOffset ).toEqual( { top: 100, visualTop: 100 } );

				// Top offset fully outside the visual viewport.
				offsetTop = 110;
				window.visualViewport.dispatchEvent( new window.Event( 'resize' ) );

				expect( ui.viewportOffset ).toEqual( { top: 100, visualTop: 100 } );
			} );
		} );
	} );

	describe( 'extendMenuBar()', () => {
		it( 'should add element to array', () => {
			const ui = new MyEditorUI( editor );

			expect( ui._extraMenuBarElements ).toHaveLength( 0 );

			ui.extendMenuBar( {
				item: 'foo',
				position: 'after:bar'
			} );

			expect( ui._extraMenuBarElements ).toHaveLength( 1 );

			ui.extendMenuBar( {
				item: 'foo2',
				position: 'after:bar'
			} );

			expect( ui._extraMenuBarElements ).toHaveLength( 2 );
		} );
	} );

	describe( 'View#scrollToTheSelection integration', () => {
		it( 'should listen to View#scrollToTheSelection and inject the offset values into the event', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicTestEditor.create( editorElement, {
				ui: {
					viewportOffset: {
						top: 10,
						bottom: 20,
						left: 30,
						right: 40
					}
				}
			} );

			editor.editing.view.on( 'scrollToTheSelection', ( evt, data ) => {
				const range = editor.editing.view.document.selection.getFirstRange();

				expect( data ).toEqual( {
					target: editor.editing.view.domConverter.viewRangeToDom( range ),
					viewportOffset: {
						top: 110,
						bottom: 120,
						left: 130,
						right: 140
					},
					ancestorOffset: 20,
					alignToTop: undefined,
					forceScroll: undefined
				} );
			} );

			editor.editing.view.scrollToTheSelection( { viewportOffset: 100 } );

			editorElement.remove();
			await editor.destroy();
		} );

		it( 'should listen to View#scrollToTheSelection and inject the offset values into the event as they change', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicTestEditor.create( editorElement, {
				ui: {
					viewportOffset: {
						top: 10,
						bottom: 20,
						left: 30,
						right: 40
					}
				}
			} );

			editor.editing.view.on( 'scrollToTheSelection', ( evt, data ) => {
				const range = editor.editing.view.document.selection.getFirstRange();

				expect( data ).toEqual( {
					target: editor.editing.view.domConverter.viewRangeToDom( range ),
					viewportOffset: {
						top: 300,
						bottom: 120,
						left: 130,
						right: 140
					},
					ancestorOffset: 20,
					alignToTop: undefined,
					forceScroll: undefined
				} );
			} );

			editor.ui.viewportOffset.top = 200;
			editor.editing.view.scrollToTheSelection( { viewportOffset: 100 } );

			editorElement.remove();
			await editor.destroy();
		} );
	} );

	describe( 'Focus handling and navigation between editable areas and editor toolbars', () => {
		describe( 'toolbar', () => {
			describe( 'addToolbar()', () => {
				let locale, toolbar;

				beforeEach( () => {
					ui = new MyEditorUI( editor );
					locale = { t: val => val };
					toolbar = new ToolbarView( locale );
				} );

				describe( 'for a ToolbarView that has already been rendered', () => {
					it( 'adds ToolbarView to the EditorUI#focusTracker', () => {
						const spy = vi.spyOn( ui.focusTracker, 'add' );
						toolbar.render();

						ui.addToolbar( toolbar );

						expect( spy ).toHaveBeenCalledTimes( 1 );
						expect( spy ).toHaveBeenCalledWith( toolbar );
					} );

					it( 'adds ToolbarView#element to Editor#keystokeHandler', () => {
						const spy = vi.spyOn( editor.keystrokes, 'listenTo' );
						toolbar.render();

						ui.addToolbar( toolbar );

						expect( spy ).toHaveBeenCalledTimes( 1 );
					} );
				} );

				describe( 'for a toolbar that has not been yet rendered', () => {
					it( 'delayes changes to EditorUI#focusTracker and Editor#keystokeHandler until the toolbar gets rendered', async () => {
						const spy = vi.spyOn( editor.keystrokes, 'listenTo' );
						const spy2 = vi.spyOn( ui.focusTracker, 'add' );

						ui.addToolbar( toolbar );

						await new Promise( resolve => {
							toolbar.once( 'render', () => {
								expect( spy ).toHaveBeenCalledTimes( 1 );
								expect( spy2 ).toHaveBeenCalledTimes( 1 );
								expect( spy2 ).toHaveBeenCalledWith( toolbar );

								resolve();
							} );

							toolbar.render();
						} );
					} );
				} );

				it( 'adds toolbar to the `_focusableToolbarDefinitions` array', () => {
					ui.addToolbar( toolbar );

					expect( ui._focusableToolbarDefinitions.length ).toBe( 1 );
				} );

				it( 'adds toolbar to the `_focusableToolbarDefinitions` array with passed options', () => {
					ui.addToolbar( toolbar, { isContextual: true } );

					expect( ui._focusableToolbarDefinitions.length ).toBe( 1 );
					expect( ui._focusableToolbarDefinitions[ 0 ].options ).not.toBeUndefined();
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

					visibleSpy = vi.spyOn( visibleToolbar, 'focus' );
					visibleContextualSpy = vi.spyOn( visibleContextualToolbar, 'focus' );
					invisibleSpy = vi.spyOn( invisibleToolbar, 'focus' );
					toolbarWithSetupAndCleanupSpy = vi.spyOn( toolbarWithSetupAndCleanup, 'focus' );
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

					expect( visibleContextualSpy ).not.toHaveBeenCalled();
					expect( toolbarWithSetupAndCleanupSpy ).not.toHaveBeenCalled();
					expect( invisibleSpy ).not.toHaveBeenCalled();
				} );

				it( 'should do nothing if no toolbars were registered', async () => {
					const editor = new Editor();
					const ui = editor.ui = new MyEditorUI( editor );
					const editingArea = document.createElement( 'div' );
					document.body.appendChild( editingArea );

					ui.setEditableElement( 'main', editingArea );
					ui.fire( 'ready' );

					expect( () => {
						pressAltF10( editor );
					} ).not.toThrow();

					editingArea.remove();

					editor.fire( 'ready' );
					ui.destroy();
					await editor.destroy();
				} );

				it( 'should do nothing if the toolbar is already focused and there is nowhere else for the focus to go ' +
					'(a toolbar without beforeFocus() / afterBlur())',
				() => {
					visibleToolbar.element.remove();
					toolbarWithSetupAndCleanup.element.style.display = 'none';

					pressAltF10();
					ui.focusTracker.focusedElement = visibleContextualToolbar.element;

					expect( visibleContextualSpy ).toHaveBeenCalledTimes( 1 );

					pressAltF10();
					expect( visibleContextualSpy ).toHaveBeenCalledTimes( 1 );
					expect( visibleSpy ).not.toHaveBeenCalled();
					expect( toolbarWithSetupAndCleanupSpy ).not.toHaveBeenCalled();
					expect( invisibleSpy ).not.toHaveBeenCalled();

					expect( visibleContextualToolbar.element.parentNode ).toBe( document.body );
				} );

				it( 'should do nothing if the toolbar is already focused and there is nowhere else for the focus to go ' +
					'(a toolbar with beforeFocus() / afterBlur())',
				() => {
					visibleToolbar.element.remove();
					visibleContextualToolbar.element.style.display = 'none';

					pressAltF10();
					ui.focusTracker.focusedElement = toolbarWithSetupAndCleanup.element;

					expect( toolbarWithSetupAndCleanupSpy ).toHaveBeenCalledTimes( 1 );

					pressAltF10();
					expect( toolbarWithSetupAndCleanupSpy ).toHaveBeenCalledTimes( 1 );
					expect( visibleSpy ).not.toHaveBeenCalled();
					expect( visibleContextualSpy ).not.toHaveBeenCalled();
					expect( invisibleSpy ).not.toHaveBeenCalled();

					expect( toolbarWithSetupAndCleanup.element.parentNode ).toBe( document.body );
				} );

				it( 'should focus the first focusable toolbar (and pick the contextual one first)', () => {
					pressAltF10();

					expect( visibleContextualSpy ).toHaveBeenCalledTimes( 1 );
					expect( visibleSpy ).not.toHaveBeenCalled();
					expect( invisibleSpy ).not.toHaveBeenCalled();
				} );

				it( 'should focus the next focusable toolbar', () => {
					pressAltF10();
					ui.focusTracker.focusedElement = visibleContextualToolbar.element;

					pressAltF10();
					ui.focusTracker.focusedElement = visibleToolbar.element;

					expect( visibleContextualSpy ).toHaveBeenCalled();
					expect( visibleSpy ).toHaveBeenCalled();
					expect( visibleContextualSpy.mock.invocationCallOrder[ 0 ] ).toBeLessThan( visibleSpy.mock.invocationCallOrder[ 0 ] );
					expect( invisibleSpy ).not.toHaveBeenCalled();
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

					expect( visibleContextualSpy ).toHaveBeenCalledTimes( 2 );
					expect( visibleSpy ).toHaveBeenCalledTimes( 1 );
					expect( toolbarWithSetupAndCleanupSpy ).toHaveBeenCalledTimes( 1 );
					expect( visibleContextualSpy.mock.invocationCallOrder[ 0 ] )
						.toBeLessThan( visibleSpy.mock.invocationCallOrder[ 0 ] );
					expect( visibleSpy.mock.invocationCallOrder[ 0 ] )
						.toBeLessThan( toolbarWithSetupAndCleanupSpy.mock.invocationCallOrder[ 0 ] );
					expect( toolbarWithSetupAndCleanupSpy.mock.invocationCallOrder[ 0 ] )
						.toBeLessThan( visibleContextualSpy.mock.invocationCallOrder[ 1 ] );
					expect( invisibleSpy ).not.toHaveBeenCalled();
				} );

				it( 'should avoid race betwen toolbars with beforeFocus()/afterBlur()', () => {
					const secondToolbarWithSetupAndCleanup = new ToolbarView( locale );
					secondToolbarWithSetupAndCleanup.ariaLabel = 'second with before focus';
					secondToolbarWithSetupAndCleanup.render();

					visibleToolbar.element.style.display = 'none';

					const secondToolbarWithSetupAndCleanupSpy = vi.spyOn( secondToolbarWithSetupAndCleanup, 'focus' );

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

					expect( visibleContextualSpy ).toHaveBeenCalledTimes( 2 );
					expect( toolbarWithSetupAndCleanupSpy ).toHaveBeenCalledTimes( 2 );
					expect( secondToolbarWithSetupAndCleanupSpy ).toHaveBeenCalledTimes( 1 );

					expect( visibleContextualSpy.mock.invocationCallOrder[ 0 ] )
						.toBeLessThan( toolbarWithSetupAndCleanupSpy.mock.invocationCallOrder[ 0 ] );
					expect( toolbarWithSetupAndCleanupSpy.mock.invocationCallOrder[ 0 ] )
						.toBeLessThan( secondToolbarWithSetupAndCleanupSpy.mock.invocationCallOrder[ 0 ] );
					expect( secondToolbarWithSetupAndCleanupSpy.mock.invocationCallOrder[ 0 ] )
						.toBeLessThan( visibleContextualSpy.mock.invocationCallOrder[ 1 ] );
					expect( visibleContextualSpy.mock.invocationCallOrder[ 1 ] )
						.toBeLessThan( toolbarWithSetupAndCleanupSpy.mock.invocationCallOrder[ 1 ] );

					expect( invisibleSpy ).not.toHaveBeenCalled();

					// ----------------------------------------

					secondToolbarWithSetupAndCleanup.element.remove();
				} );

				// https://github.com/ckeditor/ckeditor5/issues/12339
				it( 'should work if the focus was already in the toolbar (e.g. a user clicked an item)', () => {
					ui.focusTracker.focusedElement = visibleContextualToolbar.element;

					pressAltF10();
					ui.focusTracker.focusedElement = visibleToolbar.element;

					expect( visibleSpy ).toHaveBeenCalledTimes( 1 );
					expect( visibleContextualSpy ).not.toHaveBeenCalled();
				} );
			} );

			describe( 'Restoring focus on Esc key press', () => {
				let locale, visibleToolbarA, visibleToolbarB, editingAreaA, editingAreaB, nonEngineEditingArea, invisibleEditingArea;
				let visibleMenuBar, editingFocusSpy, editingAreaASpy, editingAreaBSpy, nonEngineEditingAreaSpy, invisibleEditingAreaSpy;

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

					visibleMenuBar = new MenuBarView( locale );
					visibleMenuBar.ariaLabel = 'menu bar';
					visibleMenuBar.render();
					document.body.appendChild( visibleMenuBar.element );

					ui.addToolbar( visibleToolbarA );
					ui.addToolbar( visibleToolbarB );
					ui.initMenuBar( visibleMenuBar );

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

					editingFocusSpy = vi.spyOn( editor.editing.view, 'focus' );
					editingAreaASpy = vi.spyOn( editingAreaA, 'focus' );
					editingAreaBSpy = vi.spyOn( editingAreaB, 'focus' );
					nonEngineEditingAreaSpy = vi.spyOn( nonEngineEditingArea, 'focus' );
					invisibleEditingAreaSpy = vi.spyOn( invisibleEditingArea, 'focus' );
				} );

				afterEach( () => {
					visibleToolbarA.element.remove();
					visibleToolbarB.element.remove();
					visibleMenuBar.element.remove();

					editingAreaA.remove();
					editingAreaB.remove();
					nonEngineEditingArea.remove();
					invisibleEditingArea.remove();

					visibleToolbarA.destroy();
					visibleToolbarB.destroy();
					visibleMenuBar.destroy();
				} );

				it( 'should do nothing if no toolbar is focused', () => {
					expect( () => {
						pressEsc();
					} ).not.toThrow();
				} );

				it( 'should return focus back to the editing view if it came from there', () => {
					// Catches the `There is no selection in any editable to focus.` warning.
					vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

					ui.focusTracker.focusedElement = editor.editing.view.getDomRoot();

					pressAltF10();
					ui.focusTracker.focusedElement = visibleToolbarA.element;

					pressEsc();

					expect( editingFocusSpy ).toHaveBeenCalledTimes( 1 );
					expect( editingAreaASpy ).not.toHaveBeenCalled();
					expect( editingAreaBSpy ).not.toHaveBeenCalled();
					expect( nonEngineEditingAreaSpy ).not.toHaveBeenCalled();
					expect( invisibleEditingAreaSpy ).not.toHaveBeenCalled();
				} );

				it( 'should return focus back from menu bar to the editing view if it came from there', () => {
					// Catches the `There is no selection in any editable to focus.` warning.
					vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

					ui.focusTracker.focusedElement = editor.editing.view.getDomRoot();

					pressAltF9();
					ui.focusTracker.focusedElement = visibleMenuBar.element;

					pressEsc();

					expect( editingFocusSpy ).toHaveBeenCalledTimes( 1 );
					expect( editingAreaASpy ).not.toHaveBeenCalled();
					expect( editingAreaBSpy ).not.toHaveBeenCalled();
					expect( nonEngineEditingAreaSpy ).not.toHaveBeenCalled();
					expect( invisibleEditingAreaSpy ).not.toHaveBeenCalled();
				} );

				it( 'should return focus back to the last focused editing area that does not belong to the editing view', () => {
					ui.focusTracker.focusedElement = nonEngineEditingArea;

					pressAltF10();
					ui.focusTracker.focusedElement = visibleToolbarA.element;

					pressEsc();

					expect( nonEngineEditingAreaSpy ).toHaveBeenCalledTimes( 1 );
					expect( editingAreaASpy ).not.toHaveBeenCalled();
					expect( editingAreaBSpy ).not.toHaveBeenCalled();
					expect( invisibleEditingAreaSpy ).not.toHaveBeenCalled();
				} );

				it( 'should return focus back from menu bar to the last focused editing area' +
					'that does not belong to the editing view', () => {
					ui.focusTracker.focusedElement = nonEngineEditingArea;

					pressAltF9();
					ui.focusTracker.focusedElement = visibleMenuBar.element;

					pressEsc();

					expect( nonEngineEditingAreaSpy ).toHaveBeenCalledTimes( 1 );
					expect( editingAreaASpy ).not.toHaveBeenCalled();
					expect( editingAreaBSpy ).not.toHaveBeenCalled();
					expect( invisibleEditingAreaSpy ).not.toHaveBeenCalled();
				} );

				it( 'should return focus back to the last focused editing area after navigating across multiple toolbars', () => {
					// Catches the `There is no selection in any editable to focus.` warning.
					vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

					ui.focusTracker.focusedElement = editingAreaB;

					pressAltF10();
					ui.focusTracker.focusedElement = visibleToolbarA.element;

					pressAltF10();
					ui.focusTracker.focusedElement = visibleToolbarB.element;

					pressEsc();

					expect( editingFocusSpy ).toHaveBeenCalledTimes( 1 );
					expect( editingAreaBSpy ).not.toHaveBeenCalled();
					expect( editingAreaASpy ).not.toHaveBeenCalled();
					expect( nonEngineEditingAreaSpy ).not.toHaveBeenCalled();
					expect( invisibleEditingAreaSpy ).not.toHaveBeenCalled();
				} );

				it( 'should return focus back to the last focused editing area after navigating across toolbar and menu bar', () => {
					// Catches the `There is no selection in any editable to focus.` warning.
					vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

					ui.focusTracker.focusedElement = editingAreaB;

					pressAltF10();
					ui.focusTracker.focusedElement = visibleToolbarA.element;

					pressAltF9();
					ui.focusTracker.focusedElement = visibleMenuBar.element;

					pressEsc();

					expect( editingFocusSpy ).toHaveBeenCalledTimes( 1 );
					expect( editingAreaBSpy ).not.toHaveBeenCalled();
					expect( editingAreaASpy ).not.toHaveBeenCalled();
					expect( nonEngineEditingAreaSpy ).not.toHaveBeenCalled();
					expect( invisibleEditingAreaSpy ).not.toHaveBeenCalled();
				} );

				it( 'should return focus back to the last focused editing area after navigating across menu bar and toolbar', () => {
					// Catches the `There is no selection in any editable to focus.` warning.
					vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

					ui.focusTracker.focusedElement = editingAreaB;

					pressAltF9();
					ui.focusTracker.focusedElement = visibleMenuBar.element;

					pressAltF10();
					ui.focusTracker.focusedElement = visibleToolbarA.element;

					pressEsc();

					expect( editingFocusSpy ).toHaveBeenCalledTimes( 1 );
					expect( editingAreaBSpy ).not.toHaveBeenCalled();
					expect( editingAreaASpy ).not.toHaveBeenCalled();
					expect( nonEngineEditingAreaSpy ).not.toHaveBeenCalled();
					expect( invisibleEditingAreaSpy ).not.toHaveBeenCalled();
				} );

				it( 'should focus the first editing area if the focus went straight to the toolbar' +
					'without focusing any editing areas', () => {
					// Catches the `There is no selection in any editable to focus.` warning.
					vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

					ui.focusTracker.focusedElement = visibleToolbarA.element;

					pressEsc();

					expect( editingFocusSpy ).toHaveBeenCalledTimes( 1 );
					expect( editingAreaASpy ).not.toHaveBeenCalled();
					expect( editingAreaBSpy ).not.toHaveBeenCalled();
					expect( nonEngineEditingAreaSpy ).not.toHaveBeenCalled();
					expect( invisibleEditingAreaSpy ).not.toHaveBeenCalled();
				} );

				it( 'should focus the first editing area if the focus went straight to the menu bar' +
					'without focusing any editing areas', () => {
					// Catches the `There is no selection in any editable to focus.` warning.
					vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

					ui.focusTracker.focusedElement = visibleMenuBar.element;

					pressEsc();

					expect( editingFocusSpy ).toHaveBeenCalledTimes( 1 );
					expect( editingAreaASpy ).not.toHaveBeenCalled();
					expect( editingAreaBSpy ).not.toHaveBeenCalled();
					expect( nonEngineEditingAreaSpy ).not.toHaveBeenCalled();
					expect( invisibleEditingAreaSpy ).not.toHaveBeenCalled();
				} );

				it( 'should clean up after a focused toolbar that had afterBlur() defined in options', () => {
					// Catches the `There is no selection in any editable to focus.` warning.
					vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

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
					expect( editingFocusSpy ).toHaveBeenCalledTimes( 1 );
					expect( editingAreaASpy ).not.toHaveBeenCalled();
					expect( editingAreaBSpy ).not.toHaveBeenCalled();
					expect( nonEngineEditingAreaSpy ).not.toHaveBeenCalled();
					expect( invisibleEditingAreaSpy ).not.toHaveBeenCalled();
				} );
			} );
		} );

		describe( 'menu bar', () => {
			let editorElement, menuBarView, menuBarEditor, menuBarEditorUI, domRoot;

			beforeEach( async () => {
				editorElement = document.body.appendChild( document.createElement( 'div' ) );

				await MenuBarTestEditor.create( editorElement ).then( editor => {
					menuBarEditor = editor;
					menuBarEditorUI = menuBarEditor.ui;
					menuBarView = menuBarEditorUI.view.menuBarView;

					document.body.appendChild( menuBarView.element );
				} );

				domRoot = menuBarEditor.editing.view.domRoots.get( 'main' );
			} );

			afterEach( () => {
				editorElement.remove();
				menuBarEditorUI.destroy();
				menuBarView.element.remove();
			} );

			describe( 'Focusing menu bar on Alt+F9 key press', () => {
				beforeEach( () => {
					menuBarEditorUI.focusTracker.isFocused = true;
					menuBarEditorUI.focusTracker.focusedElement = domRoot;
				} );

				it( 'should enable focus border once focused using keyboard', () => {
					expect( menuBarView.isFocusBorderEnabled ).toBe( false );
					pressAltF9( menuBarEditor );
					expect( menuBarView.isFocusBorderEnabled ).toBe( true );
				} );

				it( 'should focus the menu bar when the focus is in the editing root', () => {
					const spy = vi.spyOn( menuBarView, 'focus' );

					pressAltF9( menuBarEditor );

					expect( spy ).toHaveBeenCalledTimes( 1 );
				} );

				it( 'should do nothing if the menu bar is already focused', () => {
					const domRootFocusSpy = vi.spyOn( domRoot, 'focus' );
					const menuBarFocusSpy = vi.spyOn( menuBarView, 'focus' );

					// Focus the toolbar.
					pressAltF9( menuBarEditor );
					menuBarEditorUI.focusTracker.focusedElement = menuBarView.element;

					// Try Alt+F9 again.
					pressAltF9( menuBarEditor );

					expect( menuBarFocusSpy ).toHaveBeenCalledTimes( 1 );
					expect( domRootFocusSpy ).not.toHaveBeenCalled();
				} );
			} );

			describe( 'Restoring focus on Esc key press', () => {
				beforeEach( () => {
					menuBarEditorUI.focusTracker.isFocused = true;
					menuBarEditorUI.focusTracker.focusedElement = domRoot;
				} );

				it( 'should move the focus back from the main toolbar to the editing root', () => {
					const domRootFocusSpy = vi.spyOn( domRoot, 'focus' );
					const menuBarFocusSpy = vi.spyOn( menuBarView, 'focus' );

					// Focus the menu bar.
					pressAltF9( menuBarEditor );
					menuBarEditorUI.focusTracker.focusedElement = menuBarView.element;

					pressEsc( menuBarEditor );

					// sinon.assert.calledOnce( domRootFocusSpy );
					expect( menuBarFocusSpy.mock.invocationCallOrder[ 0 ] )
						.toBeLessThan( domRootFocusSpy.mock.invocationCallOrder[ 0 ] );
				} );

				it( 'should do nothing if it was pressed when menu bar was not focused', () => {
					const domRootFocusSpy = vi.spyOn( domRoot, 'focus' );
					const menuBarFocusSpy = vi.spyOn( menuBarView, 'focus' );

					pressEsc( menuBarEditor );

					expect( domRootFocusSpy ).not.toHaveBeenCalled();
					expect( menuBarFocusSpy ).not.toHaveBeenCalled();
				} );
			} );

			class MenuBarTestEditor extends ClassicTestEditor {
				constructor( sourceElementOrData, config ) {
					super( sourceElementOrData, config );

					const menuBarEditorUIView = new MenuBarEditorUIView( this.locale, this.editing.view, sourceElementOrData );
					this.ui = new MenuBarEditorUI( this, menuBarEditorUIView );
				}
			}

			class MenuBarEditorUI extends ClassicTestEditorUI {
				init() {
					super.init();

					this.initMenuBar( this.view.menuBarView );
				}
			}

			class MenuBarEditorUIView extends EditorUIView {
				constructor(
					locale,
					editingView,
					editableElement
				) {
					super( locale );

					this.menuBarView = new MenuBarView( locale );
					this.main = this.createCollection();
					this.editable = new InlineEditableUIView( locale, editingView, editableElement );

					this.menuBarView.extendTemplate( {
						attributes: {
							class: [
								'ck-reset_all',
								'ck-rounded-corners'
							],
							dir: locale.uiLanguageDirection
						}
					} );
				}

				render() {
					super.render();

					this.registerChild( this.menuBarView );
					this.registerChild( this.editable );
				}
			}
		} );

		function pressAltF9( specificEditor ) {
			( specificEditor || editor ).keystrokes.press( {
				keyCode: keyCodes.f9,
				altKey: true,
				preventDefault: vi.fn(),
				stopPropagation: vi.fn()
			} );
		}

		function pressAltF10( specificEditor ) {
			( specificEditor || editor ).keystrokes.press( {
				keyCode: keyCodes.f10,
				altKey: true,
				preventDefault: vi.fn(),
				stopPropagation: vi.fn()
			} );
		}

		function pressEsc( specificEditor ) {
			( specificEditor || editor ).keystrokes.press( {
				keyCode: keyCodes.esc,
				preventDefault: vi.fn(),
				stopPropagation: vi.fn()
			} );
		}
	} );

	describe( 'bind body collection with editor focus tracker', () => {
		it( 'on ready event add views elements inside body collection to focus tracker', () => {
			const view = new View();
			view.setTemplate( { tag: 'div' } );

			ui.view.body.add( view );

			vi.spyOn( ui.focusTracker, 'add' );

			ui.fire( 'ready' );

			expect( view.element ).not.toBeUndefined();
			expect( ui.focusTracker.add ).toHaveBeenCalledWith( view.element );
		} );

		it( 'after body event, add and remove views elements as they are added', () => {
			const view = new View();
			view.setTemplate( { tag: 'div' } );

			ui.fire( 'ready' );

			vi.spyOn( ui.focusTracker, 'add' );
			vi.spyOn( ui.focusTracker, 'remove' );

			ui.view.body.add( view );

			expect( view.element ).not.toBeUndefined();
			expect( ui.focusTracker.add ).toHaveBeenCalledWith( view.element );

			ui.view.body.remove( view );

			expect( ui.focusTracker.remove ).toHaveBeenCalledWith( view.element );
		} );
	} );
} );
