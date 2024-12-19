/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import EmojiToneView from '../../src/ui/emojitoneview.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'EmojiToneView', () => {
	let locale, emojiToneView;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		locale = {
			t: val => val
		};

		emojiToneView = new EmojiToneView( locale, 0 );
		emojiToneView.render();
	} );

	afterEach( () => {
		emojiToneView.destroy();
	} );

	it( 'updates the skin tone when #execute event triggers', () => {
		expect( emojiToneView.selectedSkinTone ).to.equal( 0 );

		Array.from( emojiToneView._dropdownButtons ).at( -1 ).fire( 'execute' );

		expect( emojiToneView.selectedSkinTone ).to.equal( 5 );
	} );

	describe( 'constructor()', () => {
		it( 'creates #element from template', () => {
			expect( emojiToneView.element.classList.contains( 'ck' ) ).to.be.true;
			expect( emojiToneView.element.classList.contains( 'ck-emoji-tone' ) ).to.be.true;

			expect( Object.values( emojiToneView.element.childNodes ).length ).to.equal( 1 );

			const childNode = emojiToneView.element.childNodes[ 0 ];

			expect( childNode.classList.contains( 'ck' ) ).to.be.true;
			expect( childNode.classList.contains( 'ck-dropdown' ) ).to.be.true;
		} );

		it( 'sets #selectedSkinTone to value passed to the constructor', () => {
			emojiToneView = new EmojiToneView( locale, 0 );
			expect( emojiToneView.selectedSkinTone ).to.equal( 0 );

			emojiToneView = new EmojiToneView( locale, 3 );
			expect( emojiToneView.selectedSkinTone ).to.equal( 3 );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the dropdown', () => {
			const spy = sinon.spy( emojiToneView._mainDropdownButton, 'focus' );

			emojiToneView.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );
} );
