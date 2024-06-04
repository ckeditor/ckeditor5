/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

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

	it( 'should load the RestrictedEditingModeEditing plugin', () => {
		expect( editor.plugins.get( RestrictedEditingModeEditing ) ).to.be.instanceOf( RestrictedEditingModeEditing );
	} );

	it( 'should load the RestrictedEditingModeUI plugin', () => {
		expect( editor.plugins.get( RestrictedEditingModeUI ) ).to.be.instanceOf( RestrictedEditingModeUI );
	} );
} );
