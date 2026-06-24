/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { IconFontBackground } from '@ckeditor/ckeditor5-icons';
import { FontBackgroundColorEditing } from './../../src/fontbackgroundcolor/fontbackgroundcolorediting.js';
import { FontBackgroundColorUI } from './../../src/fontbackgroundcolor/fontbackgroundcolorui.js';
import { FontColorUIBase } from './../../src/ui/colorui.js';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';

describe( 'FontBckgroundColorUI', () => {
	let element, editor;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ FontBackgroundColorEditing, FontBackgroundColorUI ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	it( 'is FontColorUIBase', () => {
		expect( FontBackgroundColorUI.prototype ).toBeInstanceOf( FontColorUIBase );
	} );

	it( 'has properly set initial values', () => {
		const fontBackgroundColorUIPlugin = editor.plugins.get( 'FontBackgroundColorUI' );

		expect( fontBackgroundColorUIPlugin.commandName ).toEqual( 'fontBackgroundColor' );
		expect( fontBackgroundColorUIPlugin.componentName ).toEqual( 'fontBackgroundColor' );
		expect( fontBackgroundColorUIPlugin.icon ).toEqual( IconFontBackground );
		expect( fontBackgroundColorUIPlugin.dropdownLabel ).toEqual( 'Font Background Color' );
		expect( fontBackgroundColorUIPlugin.columns ).toEqual( 5 );
	} );
} );
