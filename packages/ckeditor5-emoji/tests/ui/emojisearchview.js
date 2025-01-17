/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import EmojiSearchView from '../../src/ui/emojisearchview.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { SearchInfoView } from '@ckeditor/ckeditor5-ui';
import EmojiGridView from '../../src/ui/emojigridview.js';

describe( 'EmojiSearchView', () => {
	let locale, emojiSearchView, emojiGroups;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		locale = {
			t: val => val
		};

		emojiGroups = [ {
			title: 'faces',
			icon: '😊',
			items: [
				{ 'annotation': 'grinning face', 'emoji': '😀', skins: { 'default': '😀' } }
			]
		}, {
			title: 'food',
			icon: '🍕',
			items: [
				{ 'annotation': 'grinning face', 'emoji': '😀', skins: { 'default': '😀' } }
			]
		}, {
			title: 'things',
			icon: '📕',
			items: []
		} ];

		const searchInfoView = new SearchInfoView();
		const emojiGridView = new EmojiGridView( locale, { emojiGroups, categoryName: 'faces', getEmojiBySearchQuery: () => [
			{ 'annotation': 'grinning face', 'emoji': '😀', skins: { 'default': '😀' } }
		] } );

		emojiSearchView = new EmojiSearchView( locale, { gridView: emojiGridView, resultsView: searchInfoView } );
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

			const childNodes = emojiSearchView.element.childNodes;

			expect( childNodes.length ).to.equal( 1 );
		} );

		it( 'delegates the #search event up for the search value', () => {
			const spy = sinon.spy();

			emojiSearchView.on( 'search', spy );
			emojiSearchView.inputView.fire( 'search', {} );

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'search()', () => {
		it( 'should delegate the search event to the inputView (npn empty query)', () => {
			const spy = sinon.spy();
			const filterSpy = sinon.spy( emojiSearchView.gridView, 'filter' );

			emojiSearchView.on( 'search', spy );
			emojiSearchView.search( 'faces' );

			sinon.assert.calledOnce( spy );
			sinon.assert.calledOnce( filterSpy );
		} );

		it( 'should delegate the search event to the inputView (empty query)', () => {
			const spy = sinon.spy();
			const filterSpy = sinon.spy( emojiSearchView.gridView, 'filter' );

			emojiSearchView.on( 'search', spy );
			emojiSearchView.search( '' );

			sinon.assert.calledOnce( spy );
			sinon.assert.calledOnceWithExactly( filterSpy, null );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the search bar', () => {
			const spy = sinon.spy( emojiSearchView.inputView, 'focus' );

			emojiSearchView.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'setInputValue()', () => {
		it( 'sets the value of text input element to passed string', () => {
			emojiSearchView.setInputValue( 'smile' );

			expect( emojiSearchView.element.querySelector( 'input' ).value ).to.equal( 'smile' );
		} );

		it( 'sets the value of text input element to an empty value', () => {
			emojiSearchView.setInputValue( 'smile' );

			expect( emojiSearchView.element.querySelector( 'input' ).value ).to.equal( 'smile' );

			emojiSearchView.setInputValue( '' );

			expect( emojiSearchView.element.querySelector( 'input' ).value ).to.equal( '' );
		} );
	} );
} );
