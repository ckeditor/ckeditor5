/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { IconDropdownArrow } from '@ckeditor/ckeditor5-icons';
import { CollapsibleView } from '../../src/collapsible/collapsibleview.js';
import { ButtonView } from '../../src/button/buttonview.js';

import { ViewCollection } from '../../src/viewcollection.js';

describe( 'CollapsibleView', () => {
	let view, locale;

	beforeEach( () => {
		locale = { t: text => text };
		view = new CollapsibleView( locale );

		view.render();
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should accept initial list of children', () => {
			view.destroy();

			const buttonA = new ButtonView( locale );
			const buttonB = new ButtonView( locale );

			buttonA.class = 'foo';
			buttonB.class = 'bar';

			view = new CollapsibleView( locale, [ buttonA, buttonB ] );
			view.render();

			expect( view.element.lastChild.firstChild.classList.contains( 'foo' ) ).toBe( true );
			expect( view.element.lastChild.lastChild.classList.contains( 'bar' ) ).toBe( true );
		} );

		describe( 'template', () => {
			it( 'should create an #element from the template', () => {
				expect( view.element.tagName ).toBe( 'DIV' );
				expect( view.element.classList.contains( 'ck-collapsible' ) ).toBe( true );

				expect( view.element.firstChild.classList.contains( 'ck-button' ) ).toBe( true );
				expect( view.element.lastChild.classList.contains( 'ck' ) ).toBe( true );
				expect( view.element.lastChild.classList.contains( 'ck-collapsible__children' ) ).toBe( true );
				expect( view.element.lastChild.getAttribute( 'role' ) ).toBe( 'region' );
			} );

			describe( 'main button', () => {
				it( 'should have an icon', () => {
					expect( view.buttonView.icon ).toBe( IconDropdownArrow );
				} );

				it( 'should display its text', () => {
					expect( view.buttonView.withText ).toBe( true );
				} );
			} );

			it( 'should set the proper ARIA label on the collapsible container', () => {
				const buttonLabelId = view.buttonView.labelView.element.id;

				expect( view.element.lastChild.getAttribute( 'aria-labelledby' ) ).toMatch( /^ck-editor__aria/ );
				expect( view.element.lastChild.getAttribute( 'aria-labelledby' ) ).toBe( buttonLabelId );
			} );
		} );

		it( 'should have a #children collection', () => {
			expect( view.children ).toBeInstanceOf( ViewCollection );
		} );

		it( 'should have #isCollapsed', () => {
			expect( view.isCollapsed ).toBe( false );
		} );

		it( 'should have #label with default value', () => {
			expect( view.label ).toBe( '' );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the button', () => {
			const spy = vi.spyOn( view.buttonView, 'focus' );

			view.focus();

			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'DOM bindings', () => {
		describe( 'button label', () => {
			it( 'should react on view#label', () => {
				expect( view.buttonView.element.innerText ).toBe( '' );

				view.label = 'Foo';

				expect( view.buttonView.element.innerText ).toBe( 'Foo' );
			} );
		} );

		describe( 'button aria-expanded', () => {
			it( 'should react on button#isOn', () => {
				expect( view.buttonView.isOn ).toBe( true );
				expect( view.buttonView.element.getAttribute( 'aria-expanded' ) ).toBe( 'true' );

				view.buttonView.isOn = false;
				expect( view.buttonView.element.getAttribute( 'aria-expanded' ) ).toBe( 'false' );
			} );

			it( 'should react on view#isCollapsed', () => {
				expect( view.buttonView.element.getAttribute( 'aria-expanded' ) ).toBe( 'true' );

				view.isCollapsed = true;
				expect( view.buttonView.element.getAttribute( 'aria-expanded' ) ).toBe( 'false' );
			} );
		} );

		describe( 'collapsed state', () => {
			it( 'should react on view#isCollapsed', () => {
				expect( view.element.classList.contains( 'ck-collapsible_collapsed' ) ).toBe( false );
				expect( view.element.lastChild.getAttribute( 'hidden' ) ).toBeNull();

				view.isCollapsed = true;

				expect( view.element.classList.contains( 'ck-collapsible_collapsed' ) ).toBe( true );
				expect( view.element.lastChild.getAttribute( 'hidden' ) ).toBe( 'hidden' );
			} );

			it( 'should react on view.buttonView#execute', () => {
				expect( view.element.classList.contains( 'ck-collapsible_collapsed' ) ).toBe( false );

				view.buttonView.fire( 'execute' );

				expect( view.element.classList.contains( 'ck-collapsible_collapsed' ) ).toBe( true );
			} );
		} );

		describe( 'collapsible children', () => {
			it( 'should react to changes in #children', () => {
				const buttonA = new ButtonView( locale );
				const buttonB = new ButtonView( locale );

				expect( view.element.lastChild.children.length ).toBe( 0 );

				view.children.add( buttonA );
				expect( view.element.lastChild.children.length ).toBe( 1 );

				view.children.add( buttonB );
				expect( view.element.lastChild.children.length ).toBe( 2 );
			} );
		} );
	} );
} );
