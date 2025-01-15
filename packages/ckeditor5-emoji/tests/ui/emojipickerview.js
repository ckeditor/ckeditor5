/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals document */

import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';
import EmojiCategoriesView from '../../src/ui/emojicategoriesview.js';
import EmojiGridView from '../../src/ui/emojigridview.js';
import EmojiPickerView from '../../src/ui/emojipickerview.js';
import EmojiSearchView from '../../src/ui/emojisearchview.js';
import EmojiToneView from '../../src/ui/emojitoneview.js';

describe( 'EmojiPickerView', () => {
	let emojiPickerView, searchView, toneView, categoriesView, gridView, infoView, locale;

	beforeEach( () => {
		locale = {
			t: val => val
		};

		searchView = new EmojiSearchView( locale );
		toneView = new EmojiToneView( locale, 'default' );
		categoriesView = new EmojiCategoriesView( locale, [ {} ] );
		gridView = new EmojiGridView( locale );

		emojiPickerView = new EmojiPickerView( locale, { searchView, toneView, categoriesView, gridView, infoView } );
		emojiPickerView.render();
		document.body.appendChild( emojiPickerView.element );
	} );

	afterEach( () => {
		emojiPickerView.element.remove();
		emojiPickerView.destroy();
	} );

	describe( 'constructor()', () => {
		it( '#items contains categories view and grid view', () => {
			expect( emojiPickerView.items.length ).to.equal( 4 );
			expect( emojiPickerView.items.get( 0 ) ).to.equal( searchView );
			expect( emojiPickerView.items.get( 1 ) ).to.equal( toneView );
			expect( emojiPickerView.items.get( 2 ) ).to.equal( categoriesView );
			expect( emojiPickerView.items.get( 3 ) ).to.equal( gridView );
		} );

		// https://github.com/ckeditor/ckeditor5/pull/12319#issuecomment-1231779819
		it( 'sets tabindex to -1 to avoid focus loss', () => {
			expect( emojiPickerView.element.getAttribute( 'tabindex' ) ).to.equal( '-1' );
		} );
	} );

	describe( 'render()', () => {
		describe( 'activates keyboard navigation in the special characters view', () => {
			it( 'so "tab" focuses the next focusable item', () => {
				const keyEvtData = {
					keyCode: keyCodes.tab,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				// Mock the character category button is focused.
				emojiPickerView.focusTracker.isFocused = true;
				emojiPickerView.focusTracker.focusedElement = emojiPickerView.categoriesView.element;

				// Spy the next view which in this case is the grid view
				const stub = sinon.stub( emojiPickerView.gridView, 'focus' );

				emojiPickerView.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );
				sinon.assert.calledOnce( stub );
			} );

			it( 'so "shift + tab" focuses the previous focusable item', () => {
				const keyEvtData = {
					keyCode: keyCodes.tab,
					shiftKey: true,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				// Mock the grid view is focused.
				emojiPickerView.focusTracker.isFocused = true;
				emojiPickerView.focusTracker.focusedElement = emojiPickerView.gridView.element;

				// Spy the previous view which in this case is the emoji category button
				const spy = sinon.spy( emojiPickerView.categoriesView._buttonViews._items[ 0 ], 'focus' );

				emojiPickerView.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );
				sinon.assert.calledOnce( spy );
			} );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the emojiSearchView view', () => {
			const spy = sinon.spy( searchView, 'focus' );

			emojiPickerView.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );
} );
