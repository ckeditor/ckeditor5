/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import EmojiCategoriesView from '../../src/ui/emojicategoriesview.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'EmojiCategoriesView', () => {
	let locale, emojiCategoriesView, emojiGroups;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		locale = {
			t: val => val
		};

		emojiGroups = [
			{
				title: 'faces',
				exampleEmoji: '😊'
			}, {
				title: 'food',
				exampleEmoji: '🍕'
			}, {
				title: 'things',
				exampleEmoji: '📕'
			}
		];

		emojiCategoriesView = new EmojiCategoriesView( locale, { emojiGroups, categoryName: 'faces' } );
		emojiCategoriesView.render();
	} );

	afterEach( () => {
		emojiCategoriesView.destroy();
	} );

	it( 'updates `categoryName` on a category item click', () => {
		expect( emojiCategoriesView.categoryName ).to.equal( 'faces' );

		emojiCategoriesView._buttonViews._items[ 1 ].fire( 'execute' );

		expect( emojiCategoriesView.categoryName ).to.equal( 'food' );
	} );

	describe( 'constructor()', () => {
		it( 'creates #element from template', () => {
			expect( emojiCategoriesView.element.classList.contains( 'ck' ) ).to.be.true;
			expect( emojiCategoriesView.element.classList.contains( 'ck-emoji__categories' ) ).to.be.true;

			expect( Object.values( emojiCategoriesView.element.childNodes ).length ).to.equal( emojiGroups.length );

			expect( emojiCategoriesView.element.getAttribute( 'role' ) ).to.equal( 'tablist' );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the search bar', () => {
			const spy = sinon.spy( emojiCategoriesView._buttonViews.first, 'focus' );

			emojiCategoriesView.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'enableCategories()', () => {
		it( 'enables all buttons', () => {
			emojiCategoriesView.enableCategories();

			emojiCategoriesView._buttonViews.forEach( buttonView => {
				expect( buttonView.isEnabled ).to.equal( true );
			} );
		} );

		it( 'should restore the "active" category indicator when categories are enabled', () => {
			const button = emojiCategoriesView._buttonViews.get( 0 );

			expect( button.element.classList.contains( 'ck-emoji__category-item_active' ) ).to.equal( true );
			emojiCategoriesView.disableCategories();
			expect( button.element.classList.contains( 'ck-emoji__category-item_active' ) ).to.equal( false );
			emojiCategoriesView.enableCategories();
			expect( button.element.classList.contains( 'ck-emoji__category-item_active' ) ).to.equal( true );
		} );
	} );

	describe( 'disableCategories()', () => {
		it( 'disables all buttons', () => {
			emojiCategoriesView.disableCategories();

			emojiCategoriesView._buttonViews.forEach( buttonView => {
				expect( buttonView.isEnabled ).to.equal( false );
			} );
		} );
	} );
} );
