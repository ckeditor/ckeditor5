/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import SpecialCahractersView from '../../src/ui/specialcharactersview';
import SpecialCharactersNavigationView from '../../src/ui/specialcharactersnavigationview';
import CharacterGridView from '../../src/ui/charactergridview';
import CharacterInfoView from '../../src/ui/characterinfoview';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

describe( 'SpecialCahractersView', () => {
	let view, navigationView, gridView, infoView, locale;

	beforeEach( () => {
		locale = {
			t: val => val
		};

		navigationView = new SpecialCharactersNavigationView( locale, [ 'groupA' ] );
		gridView = new CharacterGridView( locale );
		infoView = new CharacterInfoView( locale );
		view = new SpecialCahractersView( locale, navigationView, gridView, infoView );
		view.render();
		document.body.appendChild( view.element );
	} );

	afterEach( () => {
		view.element.remove();
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( '#items contains character category button and grid view', () => {
			expect( view.items.get( 0 ) ).to.equal( navigationView.groupDropdownView.buttonView );
			expect( view.items.get( 1 ) ).to.equal( gridView );
			expect( view.items.length ).to.equal( 2 );
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
				view.focusTracker.focusedElement = view.navigationView.groupDropdownView.buttonView.element;

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
				const spy = sinon.spy( view.navigationView.groupDropdownView.buttonView, 'focus' );

				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );
				sinon.assert.calledOnce( spy );
			} );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the navigation view', () => {
			const spy = sinon.spy( navigationView, 'focus' );

			view.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );
} );
