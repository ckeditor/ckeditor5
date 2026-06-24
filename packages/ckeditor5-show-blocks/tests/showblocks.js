/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { global } from '@ckeditor/ckeditor5-utils';

import { ShowBlocks } from '../src/showblocks.js';
import { ShowBlocksEditing } from '../src/showblocksediting.js';
import { ShowBlocksUI } from '../src/showblocksui.js';

describe( 'ShowBlocks', () => {
	it( 'should be correctly named', () => {
		expect( ShowBlocks.pluginName ).toBe( 'ShowBlocks' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ShowBlocks.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ShowBlocks.isPremiumPlugin ).toBe( false );
	} );

	describe( 'init()', () => {
		let domElement, editor;

		beforeEach( async () => {
			domElement = global.document.createElement( 'div' );
			global.document.body.appendChild( domElement );

			editor = await ClassicEditor.create( domElement, {
				plugins: [
					Paragraph,
					Heading,
					Essentials,
					ShowBlocks
				]
			} );
		} );

		afterEach( () => {
			domElement.remove();
			return editor.destroy();
		} );

		it( 'should load ShowBlocks plugin', () => {
			const ShowBlocksPlugin = editor.plugins.get( 'ShowBlocks' );

			expect( ShowBlocksPlugin ).toBeInstanceOf( ShowBlocks );
		} );

		it( 'should have proper "requires" value', () => {
			expect( ShowBlocks.requires ).toEqual( [
				ShowBlocksEditing,
				ShowBlocksUI
			] );
		} );

		it( 'should load ShowBlocksEditing plugin', () => {
			expect( editor.plugins.get( ShowBlocksEditing ) ).toBeInstanceOf( ShowBlocksEditing );
		} );

		it( 'should load ShowBlocksUI plugin', () => {
			expect( editor.plugins.get( ShowBlocksUI ) ).toBeInstanceOf( ShowBlocksUI );
		} );
	} );
} );
