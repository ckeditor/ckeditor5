/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard.js';
import Image from '@ckeditor/ckeditor5-image/src/image.js';
import ImageUploadEditing from '@ckeditor/ckeditor5-image/src/imageupload/imageuploadediting.js';
import ImageUploadProgress from '@ckeditor/ckeditor5-image/src/imageupload/imageuploadprogress.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository.js';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin.js';
import UploadcareEditing from '../src/uploadcareediting.js';
import UploadcareUploadAdapter from '../src/uploadcareuploadadapter.js';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'UploadcareUploadAdapter', () => {
	let editor, editorElement;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [
					Clipboard,
					Paragraph,
					Image,
					ImageUploadEditing,
					ImageUploadProgress,
					UploadcareEditing,
					UploadcareUploadAdapter
				],
				uploadcare: {
					pubKey: 'KEY'
				}
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		if ( editorElement ) {
			editorElement.remove();
		}

		if ( editor ) {
			return editor.destroy();
		}
	} );

	it( 'should be named', () => {
		expect( UploadcareUploadAdapter.pluginName ).to.equal( 'UploadcareUploadAdapter' );
	} );

	it( 'should require its dependencies', () => {
		expect( UploadcareUploadAdapter.requires ).to.deep.equal( [
			'ImageUploadEditing', 'ImageUploadProgress', FileRepository, UploadcareEditing
		] );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( UploadcareUploadAdapter ) ).to.be.instanceOf( UploadcareUploadAdapter );
	} );

	describe( 'initialization', () => {
		function uploadAdapterCreator() {}

		class OtherUploadAdapter extends Plugin {
			static get requires() {
				return [ FileRepository ];
			}

			async init() {
				this.editor.plugins.get( FileRepository ).createUploadAdapter = uploadAdapterCreator;
			}
		}

		it( 'should not overwrite existing upload adapter if `config.uploadcare` is missing', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicTestEditor
				.create( editorElement, {
					plugins: [
						OtherUploadAdapter,
						Clipboard,
						Paragraph,
						Image,
						ImageUploadEditing,
						ImageUploadProgress,
						UploadcareEditing,
						UploadcareUploadAdapter
					]
				} );

			const fileRepositoryPlugin = editor.plugins.get( FileRepository );

			expect( fileRepositoryPlugin.createUploadAdapter ).to.equal( uploadAdapterCreator );

			editorElement.remove();
			return editor.destroy();
		} );

		it( 'should overwrite existing upload adapter if `config.uploadcare` is set', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicTestEditor
				.create( editorElement, {
					plugins: [
						OtherUploadAdapter,
						Clipboard,
						Paragraph,
						Image,
						ImageUploadEditing,
						ImageUploadProgress,
						UploadcareEditing,
						UploadcareUploadAdapter
					],
					uploadcare: {
						pubKey: 'KEY'
					}
				} );

			const fileRepositoryPlugin = editor.plugins.get( FileRepository );

			expect( fileRepositoryPlugin.createUploadAdapter ).to.be.a( 'function' );
			expect( fileRepositoryPlugin.createUploadAdapter ).not.to.equal( uploadAdapterCreator );

			editorElement.remove();
			return editor.destroy();
		} );
	} );
} );
