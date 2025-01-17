/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
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

		emojiToneView = new EmojiToneView( locale, { skinTone: 'default' } );
		emojiToneView.render();
	} );

	afterEach( () => {
		emojiToneView.destroy();
	} );

	it( 'updates the skin tone when #execute event triggers', () => {
		expect( emojiToneView.skinTone ).to.equal( 'default' );

		Array.from( emojiToneView.dropdownButtons ).at( -1 ).fire( 'execute' );

		expect( emojiToneView.skinTone ).to.equal( 'dark' );
	} );

	it( 'displays a check mark next to the active skin tone', () => {
		expect( Array.from( emojiToneView.dropdownButtons ).map( button => button.isOn ) ).to.deep.equal( [
			true, false, false, false, false, false
		] );

		Array.from( emojiToneView.dropdownButtons ).at( -1 ).fire( 'execute' );

		expect( Array.from( emojiToneView.dropdownButtons ).map( button => button.isOn ) ).to.deep.equal( [
			false, false, false, false, false, true
		] );
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
			emojiToneView = new EmojiToneView( locale, { skinTone: 'default' } );
			expect( emojiToneView.skinTone ).to.equal( 'default' );

			emojiToneView = new EmojiToneView( locale, { skinTone: 'medium' } );
			expect( emojiToneView.skinTone ).to.equal( 'medium' );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the dropdown', () => {
			const spy = sinon.spy( emojiToneView.mainDropdownButton, 'focus' );

			emojiToneView.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );
} );
