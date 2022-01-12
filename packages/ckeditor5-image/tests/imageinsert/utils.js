/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Image from '../../src/image';
import ImageUploadUI from '../../src/imageinsert/imageinsertui';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Link from '@ckeditor/ckeditor5-link/src/link';
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder';
import { prepareIntegrations, createLabeledInputView } from '../../src/imageinsert/utils';
import CKFinderUploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';

describe( 'Upload utils', () => {
	describe( 'prepareIntegrations()', () => {
		it( 'should return "insetImageViaUrl" and "openCKFinder" integrations', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicEditor
				.create( editorElement, {
					plugins: [
						Paragraph,
						Link,
						Image,
						ImageUploadUI,
						CKFinderUploadAdapter,
						CKFinder
					],
					image: {
						insert: {
							integrations: [
								'insertImageViaUrl',
								'openCKFinder'
							]
						}
					}
				} );

			const openCKFinderExtendedView = Object.values( prepareIntegrations( editor ) )[ 1 ];

			expect( openCKFinderExtendedView.class ).contains( 'ck-image-insert__ck-finder-button' );
			expect( openCKFinderExtendedView.label ).to.equal( 'Insert image or file' );
			expect( openCKFinderExtendedView.withText ).to.be.true;

			editor.destroy();
			editorElement.remove();
		} );

		it( 'should return only "insertImageViaUrl" integration and throw warning ' +
			'for "image-upload-integrations-invalid-view" error', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicEditor
				.create( editorElement, {
					plugins: [
						Paragraph,
						Image,
						ImageUploadUI
					],
					image: {
						insert: {
							integrations: [
								'insertImageViaUrl',
								'openCKFinder'
							]
						}
					}
				} );

			expect( Object.values( prepareIntegrations( editor ) ).length ).to.equal( 1 );

			editor.destroy();
			editorElement.remove();
		} );

		it( 'should return only "link" integration', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicEditor
				.create( editorElement, {
					plugins: [
						Paragraph,
						Link,
						Image,
						ImageUploadUI
					],
					image: {
						insert: {
							integrations: [
								'link'
							]
						}
					}
				} );

			expect( Object.values( prepareIntegrations( editor ) ).length ).to.equal( 1 );
			expect( Object.values( prepareIntegrations( editor ) )[ 0 ].label ).to.equal( 'Link' );
			expect( Object.values( prepareIntegrations( editor ) )[ 0 ] ).to.be.instanceOf( ButtonView );

			editor.destroy();
			editorElement.remove();
		} );

		it( 'should return "insertImageViaUrl" integration, when no integrations were configured', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicEditor
				.create( editorElement, {
					plugins: [
						Paragraph,
						Image,
						ImageUploadUI
					]
				} );

			expect( Object.keys( prepareIntegrations( editor ) ).length ).to.equal( 1 );

			editor.destroy();
			editorElement.remove();
		} );
	} );

	describe( 'createLabeledInputView()', () => {
		describe( 'image URL input view', () => {
			it( 'should have placeholder', () => {
				const view = createLabeledInputView( { t: val => val } );
				expect( view.fieldView.placeholder ).to.equal( 'https://example.com/image.png' );
			} );
		} );
	} );
} );
