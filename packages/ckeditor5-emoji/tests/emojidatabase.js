/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* global window, console, Response */

import { global } from '@ckeditor/ckeditor5-utils';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import EmojiDatabase from '../src/emojidatabase.js';

describe( 'EmojiDatabase', () => {
	testUtils.createSinonSandbox();

	let isEmojiSupportedStub;

	beforeEach( () => {
		isEmojiSupportedStub = testUtils.sinon.stub( EmojiDatabase, '_isEmojiSupported' ).returns( true );
	} );

	it( 'should be correctly named', () => {
		expect( EmojiDatabase.pluginName ).to.equal( 'EmojiDatabase' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( EmojiDatabase.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( EmojiDatabase.isPremiumPlugin ).to.be.false;
	} );

	describe( 'init()', () => {
		let editor, editorPromise, domElement, consoleStub, fetchStub, fetchStubResolve, fetchStubReject;

		beforeEach( () => {
			consoleStub = sinon.stub( console, 'warn' );

			fetchStub = testUtils.sinon.stub( window, 'fetch' ).returns( new Promise( ( resolve, reject ) => {
				fetchStubResolve = resolve;
				fetchStubReject = reject;
			} ) );

			domElement = global.document.createElement( 'div' );
			global.document.body.appendChild( domElement );

			editor = null;
			editorPromise = ClassicTestEditor.create( domElement, {
				plugins: [
					Essentials,
					Paragraph,
					EmojiDatabase
				]
			} );
		} );

		afterEach( async () => {
			if ( !editor ) {
				editor = await editorPromise;
			}

			domElement.remove();

			await editor.destroy();
		} );

		it( 'should fetch the emoji database from the defined URL', async () => {
			const response = JSON.stringify( [
				{ annotation: 'neutral face', group: 0 },
				{ annotation: 'unamused face', group: 0 }
			] );

			fetchStubResolve( new Response( response ) );

			editor = await editorPromise;

			expect( fetchStub.calledOnce ).to.be.true;
			expect( fetchStub.firstCall.args[ 0 ] ).to.equal( 'https://cdn.ckeditor.com/ckeditor5/data/emoji/16/en.json' );

			const emojiDatabasePlugin = editor.plugins.get( EmojiDatabase );

			expect( emojiDatabasePlugin._emojiDatabase ).to.have.length( 2 );
			expect( emojiDatabasePlugin._emojiDatabase[ 0 ] ).to.have.property( 'annotation', 'neutral face' );
			expect( emojiDatabasePlugin._emojiDatabase[ 1 ] ).to.have.property( 'annotation', 'unamused face' );
		} );

		it( 'should filter out group=2 from the fetched emoji database', async () => {
			const response = JSON.stringify( [
				{ annotation: 'neutral face', group: 0 },
				{ annotation: 'medium-dark skin tone', group: 2 },
				{ annotation: 'unamused face', group: 0 }
			] );

			fetchStubResolve( new Response( response ) );

			editor = await editorPromise;

			const emojiDatabasePlugin = editor.plugins.get( EmojiDatabase );
			const hasGroup2 = emojiDatabasePlugin._emojiDatabase.find( item => item.group === 2 );

			expect( hasGroup2 ).to.be.undefined;
		} );

		it( 'should filter out unsupported emojis from the fetched emoji database', async () => {
			isEmojiSupportedStub.callsFake( item => item.annotation !== 'microscope' );

			const response = JSON.stringify( [
				{ annotation: 'neutral face', group: 0 },
				{ annotation: 'unamused face', group: 0 },
				{ annotation: 'microscope', group: 7 }
			] );

			fetchStubResolve( new Response( response ) );

			editor = await editorPromise;

			const emojiDatabasePlugin = editor.plugins.get( EmojiDatabase );
			const hasMicroscopeEmoji = emojiDatabasePlugin._emojiDatabase.find( item => item.annotation === 'microscope' );

			expect( hasMicroscopeEmoji ).to.be.undefined;
		} );

		it( 'should set default skin tone for each emoji', async () => {
			const response = JSON.stringify( [
				{ annotation: 'neutral face', emoji: '😐️', group: 0 },
				{ annotation: 'unamused face', emoji: '😒', group: 0 }
			] );

			fetchStubResolve( new Response( response ) );

			editor = await editorPromise;

			const emojiDatabasePlugin = editor.plugins.get( EmojiDatabase );

			expect( emojiDatabasePlugin._emojiDatabase ).to.have.length( 2 );
			expect( emojiDatabasePlugin._emojiDatabase[ 0 ] ).to.have.deep.property( 'skins', { default: '😐️' } );
			expect( emojiDatabasePlugin._emojiDatabase[ 1 ] ).to.have.deep.property( 'skins', { default: '😒' } );
		} );

		it( 'should set other skin tones if emoji defines them', async () => {
			const ninjaEmoji0 = '🥷';
			const ninjaEmoji1 = '🥷🏻';
			const ninjaEmoji2 = '🥷🏼';
			const ninjaEmoji3 = '🥷🏽';
			const ninjaEmoji4 = '🥷🏾';
			const ninjaEmoji5 = '🥷🏿';

			const response = JSON.stringify( [
				{ annotation: 'ninja', emoji: ninjaEmoji0, group: 1, skins: [
					{ emoji: ninjaEmoji1, tone: 1 },
					{ emoji: ninjaEmoji2, tone: 2 },
					{ emoji: ninjaEmoji3, tone: 3 },
					{ emoji: ninjaEmoji4, tone: 4 },
					{ emoji: ninjaEmoji5, tone: 5 }
				] }
			] );

			fetchStubResolve( new Response( response ) );

			editor = await editorPromise;

			const emojiDatabasePlugin = editor.plugins.get( EmojiDatabase );

			expect( emojiDatabasePlugin._emojiDatabase ).to.have.length( 1 );
			expect( emojiDatabasePlugin._emojiDatabase[ 0 ] ).to.have.deep.property( 'skins', {
				default: ninjaEmoji0,
				light: ninjaEmoji1,
				'medium-light': ninjaEmoji2,
				medium: ninjaEmoji3,
				'medium-dark': ninjaEmoji4,
				dark: ninjaEmoji5
			} );
		} );

		it( 'should create Fuse.js instance with the emoji database', async () => {
			const response = JSON.stringify( [
				{ annotation: 'neutral face', group: 0 },
				{ annotation: 'unamused face', group: 0 }
			] );

			fetchStubResolve( new Response( response ) );

			editor = await editorPromise;

			const emojiDatabasePlugin = editor.plugins.get( EmojiDatabase );

			expect( emojiDatabasePlugin._fuseSearch ).to.be.an( 'object' );

			const searchIndex = emojiDatabasePlugin._fuseSearch.getIndex();

			expect( searchIndex.docs ).to.have.length( 2 );
			expect( searchIndex.docs[ 0 ] ).to.have.property( 'annotation', 'neutral face' );
			expect( searchIndex.docs[ 1 ] ).to.have.property( 'annotation', 'unamused face' );
		} );

		it( 'should log a warning and store empty array when emoji database fetch failed', async () => {
			fetchStubResolve( new Response( null, { status: 500 } ) );

			editor = await editorPromise;

			const emojiDatabasePlugin = editor.plugins.get( EmojiDatabase );

			expect( emojiDatabasePlugin._emojiDatabase ).to.deep.equal( [] );

			expect( consoleStub.calledOnce ).to.be.true;
			expect( consoleStub.firstCall.args[ 0 ] ).to.equal( 'emoji-database-load-failed' );
		} );

		it( 'should log a warning and store empty array on network error when fetching emoji database', async () => {
			fetchStubReject( new Response() );

			editor = await editorPromise;

			const emojiDatabasePlugin = editor.plugins.get( EmojiDatabase );

			expect( emojiDatabasePlugin._emojiDatabase ).to.deep.equal( [] );

			expect( consoleStub.calledOnce ).to.be.true;
			expect( consoleStub.firstCall.args[ 0 ] ).to.equal( 'emoji-database-load-failed' );
		} );
	} );

	describe( 'getEmojiBySearchQuery', () => {
		let editor, domElement, emojiDatabasePlugin;

		beforeEach( async () => {
			const response = JSON.stringify( [
				{ annotation: 'neutral face', emoticon: ':|', tags: [ 'awkward', 'blank', 'face', 'meh', 'whatever' ], group: 0 },
				{ annotation: 'unamused face', emoticon: ':?', tags: [ 'bored', 'face', 'fine', 'ugh', 'whatever' ], group: 0 }
			] );

			testUtils.sinon.stub( window, 'fetch' ).resolves( new Response( response ) );

			domElement = global.document.createElement( 'div' );
			global.document.body.appendChild( domElement );

			editor = await ClassicTestEditor.create( domElement, {
				plugins: [
					Essentials,
					Paragraph,
					EmojiDatabase
				]
			} );

			emojiDatabasePlugin = editor.plugins.get( EmojiDatabase );
		} );

		afterEach( async () => {
			domElement.remove();

			await editor.destroy();
		} );

		it( 'should return empty array if search query is empty', () => {
			const result = emojiDatabasePlugin.getEmojiBySearchQuery( '' );

			expect( result ).to.deep.equal( [] );
		} );

		it( 'should return empty array if search query is shorter than 2 characters', () => {
			const result = emojiDatabasePlugin.getEmojiBySearchQuery( 'f' );

			expect( result ).to.deep.equal( [] );
		} );

		it( 'should return empty array if search query does not contain two non-white characters next to each other', () => {
			const result = emojiDatabasePlugin.getEmojiBySearchQuery( 'f w' );

			expect( result ).to.deep.equal( [] );
		} );

		it( 'should return empty array if search query does not match any emoji', () => {
			const result = emojiDatabasePlugin.getEmojiBySearchQuery( 'face happy' );

			expect( result ).to.deep.equal( [] );
		} );

		it( 'should return emojis matched by emoticon', () => {
			const result = emojiDatabasePlugin.getEmojiBySearchQuery( ':|' );

			expect( result ).to.have.length( 1 );
			expect( result[ 0 ] ).to.have.property( 'annotation', 'neutral face' );
		} );

		it( 'should return emojis matched by annotation (single match)', () => {
			const result = emojiDatabasePlugin.getEmojiBySearchQuery( 'neutral' );

			expect( result ).to.have.length( 1 );
			expect( result[ 0 ] ).to.have.property( 'annotation', 'neutral face' );
		} );

		it( 'should return emojis matched by annotation (multiple matches)', () => {
			const result = emojiDatabasePlugin.getEmojiBySearchQuery( 'face' );

			expect( result ).to.have.length( 2 );
			expect( result[ 0 ] ).to.have.property( 'annotation', 'neutral face' );
			expect( result[ 1 ] ).to.have.property( 'annotation', 'unamused face' );
		} );

		it( 'should return emojis matched by tags (single match)', () => {
			const result = emojiDatabasePlugin.getEmojiBySearchQuery( 'blank' );

			expect( result ).to.have.length( 1 );
			expect( result[ 0 ] ).to.have.property( 'annotation', 'neutral face' );
		} );

		it( 'should return emojis matched by tags (multiple matches)', () => {
			const result = emojiDatabasePlugin.getEmojiBySearchQuery( 'whatever' );

			expect( result ).to.have.length( 2 );
			expect( result[ 0 ] ).to.have.property( 'annotation', 'neutral face' );
			expect( result[ 1 ] ).to.have.property( 'annotation', 'unamused face' );
		} );
	} );

	describe( 'getEmojiGroups()', () => {
		let editor, domElement, emojiDatabasePlugin;

		beforeEach( async () => {
			const response = JSON.stringify( [
				{ annotation: 'neutral face', group: 0 },
				{ annotation: 'ninja', group: 1 },
				{ annotation: 'medium-dark skin tone', group: 2 },
				{ annotation: 'lobster', group: 3 },
				{ annotation: 'salt', group: 4 },
				{ annotation: 'watch', group: 5 },
				{ annotation: 'magic wand', group: 6 },
				{ annotation: 'x-ray', group: 7 },
				{ annotation: 'up-left arrow', group: 8 },
				{ annotation: 'flag: Poland', group: 9 }
			] );

			testUtils.sinon.stub( window, 'fetch' ).resolves( new Response( response ) );

			domElement = global.document.createElement( 'div' );
			global.document.body.appendChild( domElement );

			editor = await ClassicTestEditor.create( domElement, {
				plugins: [
					Essentials,
					Paragraph,
					EmojiDatabase
				]
			} );

			emojiDatabasePlugin = editor.plugins.get( EmojiDatabase );
		} );

		afterEach( async () => {
			domElement.remove();

			await editor.destroy();
		} );

		it( 'should return emojis grouped by category', () => {
			const result = emojiDatabasePlugin.getEmojiGroups();

			expect( result ).to.have.length( 9 );

			expect( result[ 0 ] ).to.have.property( 'groupId', 0 );
			expect( result[ 0 ].items ).to.have.length( 1 );
			expect( result[ 0 ].items[ 0 ] ).to.have.property( 'annotation', 'neutral face' );

			expect( result[ 1 ] ).to.have.property( 'groupId', 1 );
			expect( result[ 1 ].items ).to.have.length( 1 );
			expect( result[ 1 ].items[ 0 ] ).to.have.property( 'annotation', 'ninja' );

			expect( result[ 2 ] ).to.have.property( 'groupId', 3 );
			expect( result[ 2 ].items ).to.have.length( 1 );
			expect( result[ 2 ].items[ 0 ] ).to.have.property( 'annotation', 'lobster' );

			expect( result[ 3 ] ).to.have.property( 'groupId', 4 );
			expect( result[ 3 ].items ).to.have.length( 1 );
			expect( result[ 3 ].items[ 0 ] ).to.have.property( 'annotation', 'salt' );

			expect( result[ 4 ] ).to.have.property( 'groupId', 5 );
			expect( result[ 4 ].items ).to.have.length( 1 );
			expect( result[ 4 ].items[ 0 ] ).to.have.property( 'annotation', 'watch' );

			expect( result[ 5 ] ).to.have.property( 'groupId', 6 );
			expect( result[ 5 ].items ).to.have.length( 1 );
			expect( result[ 5 ].items[ 0 ] ).to.have.property( 'annotation', 'magic wand' );

			expect( result[ 6 ] ).to.have.property( 'groupId', 7 );
			expect( result[ 6 ].items ).to.have.length( 1 );
			expect( result[ 6 ].items[ 0 ] ).to.have.property( 'annotation', 'x-ray' );

			expect( result[ 7 ] ).to.have.property( 'groupId', 8 );
			expect( result[ 7 ].items ).to.have.length( 1 );
			expect( result[ 7 ].items[ 0 ] ).to.have.property( 'annotation', 'up-left arrow' );

			expect( result[ 8 ] ).to.have.property( 'groupId', 9 );
			expect( result[ 8 ].items ).to.have.length( 1 );
			expect( result[ 8 ].items[ 0 ] ).to.have.property( 'annotation', 'flag: Poland' );
		} );
	} );
} );
