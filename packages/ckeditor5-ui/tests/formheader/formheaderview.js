/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { IconCheck } from '@ckeditor/ckeditor5-icons';
import { View } from '../../src/view.js';
import { ViewCollection } from '../../src/viewcollection.js';
import { FormHeaderView } from '../../src/formheader/formheaderview.js';
import { IconView } from '../../src/index.js';

describe( 'FormHeaderView', () => {
	let view, locale;

	beforeEach( () => {
		locale = { t: val => val };
		view = new FormHeaderView( locale );
		view.render();
	} );

	afterEach( () => {
		view.element.remove();
	} );

	describe( 'constructor()', () => {
		it( 'should set view#locale', () => {
			expect( view.locale ).toBe( locale );
		} );

		it( 'should create view#children collection', () => {
			expect( view.children ).toBeInstanceOf( ViewCollection );
			expect( view.children ).toHaveLength( 1 );
		} );

		it( 'should set view#label', () => {
			expect( view.label ).toBe( '' );
		} );

		it( 'should set view#class', () => {
			expect( view.class ).toBeNull();
		} );

		it( 'should set the template', () => {
			expect( view.template.attributes.class ).toContain( 'ck' );
			expect( view.template.attributes.class ).toContain( 'ck-form__header' );
		} );

		it( 'should set view#tag', () => {
			expect( view.children.first.template.tag ).toBe( 'h2' );
		} );

		describe( 'options', () => {
			it( 'should set view#class when class was passed', () => {
				const view = new FormHeaderView( locale, {
					class: 'foo'
				} );
				expect( view.class ).toBe( 'foo' );

				view.destroy();
			} );

			it( 'should use a label text when passed', () => {
				const view = new FormHeaderView( locale, {
					label: 'foo'
				} );

				view.render();

				expect( view.element.firstChild.classList.contains( 'ck' ) ).toBe( true );
				expect( view.element.firstChild.classList.contains( 'ck-form__header__label' ) ).toBe( true );
				expect( view.element.firstChild.role ).toBe( 'presentation' );
				expect( view.element.firstChild.textContent ).toBe( 'foo' );

				view.destroy();
			} );

			it( 'should allow passing an icon', () => {
				const view = new FormHeaderView( locale, {
					label: 'foo',
					icon: IconCheck
				} );

				view.render();

				expect( view.element.lastChild.classList.contains( 'ck' ) ).toBe( true );
				expect( view.element.lastChild.classList.contains( 'ck-form__header__label' ) ).toBe( true );
				expect( view.element.lastChild.textContent ).toBe( 'foo' );

				expect( view.element.firstChild.classList.contains( 'ck' ) ).toBe( true );
				expect( view.element.firstChild.classList.contains( 'ck-icon' ) ).toBe( true );

				expect( view.iconView ).toBeInstanceOf( IconView );
				expect( view.iconView.content ).toBe( IconCheck );
				expect( view.iconView.element ).toBe( view.element.firstChild );

				view.destroy();
			} );
		} );

		describe( 'template bindings', () => {
			it( 'should bind #class to the template', () => {
				view.class = 'foo';
				expect( view.element.classList.contains( 'foo' ) ).toBe( true );
			} );

			it( 'should bind #label to the template', () => {
				view.label = 'bar';
				expect( view.element.firstChild.textContent ).toBe( 'bar' );

				view.label = 'baz';
				expect( view.element.firstChild.textContent ).toBe( 'baz' );
			} );

			it( 'should bind #children to the template', () => {
				const child = new View();
				child.setTemplate( { tag: 'div' } );

				view.children.add( child );

				expect( view.element.childNodes[ 1 ] ).toBe( child.element );

				view.destroy();
			} );
		} );
	} );
} );
