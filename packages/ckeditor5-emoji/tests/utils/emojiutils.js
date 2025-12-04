/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EmojiUtils } from '../../src/emojiutils.ts';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';

describe( 'EmojiUtils', () => {
	let editor, emojiUtils, editorElement;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ EmojiUtils ]
		} );

		emojiUtils = editor.plugins.get( EmojiUtils );
	} );

	afterEach( async () => {
		editorElement.remove();

		await editor.destroy();
		vi.restoreAllMocks();
	} );

	it( 'should have proper name', () => {
		expect( EmojiUtils.pluginName ).toBe( 'EmojiUtils' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( EmojiUtils.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( EmojiUtils.isPremiumPlugin ).toBe( false );
	} );

	describe( 'isEmojiSupported()', () => {
		it( 'should return false if emoji version is not supported by the os', async () => {
			const container = document.createElement( 'div' );

			const result = emojiUtils.isEmojiSupported( { emoji: '😒', version: '16' }, 15, container );

			expect( result ).toBe( false );

			container.remove();
		} );

		it( 'should return true if emoji version is supported by the os and is not ZWJ', async () => {
			const container = document.createElement( 'div' );

			const result = emojiUtils.isEmojiSupported( { emoji: '😒', version: '15' }, 15, container );

			expect( result ).toBe( true );

			container.remove();
		} );

		it( 'should return true if emoji version is supported by the os and is supported ZWJ', async () => {
			vi.spyOn( editor.plugins.get( EmojiUtils ), 'isEmojiZwjSupported' ).mockReturnValue( true );

			const container = document.createElement( 'div' );

			const result = emojiUtils.isEmojiSupported( { emoji: '🙂‍↔️', version: '15' }, 15, container );

			expect( result ).toBe( true );

			container.remove();
		} );

		it( 'should return false if emoji version is supported by the os and is not supported ZWJ', async () => {
			vi.spyOn( editor.plugins.get( EmojiUtils ), 'isEmojiZwjSupported' ).mockReturnValue( false );

			const container = document.createElement( 'div' );

			const result = emojiUtils.isEmojiSupported( { emoji: '🙂‍↔️', version: '15' }, 15, container );

			expect( result ).toBe( false );

			container.remove();
		} );
	} );

	describe( 'getEmojiSupportedVersionByOs()', () => {
		it( 'should return version 16 for Face with Bags Under Eyes', async () => {
			vi.spyOn( EmojiUtils, '_isEmojiSupported' ).mockImplementation( emoji => emoji === '🫩' );

			const result = emojiUtils.getEmojiSupportedVersionByOs();

			expect( result ).toBe( 16 );
		} );

		it( 'should return version 15 for Shaking Face', async () => {
			vi.spyOn( EmojiUtils, '_isEmojiSupported' ).mockImplementation( emoji => emoji === '🫨' );

			const result = emojiUtils.getEmojiSupportedVersionByOs();

			expect( result ).toBe( 15.1 );
		} );

		it( 'should return version 14 for Melting Face', async () => {
			vi.spyOn( EmojiUtils, '_isEmojiSupported' ).mockImplementation( emoji => emoji === '🫠' );

			const result = emojiUtils.getEmojiSupportedVersionByOs();

			expect( result ).toBe( 14 );
		} );

		it( 'should return version 13 for Face in Clouds', async () => {
			vi.spyOn( EmojiUtils, '_isEmojiSupported' ).mockImplementation( emoji => emoji === '😶‍🌫️' );

			const result = emojiUtils.getEmojiSupportedVersionByOs();

			expect( result ).toBe( 13.1 );
		} );

		it( 'should return version 12 for Technologist', async () => {
			vi.spyOn( EmojiUtils, '_isEmojiSupported' ).mockImplementation( emoji => emoji === '🧑‍💻' );

			const result = emojiUtils.getEmojiSupportedVersionByOs();

			expect( result ).toBe( 12.1 );
		} );

		it( 'should return version 11 for Smiling Face with Hearts', async () => {
			vi.spyOn( EmojiUtils, '_isEmojiSupported' ).mockImplementation( emoji => emoji === '🥰' );

			const result = emojiUtils.getEmojiSupportedVersionByOs();

			expect( result ).toBe( 11 );
		} );

		it( 'should return version 5 for Zany Face', async () => {
			vi.spyOn( EmojiUtils, '_isEmojiSupported' ).mockImplementation( emoji => emoji === '🤪' );

			const result = emojiUtils.getEmojiSupportedVersionByOs();

			expect( result ).toBe( 5 );
		} );

		it( 'should return version 4 for Medical Symbol', async () => {
			vi.spyOn( EmojiUtils, '_isEmojiSupported' ).mockImplementation( emoji => emoji === '⚕️' );

			const result = emojiUtils.getEmojiSupportedVersionByOs();

			expect( result ).toBe( 4 );
		} );

		it( 'should return version 3 for Rolling on the Floor Laughing', async () => {
			vi.spyOn( EmojiUtils, '_isEmojiSupported' ).mockImplementation( emoji => emoji === '🤣' );

			const result = emojiUtils.getEmojiSupportedVersionByOs();

			expect( result ).toBe( 3 );
		} );

		it( 'should return version 2 for Waving Hand: Medium Skin Tone', async () => {
			vi.spyOn( EmojiUtils, '_isEmojiSupported' ).mockImplementation( emoji => emoji === '👋🏽' );

			const result = emojiUtils.getEmojiSupportedVersionByOs();

			expect( result ).toBe( 2 );
		} );

		it( 'should return version 1 for Grinning Face', async () => {
			vi.spyOn( EmojiUtils, '_isEmojiSupported' ).mockImplementation( emoji => emoji === '😀' );

			const result = emojiUtils.getEmojiSupportedVersionByOs();

			expect( result ).toBe( 1 );
		} );

		it( 'should return version 0.7 for Neutral Face', async () => {
			vi.spyOn( EmojiUtils, '_isEmojiSupported' ).mockImplementation( emoji => emoji === '😐' );

			const result = emojiUtils.getEmojiSupportedVersionByOs();

			expect( result ).toBe( 0.7 );
		} );

		it( 'should return version 0.6 for Face with Tears of Joy', async () => {
			vi.spyOn( EmojiUtils, '_isEmojiSupported' ).mockImplementation( emoji => emoji === '😂' );

			const result = emojiUtils.getEmojiSupportedVersionByOs();

			expect( result ).toBe( 0.6 );
		} );

		it( 'should return 0 when no emoji is supported', async () => {
			vi.spyOn( EmojiUtils, '_isEmojiSupported' ).mockReturnValue( false );

			const result = emojiUtils.getEmojiSupportedVersionByOs();

			expect( result ).toBe( 0 );
		} );
	} );

	describe( 'hasZwj()', () => {
		it( 'should return false for a simple emoji', async () => {
			const result = emojiUtils.hasZwj( '🙂' );

			expect( result ).toBe( false );
		} );

		it( 'should return true for a compound emoji', async () => {
			const result = emojiUtils.hasZwj( '😮‍💨' );

			expect( result ).toBe( true );
		} );
	} );

	describe( 'isEmojiZwjSupported()', () => {
		it( 'uses fast-path by default', async () => {
			const canvasStub = vi.spyOn( emojiUtils, 'getNodeWidthUsingCanvas' ).mockReturnValueOnce( 30 );

			const getNodeWidthSpy = vi.spyOn( emojiUtils, 'getNodeWidth' );

			emojiUtils.isEmojiZwjSupported(
				{ emoji: '' },
				document.createElement( 'div' )
			);

			expect( canvasStub ).toHaveBeenCalled();
			expect( getNodeWidthSpy ).not.toHaveBeenCalled();
		} );

		it( 'falls back to slow-path if fast-path returns size larger than expected', async () => {
			const canvasStub = vi.spyOn( emojiUtils, 'getNodeWidthUsingCanvas' ).mockReturnValueOnce( Infinity );

			const getNodeWidthSpy = vi.spyOn( emojiUtils, 'getNodeWidth' );

			emojiUtils.isEmojiZwjSupported(
				{ emoji: '' },
				document.createElement( 'div' )
			);

			expect( canvasStub ).toHaveBeenCalled();
			expect( getNodeWidthSpy ).toHaveBeenCalled();
		} );
	} );

	describe( 'getNodeWidthUsingCanvas()', () => {
		it( 'should return true when emoji is standard width', async () => {
			const container = document.createElement( 'div' );
			const emojiItem = { emoji: '🙂' };

			document.body.appendChild( container );

			const result = emojiUtils.isEmojiZwjSupported( emojiItem, container );

			expect( result ).toBe( true );

			container.remove();
		} );

		it( 'should return false when emoji is abnormally wide (size larger than 2 emoji)', async () => {
			const container = document.createElement( 'div' );
			const emojiItem = { emoji: '🙂🙂🙂' };

			document.body.appendChild( container );

			const result = emojiUtils.isEmojiZwjSupported( emojiItem, container );

			expect( result ).toBe( false );

			container.remove();
		} );
	} );

	describe( 'getNodeWidth()', () => {
		it( 'should return true when emoji is standard width', async () => {
			const container = document.createElement( 'div' );
			const emojiItem = { emoji: '🙂' };

			document.body.appendChild( container );

			const result = emojiUtils.isEmojiZwjSupported( emojiItem, container );

			expect( result ).toBe( true );

			container.remove();
		} );

		it( 'should return false when emoji is abnormally wide (size larger than 2 emoji)', async () => {
			const container = document.createElement( 'div' );
			const emojiItem = { emoji: '🙂🙂🙂' };

			document.body.appendChild( container );

			const result = emojiUtils.isEmojiZwjSupported( emojiItem, container );

			expect( result ).toBe( false );

			container.remove();
		} );
	} );

	describe( 'createEmojiWidthTestingContainer()', () => {
		it( 'should create a width testing container with correct attributes', async () => {
			const container = emojiUtils.createEmojiWidthTestingContainer();

			expect( container.getAttribute( 'aria-hidden' ) ).toBe( 'true' );
			expect( container.style.position ).toBe( 'absolute' );
			expect( container.style.left ).toBe( '-9999px' );
			expect( container.style.whiteSpace ).toBe( 'nowrap' );
			expect( container.style.fontSize ).toBe( '24px' );

			container.remove();
		} );
	} );

	describe( 'isEmojiCategoryAllowed()', () => {
		it( 'should return true if emoji group is different than 2', async () => {
			const result = emojiUtils.isEmojiCategoryAllowed( { group: 1 } );

			expect( result ).toBe( true );
		} );

		it( 'should return false if emoji group is equal to 2', async () => {
			const result = emojiUtils.isEmojiCategoryAllowed( { group: 2 } );

			expect( result ).toBe( false );
		} );
	} );

	describe( 'normalizeEmojiSkinTone()', () => {
		it( 'normalize add default emoji to skins if property does not exist', async () => {
			const result = emojiUtils.normalizeEmojiSkinTone( {
				emoji: '👋'
			} );

			expect( result.skins.default ).toBe( '👋' );
			expect( Object.keys( result.skins ) ).toHaveLength( 1 );
		} );

		it( 'normalize emoji skin tone if property exists', async () => {
			const result = emojiUtils.normalizeEmojiSkinTone( {
				emoji: '👋',
				skins: [
					{ emoji: '👋🏻', version: 1, tone: 1 },
					{ emoji: '👋🏼', version: 1, tone: 2 },
					{ emoji: '👋🏽', version: 1, tone: 3 },
					{ emoji: '👋🏾', version: 1, tone: 4 },
					{ emoji: '👋🏿', version: 1, tone: 5 }
				]
			} );

			expect( result.skins.default ).toBe( '👋' );
			expect( result.skins.light ).toBe( '👋🏻' );
			expect( result.skins[ 'medium-light' ] ).toBe( '👋🏼' );
			expect( result.skins.medium ).toBe( '👋🏽' );
			expect( result.skins[ 'medium-dark' ] ).toBe( '👋🏾' );
			expect( result.skins.dark ).toBe( '👋🏿' );
			expect( Object.keys( result.skins ) ).toHaveLength( 6 );
		} );
	} );
} );
