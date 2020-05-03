/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

import RestrictedEditingMode from './../src/restrictededitingmode';
import RestrictedEditingModeUI from './../src/restrictededitingmodeui';
import RestrictedEditingModeEditing from './../src/restrictededitingmodeediting';

describe( 'RestrictedEditingMode', () => {
	let editor, element;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, { plugins: [ RestrictedEditingMode ] } );
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
