/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Essentials } from '@ckeditor/ckeditor5-essentials';

import AbstractEditorHandler from '../../src/handlers/abstracteditor.js';

describe( 'AbstractHandler', () => {
	let abstractHandler, domElement, editor;

	beforeEach( async () => {
		domElement = global.document.createElement( 'div' );
		global.document.body.appendChild( domElement );

		editor = await ClassicEditor.create( domElement, {
			plugins: [
				Paragraph,
				Essentials
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
		it( 'should create a `#_movedElements` map', () => {
			expect( abstractHandler._movedElements ).to.be.an.instanceOf( Map );
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

			abstractHandler.moveToFullscreen( element, 'editor' );

			expect( abstractHandler.getContainer().querySelector( '#element' ) ).to.equal( element );

			abstractHandler._movedElements.get( element ).remove();
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
				<div class="ck ck-fullscreen__editor-wrapper">
					<div class="ck ck-fullscreen__sidebar ck-fullscreen__left-sidebar" data-ck-fullscreen="left-sidebar">
						<div class="ck ck-fullscreen__left-sidebar--sticky" data-ck-fullscreen="left-sidebar-sticky"></div> 
					</div>
					<div class="ck ck-fullscreen__editor" data-ck-fullscreen="editor"></div>
					<div class="ck ck-fullscreen__sidebar" data-ck-fullscreen="right-sidebar"></div>
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
			abstractHandler.moveToFullscreen( element2, 'editor' );

			expect( global.document.querySelector( '[data-ck-fullscreen-placeholder="menu-bar"' ) ).to.equal(
				abstractHandler._movedElements.get( element )
			);
			expect( global.document.querySelector( '[data-ck-fullscreen-placeholder="editor"' ) ).to.equal(
				abstractHandler._movedElements.get( element2 )
			);

			abstractHandler.disable();

			expect( abstractHandler._movedElements.size ).to.equal( 0 );
			expect( global.document.querySelector( '[data-ck-fullscreen-placeholder="menu-bar"' ) ).to.be.null;
			expect( global.document.querySelector( '[data-ck-fullscreen-placeholder="editor"' ) ).to.be.null;

			element.remove();
			element2.remove();
		} );

		it( 'should destroy the container if it was created', () => {
			const container = abstractHandler.getContainer();

			abstractHandler.disable();

			expect( abstractHandler._container ).to.be.null;
			expect( container.parentElement ).to.be.null;
		} );
	} );
} );
