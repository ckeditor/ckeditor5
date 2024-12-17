/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { keyCodes } from '@ckeditor/ckeditor5-utils';
import EmojiCategoriesView from '../../src/ui/emojicategoriesview.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'EmojiCategoriesView', () => {
	let locale, emojiCategoriesView, emojiGroups;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		locale = {
			t: val => val
		};

		emojiGroups = [ {
			title: 'faces',
			exampleEmoji: '😊'
		}, {
			title: 'food',
			exampleEmoji: '🍕'
		}, {
			title: 'things',
			exampleEmoji: '📕'
		} ];

		emojiCategoriesView = new EmojiCategoriesView( locale, emojiGroups );
		emojiCategoriesView.render();
	} );

	afterEach( () => {
		emojiCategoriesView.destroy();
	} );

	it( 'updates currentCategoryName when clicking the buttons', () => {
		expect( emojiCategoriesView.currentCategoryName ).to.equal( 'faces' );

		emojiCategoriesView._buttonViews._items[ 1 ].element.click();

		expect( emojiCategoriesView.currentCategoryName ).to.equal( 'food' );
	} );

	it( 'updates currentCategoryName when clicking the span element inside the buttons', () => {
		expect( emojiCategoriesView.currentCategoryName ).to.equal( 'faces' );

		emojiCategoriesView._buttonViews._items[ 1 ].element.childNodes[ 0 ].click();

		expect( emojiCategoriesView.currentCategoryName ).to.equal( 'food' );
	} );

	it( 'properly cycles categories with keypresses to the right side', () => {
		emojiCategoriesView._focusTracker.focusedElement = { nextElementSibling: { focus: sinon.stub() } };

		emojiCategoriesView._keystrokeHandler.press( {
			keyCode: keyCodes.arrowright,
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy()
		} );

		sinon.assert.calledOnce( emojiCategoriesView._focusTracker.focusedElement.nextElementSibling.focus );
	} );

	it( 'properly loops back to the first category with keypress to the right side', () => {
		const spy = sinon.spy( emojiCategoriesView._buttonViews.first, 'focus' );

		emojiCategoriesView._keystrokeHandler.press( {
			keyCode: keyCodes.arrowright,
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy()
		} );

		sinon.assert.calledOnce( spy );
	} );

	it( 'properly cycles categories with keypresses to the left side', () => {
		emojiCategoriesView._focusTracker.focusedElement = { previousElementSibling: { focus: sinon.stub() } };

		emojiCategoriesView._keystrokeHandler.press( {
			keyCode: keyCodes.arrowleft,
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy()
		} );

		sinon.assert.calledOnce( emojiCategoriesView._focusTracker.focusedElement.previousElementSibling.focus );
	} );

	it( 'properly loops back to the last category with keypress to the left side', () => {
		const spy = sinon.spy( emojiCategoriesView._buttonViews.last, 'focus' );

		emojiCategoriesView._keystrokeHandler.press( {
			keyCode: keyCodes.arrowleft,
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy()
		} );

		sinon.assert.calledOnce( spy );
	} );

	describe( 'constructor()', () => {
		it( 'creates #element from template', () => {
			expect( emojiCategoriesView.element.classList.contains( 'ck' ) ).to.be.true;
			expect( emojiCategoriesView.element.classList.contains( 'ck-emoji-categories' ) ).to.be.true;

			expect( Object.values( emojiCategoriesView.element.childNodes ).length ).to.equal( emojiGroups.length );
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
			emojiCategoriesView.disableCategories();

			emojiCategoriesView._buttonViews.forEach( buttonView => {
				expect( buttonView.isEnabled ).to.equal( false );
			} );

			emojiCategoriesView.enableCategories();

			emojiCategoriesView._buttonViews.forEach( buttonView => {
				expect( buttonView.isEnabled ).to.equal( true );
			} );
		} );
	} );

	describe( 'disableCategories()', () => {
		it( 'disables all buttons', () => {
			emojiCategoriesView._buttonViews.forEach( buttonView => {
				expect( buttonView.isEnabled ).to.equal( true );
			} );

			emojiCategoriesView.disableCategories();

			emojiCategoriesView._buttonViews.forEach( buttonView => {
				expect( buttonView.isEnabled ).to.equal( false );
			} );
		} );
	} );
} );
