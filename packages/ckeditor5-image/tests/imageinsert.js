/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import ImageInsert from '../src/imageinsert.js';
import ImageUpload from '../src/imageupload.js';
import ImageInsertUI from '../src/imageinsert/imageinsertui.js';
import ImageInsertViaUrl from '../src/imageinsertviaurl.js';

import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';

describe( 'ImageInsert', () => {
	let editorElement, editor;

	beforeEach( async () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ ImageInsert ]
		} );
	} );

	afterEach( async () => {
		editorElement.remove();

		await editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( 'ImageInsert' ) ).to.instanceOf( ImageInsert );
	} );

	it( 'should load ImageInsertUI plugin', () => {
		expect( editor.plugins.get( 'ImageInsertUI' ) ).to.instanceOf( ImageInsertUI );
	} );

	it( 'should load ImageUpload plugin', () => {
		expect( editor.plugins.get( 'ImageUpload' ) ).to.instanceOf( ImageUpload );
	} );

	it( 'should load ImageInsertViaUrl plugin', () => {
		expect( editor.plugins.get( 'ImageInsertViaUrl' ) ).to.instanceOf( ImageInsertViaUrl );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ImageInsert.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ImageInsert.isPremiumPlugin ).to.be.false;
	} );
} );
