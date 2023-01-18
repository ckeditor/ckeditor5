/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import ImageInsertUI from '../src/imageinsert/imageinsertui';
import ImageInsertViaUrl from '../src/imageinsertviaurl';

import global from '@ckeditor/ckeditor5-utils/src/dom/global';

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

	it( 'should not load ImageUpload plugin', () => {
		expect( editor.plugins.has( 'ImageUpload' ) ).to.be.false;
	} );
} );
