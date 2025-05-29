/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport.js';

import Style from '../src/style.js';
import StyleEditing from '../src/styleediting.js';
import StyleUI from '../src/styleui.js';

describe( 'Style', () => {
	let editor, editorElement;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ Style, GeneralHtmlSupport ]
		} );
	} );

	afterEach( async () => {
		editorElement.remove();

		await editor.destroy();
	} );

	it( 'should be a plugin', () => {
		const style = editor.plugins.get( 'Style' );

		expect( style ).to.instanceOf( Style );
	} );

	it( 'should be named', () => {
		expect( Style.pluginName ).to.equal( 'Style' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Style.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Style.isPremiumPlugin ).to.be.false;
	} );

	it( 'should require StyleEditing and StyleUI', () => {
		expect( Style.requires ).to.deep.equal( [ StyleEditing, StyleUI ] );
	} );
} );
