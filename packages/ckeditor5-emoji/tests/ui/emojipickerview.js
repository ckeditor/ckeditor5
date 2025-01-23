/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import EmojiCategoriesView from '../../src/ui/emojicategoriesview.js';
import EmojiGridView from '../../src/ui/emojigridview.js';
import EmojiPickerView from '../../src/ui/emojipickerview.js';
import EmojiSearchView from '../../src/ui/emojisearchview.js';
import EmojiToneView from '../../src/ui/emojitoneview.js';
import { SearchInfoView } from 'ckeditor5/src/ui.js';

describe( 'EmojiPickerView', () => {
	let emojiPickerView, locale, emojiGroups, skinTones, emojiBySearchQuery;

	beforeEach( () => {
		locale = {
			t: val => val
		};

		emojiGroups = [
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
			emojiGroups,
			skinTones,
			getEmojiBySearchQuery: emojiBySearchQuery,
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
			expect( emojiPickerView.gridView.emojiGroups ).to.deep.equal( emojiGroups );
			expect( emojiPickerView.gridView.getEmojiBySearchQuery ).to.equal( emojiBySearchQuery );
			expect( emojiPickerView.gridView.skinTone ).to.equal( 'default' );
		} );

		it( 'should create emoji results view with correct arguments', () => {
			expect( some( emojiPickerView.items, view => view instanceof EmojiSearchView ) ).to.equal( true );
			expect( emojiPickerView.searchView.gridView ).to.equal( emojiPickerView.gridView );
			expect( emojiPickerView.searchView.inputView.infoView ).to.equal( emojiPickerView.infoView );
		} );

		it( 'should create emoji results view with correct arguments', () => {
			expect( some( emojiPickerView.items, view => view instanceof EmojiCategoriesView ) ).to.equal( true );
			expect( emojiPickerView.categoriesView.emojiGroups ).to.equal( emojiPickerView.emojiGroups );
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

			it( 'should set info view properties when search query length is equal to one', () => {
				emojiPickerView.searchView.fire( 'search', { query: '1' } );

				expect( emojiPickerView.infoView.primaryText ).to.equal( 'Keep on typing to see the emoji.' );
				expect( emojiPickerView.infoView.secondaryText ).to.equal( 'The query must contain at least two characters.' );
				expect( emojiPickerView.infoView.isVisible ).to.equal( true );
			} );

			it( 'should set info view properties when search query is other than one and there is nothing to show', () => {
				emojiPickerView.searchView.fire( 'search', { query: 'foo', resultsCount: 0 } );

				expect( emojiPickerView.infoView.primaryText ).to.equal( 'No emojis were found matching "%0".' );
				expect( emojiPickerView.infoView.secondaryText ).to.equal( 'Please try a different phrase or check the spelling.' );
				expect( emojiPickerView.infoView.isVisible ).to.equal( true );
			} );

			it( 'should set info view properties when search query is other than one and there are results to show', () => {
				emojiPickerView.searchView.fire( 'search', { query: 'foo', resultsCount: 1 } );

				expect( emojiPickerView.infoView.isVisible ).to.equal( false );
			} );

			it( 'should set info view properties when search query is other than one and there are results to show', () => {
				const stub = sinon.stub( emojiPickerView.searchView, 'search' );

				emojiPickerView.categoriesView.categoryName = 'food';

				expect( emojiPickerView.gridView.categoryName ).to.equal( 'food' );
				sinon.assert.calledOnce( stub );
				sinon.assert.calledWith( stub, '' );
			} );

			it( 'should set info view properties when search query is other than one and there are results to show', () => {
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
			const spy = sinon.spy( emojiPickerView.focusCycler, 'focusFirst' );

			emojiPickerView.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );
} );
