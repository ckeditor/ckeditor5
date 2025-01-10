/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import EmojiSearchView from '../../src/ui/emojisearchview.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'EmojiSearchView', () => {
	let locale, emojiSearchView;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		locale = {
			t: val => val
		};

		emojiSearchView = new EmojiSearchView( locale );
		emojiSearchView.render();
	} );

	afterEach( () => {
		emojiSearchView.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'creates #element from template', () => {
			expect( emojiSearchView.element.classList.contains( 'ck' ) ).to.be.true;
			expect( emojiSearchView.element.classList.contains( 'ck-emoji-input' ) ).to.be.true;

			expect( Object.values( emojiSearchView.element.childNodes ).length ).to.equal( 1 );

			const childNode = emojiSearchView.element.childNodes[ 0 ];

			expect( childNode.classList.contains( 'ck' ) ).to.be.true;
			expect( childNode.classList.contains( 'ck-labeled-field-view' ) ).to.be.true;
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the search bar', () => {
			const spy = sinon.spy( emojiSearchView._findInputView, 'focus' );

			emojiSearchView.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'setSearchQuery()', () => {
		it( 'sets the value of text input element to passed string', () => {
			emojiSearchView.setSearchQuery( 'smile' );

			expect( emojiSearchView.element.querySelector( 'input' ).value ).to.equal( 'smile' );
			expect( emojiSearchView._findInputView.fieldView.isEmpty ).to.equal( false );
		} );

		it( 'sets the value of text input element to an empty value', () => {
			emojiSearchView.setSearchQuery( 'smile' );

			expect( emojiSearchView.element.querySelector( 'input' ).value ).to.equal( 'smile' );
			expect( emojiSearchView._findInputView.fieldView.isEmpty ).to.equal( false );

			emojiSearchView.setSearchQuery( '' );

			expect( emojiSearchView.element.querySelector( 'input' ).value ).to.equal( '' );
			expect( emojiSearchView._findInputView.fieldView.isEmpty ).to.equal( true );
		} );
	} );

	describe( '_createInputField()', () => {
		it( 'delegates the #input event up when the search value is empty', () => {
			const spy = sinon.spy();

			emojiSearchView.on( 'input', spy );
			emojiSearchView._findInputView.fieldView.fire( 'input' );

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, sinon.match.any, { value: null } );
		} );

		it( 'delegates the #input event up when the search value is not empty', () => {
			emojiSearchView.setSearchQuery( 'smile' );

			const spy = sinon.spy();

			emojiSearchView.on( 'input', spy );
			emojiSearchView._findInputView.fieldView.fire( 'input' );

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, sinon.match.any, { value: 'smile' } );
		} );

		it( 'delegates the #input event up when reset button is being clicked', () => {
			emojiSearchView.setSearchQuery( 'smile' );

			const spy = sinon.spy();

			emojiSearchView.on( 'input', spy );

			const resetInputButton = emojiSearchView.element.querySelector( '.ck-search__reset' );
			resetInputButton.click();

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, sinon.match.any, { value: '' } );
		} );
	} );
} );
