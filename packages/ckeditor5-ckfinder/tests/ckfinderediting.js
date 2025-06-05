/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Command from '@ckeditor/ckeditor5-core/src/command.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import ImageEditing from '@ckeditor/ckeditor5-image/src/image/imageediting.js';
import LinkEditing from '@ckeditor/ckeditor5-link/src/linkediting.js';
import Notification from '@ckeditor/ckeditor5-ui/src/notification/notification.js';
import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';

import CKFinder from '../src/ckfinder.js';
import CKFinderEditing from '../src/ckfinderediting.js';
import Image from '@ckeditor/ckeditor5-image/src/image.js';
import Link from '@ckeditor/ckeditor5-link/src/link.js';
import CKFinderUploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter.js';
import ImageBlock from '@ckeditor/ckeditor5-image/src/imageblock.js';
import ImageInline from '@ckeditor/ckeditor5-image/src/imageinline.js';

describe( 'CKFinderEditing', () => {
	let editorElement, editor;

	testUtils.createSinonSandbox();

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

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( CKFinderEditing.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( CKFinderEditing.isPremiumPlugin ).to.be.false;
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( CKFinderEditing ) ).to.be.instanceOf( CKFinderEditing );
	} );

	it( 'should load Notification plugin', () => {
		expect( editor.plugins.get( Notification ) ).to.instanceOf( Notification );
	} );

	it( 'should load ImageEditing plugin', () => {
		expect( editor.plugins.get( ImageEditing ) ).to.instanceOf( ImageEditing );
	} );

	it( 'should load LinkEditing plugin', () => {
		expect( editor.plugins.get( LinkEditing ) ).to.instanceOf( LinkEditing );
	} );

	it( 'should throw if there is no image plugin loaded', async () => {
		try {
			const editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ CKFinderUploadAdapter, Link, CKFinder ]
			} );

			await editor.destroy();
		} catch ( e ) {
			expect( e.message ).to.match( /^ckfinder-missing-image-plugin/ );
		}
	} );

	it( 'should work if only ImageBlockEditing is loaded', async () => {
		try {
			const editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ CKFinderUploadAdapter, ImageBlock, Link, CKFinder ]
			} );

			await editor.destroy();
		} catch {
			expect.fail( 'Error should not be thrown.' );
		}
	} );

	it( 'should work if only ImageInlineEditing is loaded', async () => {
		try {
			const editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ CKFinderUploadAdapter, ImageInline, Link, CKFinder ]
			} );

			await editor.destroy();
		} catch {
			expect.fail( 'Error should not be thrown.' );
		}
	} );

	it( 'should register command', () => {
		const command = editor.commands.get( 'ckfinder' );

		expect( command ).to.be.instanceOf( Command );
	} );
} );
