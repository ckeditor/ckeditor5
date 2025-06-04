/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Essentials from '../src/essentials.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';

import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard.js';
import Enter from '@ckeditor/ckeditor5-enter/src/enter.js';
import SelectAll from '@ckeditor/ckeditor5-select-all/src/selectall.js';
import ShiftEnter from '@ckeditor/ckeditor5-enter/src/shiftenter.js';
import Typing from '@ckeditor/ckeditor5-typing/src/typing.js';
import Undo from '@ckeditor/ckeditor5-undo/src/undo.js';
import { AccessibilityHelp } from '@ckeditor/ckeditor5-ui';

describe( 'Essentials preset', () => {
	let editor, editorElement;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor.create( editorElement, { plugins: [ Essentials ] } )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( async () => {
		await editor.destroy();

		editorElement.remove();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( Essentials ) ).to.be.instanceOf( Essentials );
	} );

	it( 'should load all its dependencies', () => {
		expect( editor.plugins.get( AccessibilityHelp ) ).to.be.instanceOf( AccessibilityHelp );
		expect( editor.plugins.get( Clipboard ) ).to.be.instanceOf( Clipboard );
		expect( editor.plugins.get( Enter ) ).to.be.instanceOf( Enter );
		expect( editor.plugins.get( SelectAll ) ).to.be.instanceOf( SelectAll );
		expect( editor.plugins.get( ShiftEnter ) ).to.be.instanceOf( ShiftEnter );
		expect( editor.plugins.get( Typing ) ).to.be.instanceOf( Typing );
		expect( editor.plugins.get( Undo ) ).to.be.instanceOf( Undo );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Essentials.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Essentials.isPremiumPlugin ).to.be.false;
	} );
} );
