/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { global } from '@ckeditor/ckeditor5-utils';
import { testUtils } from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { EmojiRepository } from '../src/emojirepository.js';
import { EmojiUtils } from '../src/emojiutils.js';
import { generateLicenseKey } from '@ckeditor/ckeditor5-core/tests/_utils/generatelicensekey.js';

class EmojiUtilsMockVersion15 extends EmojiUtils {
	getEmojiSupportedVersionByOs() {
		return 15;
	}

	isEmojiZwjSupported( item ) {
		return item.emoji !== '🙂‍↔️';
	}
}

class EmojiUtilsMockVersion16 extends EmojiUtils {
	getEmojiSupportedVersionByOs() {
		return 16;
	}

	isEmojiZwjSupported( item ) {
		return item.emoji !== '🙂‍↔️';
	}
}

function getCachedResults( plugin ) {
	return EmojiRepository._cache.getSync( {
		url: plugin._url.toString(),
		cacheKeys: plugin._cacheKeys
	} );
}

describe( 'EmojiRepository', () => {
	testUtils.createSinonSandbox();

	let consoleStub, fetchStub, clock;

	beforeEach( () => {
		clock = testUtils.sinon.useFakeTimers();

		EmojiRepository._cache.clear();

		consoleStub = testUtils.sinon.stub( console, 'warn' );
		fetchStub = testUtils.sinon.stub( window, 'fetch' );
	} );

	afterEach( () => {
		clock.restore();
	} );

	it( 'should be correctly named', () => {
		expect( EmojiRepository.pluginName ).to.equal( 'EmojiRepository' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( EmojiRepository.isOfficialPlugin ).to.equal( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( EmojiRepository.isPremiumPlugin ).to.equal( false );
	} );

	describe( 'editor config', () => {
		it( 'defines the `emoji.useCustomFont` option', async () => {
			const { editor, domElement } = await createTestEditor( resolve => {
				const response = JSON.stringify( [
					{ annotation: 'neutral face', emoji: '😐️', group: 0, version: 15 },
					{ annotation: 'unamused face', emoji: '😒', group: 0, version: 15 }
				] );

				resolve( new Response( response ) );
			} );

			const configValue = editor.config.get( 'emoji.useCustomFont' );

			expect( configValue ).to.equal( false );

			domElement.remove();
			await editor.destroy();
		} );
	} );

	describe( 'init()', () => {
		it( 'should send editor version when fetching emoji', async () => {
			const { editor, domElement } = await createTestEditor( resolve => {
				const response = JSON.stringify( [
					{ emoji: '😐️', annotation: 'neutral face', group: 0, version: 15 },
					{ emoji: '😒', annotation: 'unamused face', group: 0, version: 15 }
				] );

				resolve( new Response( response ) );
			} );

			expect( fetchStub.calledOnce ).to.equal( true );

			const cdnUrl = new URL( fetchStub.firstCall.args[ 0 ] );

			expect( cdnUrl.href ).to.satisfy( input => input.startsWith( 'https://cdn.ckeditor.com/ckeditor5/data/emoji/16/en.json' ) );
			expect( cdnUrl.searchParams.has( 'editorVersion' ) ).to.equal( true );

			domElement.remove();
			await editor.destroy();
		} );

		it( 'should force using cache mechanism when sending a request', async () => {
			const { editor, domElement } = await createTestEditor( resolve => {
				const response = JSON.stringify( [
					{ emoji: '😐️', annotation: 'neutral face', group: 0, version: 15 },
					{ emoji: '😒', annotation: 'unamused face', group: 0, version: 15 }
				] );

				resolve( new Response( response ) );
			} );

			expect( fetchStub.calledOnce ).to.equal( true );

			const fetchOptions = fetchStub.firstCall.args[ 1 ];

			expect( fetchOptions ).to.have.property( 'cache', 'force-cache' );

			domElement.remove();
			await editor.destroy();
		} );

		it( 'should fetch the emoji version 16 (a plugin default)', async () => {
			const { editor, domElement } = await createTestEditor( resolve => {
				const response = JSON.stringify( [
					{ emoji: '😐️', annotation: 'neutral face', group: 0, version: 15 },
					{ emoji: '😒', annotation: 'unamused face', group: 0, version: 15 }
				] );

				resolve( new Response( response ) );
			} );

			expect( fetchStub.calledOnce ).to.equal( true );

			const cdnUrl = new URL( fetchStub.firstCall.args[ 0 ] );

			expect( cdnUrl.href ).to.satisfy( input => input.startsWith( 'https://cdn.ckeditor.com/ckeditor5/data/emoji/16/en.json' ) );

			const results = getCachedResults( editor.plugins.get( EmojiRepository ) );

			expect( results ).to.have.length( 2 );
			expect( results[ 0 ] ).to.have.property( 'annotation', 'neutral face' );
			expect( results[ 1 ] ).to.have.property( 'annotation', 'unamused face' );

			domElement.remove();
			await editor.destroy();
		} );

		it( 'should fetch both emoji versions 16 and 15 when creating two different editors', async () => {
			const { editor: editor1, domElement: domElement1 } = await createTestEditor( resolve => {
				const response = JSON.stringify( [
					{ annotation: 'neutral face', emoji: '😐️', group: 0, version: 16 },
					{ annotation: 'unamused face', emoji: '😒', group: 0, version: 16 }
				] );

				resolve( new Response( response ) );
			}, {
				substitutePlugins: [ EmojiUtilsMockVersion16 ]
			} );

			const { editor: editor2, domElement: domElement2 } = await createTestEditor(
				resolve => {
					const response = JSON.stringify( [
						{ annotation: 'neutral face', emoji: '😐️', group: 0, version: 15 },
						{ annotation: 'unamused face', emoji: '😒', group: 0, version: 15 }
					] );

					resolve( new Response( response ) );
				}, {
					emoji: {
						version: 15
					}
				} );

			expect( fetchStub.callCount ).to.equal( 2 );

			const cdnUrl1 = new URL( fetchStub.getCall( 0 ).args[ 0 ] );
			const cdnUrl2 = new URL( fetchStub.getCall( 1 ).args[ 0 ] );

			expect( cdnUrl1.href ).to.satisfy( input => input.startsWith( 'https://cdn.ckeditor.com/ckeditor5/data/emoji/16/en.json' ) );
			expect( cdnUrl2.href ).to.satisfy( input => input.startsWith( 'https://cdn.ckeditor.com/ckeditor5/data/emoji/15/en.json' ) );

			const resultsFor16 = getCachedResults( editor1.plugins.get( EmojiRepository ) );
			const resultsFor15 = getCachedResults( editor2.plugins.get( EmojiRepository ) );

			expect( resultsFor16 ).to.have.length( 2 );
			expect( resultsFor16[ 0 ] ).to.have.property( 'annotation', 'neutral face' );
			expect( resultsFor16[ 1 ] ).to.have.property( 'annotation', 'unamused face' );

			expect( resultsFor15 ).to.have.length( 2 );
			expect( resultsFor15[ 0 ] ).to.have.property( 'annotation', 'neutral face' );
			expect( resultsFor15[ 1 ] ).to.have.property( 'annotation', 'unamused face' );

			domElement1.remove();
			domElement2.remove();
			await editor1.destroy();
			await editor2.destroy();
		} );

		it( 'should fetch the emoji version 16 only once when creating two editors', async () => {
			const { editor: editor1, domElement: domElement1 } = await createTestEditor( resolve => {
				const response = JSON.stringify( [
					{ annotation: 'neutral face', group: 0 },
					{ annotation: 'unamused face', group: 0 }
				] );

				resolve( new Response( response ) );
			} );

			const { editor: editor2, domElement: domElement2 } = await createTestEditor( resolve => {
				const response = JSON.stringify( [
					{ annotation: 'neutral face', group: 0 },
					{ annotation: 'unamused face', group: 0 }
				] );

				resolve( new Response( response ) );
			} );

			expect( fetchStub.calledOnce ).to.equal( true );

			domElement1.remove();
			domElement2.remove();
			await editor1.destroy();
			await editor2.destroy();
		} );

		it( 'should fetch the emoji version 16 only once even if first download has failed', async () => {
			const { editor: editor1, domElement: domElement1 } = await createTestEditor( resolve => {
				resolve( new Response( null, { status: 500 } ) );
			} );

			const { editor: editor2, domElement: domElement2 } = await createTestEditor( resolve => {
				const response = JSON.stringify( [
					{ annotation: 'neutral face', group: 0 },
					{ annotation: 'unamused face', group: 0 }
				] );

				resolve( new Response( response ) );
			} );

			expect( fetchStub.calledOnce ).to.equal( true );

			const results = getCachedResults( editor1.plugins.get( EmojiRepository ) );

			expect( results ).to.deep.equal( [] );

			domElement1.remove();
			domElement2.remove();
			await editor1.destroy();
			await editor2.destroy();
		} );

		it( 'should filter out group "2" from the fetched emoji (contains only skin tone items)', async () => {
			const { editor, domElement } = await createTestEditor( resolve => {
				const response = JSON.stringify( [
					{ annotation: 'neutral face', group: 0 },
					{ annotation: 'medium-dark skin tone', group: 2 },
					{ annotation: 'unamused face', group: 0 }
				] );

				resolve( new Response( response ) );
			} );

			const results = getCachedResults( editor.plugins.get( EmojiRepository ) );
			const hasGroup2 = results.some( item => item.group === 2 );

			expect( hasGroup2 ).to.equal( false );

			domElement.remove();
			await editor.destroy();
		} );

		it( 'should filter out unsupported ZWJ emojis from the fetched emoji', async () => {
			const { editor, domElement } = await createTestEditor( resolve => {
				const response = JSON.stringify( [
					{ emoji: '🙂‍↔️', annotation: 'head shaking horizontally', group: 0, version: 16 },
					{ emoji: '😒', annotation: 'unamused face', group: 0, version: 15 }
				] );

				resolve( new Response( response ) );
			}, {
				substitutePlugins: [ EmojiUtilsMockVersion16 ]
			} );

			// `Head shaking horizontally` is mocked to be an unsupported emoji in `EmojiUtilsMock`.
			const results = getCachedResults( editor.plugins.get( EmojiRepository ) );
			const headShakingHorizontallyEmoji = results.find( item => item.annotation === 'head shaking horizontally' );
			const unamusedFaceEmoji = results.find( item => item.annotation === 'unamused face' );

			expect( unamusedFaceEmoji ).not.to.be.undefined;
			expect( headShakingHorizontallyEmoji ).to.be.undefined;

			domElement.remove();
			await editor.destroy();
		} );

		it( 'should filter out emojis based on the version supported by the operating system', async () => {
			const { editor, domElement } = await createTestEditor(
				resolve => {
					const response = JSON.stringify( [
						{ emoji: '😐️', annotation: 'neutral face', group: 0, version: 16 },
						{ emoji: '😒', annotation: 'unamused face', group: 0, version: 15 },
						{ emoji: '🔬', annotation: 'microscope', group: 7, version: 15 }
					] );

					resolve( new Response( response ) );
				},
				{
					substitutePlugins: [ EmojiUtilsMockVersion15 ]
				}
			);

			const results = getCachedResults( editor.plugins.get( EmojiRepository ) );

			const hasNeutralFaceEmoji = results.find( item => item.annotation === 'neutral face' );
			const hasUnamusedEmoji = results.find( item => item.annotation === 'unamused face' );

			expect( hasNeutralFaceEmoji ).to.be.undefined;
			expect( hasUnamusedEmoji ).not.to.be.undefined;

			domElement.remove();
			await editor.destroy();
		} );

		it( 'should not filter out emojis when passing the `emoji.useCustomFont=true` option', async () => {
			const { editor, domElement } = await createTestEditor(
				resolve => {
					const response = JSON.stringify( [
						{ emoji: '😐️', annotation: 'neutral face', group: 0, version: 16 },
						{ emoji: '😒', annotation: 'unamused face', group: 0, version: 15 },
						{ emoji: '🔬', annotation: 'microscope', group: 7, version: 15 }
					] );

					resolve( new Response( response ) );
				},
				{
					substitutePlugins: [ EmojiUtilsMockVersion15 ],
					emoji: {
						useCustomFont: true
					}
				}
			);

			const results = getCachedResults( editor.plugins.get( EmojiRepository ) );

			// EmojiUtilsMockVersion15 removes emoji assigned to version `16`.
			// However, the filtering mechanism is disabled by passing `emoji.useCustomFont=true`.
			// Hence, all definitions returned from the server should be available.
			const hasNeutralFaceEmoji = results.find( item => item.annotation === 'neutral face' );
			const hasUnamusedEmoji = results.find( item => item.annotation === 'unamused face' );

			expect( hasNeutralFaceEmoji ).not.to.be.undefined;
			expect( hasUnamusedEmoji ).not.to.be.undefined;

			domElement.remove();
			await editor.destroy();
		} );

		it( 'should set default skin tone for each emoji', async () => {
			const { editor, domElement } = await createTestEditor( resolve => {
				const response = JSON.stringify( [
					{ annotation: 'neutral face', emoji: '😐️', group: 0, version: 15 },
					{ annotation: 'unamused face', emoji: '😒', group: 0, version: 15 }
				] );

				resolve( new Response( response ) );
			} );

			const results = getCachedResults( editor.plugins.get( EmojiRepository ) );

			expect( results ).to.have.length( 2 );
			expect( results[ 0 ] ).to.have.deep.property( 'skins', { default: '😐️' } );
			expect( results[ 1 ] ).to.have.deep.property( 'skins', { default: '😒' } );

			domElement.remove();
			await editor.destroy();
		} );

		it( 'should set other skin tones if emoji defines them', async () => {
			const ninjaEmoji0 = '🥷';
			const ninjaEmoji1 = '🥷🏻';
			const ninjaEmoji2 = '🥷🏼';
			const ninjaEmoji3 = '🥷🏽';
			const ninjaEmoji4 = '🥷🏾';
			const ninjaEmoji5 = '🥷🏿';

			const { editor, domElement } = await createTestEditor( resolve => {
				const response = JSON.stringify( [
					{ annotation: 'ninja', emoji: ninjaEmoji0, group: 1, version: 15, skins: [
						{ emoji: ninjaEmoji1, tone: 1 },
						{ emoji: ninjaEmoji2, tone: 2 },
						{ emoji: ninjaEmoji3, tone: 3 },
						{ emoji: ninjaEmoji4, tone: 4 },
						{ emoji: ninjaEmoji5, tone: 5 }
					] }
				] );

				resolve( new Response( response ) );
			} );

			const results = getCachedResults( editor.plugins.get( EmojiRepository ) );

			expect( results ).to.have.length( 1 );
			expect( results[ 0 ] ).to.have.deep.property( 'skins', {
				default: ninjaEmoji0,
				light: ninjaEmoji1,
				'medium-light': ninjaEmoji2,
				medium: ninjaEmoji3,
				'medium-dark': ninjaEmoji4,
				dark: ninjaEmoji5
			} );

			domElement.remove();
			await editor.destroy();
		} );

		it( 'should log a warning and store emoji database as empty array when emoji database fetch failed', async () => {
			const { editor, domElement } = await createTestEditor( resolve => {
				resolve( new Response( null, { status: 500 } ) );
			} );

			const results = getCachedResults( editor.plugins.get( EmojiRepository ) );

			expect( results ).to.deep.equal( [] );

			expect( consoleStub.called ).to.equal( true );
			sinon.assert.calledWith( consoleStub, 'emoji-repository-empty' );

			domElement.remove();
			await editor.destroy();
		} );

		it( 'should log a warning and do not store empty emoji array on network error when fetching emoji database', async () => {
			const { editor, domElement } = await createTestEditor( ( resolve, reject ) => {
				reject( new Response() );
			} );

			const results = getCachedResults( editor.plugins.get( EmojiRepository ) );

			expect( results ).to.be.null;

			expect( consoleStub.called ).to.equal( true );
			sinon.assert.calledWith( consoleStub, 'emoji-repository-empty' );

			domElement.remove();
			await editor.destroy();
		} );

		it( 'should log a warning if there are no supported emojis', async () => {
			sinon.stub( EmojiUtils, '_isEmojiSupported' ).returns( false );

			const { editor, domElement } = await createTestEditor( resolve => {
				const response = JSON.stringify( [
					{ annotation: 'smiling face', emoji: '🙂', group: 1, version: 15 }
				] );

				resolve( new Response( response ) );
			} );

			expect( consoleStub.called ).to.equal( true );
			sinon.assert.calledWith( consoleStub, 'emoji-repository-empty' );

			domElement.remove();
			await editor.destroy();
		} );

		it( 'should log a warning when both `definitionsUrl` and `version` options are provided', async () => {
			const { editor, domElement } = await createTestEditor( resolve => {
				const response = JSON.stringify( [
					{ emoji: '😐️', annotation: 'neutral face', group: 0, version: 16 },
					{ emoji: '😒', annotation: 'unamused face', group: 0, version: 16 }
				] );

				resolve( new Response( response ) );
			}, {
				emoji: {
					definitionsUrl: 'https://cdn.ckeditor.com/ckeditor5/data/emoji/16/en.json',
					version: 15
				}
			} );

			expect( consoleStub.called ).to.equal( true );
			sinon.assert.calledWith( consoleStub, 'emoji-repository-redundant-version' );

			domElement.remove();
			await editor.destroy();
		} );

		it( 'should log a warning about using CDN when self-hosting', async () => {
			const { licenseKey } = generateLicenseKey( { licenseType: 'production' } );

			const { editor, domElement } = await createTestEditor( resolve => {
				const response = JSON.stringify( [
					{ emoji: '😐️', annotation: 'neutral face', group: 0, version: 16 },
					{ emoji: '😒', annotation: 'unamused face', group: 0, version: 16 }
				] );

				resolve( new Response( response ) );
			}, {
				licenseKey
			} );

			expect( consoleStub.called ).to.equal( true );
			sinon.assert.calledWith( consoleStub, 'emoji-repository-cdn-use' );

			domElement.remove();
			await editor.destroy();
		} );

		it( 'should not log a warning about using CDN when on `GPL` license', async () => {
			const { editor, domElement } = await createTestEditor( resolve => {
				const response = JSON.stringify( [
					{ emoji: '😐️', annotation: 'neutral face', group: 0, version: 16 },
					{ emoji: '😒', annotation: 'unamused face', group: 0, version: 16 }
				] );

				resolve( new Response( response ) );
			}, {
				licenseKey: 'GPL'
			} );

			expect( consoleStub ).to.not.have.been.calledWith( 'emoji-repository-redundant-version' );

			domElement.remove();
			await editor.destroy();
		} );

		it( 'should not log a warning about using CDN when using `cloud` distribution channel', async () => {
			const { licenseKey } = generateLicenseKey( {
				licenseType: 'production',
				distributionChannel: 'cloud'
			} );

			window[ Symbol.for( 'cke distribution' ) ] = 'cloud';

			const { editor, domElement } = await createTestEditor( resolve => {
				const response = JSON.stringify( [
					{ emoji: '😐️', annotation: 'neutral face', group: 0, version: 16 },
					{ emoji: '😒', annotation: 'unamused face', group: 0, version: 16 }
				] );

				resolve( new Response( response ) );
			}, {
				licenseKey
			} );

			expect( consoleStub ).to.not.have.been.calledWith( 'emoji-repository-redundant-version' );

			domElement.remove();
			await editor.destroy();
			delete window[ Symbol.for( 'cke distribution' ) ];
		} );

		it( 'should not log a warning about using CDN when `emoji.definitionsUrl` is provided', async () => {
			const { licenseKey } = generateLicenseKey( { licenseType: 'production' } );

			const { editor, domElement } = await createTestEditor( resolve => {
				const response = JSON.stringify( [
					{ emoji: '😐️', annotation: 'neutral face', group: 0, version: 16 },
					{ emoji: '😒', annotation: 'unamused face', group: 0, version: 16 }
				] );

				resolve( new Response( response ) );
			}, {
				licenseKey,
				emoji: {
					definitionsUrl: 'https://cdn.ckeditor.com/ckeditor5/data/emoji/16/en.json'
				}
			} );

			expect( consoleStub ).to.not.have.been.calledWith( 'emoji-repository-redundant-version' );

			domElement.remove();
			await editor.destroy();
		} );

		it( 'should not crash when editor is destroyed before fetch completes', async () => {
			const domElement = global.document.createElement( 'div' );
			global.document.body.appendChild( domElement );

			let fetchResolve;

			fetchStub.returns( new Promise( resolve => {
				fetchResolve = resolve;
			} ) );

			const editor = await ClassicTestEditor.create( domElement, {
				plugins: [ Essentials, Paragraph, EmojiRepository ]
			} );

			const plugin = editor.plugins.get( EmojiRepository );

			expect( plugin.isRepositoryReady ).to.equal( null );

			domElement.remove();
			await editor.destroy();

			const response = JSON.stringify( [
				{ annotation: 'neutral face', emoji: '😐️', group: 0, version: 15 }
			] );

			expect( () => {
				fetchResolve( new Response( response ) );
			} ).to.not.throw();

			await clock.nextAsync();

			expect( plugin.isRepositoryReady ).to.equal( null );
		} );
	} );

	describe( 'getEmojiByQuery()', () => {
		let editor, domElement, emojiRepositoryPlugin;

		beforeEach( async () => {
			const instance = await createTestEditor( resolve => {
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

				resolve( new Response( response ) );
			} );

			editor = instance.editor;
			domElement = instance.domElement;

			emojiRepositoryPlugin = editor.plugins.get( EmojiRepository );
		} );

		afterEach( async () => {
			domElement.remove();
			await editor.destroy();
		} );

		it( 'should return empty array if emojis failed to load', async () => {
			domElement.remove();
			await editor.destroy();

			EmojiRepository._cache.clear();

			const instance = await createTestEditor( ( _, reject ) => {
				const response = JSON.stringify( {
					error: 'Critical error'
				} );

				reject( new Response( response, {
					status: 400
				} ) );
			} );

			editor = instance.editor;
			domElement = instance.domElement;
			emojiRepositoryPlugin = editor.plugins.get( EmojiRepository );

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
			expect( result[ 0 ] ).to.have.property( 'annotation', 'unamused face' );
			expect( result[ 1 ] ).to.have.property( 'annotation', 'neutral face' );
		} );

		it( 'should return emojis matched by tags (single match)', () => {
			const result = emojiRepositoryPlugin.getEmojiByQuery( 'blank' );

			expect( result ).to.have.length( 1 );
			expect( result[ 0 ] ).to.have.property( 'annotation', 'neutral face' );
		} );

		it( 'should return emojis matched by tags (multiple matches)', () => {
			const result = emojiRepositoryPlugin.getEmojiByQuery( 'whatever' );

			expect( result ).to.have.length( 2 );
			expect( result[ 0 ] ).to.have.property( 'annotation', 'unamused face' );
			expect( result[ 1 ] ).to.have.property( 'annotation', 'neutral face' );
		} );
	} );

	describe( 'getEmojiCategories()', () => {
		let editor, domElement, emojiRepositoryPlugin;

		beforeEach( async () => {
			const instance = await createTestEditor( resolve => {
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

				resolve( new Response( response ) );
			} );

			editor = instance.editor;
			domElement = instance.domElement;

			emojiRepositoryPlugin = editor.plugins.get( EmojiRepository );
		} );

		afterEach( async () => {
			domElement.remove();
			await editor.destroy();
		} );

		it( 'should return empty array for each emoji category if emoji database is empty', () => {
			EmojiRepository._cache.clear();

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
			const instance = await createTestEditor( resolve => {
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

				resolve( new Response( response ) );
			} );

			editor = instance.editor;
			domElement = instance.domElement;

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

	describe( 'onReady()', () => {
		it( 'should invoke callback synchronously with `true` when repository is already loaded', async () => {
			const { editor, domElement } = await createTestEditor( resolve => {
				const response = JSON.stringify( [
					{ annotation: 'neutral face', emoji: '😐️', group: 0, version: 15 }
				] );

				resolve( new Response( response ) );
			} );

			const plugin = editor.plugins.get( EmojiRepository );
			const spy = testUtils.sinon.spy();

			plugin.onReady( spy );

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, true );

			domElement.remove();
			await editor.destroy();
		} );

		it( 'should invoke callback synchronously with `false` when repository already failed to load', async () => {
			const { editor, domElement } = await createTestEditor( resolve => {
				resolve( new Response( null, { status: 500 } ) );
			} );

			const plugin = editor.plugins.get( EmojiRepository );
			const spy = testUtils.sinon.spy();

			plugin.onReady( spy );

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, false );

			domElement.remove();
			await editor.destroy();
		} );

		it( 'should invoke callback asynchronously once the repository finishes loading successfully', async () => {
			const domElement = global.document.createElement( 'div' );
			global.document.body.appendChild( domElement );

			let fetchResolve;

			fetchStub.returns( new Promise( resolve => {
				fetchResolve = resolve;
			} ) );

			const editor = await ClassicTestEditor.create( domElement, {
				plugins: [ Essentials, Paragraph, EmojiRepository ]
			} );

			const plugin = editor.plugins.get( EmojiRepository );
			const spy = testUtils.sinon.spy();

			expect( plugin.isRepositoryReady ).to.equal( null );

			plugin.onReady( spy );

			sinon.assert.notCalled( spy );

			const response = JSON.stringify( [
				{ annotation: 'neutral face', emoji: '😐️', group: 0, version: 15 }
			] );

			fetchResolve( new Response( response ) );

			await plugin.isReady();
			await clock.nextAsync();

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, true );

			domElement.remove();
			await editor.destroy();
		} );

		it( 'should invoke callback asynchronously with `false` when the repository fetch fails', async () => {
			const domElement = global.document.createElement( 'div' );
			global.document.body.appendChild( domElement );

			let fetchResolve;

			fetchStub.returns( new Promise( resolve => {
				fetchResolve = resolve;
			} ) );

			const editor = await ClassicTestEditor.create( domElement, {
				plugins: [ Essentials, Paragraph, EmojiRepository ]
			} );

			const plugin = editor.plugins.get( EmojiRepository );
			const spy = testUtils.sinon.spy();

			expect( plugin.isRepositoryReady ).to.equal( null );

			plugin.onReady( spy );

			sinon.assert.notCalled( spy );

			fetchResolve( new Response( null, { status: 500 } ) );

			await plugin.isReady();
			await clock.nextAsync();

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, false );

			domElement.remove();
			await editor.destroy();
		} );

		it( 'should invoke callback only once even if `onReady` is called while loading is in progress', async () => {
			const domElement = global.document.createElement( 'div' );
			global.document.body.appendChild( domElement );

			let fetchResolve;

			fetchStub.returns( new Promise( resolve => {
				fetchResolve = resolve;
			} ) );

			const editor = await ClassicTestEditor.create( domElement, {
				plugins: [ Essentials, Paragraph, EmojiRepository ]
			} );

			const plugin = editor.plugins.get( EmojiRepository );

			const callbackSpy = testUtils.sinon.spy();

			plugin.onReady( callbackSpy );

			const response = JSON.stringify( [
				{ annotation: 'neutral face', emoji: '😐️', group: 0, version: 15 }
			] );

			fetchResolve( new Response( response ) );

			await plugin.isReady();
			await clock.nextAsync();

			expect( callbackSpy.callCount ).to.equal( 1 );

			domElement.remove();
			await editor.destroy();
		} );

		it( 'should not invoke a previously registered callback again after repository is re-checked', async () => {
			const { editor, domElement } = await createTestEditor( resolve => {
				const response = JSON.stringify( [
					{ annotation: 'neutral face', emoji: '😐️', group: 0, version: 15 }
				] );

				resolve( new Response( response ) );
			} );

			const plugin = editor.plugins.get( EmojiRepository );

			const firstSpy = testUtils.sinon.spy();
			const secondSpy = testUtils.sinon.spy();

			plugin.onReady( firstSpy );
			plugin.onReady( secondSpy );

			expect( firstSpy.callCount ).to.equal( 1 );
			expect( secondSpy.callCount ).to.equal( 1 );

			domElement.remove();
			await editor.destroy();
		} );

		it( 'should never invoke the callback when the editor is destroyed before loading completes', async () => {
			const domElement = global.document.createElement( 'div' );
			global.document.body.appendChild( domElement );

			fetchStub.returns( new Promise( () => {} ) );

			const editor = await ClassicTestEditor.create( domElement, {
				plugins: [ Essentials, Paragraph, EmojiRepository ]
			} );

			const plugin = editor.plugins.get( EmojiRepository );
			const spy = testUtils.sinon.spy();

			plugin.onReady( spy );
			sinon.assert.notCalled( spy );

			domElement.remove();
			await editor.destroy();
			await clock.nextAsync();

			sinon.assert.notCalled( spy );
		} );

		it( 'should not invoke callback when called on an already-destroyed editor', async () => {
			const { editor, domElement } = await createTestEditor( resolve => {
				const response = JSON.stringify( [
					{ annotation: 'neutral face', emoji: '😐️', group: 0, version: 15 }
				] );

				resolve( new Response( response ) );
			} );

			const plugin = editor.plugins.get( EmojiRepository );

			domElement.remove();
			await editor.destroy();

			const spy = testUtils.sinon.spy();

			plugin.onReady( spy );
			sinon.assert.notCalled( spy );
		} );
	} );

	describe( 'isReady()', () => {
		it( 'should return `true` when emoji database is not empty', async () => {
			const { editor, domElement } = await createTestEditor( resolve => {
				const response = JSON.stringify( [
					{ annotation: 'neutral face', emoji: '😐️', group: 0, version: 15 },
					{ annotation: 'unamused face', emoji: '😒', group: 0, version: 15 }
				] );

				resolve( new Response( response ) );
			} );

			const result = await editor.plugins.get( EmojiRepository ).isReady();

			expect( result ).to.equal( true );

			domElement.remove();
			await editor.destroy();
		} );

		it( 'should return `false` when emoji database is empty', async () => {
			const { editor, domElement } = await createTestEditor( resolve => {
				const response = JSON.stringify( [] );

				resolve( new Response( response ) );
			} );

			const result = await editor.plugins.get( EmojiRepository ).isReady();

			expect( result ).to.equal( false );

			domElement.remove();
			await editor.destroy();
		} );

		it( 'should return `false` when emoji database is not stored', async () => {
			const { editor, domElement } = await createTestEditor( resolve => {
				resolve( new Response( JSON.stringify( [] ) ) );
			} );

			const result = await editor.plugins.get( EmojiRepository ).isReady();

			expect( result ).to.equal( false );

			domElement.remove();
			await editor.destroy();
		} );

		it( 'should return `false` when the editor is destroyed while fetch is still pending', async () => {
			const domElement = global.document.createElement( 'div' );
			global.document.body.appendChild( domElement );

			let fetchResolve;

			fetchStub.returns( new Promise( resolve => {
				fetchResolve = resolve;
			} ) );

			const editor = await ClassicTestEditor.create( domElement, {
				plugins: [ Essentials, Paragraph, EmojiRepository ]
			} );

			const plugin = editor.plugins.get( EmojiRepository );
			const isReadyPromise = plugin.isReady();

			domElement.remove();
			await editor.destroy();

			let caughtError;

			try {
				await isReadyPromise;
			} catch ( error ) {
				caughtError = error;
			}

			fetchResolve();
			expect( caughtError ).to.be.instanceOf( Error );
			expect( caughtError.message ).to.equal( 'The editor was destroyed before the emoji repository finished loading.' );
		} );

		it( 'should reject immediately when called on an already-destroyed editor', async () => {
			const { editor, domElement } = await createTestEditor( resolve => {
				const response = JSON.stringify( [
					{ annotation: 'neutral face', emoji: '😐️', group: 0, version: 15 }
				] );

				resolve( new Response( response ) );
			} );

			const plugin = editor.plugins.get( EmojiRepository );

			domElement.remove();
			await editor.destroy();

			let caughtError;

			try {
				await plugin.isReady();
			} catch ( error ) {
				caughtError = error;
			}

			expect( caughtError ).to.be.instanceOf( Error );
			expect( caughtError.message ).to.equal( 'The editor was destroyed before the emoji repository finished loading.' );
		} );
	} );

	async function createTestEditor( fetchStubCallback, editorConfig = {} ) {
		const domElement = global.document.createElement( 'div' );
		global.document.body.appendChild( domElement );

		let fetchStubResolve, fetchStubReject;

		fetchStub.returns( new Promise( ( resolve, reject ) => {
			fetchStubResolve = resolve;
			fetchStubReject = reject;
		} ) );

		const editorPromise = ClassicTestEditor.create( domElement, {
			plugins: [
				Essentials,
				Paragraph,
				EmojiRepository
			],
			...editorConfig
		} );

		const editor = await editorPromise;
		const repository = editor.plugins.get( EmojiRepository );

		fetchStubCallback( fetchStubResolve, fetchStubReject );

		await repository.isReady();
		await clock.nextAsync();

		return {
			editor,
			domElement
		};
	}
} );
