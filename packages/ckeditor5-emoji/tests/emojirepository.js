/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { global } from '@ckeditor/ckeditor5-utils';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { EmojiRepository } from '../src/emojirepository.js';
import { EmojiUtils } from '../src/emojiutils.ts';
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

describe( 'EmojiRepository', () => {
	let consoleStub, fetchStub;

	beforeEach( () => {
		vi.useFakeTimers();

		EmojiRepository._results = {};

		consoleStub = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
		fetchStub = vi.spyOn( window, 'fetch' );
	} );

	afterEach( () => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	} );

	it( 'should be correctly named', () => {
		expect( EmojiRepository.pluginName ).toBe( 'EmojiRepository' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( EmojiRepository.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( EmojiRepository.isPremiumPlugin ).toBe( false );
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

			expect( configValue ).toBe( false );

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

			expect( fetchStub.mock.calls.length ).toBe( 1 );

			const cdnUrl = fetchStub.mock.calls[ 0 ][ 0 ];

			expect( cdnUrl.href.startsWith( 'https://cdn.ckeditor.com/ckeditor5/data/emoji/16/en.json' ) ).toBe( true );
			expect( cdnUrl.searchParams.has( 'editorVersion' ) ).toBe( true );

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

			expect( fetchStub.mock.calls.length ).toBe( 1 );

			const fetchOptions = fetchStub.mock.calls[ 0 ][ 1 ];

			expect( fetchOptions ).toHaveProperty( 'cache', 'force-cache' );

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

			expect( fetchStub.mock.calls.length ).toBe( 1 );

			const cdnUrl = fetchStub.mock.calls[ 0 ][ 0 ];

			expect( cdnUrl.href.startsWith( 'https://cdn.ckeditor.com/ckeditor5/data/emoji/16/en.json' ) ).toBe( true );

			const results = EmojiRepository._results[ cdnUrl.href ];

			expect( results ).toHaveLength( 2 );
			expect( results[ 0 ] ).toHaveProperty( 'annotation', 'neutral face' );
			expect( results[ 1 ] ).toHaveProperty( 'annotation', 'unamused face' );

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

			expect( fetchStub.mock.calls.length ).toBe( 2 );

			const cdnUrl1 = fetchStub.mock.calls[ 0 ][ 0 ];
			const cdnUrl2 = fetchStub.mock.calls[ 1 ][ 0 ];

			expect( cdnUrl1.href.startsWith( 'https://cdn.ckeditor.com/ckeditor5/data/emoji/16/en.json' ) ).toBe( true );
			expect( cdnUrl2.href.startsWith( 'https://cdn.ckeditor.com/ckeditor5/data/emoji/15/en.json' ) ).toBe( true );

			const resultsFor16 = EmojiRepository._results[ cdnUrl1.href ];
			const resultsFor15 = EmojiRepository._results[ cdnUrl2.href ];

			expect( resultsFor16 ).toHaveLength( 2 );
			expect( resultsFor16[ 0 ] ).toHaveProperty( 'annotation', 'neutral face' );
			expect( resultsFor16[ 1 ] ).toHaveProperty( 'annotation', 'unamused face' );

			expect( resultsFor15 ).toHaveLength( 2 );
			expect( resultsFor15[ 0 ] ).toHaveProperty( 'annotation', 'neutral face' );
			expect( resultsFor15[ 1 ] ).toHaveProperty( 'annotation', 'unamused face' );

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

			expect( fetchStub.mock.calls.length ).toBe( 1 );

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

			expect( fetchStub.mock.calls.length ).toBe( 1 );

			const results = EmojiRepository._results[ fetchStub.mock.calls[ 0 ][ 0 ] ];

			expect( results ).toEqual( [] );

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

			const results = EmojiRepository._results[ fetchStub.mock.calls[ 0 ][ 0 ] ];
			const hasGroup2 = results.some( item => item.group === 2 );

			expect( hasGroup2 ).toBe( false );

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
			const results = EmojiRepository._results[ fetchStub.mock.calls[ 0 ][ 0 ] ];
			const headShakingHorizontallyEmoji = results.find( item => item.annotation === 'head shaking horizontally' );
			const unamusedFaceEmoji = results.find( item => item.annotation === 'unamused face' );

			expect( unamusedFaceEmoji ).toBeDefined();
			expect( headShakingHorizontallyEmoji ).toBeUndefined();

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

			const results = EmojiRepository._results[ fetchStub.mock.calls[ 0 ][ 0 ] ];

			const hasNeutralFaceEmoji = results.find( item => item.annotation === 'neutral face' );
			const hasUnamusedEmoji = results.find( item => item.annotation === 'unamused face' );

			expect( hasNeutralFaceEmoji ).toBeUndefined();
			expect( hasUnamusedEmoji ).toBeDefined();

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

			const results = EmojiRepository._results[ fetchStub.mock.calls[ 0 ][ 0 ] ];

			// EmojiUtilsMockVersion15 removes emoji assigned to version `16`.
			// However, the filtering mechanism is disabled by passing `emoji.useCustomFont=true`.
			// Hence, all definitions returned from the server should be available.
			const hasNeutralFaceEmoji = results.find( item => item.annotation === 'neutral face' );
			const hasUnamusedEmoji = results.find( item => item.annotation === 'unamused face' );

			expect( hasNeutralFaceEmoji ).toBeDefined();
			expect( hasUnamusedEmoji ).toBeDefined();

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

			const results = EmojiRepository._results[ fetchStub.mock.calls[ 0 ][ 0 ] ];

			expect( results ).toHaveLength( 2 );
			expect( results[ 0 ].skins ).toEqual( { default: '😐️' } );
			expect( results[ 1 ].skins ).toEqual( { default: '😒' } );

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

			const results = EmojiRepository._results[ fetchStub.mock.calls[ 0 ][ 0 ] ];

			expect( results ).toHaveLength( 1 );
			expect( results[ 0 ].skins ).toEqual( {
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

			const results = EmojiRepository._results[ fetchStub.mock.calls[ 0 ][ 0 ] ];

			expect( results ).toEqual( [] );

			expect( consoleStub ).toHaveBeenCalled();
			expect( consoleStub ).toHaveBeenCalledWith( 'emoji-repository-empty', expect.anything() );

			domElement.remove();
			await editor.destroy();
		} );

		it( 'should log a warning and store emoji database as empty array on network error when fetching emoji database', async () => {
			const { editor, domElement } = await createTestEditor( ( resolve, reject ) => {
				reject( new Response() );
			} );

			const results = EmojiRepository._results[ fetchStub.mock.calls[ 0 ][ 0 ] ];

			expect( results ).toEqual( [] );

			expect( consoleStub ).toHaveBeenCalled();
			expect( consoleStub ).toHaveBeenCalledWith( 'emoji-repository-empty', expect.anything() );

			domElement.remove();
			await editor.destroy();
		} );

		it( 'should log a warning if there are no supported emojis', async () => {
			vi.spyOn( EmojiUtils, '_isEmojiSupported' ).mockReturnValue( false );

			const { editor, domElement } = await createTestEditor( resolve => {
				const response = JSON.stringify( [
					{ annotation: 'smiling face', emoji: '🙂', group: 1, version: 15 }
				] );

				resolve( new Response( response ) );
			} );

			expect( consoleStub ).toHaveBeenCalled();
			expect( consoleStub.mock.calls[ 0 ][ 0 ] ).toBe( 'emoji-repository-empty' );

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

			expect( consoleStub ).toHaveBeenCalled();
			expect( consoleStub.mock.calls[ 0 ][ 0 ] ).toBe( 'emoji-repository-redundant-version' );

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

			expect( consoleStub ).toHaveBeenCalled();
			expect( consoleStub ).toHaveBeenCalledWith( 'emoji-repository-cdn-use', expect.anything() );

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

			expect( consoleStub ).not.toHaveBeenCalledWith( 'emoji-repository-redundant-version', expect.anything() );

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

			expect( consoleStub ).not.toHaveBeenCalledWith( 'emoji-repository-redundant-version', expect.anything() );

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

			expect( consoleStub ).not.toHaveBeenCalledWith( 'emoji-repository-redundant-version', expect.anything() );

			domElement.remove();
			await editor.destroy();
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

		it( 'should return empty array if emojis failed to load', () => {
			emojiRepositoryPlugin._items = null;

			const result = emojiRepositoryPlugin.getEmojiByQuery( 'face' );

			expect( result ).toEqual( [] );
		} );

		it( 'should return empty array if search query is empty', () => {
			const result = emojiRepositoryPlugin.getEmojiByQuery( '' );

			expect( result ).toEqual( [] );
		} );

		it( 'should return empty array if search query is shorter than 2 characters', () => {
			const result = emojiRepositoryPlugin.getEmojiByQuery( 'f' );

			expect( result ).toEqual( [] );
		} );

		it( 'should return empty array if search query does not contain two non-white characters next to each other', () => {
			const result = emojiRepositoryPlugin.getEmojiByQuery( 'f w' );

			expect( result ).toEqual( [] );
		} );

		it( 'should return empty array if search query does not match any emoji', () => {
			const result = emojiRepositoryPlugin.getEmojiByQuery( 'face happy' );

			expect( result ).toEqual( [] );
		} );

		it( 'should return emojis matched by emoticon', () => {
			const result = emojiRepositoryPlugin.getEmojiByQuery( ':|' );

			expect( result ).toHaveLength( 1 );
			expect( result[ 0 ] ).toHaveProperty( 'annotation', 'neutral face' );
		} );

		it( 'should return emojis matched by annotation (single match)', () => {
			const result = emojiRepositoryPlugin.getEmojiByQuery( 'neutral' );

			expect( result ).toHaveLength( 1 );
			expect( result[ 0 ] ).toHaveProperty( 'annotation', 'neutral face' );
		} );

		it( 'should return emojis matched by annotation (multiple matches)', () => {
			const result = emojiRepositoryPlugin.getEmojiByQuery( 'face' );

			expect( result ).toHaveLength( 2 );
			expect( result[ 0 ] ).toHaveProperty( 'annotation', 'unamused face' );
			expect( result[ 1 ] ).toHaveProperty( 'annotation', 'neutral face' );
		} );

		it( 'should return emojis matched by tags (single match)', () => {
			const result = emojiRepositoryPlugin.getEmojiByQuery( 'blank' );

			expect( result ).toHaveLength( 1 );
			expect( result[ 0 ] ).toHaveProperty( 'annotation', 'neutral face' );
		} );

		it( 'should return emojis matched by tags (multiple matches)', () => {
			const result = emojiRepositoryPlugin.getEmojiByQuery( 'whatever' );

			expect( result ).toHaveLength( 2 );
			expect( result[ 0 ] ).toHaveProperty( 'annotation', 'unamused face' );
			expect( result[ 1 ] ).toHaveProperty( 'annotation', 'neutral face' );
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
			EmojiRepository._results[ emojiRepositoryPlugin._url ] = [];

			const result = emojiRepositoryPlugin.getEmojiCategories();

			expect( result ).toHaveLength( 0 );
		} );

		it( 'should return emojis grouped by category', () => {
			const result = emojiRepositoryPlugin.getEmojiCategories();

			expect( result ).toHaveLength( 9 );

			expect( result[ 0 ] ).toHaveProperty( 'groupId', 0 );
			expect( result[ 0 ].items ).toHaveLength( 1 );
			expect( result[ 0 ].items[ 0 ] ).toHaveProperty( 'annotation', 'neutral face' );

			expect( result[ 1 ] ).toHaveProperty( 'groupId', 1 );
			expect( result[ 1 ].items ).toHaveLength( 1 );
			expect( result[ 1 ].items[ 0 ] ).toHaveProperty( 'annotation', 'ninja' );

			expect( result[ 2 ] ).toHaveProperty( 'groupId', 3 );
			expect( result[ 2 ].items ).toHaveLength( 1 );
			expect( result[ 2 ].items[ 0 ] ).toHaveProperty( 'annotation', 'lobster' );

			expect( result[ 3 ] ).toHaveProperty( 'groupId', 4 );
			expect( result[ 3 ].items ).toHaveLength( 1 );
			expect( result[ 3 ].items[ 0 ] ).toHaveProperty( 'annotation', 'salt' );

			expect( result[ 4 ] ).toHaveProperty( 'groupId', 5 );
			expect( result[ 4 ].items ).toHaveLength( 1 );
			expect( result[ 4 ].items[ 0 ] ).toHaveProperty( 'annotation', 'watch' );

			expect( result[ 5 ] ).toHaveProperty( 'groupId', 6 );
			expect( result[ 5 ].items ).toHaveLength( 1 );
			expect( result[ 5 ].items[ 0 ] ).toHaveProperty( 'annotation', 'magic wand' );

			expect( result[ 6 ] ).toHaveProperty( 'groupId', 7 );
			expect( result[ 6 ].items ).toHaveLength( 1 );
			expect( result[ 6 ].items[ 0 ] ).toHaveProperty( 'annotation', 'x-ray' );

			expect( result[ 7 ] ).toHaveProperty( 'groupId', 8 );
			expect( result[ 7 ].items ).toHaveLength( 1 );
			expect( result[ 7 ].items[ 0 ] ).toHaveProperty( 'annotation', 'up-left arrow' );

			expect( result[ 8 ] ).toHaveProperty( 'groupId', 9 );
			expect( result[ 8 ].items ).toHaveLength( 1 );
			expect( result[ 8 ].items[ 0 ] ).toHaveProperty( 'annotation', 'flag: Poland' );
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
			expect( emojiRepositoryPlugin.getSkinTones() ).toHaveLength( 6 );
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

			expect( result ).toBe( true );

			domElement.remove();
			await editor.destroy();
		} );

		it( 'should return `false` when emoji database is empty', async () => {
			const { editor, domElement } = await createTestEditor( resolve => {
				const response = JSON.stringify( [] );

				resolve( new Response( response ) );
			} );

			const result = await editor.plugins.get( EmojiRepository ).isReady();

			expect( result ).toBe( false );

			domElement.remove();
			await editor.destroy();
		} );

		it( 'should return `false` when emoji database is not stored', async () => {
			vi.spyOn( EmojiRepository, '_results', 'get' ).mockReturnValue( {} );

			const { editor, domElement } = await createTestEditor( resolve => {
				const response = JSON.stringify( [] );

				resolve( new Response( response ) );
			} );

			const result = await editor.plugins.get( EmojiRepository ).isReady();

			expect( result ).toBe( false );

			domElement.remove();
			await editor.destroy();
		} );
	} );

	async function createTestEditor( fetchStubCallback, editorConfig = {} ) {
		const domElement = global.document.createElement( 'div' );
		global.document.body.appendChild( domElement );

		let fetchStubResolve, fetchStubReject;

		fetchStub.mockReturnValue( new Promise( ( resolve, reject ) => {
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

		// Break the event loop to execute scheduled promise callbacks.
		await vi.advanceTimersToNextTimerAsync();

		fetchStubCallback( fetchStubResolve, fetchStubReject );

		return {
			editor: await editorPromise,
			domElement
		};
	}
} );
