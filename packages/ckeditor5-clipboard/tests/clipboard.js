/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Clipboard from '../src/clipboard.js';
import ClipboardMarkersUtils from '../src/clipboardmarkersutils.js';
import ClipboardPipeline from '../src/clipboardpipeline.js';
import DragDrop from '../src/dragdrop.js';
import PastePlainText from '../src/pasteplaintext.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { global } from '@ckeditor/ckeditor5-utils';

describe( 'Clipboard Feature', () => {
	let editor, domElement;

	beforeEach( async () => {
		domElement = global.document.createElement( 'div' );
		global.document.body.appendChild( domElement );

		editor = await ClassicTestEditor.create( domElement, {
			plugins: [
				Clipboard
			]
		} );
	} );

	afterEach( async () => {
		domElement.remove();
		await editor.destroy();
	} );

	it( 'requires ClipboardPipeline, DragDrop and PastePlainText', () => {
		expect( Clipboard.requires ).to.deep.equal( [ ClipboardMarkersUtils, ClipboardPipeline, DragDrop, PastePlainText ] );
	} );

	it( 'has proper name', () => {
		expect( Clipboard.pluginName ).to.equal( 'Clipboard' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Clipboard.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Clipboard.isPremiumPlugin ).to.be.false;
	} );

	it( 'should provide keystroke accessibility info', () => {
		expect( editor.accessibility.keystrokeInfos.get( 'contentEditing' ).groups.get( 'common' ).keystrokes ).to.deep.include( {
			label: 'Copy selected content',
			keystroke: 'CTRL+C'
		} );

		expect( editor.accessibility.keystrokeInfos.get( 'contentEditing' ).groups.get( 'common' ).keystrokes ).to.deep.include( {
			label: 'Paste content',
			keystroke: 'CTRL+V'
		} );

		expect( editor.accessibility.keystrokeInfos.get( 'contentEditing' ).groups.get( 'common' ).keystrokes ).to.deep.include( {
			label: 'Paste content as plain text',
			keystroke: 'CTRL+SHIFT+V'
		} );
	} );
} );
