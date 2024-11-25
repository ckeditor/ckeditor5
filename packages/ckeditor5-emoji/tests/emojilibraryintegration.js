/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Emoji from '../src/emoji.js';
import EmojiLibraryIntegration from '../src/emojilibraryintegration.js';
import { Mention } from '@ckeditor/ckeditor5-mention';

describe( 'EmojiLibraryIntegration', () => {
	let editor, editorElement;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ Emoji, Mention ]
		} );
	} );

	afterEach( async () => {
		editorElement.remove();

		await editor.destroy();
	} );

	it( 'should be correctly named', () => {
		expect( EmojiLibraryIntegration.pluginName ).to.equal( 'EmojiLibraryIntegration' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( EmojiLibraryIntegration.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( EmojiLibraryIntegration.isPremiumPlugin ).to.be.false;
	} );

	describe( 'queryEmoji()', () => {
		let queryEmoji;

		beforeEach( () => {
			queryEmoji = editor.config.get( 'mention.feeds' )[ 0 ].feed;
		} );

		it( 'should be a function', () => {
			expect( queryEmoji ).to.be.instanceOf( Function );
		} );

		it( 'should return nothing when querying a single character', () => {
			return queryEmoji( 'a' ).then( queryResult => {
				expect( queryResult ).to.deep.equal( [] );
			} );
		} );

		it( 'should return note informing that nothing is found when query found nothing', () => {
			return queryEmoji( '!@#$%^&*()' ).then( queryResult => {
				expect( queryResult ).to.deep.equal( [
					{ id: 'emoji:__NO_RESULTS__:' },
					{ id: 'emoji:__SHOW_ALL_EMOJI__:' }
				] );
			} );
		} );

		it( 'should query single emoji properly properly', () => {
			return queryEmoji( 'flag_poland' ).then( queryResult => {
				expect( queryResult ).to.deep.equal( [
					{ id: 'emoji:flag_poland:', text: '🇵🇱' },
					{ id: 'emoji:__SHOW_ALL_EMOJI__:' }
				] );
			} );
		} );

		it( 'should query multiple emojis properly properly', () => {
			return queryEmoji( 'face' ).then( queryResult => {
				expect( queryResult.length ).to.equal( 6 );

				queryResult.forEach( item => {
					expect( item.id.startsWith( 'emoji:' ) ).to.be.true;

					if ( item.id !== 'emoji:__SHOW_ALL_EMOJI__:' ) {
						expect( typeof item.text ).to.equal( 'string' );
					}
				} );
			} );
		} );
	} );
} );
