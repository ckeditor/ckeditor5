/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import SpecialCahractersView from '../../src/ui/specialcharactersview';
import SpecialCharactersNavigationView from '../../src/ui/specialcharactersnavigationview';
import CharacterGridView from '../../src/ui/charactergridview';
import CharacterInfoView from '../../src/ui/characterinfoview';

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
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( '#items contains character category button and grid view', () => {
			expect( view.items.get( 0 ) ).to.equal( navigationView.groupDropdownView.buttonView );
			expect( view.items.get( 1 ) ).to.equal( gridView );
			expect( view.items.length ).to.equal( 2 );
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
