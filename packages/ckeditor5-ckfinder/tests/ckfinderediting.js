/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Command } from '@ckeditor/ckeditor5-core';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { ImageEditing, Image, ImageBlock, ImageInline } from '@ckeditor/ckeditor5-image';
import { LinkEditing, Link } from '@ckeditor/ckeditor5-link';
import { Notification } from '@ckeditor/ckeditor5-ui';
import { global } from '@ckeditor/ckeditor5-utils';

import { CKFinder } from '../src/ckfinder.js';
import { CKFinderEditing } from '../src/ckfinderediting.js';
import { CKFinderUploadAdapter } from '@ckeditor/ckeditor5-adapter-ckfinder';

describe( 'CKFinderEditing', () => {
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

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( CKFinderEditing.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( CKFinderEditing.isPremiumPlugin ).toBe( false );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( CKFinderEditing ) ).toBeInstanceOf( CKFinderEditing );
	} );

	it( 'should load Notification plugin', () => {
		expect( editor.plugins.get( Notification ) ).toBeInstanceOf( Notification );
	} );

	it( 'should load ImageEditing plugin', () => {
		expect( editor.plugins.get( ImageEditing ) ).toBeInstanceOf( ImageEditing );
	} );

	it( 'should load LinkEditing plugin', () => {
		expect( editor.plugins.get( LinkEditing ) ).toBeInstanceOf( LinkEditing );
	} );

	it( 'should throw if there is no image plugin loaded', async () => {
		try {
			const editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ CKFinderUploadAdapter, Link, CKFinder ]
			} );

			await editor.destroy();
		} catch ( e ) {
			expect( e.message ).toMatch( /^ckfinder-missing-image-plugin/ );
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

		expect( command ).toBeInstanceOf( Command );
	} );
} );
