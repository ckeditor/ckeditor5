/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import View from '@ckeditor/ckeditor5-ui/src/view.js';
import { Dialog, DialogViewPosition } from '@ckeditor/ckeditor5-ui';

import RevisionHistoryMock from '../_utils/revisionhistorymock.js';
import AbstractEditorHandler from '../../src/handlers/abstracteditor.js';
import Fullscreen from '../../src/fullscreen.js';

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

		abstractHandler = new AbstractEditorHandler( editor );
	} );

	afterEach( () => {
		domElement.remove();
		abstractHandler.disable();

		return editor.destroy();
	} );

	describe( 'constructor', () => {
		it( 'should create element maps', () => {
			expect( abstractHandler._placeholderMap ).to.be.an.instanceOf( Map );
		} );

		it( 'should set the editor instance as a property', () => {
			expect( abstractHandler._editor ).to.equal( editor );
		} );

		it( 'should setup listener returning moved elements when editor is destroyed and fullscreen is enabled', async () => {
			const spy = sinon.spy( abstractHandler, 'disable' );

			abstractHandler.enable();

			await editor.destroy();

			expect( spy ).to.have.been.calledOnce;
		} );
	} );

	describe( '#moveToFullscreen()', () => {
		it( 'should replace an element with given placeholder', () => {
			const element = global.document.createElement( 'div' );

			element.id = 'element';
			global.document.body.appendChild( element );

			abstractHandler.moveToFullscreen( element, 'editable' );

			expect( abstractHandler.getWrapper().querySelector( '#element' ) ).to.equal( element );

			abstractHandler.disable();
			element.remove();
		} );
	} );

	describe( '#restoreMovedElementLocation()', () => {
		it( 'should not throw if map does not contain requested element', () => {
			expect( abstractHandler._placeholderMap.has( 'menu-bar' ) ).to.be.false;
			expect( () => abstractHandler.restoreMovedElementLocation( 'menu-bar' ) ).to.not.throw();
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

			expect( abstractHandler._placeholderMap.size ).to.equal( 1 );
			expect( global.document.querySelector( '[data-ck-fullscreen-placeholder="menu-bar"' ) ).to.be.null;
			expect( global.document.querySelector( '[data-ck-fullscreen-placeholder="editable"' ) ).to.not.be.null;

			abstractHandler.restoreMovedElementLocation( 'editable' );
			element.remove();
			element2.remove();
		} );

		it( 'should destroy the wrapper if there are no other elements left', () => {
			const element = global.document.createElement( 'div' );

			global.document.body.appendChild( element );

			abstractHandler.moveToFullscreen( element, 'menu-bar' );
			abstractHandler.restoreMovedElementLocation( 'menu-bar' );

			expect( abstractHandler._wrapper ).to.be.null;

			element.remove();
		} );
	} );

	describe( '#getWrapper()', () => {
		it( 'should create a wrapper if it does not exist', () => {
			expect( global.document.querySelector( '.ck-fullscreen__main-wrapper' ) ).to.be.null;

			const wrapper = abstractHandler.getWrapper();

			expect( wrapper.innerHTML ).to.equal( `
				<div class="ck ck-fullscreen__top-wrapper ck-reset_all">
					<div class="ck ck-fullscreen__menu-bar" data-ck-fullscreen="menu-bar"></div>
					<div class="ck ck-fullscreen__toolbar" data-ck-fullscreen="toolbar"></div>
				</div>
				<div class="ck ck-fullscreen__editable-wrapper">
					<div class="ck ck-fullscreen__sidebar ck-fullscreen__left-sidebar" data-ck-fullscreen="left-sidebar">
						<div class="ck ck-fullscreen__left-sidebar--sticky" data-ck-fullscreen="left-sidebar-sticky"></div>
					</div>
					<div class="ck ck-fullscreen__editable" data-ck-fullscreen="editable">
						<div class="ck ck-fullscreen__pagination-view" data-ck-fullscreen="pagination-view"></div>
					</div>
					<div class="ck ck-fullscreen__sidebar ck-fullscreen__right-sidebar" data-ck-fullscreen="right-sidebar"></div>
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

			expect( abstractHandler.getWrapper().classList.contains( 'custom' ) ).to.be.true;

			wrapper.remove();
		} );

		it( 'should append the wrapper to the body by default', () => {
			const wrapper = abstractHandler.getWrapper();

			expect( wrapper.parentElement ).to.equal( global.document.body );

			wrapper.remove();
		} );

		it( 'should append the wrapper to the custom container if configured', () => {
			const customContainer = global.document.createElement( 'div' );

			global.document.body.appendChild( customContainer );

			editor.config.set( 'fullscreen.container', customContainer );

			const wrapper = abstractHandler.getWrapper();

			expect( wrapper.parentElement ).to.equal( customContainer );

			wrapper.remove();
			customContainer.remove();
		} );
	} );

	describe( '#enable()', () => {
		it( 'should execute the #_defaultEnable method', () => {
			const spy = sinon.spy( abstractHandler, '_defaultEnable' );

			abstractHandler.enable();

			expect( spy ).to.have.been.calledOnce;
		} );

		it( 'should execute the custom callback if configured', () => {
			const spy = sinon.spy();

			editor.config.set( 'fullscreen.enableCallback', spy );

			abstractHandler.enable();

			expect( spy ).to.have.been.calledOnce;
		} );
	} );

	describe( '#disable()', () => {
		it( 'should execute the custom callback if configured', () => {
			const spy = sinon.spy();

			editor.config.set( 'fullscreen.disableCallback', spy );

			abstractHandler.disable();

			expect( spy ).to.have.been.calledOnce;
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
			).to.be.true;
			expect(
				abstractHandler._placeholderMap.has( 'editable' )
			).to.be.true;
			expect( abstractHandler._placeholderMap.size ).to.equal( 2 );

			abstractHandler.disable();

			expect( abstractHandler._placeholderMap.size ).to.equal( 0 );
			expect( global.document.querySelector( '[data-ck-fullscreen-placeholder="menu-bar"' ) ).to.be.null;
			expect( global.document.querySelector( '[data-ck-fullscreen-placeholder="editable"' ) ).to.be.null;

			element.remove();
			element2.remove();
		} );

		it( 'should destroy the wrapper if it was created', () => {
			const wrapper = abstractHandler.getWrapper();

			abstractHandler.disable();

			expect( abstractHandler._wrapper ).to.be.null;
			expect( wrapper.parentElement ).to.be.null;
		} );

		it( 'should not throw if there is no wrapper', () => {
			expect( () => abstractHandler.disable() ).to.not.throw();
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

			abstractEditorHandler = new AbstractEditorHandler( editorWithRevisionHistory );
		} );

		afterEach( async () => {
			abstractEditorHandler.disable();
			domElementForRevisionHistory.remove();

			return editorWithRevisionHistory.destroy();
		} );

		it( 'should override default RH callbacks when fullscreen mode is enabled', () => {
			const spy = sinon.spy( abstractEditorHandler, '_overrideRevisionHistoryCallbacks' );

			expect( editorWithRevisionHistory.config.get( 'revisionHistory.showRevisionViewerCallback' ) ).to.equal(
				RevisionHistoryMock.showRevisionViewerCallback
			);
			expect( editorWithRevisionHistory.config.get( 'revisionHistory.showRevisionViewerCallback' ) ).to.equal(
				RevisionHistoryMock.showRevisionViewerCallback
			);

			abstractEditorHandler.enable();

			expect( editorWithRevisionHistory.config.get( 'revisionHistory.closeRevisionViewerCallback' ) ).to.not.equal(
				RevisionHistoryMock.closeRevisionViewerCallback
			);
			expect( editorWithRevisionHistory.config.get( 'revisionHistory.closeRevisionViewerCallback' ) ).to.not.equal(
				RevisionHistoryMock.closeRevisionViewerCallback
			);

			expect( spy ).to.have.been.calledOnce;
		} );

		it( 'should restore default RH callbacks when fullscreen mode is disabled', () => {
			const spy = sinon.spy( abstractEditorHandler, '_restoreRevisionHistoryCallbacks' );

			abstractEditorHandler.enable();
			abstractEditorHandler.disable();

			expect( spy ).to.have.been.calledOnce;
		} );
	} );

	describe( '_registerFullscreenDialogPositionAdjustments', () => {
		it( 'should call _setNewDialogPosition', () => {
			const spy = sinon.spy( abstractHandler, '_setNewDialogPosition' );

			abstractHandler._registerFullscreenDialogPositionAdjustments();

			expect( spy ).to.be.called;
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

			const spy = sinon.spy( dialogPlugin.view, 'updatePosition' );

			abstractHandler._unregisterFullscreenDialogPositionAdjustments();

			expect( dialogPlugin.view.position ).to.equal( DialogViewPosition.EDITOR_TOP_SIDE );
			expect( spy ).to.be.called;
		} );
	} );

	describe( '_updateDialogPosition', () => {
		it( 'should call _setNewDialogPosition if dialog is opened', () => {
			const spy = sinon.spy( abstractHandler, '_setNewDialogPosition' );

			abstractHandler._updateDialogPosition( {}, {}, true );

			expect( spy ).to.be.called;
		} );

		it( 'should not call _setNewDialogPosition if dialog is closed', () => {
			const spy = sinon.spy( abstractHandler, '_setNewDialogPosition' );
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

			expect( spy ).not.to.be.called;
		} );
	} );

	describe( '_setNewDialogPosition', () => {
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

			expect( originalDialogPositionLeft ).to.equal( dialogPlugin.view._left );
			expect( originalDialogPositionTop ).to.equal( dialogPlugin.view._top );
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

			expect( originalDialogPositionLeft ).not.to.equal( dialogPlugin.view._left );
			expect( originalDialogPositionTop ).not.to.equal( dialogPlugin.view._top );

			editor.commands.get( 'toggleFullscreen' ).execute();
		} );
	} );
} );
