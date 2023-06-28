/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import { global } from '@ckeditor/ckeditor5-utils';

import ShowBlocks from '../src/showblocks';
import ShowBlocksEditing from '../src/showblocksediting';
import ShowBlocksUI from '../src/showblocksui';

describe( 'ShowBlocks', () => {
	it( 'should be correctly named', () => {
		expect( ShowBlocks.pluginName ).to.equal( 'ShowBlocks' );
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
