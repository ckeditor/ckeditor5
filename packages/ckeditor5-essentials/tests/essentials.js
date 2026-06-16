/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Essentials } from '../src/essentials.js';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Clipboard } from '@ckeditor/ckeditor5-clipboard';
import { Enter, ShiftEnter } from '@ckeditor/ckeditor5-enter';
import { SelectAll } from '@ckeditor/ckeditor5-select-all';
import { Typing } from '@ckeditor/ckeditor5-typing';
import { Undo } from '@ckeditor/ckeditor5-undo';
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
		expect( editor.plugins.get( Essentials ) ).toBeInstanceOf( Essentials );
	} );

	it( 'should load all its dependencies', () => {
		expect( editor.plugins.get( AccessibilityHelp ) ).toBeInstanceOf( AccessibilityHelp );
		expect( editor.plugins.get( Clipboard ) ).toBeInstanceOf( Clipboard );
		expect( editor.plugins.get( Enter ) ).toBeInstanceOf( Enter );
		expect( editor.plugins.get( SelectAll ) ).toBeInstanceOf( SelectAll );
		expect( editor.plugins.get( ShiftEnter ) ).toBeInstanceOf( ShiftEnter );
		expect( editor.plugins.get( Typing ) ).toBeInstanceOf( Typing );
		expect( editor.plugins.get( Undo ) ).toBeInstanceOf( Undo );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Essentials.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Essentials.isPremiumPlugin ).toBe( false );
	} );
} );
