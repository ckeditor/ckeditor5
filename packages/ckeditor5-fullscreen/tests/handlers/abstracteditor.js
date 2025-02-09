/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';
import { assertCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';

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
		abstractHandler.getContainer().remove();

		return editor.destroy();
	} );

	describe( 'constructor', () => {
		it( 'should create element maps', () => {
			expect( abstractHandler._idToPlaceholder ).to.be.an.instanceOf( Map );
			expect( abstractHandler._placeholderToElement ).to.be.an.instanceOf( Map );
		} );

		it( 'should set the editor instance as a property', () => {
			expect( abstractHandler._editor ).to.equal( editor );
		} );

		it( 'should setup listener returning moved elements when editor is destroyed', async () => {
			const spy = sinon.spy( abstractHandler, 'returnMovedElements' );

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

			abstractHandler.returnMovedElements();
			element.remove();
		} );
	} );

	describe( '#returnMovedElement()', () => {
		it( 'should return only target moved element', () => {
			const element = global.document.createElement( 'div' );
			const element2 = global.document.createElement( 'div' );

			global.document.body.appendChild( element );
			global.document.body.appendChild( element2 );

			abstractHandler.moveToFullscreen( element, 'menu-bar' );
			abstractHandler.moveToFullscreen( element2, 'editable' );

			// Move `menu-bar` back.
			abstractHandler.returnMovedElement( 'menu-bar' );

			expect( abstractHandler._idToPlaceholder.size ).to.equal( 1 );
			expect( abstractHandler._placeholderToElement.size ).to.equal( 1 );
			expect( global.document.querySelector( '[data-ck-fullscreen-placeholder="menu-bar"' ) ).to.be.null;
			expect( global.document.querySelector( '[data-ck-fullscreen-placeholder="editable"' ) ).to.not.be.null;

			abstractHandler.returnMovedElement( 'editable' );
			element.remove();
			element2.remove();
		} );

		it( 'should destroy the container if there are no other elements left', () => {
			const element = global.document.createElement( 'div' );

			global.document.body.appendChild( element );

			abstractHandler.moveToFullscreen( element, 'menu-bar' );
			abstractHandler.returnMovedElement( 'menu-bar' );

			expect( abstractHandler._container ).to.be.null;

			element.remove();
		} );
	} );

	describe( '#returnMovedElements()', () => {
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
				abstractHandler._placeholderToElement.has( global.document.querySelector( '[data-ck-fullscreen-placeholder="menu-bar"' ) )
			).to.be.true;
			expect(
				abstractHandler._placeholderToElement.has( global.document.querySelector( '[data-ck-fullscreen-placeholder="editable"' ) )
			).to.be.true;
			expect( abstractHandler._idToPlaceholder.size ).to.equal( 2 );
			expect( abstractHandler._placeholderToElement.size ).to.equal( 2 );

			abstractHandler.returnMovedElements();

			expect( abstractHandler._idToPlaceholder.size ).to.equal( 0 );
			expect( abstractHandler._placeholderToElement.size ).to.equal( 0 );
			expect( global.document.querySelector( '[data-ck-fullscreen-placeholder="menu-bar"' ) ).to.be.null;
			expect( global.document.querySelector( '[data-ck-fullscreen-placeholder="editable"' ) ).to.be.null;

			element.remove();
			element2.remove();
		} );

		it( 'should destroy the container if it was created', () => {
			const container = abstractHandler.getContainer();

			abstractHandler.returnMovedElements();

			expect( abstractHandler._container ).to.be.null;
			expect( container.parentElement ).to.be.null;
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
					<div class="ck ck-fullscreen__sidebar" data-ck-fullscreen="left-sidebar"></div>
					<div class="ck ck-fullscreen__editable" data-ck-fullscreen="editable"></div>
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
		it( 'should throw an error', () => {
			try {
				abstractHandler.enable();
			} catch ( error ) {
				assertCKEditorError( error, /^fullscreen-invalid-editor-type/ );
			}
		} );
	} );

	describe( '#disable()', () => {
		it( 'should throw an error', () => {
			try {
				abstractHandler.disable();
			} catch ( error ) {
				assertCKEditorError( error, /^fullscreen-invalid-editor-type/ );
			}
		} );
	} );
} );
