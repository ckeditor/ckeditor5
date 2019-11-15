/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

import RestrictedEditingException from './../src/restrictededitingexception';
import RestrictedEditingExceptionUI from './../src/restrictededitingexceptionui';
import RestrictedEditingExceptionEditing from './../src/restrictededitingexceptionediting';

describe( 'RestrictedEditingException', () => {
	let editor, element;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, { plugins: [ RestrictedEditingException ] } );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	it( 'should be named', () => {
		expect( RestrictedEditingException.pluginName ).to.equal( 'RestrictedEditingException' );
	} );

	it( 'should load the RestrictedEditingExceptionEditing plugin', () => {
		expect( editor.plugins.get( RestrictedEditingExceptionEditing ) ).to.be.instanceOf( RestrictedEditingExceptionEditing );
	} );

	it( 'should load the RestrictedEditingExceptionUI plugin', () => {
		expect( editor.plugins.get( RestrictedEditingExceptionUI ) ).to.be.instanceOf( RestrictedEditingExceptionUI );
	} );
} );
