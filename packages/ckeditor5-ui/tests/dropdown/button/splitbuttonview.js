/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { keyCodes } from '@ckeditor/ckeditor5-utils';
import { ButtonView } from '../../../src/button/buttonview.js';
import { SplitButtonView } from '../../../src/dropdown/button/splitbuttonview.js';

describe( 'SplitButtonView', () => {
	let locale, view;

	beforeEach( () => {
		locale = { t() {} };

		view = new SplitButtonView( locale );
		view.render();
	} );

	describe( 'constructor()', () => {
		it( 'sets view#locale', () => {
			expect( view.locale ).toBe( locale );
		} );

		it( 'creates view#actionView', () => {
			expect( view.actionView ).toBeInstanceOf( ButtonView );
			expect( view.actionView.element.classList.contains( 'ck-splitbutton__action' ) ).toBe( true );
		} );

		it( 'adds isToggleable to view#actionView', () => {
			expect( view.actionView.isToggleable ).toBe( false );

			view.isToggleable = true;

			expect( view.actionView.isToggleable ).toBe( true );
		} );

		it( 'creates view#arrowView', () => {
			expect( view.arrowView ).toBeInstanceOf( ButtonView );
			expect( view.arrowView.element.classList.contains( 'ck-splitbutton__arrow' ) ).toBe( true );
			expect( view.arrowView.element.attributes[ 'aria-haspopup' ].value ).toBe( 'true' );
			expect( view.arrowView.icon ).not.toBeUndefined();
			expect( view.arrowView.tooltip ).toBe( view.tooltip );
			expect( view.arrowView.label ).toBe( view.label );
		} );

		it( 'creates element from template', () => {
			expect( view.element.tagName ).toBe( 'DIV' );
			expect( view.element.classList.contains( 'ck' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-splitbutton' ) ).toBe( true );
		} );

		it( 'binds #isVisible to the template', () => {
			expect( view.element.classList.contains( 'ck-hidden' ) ).toBe( false );

			view.isVisible = false;

			expect( view.element.classList.contains( 'ck-hidden' ) ).toBe( true );

			// There should be no binding to the action view. Only the entire split button should react.
			expect( view.actionView.element.classList.contains( 'ck-hidden' ) ).toBe( false );
		} );

		it( 'binds arrowView#isOn to the template', () => {
			view.arrowView.isOn = true;
			expect( view.element.classList.contains( 'ck-splitbutton_open' ) ).toBe( true );

			view.arrowView.isOn = false;
			expect( view.element.classList.contains( 'ck-splitbutton_open' ) ).toBe( false );
		} );

		it( 'binds arrowView aria-expanded attribute to #isOn', () => {
			view.arrowView.isOn = true;
			expect( view.arrowView.element.getAttribute( 'aria-expanded' ) ).toBe( 'true' );

			view.arrowView.isOn = false;
			expect( view.arrowView.element.getAttribute( 'aria-expanded' ) ).toBe( 'false' );
		} );

		it( 'binds arrowView#tooltip to view', () => {
			expect( view.arrowView.tooltip ).toBe( false );

			view.tooltip = true;

			expect( view.arrowView.tooltip ).toBe( true );
		} );

		it( 'binds arrowView#label to view', () => {
			expect( view.arrowView.label ).toBeUndefined();

			view.label = 'foo';

			expect( view.arrowView.label ).toBe( 'foo' );
		} );

		describe( 'activates keyboard navigation for the toolbar', () => {
			it( 'so "arrowright" on view#arrowView does nothing', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowright,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				};

				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.arrowView.element;

				const spy = vi.spyOn( view.actionView, 'focus' );

				view.keystrokes.press( keyEvtData );
				expect( spy ).not.toHaveBeenCalled();
				expect( keyEvtData.preventDefault ).not.toHaveBeenCalled();
				expect( keyEvtData.stopPropagation ).not.toHaveBeenCalled();
			} );

			it( 'so "arrowleft" on view#arrowView focuses view#actionView', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowleft,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				};

				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.arrowView.element;

				const spy = vi.spyOn( view.actionView, 'focus' );

				view.keystrokes.press( keyEvtData );
				expect( spy ).toHaveBeenCalledOnce();
				expect( keyEvtData.preventDefault ).toHaveBeenCalledOnce();
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledOnce();
			} );

			it( 'so "arrowright" on view#actionView focuses view#arrowView', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowright,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				};

				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.actionView.element;

				const spy = vi.spyOn( view.arrowView, 'focus' );

				view.keystrokes.press( keyEvtData );
				expect( spy ).toHaveBeenCalledOnce();
				expect( keyEvtData.preventDefault ).toHaveBeenCalledOnce();
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledOnce();
			} );

			it( 'so "arrowleft" on view#actionsView does nothing', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowleft,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				};

				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.actionView.element;

				const spy = vi.spyOn( view.arrowView, 'focus' );

				view.keystrokes.press( keyEvtData );
				expect( spy ).not.toHaveBeenCalled();
				expect( keyEvtData.preventDefault ).not.toHaveBeenCalled();
				expect( keyEvtData.stopPropagation ).not.toHaveBeenCalled();
			} );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy the FocusTracker instance', () => {
			const destroySpy = vi.spyOn( view.focusTracker, 'destroy' );

			view.destroy();

			expect( destroySpy ).toHaveBeenCalledOnce();
		} );

		it( 'should destroy the KeystrokeHandler instance', () => {
			const destroySpy = vi.spyOn( view.keystrokes, 'destroy' );

			view.destroy();

			expect( destroySpy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'bindings', () => {
		it( 'delegates actionView#execute to view#execute', () => {
			const spy = vi.fn();

			view.on( 'execute', spy );

			view.actionView.fire( 'execute' );

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'binds actionView#icon to view', () => {
			expect( view.actionView.icon ).toBeUndefined();

			view.icon = '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"></svg>';

			expect( view.actionView.icon ).toBe( '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"></svg>' );
		} );

		it( 'binds actionView#isEnabled to view', () => {
			expect( view.actionView.isEnabled ).toBe( true );

			view.isEnabled = false;

			expect( view.actionView.isEnabled ).toBe( false );
		} );

		it( 'binds actionView#label to view', () => {
			expect( view.actionView.label ).toBeUndefined();

			view.label = 'foo';

			expect( view.actionView.label ).toBe( 'foo' );
		} );

		it( 'delegates arrowView#execute to view#open', () => {
			const spy = vi.fn();

			view.on( 'open', spy );

			view.arrowView.fire( 'execute' );

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'binds arrowView#isEnabled to view', () => {
			expect( view.arrowView.isEnabled ).toBe( true );

			view.isEnabled = false;

			expect( view.arrowView.isEnabled ).toBe( false );
		} );

		it( 'binds actionView#tabindex to view', () => {
			expect( view.actionView.tabindex ).toBe( -1 );

			view.tabindex = 1;

			expect( view.actionView.tabindex ).toBe( 1 );
		} );

		// Makes little sense for split button but the Button interface specifies it, so let's support it.
		it( 'binds actionView#type to view', () => {
			expect( view.actionView.type ).toBe( 'button' );

			view.type = 'submit';

			expect( view.actionView.type ).toBe( 'submit' );
		} );

		it( 'binds actionView#withText to view', () => {
			expect( view.actionView.withText ).toBe( false );

			view.withText = true;

			expect( view.actionView.withText ).toBe( true );
		} );

		it( 'binds actionView#tooltip to view', () => {
			expect( view.actionView.tooltip ).toBe( false );

			view.tooltip = true;

			expect( view.actionView.tooltip ).toBe( true );
		} );

		it( 'binds actionView#tooltipPosition to view', () => {
			expect( view.actionView.tooltipPosition ).toBe( 's' );

			view.tooltipPosition = 'n';

			expect( view.actionView.tooltipPosition ).toBe( 'n' );
		} );
	} );

	describe( 'custom actionView button', () => {
		let customButton;

		class CustomButtonView extends ButtonView {}

		beforeEach( () => {
			customButton = new CustomButtonView( locale );
			view = new SplitButtonView( locale, customButton );

			view.render();
		} );

		it( 'creates custom view#actionView', () => {
			expect( view.actionView ).toBeInstanceOf( CustomButtonView );
			expect( view.actionView ).toBe( customButton );
			expect( view.actionView.element.classList.contains( 'ck-splitbutton__action' ) ).toBe( true );
		} );

		it( 'does not adds isToggleable to view#actionView', () => {
			expect( view.actionView.isToggleable ).toBe( false );

			view.isToggleable = true;

			expect( view.actionView.isToggleable ).toBe( false );
		} );

		it( 'creates view#arrowView', () => {
			expect( view.arrowView ).toBeInstanceOf( ButtonView );
			expect( view.arrowView.element.classList.contains( 'ck-splitbutton__arrow' ) ).toBe( true );
			expect( view.arrowView.element.attributes[ 'aria-haspopup' ].value ).toBe( 'true' );
			expect( view.arrowView.icon ).not.toBeUndefined();
			expect( view.arrowView.tooltip ).toBe( view.tooltip );
			expect( view.arrowView.label ).toBe( view.label );
		} );

		it( 'creates element from template', () => {
			expect( view.element.tagName ).toBe( 'DIV' );
			expect( view.element.classList.contains( 'ck' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-splitbutton' ) ).toBe( true );
		} );

		it( 'binds #isVisible to the template', () => {
			expect( view.element.classList.contains( 'ck-hidden' ) ).toBe( false );

			view.isVisible = false;

			expect( view.element.classList.contains( 'ck-hidden' ) ).toBe( true );

			// There should be no binding to the action view. Only the entire split button should react.
			expect( view.actionView.element.classList.contains( 'ck-hidden' ) ).toBe( false );
		} );

		describe( 'bindings', () => {
			it( 'delegates actionView#execute to view#execute', () => {
				const spy = vi.fn();

				view.on( 'execute', spy );

				view.actionView.fire( 'execute' );

				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'does not bind actionView#icon to view', () => {
				expect( view.actionView.icon ).toBeUndefined();

				view.icon = 'foo';

				expect( view.actionView.icon ).toBeUndefined();
			} );

			it( 'does not bind actionView#isEnabled to view', () => {
				expect( view.actionView.isEnabled ).toBe( true );

				view.isEnabled = false;

				expect( view.actionView.isEnabled ).toBe( true );
			} );

			it( 'does not bind actionView#label to view', () => {
				expect( view.actionView.label ).toBeUndefined();

				view.label = 'foo';

				expect( view.actionView.label ).toBeUndefined();
			} );

			it( 'delegates arrowView#execute to view#open', () => {
				const spy = vi.fn();

				view.on( 'open', spy );

				view.arrowView.fire( 'execute' );

				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'binds arrowView#isEnabled to view', () => {
				expect( view.arrowView.isEnabled ).toBe( true );

				view.isEnabled = false;

				expect( view.arrowView.isEnabled ).toBe( false );
			} );

			it( 'does not bind actionView#tabindex to view', () => {
				expect( view.actionView.tabindex ).toBe( -1 );

				view.tabindex = 1;

				expect( view.actionView.tabindex ).toBe( -1 );
			} );

			// Makes little sense for split button but the Button interface specifies it, so let's support it.
			it( 'does not bind actionView#type to view', () => {
				expect( view.actionView.type ).toBe( 'button' );

				view.type = 'submit';

				expect( view.actionView.type ).toBe( 'button' );
			} );

			it( 'does not bind actionView#withText to view', () => {
				expect( view.actionView.withText ).toBe( false );

				view.withText = true;

				expect( view.actionView.withText ).toBe( false );
			} );

			it( 'does not bind actionView#tooltip to view', () => {
				expect( view.actionView.tooltip ).toBe( false );

				view.tooltip = true;

				expect( view.actionView.tooltip ).toBe( false );
			} );

			it( 'does not bind actionView#tooltipPosition to view', () => {
				expect( view.actionView.tooltipPosition ).toBe( 's' );

				view.tooltipPosition = 'n';

				expect( view.actionView.tooltipPosition ).toBe( 's' );
			} );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the actionButton', () => {
			const spy = vi.spyOn( view.actionView, 'focus' );

			view.focus();

			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );
} );
