/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ListItemView from '../../src/list/listitemview';
import ListItemGroupView from '../../src/list/listitemgroupview';
import ViewCollection from '../../src/viewcollection';

describe( 'ListItemGroupView', () => {
	let view;

	beforeEach( () => {
		view = new ListItemGroupView();
		view.label = 'Foo';

		return view.render();
	} );

	describe( 'constructor()', () => {
		describe( 'template', () => {
			it( 'creates a list element', () => {
				expect( view.element.tagName ).to.equal( 'LI' );
				expect( view.element.role ).to.equal( 'presentation' );
			} );

			it( 'sets CSS classes', () => {
				expect( view.element.classList.contains( 'ck' ) ).to.be.true;
				expect( view.element.classList.contains( 'ck-list__group' ) ).to.be.true;
			} );

			it( 'creates a label element as a first child', () => {
				const labelElement = view.element.firstChild;

				expect( labelElement.textContent ).to.equal( 'Foo' );
			} );

			it( 'should have #children view collection with a label and a nested list', () => {
				expect( view.children ).to.be.instanceOf( ViewCollection );
				expect( view.children.first.element.textContent ).to.equal( 'Foo' );
				expect( view.children.last.items ).to.equal( view.items );
			} );

			describe( 'nested list', () => {
				it( 'is created as a last child', () => {
					const listElement = view.element.lastChild;

					expect( listElement.tagName ).to.equal( 'UL' );
					expect( listElement.role ).to.equal( 'group' );
					expect( listElement.classList.contains( 'ck' ) ).to.be.true;
					expect( listElement.classList.contains( 'ck-list' ) ).to.be.true;
				} );

				it( 'is described using an ARIA attribute for assistive technologies', () => {
					const listElement = view.element.lastChild;

					expect( listElement.attributes[ 'aria-labelledby' ].value ).to.equal( view.element.firstChild.id );
				} );
			} );
		} );

		describe( 'view#items collection', () => {
			it( 'exists', () => {
				expect( view.items ).to.be.instanceOf( ViewCollection );
			} );

			it( 'populates the nested list', () => {
				expect( view.items ).to.be.instanceOf( ViewCollection );
			} );
		} );

		it( 'sets the #isVisible property', () => {
			expect( view.isVisible ).to.be.true;
		} );

		describe( 'DOM element bindings', () => {
			describe( 'isVisible', () => {
				it( 'reacts on view#isVisible', () => {
					view.isVisible = true;
					expect( view.element.classList.contains( 'ck-hidden' ) ).to.be.false;

					view.isVisible = false;
					expect( view.element.classList.contains( 'ck-hidden' ) ).to.be.true;
				} );
			} );

			describe( 'label', () => {
				it( 'reacts on view#label', () => {
					view.label = 'foo';
					expect( view.element.firstChild.textContent ).to.equal( 'foo' );

					view.label = 'bar';
					expect( view.element.firstChild.textContent ).to.equal( 'bar' );
				} );
			} );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the first view in in #items', () => {
			const childListItemView = new ListItemView();
			view.items.add( childListItemView );

			const spy = sinon.spy( childListItemView, 'focus' );

			view.focus();
			sinon.assert.calledOnce( spy );
		} );

		it( 'does not throw if #items are empty', () => {
			expect( () => {
				view.focus();
			} ).to.not.throw();
		} );
	} );
} );
