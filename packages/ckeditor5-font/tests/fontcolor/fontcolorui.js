/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import FontColorEditing from './../../src/fontcolor/fontcolorediting';
import FontColorUI from './../../src/fontcolor/fontcolorui';
import ColorUI from './../../src/ui/colorui';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import fontColorIcon from '../../theme/icons/font-color.svg';

describe( 'FontColorUI', () => {
	let element, editor;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ FontColorEditing, FontColorUI ]
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
		expect( FontColorUI.prototype ).to.be.instanceOf( ColorUI );
	} );

	it( 'has properly set initial values', () => {
		const fontColorUIPlugin = editor.plugins.get( 'FontColorUI' );

		expect( fontColorUIPlugin.commandName ).to.equal( 'fontColor' );
		expect( fontColorUIPlugin.componentName ).to.equal( 'fontColor' );
		expect( fontColorUIPlugin.icon ).to.equal( fontColorIcon );
		expect( fontColorUIPlugin.dropdownLabel ).to.equal( 'Font Color' );
		expect( fontColorUIPlugin.columns ).to.equal( 5 );
	} );
} );
