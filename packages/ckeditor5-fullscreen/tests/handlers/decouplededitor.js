/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import { DecoupledEditor } from '@ckeditor/ckeditor5-editor-decoupled';
import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';

import DecoupledEditorHandler from '../../src/handlers/decouplededitorhandler.js';
import FullscreenEditing from '../../src/fullscreenediting.js';

describe( 'DecoupledEditorHandler', () => {
	let decoupledEditorHandler, domElement, editor;

	beforeEach( async () => {
		domElement = global.document.createElement( 'div' );
		global.document.body.appendChild( domElement );

		editor = await DecoupledEditor.create( domElement, {
			plugins: [
				Paragraph,
				Essentials
			],
			fullscreen: {
				menuBar: {
					isVisible: true
				}
			}
		} );

		decoupledEditorHandler = new DecoupledEditorHandler( editor );
	} );

	afterEach( () => {
		decoupledEditorHandler.disable();
		domElement.remove();

		return editor.destroy();
	} );

	describe( 'constructor', () => {
		it( 'should set the editor instance as a property', () => {
			expect( decoupledEditorHandler._editor ).to.be.instanceOf( DecoupledEditor );
		} );
	} );

	describe( '#enable()', () => {
		it( 'should move the editable, toolbar, menu bar and body wrapper to the fullscreen container', () => {
			decoupledEditorHandler.enable();

			expect( decoupledEditorHandler.getWrapper().querySelector( '[data-ck-fullscreen=editable]' ).children[ 1 ] )
				.to.equal( editor.editing.view.getDomRoot() );
			expect( decoupledEditorHandler.getWrapper().querySelector( '[data-ck-fullscreen=toolbar]' ).children[ 0 ] )
				.to.equal( editor.ui.view.toolbar.element );
			expect( decoupledEditorHandler.getWrapper().querySelector( '[data-ck-fullscreen=menu-bar]' ).children[ 0 ] )
				.to.equal( editor.ui.view.menuBarView.element );
		} );

		it( 'should use the configured toolbar behavior', async () => {
			const tempDomElementDynamicToolbar = global.document.createElement( 'div' );
			global.document.body.appendChild( tempDomElementDynamicToolbar );

			const tempEditorDynamicToolbar = await DecoupledEditor.create( tempDomElementDynamicToolbar, {
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

			const tempEditorStaticToolbar = await DecoupledEditor.create( tempDomElementStaticToolbar, {
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
