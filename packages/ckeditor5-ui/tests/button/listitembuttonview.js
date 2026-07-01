/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ListItemButtonView, CheckIconHolderView } from '../../src/button/listitembuttonview.js';
import { ButtonView } from '../../src/button/buttonview.js';

describe( 'ListItemButtonView', () => {
	let locale, view;

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	beforeEach( () => {
		locale = { t() {} };

		view = new ListItemButtonView( locale );
		view.render();
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should inherit from ButtonView', () => {
			expect( view ).toBeInstanceOf( ButtonView );
		} );

		it( 'should initialize with hasCheckSpace set to false', () => {
			expect( view.hasCheckSpace ).toBe( false );
		} );

		it( 'should initialize with isToggleable set to false', () => {
			expect( view.isToggleable ).toBe( false );
		} );

		it( 'should initialize with proper class names', () => {
			expect( [ ...view.element.classList ] ).toEqual( [
				'ck',
				'ck-button',
				'ck-off',
				'ck-list-item-button'
			] );
		} );
	} );

	describe( 'render()', () => {
		it( 'should render check holder if initially visible', () => {
			view = new ListItemButtonView( locale );
			view.isToggleable = true;
			view.render();

			expect( view.element.querySelector( '.ck-list-item-button__check-holder' ) ).not.toBeNull();
		} );
	} );

	describe( 'isToggleable', () => {
		it( 'should bind class names properly when isToggleable is set to true', () => {
			view.isToggleable = true;

			expect( view.element.classList.contains( 'ck-list-item-button_toggleable' ) ).toBe( true );
		} );
	} );

	describe( '_hasCheck', () => {
		const possibleRenderStates = [
			{ isToggleable: false, checkHolderSpace: false, rendered: false },
			{ isToggleable: false, checkHolderSpace: true, rendered: true },
			{ isToggleable: true, checkHolderSpace: false, rendered: true },
			{ isToggleable: true, checkHolderSpace: true, rendered: true }
		];

		for ( const { isToggleable, checkHolderSpace, rendered } of possibleRenderStates ) {
			it(
				`should render checkbox holder when isToggleable=${ isToggleable } and hasCheckSpace=${ checkHolderSpace }`,
				() => {
					view.isToggleable = isToggleable;
					view.hasCheckSpace = checkHolderSpace;

					expect( !!view.element.querySelector( '.ck-list-item-button__check-holder' ) ).toBe( rendered );
				}
			);
		}

		it( 'should remove check holder when isToggleable is set to false', () => {
			view.isToggleable = true;
			expect( view.element.querySelector( '.ck-list-item-button__check-holder' ) ).not.toBeNull();

			view.isToggleable = false;
			expect( view.element.querySelector( '.ck-list-item-button__check-holder' ) ).toBeNull();
		} );
	} );

	describe( '_checkIconHolderView', () => {
		it( 'should be instance of CheckIconHolderView', () => {
			expect( view._checkIconHolderView ).toBeInstanceOf( CheckIconHolderView );
		} );

		it( 'should have `isOn` bound to parent view', () => {
			// When is not toggleable, the check icon should be hidden.
			view.isToggleable = false;
			view.isOn = true;
			expect( view._checkIconHolderView.isOn ).toBe( false );

			view.isOn = false;
			expect( view._checkIconHolderView.isOn ).toBe( false );

			// When is toggleable, the check icon should be visible.
			view.isToggleable = true;
			view.isOn = true;
			expect( view._checkIconHolderView.isOn ).toBe( true );

			view.isOn = false;
			expect( view._checkIconHolderView.isOn ).toBe( false );
		} );
	} );
} );

describe( 'CheckIconHolderView', () => {
	let view;

	beforeEach( () => {
		view = new CheckIconHolderView();
		view.render();
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should initialize with proper class names', () => {
			expect( [ ...view.element.classList ] ).toEqual( [
				'ck',
				'ck-list-item-button__check-holder',
				'ck-off'
			] );
		} );
	} );

	describe( 'render()', () => {
		it( 'should render icon if initially isOn=true', () => {
			view = new CheckIconHolderView();
			view.isOn = true;
			view.render();

			expect( view.element.querySelector( '.ck-list-item-button__check-icon' ) ).not.toBeNull();
		} );
	} );

	describe( 'isOn', () => {
		it( 'should bind class names properly when isOn is set to true', () => {
			view.isOn = true;
			expect( view.element.classList.contains( 'ck-on' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-off' ) ).toBe( false );

			view.isOn = false;
			expect( view.element.classList.contains( 'ck-on' ) ).toBe( false );
			expect( view.element.classList.contains( 'ck-off' ) ).toBe( true );
		} );

		it( 'should render icon with proper class depending on isOn flag', () => {
			expect( view.element.querySelector( '.ck-list-item-button__check-icon' ) ).toBeNull();

			view.isOn = true;
			expect( view.element.querySelector( '.ck-list-item-button__check-icon' ) ).not.toBeNull();

			view.isOn = false;
			expect( view.element.querySelector( '.ck-list-item-button__check-icon' ) ).toBeNull();
		} );

		it( 'should not remove icon if it is already absent', () => {
			view.isOn = true;
			view.children.remove( view._checkIconView );

			view.isOn = false;

			expect( view.element.querySelector( '.ck-list-item-button__check-icon' ) ).toBeNull();
		} );
	} );
} );
