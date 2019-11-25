/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

import RestrictedMode from './../src/restrictedmode';
import RestrictedModeUI from './../src/restrictedmodeui';
import RestrictedModeEditing from './../src/restrictedmodeediting';

describe( 'RestrictedMode', () => {
	let editor, element;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, { plugins: [ RestrictedMode ] } );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	it( 'should be named', () => {
		expect( RestrictedMode.pluginName ).to.equal( 'RestrictedMode' );
	} );

	it( 'should load the RestrictedModeEditing plugin', () => {
		expect( editor.plugins.get( RestrictedModeEditing ) ).to.be.instanceOf( RestrictedModeEditing );
	} );

	it( 'should load the RestrictedModeUI plugin', () => {
		expect( editor.plugins.get( RestrictedModeUI ) ).to.be.instanceOf( RestrictedModeUI );
	} );
} );
