/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard.js';

import RestrictedEditingMode from './../src/restrictededitingmode.js';
import RestrictedEditingModeUI from './../src/restrictededitingmodeui.js';
import RestrictedEditingModeEditing from './../src/restrictededitingmodeediting.js';

describe( 'RestrictedEditingMode', () => {
	let editor, element;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, { plugins: [ RestrictedEditingMode, Clipboard ] } );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	it( 'should be named', () => {
		expect( RestrictedEditingMode.pluginName ).to.equal( 'RestrictedEditingMode' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( RestrictedEditingMode.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( RestrictedEditingMode.isPremiumPlugin ).to.be.false;
	} );

	it( 'should load the RestrictedEditingModeEditing plugin', () => {
		expect( editor.plugins.get( RestrictedEditingModeEditing ) ).to.be.instanceOf( RestrictedEditingModeEditing );
	} );

	it( 'should load the RestrictedEditingModeUI plugin', () => {
		expect( editor.plugins.get( RestrictedEditingModeUI ) ).to.be.instanceOf( RestrictedEditingModeUI );
	} );
} );
