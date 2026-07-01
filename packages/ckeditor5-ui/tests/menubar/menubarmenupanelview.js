/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Locale } from '@ckeditor/ckeditor5-utils';
import { MenuBarMenuPanelView } from '../../src/menubar/menubarmenupanelview.js';
import { ViewCollection } from '../../src/viewcollection.js';
import { View } from '../../src/view.js';
import {
	LabeledFieldView,
	createLabeledInputText
} from '../../src/index.js';

describe( 'MenuBarMenuPanelView', () => {
	let panelView, locale;

	beforeEach( () => {
		locale = new Locale();
		panelView = new MenuBarMenuPanelView( locale );
	} );

	afterEach( () => {
		panelView.destroy();
		vi.restoreAllMocks();
	} );

	describe( 'constructor()', () => {
		it( 'should have #children view collection', () => {
			expect( panelView.children ).toBeInstanceOf( ViewCollection );

			const view = new View();

			view.setTemplate( { tag: 'div' } );
			view.render();

			panelView.render();
			panelView.children.add( view );

			expect( panelView.element.firstChild ).toBe( view.element );
		} );

		it( 'should have #isVisible set to false by default', () => {
			expect( panelView.isVisible ).toBe( false );
		} );

		it( 'should have #position set to "se" by default', () => {
			expect( panelView.position ).toBe( 'se' );
		} );

		describe( 'template and DOM element', () => {
			it( 'should have CSS classes', () => {
				expect( panelView.template.attributes.class ).toEqual(
					expect.arrayContaining( [ 'ck', 'ck-reset', 'ck-menu-bar__menu__panel' ] )
				);
			} );

			it( 'should have #position bound to a CSS class', () => {
				panelView.render();

				panelView.position = 'sw';
				expect( panelView.element.classList.contains( 'ck-menu-bar__menu__panel_position_sw' ) ).toBe( true );

				panelView.position = 'se';
				expect( panelView.element.classList.contains( 'ck-menu-bar__menu__panel_position_se' ) ).toBe( true );
			} );

			it( 'should have #isVisible bound to a CSS class', () => {
				panelView.render();

				panelView.isVisible = false;
				expect( panelView.element.classList.contains( 'ck-hidden' ) ).toBe( true );

				panelView.isVisible = true;
				expect( panelView.element.classList.contains( 'ck-hidden' ) ).toBe( false );
			} );

			it( 'should have tabindex attribute value set', () => {
				expect( panelView.template.attributes.tabindex ).toEqual( [ '-1' ] );
			} );

			it( 'should preventDefault the selectstart event to avoid breaking the selection in the editor', () => {
				panelView.render();

				const selectStartEvent = new Event( 'selectstart', {
					bubbles: true,
					cancelable: true
				} );
				const spy = vi.spyOn( selectStartEvent, 'preventDefault' );
				const labeledInput = new LabeledFieldView( { t: () => {} }, createLabeledInputText );

				panelView.element.dispatchEvent( selectStartEvent );
				expect( spy ).toHaveBeenCalledOnce();

				panelView.children.add( labeledInput );

				labeledInput.fieldView.element.dispatchEvent( selectStartEvent );
				expect( spy ).toHaveBeenCalledOnce();
			} );
		} );

		describe( 'focus', () => {
			it( 'should focus the first child by default', () => {
				const firstChildView = new View();
				const lastChildView = new View();

				panelView.children.addMany( [ firstChildView, lastChildView ] );

				firstChildView.focus = vi.fn();
				lastChildView.focus = vi.fn();

				panelView.focus();

				expect( firstChildView.focus ).toHaveBeenCalledOnce();
				expect( lastChildView.focus ).not.toHaveBeenCalled();
			} );

			it( 'should focus the last child if the argument was passed', () => {
				const firstChildView = new View();
				const lastChildView = new View();

				panelView.children.addMany( [ firstChildView, lastChildView ] );

				firstChildView.focus = vi.fn();
				lastChildView.focus = vi.fn();

				panelView.focus( -1 );

				expect( firstChildView.focus ).not.toHaveBeenCalled();
				expect( lastChildView.focus ).toHaveBeenCalledOnce();
			} );

			it( 'should not throw when children is empty', () => {
				expect( () => panelView.focus() ).not.toThrow();
			} );
		} );
	} );
} );
