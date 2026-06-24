/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ViewCollection } from '../../src/viewcollection.js';
import { DropdownPanelView } from '../../src/dropdown/dropdownpanelview.js';
import { View } from '../../src/view.js';
import { LabeledFieldView, createLabeledInputText } from '@ckeditor/ckeditor5-ui';

describe( 'DropdownPanelView', () => {
	let view, locale;

	beforeEach( () => {
		locale = { t() {} };

		view = new DropdownPanelView( locale );
		view.render();
	} );

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	describe( 'constructor()', () => {
		it( 'sets view#locale', () => {
			expect( view.locale ).toBe( locale );
		} );

		it( 'sets view#isVisible false', () => {
			expect( view.isVisible ).toBe( false );
		} );

		it( 'creates view#children collection', () => {
			expect( view.children ).toBeInstanceOf( ViewCollection );
		} );

		it( 'creates element from template', () => {
			expect( view.element.classList.contains( 'ck' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-reset' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-dropdown__panel' ) ).toBe( true );
			expect( view.element.getAttribute( 'tabindex' ) ).toBe( '-1' );
		} );

		describe( 'template bindings', () => {
			describe( 'class', () => {
				it( 'reacts on view#isVisible', () => {
					expect( view.element.classList.contains( 'ck-dropdown__panel-visible' ) ).toBe( false );

					view.isVisible = true;
					expect( view.element.classList.contains( 'ck-dropdown__panel-visible' ) ).toBe( true );

					view.isVisible = false;
					expect( view.element.classList.contains( 'ck-dropdown__panel-visible' ) ).toBe( false );
				} );

				it( 'reacts on view#position', () => {
					expect( view.element.classList.contains( 'ck-dropdown__panel_se' ) ).toBe( true );

					view.position = 'nw';
					expect( view.element.classList.contains( 'ck-dropdown__panel_se' ) ).toBe( false );
					expect( view.element.classList.contains( 'ck-dropdown__panel_nw' ) ).toBe( true );
				} );
			} );

			describe( 'listeners', () => {
				describe( 'selectstart', () => {
					// https://github.com/ckeditor/ckeditor5-ui/issues/228
					it( 'gets preventDefault called', () => {
						const event = new Event( 'selectstart' );
						const spy = vi.spyOn( event, 'preventDefault' );

						view.element.dispatchEvent( event );
						expect( spy ).toHaveBeenCalledOnce();
					} );

					it( 'does not get preventDefault called for the input field', () => {
						const labeledInput = new LabeledFieldView( { t: () => {} }, createLabeledInputText );

						view.children.add( labeledInput );

						const event = new Event( 'selectstart', {
							bubbles: true,
							cancelable: true
						} );
						const spy = vi.spyOn( event, 'preventDefault' );

						labeledInput.fieldView.element.dispatchEvent( event );
						expect( spy ).not.toHaveBeenCalled();
					} );

					it( 'handles non-element targets', () => {
						const textNode = document.createTextNode( 'Selectable text' );

						view.element.appendChild( textNode );

						const event = new Event( 'selectstart', {
							bubbles: true,
							cancelable: true
						} );
						const spy = vi.spyOn( event, 'preventDefault' );

						textNode.dispatchEvent( event );
						expect( spy ).toHaveBeenCalledOnce();
					} );
				} );
			} );
		} );
	} );

	describe( 'focus()', () => {
		it( 'does nothing for empty panel', () => {
			expect( () => view.focus() ).not.toThrow();
		} );

		it( 'focuses first child view', () => {
			const firstChildView = new View();

			firstChildView.focus = vi.fn();

			view.children.add( firstChildView );
			view.children.add( new View() );

			view.focus();

			expect( firstChildView.focus ).toHaveBeenCalledOnce();
		} );

		describe( 'should warn', () => {
			beforeEach( () => {
				vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
			} );

			it( 'if the view does not implement the focus() method', () => {
				const firstChildView = new View();

				firstChildView.focus = undefined;

				view.children.add( firstChildView );

				view.focus();

				expect( console.warn ).toHaveBeenCalledOnce();
				expect( console.warn ).toHaveBeenCalledWith(
					'ui-dropdown-panel-focus-child-missing-focus',
					{ childView: firstChildView, dropdownPanel: view },
					expect.any( String )
				);
			} );
		} );
	} );

	describe( 'focusLast()', () => {
		it( 'does nothing for empty panel', () => {
			expect( () => view.focusLast() ).not.toThrow();
		} );

		it( 'focuses last child view', () => {
			const lastChildView = new View();

			lastChildView.focusLast = vi.fn();

			view.children.add( new View() );
			view.children.add( lastChildView );

			view.focusLast();

			expect( lastChildView.focusLast ).toHaveBeenCalledOnce();
		} );

		it( 'focuses last child view even if it does not have focusLast() method', () => {
			const lastChildView = new View();

			lastChildView.focus = vi.fn();

			view.children.add( new View() );
			view.children.add( lastChildView );

			view.focusLast();

			expect( lastChildView.focus ).toHaveBeenCalledOnce();
		} );
	} );
} );
