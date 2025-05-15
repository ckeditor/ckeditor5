/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import { global } from '@ckeditor/ckeditor5-utils';

import ShowBlocks from '../src/showblocks.js';
import ShowBlocksEditing from '../src/showblocksediting.js';
import ShowBlocksUI from '../src/showblocksui.js';

describe( 'ShowBlocks', () => {
	it( 'should be correctly named', () => {
		expect( ShowBlocks.pluginName ).to.equal( 'ShowBlocks' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ShowBlocks.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ShowBlocks.isPremiumPlugin ).to.be.false;
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

			expect( ShowBlocksPlugin ).to.be.an.instanceof( ShowBlocks );
		} );

		it( 'should have proper "requires" value', () => {
			expect( ShowBlocks.requires ).to.deep.equal( [
				ShowBlocksEditing,
				ShowBlocksUI
			] );
		} );

		it( 'should load ShowBlocksEditing plugin', () => {
			expect( editor.plugins.get( ShowBlocksEditing ) ).to.instanceOf( ShowBlocksEditing );
		} );

		it( 'should load ShowBlocksUI plugin', () => {
			expect( editor.plugins.get( ShowBlocksUI ) ).to.instanceOf( ShowBlocksUI );
		} );
	} );
} );
