/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import EmojiCategoriesView from '../../src/ui/emojicategoriesview.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection.js';

describe( 'EmojiCategoriesView', () => {
	let locale, emojiCategoriesView, emojiCategories;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		locale = {
			t: val => val
		};

		emojiCategories = [
			{
				title: 'faces',
				icon: '😊'
			}, {
				title: 'food',
				icon: '🍕'
			}, {
				title: 'things',
				icon: '📕'
			}
		];

		emojiCategoriesView = new EmojiCategoriesView( locale, { emojiCategories, categoryName: 'faces' } );
		emojiCategoriesView.render();
	} );

	afterEach( () => {
		emojiCategoriesView.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'creates `view#buttonViews` collection', () => {
			expect( emojiCategoriesView.buttonViews ).to.be.instanceOf( ViewCollection );

			// To check if the `#createCollection()` factory was used.
			expect( emojiCategoriesView._viewCollections.has( emojiCategoriesView.buttonViews ) ).to.equal( true );
		} );

		it( 'creates #element from template', () => {
			expect( emojiCategoriesView.element.classList.contains( 'ck' ) ).to.be.true;
			expect( emojiCategoriesView.element.classList.contains( 'ck-emoji__categories-list' ) ).to.be.true;

			expect( Object.values( emojiCategoriesView.element.childNodes ).length ).to.equal( emojiCategories.length );

			expect( emojiCategoriesView.element.getAttribute( 'role' ) ).to.equal( 'tablist' );
		} );
	} );

	describe( 'focus()', () => {
		it( 'should focus the first category item', () => {
			const spy = sinon.spy( emojiCategoriesView.buttonViews.first, 'focus' );

			emojiCategoriesView.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy an instance of focus tracker', () => {
			const spy = sinon.spy( emojiCategoriesView.focusTracker, 'destroy' );

			emojiCategoriesView.destroy();

			sinon.assert.calledOnce( spy );
		} );

		it( 'should destroy an instance of keystroke handler', () => {
			const spy = sinon.spy( emojiCategoriesView.keystrokes, 'destroy' );

			emojiCategoriesView.destroy();

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'enableCategories()', () => {
		it( 'enables all buttons', () => {
			emojiCategoriesView.enableCategories();

			emojiCategoriesView.buttonViews.forEach( buttonView => {
				expect( buttonView.isEnabled ).to.equal( true );
			} );
		} );

		it( 'should restore the "active" category indicator when categories are enabled', () => {
			const button = emojiCategoriesView.buttonViews.get( 0 );

			expect( button.isOn ).to.equal( true );

			emojiCategoriesView.disableCategories();
			expect( button.isOn ).to.equal( false );

			emojiCategoriesView.enableCategories();
			expect( button.isOn ).to.equal( true );
		} );
	} );

	describe( 'disableCategories()', () => {
		it( 'disables all buttons', () => {
			emojiCategoriesView.disableCategories();

			emojiCategoriesView.buttonViews.forEach( buttonView => {
				expect( buttonView.class ).to.equal( '' );
				expect( buttonView.isOn ).to.equal( false );
				expect( buttonView.isEnabled ).to.equal( false );
			} );
		} );
	} );

	describe( '_createCategoryButton()', () => {
		it( 'renders the `[role]` attribute on each item', () => {
			const categoryButton = emojiCategoriesView._createCategoryButton( {
				title: 'faces',
				icon: '😊'
			} );

			expect( categoryButton.role ).to.equal( 'tab' );
		} );

		it( 'does not use the `[aria-labelled-by]` attribute as the button is descriptive enough', () => {
			const categoryButton = emojiCategoriesView._createCategoryButton( {
				title: 'faces',
				icon: '😊'
			} );

			expect( categoryButton.ariaLabelledBy ).to.equal( undefined );
		} );

		it( 'uses the emoji instead of a descriptive text label for a non-screen reader', () => {
			const categoryButton = emojiCategoriesView._createCategoryButton( {
				title: 'faces',
				icon: '😊'
			} );

			expect( categoryButton.label ).to.equal( '😊' );
		} );

		it( 'uses the emoji name instead of an icon for a screen reader', () => {
			const categoryButton = emojiCategoriesView._createCategoryButton( {
				title: 'faces',
				icon: '😊'
			} );

			expect( categoryButton.ariaLabel ).to.equal( 'faces' );
		} );
	} );

	describe( '#buttonViews', () => {
		it( 'updates `categoryName` upon clicking  a category item click', () => {
			expect( emojiCategoriesView.categoryName ).to.equal( 'faces' );

			emojiCategoriesView.buttonViews.get( 1 ).fire( 'execute' );

			expect( emojiCategoriesView.categoryName ).to.equal( 'food' );
		} );

		it( 'deactivates the previous active button upon clicking on a new one', () => {
			const facesButton = emojiCategoriesView.buttonViews.get( 0 );
			const thingsBottom = emojiCategoriesView.buttonViews.get( 2 );

			expect( facesButton.isOn ).to.equal( true );
			expect( thingsBottom.isOn ).to.equal( false );

			thingsBottom.fire( 'execute' );

			expect( facesButton.isOn ).to.equal( false );
			expect( thingsBottom.isOn ).to.equal( true );
		} );

		it( 'renders the `[aria-selected]` attribute on each item', () => {
			const facesButton = emojiCategoriesView.buttonViews.get( 0 );
			const foodButton = emojiCategoriesView.buttonViews.get( 1 );
			const thingsBottom = emojiCategoriesView.buttonViews.get( 2 );

			expect( facesButton.element.getAttribute( 'aria-selected' ) ).to.equal( 'true' );
			expect( foodButton.element.getAttribute( 'aria-selected' ) ).to.equal( 'false' );
			expect( thingsBottom.element.getAttribute( 'aria-selected' ) ).to.equal( 'false' );
		} );
	} );
} );
