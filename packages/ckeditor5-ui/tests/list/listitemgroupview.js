/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListItemView } from '../../src/list/listitemview.js';
import { ListItemGroupView } from '../../src/list/listitemgroupview.js';
import { ViewCollection } from '../../src/viewcollection.js';
import { LabelView, View } from '../../src/index.js';
import { Locale } from '@ckeditor/ckeditor5-utils';
import { ListSeparatorView } from '../../src/list/listseparatorview.js';

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
				expect( view.element.tagName ).toBe( 'LI' );
				expect( view.element.role ).toBe( 'presentation' );
			} );

			it( 'sets CSS classes', () => {
				expect( view.element.classList.contains( 'ck' ) ).toBe( true );
				expect( view.element.classList.contains( 'ck-list__group' ) ).toBe( true );
			} );

			it( 'creates a #labelView element as a first child', () => {
				expect( view.children.first ).toBe( view.labelView );
			} );

			it( 'should have #children view collection with a label and a nested list', () => {
				expect( view.children ).toBeInstanceOf( ViewCollection );
				expect( view.children.first.element.textContent ).toBe( 'Foo' );
				expect( view.children.last.items ).toBe( view.items );
			} );

			describe( 'nested list', () => {
				it( 'is created as a last child', () => {
					const listElement = view.element.lastChild;

					expect( listElement.tagName ).toBe( 'UL' );
					expect( listElement.role ).toBe( 'group' );
					expect( listElement.classList.contains( 'ck' ) ).toBe( true );
					expect( listElement.classList.contains( 'ck-list' ) ).toBe( true );
				} );

				it( 'is described using an ARIA attribute for assistive technologies', () => {
					const listElement = view.element.lastChild;

					expect( listElement.attributes[ 'aria-labelledby' ].value ).toBe( view.element.firstChild.id );
				} );
			} );

			describe( '#labelView', () => {
				it( 'uses LabelView by default', () => {
					expect( view.labelView ).toBeInstanceOf( LabelView );

					view.set( {
						label: 'bar'
					} );

					expect( view.labelView.id ).toBe( view.children.last.element.getAttribute( 'aria-labelledby' ) );
					expect( view.labelView.element.textContent ).toBe( 'bar' );
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

					expect( view.labelView ).toBeInstanceOf( CustomLabel );
					expect( view.labelView.element.id ).toBe( view.children.last.element.getAttribute( 'aria-labelledby' ) );
					expect( view.children.last.element.getAttribute( 'aria-labelledby' ) ).toBe( '1234' );
					expect( view.labelView.element.textContent ).toBe( 'bar' );

					view.destroy();
				} );
			} );
		} );

		describe( 'view#items collection', () => {
			it( 'exists', () => {
				expect( view.items ).toBeInstanceOf( ViewCollection );
			} );

			it( 'populates the nested list', () => {
				expect( view.items ).toBeInstanceOf( ViewCollection );
			} );
		} );

		it( 'sets the #isVisible property', () => {
			expect( view.isVisible ).toBe( true );
		} );

		describe( 'DOM element bindings', () => {
			describe( 'isVisible', () => {
				it( 'reacts on view#isVisible', () => {
					view.isVisible = true;
					expect( view.element.classList.contains( 'ck-hidden' ) ).toBe( false );

					view.isVisible = false;
					expect( view.element.classList.contains( 'ck-hidden' ) ).toBe( true );
				} );
			} );

			describe( 'label', () => {
				it( 'reacts on view#label', () => {
					view.label = 'foo';
					expect( view.element.firstChild.textContent ).toBe( 'foo' );

					view.label = 'bar';
					expect( view.element.firstChild.textContent ).toBe( 'bar' );
				} );
			} );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the first view in in #items', () => {
			const childListItemView = new ListItemView();
			view.items.add( childListItemView );

			const spy = vi.spyOn( childListItemView, 'focus' );

			view.focus();
			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'focuses the first view in #items which is not a separator', () => {
			const childListSeparatorView = new ListSeparatorView();
			view.items.add( childListSeparatorView );

			const childListItemView = new ListItemView();
			view.items.add( childListItemView );

			const spyItem = vi.spyOn( childListItemView, 'focus' );

			view.focus();
			expect( spyItem ).toHaveBeenCalledOnce();
		} );

		it( 'does not throw if #items include only a separator', () => {
			expect( () => {
				const childListSeparatorView = new ListSeparatorView();
				view.items.add( childListSeparatorView );

				view.focus();
			} ).not.toThrow();
		} );

		it( 'does not throw if #items are empty', () => {
			expect( () => {
				view.focus();
			} ).not.toThrow();
		} );
	} );
} );
