/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';
import CKFinderUploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter.js';
import Image from '@ckeditor/ckeditor5-image/src/image.js';
import Link from '@ckeditor/ckeditor5-link/src/link.js';

import CKFinder from '../src/ckfinder.js';
import CKFinderUI from '../src/ckfinderui.js';
import CKFinderEditing from '../src/ckfinderediting.js';

describe( 'CKFinder', () => {
	let editorElement, editor;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ CKFinderUploadAdapter, Image, Link, CKFinder ]
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

	it( 'should require CKFinderUploadAdapter by name', () => {
		expect( CKFinder.requires ).to.contain( 'CKFinderUploadAdapter' );
	} );

	it( 'has proper name', () => {
		expect( CKFinder.pluginName ).to.equal( 'CKFinder' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( CKFinder.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( CKFinder.isPremiumPlugin ).to.be.false;
	} );
} );
