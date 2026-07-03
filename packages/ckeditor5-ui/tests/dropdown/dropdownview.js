/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DropdownView } from '../../src/dropdown/dropdownview.js';
import { KeystrokeHandler, keyCodes, global, FocusTracker } from '@ckeditor/ckeditor5-utils';
import { ButtonView } from '../../src/button/buttonview.js';
import { DropdownPanelView } from '../../src/dropdown/dropdownpanelview.js';

describe( 'DropdownView', () => {
	let view, buttonView, panelView, locale;

	beforeEach( () => {
		locale = {
			uiLanguageDirection: 'ltr',
			t() {}
		};

		buttonView = new ButtonView( locale );
		panelView = new DropdownPanelView( locale );

		view = new DropdownView( locale, buttonView, panelView );
		view.render();

		// The #panelView positioning depends on the utility that uses DOM Rects.
		// To avoid an avalanche of warnings (DOM Rects do not work until
		// the element is in DOM), let's allow the dropdown to render in DOM.
		global.document.body.appendChild( view.element );
	} );

	afterEach( () => {
		view.element.remove();
	} );

	describe( 'constructor()', () => {
		it( 'sets view#locale', () => {
			expect( view.locale ).toBe( locale );
		} );

		it( 'sets view#buttonView', () => {
			expect( view.buttonView ).toBe( buttonView );
		} );

		it( 'sets view#panelView', () => {
			expect( view.panelView ).toBe( panelView );
		} );

		it( 'sets view#isOpen false', () => {
			expect( view.isOpen ).toBe( false );
		} );

		it( 'sets view#isEnabled true', () => {
			expect( view.isEnabled ).toBe( true );
		} );

		it( 'sets view#class', () => {
			expect( view.class ).toBeUndefined();
		} );

		it( 'sets view#id', () => {
			expect( view.id ).toBeUndefined();
		} );

		it( 'sets view#panelPosition "auto"', () => {
			expect( view.panelPosition ).toBe( 'auto' );
		} );

		it( 'creates #keystrokeHandler instance', () => {
			expect( view.keystrokes ).toBeInstanceOf( KeystrokeHandler );
		} );

		it( 'creates #focusTracker instance', () => {
			expect( view.focusTracker ).toBeInstanceOf( FocusTracker );
		} );

		it( 'creates #element from template', () => {
			expect( view.element.classList.contains( 'ck' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-dropdown' ) ).toBe( true );
			expect( view.element.children ).toHaveLength( 2 );
			expect( view.element.children[ 0 ] ).toBe( buttonView.element );
			expect( view.element.children[ 1 ] ).toBe( panelView.element );
		} );

		it( 'sets view#buttonView class', () => {
			expect( view.buttonView.element.classList.contains( 'ck-dropdown__button' ) ).toBe( true );
		} );

		describe( 'bindings', () => {
			describe( 'view#isOpen to view.buttonView#select', () => {
				it( 'is activated', () => {
					const values = [];

					view.on( 'change:isOpen', () => {
						values.push( view.isOpen );
					} );

					view.buttonView.fire( 'open' );
					view.buttonView.fire( 'open' );
					view.buttonView.fire( 'open' );

					expect( values ).toEqual( expect.arrayContaining( [ true, false, true ] ) );
					expect( values ).toHaveLength( 3 );
				} );
			} );

			describe( 'view.panelView#isVisible to view#isOpen', () => {
				it( 'is activated before the view gets rendered', () => {
					const panelView = new DropdownPanelView( locale );
					const buttonView = new ButtonView( locale );
					const view = new DropdownView( locale, buttonView, panelView );
					const values = [];

					view.listenTo( view.panelView, 'change:isVisible', () => {
						values.push( view.isOpen );
					} );

					view.isOpen = true;
					view.isOpen = false;
					view.isOpen = true;

					expect( values ).toEqual( expect.arrayContaining( [ true, false, true ] ) );
					expect( values ).toHaveLength( 3 );

					view.destroy();
					buttonView.destroy();
					panelView.destroy();
				} );
			} );

			describe( 'view.panelView#position to view#panelPosition', () => {
				it( 'does not update until the dropdown is open', () => {
					view.isOpen = false;
					view.panelPosition = 'nw';

					expect( panelView.position ).toBe( 'se' );

					view.isOpen = true;

					expect( panelView.position ).toBe( 'nw' );
				} );

				describe( 'in "auto" mode', () => {
					it( 'uses _getOptimalPosition() and a dedicated set of positions (LTR)', () => {
						const spy = vi.spyOn( DropdownView, '_getOptimalPosition' );
						const {
							south, north,
							southEast, southWest,
							northEast, northWest,
							southMiddleEast, southMiddleWest,
							northMiddleEast, northMiddleWest
						} = DropdownView.defaultPanelPositions;

						view.isOpen = true;

						expect( spy ).toHaveBeenCalledOnce();
						expect( spy ).toHaveBeenCalledWith( expect.objectContaining( {
							element: panelView.element,
							target: buttonView.element,
							positions: [
								southEast, southWest, southMiddleEast, southMiddleWest, south,
								northEast, northWest, northMiddleEast, northMiddleWest, north
							],
							fitInViewport: true
						} ) );
					} );

					it( 'uses _getOptimalPosition() and a dedicated set of positions (RTL)', () => {
						const spy = vi.spyOn( DropdownView, '_getOptimalPosition' );
						const {
							south, north,
							southEast, southWest,
							northEast, northWest,
							southMiddleEast, southMiddleWest,
							northMiddleEast, northMiddleWest
						} = DropdownView.defaultPanelPositions;

						view.locale.uiLanguageDirection = 'rtl';
						view.isOpen = true;

						expect( spy ).toHaveBeenCalledOnce();
						expect( spy ).toHaveBeenCalledWith( expect.objectContaining( {
							element: panelView.element,
							target: buttonView.element,
							positions: [
								southWest, southEast, southMiddleWest, southMiddleEast, south,
								northWest, northEast, northMiddleWest, northMiddleEast, north
							],
							fitInViewport: true
						} ) );
					} );

					it( 'fallback when _getOptimalPosition() will return null', () => {
						const locale = {
							t() {}
						};

						const buttonView = new ButtonView( locale );
						const panelView = new DropdownPanelView( locale );

						const view = new DropdownView( locale, buttonView, panelView );
						view.render();

						const parentWithOverflow = global.document.createElement( 'div' );
						parentWithOverflow.style.width = '1px';
						parentWithOverflow.style.height = '1px';
						parentWithOverflow.style.marginTop = '-1000px';
						parentWithOverflow.style.overflow = 'scroll';

						parentWithOverflow.appendChild( view.element );

						global.document.body.appendChild( parentWithOverflow );

						view.isOpen = true;

						expect( view.panelView.position ).toBe( 'se' ); // first position from position list.

						view.element.remove();
						parentWithOverflow.remove();
					} );

					it( 'fallback when _getOptimalPosition() will return null (RTL)', () => {
						const locale = {
							t() {}
						};

						const buttonView = new ButtonView( locale );
						const panelView = new DropdownPanelView( locale );

						const view = new DropdownView( locale, buttonView, panelView );

						view.locale.uiLanguageDirection = 'rtl';
						view.render();

						const parentWithOverflow = global.document.createElement( 'div' );
						parentWithOverflow.style.width = '1px';
						parentWithOverflow.style.height = '1px';
						parentWithOverflow.style.marginTop = '-1000px';
						parentWithOverflow.style.overflow = 'scroll';

						parentWithOverflow.appendChild( view.element );

						global.document.body.appendChild( parentWithOverflow );

						view.isOpen = true;

						expect( view.panelView.position ).toBe( 'sw' ); // first position from position list.

						view.element.remove();
						parentWithOverflow.remove();
					} );
				} );
			} );

			describe( 'DOM element bindings', () => {
				describe( 'class', () => {
					it( 'reacts on view#isEnabled', () => {
						view.isEnabled = true;
						expect( view.element.classList.contains( 'ck-disabled' ) ).toBe( false );

						view.isEnabled = false;
						expect( view.element.classList.contains( 'ck-disabled' ) ).toBe( true );
					} );

					it( 'reacts on view#class', () => {
						view.class = 'custom-css-class';
						expect( view.element.classList.contains( 'custom-css-class' ) ).toBe( true );
					} );
				} );

				describe( 'id', () => {
					it( 'reacts on view#id', () => {
						view.id = 'foo';
						expect( view.element.id ).toBe( 'foo' );
					} );
				} );
			} );
		} );
	} );

	describe( 'render()', () => {
		it( 'registers child views in #focusTracker', () => {
			const view = new DropdownView( locale,
				new ButtonView( locale ),
				new DropdownPanelView( locale ) );

			const addSpy = vi.spyOn( view.focusTracker, 'add' );

			view.render();

			expect( addSpy ).toHaveBeenCalledTimes( 2 );
			expect( addSpy.mock.calls[ 0 ][ 0 ] ).toBe( view.buttonView.element );
			expect( addSpy.mock.calls[ 1 ][ 0 ] ).toBe( view.panelView.element );

			view.destroy();
		} );

		it( 'starts listening for #keystrokes coming from #element', () => {
			const view = new DropdownView( locale,
				new ButtonView( locale ),
				new DropdownPanelView( locale ) );

			const spy = vi.spyOn( view.keystrokes, 'listenTo' );

			view.render();
			expect( spy ).toHaveBeenCalledOnce();
			expect( spy ).toHaveBeenCalledWith( view.element );

			view.element.remove();
		} );

		describe( 'activates keyboard navigation for the dropdown', () => {
			it( 'so "arrowdown" opens the #panelView', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowdown,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				};

				view.buttonView.isEnabled = true;

				view.isOpen = true;
				view.keystrokes.press( keyEvtData );
				expect( keyEvtData.preventDefault ).not.toHaveBeenCalled();
				expect( keyEvtData.stopPropagation ).not.toHaveBeenCalled();
				expect( view.isOpen ).toBe( true );

				view.isOpen = false;
				view.keystrokes.press( keyEvtData );
				expect( keyEvtData.preventDefault ).toHaveBeenCalledOnce();
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledOnce();
				expect( view.isOpen ).toBe( true );
			} );

			it( 'so "arrowdown" won\'t open the #panelView when #isEnabled is false', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowdown,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				};

				view.buttonView.isEnabled = false;
				view.isOpen = false;

				view.keystrokes.press( keyEvtData );
				expect( keyEvtData.preventDefault ).not.toHaveBeenCalled();
				expect( keyEvtData.stopPropagation ).not.toHaveBeenCalled();
				expect( view.isOpen ).toBe( false );
			} );

			it( 'so "arrowright" is blocked', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowright,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				};

				view.false = true;
				view.keystrokes.press( keyEvtData );
				expect( keyEvtData.preventDefault ).not.toHaveBeenCalled();
				expect( keyEvtData.stopPropagation ).not.toHaveBeenCalled();
				expect( view.isOpen ).toBe( false );

				view.isOpen = true;
				view.keystrokes.press( keyEvtData );
				expect( keyEvtData.preventDefault ).toHaveBeenCalledOnce();
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledOnce();
				expect( view.isOpen ).toBe( true );
			} );

			it( 'so "arrowleft" closes the #panelView', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowleft,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				};
				const spy = vi.spyOn( view.buttonView, 'focus' );

				view.isOpen = false;
				view.keystrokes.press( keyEvtData );
				expect( keyEvtData.preventDefault ).not.toHaveBeenCalled();
				expect( keyEvtData.stopPropagation ).not.toHaveBeenCalled();
				expect( spy ).not.toHaveBeenCalled();
				expect( view.isOpen ).toBe( false );

				view.isOpen = true;
				view.keystrokes.press( keyEvtData );
				expect( keyEvtData.preventDefault ).toHaveBeenCalledOnce();
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledOnce();
				expect( spy ).not.toHaveBeenCalled();
				expect( view.isOpen ).toBe( false );
			} );

			it( 'so "esc" closes the #panelView', () => {
				const keyEvtData = {
					keyCode: keyCodes.esc,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				};
				const spy = vi.spyOn( view.buttonView, 'focus' );

				view.isOpen = false;
				view.keystrokes.press( keyEvtData );
				expect( keyEvtData.preventDefault ).not.toHaveBeenCalled();
				expect( keyEvtData.stopPropagation ).not.toHaveBeenCalled();
				expect( spy ).not.toHaveBeenCalled();
				expect( view.isOpen ).toBe( false );

				view.isOpen = true;
				view.keystrokes.press( keyEvtData );
				expect( keyEvtData.preventDefault ).toHaveBeenCalledOnce();
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledOnce();
				expect( spy ).not.toHaveBeenCalled();
				expect( view.isOpen ).toBe( false );
			} );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the #buttonView in DOM', () => {
			const spy = vi.spyOn( view.buttonView, 'focus' );

			view.focus();

			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'DropdownView.defaultPanelPositions', () => {
		let positions, buttonRect, panelRect;

		beforeEach( () => {
			positions = DropdownView.defaultPanelPositions;

			buttonRect = {
				top: 100,
				bottom: 200,
				left: 500,
				right: 200,
				width: 100,
				height: 100
			};

			panelRect = {
				top: 0,
				bottom: 0,
				left: 0,
				right: 0,
				width: 400,
				height: 50
			};
		} );

		it( 'should have a proper length', () => {
			expect( Object.keys( positions ) ).toHaveLength( 10 );
		} );

		it( 'should define the "south" position', () => {
			expect( positions.south( buttonRect, panelRect ) ).toEqual( {
				top: 200,
				left: 350,
				name: 's'
			} );
		} );

		it( 'should define the "southEast" position', () => {
			expect( positions.southEast( buttonRect, panelRect ) ).toEqual( {
				top: 200,
				left: 500,
				name: 'se'
			} );
		} );

		it( 'should define the "southWest" position', () => {
			expect( positions.southWest( buttonRect, panelRect ) ).toEqual( {
				top: 200,
				left: 200,
				name: 'sw'
			} );
		} );

		it( 'should define the "southMiddleEast" position', () => {
			expect( positions.southMiddleEast( buttonRect, panelRect ) ).toEqual( {
				top: 200,
				left: 425,
				name: 'sme'
			} );
		} );

		it( 'should define the "southMiddleWest" position', () => {
			expect( positions.southMiddleWest( buttonRect, panelRect ) ).toEqual( {
				top: 200,
				left: 275,
				name: 'smw'
			} );
		} );

		it( 'should define the "north" position', () => {
			expect( positions.north( buttonRect, panelRect ) ).toEqual( {
				top: 50,
				left: 350,
				name: 'n'
			} );
		} );

		it( 'should define the "northEast" position', () => {
			expect( positions.northEast( buttonRect, panelRect ) ).toEqual( {
				top: 50,
				left: 500,
				name: 'ne'
			} );
		} );

		it( 'should define the "northWest" position', () => {
			expect( positions.northWest( buttonRect, panelRect ) ).toEqual( {
				top: 50,
				left: 200,
				name: 'nw'
			} );
		} );

		it( 'should define the "northMiddleEast" position', () => {
			expect( positions.northMiddleEast( buttonRect, panelRect ) ).toEqual( {
				top: 50,
				left: 425,
				name: 'nme'
			} );
		} );

		it( 'should define the "northMiddleWest" position', () => {
			expect( positions.northMiddleWest( buttonRect, panelRect ) ).toEqual( {
				top: 50,
				left: 275,
				name: 'nmw'
			} );
		} );
	} );
} );
