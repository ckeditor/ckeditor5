/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { SearchInfoView, ViewCollection } from '@ckeditor/ckeditor5-ui';
import { EmojiCategoriesView } from '../../src/ui/emojicategoriesview.js';
import { EmojiGridView } from '../../src/ui/emojigridview.js';
import { EmojiPickerView } from '../../src/ui/emojipickerview.js';
import { EmojiSearchView } from '../../src/ui/emojisearchview.js';
import { EmojiToneView } from '../../src/ui/emojitoneview.js';

describe( 'EmojiPickerView', () => {
	let emojiPickerView, locale, emojiCategories, skinTones, emojiBySearchQuery;

	beforeEach( () => {
		locale = {
			t: val => val
		};

		emojiCategories = [
			{
				title: 'faces',
				icon: '😊',
				items: [
					{ 'annotation': 'grinning face', 'emoji': '😀', skins: { 'default': '😀' } }
				]
			}, {
				title: 'food',
				icon: '🍕',
				items: []
			}, {
				title: 'things',
				icon: '📕',
				items: []
			}
		];

		skinTones = [
			{ id: 'default', icon: '👋', tooltip: 'Default skin tone' },
			{ id: 'light', icon: '👋🏻', tooltip: 'Light skin tone' },
			{ id: 'medium-light', icon: '👋🏼', tooltip: 'Medium Light skin tone' },
			{ id: 'medium', icon: '👋🏽', tooltip: 'Medium skin tone' },
			{ id: 'medium-dark', icon: '👋🏾', tooltip: 'Medium Dark skin tone' },
			{ id: 'dark', icon: '👋🏿', tooltip: 'Dark skin tone' }
		];

		emojiBySearchQuery = () => [
			{ 'annotation': 'grinning face', 'emoji': '😀', skins: { 'default': '😀' } },
			{ 'annotation': 'grinning face', 'emoji': '😀', skins: { 'default': '😀' } }
		];

		emojiPickerView = new EmojiPickerView( locale, {
			emojiCategories,
			skinTones,
			getEmojiByQuery: emojiBySearchQuery,
			skinTone: 'default'
		} );
	} );

	afterEach( () => {
		if ( emojiPickerView.element ) {
			emojiPickerView.element.remove();
		}

		emojiPickerView.destroy();
	} );

	describe( 'constructor()', () => {
		const some = ( arg, callback ) => [ ...arg ].some( callback );

		it( 'should create search info view', () => {
			expect( some( emojiPickerView.items, view => view instanceof SearchInfoView ) ).to.equal( true );
		} );

		it( 'should create grid view with correct arguments', () => {
			expect( some( emojiPickerView.items, view => view instanceof EmojiGridView ) ).to.equal( true );
			expect( emojiPickerView.gridView.categoryName ).to.equal( 'faces' );
			expect( emojiPickerView.gridView.emojiCategories ).to.deep.equal( emojiCategories );
			expect( emojiPickerView.gridView._getEmojiByQuery ).to.equal( emojiBySearchQuery );
			expect( emojiPickerView.gridView.skinTone ).to.equal( 'default' );
		} );

		it( 'should create emoji search view with correct arguments', () => {
			expect( some( emojiPickerView.items, view => view instanceof EmojiSearchView ) ).to.equal( true );
			expect( emojiPickerView.searchView.gridView ).to.equal( emojiPickerView.gridView );
			expect( emojiPickerView.searchView.inputView.infoView ).to.equal( emojiPickerView.infoView );
		} );

		it( 'should create emoji categories view with correct arguments', () => {
			expect( some( emojiPickerView.items, view => view instanceof EmojiCategoriesView ) ).to.equal( true );
			expect( emojiPickerView.categoriesView.emojiCategories ).to.equal( emojiPickerView.emojiCategories );
			expect( emojiPickerView.categoriesView.categoryName ).to.equal( 'faces' );
		} );

		it( 'should create emoji tone view with correct arguments', () => {
			expect( some( emojiPickerView.items, view => view instanceof EmojiToneView ) ).to.equal( true );
			expect( emojiPickerView.toneView.skinTone ).to.equal( 'default' );
			expect( emojiPickerView.toneView._skinTones ).to.equal( skinTones );
		} );

		// https://github.com/ckeditor/ckeditor5/pull/12319#issuecomment-1231779819
		it( 'sets tabindex to -1 to avoid focus loss', () => {
			expect( emojiPickerView.template.attributes.tabindex ).to.deep.equal( [ '-1' ] );
		} );

		it( 'creates `view#items` collection', () => {
			expect( emojiPickerView.items ).to.be.instanceOf( ViewCollection );

			// To check if the `#createCollection()` factory was used.
			expect( emojiPickerView._viewCollections.has( emojiPickerView.items ) ).to.equal( true );
		} );

		describe( 'events handling', () => {
			it( 'should disable categories on search event emitted when query is not empty', () => {
				const stub = sinon.stub( emojiPickerView.categoriesView, 'disableCategories' );

				emojiPickerView.searchView.fire( 'search', { query: 'test' } );

				sinon.assert.calledOnce( stub );
			} );

			it( 'should enable categories on search event emitted when query is empty', () => {
				const stub = sinon.stub( emojiPickerView.categoriesView, 'enableCategories' );

				emojiPickerView.searchView.fire( 'search', { query: '' } );

				sinon.assert.calledOnce( stub );
			} );

			it( 'should display a hint for users when the query is too short', () => {
				emojiPickerView.searchView.fire( 'search', { query: '1' } );

				expect( emojiPickerView.infoView.primaryText ).to.equal( 'Keep on typing to see the emoji.' );
				expect( emojiPickerView.infoView.secondaryText ).to.equal( 'The query must contain at least two characters.' );
				expect( emojiPickerView.infoView.isVisible ).to.equal( true );
			} );

			it( 'should display a note when emoji were not matched with the specified query', () => {
				emojiPickerView.searchView.fire( 'search', { query: 'foo', resultsCount: 0 } );

				expect( emojiPickerView.infoView.primaryText ).to.equal( 'No emojis were found matching "%0".' );
				expect( emojiPickerView.infoView.secondaryText ).to.equal( 'Please try a different phrase or check the spelling.' );
				expect( emojiPickerView.infoView.isVisible ).to.equal( true );
			} );

			it( 'should hide the hint view when found emoji matches with the specified query', () => {
				emojiPickerView.searchView.fire( 'search', { query: 'foo', resultsCount: 1 } );

				expect( emojiPickerView.infoView.isVisible ).to.equal( false );
			} );

			it( 'should scroll to the top of the grid when an active category is changed', () => {
				const stub = sinon.stub( emojiPickerView.gridView.element, 'scrollTo' );

				emojiPickerView.categoriesView.categoryName = 'food';

				expect( emojiPickerView.gridView.categoryName ).to.equal( 'food' );
				sinon.assert.calledOnce( stub );
				sinon.assert.calledWith( stub, 0, 0 );
			} );

			it( 'should scroll to the top of the grid when a search event is emitted', () => {
				const stub = sinon.stub( emojiPickerView.gridView.element, 'scrollTo' );

				emojiPickerView.searchView.fire( 'search', { query: 'foo', resultsCount: 1 } );

				sinon.assert.calledOnce( stub );
				sinon.assert.calledWith( stub, 0, 0 );
			} );

			it( 'should trigger the search mechanism when an active category is changed', () => {
				const stub = sinon.stub( emojiPickerView.searchView, 'search' );

				emojiPickerView.categoriesView.categoryName = 'food';

				expect( emojiPickerView.gridView.categoryName ).to.equal( 'food' );
				sinon.assert.calledOnce( stub );
				sinon.assert.calledWith( stub, '' );
			} );

			it( 'should use the current query value when updating the skin tone property', () => {
				const searchStub = sinon.stub( emojiPickerView.searchView, 'search' );
				const getInputValueStub = sinon.stub( emojiPickerView.searchView, 'getInputValue' ).returns( 'thum' );

				emojiPickerView.toneView.skinTone = 'medium';

				expect( emojiPickerView.gridView.skinTone ).to.equal( 'medium' );
				sinon.assert.calledOnce( searchStub );
				sinon.assert.calledWith( searchStub, 'thum' );
				sinon.assert.calledOnce( getInputValueStub );
			} );

			it( 'should fire an update event when search event is emitted', () => {
				const fireSpy = sinon.spy( emojiPickerView, 'fire' );

				emojiPickerView.searchView.fire( 'search', { query: '' } );

				sinon.assert.calledOnce( fireSpy );
				sinon.assert.calledWith( fireSpy, 'update' );
			} );

			it( 'should not update the info view when there are no categories loaded', () => {
				emojiPickerView.categoriesView.buttonViews.clear();

				const setInfoSpy = sinon.spy( emojiPickerView.infoView, 'set' );

				// A single-character query that would normally trigger the "keep typing" hint.
				emojiPickerView.searchView.fire( 'search', { query: 'a' } );

				sinon.assert.notCalled( setInfoSpy );
			} );

			it( 'should not update the info view for "no results" message when there are no categories loaded', () => {
				emojiPickerView.categoriesView.buttonViews.clear();

				const setInfoSpy = sinon.spy( emojiPickerView.infoView, 'set' );

				emojiPickerView.searchView.fire( 'search', { query: 'foo', resultsCount: 0 } );

				sinon.assert.notCalled( setInfoSpy );
			} );
		} );
	} );

	describe( 'setCategories()', () => {
		beforeEach( () => {
			emojiPickerView.render();
			document.body.appendChild( emojiPickerView.element );
		} );

		afterEach( () => {
			emojiPickerView.element.remove();
		} );

		it( 'should replace gridView.emojiCategories with the provided categories', () => {
			const newCategories = [
				{
					title: 'animals',
					icon: '🐶',
					items: [
						{ 'annotation': 'dog', 'emoji': '🐶', skins: { 'default': '🐶' } }
					]
				}
			];

			emojiPickerView.setCategories( newCategories );

			expect( emojiPickerView.gridView.emojiCategories.length ).to.equal( newCategories.length );
			expect( emojiPickerView.gridView.emojiCategories[ 0 ] ).to.deep.equal( newCategories[ 0 ] );
		} );

		it( 'should update categoryName in categoriesView and gridView to the first new category', () => {
			const newCategories = [
				{
					title: 'animals',
					icon: '🐶',
					items: []
				}
			];

			emojiPickerView.setCategories( newCategories );

			expect( emojiPickerView.categoriesView.categoryName ).to.equal( 'animals' );
			expect( emojiPickerView.gridView.categoryName ).to.equal( 'animals' );
		} );

		it( 'should pass new categories to categoriesView.setCategories()', () => {
			const newCategories = [
				{
					title: 'animals',
					icon: '🐶',
					items: []
				}
			];

			const stub = sinon.stub( emojiPickerView.categoriesView, 'setCategories' );

			emojiPickerView.setCategories( newCategories );

			sinon.assert.calledOnce( stub );
			sinon.assert.calledWithExactly( stub, newCategories );
		} );

		it( 'should trigger a search using the current input value after updating categories', () => {
			const newCategories = [
				{
					title: 'animals',
					icon: '🐶',
					items: []
				}
			];

			const searchStub = sinon.stub( emojiPickerView.searchView, 'search' );
			const getInputValueStub = sinon.stub( emojiPickerView.searchView, 'getInputValue' ).returns( 'dog' );

			emojiPickerView.setCategories( newCategories );

			sinon.assert.calledOnce( getInputValueStub );
			sinon.assert.calledTwice( searchStub );
			sinon.assert.calledWithExactly( searchStub.lastCall, 'dog' );
		} );

		it( 'should trigger a search with empty string when input is empty', () => {
			const newCategories = [
				{
					title: 'animals',
					icon: '🐶',
					items: []
				}
			];

			const searchStub = sinon.stub( emojiPickerView.searchView, 'search' );

			sinon.stub( emojiPickerView.searchView, 'getInputValue' ).returns( '' );

			emojiPickerView.setCategories( newCategories );

			sinon.assert.calledTwice( searchStub );
			sinon.assert.calledWithExactly( searchStub.lastCall, '' );
		} );
	} );

	describe( 'render()', () => {
		describe( 'activates keyboard navigation in the emoji view', () => {
			it( 'should add emojiView to focusTracker', () => {
				const stub = sinon.stub( emojiPickerView.focusTracker, 'add' );

				emojiPickerView.render();

				sinon.assert.callCount( stub, 5 );
				sinon.assert.calledWith( stub, emojiPickerView.searchView.element );
				sinon.assert.calledWith( stub, emojiPickerView.toneView.element );
				sinon.assert.calledWith( stub, emojiPickerView.categoriesView.element );
				sinon.assert.calledWith( stub, emojiPickerView.gridView.element );
				sinon.assert.calledWith( stub, emojiPickerView.infoView.element );
			} );

			it( 'should call keystrokes listenTo on emojiPickerView instance', () => {
				const stub = sinon.stub( emojiPickerView.keystrokes, 'listenTo' );

				emojiPickerView.render();

				sinon.assert.calledOnce( stub );
				sinon.assert.calledWith( stub, emojiPickerView.element );
			} );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy focus tracker', () => {
			const stub = sinon.stub( emojiPickerView.focusTracker, 'destroy' );

			emojiPickerView.destroy();

			sinon.assert.calledOnce( stub );
		} );

		it( 'should destroy keystrokes handler', () => {
			const stub = sinon.stub( emojiPickerView.keystrokes, 'destroy' );

			emojiPickerView.destroy();

			sinon.assert.calledOnce( stub );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the first focusable', () => {
			const spy = sinon.spy( emojiPickerView.searchView, 'focus' );

			emojiPickerView.render();
			emojiPickerView.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );
} );
