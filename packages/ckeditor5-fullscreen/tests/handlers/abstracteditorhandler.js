/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { global, Rect } from '@ckeditor/ckeditor5-utils';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { BalloonEditor } from '@ckeditor/ckeditor5-editor-balloon';
import { View, Dialog, DialogViewPosition, ContextualBalloon, BalloonPanelView } from '@ckeditor/ckeditor5-ui';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { Plugin } from '@ckeditor/ckeditor5-core';

import { RevisionHistoryMock } from '../_utils/revisionhistorymock.js';
import { FullscreenAbstractEditorHandler } from '../../src/handlers/abstracteditorhandler.js';
import { Fullscreen } from '../../src/fullscreen.js';

describe( 'AbstractHandler', () => {
	let abstractHandler, domElement, editor;

	beforeEach( async () => {
		domElement = global.document.createElement( 'div' );
		global.document.body.appendChild( domElement );

		editor = await ClassicEditor.create( domElement, {
			plugins: [
				Paragraph,
				Essentials,
				Fullscreen
			]
		} );

		abstractHandler = new FullscreenAbstractEditorHandler( editor );
	} );

	afterEach( () => {
		domElement.remove();
		abstractHandler.disable();

		return editor.destroy();
	} );

	describe( 'constructor', () => {
		it( 'should create element maps', () => {
			expect( abstractHandler._placeholderMap ).toBeInstanceOf( Map );
		} );

		it( 'should set the editor instance as a property', () => {
			expect( abstractHandler._editor ).toBe( editor );
		} );

		it( 'should setup listener destroying moved elements when editor is destroyed and fullscreen is enabled', async () => {
			const spy = vi.spyOn( abstractHandler, 'destroy' );

			abstractHandler.enable();

			await editor.destroy();

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( '#moveToFullscreen()', () => {
		it( 'should replace an element with given placeholder', () => {
			const element = global.document.createElement( 'div' );

			element.id = 'element';
			global.document.body.appendChild( element );

			abstractHandler.moveToFullscreen( element, 'editable' );

			expect( abstractHandler.getWrapper().querySelector( '#element' ) ).toBe( element );

			abstractHandler.disable();
			element.remove();
		} );
	} );

	describe( '#restoreMovedElementLocation()', () => {
		it( 'should not throw if map does not contain requested element', () => {
			expect( abstractHandler._placeholderMap.has( 'menu-bar' ) ).toBe( false );
			expect( () => abstractHandler.restoreMovedElementLocation( 'menu-bar' ) ).not.toThrow();
		} );

		it( 'should return only target moved element', () => {
			const element = global.document.createElement( 'div' );
			const element2 = global.document.createElement( 'div' );

			global.document.body.appendChild( element );
			global.document.body.appendChild( element2 );

			abstractHandler.moveToFullscreen( element, 'menu-bar' );
			abstractHandler.moveToFullscreen( element2, 'editable' );

			// Move `menu-bar` back.
			abstractHandler.restoreMovedElementLocation( 'menu-bar' );

			expect( abstractHandler._placeholderMap.size ).toBe( 1 );
			expect( global.document.querySelector( '[data-ck-fullscreen-placeholder="menu-bar"' ) ).toBeNull();
			expect( global.document.querySelector( '[data-ck-fullscreen-placeholder="editable"' ) ).not.toBeNull();

			abstractHandler.restoreMovedElementLocation( 'editable' );
			element.remove();
			element2.remove();
		} );

		it( 'should destroy the wrapper if there are no other elements left', () => {
			const element = global.document.createElement( 'div' );

			global.document.body.appendChild( element );

			abstractHandler.moveToFullscreen( element, 'menu-bar' );
			abstractHandler.restoreMovedElementLocation( 'menu-bar' );

			expect( abstractHandler._wrapper ).toBeNull();

			element.remove();
		} );
	} );

	describe( '#getWrapper()', () => {
		it( 'should create a wrapper if it does not exist', () => {
			expect( global.document.querySelector( '.ck-fullscreen__main-wrapper' ) ).toBeNull();

			const wrapper = abstractHandler.getWrapper();

			expect( wrapper.innerHTML ).toBe( `
				<div class="ck ck-fullscreen__top-wrapper ck-reset_all">
					<div class="ck ck-fullscreen__menu-bar" data-ck-fullscreen="menu-bar"></div>
					<div class="ck ck-fullscreen__toolbar" data-ck-fullscreen="toolbar"></div>
				</div>
				<div class="ck ck-fullscreen__editable-wrapper">
					<div class="ck ck-fullscreen__sidebar ck-fullscreen__left-sidebar" data-ck-fullscreen="left-sidebar"></div>
					<div class="ck ck-fullscreen__editable" data-ck-fullscreen="editable">
						<div class="ck ck-fullscreen__pagination-view" data-ck-fullscreen="pagination-view"></div>
					</div>
					<div class="ck ck-fullscreen__sidebar ck-fullscreen__right-sidebar" data-ck-fullscreen="right-sidebar"></div>
					<div class="ck ck-fullscreen__right-edge" data-ck-fullscreen="right-edge"></div>
				</div>
				<div class="ck ck-fullscreen__bottom-wrapper">
					<div class="ck ck-fullscreen__body-wrapper" data-ck-fullscreen="body-wrapper"></div>
				</div>
			` );

			wrapper.remove();
		} );

		it( 'should return a wrapper if it already exists', () => {
			const wrapper = abstractHandler.getWrapper();

			wrapper.classList.add( 'custom' );

			expect( abstractHandler.getWrapper().classList.contains( 'custom' ) ).toBe( true );

			wrapper.remove();
		} );

		it( 'should append the wrapper to the body by default', () => {
			const wrapper = abstractHandler.getWrapper();

			expect( wrapper.parentElement ).toBe( global.document.body );

			wrapper.remove();
		} );

		it( 'should append the wrapper to the custom container if configured', () => {
			const customContainer = global.document.createElement( 'div' );

			global.document.body.appendChild( customContainer );

			editor.config.set( 'fullscreen.container', customContainer );

			const wrapper = abstractHandler.getWrapper();

			expect( wrapper.parentElement ).toBe( customContainer );

			wrapper.remove();
			customContainer.remove();
		} );
	} );

	describe( '#enable()', () => {
		it( 'should execute the #defaultOnEnter method', () => {
			const spy = vi.spyOn( abstractHandler, 'defaultOnEnter' );

			abstractHandler.enable();

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should create a collapse left sidebar button if flag is set', () => {
			abstractHandler._hasLeftCollapseButton = true;
			abstractHandler.enable();

			expect( abstractHandler._collapseLeftSidebarButton ).not.toBeNull();
		} );

		it( 'should execute the custom callback if configured', () => {
			const spy = vi.fn();

			editor.config.set( 'fullscreen.onEnterCallback', spy );

			abstractHandler.enable();

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should keep document scrollable if a custom fullscreen container is configured', () => {
			const customContainer = global.document.createElement( 'div' );
			global.document.body.appendChild( customContainer );

			editor.config.set( 'fullscreen.container', customContainer );

			abstractHandler.enable();

			expect( global.document.body.classList.contains( 'ck-fullscreen' ) ).toBe( false );
			expect( global.document.body.parentElement.classList.contains( 'ck-fullscreen' ) ).toBe( false );

			abstractHandler.disable();
			customContainer.remove();
		} );

		it( 'should register a getPositionOptions correction that adjusts viewport offset by top bar height', async () => {
			const tempDomElement = global.document.createElement( 'div' );
			global.document.body.appendChild( tempDomElement );

			const tempEditor = await ClassicEditor.create( {
				attachTo: tempDomElement,
				plugins: [ Paragraph, Essentials, Fullscreen, ContextualBalloon ]
			} );

			const contextualBalloon = tempEditor.plugins.get( 'ContextualBalloon' );
			let capturedListener;

			const originalOn = contextualBalloon.on.bind( contextualBalloon );

			vi.spyOn( contextualBalloon, 'on' ).mockImplementation( ( eventName, listener, opts ) => {
				if ( eventName === 'getPositionOptions' ) {
					capturedListener = listener;
				}

				return originalOn( eventName, listener, opts );
			} );

			const tempHandler = new FullscreenAbstractEditorHandler( tempEditor );

			tempHandler.enable();

			// Mock the toolbar slot height so the listener has something to add.
			const toolbarSlot = tempHandler.getWrapper().querySelector( '[data-ck-fullscreen="toolbar"]' );

			vi.spyOn( toolbarSlot, 'getBoundingClientRect' ).mockReturnValue(
				{ height: 50, width: 800, top: 0, bottom: 50, left: 0, right: 800, x: 0, y: 0, toJSON: () => {} }
			);

			const mockEvt = {
				return: {
					positions: [ BalloonPanelView.defaultPositions.viewportStickyNorth ],
					viewportOffsetConfig: { top: 0 }
				}
			};

			capturedListener( mockEvt );

			expect( mockEvt.return.viewportOffsetConfig.top ).toBe( 50 );

			tempHandler.disable();
			tempDomElement.remove();

			return tempEditor.destroy();
		} );
	} );

	describe( '#disable()', () => {
		it( 'should execute the custom callback if configured', () => {
			const spy = vi.fn();

			editor.config.set( 'fullscreen.onLeaveCallback', spy );

			abstractHandler.disable();

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should return all moved elements and destroy the placeholders', () => {
			const element = global.document.createElement( 'div' );
			const element2 = global.document.createElement( 'div' );

			element.id = 'element';
			element2.id = 'element2';
			global.document.body.appendChild( element );
			global.document.body.appendChild( element2 );

			abstractHandler.moveToFullscreen( element, 'menu-bar' );
			abstractHandler.moveToFullscreen( element2, 'editable' );

			expect(
				abstractHandler._placeholderMap.has( 'menu-bar' )
			).toBe( true );
			expect(
				abstractHandler._placeholderMap.has( 'editable' )
			).toBe( true );
			expect( abstractHandler._placeholderMap.size ).toBe( 2 );

			abstractHandler.disable();

			expect( abstractHandler._placeholderMap.size ).toBe( 0 );
			expect( global.document.querySelector( '[data-ck-fullscreen-placeholder="menu-bar"' ) ).toBeNull();
			expect( global.document.querySelector( '[data-ck-fullscreen-placeholder="editable"' ) ).toBeNull();

			element.remove();
			element2.remove();
		} );

		it( 'should destroy the wrapper if it was created', () => {
			const wrapper = abstractHandler.getWrapper();

			abstractHandler.disable();

			expect( abstractHandler._wrapper ).toBeNull();
			expect( wrapper.parentElement ).toBeNull();
		} );

		it( 'should not throw if there is no wrapper', () => {
			expect( () => abstractHandler.disable() ).not.toThrow();
		} );

		it( 'should not require editor toolbar or dialog plugin', async () => {
			const tempDomElement = global.document.createElement( 'div' );
			global.document.body.appendChild( tempDomElement );

			const tempEditor = await BalloonEditor.create( tempDomElement, {
				plugins: [
					Paragraph
				]
			} );
			const tempAbstractHandler = new FullscreenAbstractEditorHandler( tempEditor );

			expect( tempEditor.ui.view.toolbar ).toBeUndefined();
			expect( tempEditor.plugins.has( 'Dialog' ) ).toBe( false );
			expect( () => tempAbstractHandler.enable() ).not.toThrow();
			expect( () => tempAbstractHandler.disable() ).not.toThrow();

			tempDomElement.remove();
			return tempEditor.destroy();
		} );

		it( 'should restore default toolbar behavior', async () => {
			const tempDomElementDynamicToolbar = global.document.createElement( 'div' );
			global.document.body.appendChild( tempDomElementDynamicToolbar );

			const tempEditorDynamicToolbar = await ClassicEditor.create( tempDomElementDynamicToolbar, {
				plugins: [
					Paragraph,
					Essentials
				],
				toolbar: {
					shouldNotGroupWhenFull: false
				},
				fullscreen: {
					toolbar: {
						shouldNotGroupWhenFull: true
					}
				}
			} );

			const tempAbstractHandlerDynamicToolbar = new FullscreenAbstractEditorHandler( tempEditorDynamicToolbar );

			tempAbstractHandlerDynamicToolbar.enable();
			tempAbstractHandlerDynamicToolbar.disable();

			expect( tempEditorDynamicToolbar.ui.view.toolbar.isGrouping ).toBe( true );

			tempDomElementDynamicToolbar.remove();
			await tempEditorDynamicToolbar.destroy();

			const tempDomElementStaticToolbar = global.document.createElement( 'div' );
			global.document.body.appendChild( tempDomElementStaticToolbar );

			const tempEditorStaticToolbar = await ClassicEditor.create( tempDomElementStaticToolbar, {
				plugins: [
					Paragraph,
					Essentials
				],
				toolbar: {
					shouldNotGroupWhenFull: true
				},
				fullscreen: {
					toolbar: {
						shouldNotGroupWhenFull: false
					}
				}
			} );

			const tempAbstractHandlerStaticToolbar = new FullscreenAbstractEditorHandler( tempEditorStaticToolbar );

			tempAbstractHandlerStaticToolbar.enable();
			tempAbstractHandlerStaticToolbar.disable();

			expect( tempEditorStaticToolbar.ui.view.toolbar.isGrouping ).toBe( false );

			tempDomElementStaticToolbar.remove();
			return tempEditorStaticToolbar.destroy();
		} );

		it( 'should restore saved scroll positions', () => {
			global.document.body.parentElement.style.height = '3000px';
			global.document.body.parentElement.style.scrollBehavior = 'smooth';

			const outerScrollableAncestor = global.document.createElement( 'div' );
			const innerScrollableAncestor = global.document.createElement( 'div' );
			const innerElement = global.document.createElement( 'div' );

			outerScrollableAncestor.style.overflow = 'scroll';
			outerScrollableAncestor.style.width = '100px';
			outerScrollableAncestor.style.height = '100px';
			innerScrollableAncestor.style.overflow = 'scroll';
			innerScrollableAncestor.style.width = '200px';
			innerScrollableAncestor.style.height = '200px';
			innerElement.style.width = '400px';
			innerElement.style.height = '400px';

			global.document.body.appendChild( outerScrollableAncestor );
			outerScrollableAncestor.appendChild( innerScrollableAncestor );
			innerScrollableAncestor.appendChild( innerElement );
			innerElement.appendChild( editor.ui.view.element );

			global.document.body.parentElement.scrollTo( { left: 0, top: 1000, behavior: 'instant' } );
			outerScrollableAncestor.scrollTo( 30, 50 );
			innerScrollableAncestor.scrollTo( 60, 100 );

			const savedDocumentScrollLeft = global.document.body.parentElement.scrollLeft;
			const savedDocumentScrollTop = global.document.body.parentElement.scrollTop;

			expect( global.document.body.parentElement.scrollTop ).toBe( 1000 );

			editor.execute( 'toggleFullscreen' );

			// In test runner scroll is not reset to 0 when fullscreen is enabled, unlike for real browsers, so we need to set it manually.
			global.document.body.parentElement.scrollTo( { left: 0, top: 0, behavior: 'instant' } );

			expect( editor.commands.get( 'toggleFullscreen' ).fullscreenHandler._savedAncestorsScrollPositions.size ).toBe( 3 );

			editor.execute( 'toggleFullscreen' );

			expect( outerScrollableAncestor.scrollLeft ).toBeCloseTo( 30, 0 );
			expect( outerScrollableAncestor.scrollTop ).toBeCloseTo( 50, 0 );
			expect( innerScrollableAncestor.scrollLeft ).toBeCloseTo( 60, 0 );
			expect( innerScrollableAncestor.scrollTop ).toBeCloseTo( 100, 0 );
			expect( global.document.body.parentElement.scrollTop ).toBe( savedDocumentScrollTop );
			expect( global.document.body.parentElement.scrollLeft ).toBe( savedDocumentScrollLeft );

			outerScrollableAncestor.remove();
			innerScrollableAncestor.remove();
			innerElement.remove();
			global.document.body.parentElement.style.height = '';
			global.document.body.parentElement.style.scrollBehavior = '';
		} );

		it( 'should remove the getPositionOptions correction so it no longer adjusts the viewport offset', async () => {
			const tempDomElement = global.document.createElement( 'div' );
			global.document.body.appendChild( tempDomElement );

			const tempEditor = await ClassicEditor.create( {
				attachTo: tempDomElement,
				plugins: [ Paragraph, Essentials, Fullscreen, ContextualBalloon ]
			} );

			const contextualBalloon = tempEditor.plugins.get( 'ContextualBalloon' );
			let registeredListener;

			const originalOn = contextualBalloon.on.bind( contextualBalloon );

			vi.spyOn( contextualBalloon, 'on' ).mockImplementation( ( eventName, listener, opts ) => {
				if ( eventName === 'getPositionOptions' ) {
					registeredListener = listener;
				}

				return originalOn( eventName, listener, opts );
			} );

			const tempHandler = new FullscreenAbstractEditorHandler( tempEditor );

			tempHandler.enable();

			const offSpy = vi.spyOn( contextualBalloon, 'off' );

			tempHandler.disable();

			// The exact same function reference that was registered must be unregistered.
			expect( offSpy ).toHaveBeenCalledWith( 'getPositionOptions', registeredListener );

			tempDomElement.remove();

			return tempEditor.destroy();
		} );
	} );

	describe( 'with Revision history plugin', () => {
		let domElementForRevisionHistory, editorWithRevisionHistory, abstractEditorHandler;

		beforeEach( async () => {
			domElementForRevisionHistory = global.document.createElement( 'div' );
			global.document.body.appendChild( domElementForRevisionHistory );

			editorWithRevisionHistory = await ClassicEditor.create( domElementForRevisionHistory, {
				plugins: [
					Paragraph,
					Essentials,
					RevisionHistoryMock
				]
			} );

			abstractEditorHandler = new FullscreenAbstractEditorHandler( editorWithRevisionHistory );
		} );

		afterEach( async () => {
			abstractEditorHandler.disable();
			domElementForRevisionHistory.remove();

			return editorWithRevisionHistory.destroy();
		} );

		it( 'should override default RH callbacks when fullscreen mode is enabled', () => {
			const spy = vi.spyOn( abstractEditorHandler, '_overrideRevisionHistoryCallbacks' );

			expect( editorWithRevisionHistory.config.get( 'revisionHistory.showRevisionViewerCallback' ) ).toBe(
				RevisionHistoryMock.showRevisionViewerCallback
			);
			expect( editorWithRevisionHistory.config.get( 'revisionHistory.showRevisionViewerCallback' ) ).toBe(
				RevisionHistoryMock.showRevisionViewerCallback
			);

			abstractEditorHandler.enable();

			expect( editorWithRevisionHistory.config.get( 'revisionHistory.closeRevisionViewerCallback' ) ).not.toBe(
				RevisionHistoryMock.closeRevisionViewerCallback
			);
			expect( editorWithRevisionHistory.config.get( 'revisionHistory.closeRevisionViewerCallback' ) ).not.toBe(
				RevisionHistoryMock.closeRevisionViewerCallback
			);

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should restore default RH callbacks when fullscreen mode is disabled', () => {
			const spy = vi.spyOn( abstractEditorHandler, '_restoreRevisionHistoryCallbacks' );

			abstractEditorHandler.enable();
			abstractEditorHandler.disable();

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'with source editing and document outline plugins', () => {
		let domElementForSourceEditing, editorWithSourceEditing, abstractEditorHandler;

		class DocumentOutlineUIMock extends Plugin {
			static get pluginName() {
				return 'DocumentOutlineUI';
			}

			view = { element: global.document.createElement( 'div' ) };
		}

		beforeEach( async () => {
			domElementForSourceEditing = global.document.createElement( 'div' );
			global.document.body.appendChild( domElementForSourceEditing );

			editorWithSourceEditing = await ClassicEditor.create( domElementForSourceEditing, {
				plugins: [
					Paragraph,
					Essentials,
					SourceEditing,
					DocumentOutlineUIMock
				]
			} );

			abstractEditorHandler = new FullscreenAbstractEditorHandler( editorWithSourceEditing );
		} );

		afterEach( async () => {
			abstractEditorHandler.destroy();
			domElementForSourceEditing.remove();

			return editorWithSourceEditing.destroy();
		} );

		it( 'should hide document outline header when source editing is enabled in fullscreen mode', () => {
			const stub = vi.spyOn( abstractEditorHandler, '_sourceEditingCallback' ).mockImplementation( () => {} );

			abstractEditorHandler.enable();
			editorWithSourceEditing.plugins.get( 'SourceEditing' ).isSourceEditingMode = true;

			expect( stub ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should restore document outline header when fullscreen mode is disabled', () => {
			const stub = vi.spyOn( abstractEditorHandler, '_sourceEditingCallback' ).mockImplementation( () => {} );

			abstractEditorHandler.enable();
			editorWithSourceEditing.plugins.get( 'SourceEditing' ).isSourceEditingMode = true;
			editorWithSourceEditing.plugins.get( 'SourceEditing' ).isSourceEditingMode = false;

			expect( stub ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'should not be executed outside the fullscreen mode', () => {
			const stub = vi.spyOn( abstractEditorHandler, '_sourceEditingCallback' ).mockImplementation( () => {} );
			vi.spyOn( abstractEditorHandler, '_restoreDocumentOutlineDefaultContainer' ).mockImplementation( () => {} );

			abstractEditorHandler.enable();
			abstractEditorHandler.disable();
			editorWithSourceEditing.plugins.get( 'SourceEditing' ).isSourceEditingMode = true;

			expect( stub ).not.toHaveBeenCalled();
		} );
	} );

	describe( '_registerFullscreenDialogPositionAdjustments', () => {
		it( 'should call _setNewDialogPosition', () => {
			const spy = vi.spyOn( abstractHandler, '_setNewDialogPosition' );

			abstractHandler._registerFullscreenDialogPositionAdjustments();

			expect( spy ).toHaveBeenCalled();
		} );
	} );

	describe( '_unregisterFullscreenDialogPositionAdjustments', () => {
		it( 'should change position of dialogView to editor-top-side for dialogView with position set to null', () => {
			const dialogPlugin = editor.plugins.get( Dialog );
			const dialogContentView = new View();

			dialogContentView.setTemplate( {
				tag: 'div',
				attributes: {
					style: {
						width: '100px',
						height: '50px'
					}
				}
			} );

			dialogPlugin.show( {
				label: 'Foo',
				content: dialogContentView,
				position: null
			} );

			dialogPlugin.view.position = null;

			const spy = vi.spyOn( dialogPlugin.view, 'updatePosition' );

			abstractHandler._unregisterFullscreenDialogPositionAdjustments();

			expect( dialogPlugin.view.position ).toBe( DialogViewPosition.EDITOR_TOP_SIDE );
			expect( spy ).toHaveBeenCalled();
		} );
	} );

	describe( '_updateDialogPosition', () => {
		it( 'should call _setNewDialogPosition if dialog is opened', () => {
			const spy = vi.spyOn( abstractHandler, '_setNewDialogPosition' );

			abstractHandler._updateDialogPosition( {}, {}, true );

			expect( spy ).toHaveBeenCalled();
		} );

		it( 'should not call _setNewDialogPosition if dialog state is closed', () => {
			const spy = vi.spyOn( abstractHandler, '_setNewDialogPosition' );

			abstractHandler._updateDialogPosition( {}, {}, false );

			expect( spy ).not.toHaveBeenCalled();
		} );

		it( 'should not call _setNewDialogPosition if dialog is closed', () => {
			const spy = vi.spyOn( abstractHandler, '_setNewDialogPosition' );
			const dialogPlugin = editor.plugins.get( Dialog );
			const dialogContentView = new View();

			dialogContentView.setTemplate( {
				tag: 'div',
				attributes: {
					style: {
						width: '100px',
						height: '50px'
					}
				}
			} );

			dialogPlugin.show( {
				label: 'Foo',
				content: dialogContentView,
				position: null
			} );

			dialogPlugin.hide();

			expect( spy ).not.toHaveBeenCalled();
		} );
	} );

	describe( '#_setNewDialogPosition()', () => {
		it( 'should not try to adjust position when dialog position is different than editor-top-side', () => {
			const dialogPlugin = editor.plugins.get( Dialog );
			const dialogContentView = new View();

			dialogContentView.setTemplate( {
				tag: 'div',
				attributes: {
					style: {
						width: '100px',
						height: '50px'
					}
				}
			} );

			dialogPlugin.show( {
				label: 'Foo',
				content: dialogContentView,
				position: DialogViewPosition.EDITOR_TOP_CENTER
			} );

			const originalDialogPositionLeft = dialogPlugin.view._left;
			const originalDialogPositionTop = dialogPlugin.view._top;

			abstractHandler._setNewDialogPosition();

			expect( originalDialogPositionLeft ).toBe( dialogPlugin.view._left );
			expect( originalDialogPositionTop ).toBe( dialogPlugin.view._top );
		} );

		it( 'should change position of dialog when dialog position is editor-top-side', () => {
			const dialogPlugin = editor.plugins.get( Dialog );
			const dialogContentView = new View();

			dialogContentView.setTemplate( {
				tag: 'div',
				attributes: {
					style: {
						width: '100px',
						height: '50px'
					}
				}
			} );

			dialogPlugin.show( {
				label: 'Foo',
				content: dialogContentView,
				position: DialogViewPosition.EDITOR_TOP_SIDE
			} );

			const originalDialogPositionLeft = dialogPlugin.view._left;
			const originalDialogPositionTop = dialogPlugin.view._top;

			editor.commands.get( 'toggleFullscreen' ).execute();

			expect( originalDialogPositionLeft ).not.toBe( dialogPlugin.view._left );
			expect( originalDialogPositionTop ).not.toBe( dialogPlugin.view._top );

			editor.commands.get( 'toggleFullscreen' ).execute();
		} );

		it( 'should use wrapper as a relative container when right edge container is not visible', async () => {
			const dialogPlugin = editor.plugins.get( Dialog );
			const dialogContentView = new View();

			dialogContentView.setTemplate( {
				tag: 'div',
				attributes: {
					style: {
						width: '100px',
						height: '50px'
					}
				}
			} );

			abstractHandler.enable();

			await wait( 20 );

			vi.spyOn( abstractHandler.getWrapper().querySelector( '.ck-fullscreen__editable-wrapper' ), 'getBoundingClientRect' )
				.mockReturnValue( {
					top: 0,
					right: 800,
					bottom: 500,
					left: 0,
					width: 800,
					height: 500
				} );

			abstractHandler.moveToFullscreen( abstractHandler._editor.ui.getEditableElement(), 'editable' );

			dialogPlugin.show( {
				label: 'Foo',
				content: dialogContentView,
				position: DialogViewPosition.EDITOR_TOP_SIDE
			} );

			await wait( 20 );

			// Calculate the expected left offset given the right edge container is not visible.
			const DIALOG_OFFSET = 28;
			const relativeContainer = abstractHandler.getWrapper();
			const relativeContainerRect = new Rect( relativeContainer ).getVisible();
			const dialogRect = new Rect( dialogPlugin.view.element.querySelector( '.ck-dialog' ) ).getVisible();
			const scrollOffset = new Rect( abstractHandler.getWrapper().querySelector( '.ck-fullscreen__editable-wrapper' ) )
				.excludeScrollbarsAndBorders().getVisible().width -
				new Rect( abstractHandler.getWrapper().querySelector( '.ck-fullscreen__editable-wrapper' ) ).getVisible().width;

			const leftOffset =
				relativeContainerRect.left + relativeContainerRect.width - dialogRect.width - DIALOG_OFFSET + scrollOffset;

			expect( leftOffset ).toBeCloseTo( dialogPlugin.view.element.firstChild.getBoundingClientRect().left, 3 );
		} );

		it( 'should use right edge container as a relative container when right edge container is visible', async () => {
			const dialogPlugin = editor.plugins.get( Dialog );
			const dialogContentView = new View();

			dialogContentView.setTemplate( {
				tag: 'div',
				attributes: {
					style: {
						width: '100px',
						height: '50px'
					}
				}
			} );

			abstractHandler.enable();

			await wait( 20 );

			vi.spyOn( abstractHandler.getWrapper().querySelector( '.ck-fullscreen__editable-wrapper' ), 'getBoundingClientRect' )
				.mockReturnValue( {
					top: 0,
					right: 1920,
					bottom: 700,
					left: 0,
					width: 1920,
					height: 700
				} );

			vi.spyOn( window, 'innerWidth', 'get' ).mockReturnValue( 1920 );

			abstractHandler.moveToFullscreen( abstractHandler._editor.ui.getEditableElement(), 'editable' );

			dialogPlugin.show( {
				label: 'Foo',
				content: dialogContentView,
				position: DialogViewPosition.EDITOR_TOP_SIDE
			} );

			await wait( 20 );

			// Calculate the expected left offset given the right edge container is not visible.
			const DIALOG_OFFSET = 28;
			const relativeContainer = abstractHandler.getWrapper().querySelector( '.ck-fullscreen__right-edge' );
			const relativeContainerRect = new Rect( relativeContainer );
			const dialogRect = new Rect( dialogPlugin.view.element.querySelector( '.ck-dialog' ) ).getVisible();
			const leftOffset = relativeContainerRect.left - dialogRect.width - DIALOG_OFFSET;

			expect( leftOffset ).toBeCloseTo( dialogPlugin.view.element.firstChild.getBoundingClientRect().left, 3 );
		} );
	} );

	describe( '#_saveAncestorsScrollPositions()', () => {
		it( 'should not add anything to #_savedAncestorsScrollPositions if domElement does not have a parent', () => {
			const parentlessElement = global.document.createElement( 'div' );

			abstractHandler._saveAncestorsScrollPositions( parentlessElement );
			expect( abstractHandler._savedAncestorsScrollPositions.size ).toBe( 0 );
			parentlessElement.remove();
		} );

		it( 'should add elements with scroll positions to #_savedAncestorsScrollPositions', () => {
			const outerScrollableAncestor = global.document.createElement( 'div' );
			const innerScrollableAncestor = global.document.createElement( 'div' );
			const innerElement = global.document.createElement( 'div' );

			outerScrollableAncestor.style.overflow = 'scroll';
			outerScrollableAncestor.style.width = '100px';
			outerScrollableAncestor.style.height = '100px';
			innerScrollableAncestor.style.overflow = 'scroll';
			innerScrollableAncestor.style.width = '200px';
			innerScrollableAncestor.style.height = '200px';
			innerElement.style.width = '400px';
			innerElement.style.height = '400px';

			global.document.body.appendChild( outerScrollableAncestor );
			outerScrollableAncestor.appendChild( innerScrollableAncestor );
			innerScrollableAncestor.appendChild( innerElement );

			outerScrollableAncestor.scrollTo( 30, 50 );
			innerScrollableAncestor.scrollTo( 60, 100 );

			abstractHandler._saveAncestorsScrollPositions( innerElement );

			expect( abstractHandler._savedAncestorsScrollPositions.size ).toBe( 3 );
			expect( abstractHandler._savedAncestorsScrollPositions.get( outerScrollableAncestor ).scrollLeft ).toBeCloseTo( 30, 0 );
			expect( abstractHandler._savedAncestorsScrollPositions.get( outerScrollableAncestor ).scrollTop ).toBeCloseTo( 50, 0 );
			expect( abstractHandler._savedAncestorsScrollPositions.get( innerScrollableAncestor ).scrollLeft ).toBeCloseTo( 60, 0 );
			expect( abstractHandler._savedAncestorsScrollPositions.get( innerScrollableAncestor ).scrollTop ).toBeCloseTo( 100, 0 );
			expect( abstractHandler._savedAncestorsScrollPositions.get( global.document.body.parentElement ).scrollTop ).toBe(
				global.document.body.parentElement.scrollTop
			);
			expect( abstractHandler._savedAncestorsScrollPositions.get( global.document.body.parentElement ).scrollLeft ).toBe(
				global.document.body.parentElement.scrollLeft
			);

			outerScrollableAncestor.remove();
			innerScrollableAncestor.remove();
			innerElement.remove();
		} );
	} );

	describe( 'on _collapseLeftSidebarButton#execute', () => {
		it( 'should toggle left sidebar visibility', () => {
			abstractHandler._hasLeftCollapseButton = true;
			abstractHandler.enable();

			const hideLeftSidebarSpy = vi.spyOn( abstractHandler, '_hideLeftSidebar' );
			const showLeftSidebarSpy = vi.spyOn( abstractHandler, '_showLeftSidebar' );

			abstractHandler._collapseLeftSidebarButton.fire( 'execute' );

			expect( hideLeftSidebarSpy ).toHaveBeenCalled();
			expect( showLeftSidebarSpy ).not.toHaveBeenCalled();

			abstractHandler._collapseLeftSidebarButton.fire( 'execute' );

			expect( hideLeftSidebarSpy ).toHaveBeenCalledTimes( 1 );
			expect( showLeftSidebarSpy ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( '_setupResizeObserver', () => {
		it( 'should create a new resize observer every time it is called', () => {
			abstractHandler.enable();
			const oldResizeObserver = abstractHandler._resizeObserver;

			abstractHandler._setupResizeObserver();
			expect( oldResizeObserver ).not.toEqual( abstractHandler._resizeObserver );
		} );
	} );

	describe( 'on window resize', () => {
		describe( 'when window is shrinked', () => {
			it( 'should collapse the left sidebar if it is expanded first', () => {
				abstractHandler.enable();

				const editableWrapper = abstractHandler.getWrapper().querySelector( '.ck-fullscreen__editable-wrapper' );

				const scrollWidthStub = vi.spyOn( editableWrapper, 'scrollWidth', 'get' ).mockReturnValue( 1000 );
				vi.spyOn( editableWrapper, 'clientWidth', 'get' ).mockReturnValue( 500 );

				const hideLeftSidebarStub = vi.spyOn( abstractHandler, '_hideLeftSidebar' ).mockImplementation( () => {
					scrollWidthStub.mockReturnValue( 400 );
				} );
				const hideRightSidebarSpy = vi.spyOn( abstractHandler, '_hideRightSidebar' );

				abstractHandler._adjustVisibleElements();

				expect( hideLeftSidebarStub ).toHaveBeenCalled();
				expect( hideRightSidebarSpy ).not.toHaveBeenCalled();
			} );

			it( 'should collapse the right sidebar if it is expanded second', () => {
				abstractHandler.enable();

				const editableWrapper = abstractHandler.getWrapper().querySelector( '.ck-fullscreen__editable-wrapper' );

				const scrollWidthStub = vi.spyOn( editableWrapper, 'scrollWidth', 'get' ).mockReturnValue( 1000 );
				vi.spyOn( editableWrapper, 'clientWidth', 'get' ).mockReturnValue( 500 );

				const hideLeftSidebarStub = vi.spyOn( abstractHandler, '_hideLeftSidebar' ).mockImplementation( () => {
					scrollWidthStub.mockReturnValue( 600 );
				} );
				const hideRightSidebarStub = vi.spyOn( abstractHandler, '_hideRightSidebar' ).mockImplementation( () => {
					scrollWidthStub.mockReturnValue( 400 );
				} );

				abstractHandler._adjustVisibleElements();

				expect( hideLeftSidebarStub ).toHaveBeenCalled();
				expect( hideRightSidebarStub ).toHaveBeenCalled();
			} );
		} );

		describe( 'when window is expanded', () => {
			it( 'should expand the right sidebar if it is collapsed first', () => {
				abstractHandler.enable();

				const editableWrapper = abstractHandler.getWrapper().querySelector( '.ck-fullscreen__editable-wrapper' );

				const scrollWidthStub = vi.spyOn( editableWrapper, 'scrollWidth', 'get' ).mockReturnValue( 400 );
				vi.spyOn( editableWrapper, 'clientWidth', 'get' ).mockReturnValue( 850 );

				abstractHandler._sidebarsWidths.left = 500;

				const showRightSidebarStub = vi.spyOn( abstractHandler, '_showRightSidebar' ).mockImplementation( () => {
					scrollWidthStub.mockReturnValue( 600 );
				} );
				const showLeftSidebarStub = vi.spyOn( abstractHandler, '_showLeftSidebar' ).mockImplementation( () => {
					scrollWidthStub.mockReturnValue( 800 );
				} );

				abstractHandler._adjustVisibleElements();

				expect( showRightSidebarStub ).toHaveBeenCalled();
				expect( showLeftSidebarStub ).not.toHaveBeenCalled();
			} );

			it( 'should expand the left sidebar if it is collapsed second', () => {
				abstractHandler.enable();

				const editableWrapper = abstractHandler.getWrapper().querySelector( '.ck-fullscreen__editable-wrapper' );

				const scrollWidthStub = vi.spyOn( editableWrapper, 'scrollWidth', 'get' ).mockReturnValue( 400 );
				vi.spyOn( editableWrapper, 'clientWidth', 'get' ).mockReturnValue( 1000 );

				const showRightSidebarStub = vi.spyOn( abstractHandler, '_showRightSidebar' ).mockImplementation( () => {
					scrollWidthStub.mockReturnValue( 600 );
				} );
				const showLeftSidebarStub = vi.spyOn( abstractHandler, '_showLeftSidebar' ).mockImplementation( () => {
					scrollWidthStub.mockReturnValue( 800 );
				} );

				abstractHandler._adjustVisibleElements();

				expect( showLeftSidebarStub ).toHaveBeenCalled();
				expect( showRightSidebarStub ).toHaveBeenCalled();
			} );
		} );

		it( 'if #_forceShowLeftSidebar is true should not adjust the sidebars visibility', () => {
			abstractHandler.enable();

			const editableWrapper = abstractHandler.getWrapper().querySelector( '.ck-fullscreen__editable-wrapper' );

			vi.spyOn( editableWrapper, 'scrollWidth', 'get' ).mockReturnValue( 1000 );
			vi.spyOn( editableWrapper, 'clientWidth', 'get' ).mockReturnValue( 500 );

			abstractHandler._forceShowLeftSidebar = true;

			const hideLeftSidebarStub = vi.spyOn( abstractHandler, '_hideLeftSidebar' );
			const hideRightSidebarSpy = vi.spyOn( abstractHandler, '_hideRightSidebar' );

			abstractHandler._adjustVisibleElements();

			expect( hideLeftSidebarStub ).not.toHaveBeenCalled();
			expect( hideRightSidebarSpy ).not.toHaveBeenCalled();
		} );
	} );

	describe( '_hideRightSidebar', () => {
		it( 'should hide the right sidebar if it contains anything', () => {
			abstractHandler.enable();

			vi.spyOn( abstractHandler, '_switchAnnotationsUI' ).mockImplementation( () => {} );

			const fakeRightSidebarContent = global.document.createElement( 'div' );

			abstractHandler.moveToFullscreen( fakeRightSidebarContent, 'right-sidebar' );

			abstractHandler._hideRightSidebar();

			expect( abstractHandler._switchAnnotationsUI ).toHaveBeenCalled();
			expect( abstractHandler.getWrapper().querySelector( '.ck-fullscreen__right-sidebar' )
				.classList.contains( 'ck-fullscreen__right-sidebar--collapsed' ) ).toBe( true );

			fakeRightSidebarContent.remove();
		} );

		it( 'should do nothing if the right sidebar does not contain anything', () => {
			abstractHandler.enable();

			vi.spyOn( abstractHandler, '_switchAnnotationsUI' ).mockImplementation( () => {} );
			abstractHandler.getWrapper().querySelector( '.ck-fullscreen__right-sidebar' )
				.classList.add( 'ck-fullscreen__right-sidebar--collapsed' );

			abstractHandler._hideRightSidebar();
			expect( abstractHandler._switchAnnotationsUI ).not.toHaveBeenCalled();
			expect( abstractHandler.getWrapper().querySelector( '.ck-fullscreen__right-sidebar' )
				.classList.contains( 'ck-fullscreen__right-sidebar--collapsed' ) ).toBe( true );
		} );
	} );

	describe( '_showRightSidebar', () => {
		it( 'should show the right sidebar if it is collapsed', () => {
			abstractHandler.enable();

			vi.spyOn( abstractHandler, '_switchAnnotationsUI' ).mockImplementation( () => {} );

			const fakeRightSidebarContent = global.document.createElement( 'div' );

			abstractHandler.moveToFullscreen( fakeRightSidebarContent, 'right-sidebar' );
			abstractHandler.getWrapper().querySelector( '.ck-fullscreen__right-sidebar' )
				.classList.add( 'ck-fullscreen__right-sidebar--collapsed' );

			abstractHandler._showRightSidebar();

			expect( abstractHandler._switchAnnotationsUI ).toHaveBeenCalled();
			expect( abstractHandler.getWrapper().querySelector( '.ck-fullscreen__right-sidebar' )
				.classList.contains( 'ck-fullscreen__right-sidebar--collapsed' ) ).toBe( false );
		} );

		it( 'should do nothing if the right sidebar does not contain anything', () => {
			abstractHandler.enable();

			vi.spyOn( abstractHandler, '_switchAnnotationsUI' ).mockImplementation( () => {} );

			abstractHandler.getWrapper().querySelector( '.ck-fullscreen__right-sidebar' )
				.classList.add( 'ck-fullscreen__right-sidebar--collapsed' );

			expect( abstractHandler._switchAnnotationsUI ).not.toHaveBeenCalled();
			expect( abstractHandler.getWrapper().querySelector( '.ck-fullscreen__right-sidebar' )
				.classList.contains( 'ck-fullscreen__right-sidebar--collapsed' ) ).toBe( true );
		} );
	} );

	describe( '_handleAISidebarTransitions', () => {
		let aiElement, nestedElement;

		beforeEach( () => {
			aiElement = global.document.createElement( 'div' );
			nestedElement = global.document.createElement( 'div' );
			aiElement.appendChild( nestedElement );

			vi.spyOn( editor.plugins, 'get' ).mockImplementation( pluginName => pluginName === 'AITabs' ? {
				view: {
					element: aiElement
				}
			} : undefined );
		} );

		afterEach( () => {
			// The automatic `restoreMocks` cleanup runs only before the next test, so restore manually
			// first: the outer `afterEach()` calls `abstractHandler.disable()`, which must use the real
			// `editor.plugins.get()` instead of the mock returning `undefined` for non-AITabs plugins.
			vi.restoreAllMocks();

			aiElement.remove();
		} );

		it( 'should not adjust the fullscreen elements if the transition is not on the AI tabs', () => {
			const adjustVisibleElementsStub = vi.spyOn( abstractHandler, '_adjustVisibleElements' ).mockImplementation( () => {} );
			const evt = new TransitionEvent( 'transitionend', {
				target: nestedElement,
				propertyName: 'width'
			} );

			abstractHandler._handleAISidebarTransitions( evt );

			expect( adjustVisibleElementsStub ).not.toHaveBeenCalled();
		} );

		it( 'should not adjust the fullscreen elements if the transition concerns non-width properties of the AI tabs', () => {
			const adjustVisibleElementsStub = vi.spyOn( abstractHandler, '_adjustVisibleElements' ).mockImplementation( () => {} );
			const evt = new TransitionEvent( 'transitionend', {
				target: aiElement,
				propertyName: 'height'
			} );

			abstractHandler._handleAISidebarTransitions( evt );

			expect( adjustVisibleElementsStub ).not.toHaveBeenCalled();
		} );

		it( 'should adjust the fullscreen elements if the transition is on the AI tabs', () => {
			const adjustVisibleElementsStub = vi.spyOn( abstractHandler, '_adjustVisibleElements' ).mockImplementation( () => {} );
			const fakeEvt = {
				target: aiElement,
				propertyName: 'width'
			};

			abstractHandler._handleAISidebarTransitions( fakeEvt );

			expect( adjustVisibleElementsStub ).toHaveBeenCalled();
		} );
	} );

	describe( '_aiTabsTransitionEndCallback', () => {
		it( 'should forward the transition event to _handleAISidebarTransitions', () => {
			const handleAISidebarTransitionsStub = vi.spyOn( abstractHandler, '_handleAISidebarTransitions' )
				.mockImplementation( () => {} );
			const evt = new TransitionEvent( 'transitionend', {
				propertyName: 'width'
			} );

			abstractHandler._aiTabsTransitionEndCallback( evt );

			expect( handleAISidebarTransitionsStub ).toHaveBeenCalledTimes( 1 );
			expect( handleAISidebarTransitionsStub ).toHaveBeenCalledWith( evt );
		} );
	} );
} );

function wait( time ) {
	return new Promise( res => {
		window.setTimeout( res, time );
	} );
}
