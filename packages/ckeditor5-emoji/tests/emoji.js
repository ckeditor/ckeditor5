/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import { Mention } from '@ckeditor/ckeditor5-mention';
import { Typing } from '@ckeditor/ckeditor5-typing';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Emoji from '../src/emoji.js';
import EmojiMentionIntegration from '../src/emojimentionintegration.js';

describe( 'Emoji', () => {
	let editor, editorElement;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ Emoji ]
		} );
	} );

	afterEach( async () => {
		editorElement.remove();

		await editor.destroy();
	} );

	it( 'should be correctly named', () => {
		expect( Emoji.pluginName ).to.equal( 'Emoji' );
	} );

	it( 'should have proper "requires" value', () => {
		expect( Emoji.requires ).to.deep.equal( [
			Typing,
			Mention,
			EmojiMentionIntegration
		] );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Emoji.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Emoji.isPremiumPlugin ).to.be.false;
	} );
} );
