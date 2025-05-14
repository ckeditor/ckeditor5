/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { IconFontBackground } from 'ckeditor5/src/icons.js';
import FontBackgroundColorEditing from './../../src/fontbackgroundcolor/fontbackgroundcolorediting.js';
import FontBackgroundColorUI from './../../src/fontbackgroundcolor/fontbackgroundcolorui.js';
import ColorUI from './../../src/ui/colorui.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';

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

	it( 'is ColorUI', () => {
		expect( FontBackgroundColorUI.prototype ).to.be.instanceOf( ColorUI );
	} );

	it( 'has properly set initial values', () => {
		const fontBackgroundColorUIPlugin = editor.plugins.get( 'FontBackgroundColorUI' );

		expect( fontBackgroundColorUIPlugin.commandName ).to.equal( 'fontBackgroundColor' );
		expect( fontBackgroundColorUIPlugin.componentName ).to.equal( 'fontBackgroundColor' );
		expect( fontBackgroundColorUIPlugin.icon ).to.equal( IconFontBackground );
		expect( fontBackgroundColorUIPlugin.dropdownLabel ).to.equal( 'Font Background Color' );
		expect( fontBackgroundColorUIPlugin.columns ).to.equal( 5 );
	} );
} );
