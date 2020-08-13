/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Image from '../../src/image';
import ImageUploadUI from '../../src/imageupload/imageuploadui';
import ImageUploadEditing from '../../src/imageupload/imageuploadediting';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Link from '@ckeditor/ckeditor5-link/src/link';
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder';
import { createImageTypeRegExp, prepareIntegrations } from '../../src/imageupload/utils';

describe( 'upload utils', () => {
	describe( 'createImageTypeRegExp()', () => {
		it( 'should return RegExp for testing regular mime type', () => {
			expect( createImageTypeRegExp( [ 'png' ] ).test( 'image/png' ) ).to.be.true;
			expect( createImageTypeRegExp( [ 'png' ] ).test( 'foo/png' ) ).to.be.false;
			expect( createImageTypeRegExp( [ 'png' ] ).test( 'png' ) ).to.be.false;
		} );

		it( 'should return RegExp for testing mime type with dot', () => {
			expect( createImageTypeRegExp( [ 'vnd.microsoft.icon' ] ).test( 'image/vnd.microsoft.icon' ) ).to.be.true;
			expect( createImageTypeRegExp( [ 'png' ] ).test( 'foo/vnd.microsoft.icon' ) ).to.be.false;
			expect( createImageTypeRegExp( [ 'png' ] ).test( 'vnd.microsoft.icon' ) ).to.be.false;
		} );

		it( 'should return RegExp for testing mime type with dash', () => {
			expect( createImageTypeRegExp( [ 'x-xbitmap' ] ).test( 'image/x-xbitmap' ) ).to.be.true;
			expect( createImageTypeRegExp( [ 'png' ] ).test( 'foo/x-xbitmap' ) ).to.be.false;
			expect( createImageTypeRegExp( [ 'png' ] ).test( 'x-xbitmap' ) ).to.be.false;
		} );

		it( 'should return RegExp for testing mime type with plus', () => {
			expect( createImageTypeRegExp( [ 'svg+xml' ] ).test( 'image/svg+xml' ) ).to.be.true;
			expect( createImageTypeRegExp( [ 'png' ] ).test( 'foo/svg+xml' ) ).to.be.false;
			expect( createImageTypeRegExp( [ 'png' ] ).test( 'svg+xml' ) ).to.be.false;
		} );
	} );

	describe( 'prepareIntegrations()', () => {
		it( 'should return "insetImageViaUrl" and "openCKFinder" integrations', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicEditor
				.create( editorElement, {
					plugins: [
						CKFinder,
						Paragraph,
						Image,
						ImageUploadEditing,
						ImageUploadUI
					],
					image: {
						upload: {
							panel: {
								items: [
									'insertImageViaUrl',
									'openCKFinder'
								]
							}
						}
					}
				} );

			const openCKFinderExtendedView = Object.values( prepareIntegrations( editor ) )[ 1 ];

			expect( openCKFinderExtendedView.class ).contains( 'ck-image-upload__ck-finder-button' );
			expect( openCKFinderExtendedView.label ).to.equal( 'Insert image or file' );
			expect( openCKFinderExtendedView.withText ).to.be.true;

			editor.destroy();
			editorElement.remove();
		} );

		it( 'should return only "inserImageViaUrl" integration', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicEditor
				.create( editorElement, {
					plugins: [
						Paragraph,
						Image,
						ImageUploadEditing,
						ImageUploadUI
					],
					image: {
						upload: {
							panel: {
								items: [
									'insertImageViaUrl',
									'openCKFinder'
								]
							}
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
						ImageUploadEditing,
						ImageUploadUI
					],
					image: {
						upload: {
							panel: {
								items: [
									'link'
								]
							}
						}
					}
				} );

			expect( Object.values( prepareIntegrations( editor ) ).length ).to.equal( 1 );
			expect( Object.values( prepareIntegrations( editor ) )[ 0 ].label ).to.equal( 'Link' );
			expect( Object.values( prepareIntegrations( editor ) )[ 0 ] ).to.be.instanceOf( ButtonView );

			editor.destroy();
			editorElement.remove();
		} );

		it( 'should not return any integrations, should return "null" instead', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicEditor
				.create( editorElement, {
					plugins: [
						Paragraph,
						Image,
						ImageUploadEditing,
						ImageUploadUI
					]
				} );

			expect( prepareIntegrations( editor ) ).to.equal( null );

			editor.destroy();
			editorElement.remove();
		} );
	} );
} );
