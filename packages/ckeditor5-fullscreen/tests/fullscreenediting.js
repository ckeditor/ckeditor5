/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';

import FullscreenEditing from '../src/fullscreenediting.js';
import FullscreenCommand from '../src/fullscreencommand.js';

describe( 'FullscreenEditing', () => {
	let domElement, editor;

	beforeEach( async () => {
		domElement = global.document.createElement( 'div' );
		global.document.body.appendChild( domElement );

		editor = await ClassicEditor.create( domElement, {
			plugins: [
				Paragraph,
				Essentials,
				FullscreenEditing
			]
		} );
	} );

	afterEach( () => {
		domElement.remove();
		return editor.destroy();
	} );

	it( 'should have proper name', () => {
		expect( FullscreenEditing.pluginName ).to.equal( 'FullscreenEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( FullscreenEditing.isOfficialPlugin ).to.be.true;
	} );

	it( 'should register the `fullscreen` command', () => {
		expect( editor.commands.get( 'fullscreen' ) ).to.be.instanceOf( FullscreenCommand );
	} );
} );
