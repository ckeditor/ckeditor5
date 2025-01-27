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

	describe( '#dropdownView', () => {
		it( 'updates the `#skinTone` property on click on a menu option', () => {
			emojiToneView.dropdownView.isOpen = true;

			expect( emojiToneView.skinTone ).to.equal( 'default' );

			emojiToneView.dropdownView.listView.items.get( 5 ).children.first.fire( 'execute' );

			expect( emojiToneView.skinTone ).to.equal( 'dark' );
		} );

		describe( '#buttonView', () => {
			it( 'uses the emoji instead of a descriptive text label as initial value', () => {
				expect( emojiToneView.dropdownView.buttonView.label ).to.equal( '👋' );
			} );

			it( 'uses the emoji instead of a descriptive text label after clicking on a menu option', () => {
				emojiToneView.dropdownView.isOpen = true;
				emojiToneView.dropdownView.listView.items.get( 3 ).children.first.fire( 'execute' );

				expect( emojiToneView.dropdownView.buttonView.label ).to.equal( '👋🏽' );
			} );

			it( 'does not use the `[aria-labelled-by]` attribute as the button is descriptive enough', () => {
				expect( emojiToneView.dropdownView.buttonView.ariaLabel ).to.equal( 'Default skin tone, Select skin tone' );
				expect( emojiToneView.dropdownView.buttonView.ariaLabelledBy ).to.equal( undefined );
			} );

			it( 'updates the `[aria-label]` attribute to include the current state and the dropdown action', () => {
				emojiToneView.dropdownView.isOpen = true;

				expect( emojiToneView.skinTone ).to.equal( 'default' );

				emojiToneView.dropdownView.listView.items.get( 3 ).children.first.fire( 'execute' );

				expect( emojiToneView.dropdownView.buttonView.ariaLabel ).to.equal( 'Medium skin tone, Select skin tone' );
			} );
		} );

		describe( '#listView', () => {
			it( 'does not use the `[aria-labelled-by]` attribute as the button is descriptive enough for all items', () => {
				emojiToneView.dropdownView.isOpen = true;

				const listItems = [ ...emojiToneView.dropdownView.listView.items ];

				expect( listItems.length ).to.equal( 6 );

				expect( listItems[ 0 ].children.first.tooltip ).to.equal( 'Default skin tone' );
				expect( listItems[ 0 ].children.first.label ).to.equal( '👋' );
				expect( listItems[ 0 ].children.first.ariaLabel ).to.equal( 'Default skin tone' );
				expect( listItems[ 0 ].children.first.ariaLabelledBy ).to.equal( undefined );

				expect( listItems[ 1 ].children.first.tooltip ).to.equal( 'Light skin tone' );
				expect( listItems[ 1 ].children.first.label ).to.equal( '👋🏻' );
				expect( listItems[ 1 ].children.first.ariaLabel ).to.equal( 'Light skin tone' );
				expect( listItems[ 1 ].children.first.ariaLabelledBy ).to.equal( undefined );

				expect( listItems[ 2 ].children.first.tooltip ).to.equal( 'Medium Light skin tone' );
				expect( listItems[ 2 ].children.first.label ).to.equal( '👋🏼' );
				expect( listItems[ 2 ].children.first.ariaLabel ).to.equal( 'Medium Light skin tone' );
				expect( listItems[ 2 ].children.first.ariaLabelledBy ).to.equal( undefined );

				expect( listItems[ 3 ].children.first.tooltip ).to.equal( 'Medium skin tone' );
				expect( listItems[ 3 ].children.first.label ).to.equal( '👋🏽' );
				expect( listItems[ 3 ].children.first.ariaLabel ).to.equal( 'Medium skin tone' );
				expect( listItems[ 3 ].children.first.ariaLabelledBy ).to.equal( undefined );

				expect( listItems[ 4 ].children.first.tooltip ).to.equal( 'Medium Dark skin tone' );
				expect( listItems[ 4 ].children.first.label ).to.equal( '👋🏾' );
				expect( listItems[ 4 ].children.first.ariaLabel ).to.equal( 'Medium Dark skin tone' );
				expect( listItems[ 4 ].children.first.ariaLabelledBy ).to.equal( undefined );

				expect( listItems[ 5 ].children.first.tooltip ).to.equal( 'Dark skin tone' );
				expect( listItems[ 5 ].children.first.label ).to.equal( '👋🏿' );
				expect( listItems[ 5 ].children.first.ariaLabel ).to.equal( 'Dark skin tone' );
				expect( listItems[ 5 ].children.first.ariaLabelledBy ).to.equal( undefined );
			} );
		} );
	} );
} );
