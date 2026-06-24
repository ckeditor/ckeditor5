/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';

import { Indent } from '../src/indent.js';
import { IndentEditing } from '../src/indentediting.js';
import { IndentUI } from '../src/indentui.js';

describe( 'Indent', () => {
	let editor, element;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, { plugins: [ Indent ] } )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		element.remove();

		if ( editor ) {
			return editor.destroy();
		}
	} );

	it( 'should be named', () => {
		expect( Indent.pluginName ).toBe( 'Indent' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Indent.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Indent.isPremiumPlugin ).toBe( false );
	} );

	it( 'should load the IndentUI plugin', () => {
		expect( editor.plugins.get( IndentUI ) ).toBeInstanceOf( IndentUI );
	} );

	it( 'should load the IndentEditing plugin', () => {
		expect( editor.plugins.get( IndentEditing ) ).toBeInstanceOf( IndentEditing );
	} );
} );
