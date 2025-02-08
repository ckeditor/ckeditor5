/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import { DecoupledEditor } from '@ckeditor/ckeditor5-editor-decoupled';
import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';

import DecoupledEditorHandler from '../../src/handlers/decouplededitor.js';

describe( 'DecoupledEditorHandler', () => {
	let decoupledEditorHandler, domElement, editor;

	beforeEach( async () => {
		domElement = global.document.createElement( 'div' );
		global.document.body.appendChild( domElement );

		editor = await DecoupledEditor.create( domElement, {
			plugins: [
				Paragraph,
				Essentials
			]
		} );

		decoupledEditorHandler = new DecoupledEditorHandler( editor );
	} );

	afterEach( () => {
		decoupledEditorHandler.getContainer().remove();
		domElement.remove();

		return editor.destroy();
	} );

	describe( 'constructor', () => {
		it( 'should set the editor instance as a property', () => {
			expect( decoupledEditorHandler._editor ).to.equal( editor );
		} );

		it( 'should setup listener disabling fullscreen when editor is destroyed', async () => {
			const spy = sinon.spy( decoupledEditorHandler, 'disable' );

			await editor.destroy();

			expect( spy ).to.have.been.calledOnce;
		} );
	} );

	describe( '#enable()', () => {
		it( 'should move the editable, toolbar and menu bar to the fullscreen container', () => {
			decoupledEditorHandler.enable();

			expect( decoupledEditorHandler.getContainer().querySelector( '[data-ck-fullscreen=editor]' ).children[ 0 ] )
				.to.equal( editor.editing.view.getDomRoot() );
			expect( decoupledEditorHandler.getContainer().querySelector( '[data-ck-fullscreen=toolbar]' ).children[ 0 ] )
				.to.equal( editor.ui.view.toolbar.element );
			expect( decoupledEditorHandler.getContainer().querySelector( '[data-ck-fullscreen=menu-bar]' ).children[ 0 ] )
				.to.equal( editor.ui.view.menuBarView.element );
		} );
	} );

	describe( '#disable()', () => {
		it( 'should call #returnMovedElements()', () => {
			const spy = sinon.spy( decoupledEditorHandler, 'returnMovedElements' );

			decoupledEditorHandler.disable();

			expect( spy ).to.have.been.calledOnce;
		} );
	} );
} );
