/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	ListView,
	AutocompleteView,
	SearchTextView
} from '../../src/index.js';
import { Locale, Rect, global, keyCodes } from '@ckeditor/ckeditor5-utils';

describe( 'AutocompleteView', () => {
	let view, filteredView;

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	beforeEach( () => {
		filteredView = new ListView();
		filteredView.filter = () => {
			return {
				resultsCount: 1,
				totalItemsCount: 5
			};
		};

		view = new AutocompleteView( new Locale(), {
			filteredView,
			queryView: {
				label: 'test label'
			}
		} );

		view.render();

		document.body.appendChild( view.element );
	} );

	afterEach( () => {
		filteredView.destroy();
		view.destroy();
		view.element.remove();
	} );

	describe( 'constructor()', () => {
		it( 'extends SearchTextView', () => {
			expect( view ).toBeInstanceOf( SearchTextView );
		} );

		describe( '#resultsView', () => {
			it( 'has #isVisible property with a DOM binding', () => {
				expect( view.resultsView.isVisible ).toBe( false );
				expect( view.resultsView.element.classList.contains( 'ck-hidden' ) ).toBe( true );

				view.resultsView.isVisible = true;
				expect( view.resultsView.element.classList.contains( 'ck-hidden' ) ).toBe( false );
			} );

			it( 'should update the value and close results when the filtered view fired the execute event', () => {
				const focusSpy = vi.spyOn( view, 'focus' );

				view.resultsView.isVisible = true;

				view.filteredView.fire( 'execute', { value: 'foo bar baz' } );

				expect( view.resultsView.isVisible ).toBe( false );
				expect( focusSpy ).toHaveBeenCalledOnce();
				expect( view.queryView.fieldView.value ).toBe( 'foo bar baz' );
				expect( view.queryView.fieldView.element.value ).toBe( 'foo bar baz' );
			} );

			it( 'has a #_position property with a DOM binding', () => {
				expect( view.resultsView._position ).toBe( 's' );
				expect( view.resultsView.element.classList.contains( 'ck-search__results_s' ) ).toBe( true );

				view.resultsView._position = 'n';
				expect( view.resultsView.element.classList.contains( 'ck-search__results_n' ) ).toBe( true );
			} );

			it( 'should update results position on document scroll (if results are visible)', () => {
				const getOptimalPositionSpy = vi.spyOn( AutocompleteView, '_getOptimalPosition' );

				// A default that will get overridden.
				view.resultsView._position = 'n';

				view.focusTracker.isFocused = true;
				expect( getOptimalPositionSpy ).toHaveBeenCalledOnce();
				expect( getOptimalPositionSpy ).toHaveBeenCalledWith( {
					element: view.resultsView.element,
					target: view.queryView.element,
					fitInViewport: true,
					positions: AutocompleteView.defaultResultsPositions
				} );

				global.document.dispatchEvent( new Event( 'scroll' ) );

				expect( getOptimalPositionSpy ).toHaveBeenCalledTimes( 2 );

				view.focusTracker.isFocused = false;
				global.document.dispatchEvent( new Event( 'scroll' ) );

				expect( getOptimalPositionSpy ).toHaveBeenCalledTimes( 2 );

				// Default when the are no obstacles
				expect( view.resultsView._position ).toBe( 's' );
			} );

			it( 'should use the first results position on document scroll if the optimal one couldn\'t be found', () => {
				const getOptimalPositionSpy = vi.spyOn( AutocompleteView, '_getOptimalPosition' );

				vi.spyOn( view.queryView.element, 'getBoundingClientRect' ).mockReturnValue( {
					top: -100,
					right: -100,
					bottom: -90,
					left: -90,
					width: 10,
					height: 10
				} );

				// A default that will get overridden.
				view.resultsView._position = 'n';

				view.focusTracker.isFocused = true;
				expect( getOptimalPositionSpy ).toHaveBeenCalledOnce();
				expect( getOptimalPositionSpy ).toHaveBeenCalledWith( {
					element: view.resultsView.element,
					target: view.queryView.element,
					fitInViewport: true,
					positions: AutocompleteView.defaultResultsPositions
				} );

				global.document.dispatchEvent( new Event( 'scroll' ) );

				expect( getOptimalPositionSpy ).toHaveBeenCalledTimes( 2 );

				// First position in defaultResultsPositions.
				expect( view.resultsView._position ).toBe( 's' );
			} );

			describe( 'Esc key handling', () => {
				it( 'should focus the #queryView and hide the #resultsView upon pressing Esc if the results view is visible', () => {
					const keyEvtData = {
						keyCode: keyCodes.esc,
						preventDefault: vi.fn(),
						stopPropagation: vi.fn()
					};

					const queryFocusSpy = vi.spyOn( view.queryView, 'focus' );
					const resultsIsVisibleChangeSpy = vi.fn();

					view.resultsView.isVisible = true;
					view.resultsView.on( 'change:isVisible', resultsIsVisibleChangeSpy );

					view.keystrokes.press( keyEvtData );

					expect( queryFocusSpy ).toHaveBeenCalledOnce();
					expect( resultsIsVisibleChangeSpy ).toHaveBeenCalledOnce();
					expect( queryFocusSpy.mock.invocationCallOrder[ 0 ] ).toBeLessThan(
						resultsIsVisibleChangeSpy.mock.invocationCallOrder[ 0 ]
					);
					expect( view.resultsView.isVisible ).toBe( false );

					expect( keyEvtData.preventDefault ).toHaveBeenCalledOnce();
					expect( keyEvtData.stopPropagation ).toHaveBeenCalledOnce();
				} );

				it( 'should pass the DOM event through upon pressing Esc if the #resultsView is invisible', () => {
					const keyEvtData = {
						keyCode: keyCodes.esc,
						preventDefault: vi.fn(),
						stopPropagation: vi.fn()
					};

					const queryFocusSpy = vi.spyOn( view.queryView, 'focus' );

					view.keystrokes.press( keyEvtData );

					expect( queryFocusSpy ).not.toHaveBeenCalled();
					expect( view.resultsView.isVisible ).toBe( false );
					expect( keyEvtData.preventDefault ).not.toHaveBeenCalled();
					expect( keyEvtData.stopPropagation ).not.toHaveBeenCalled();
				} );
			} );

			it( 'should hide the results upon disabling the view', () => {
				view.resultsView.isVisible = true;

				view.isEnabled = false;

				expect( view.resultsView.isVisible ).toBe( false );
			} );

			it( 'should not display the results upon searching if the query is shorter than configured #queryMinChars', () => {
				const view = new AutocompleteView( new Locale(), {
					filteredView,
					queryMinChars: 3,
					queryView: {
						label: 'test label'
					}
				} );

				view.render();
				document.body.appendChild( view.element );
				view.focusTracker.isFocused = true;

				expect( view.resultsView.isVisible ).toBe( false );

				view.queryView.fieldView.value = 'a';
				view.fire( 'search', { query: 'a', resultsCount: 1, totalItemsCount: 5 } );
				expect( view.resultsView.isVisible ).toBe( false );

				view.queryView.fieldView.value = 'ab';
				view.fire( 'search', { query: 'ab', resultsCount: 1, totalItemsCount: 5 } );
				expect( view.resultsView.isVisible ).toBe( false );

				view.queryView.fieldView.value = 'abc';
				view.fire( 'search', { query: 'abc', resultsCount: 1, totalItemsCount: 5 } );
				expect( view.resultsView.isVisible ).toBe( true );

				view.destroy();
				view.element.remove();
			} );

			it( 'should update view position, width, and visibility upon #search event', () => {
				const view = new AutocompleteView( new Locale(), {
					filteredView,
					queryMinChars: 3,
					queryView: {
						label: 'test label'
					}
				} );

				view.render();
				document.body.appendChild( view.element );
				expect( view.resultsView.isVisible ).toBe( false );

				view.queryView.fieldView.value = 'abc';
				view.focusTracker.isFocused = true;
				expect( view.resultsView.isVisible ).toBe( true );

				vi.spyOn( AutocompleteView, '_getOptimalPosition' ).mockReturnValue( { name: 'foo' } );
				vi.spyOn( view.queryView.fieldView.element, 'getBoundingClientRect' ).mockReturnValue( { width: '1234' } );

				// Query too short.
				view.queryView.fieldView.value = 'a';
				view.fire( 'search', { query: 'a', resultsCount: 1, totalItemsCount: 5 } );

				expect( view.resultsView.isVisible ).toBe( false );
				expect( view.resultsView.element.classList.contains( 'ck-search__results_foo' ) ).toBe( false );
				expect( view.resultsView.element.style.width ).not.toBe( '1234px' );

				// Query long enough.
				view.queryView.fieldView.value = 'abcd';
				view.fire( 'search', { query: 'abcd', resultsCount: 1, totalItemsCount: 5 } );

				expect( view.resultsView.isVisible ).toBe( true );
				expect( view.resultsView.element.classList.contains( 'ck-search__results_foo' ) ).toBe( true );
				expect( view.resultsView.element.style.width ).toBe( '1234px' );

				view.destroy();
				view.element.remove();
			} );

			describe( '#defaultResultsPositions', () => {
				it( 'should be able to position results above the search field (north)', () => {
					const northPositioningFunction = AutocompleteView.defaultResultsPositions[ 0 ];
					const fieldRectMock = new Rect( { top: 0, right: 100, bottom: 100, left: 0, width: 100, height: 100 } );

					expect( northPositioningFunction( fieldRectMock ) ).toEqual( {
						left: 0,
						top: 100,
						name: 's'
					} );
				} );

				it( 'should be able to position results below the search field (south)', () => {
					const northPositioningFunction = AutocompleteView.defaultResultsPositions[ 1 ];
					const fieldRectMock = new Rect( { top: 0, right: 100, bottom: 100, left: 0, width: 100, height: 100 } );
					const resultsRectMock = new Rect( { top: 0, right: 100, bottom: 50, left: 0, width: 100, height: 50 } );

					expect( northPositioningFunction( fieldRectMock, resultsRectMock ) ).toEqual( {
						left: 0,
						top: -50,
						name: 'n'
					} );
				} );
			} );
		} );

		describe( '#execute event handling', () => {
			it( 'should focus the view upon #execute', () => {
				const focusSpy = vi.spyOn( view, 'focus' );

				filteredView.fire( 'execute', { value: 'foo bar baz' } );

				expect( focusSpy ).toHaveBeenCalledOnce();
			} );

			it( 'should set the #value upon #execute', () => {
				filteredView.fire( 'execute', { value: 'foo bar baz' } );

				expect( view.queryView.fieldView.value ).toBe( 'foo bar baz' );
			} );

			it( 'should set the query view\'s DOM element value upon #execute', () => {
				view.queryView.fieldView.element.value = 'abc';

				filteredView.fire( 'execute', { value: 'foo bar baz' } );

				expect( view.queryView.fieldView.element.value ).toBe( 'foo bar baz' );
			} );

			it( 'should hide the #resultsView', () => {
				view.resultsView.isVisible = true;

				filteredView.fire( 'execute', { value: 'foo bar baz' } );

				expect( view.resultsView.isVisible ).toBe( false );
			} );
		} );

		describe( 'focus tracking behavior', () => {
			it( 'displays autocomplete results upon focusing the view', () => {
				expect( view.resultsView.isVisible ).toBe( false );

				view.focusTracker.isFocused = true;

				expect( view.resultsView.isVisible ).toBe( true );
			} );

			it( 'updates autocomplete results\' position upon focusing the view', () => {
				view.resultsView._position = 'foo';

				view.focusTracker.isFocused = true;

				expect( view.resultsView._position ).toBe( 's' );
			} );

			describe( 'reset on blur', () => {
				it( 'resets the view when blurred if configured to do so', () => {
					const view = new AutocompleteView( new Locale(), {
						filteredView,
						resetOnBlur: true,
						queryView: {
							label: 'test label'
						}
					} );

					view.render();
					document.body.appendChild( view.element );

					const resetSpy = vi.spyOn( view.queryView, 'reset' );

					view.focusTracker.isFocused = true;
					view.focusTracker.isFocused = false;

					expect( resetSpy ).toHaveBeenCalledOnce();

					view.destroy();
					view.element.remove();
				} );

				it( 'does not reset the view when blurred if not configured', () => {
					const resetSpy = vi.spyOn( view.queryView, 'reset' );

					view.focusTracker.isFocused = true;
					view.focusTracker.isFocused = false;

					expect( resetSpy ).not.toHaveBeenCalled();
				} );
			} );
		} );
	} );
} );
