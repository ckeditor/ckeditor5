/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	Collection,
	KeystrokeHandler,
	FocusTracker,
	keyCodes
} from '@ckeditor/ckeditor5-utils';
import {
	View,
	FocusCycler,
	ViewCollection,
	SwitchButtonView
} from '@ckeditor/ckeditor5-ui';
import { LinkPropertiesView } from '../../src/ui/linkpropertiesview.js';
import { LinkManualDecorator } from '../../src/utils/manualdecorator.js';

const mockLocale = { t: val => val };

describe( 'LinkPropertiesView', () => {
	let view, collection, linkCommand, decorator1, decorator2, decorator3;

	beforeEach( () => {
		collection = new Collection();

		decorator1 = new LinkManualDecorator( {
			id: 'decorator1',
			label: 'Foo',
			attributes: {
				foo: 'bar'
			}
		} );

		decorator2 = new LinkManualDecorator( {
			id: 'decorator2',
			label: 'Download',
			attributes: {
				download: 'download'
			},
			defaultValue: true
		} );

		decorator3 = new LinkManualDecorator( {
			id: 'decorator3',
			label: 'Multi',
			attributes: {
				class: 'fancy-class',
				target: '_blank',
				rel: 'noopener noreferrer'
			}
		} );

		collection.addMany( [
			decorator1,
			decorator2,
			decorator3
		] );

		view = new LinkPropertiesView( mockLocale );

		view.listChildren.bindTo( collection ).using( decorator => {
			const button = new SwitchButtonView();

			button.set( {
				label: decorator.label,
				withText: true
			} );

			button.bind( 'isOn' ).toMany( [ decorator ], 'value', decoratorValue => {
				return Boolean( decoratorValue === undefined ? decorator.defaultValue : decoratorValue );
			} );

			button.on( 'execute', () => {
				decorator.set( 'value', !button.isOn );
			} );

			return button;
		} );

		view.render();
		document.body.appendChild( view.element );
	} );

	afterEach( () => {
		view.element.remove();
		view.destroy();
		collection.clear();
	} );

	describe( 'constructor()', () => {
		it( 'should create element from template', () => {
			expect( view.element.tagName.toLowerCase() ).toBe( 'div' );
			expect( view.element.classList.contains( 'ck' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-link-properties' ) ).toBe( true );
		} );

		it( 'should create child views', () => {
			expect( view.backButtonView ).toBeInstanceOf( View );
		} );

		it( 'should create #focusTracker instance', () => {
			expect( view.focusTracker ).toBeInstanceOf( FocusTracker );
		} );

		it( 'should create #keystrokes instance', () => {
			expect( view.keystrokes ).toBeInstanceOf( KeystrokeHandler );
		} );

		it( 'should create #_focusCycler instance', () => {
			expect( view._focusCycler ).toBeInstanceOf( FocusCycler );
		} );

		it( 'should create #_focusables view collection', () => {
			expect( view._focusables ).toBeInstanceOf( ViewCollection );
		} );

		it( 'should fire `back` event on backButtonView#execute', () => {
			const spy = vi.fn();

			view.on( 'back', spy );

			view.backButtonView.fire( 'execute' );

			expect( spy ).toHaveBeenCalledOnce();
		} );

		describe( 'template', () => {
			it( 'has back button', () => {
				const button = view.template.children[ 0 ].get( 0 ).template.children[ 0 ].get( 0 );

				expect( button ).toBe( view.backButtonView );
			} );
		} );
	} );

	describe( 'render()', () => {
		it( 'should register child views in #_focusables', () => {
			const focusables = view._focusables.map( f => f );
			const expected = [ view.backButtonView, ...view.listChildren ];

			expect( focusables ).toHaveLength( expected.length );
			expect( focusables ).toEqual( expect.arrayContaining( expected ) );
		} );

		it( 'should register child views #element in #focusTracker', () => {
			expect( view.focusTracker.elements[ 0 ] ).toBe( view.listChildren.get( 0 ).element );
			expect( view.focusTracker.elements[ 1 ] ).toBe( view.listChildren.get( 1 ).element );
			expect( view.focusTracker.elements[ 2 ] ).toBe( view.listChildren.get( 2 ).element );
			expect( view.focusTracker.elements[ 3 ] ).toBe( view.backButtonView.element );

			view.destroy();
		} );

		it( 'starts listening for #keystrokes coming from #element', () => {
			const view = new LinkPropertiesView( mockLocale, linkCommand );
			const spy = vi.spyOn( view.keystrokes, 'listenTo' );

			view.render();

			expect( spy ).toHaveBeenCalledOnce();
			expect( spy ).toHaveBeenCalledWith( view.element );

			view.destroy();
		} );

		describe( 'activates keyboard navigation', () => {
			it( 'so "tab" focuses the next focusable item', () => {
				const spy = vi.spyOn( view.backButtonView, 'focus' );

				const keyEvtData = {
					keyCode: keyCodes.tab,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				};

				// Mock the focus on last switch button.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.listChildren.last.element;
				view.keystrokes.press( keyEvtData );

				expect( keyEvtData.preventDefault ).toHaveBeenCalledOnce();
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledOnce();
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'so "shift + tab" focuses the previous focusable item', () => {
				const spy = vi.spyOn( view.listChildren.last, 'focus' );

				const keyEvtData = {
					keyCode: keyCodes.tab,
					shiftKey: true,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				};

				// Mock the cancel button is focused.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.backButtonView.element;
				view.keystrokes.press( keyEvtData );

				expect( keyEvtData.preventDefault ).toHaveBeenCalledOnce();
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledOnce();
				expect( spy ).toHaveBeenCalledOnce();
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

	describe( 'focus()', () => {
		it( 'focuses the first switch button', () => {
			const spy = vi.spyOn( view.listChildren.first, 'focus' );

			view.focus();

			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );
} );
