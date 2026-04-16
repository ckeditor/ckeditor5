/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { global } from '@ckeditor/ckeditor5-utils';

import { ShowWhitespace } from '../src/showwhitespace.js';
import { ShowWhitespaceEditing } from '../src/showwhitespaceediting.js';
import { ShowWhitespaceUI } from '../src/showwhitespaceui.js';

describe( 'ShowWhitespace', () => {
	it( 'should be correctly named', () => {
		expect( ShowWhitespace.pluginName ).to.equal( 'ShowWhitespace' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ShowWhitespace.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ShowWhitespace.isPremiumPlugin ).to.be.false;
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
					ShowWhitespace
				]
			} );
		} );

		afterEach( () => {
			domElement.remove();
			return editor.destroy();
		} );

		it( 'should load ShowWhitespace plugin', () => {
			const plugin = editor.plugins.get( 'ShowWhitespace' );

			expect( plugin ).to.be.an.instanceof( ShowWhitespace );
		} );

		it( 'should have proper "requires" value', () => {
			expect( ShowWhitespace.requires ).to.deep.equal( [
				ShowWhitespaceEditing,
				ShowWhitespaceUI
			] );
		} );

		it( 'should load ShowWhitespaceEditing plugin', () => {
			expect( editor.plugins.get( ShowWhitespaceEditing ) ).to.instanceOf( ShowWhitespaceEditing );
		} );

		it( 'should load ShowWhitespaceUI plugin', () => {
			expect( editor.plugins.get( ShowWhitespaceUI ) ).to.instanceOf( ShowWhitespaceUI );
		} );
	} );
} );
