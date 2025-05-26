/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';

import StandardEditingMode from './../src/standardeditingmode.js';
import StandardEditingModeUI from './../src/standardeditingmodeui.js';
import StandardEditingModeEditing from './../src/standardeditingmodeediting.js';

describe( 'StandardEditingMode', () => {
	let editor, element;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, { plugins: [ StandardEditingMode ] } );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	it( 'should be named', () => {
		expect( StandardEditingMode.pluginName ).to.equal( 'StandardEditingMode' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( StandardEditingMode.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( StandardEditingMode.isPremiumPlugin ).to.be.false;
	} );

	it( 'should load the StandardEditingModeEditing plugin', () => {
		expect( editor.plugins.get( StandardEditingModeEditing ) ).to.be.instanceOf( StandardEditingModeEditing );
	} );

	it( 'should load the StandardEditingModeUI plugin', () => {
		expect( editor.plugins.get( StandardEditingModeUI ) ).to.be.instanceOf( StandardEditingModeUI );
	} );
} );
