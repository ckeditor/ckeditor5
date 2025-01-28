/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ListItemView from '../../src/list/listitemview.js';
import ListItemGroupView from '../../src/list/listitemgroupview.js';
import ViewCollection from '../../src/viewcollection.js';
import { LabelView, View } from '../../src/index.js';
import { Locale } from '@ckeditor/ckeditor5-utils';
import ListSeparatorView from '../../src/list/listseparatorview.js';

describe( 'ListItemGroupView', () => {
	let view, locale;

	beforeEach( () => {
		view = new ListItemGroupView();
		view.label = 'Foo';
		locale = new Locale();

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

			it( 'creates a #labelView element as a first child', () => {
				expect( view.children.first ).to.equal( view.labelView );
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

			describe( '#labelView', () => {
				it( 'uses LabelView by default', () => {
					expect( view.labelView ).to.be.instanceOf( LabelView );

					view.set( {
						label: 'bar'
					} );

					expect( view.labelView.id ).to.equal( view.children.last.element.getAttribute( 'aria-labelledby' ) );
					expect( view.labelView.element.textContent ).to.equal( 'bar' );
				} );

				it( 'accepts a custom label instance that implements the same label interface', () => {
					class CustomLabel extends View {
						constructor() {
							super();

							const bind = this.bindTemplate;

							this.set( {
								text: undefined,
								id: '1234'
							} );

							this.setTemplate( {
								tag: 'span',
								attributes: {
									id: bind.to( 'id' )
								},
								children: [
									{ text: bind.to( 'text' ) }
								]
							} );
						}
					}

					const view = new ListItemGroupView( locale, new CustomLabel() );

					view.set( {
						label: 'bar'
					} );

					view.render();

					expect( view.labelView ).to.be.instanceOf( CustomLabel );
					expect( view.labelView.element.id ).to.equal( view.children.last.element.getAttribute( 'aria-labelledby' ) );
					expect( view.children.last.element.getAttribute( 'aria-labelledby' ) ).to.equal( '1234' );
					expect( view.labelView.element.textContent ).to.equal( 'bar' );

					view.destroy();
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

		it( 'focuses the first view in #items which is not a separator', () => {
			const childListSeparatorView = new ListSeparatorView();
			view.items.add( childListSeparatorView );

			const childListItemView = new ListItemView();
			view.items.add( childListItemView );

			const spyItem = sinon.spy( childListItemView, 'focus' );

			view.focus();
			sinon.assert.calledOnce( spyItem );
		} );

		it( 'does not throw if #items include only a separator', () => {
			expect( () => {
				const childListSeparatorView = new ListSeparatorView();
				view.items.add( childListSeparatorView );

				view.focus();
			} ).to.not.throw();
		} );

		it( 'does not throw if #items are empty', () => {
			expect( () => {
				view.focus();
			} ).to.not.throw();
		} );
	} );
} );
