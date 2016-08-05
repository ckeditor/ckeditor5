/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Editor from '/ckeditor5/core/editor/editor.js';
import BoxedEditorUI from '/ckeditor5/ui/editorui/boxed/boxededitorui.js';
import ControllerCollection from '/ckeditor5/ui/controllercollection.js';

describe( 'BoxedEditorUI', () => {
	let editor, boxedEditorUI;

	beforeEach( () => {
		editor = new Editor( null, {
			ui: {
				width: 100,
				height: 200
			}
		} );
		boxedEditorUI = new BoxedEditorUI( editor );
	} );

	describe( 'constructor', () => {
		it( 'adds controller collections', () => {
			expect( boxedEditorUI.collections.get( 'top' ) ).to.be.instanceof( ControllerCollection );
			expect( boxedEditorUI.collections.get( 'main' ) ).to.be.instanceof( ControllerCollection );
		} );

		it( 'sets "width" and "height" attributes', () => {
			expect( boxedEditorUI.width ).to.equal( editor.config.get( 'ui.width' ) );
			expect( boxedEditorUI.height ).to.equal( editor.config.get( 'ui.height' ) );
		} );
	} );
} );
