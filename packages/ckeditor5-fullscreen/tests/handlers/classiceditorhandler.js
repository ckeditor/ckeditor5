/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';

import ClassicEditorHandler from '../../src/handlers/classiceditorhandler.js';
import FullscreenEditing from '../../src/fullscreenediting.js';

describe( 'ClassicEditorHandler', () => {
	let classicEditorHandler, domElement, editor;

	beforeEach( async () => {
		domElement = global.document.createElement( 'div' );
		global.document.body.appendChild( domElement );

		editor = await ClassicEditor.create( domElement, {
			plugins: [
				Paragraph,
				Essentials
			]
		} );

		classicEditorHandler = new ClassicEditorHandler( editor );
	} );

	afterEach( () => {
		classicEditorHandler.disable();
		domElement.remove();

		return editor.destroy();
	} );

	describe( 'constructor', () => {
		it( 'should set the editor instance as a property', () => {
			expect( classicEditorHandler._editor ).to.be.instanceOf( ClassicEditor );
		} );
	} );

	describe( '#enable()', () => {
		it( 'should move the editable, toolbar and body wrapper to the fullscreen container', () => {
			classicEditorHandler.enable();

			expect( classicEditorHandler.getWrapper().querySelector( '[data-ck-fullscreen=editable]' ).children[ 1 ] )
				.to.equal( editor.editing.view.getDomRoot() );
			expect( classicEditorHandler.getWrapper().querySelector( '[data-ck-fullscreen=toolbar]' ).children[ 0 ] )
				.to.equal( editor.ui.view.toolbar.element );
		} );

		it( 'should set [dir] attribute on the fullscreen container', () => {
			classicEditorHandler.enable();

			expect( classicEditorHandler.getWrapper().getAttribute( 'dir' ) ).to.equal( editor.ui.view.element.getAttribute( 'dir' ) );
		} );

		it( 'should set `.ck-rounded-corners` class on the fullscreen container', () => {
			classicEditorHandler.enable();

			expect( classicEditorHandler.getWrapper().classList.contains( 'ck-rounded-corners' ) ).to.be.true;
		} );

		it( 'should move menu bar if it is present', async () => {
			const tempDomElement = global.document.createElement( 'div' );
			global.document.body.appendChild( tempDomElement );

			const tempEditor = await ClassicEditor.create( tempDomElement, {
				plugins: [
					Paragraph,
					Essentials
				],
				menuBar: {
					isVisible: true
				},
				fullscreen: {
					menuBar: {
						isVisible: true
					}
				}
			} );

			const tempClassicEditorHandler = new ClassicEditorHandler( tempEditor );

			tempClassicEditorHandler.enable();

			expect( tempClassicEditorHandler.getWrapper().querySelector( '[data-ck-fullscreen=menu-bar]' ).children[ 0 ] )
				.to.equal( tempEditor.ui.view.menuBarView.element );

			tempDomElement.remove();
			return tempEditor.destroy();
		} );

		it( 'should use the configured toolbar behavior', async () => {
			const tempDomElementDynamicToolbar = global.document.createElement( 'div' );
			global.document.body.appendChild( tempDomElementDynamicToolbar );

			const tempEditorDynamicToolbar = await ClassicEditor.create( tempDomElementDynamicToolbar, {
				plugins: [
					Paragraph,
					Essentials,
					FullscreenEditing
				],
				fullscreen: {
					toolbar: {
						shouldNotGroupWhenFull: true
					}
				}
			} );

			tempEditorDynamicToolbar.execute( 'toggleFullscreen' );

			expect( tempEditorDynamicToolbar.ui.view.toolbar.isGrouping ).to.be.false;

			tempDomElementDynamicToolbar.remove();
			await tempEditorDynamicToolbar.destroy();

			const tempDomElementStaticToolbar = global.document.createElement( 'div' );
			global.document.body.appendChild( tempDomElementStaticToolbar );

			const tempEditorStaticToolbar = await ClassicEditor.create( tempDomElementStaticToolbar, {
				plugins: [
					Paragraph,
					Essentials,
					FullscreenEditing
				],
				fullscreen: {
					toolbar: {
						shouldNotGroupWhenFull: false
					}
				}
			} );

			tempEditorStaticToolbar.execute( 'toggleFullscreen' );

			expect( tempEditorStaticToolbar.ui.view.toolbar.isGrouping ).to.be.true;

			tempDomElementStaticToolbar.remove();
			return tempEditorStaticToolbar.destroy();
		} );
	} );
} );
