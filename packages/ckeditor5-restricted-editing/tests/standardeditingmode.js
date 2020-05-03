/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

import StandardEditingMode from './../src/standardeditingmode';
import StandardEditingModeUI from './../src/standardeditingmodeui';
import StandardEditingModeEditing from './../src/standardeditingmodeediting';

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

	it( 'should load the StandardEditingModeEditing plugin', () => {
		expect( editor.plugins.get( StandardEditingModeEditing ) ).to.be.instanceOf( StandardEditingModeEditing );
	} );

	it( 'should load the StandardEditingModeUI plugin', () => {
		expect( editor.plugins.get( StandardEditingModeUI ) ).to.be.instanceOf( StandardEditingModeUI );
	} );
} );
