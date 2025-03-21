/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';

import Fullscreen from '../src/fullscreen.js';
import FullscreenUI from '../src/fullscreenui.js';
import FullscreenEditing from '../src/fullscreenediting.js';

describe( 'Fullscreen', () => {
	let domElement, editor;

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
	} );

	afterEach( () => {
		domElement.remove();
		return editor.destroy();
	} );

	it( 'should have proper "requires" value', () => {
		expect( Fullscreen.requires ).to.deep.equal( [ FullscreenEditing, FullscreenUI ] );
	} );

	it( 'should have a proper name', () => {
		expect( Fullscreen.pluginName ).to.equal( 'Fullscreen' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Fullscreen.isOfficialPlugin ).to.be.true;
	} );
} );
