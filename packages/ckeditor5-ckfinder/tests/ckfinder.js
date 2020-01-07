/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';

import CKFinder from '../src/ckfinder';
import CKFinderUI from '../src/ckfinderui';
import CKFinderEditing from '../src/ckfinderediting';
import CKFinderUploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';

describe( 'CKFinder', () => {
	let editorElement, editor;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ CKFinder ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( CKFinder ) ).to.instanceOf( CKFinder );
	} );

	it( 'should load CKFinderUI plugin', () => {
		expect( editor.plugins.get( CKFinderUI ) ).to.instanceOf( CKFinderUI );
	} );

	it( 'should load CKFinderEditing plugin', () => {
		expect( editor.plugins.get( CKFinderEditing ) ).to.instanceOf( CKFinderEditing );
	} );

	it( 'should load AdapterCKFinder plugin', () => {
		expect( editor.plugins.get( CKFinderUploadAdapter ) ).to.instanceOf( CKFinderUploadAdapter );
	} );

	it( 'has proper name', () => {
		expect( CKFinder.pluginName ).to.equal( 'CKFinder' );
	} );
} );
