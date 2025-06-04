/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Locale } from '@ckeditor/ckeditor5-utils';
import SearchResultsView from '../../src/search/searchresultsview.js';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { ButtonView, View, ViewCollection } from '../../src/index.js';

describe( 'SearchResultsView', () => {
	let locale, view;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		locale = new Locale();

		view = new SearchResultsView( locale );
		view.children.addMany( [ createNonFocusableView(), createFocusableView(), createFocusableView() ] );
		view.render();

		document.body.appendChild( view.element );
	} );

	afterEach( () => {
		view.destroy();
		view.element.remove();
	} );

	describe( 'constructor()', () => {
		it( 'creates and element from template with CSS classes', () => {
			expect( view.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-search__results' ) ).to.be.true;
			expect( view.element.getAttribute( 'tabIndex' ) ).to.equal( '-1' );
		} );

		it( 'has a collection of #children', () => {
			expect( view.children ).to.be.instanceOf( ViewCollection );

			view.children.add( new ButtonView() );

			expect( view.element.firstChild ).to.equal( view.children.first.element );
		} );
	} );

	describe( 'focus()', () => {
		it( 'does nothing for empty panel', () => {
			expect( () => view.focus() ).to.not.throw();
		} );

		it( 'focuses first focusable view in #children', () => {
			view.focus();

			sinon.assert.calledOnce( view.children.get( 1 ).focus );
		} );
	} );

	describe( 'focusFirst()', () => {
		it( 'focuses first focusable view in #children', () => {
			view.focusFirst();

			sinon.assert.calledOnce( view.children.get( 1 ).focus );
		} );
	} );

	describe( 'focusLast()', () => {
		it( 'focuses first focusable view in #children', () => {
			view.focusLast();

			sinon.assert.calledOnce( view.children.get( 2 ).focus );
		} );
	} );

	function createFocusableView( name ) {
		const view = createNonFocusableView();

		view.name = name;
		view.focus = () => view.element.focus();
		sinon.spy( view, 'focus' );

		return view;
	}

	function createNonFocusableView() {
		const view = new View();

		view.element = document.createElement( 'div' );
		view.element.textContent = 'foo';
		document.body.appendChild( view.element );

		return view;
	}
} );
