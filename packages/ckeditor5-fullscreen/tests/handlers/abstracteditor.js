/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* global document */

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

		it( 'should setup listener returning moved elements when editor is destroyed', async () => {
			const spy = sinon.spy( abstractHandler, 'disable' );

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

			expect( abstractHandler.getContainer().querySelector( '#element' ) ).to.equal( element );

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

		it( 'should destroy the container if there are no other elements left', () => {
			const element = global.document.createElement( 'div' );

			global.document.body.appendChild( element );

			abstractHandler.moveToFullscreen( element, 'menu-bar' );
			abstractHandler.restoreMovedElementLocation( 'menu-bar' );

			expect( abstractHandler._container ).to.be.null;

			element.remove();
		} );
	} );

	describe( '#getContainer()', () => {
		it( 'should create a container if it does not exist', () => {
			expect( global.document.querySelector( '.ck-fullscreen__main-container' ) ).to.be.null;

			const container = abstractHandler.getContainer();

			expect( container.innerHTML ).to.equal( `
				<div class="ck ck-fullscreen__top-wrapper ck-reset_all">
					<div class="ck ck-fullscreen__menu-bar" data-ck-fullscreen="menu-bar"></div>
					<div class="ck ck-fullscreen__toolbar" data-ck-fullscreen="toolbar"></div>
				</div>
				<div class="ck ck-fullscreen__editable-wrapper">
					<div class="ck ck-fullscreen__sidebar ck-fullscreen__left-sidebar" data-ck-fullscreen="left-sidebar">
						<div class="ck ck-fullscreen__left-sidebar--sticky" data-ck-fullscreen="left-sidebar-sticky"></div>
					</div>
					<div class="ck ck-fullscreen__editable" data-ck-fullscreen="editable"></div>
					<div class="ck ck-fullscreen__sidebar" data-ck-fullscreen="right-sidebar"></div>
				</div>
				<div class="ck ck-fullscreen__bottom-wrapper">
					<div class="ck ck-fullscreen__body-wrapper" data-ck-fullscreen="body-wrapper"></div>
				</div>
			` );

			container.remove();
		} );

		it( 'should return a container if it already exists', () => {
			const container = abstractHandler.getContainer();

			container.classList.add( 'custom' );

			expect( abstractHandler.getContainer().classList.contains( 'custom' ) ).to.be.true;

			container.remove();
		} );

		it( 'should append the container to the body by default', () => {
			const container = abstractHandler.getContainer();

			expect( container.parentElement ).to.equal( global.document.body );

			container.remove();
		} );

		it( 'should append the container to the custom container if configured', () => {
			const customContainer = global.document.createElement( 'div' );

			global.document.body.appendChild( customContainer );

			editor.config.set( 'fullscreen.container', customContainer );

			const container = abstractHandler.getContainer();

			expect( container.parentElement ).to.equal( customContainer );

			container.remove();
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

		it( 'should destroy the container if it was created', () => {
			const container = abstractHandler.getContainer();

			abstractHandler.disable();

			expect( abstractHandler._container ).to.be.null;
			expect( container.parentElement ).to.be.null;
		} );

		it( 'should not throw if there is no container', () => {
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

	describe( 'registerFullscreenDialogPositionAdjustments', () => {
		it( 'should not try to adjust position when there is no Dialog plugin loaded', async () => {
			await editor.destroy();

			editor = await ClassicEditor.create( domElement, {
				plugins: [
					Paragraph
				]
			} );

			abstractHandler = new AbstractEditorHandler( editor );

			const spy = sinon.spy( abstractHandler, '_setNewDialogPosition' );

			abstractHandler.registerFullscreenDialogPositionAdjustments();

			expect( spy ).not.to.be.called;

			await editor.destroy();
		} );

		it( 'should call _setNewDialogPosition when there is Dialog plugin loaded', () => {
			const spy = sinon.spy( abstractHandler, '_setNewDialogPosition' );

			abstractHandler.registerFullscreenDialogPositionAdjustments();

			expect( spy ).to.be.called;
		} );
	} );

	describe( 'unregisterFullscreenDialogPositionAdjustments', () => {
		it( 'should change position of dialogview to editor-top-side for dialogview with position set to null', () => {
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

			abstractHandler.unregisterFullscreenDialogPositionAdjustments();

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
		it( 'should not try to adjust position when there is no Dialog plugin loaded', async () => {
			await editor.destroy();

			editor = await ClassicEditor.create( domElement, {
				plugins: [
					Paragraph
				] } );

			const abstractHandler = new AbstractEditorHandler( editor );

			const spy = sinon.spy( editor.plugins, 'get' );

			abstractHandler._setNewDialogPosition();
			abstractHandler.unregisterFullscreenDialogPositionAdjustments();

			expect( spy ).not.to.be.called;

			await editor.destroy();
		} );

		it( 'should not try to adjust position when dialog position is different than editor-top-side', () => {
			const container = document.createElement( 'div' );
			container.style.width = '2000px';
			container.style.height = '1000px';

			document.body.appendChild( container );

			abstractHandler._container = container;
			const editorContainer = document.createElement( 'div' );
			editorContainer.style.width = '1000px';
			editorContainer.style.height = '500px';

			editorContainer.classList.add( 'ck-fullscreen__editable' );
			document.body.appendChild( editorContainer );

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

			const dialogPositionLeft = dialogPlugin.view._left;
			const dialogPositionTop = dialogPlugin.view._top;

			abstractHandler._setNewDialogPosition();

			expect( dialogPositionLeft ).to.equal( dialogPlugin.view._left );
			expect( dialogPositionTop ).to.equal( dialogPlugin.view._top );

			editorContainer.remove();
			container.remove();
		} );

		it( 'should change position of dialog when dialog position is editor-top-side', () => {
			const container = document.createElement( 'div' );
			container.style.width = '2000px';
			container.style.height = '1000px';

			document.body.appendChild( container );

			abstractHandler._container = container;
			const editorContainer = document.createElement( 'div' );
			editorContainer.style.width = '1000px';
			editorContainer.style.height = '500px';

			editorContainer.classList.add( 'ck-fullscreen__editable' );
			document.body.appendChild( editorContainer );

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

			dialogPlugin.hide();

			const dialogPositionLeft = dialogPlugin.view._left;
			const dialogPositionTop = dialogPlugin.view._top;

			editor.commands.get( 'fullscreen' ).execute();

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

			expect( dialogPositionLeft ).not.to.equal( dialogPlugin.view._left );
			expect( dialogPositionTop ).not.to.equal( dialogPlugin.view._top );

			editorContainer.remove();
			editor.commands.get( 'fullscreen' ).execute();
			container.remove();
		} );
	} );
} );
