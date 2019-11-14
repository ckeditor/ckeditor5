/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import testUtils from './_utils/utils';
import ClassicTestEditor from './_utils/classictesteditor';

import RestrictedDocument from './../src/restricteddocument';
import RestrictedDocumentUI from './../src/restricteddocumentui';
import RestrictedDocumentEditing from './../src/restricteddocumentediting';

describe( 'RestrictedDocument', () => {
	let editor, element;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, { plugins: [ RestrictedDocument ] } );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	it( 'should be named', () => {
		expect( RestrictedDocument.pluginName ).to.equal( 'RestrictedDocument' );
	} );

	it( 'should load the RestrictedDocumentEditing plugin', () => {
		expect( editor.plugins.get( RestrictedDocumentEditing ) ).to.be.instanceOf( RestrictedDocumentEditing );
	} );

	it( 'should load the RestrictedDocumentUI plugin', () => {
		expect( editor.plugins.get( RestrictedDocumentUI ) ).to.be.instanceOf( RestrictedDocumentUI );
	} );
} );
