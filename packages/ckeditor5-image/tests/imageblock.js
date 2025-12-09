/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { global } from '@ckeditor/ckeditor5-utils';

import { ImageBlock } from '../src/imageblock.js';
import { ImageBlockEditing } from '../src/image/imageblockediting.js';
import { Widget } from '@ckeditor/ckeditor5-widget';
import { ImageTextAlternative } from '../src/imagetextalternative.js';
import { ImageInsertUI } from '../src/imageinsert/imageinsertui.js';

describe( 'ImageBlock', () => {
	let editorElement, editor;

	beforeEach( async () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ ImageBlock, Paragraph ]
		} );
	} );

	afterEach( async () => {
		editorElement.remove();
		await editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ImageBlock ) ).toBeInstanceOf( ImageBlock );
		expect( editor.plugins.get( 'ImageBlock' ) ).toBeInstanceOf( ImageBlock );
	} );

	it( 'should load ImageBlockEditing plugin', () => {
		expect( editor.plugins.get( ImageBlockEditing ) ).toBeInstanceOf( ImageBlockEditing );
	} );

	it( 'should load Widget plugin', () => {
		expect( editor.plugins.get( Widget ) ).toBeInstanceOf( Widget );
	} );

	it( 'should load ImageTextAlternative plugin', () => {
		expect( editor.plugins.get( ImageTextAlternative ) ).toBeInstanceOf( ImageTextAlternative );
	} );

	it( 'should load ImageInsertUI plugin', () => {
		expect( editor.plugins.get( ImageInsertUI ) ).toBeInstanceOf( ImageInsertUI );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ImageBlock.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ImageBlock.isPremiumPlugin ).toBe( false );
	} );
} );
