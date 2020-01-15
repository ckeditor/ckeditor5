
/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global Event */

import ViewCollection from '../../src/viewcollection';
import DropdownPanelView from '../../src/dropdown/dropdownpanelview';
import View from '../../src/view';

describe( 'DropdownPanelView', () => {
	let view, locale;

	beforeEach( () => {
		locale = { t() {} };

		view = new DropdownPanelView( locale );
		view.render();
	} );

	describe( 'constructor()', () => {
		it( 'sets view#locale', () => {
			expect( view.locale ).to.equal( locale );
		} );

		it( 'sets view#isVisible false', () => {
			expect( view.isVisible ).to.be.false;
		} );

		it( 'creates view#children collection', () => {
			expect( view.children ).to.be.instanceOf( ViewCollection );
		} );

		it( 'creates element from template', () => {
			expect( view.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-reset' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-dropdown__panel' ) ).to.be.true;
		} );

		describe( 'template bindings', () => {
			describe( 'class', () => {
				it( 'reacts on view#isVisible', () => {
					expect( view.element.classList.contains( 'ck-dropdown__panel-visible' ) ).to.be.false;

					view.isVisible = true;
					expect( view.element.classList.contains( 'ck-dropdown__panel-visible' ) ).to.be.true;

					view.isVisible = false;
					expect( view.element.classList.contains( 'ck-dropdown__panel-visible' ) ).to.be.false;
				} );

				it( 'reacts on view#position', () => {
					expect( view.element.classList.contains( 'ck-dropdown__panel_se' ) ).to.be.true;

					view.position = 'nw';
					expect( view.element.classList.contains( 'ck-dropdown__panel_se' ) ).to.be.false;
					expect( view.element.classList.contains( 'ck-dropdown__panel_nw' ) ).to.be.true;
				} );
			} );

			describe( 'listeners', () => {
				describe( 'selectstart', () => {
					// https://github.com/ckeditor/ckeditor5-ui/issues/228
					it( 'gets preventDefault called', () => {
						const event = new Event( 'selectstart' );
						const spy = sinon.spy( event, 'preventDefault' );

						view.element.dispatchEvent( event );
						sinon.assert.calledOnce( spy );
					} );
				} );
			} );
		} );
	} );

	describe( 'focus()', () => {
		it( 'does nothing for empty panel', () => {
			expect( () => view.focus() ).to.not.throw();
		} );

		it( 'focuses first child view', () => {
			const firstChildView = new View();

			firstChildView.focus = sinon.spy();

			view.children.add( firstChildView );
			view.children.add( new View() );

			view.focus();

			sinon.assert.calledOnce( firstChildView.focus );
		} );
	} );

	describe( 'focusLast()', () => {
		it( 'does nothing for empty panel', () => {
			expect( () => view.focusLast() ).to.not.throw();
		} );

		it( 'focuses last child view', () => {
			const lastChildView = new View();

			lastChildView.focusLast = sinon.spy();

			view.children.add( new View() );
			view.children.add( lastChildView );

			view.focusLast();

			sinon.assert.calledOnce( lastChildView.focusLast );
		} );

		it( 'focuses last child view even if it does not have focusLast() method', () => {
			const lastChildView = new View();

			lastChildView.focus = sinon.spy();

			view.children.add( new View() );
			view.children.add( lastChildView );

			view.focusLast();

			sinon.assert.calledOnce( lastChildView.focus );
		} );
	} );
} );
