/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import EmojiToneView from '../../src/ui/emojitoneview.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'EmojiToneView', () => {
	let locale, emojiToneView, skinTones;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		locale = {
			t: val => val
		};

		skinTones = [
			{ id: 'default', icon: '👋', tooltip: 'Default skin tone' },
			{ id: 'light', icon: '👋🏻', tooltip: 'Light skin tone' },
			{ id: 'medium-light', icon: '👋🏼', tooltip: 'Medium Light skin tone' },
			{ id: 'medium', icon: '👋🏽', tooltip: 'Medium skin tone' },
			{ id: 'medium-dark', icon: '👋🏾', tooltip: 'Medium Dark skin tone' },
			{ id: 'dark', icon: '👋🏿', tooltip: 'Dark skin tone' }
		];

		emojiToneView = new EmojiToneView( locale, { skinTone: 'default', skinTones } );
		emojiToneView.render();
	} );

	afterEach( () => {
		emojiToneView.destroy();
	} );

	it( 'updates the skin tone when #execute event triggers', () => {
		emojiToneView.dropdownView.isOpen = true;

		expect( emojiToneView.skinTone ).to.equal( 'default' );

		emojiToneView.dropdownView.listView.items.get( 5 ).children.first.fire( 'execute' );

		expect( emojiToneView.skinTone ).to.equal( 'dark' );
	} );

	describe( 'constructor()', () => {
		it( 'creates #element from template', () => {
			expect( emojiToneView.element.classList.contains( 'ck' ) ).to.be.true;
			expect( emojiToneView.element.classList.contains( 'ck-emoji__skin-tone' ) ).to.be.true;

			expect( Object.values( emojiToneView.element.childNodes ).length ).to.equal( 1 );

			const childNode = emojiToneView.element.childNodes[ 0 ];

			expect( childNode.classList.contains( 'ck' ) ).to.be.true;
			expect( childNode.classList.contains( 'ck-dropdown' ) ).to.be.true;
		} );

		it( 'sets #selectedSkinTone to value passed to the constructor', () => {
			emojiToneView = new EmojiToneView( locale, { skinTone: 'default', skinTones } );
			expect( emojiToneView.skinTone ).to.equal( 'default' );

			emojiToneView = new EmojiToneView( locale, { skinTone: 'medium', skinTones } );
			expect( emojiToneView.skinTone ).to.equal( 'medium' );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the dropdown', () => {
			const spy = sinon.spy( emojiToneView.dropdownView.buttonView, 'focus' );

			emojiToneView.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );
} );
