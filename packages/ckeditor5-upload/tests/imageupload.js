/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classic';
import Image from '@ckeditor/ckeditor5-image/src/image';
import FileDialogButtonView from '../src/ui/filedialogbuttonview';
import ImageUpload from '../src/imageupload';
import ImageUploadEngine from '../src/imageuploadengine';
import { createNativeFileMock } from './_utils/mocks';

describe( 'ImageUpload', () => {
	let editor;

	beforeEach( () => {
		const editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicEditor.create( editorElement, {
			plugins: [ Image, ImageUpload ]
		} )
		.then( newEditor => {
			editor = newEditor;
		} );
	} );

	it( 'should load ImageUploadEngine', () => {
		expect( editor.plugins.get( ImageUploadEngine ) ).to.be.instanceOf( ImageUploadEngine );
	} );

	it( 'should register insertImage button', () => {
		const button = editor.ui.componentFactory.create( 'insertImage' );

		expect( button ).to.be.instanceOf( FileDialogButtonView );
	} );

	it( 'should execute imageUpload command', () => {
		const executeStub = sinon.stub( editor, 'execute' );
		const button = editor.ui.componentFactory.create( 'insertImage' );
		const files = [ createNativeFileMock() ];

		button.fire( 'done', files );
		sinon.assert.calledOnce( executeStub );
		expect( executeStub.firstCall.args[ 0 ] ).to.equal( 'imageUpload' );
		expect( executeStub.firstCall.args[ 1 ].file ).to.equal( files[ 0 ] );
	} );
} );

