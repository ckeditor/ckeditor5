/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import ImageInsertUI from '../src/imageinsert/imageinsertui.js';
import ImageInsertViaUrl from '../src/imageinsertviaurl.js';
import ImageInsertViaUrlUI from '../src/imageinsert/imageinsertviaurlui.js';

import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';

describe( 'ImageInsertViaUrl', () => {
	let editorElement, editor;

	beforeEach( async () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ ImageInsertViaUrl ]
		} );
	} );

	afterEach( async () => {
		editorElement.remove();
		await editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( 'ImageInsertViaUrl' ) ).to.instanceOf( ImageInsertViaUrl );
	} );

	it( 'should load ImageInsertUI plugin', () => {
		expect( editor.plugins.get( 'ImageInsertUI' ) ).to.instanceOf( ImageInsertUI );
	} );

	it( 'should load ImageInsertViaUrlUI plugin', () => {
		expect( editor.plugins.get( 'ImageInsertViaUrlUI' ) ).to.instanceOf( ImageInsertViaUrlUI );
	} );

	it( 'should not load ImageUpload plugin', () => {
		expect( editor.plugins.has( 'ImageUpload' ) ).to.be.false;
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ImageInsertViaUrl.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ImageInsertViaUrl.isPremiumPlugin ).to.be.false;
	} );
} );
