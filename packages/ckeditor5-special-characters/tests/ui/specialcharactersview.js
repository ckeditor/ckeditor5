/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import SpecialCharactersView from '../../src/ui/specialcharactersview.js';
import CharacterGridView from '../../src/ui/charactergridview.js';
import CharacterInfoView from '../../src/ui/characterinfoview.js';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';
import SpecialCharactersCategoriesView from '../../src/ui/specialcharacterscategoriesview.js';

describe( 'SpecialCharactersView', () => {
	let view, categoriesView, gridView, infoView, locale;

	beforeEach( () => {
		locale = {
			t: val => val
		};

		categoriesView = new SpecialCharactersCategoriesView( locale, new Map( [
			[ 'groupA', 'labelA' ]
		] ) );
		gridView = new CharacterGridView( locale );
		infoView = new CharacterInfoView( locale );
		view = new SpecialCharactersView( locale, categoriesView, gridView, infoView );
		view.render();
		document.body.appendChild( view.element );
	} );

	afterEach( () => {
		view.element.remove();
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( '#items contains categories view and grid view', () => {
			expect( view.items.length ).to.equal( 2 );
			expect( view.items.get( 0 ) ).to.equal( categoriesView );
			expect( view.items.get( 1 ) ).to.equal( gridView );
		} );

		// https://github.com/ckeditor/ckeditor5/pull/12319#issuecomment-1231779819
		it( 'sets tabindex to -1 to avoid focus loss', () => {
			expect( view.element.getAttribute( 'tabindex' ) ).to.equal( '-1' );
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
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.categoriesView.element;

				// Spy the next view which in this case is the grid view
				const stub = sinon.stub( view.gridView, 'focus' );

				view.keystrokes.press( keyEvtData );
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
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.gridView.element;

				// Spy the previous view which in this case is the character category button
				const spy = sinon.spy( view.categoriesView._dropdownView.fieldView.buttonView, 'focus' );

				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );
				sinon.assert.calledOnce( spy );
			} );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the categoriesView view', () => {
			const spy = sinon.spy( categoriesView, 'focus' );

			view.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );
} );
