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
import EmojiRepository from '../src/emojirepository.js';
import EmojiUtils from '../src/utils/emojiutils.js';

describe( 'EmojiRepository', () => {
	testUtils.createSinonSandbox();

	let consoleStub, fetchStub;

	beforeEach( () => {
		consoleStub = sinon.stub( console, 'warn' );
		fetchStub = testUtils.sinon.stub( window, 'fetch' ).resolves( new Response( '[]' ) );
	} );

	it( 'should be correctly named', () => {
		expect( EmojiRepository.pluginName ).to.equal( 'EmojiRepository' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( EmojiRepository.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( EmojiRepository.isPremiumPlugin ).to.be.false;
	} );

	it( 'should configure default emoji database version', async () => {
		const domElement = global.document.createElement( 'div' );
		global.document.body.appendChild( domElement );

		const editor = await createTestEditor( domElement );
		const emojiVersion = editor.config.get( 'emoji.version' );

		expect( emojiVersion ).to.equal( 16 );

		domElement.remove();

		await editor.destroy();
	} );

	describe( 'init()', () => {
		let editor, editorPromise, domElement, fetchStubResolve, fetchStubReject;

		beforeEach( () => {
			fetchStub.returns( new Promise( ( resolve, reject ) => {
				fetchStubResolve = resolve;
				fetchStubReject = reject;
			} ) );

			domElement = global.document.createElement( 'div' );
			global.document.body.appendChild( domElement );

			editor = null;
			editorPromise = createTestEditor( domElement );
		} );

		afterEach( async () => {
			if ( !editor ) {
				editor = await editorPromise;
			}

			domElement.remove();

			await editor.destroy();
		} );

		it( 'should fetch the emoji database version 16', async () => {
			const response = JSON.stringify( [
				{ emoji: '😐️', annotation: 'neutral face', group: 0, version: 15 },
				{ emoji: '😒', annotation: 'unamused face', group: 0, version: 15 }
			] );

			fetchStubResolve( new Response( response ) );

			editor = await editorPromise;

			expect( fetchStub.calledOnce ).to.be.true;
			expect( fetchStub.firstCall.args[ 0 ] ).to.equal( 'https://cdn.ckeditor.com/ckeditor5/data/emoji/16/en.json' );

			const emojiRepositoryPlugin = editor.plugins.get( EmojiRepository );

			expect( emojiRepositoryPlugin._database ).to.have.length( 2 );
			expect( emojiRepositoryPlugin._database[ 0 ] ).to.have.property( 'annotation', 'neutral face' );
			expect( emojiRepositoryPlugin._database[ 1 ] ).to.have.property( 'annotation', 'unamused face' );
		} );

		it( 'should fetch the emoji database version 15', async () => {
			const response = JSON.stringify( [
				{ annotation: 'neutral face', group: 0 },
				{ annotation: 'unamused face', group: 0 }
			] );

			fetchStubResolve( new Response( response ) );

			const domElement = global.document.createElement( 'div' );
			global.document.body.appendChild( domElement );

			const editor = await createTestEditor( domElement, {
				emoji: {
					version: 15
				}
			} );

			// The first `fetch()` call is from the test editor created in `beforeEach()` hook.
			// In this unit test we are creating another test editor with modified config.
			// Hence, we want to check the last `fetch()` call.
			expect( fetchStub.lastCall.args[ 0 ] ).to.equal( 'https://cdn.ckeditor.com/ckeditor5/data/emoji/15/en.json' );

			domElement.remove();

			await editor.destroy();
		} );

		it( 'should filter out group "2" from the fetched emoji database', async () => {
			const response = JSON.stringify( [
				{ annotation: 'neutral face', group: 0 },
				{ annotation: 'medium-dark skin tone', group: 2 },
				{ annotation: 'unamused face', group: 0 }
			] );

			fetchStubResolve( new Response( response ) );

			editor = await editorPromise;

			const emojiRepositoryPlugin = editor.plugins.get( EmojiRepository );
			const hasGroup2 = emojiRepositoryPlugin._database.find( item => item.group === 2 );

			expect( hasGroup2 ).to.be.undefined;
		} );

		it( 'should filter out unsupported ZWJ emojis from the fetched emoji database', async () => {
			// Head shaking horizontally is mocked to be an unsupported emoji in EmojiUtilsMock.

			const response = JSON.stringify( [
				{ emoji: '🙂‍↔️', annotation: 'head shaking horizontally', group: 0, version: 16 },
				{ emoji: '😒', annotation: 'unamused face', group: 0, version: 15 }
			] );

			fetchStubResolve( new Response( response ) );

			editor = await editorPromise;

			const emojiRepositoryPlugin = editor.plugins.get( EmojiRepository );
			const headShakingHorizontallyEmoji = emojiRepositoryPlugin._database
				.find( item => item.annotation === 'head shaking horizontally' );
			const unamusedFaceEmoji = emojiRepositoryPlugin._database.find( item => item.annotation === 'unamused face' );

			expect( unamusedFaceEmoji ).not.to.be.undefined;
			expect( headShakingHorizontallyEmoji ).to.be.undefined;
		} );

		it( 'should filter out emojis based on the version supported by the operating system', async () => {
			// Emoji version 15 is mocked in the EmojiUtilsMock.

			const response = JSON.stringify( [
				{ emoji: '😐️', annotation: 'neutral face', group: 0, version: 16 },
				{ emoji: '😒', annotation: 'unamused face', group: 0, version: 15 },
				{ emoji: '🔬', annotation: 'microscope', group: 7, version: 15 }
			] );

			fetchStubResolve( new Response( response ) );

			editor = await editorPromise;

			const emojiRepositoryPlugin = editor.plugins.get( EmojiRepository );
			const hasNeutralFaceEmoji = emojiRepositoryPlugin._database.find( item => item.annotation === 'neutral face' );
			const hasMicroscopeEmoji = emojiRepositoryPlugin._database.find( item => item.annotation === 'microscope' );
			const hasUnamusedEmoji = emojiRepositoryPlugin._database.find( item => item.annotation === 'unamused face' );

			expect( hasNeutralFaceEmoji ).to.be.undefined;
			expect( hasMicroscopeEmoji ).not.to.be.undefined;
			expect( hasUnamusedEmoji ).not.to.be.undefined;
		} );

		it( 'should set default skin tone for each emoji', async () => {
			const response = JSON.stringify( [
				{ annotation: 'neutral face', emoji: '😐️', group: 0, version: 15 },
				{ annotation: 'unamused face', emoji: '😒', group: 0, version: 15 }
			] );

			fetchStubResolve( new Response( response ) );

			editor = await editorPromise;

			const emojiRepositoryPlugin = editor.plugins.get( EmojiRepository );

			expect( emojiRepositoryPlugin._database ).to.have.length( 2 );
			expect( emojiRepositoryPlugin._database[ 0 ] ).to.have.deep.property( 'skins', { default: '😐️' } );
			expect( emojiRepositoryPlugin._database[ 1 ] ).to.have.deep.property( 'skins', { default: '😒' } );
		} );

		it( 'should set other skin tones if emoji defines them', async () => {
			const ninjaEmoji0 = '🥷';
			const ninjaEmoji1 = '🥷🏻';
			const ninjaEmoji2 = '🥷🏼';
			const ninjaEmoji3 = '🥷🏽';
			const ninjaEmoji4 = '🥷🏾';
			const ninjaEmoji5 = '🥷🏿';

			const response = JSON.stringify( [
				{ annotation: 'ninja', emoji: ninjaEmoji0, group: 1, version: 15, skins: [
					{ emoji: ninjaEmoji1, tone: 1 },
					{ emoji: ninjaEmoji2, tone: 2 },
					{ emoji: ninjaEmoji3, tone: 3 },
					{ emoji: ninjaEmoji4, tone: 4 },
					{ emoji: ninjaEmoji5, tone: 5 }
				] }
			] );

			fetchStubResolve( new Response( response ) );

			editor = await editorPromise;

			const emojiRepositoryPlugin = editor.plugins.get( EmojiRepository );

			expect( emojiRepositoryPlugin._database ).to.have.length( 1 );
			expect( emojiRepositoryPlugin._database[ 0 ] ).to.have.deep.property( 'skins', {
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
				{ emoji: '😐️', annotation: 'neutral face', group: 0, version: 15 },
				{ emoji: '😒', annotation: 'unamused face', group: 0, version: 15 }
			] );

			fetchStubResolve( new Response( response ) );

			editor = await editorPromise;

			const emojiRepositoryPlugin = editor.plugins.get( EmojiRepository );

			expect( emojiRepositoryPlugin._fuseSearch ).to.be.an( 'object' );

			const searchIndex = emojiRepositoryPlugin._fuseSearch.getIndex();

			expect( searchIndex.docs ).to.have.length( 2 );
			expect( searchIndex.docs[ 0 ] ).to.have.property( 'annotation', 'neutral face' );
			expect( searchIndex.docs[ 1 ] ).to.have.property( 'annotation', 'unamused face' );
		} );

		it( 'should log a warning and keep emoji database as empty array when emoji database fetch failed', async () => {
			fetchStubResolve( new Response( null, { status: 500 } ) );

			editor = await editorPromise;

			const emojiRepositoryPlugin = editor.plugins.get( EmojiRepository );

			expect( emojiRepositoryPlugin._database ).to.deep.equal( [] );

			expect( consoleStub.calledOnce ).to.be.true;
			expect( consoleStub.firstCall.args[ 0 ] ).to.equal( 'emoji-database-load-failed' );
		} );

		it( 'should log a warning and keep emoji database as empty array on network error when fetching emoji database', async () => {
			fetchStubReject( new Response() );

			editor = await editorPromise;

			const emojiRepositoryPlugin = editor.plugins.get( EmojiRepository );

			expect( emojiRepositoryPlugin._database ).to.deep.equal( [] );

			expect( consoleStub.calledOnce ).to.be.true;
			expect( consoleStub.firstCall.args[ 0 ] ).to.equal( 'emoji-database-load-failed' );
		} );

		it( 'should not initialize Fuse.js instance when emoji database fetch failed', async () => {
			fetchStubReject( new Response() );

			editor = await editorPromise;

			const emojiRepositoryPlugin = editor.plugins.get( EmojiRepository );

			expect( emojiRepositoryPlugin._fuseSearch ).to.be.null;
		} );
	} );

	describe( 'getEmojiByQuery()', () => {
		let editor, domElement, emojiRepositoryPlugin;

		beforeEach( async () => {
			const response = JSON.stringify( [
				{
					emoji: '😐️',
					annotation: 'neutral face',
					emoticon: ':|',
					tags: [ 'awkward', 'blank', 'face', 'meh', 'whatever' ],
					group: 0,
					version: 15
				},
				{
					emoji: '😒',
					annotation: 'unamused face',
					emoticon: ':?',
					tags: [ 'bored', 'face', 'fine', 'ugh', 'whatever' ],
					group: 0,
					version: 15
				}
			] );

			fetchStub.resolves( new Response( response ) );

			domElement = global.document.createElement( 'div' );
			global.document.body.appendChild( domElement );

			editor = await createTestEditor( domElement );
			emojiRepositoryPlugin = editor.plugins.get( EmojiRepository );
		} );

		afterEach( async () => {
			domElement.remove();

			await editor.destroy();
		} );

		it( 'should return empty array if Fuse.js instance is not created', () => {
			emojiRepositoryPlugin._fuseSearch = null;

			const result = emojiRepositoryPlugin.getEmojiByQuery( 'face' );

			expect( result ).to.deep.equal( [] );
		} );

		it( 'should return empty array if search query is empty', () => {
			const result = emojiRepositoryPlugin.getEmojiByQuery( '' );

			expect( result ).to.deep.equal( [] );
		} );

		it( 'should return empty array if search query is shorter than 2 characters', () => {
			const result = emojiRepositoryPlugin.getEmojiByQuery( 'f' );

			expect( result ).to.deep.equal( [] );
		} );

		it( 'should return empty array if search query does not contain two non-white characters next to each other', () => {
			const result = emojiRepositoryPlugin.getEmojiByQuery( 'f w' );

			expect( result ).to.deep.equal( [] );
		} );

		it( 'should return empty array if search query does not match any emoji', () => {
			const result = emojiRepositoryPlugin.getEmojiByQuery( 'face happy' );

			expect( result ).to.deep.equal( [] );
		} );

		it( 'should return emojis matched by emoticon', () => {
			const result = emojiRepositoryPlugin.getEmojiByQuery( ':|' );

			expect( result ).to.have.length( 1 );
			expect( result[ 0 ] ).to.have.property( 'annotation', 'neutral face' );
		} );

		it( 'should return emojis matched by annotation (single match)', () => {
			const result = emojiRepositoryPlugin.getEmojiByQuery( 'neutral' );

			expect( result ).to.have.length( 1 );
			expect( result[ 0 ] ).to.have.property( 'annotation', 'neutral face' );
		} );

		it( 'should return emojis matched by annotation (multiple matches)', () => {
			const result = emojiRepositoryPlugin.getEmojiByQuery( 'face' );

			expect( result ).to.have.length( 2 );
			expect( result[ 0 ] ).to.have.property( 'annotation', 'neutral face' );
			expect( result[ 1 ] ).to.have.property( 'annotation', 'unamused face' );
		} );

		it( 'should return emojis matched by tags (single match)', () => {
			const result = emojiRepositoryPlugin.getEmojiByQuery( 'blank' );

			expect( result ).to.have.length( 1 );
			expect( result[ 0 ] ).to.have.property( 'annotation', 'neutral face' );
		} );

		it( 'should return emojis matched by tags (multiple matches)', () => {
			const result = emojiRepositoryPlugin.getEmojiByQuery( 'whatever' );

			expect( result ).to.have.length( 2 );
			expect( result[ 0 ] ).to.have.property( 'annotation', 'neutral face' );
			expect( result[ 1 ] ).to.have.property( 'annotation', 'unamused face' );
		} );
	} );

	describe( 'getEmojiCategories()', () => {
		let editor, domElement, emojiRepositoryPlugin;

		beforeEach( async () => {
			const response = JSON.stringify( [
				{ emoji: '😐️', annotation: 'neutral face', group: 0, version: 15 },
				{ emoji: '🥷', annotation: 'ninja', group: 1, version: 15 },
				{ emoji: '🤚🏾', annotation: 'medium-dark skin tone', group: 2, version: 15 },
				{ emoji: '🦞', annotation: 'lobster', group: 3, version: 15 },
				{ emoji: '🧂', annotation: 'salt', group: 4, version: 15 },
				{ emoji: '⌚️', annotation: 'watch', group: 5, version: 15 },
				{ emoji: '🪄', annotation: 'magic wand', group: 6, version: 15 },
				{ emoji: '🩻', annotation: 'x-ray', group: 7, version: 15 },
				{ emoji: '↖️', annotation: 'up-left arrow', group: 8, version: 15 },
				{ emoji: '🇵🇱', annotation: 'flag: Poland', group: 9, version: 15 }
			] );

			fetchStub.resolves( new Response( response ) );

			domElement = global.document.createElement( 'div' );
			global.document.body.appendChild( domElement );

			editor = await createTestEditor( domElement );
			emojiRepositoryPlugin = editor.plugins.get( EmojiRepository );
		} );

		afterEach( async () => {
			domElement.remove();

			await editor.destroy();
		} );

		it( 'should return empty array for each emoji category if emoji database is empty', () => {
			emojiRepositoryPlugin._database = [];

			const result = emojiRepositoryPlugin.getEmojiCategories();

			expect( result ).to.have.length( 0 );
		} );

		it( 'should return emojis grouped by category', () => {
			const result = emojiRepositoryPlugin.getEmojiCategories();

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

	describe( 'getSkinTones()', () => {
		let editor, domElement, emojiRepositoryPlugin;

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

			fetchStub.resolves( new Response( response ) );

			domElement = global.document.createElement( 'div' );
			global.document.body.appendChild( domElement );

			editor = await createTestEditor( domElement );
			emojiRepositoryPlugin = editor.plugins.get( EmojiRepository );
		} );

		afterEach( async () => {
			domElement.remove();

			await editor.destroy();
		} );

		it( 'should return available skin tones', () => {
			expect( emojiRepositoryPlugin.getSkinTones() ).to.length( 6 );
		} );
	} );

	describe( 'isReady()', () => {
		let editor, editorPromise, domElement, fetchStubResolve;

		beforeEach( () => {
			fetchStub.returns( new Promise( resolve => {
				fetchStubResolve = resolve;
			} ) );

			domElement = global.document.createElement( 'div' );
			global.document.body.appendChild( domElement );

			editor = null;
			editorPromise = createTestEditor( domElement );
		} );

		afterEach( async () => {
			if ( !editor ) {
				editor = await editorPromise;
			}

			domElement.remove();

			await editor.destroy();
		} );

		it( 'should return true when emoji database is not empty', async () => {
			const response = JSON.stringify( [
				{ annotation: 'neutral face', group: 0 },
				{ annotation: 'unamused face', group: 0 }
			] );

			fetchStubResolve( new Response( response ) );

			editor = await editorPromise;

			const result = await editor.plugins.get( EmojiRepository ).isReady();

			expect( result ).to.be.true;
		} );

		it( 'should return false when emoji database is empty', async () => {
			const response = JSON.stringify( [] );

			fetchStubResolve( new Response( response ) );

			editor = await editorPromise;

			const result = await editor.plugins.get( EmojiRepository ).isReady();

			expect( result ).to.be.false;
		} );
	} );
} );

class EmojiUtilsMock extends EmojiUtils {
	getEmojiSupportedVersionByOs() {
		return 15;
	}

	isEmojiZwjSupported( item ) {
		return item.emoji !== '🙂‍↔️';
	}
}

function createTestEditor( domElement, editorConfig = {} ) {
	return ClassicTestEditor.create( domElement, {
		plugins: [
			Essentials,
			Paragraph,
			EmojiRepository
		],
		substitutePlugins: [ EmojiUtilsMock ],
		...editorConfig
	} );
}
