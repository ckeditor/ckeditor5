/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import EmojiUtils from '../../src/emojiutils.ts';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';

describe( 'EmojiUtils', () => {
	let editor, emojiUtils, editorElement;
	testUtils.createSinonSandbox();

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
	} );

	it( 'should have proper name', () => {
		expect( EmojiUtils.pluginName ).to.equal( 'EmojiUtils' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( EmojiUtils.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( EmojiUtils.isPremiumPlugin ).to.be.false;
	} );

	describe( 'isEmojiSupported()', () => {
		it( 'should return false if emoji version is not supported by the os', async () => {
			const container = document.createElement( 'div' );

			const result = emojiUtils.isEmojiSupported( { emoji: '😒', version: '16' }, 15, container );

			expect( result ).to.be.false;

			container.remove();
		} );

		it( 'should return true if emoji version is supported by the os and is not ZWJ', async () => {
			const container = document.createElement( 'div' );

			const result = emojiUtils.isEmojiSupported( { emoji: '😒', version: '15' }, 15, container );

			expect( result ).to.be.true;

			container.remove();
		} );

		it( 'should return true if emoji version is supported by the os and is supported ZWJ', async () => {
			sinon.stub( editor.plugins.get( EmojiUtils ), 'isEmojiZwjSupported' ).returns( true );

			const container = document.createElement( 'div' );

			const result = emojiUtils.isEmojiSupported( { emoji: '🙂‍↔️', version: '15' }, 15, container );

			expect( result ).to.be.true;

			container.remove();
		} );

		it( 'should return false if emoji version is supported by the os and is not supported ZWJ', async () => {
			sinon.stub( editor.plugins.get( EmojiUtils ), 'isEmojiZwjSupported' ).returns( false );

			const container = document.createElement( 'div' );

			const result = emojiUtils.isEmojiSupported( { emoji: '🙂‍↔️', version: '15' }, 15, container );

			expect( result ).to.be.false;

			container.remove();
		} );
	} );

	describe( 'getEmojiSupportedVersionByOs()', () => {
		it( 'should return version 16 for Face with Bags Under Eyes', async () => {
			sinon.stub( EmojiUtils, '_isEmojiSupported' ).callsFake( emoji => emoji === '🫩' );

			const result = emojiUtils.getEmojiSupportedVersionByOs();

			expect( result ).to.equal( 16 );
		} );

		it( 'should return version 15 for Shaking Face', async () => {
			sinon.stub( EmojiUtils, '_isEmojiSupported' ).callsFake( emoji => emoji === '🫨' );

			const result = emojiUtils.getEmojiSupportedVersionByOs();

			expect( result ).to.equal( 15.1 );
		} );

		it( 'should return version 14 for Melting Face', async () => {
			sinon.stub( EmojiUtils, '_isEmojiSupported' ).callsFake( emoji => emoji === '🫠' );

			const result = emojiUtils.getEmojiSupportedVersionByOs();

			expect( result ).to.equal( 14 );
		} );

		it( 'should return version 13 for Face in Clouds', async () => {
			sinon.stub( EmojiUtils, '_isEmojiSupported' ).callsFake( emoji => emoji === '😶‍🌫️' );

			const result = emojiUtils.getEmojiSupportedVersionByOs();

			expect( result ).to.equal( 13.1 );
		} );

		it( 'should return version 12 for Technologist', async () => {
			sinon.stub( EmojiUtils, '_isEmojiSupported' ).callsFake( emoji => emoji === '🧑‍💻' );

			const result = emojiUtils.getEmojiSupportedVersionByOs();

			expect( result ).to.equal( 12.1 );
		} );

		it( 'should return version 11 for Smiling Face with Hearts', async () => {
			sinon.stub( EmojiUtils, '_isEmojiSupported' ).callsFake( emoji => emoji === '🥰' );

			const result = emojiUtils.getEmojiSupportedVersionByOs();

			expect( result ).to.equal( 11 );
		} );

		it( 'should return version 5 for Zany Face', async () => {
			sinon.stub( EmojiUtils, '_isEmojiSupported' ).callsFake( emoji => emoji === '🤪' );

			const result = emojiUtils.getEmojiSupportedVersionByOs();

			expect( result ).to.equal( 5 );
		} );

		it( 'should return version 4 for Medical Symbol', async () => {
			sinon.stub( EmojiUtils, '_isEmojiSupported' ).callsFake( emoji => emoji === '⚕️' );

			const result = emojiUtils.getEmojiSupportedVersionByOs();

			expect( result ).to.equal( 4 );
		} );

		it( 'should return version 3 for Rolling on the Floor Laughing', async () => {
			sinon.stub( EmojiUtils, '_isEmojiSupported' ).callsFake( emoji => emoji === '🤣' );

			const result = emojiUtils.getEmojiSupportedVersionByOs();

			expect( result ).to.equal( 3 );
		} );

		it( 'should return version 2 for Waving Hand: Medium Skin Tone', async () => {
			sinon.stub( EmojiUtils, '_isEmojiSupported' ).callsFake( emoji => emoji === '👋🏽' );

			const result = emojiUtils.getEmojiSupportedVersionByOs();

			expect( result ).to.equal( 2 );
		} );

		it( 'should return version 1 for Grinning Face', async () => {
			sinon.stub( EmojiUtils, '_isEmojiSupported' ).callsFake( emoji => emoji === '😀' );

			const result = emojiUtils.getEmojiSupportedVersionByOs();

			expect( result ).to.equal( 1 );
		} );

		it( 'should return version 0.7 for Neutral Face', async () => {
			sinon.stub( EmojiUtils, '_isEmojiSupported' ).callsFake( emoji => emoji === '😐' );

			const result = emojiUtils.getEmojiSupportedVersionByOs();

			expect( result ).to.equal( 0.7 );
		} );

		it( 'should return version 0.6 for Face with Tears of Joy', async () => {
			sinon.stub( EmojiUtils, '_isEmojiSupported' ).callsFake( emoji => emoji === '😂' );

			const result = emojiUtils.getEmojiSupportedVersionByOs();

			expect( result ).to.equal( 0.6 );
		} );

		it( 'should return 0 when no emoji is supported', async () => {
			sinon.stub( EmojiUtils, '_isEmojiSupported' ).returns( false );

			const result = emojiUtils.getEmojiSupportedVersionByOs();

			expect( result ).to.equal( 0 );
		} );
	} );

	describe( 'hasZwj()', () => {
		it( 'should return false for a simple emoji', async () => {
			const result = emojiUtils.hasZwj( '🙂' );

			expect( result ).to.be.false;
		} );

		it( 'should return true for a compound emoji', async () => {
			const result = emojiUtils.hasZwj( '😮‍💨' );

			expect( result ).to.be.true;
		} );
	} );

	describe( '_isEmojiZwjSupported()', () => {
		it( 'should return true when emoji is standard width', async () => {
			const container = document.createElement( 'div' );
			const emojiItem = { emoji: '🙂' };

			document.body.appendChild( container );

			const result = emojiUtils.isEmojiZwjSupported( emojiItem, container );

			expect( result ).to.be.true;

			container.remove();
		} );

		it( 'should return false when emoji is abnormally wide (size larger than 2 emoji)', async () => {
			const container = document.createElement( 'div' );
			const emojiItem = { emoji: '🙂🙂🙂' };

			document.body.appendChild( container );

			const result = emojiUtils.isEmojiZwjSupported( emojiItem, container );

			expect( result ).to.be.false;

			container.remove();
		} );
	} );

	describe( 'createEmojiWidthTestingContainer()', () => {
		it( 'should create a width testing container with correct attributes', async () => {
			const container = emojiUtils.createEmojiWidthTestingContainer();

			expect( container ).to.have.attribute( 'aria-hidden', 'true' );
			expect( container.style.position ).to.equal( 'absolute' );
			expect( container.style.left ).to.equal( '-9999px' );
			expect( container.style.whiteSpace ).to.equal( 'nowrap' );
			expect( container.style.fontSize ).to.equal( '24px' );

			container.remove();
		} );
	} );

	describe( 'isEmojiCategoryAllowed()', () => {
		it( 'should return true if emoji group is different than 2', async () => {
			const result = emojiUtils.isEmojiCategoryAllowed( { group: 1 } );

			expect( result ).to.be.true;
		} );

		it( 'should return false if emoji group is equal to 2', async () => {
			const result = emojiUtils.isEmojiCategoryAllowed( { group: 2 } );

			expect( result ).to.be.false;
		} );
	} );

	describe( 'normalizeEmojiSkinTone()', () => {
		it( 'normalize add default emoji to skins if property does not exist', async () => {
			const result = emojiUtils.normalizeEmojiSkinTone( {
				emoji: '👋'
			} );

			expect( result.skins.default ).to.equal( '👋' );
			expect( Object.keys( result.skins ) ).to.have.length( 1 );
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

			expect( result.skins.default ).to.equal( '👋' );
			expect( result.skins.light ).to.equal( '👋🏻' );
			expect( result.skins[ 'medium-light' ] ).to.equal( '👋🏼' );
			expect( result.skins.medium ).to.equal( '👋🏽' );
			expect( result.skins[ 'medium-dark' ] ).to.equal( '👋🏾' );
			expect( result.skins.dark ).to.equal( '👋🏿' );
			expect( Object.keys( result.skins ) ).to.have.length( 6 );
		} );
	} );
} );
