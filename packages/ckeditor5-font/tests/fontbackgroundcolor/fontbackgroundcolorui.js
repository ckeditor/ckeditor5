/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import FontBackgroundColorEditing from './../../src/fontbackgroundcolor/fontbackgroundcolorediting';
import FontBackgroundColorUI from './../../src/fontbackgroundcolor/fontbackgroundcolorui';
import ColorUI from './../../src/ui/colorui';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import fontBackgroundColorIcon from '../../theme/icons/font-background.svg';

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
		expect( fontBackgroundColorUIPlugin.icon ).to.equal( fontBackgroundColorIcon );
		expect( fontBackgroundColorUIPlugin.dropdownLabel ).to.equal( 'Font Background Color' );
		expect( fontBackgroundColorUIPlugin.columns ).to.equal( 5 );
	} );
} );
