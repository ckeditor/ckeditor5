/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

import StandardMode from './../src/standardmode';
import StandardModeUI from './../src/standardmodeui';
import StandardModeEditing from './../src/standardmodeediting';

describe( 'StandardMode', () => {
	let editor, element;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, { plugins: [ StandardMode ] } );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	it( 'should be named', () => {
		expect( StandardMode.pluginName ).to.equal( 'StandardMode' );
	} );

	it( 'should load the StandardModeEditing plugin', () => {
		expect( editor.plugins.get( StandardModeEditing ) ).to.be.instanceOf( StandardModeEditing );
	} );

	it( 'should load the StandardModeUI plugin', () => {
		expect( editor.plugins.get( StandardModeUI ) ).to.be.instanceOf( StandardModeUI );
	} );
} );
