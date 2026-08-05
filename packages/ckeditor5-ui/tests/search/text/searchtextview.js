/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FocusTracker, KeystrokeHandler, Locale, keyCodes } from '@ckeditor/ckeditor5-utils';
import {
	FocusCycler,
	InputNumberView,
	InputTextView,
	LabeledFieldView,
	ListView,
	SearchInfoView,
	SearchTextView,
	View,
	ViewCollection,
	createLabeledInputNumber
} from '../../../src/index.js';

describe( 'SearchTextView', () => {
	let view, filteredView;

	beforeEach( () => {
		filteredView = new ListView();
		filteredView.filter = () => {
			return {
				resultsCount: 1,
				totalItemsCount: 5
			};
		};

		view = new SearchTextView( new Locale(), {
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
		it( 'creates and element from template with CSS classes and attributes', () => {
			expect( view.element.classList.contains( 'ck' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-search' ) ).toBe( true );
			expect( view.element.getAttribute( 'tabindex' ) ).toBe( '-1' );
		} );

		it( 'supports extra CSS class in the config', () => {
			const view = new SearchTextView( new Locale(), {
				filteredView,
				queryView: {
					label: 'foo'
				},
				class: 'bar'
			} );

			view.render();

			expect( view.element.classList.contains( 'bar' ) ).toBe( true );

			view.destroy();
		} );

		it( 'creates an instance of FocusTracker', () => {
			expect( view.focusTracker ).toBeInstanceOf( FocusTracker );
		} );

		it( 'creates an instance of KeystrokeHandler', () => {
			expect( view.keystrokes ).toBeInstanceOf( KeystrokeHandler );
		} );

		it( 'creates and instance of FocusCycler', () => {
			expect( view.focusCycler ).toBeInstanceOf( FocusCycler );
		} );

		it( 'assigns an instance of a view to #filteredView', () => {
			expect( view.filteredView ).toBe( filteredView );
		} );

		it( 'creates a #resultsView as a container for the #filteredView', () => {
			expect( view.resultsView ).toBeInstanceOf( View );

			expect( view.resultsView.element.classList.contains( 'ck' ) ).toBe( true );
			expect( view.resultsView.element.classList.contains( 'ck-search__results' ) ).toBe( true );

			expect( view.resultsView.children.first ).toBe( view.infoView );
			expect( view.resultsView.children.last ).toBe( filteredView );
		} );

		it( 'sets #resultsCount', () => {
			expect( view.resultsCount ).toBe( 1 );
		} );

		it( 'sets #totalItemsCount', () => {
			expect( view.totalItemsCount ).toBe( 5 );
		} );

		it( 'should update #resultsCount and #totalItemsCount upon #search event', () => {
			expect( view.resultsCount ).toBe( 1 );
			expect( view.totalItemsCount ).toBe( 5 );

			view.fire( 'search', { resultsCount: 5, totalItemsCount: 10 } );

			expect( view.resultsCount ).toBe( 5 );
			expect( view.totalItemsCount ).toBe( 10 );
		} );

		it( 'should have #children view collection', () => {
			expect( view.children ).toBeInstanceOf( ViewCollection );
		} );

		it( 'should have #focusableChildren view collection', () => {
			expect( view.focusableChildren ).toBeInstanceOf( ViewCollection );
		} );

		describe( '#queryView', () => {
			it( 'gets created as labeled text view if not configured otherwise', () => {
				expect( view.queryView ).toBeInstanceOf( LabeledFieldView );
				expect( view.queryView.fieldView ).toBeInstanceOf( InputTextView );
				expect( view.queryView.label ).toBe( 'test label' );
			} );

			it( 'gets created by a custom view creator configured by the user', () => {
				const view = new SearchTextView( new Locale(), {
					filteredView,
					queryView: {
						label: 'foo',
						creator: createLabeledInputNumber
					},
					class: 'bar'
				} );

				view.render();

				expect( view.queryView ).toBeInstanceOf( LabeledFieldView );
				expect( view.queryView.fieldView ).toBeInstanceOf( InputNumberView );

				view.destroy();
			} );

			it( 'shoud trigger #search() upon #input', () => {
				const spy = vi.spyOn( view, 'search' );

				view.queryView.fieldView.fire( 'input' );

				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'should reset the entire view if fired #reset', () => {
				const spy = vi.spyOn( view, 'reset' );

				view.queryView.fire( 'reset' );

				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'should be bound to #isEnabled', () => {
				expect( view.queryView.isEnabled ).toBe( true );

				view.isEnabled = false;

				expect( view.queryView.isEnabled ).toBe( false );
			} );
		} );

		describe( '#infoView', () => {
			let view;

			beforeEach( () => {
				filteredView.filter = () => {
					return {
						resultsCount: 5,
						totalItemsCount: 5
					};
				};

				view = new SearchTextView( new Locale(), {
					filteredView,
					queryView: {
						label: 'test label'
					}
				} );

				view.render();
				document.body.appendChild( view.element );
			} );

			afterEach( () => {
				view.destroy();
				view.element.remove();
			} );

			describe( 'if not specified', () => {
				it( 'is an instance of SearchInfoView if not specified in the config', () => {
					expect( view.infoView ).toBeInstanceOf( SearchInfoView );
					expect( view.infoView.isVisible ).toBe( false );
				} );

				it( 'comes with a default behavior for no search results', () => {
					filteredView.filter = () => {
						return {
							resultsCount: 0,
							totalItemsCount: 5
						};
					};

					const view = new SearchTextView( new Locale(), {
						filteredView,
						queryView: {
							label: 'test label'
						}
					} );

					view.render();
					view.search( 'will not be found' );

					expect( view.infoView.isVisible ).toBe( true );
					expect( view.infoView.primaryText ).toBe( 'No results found' );
					expect( view.infoView.secondaryText ).toBe( '' );

					view.destroy();
				} );

				it( 'comes with a default behavior for no searchable items', () => {
					filteredView.filter = () => {
						return {
							resultsCount: 0,
							totalItemsCount: 0
						};
					};

					const view = new SearchTextView( new Locale(), {
						filteredView,
						queryView: {
							label: 'test label'
						}
					} );

					view.render();

					expect( view.infoView.isVisible ).toBe( true );
					expect( view.infoView.primaryText ).toBe( 'No searchable items' );
					expect( view.infoView.secondaryText ).toBe( '' );

					view.destroy();
				} );

				it( 'allows customization of info texts', () => {
					filteredView.filter = () => {
						return {
							resultsCount: 0,
							totalItemsCount: 0
						};
					};

					const view = new SearchTextView( new Locale(), {
						filteredView,
						queryView: {
							label: 'test label'
						},
						infoView: {
							text: {
								notFound: {
									primary: 'foo',
									secondary: 'bar'
								},
								noSearchableItems: {
									primary: 'baz',
									secondary: 'qux'
								}
							}
						}
					} );

					view.render();

					expect( view.infoView.isVisible ).toBe( true );
					expect( view.infoView.primaryText ).toBe( 'baz' );
					expect( view.infoView.secondaryText ).toBe( 'qux' );

					filteredView.filter = () => {
						return {
							resultsCount: 0,
							totalItemsCount: 5
						};
					};

					view.search( 'test' );

					expect( view.infoView.isVisible ).toBe( true );
					expect( view.infoView.primaryText ).toBe( 'foo' );
					expect( view.infoView.secondaryText ).toBe( 'bar' );

					view.destroy();
				} );

				it( 'allows info texts specified as functions', () => {
					filteredView.filter = () => {
						return {
							resultsCount: 0,
							totalItemsCount: 0
						};
					};

					const dynamicLabelText = ( query, resultsCount, totalItemsCount ) =>
						`"${ query }" ${ resultsCount } of ${ totalItemsCount }`;

					const view = new SearchTextView( new Locale(), {
						filteredView,
						queryView: {
							label: 'test label'
						},
						infoView: {
							text: {
								notFound: {
									primary: dynamicLabelText,
									secondary: dynamicLabelText
								},
								noSearchableItems: {
									primary: dynamicLabelText,
									secondary: dynamicLabelText
								}
							}
						}
					} );

					view.render();

					expect( view.infoView.isVisible ).toBe( true );
					expect( view.infoView.primaryText ).toBe( '"" 0 of 0' );
					expect( view.infoView.secondaryText ).toBe( '"" 0 of 0' );

					filteredView.filter = () => {
						return {
							resultsCount: 0,
							totalItemsCount: 5
						};
					};

					view.search( 'test' );

					expect( view.infoView.isVisible ).toBe( true );
					expect( view.infoView.primaryText ).toBe( '"test" 0 of 5' );
					expect( view.infoView.secondaryText ).toBe( '"test" 0 of 5' );

					view.destroy();
				} );
			} );

			it( 'accpets a view from the configuration', () => {
				const customInfoView = new View();
				customInfoView.setTemplate( {
					tag: 'div',
					attributes: {
						class: 'custom'
					}
				} );

				const view = new SearchTextView( new Locale(), {
					filteredView,
					queryView: {
						label: 'test label'
					},
					infoView: {
						instance: customInfoView
					}
				} );

				view.render();

				expect( view.infoView ).toBe( customInfoView );
				expect( view.resultsView.children.first ).toBe( customInfoView );
				expect( view.resultsView.children.last ).toBe( filteredView );

				view.destroy();
			} );
		} );
	} );

	describe( 'render()', () => {
		describe( 'focus tracking and cycling', () => {
			it( 'should add #queryView and #resultsView to the #focusableChildren collection', () => {
				expect( view.focusableChildren.map( view => view ) ).toEqual( [
					view.queryView, view.resultsView
				] );
			} );

			describe( 'activates keyboard navigation', () => {
				it( 'makes "tab" focus the next focusable item', () => {
					const keyEvtData = {
						keyCode: keyCodes.tab,
						preventDefault: vi.fn(),
						stopPropagation: vi.fn()
					};

					// Mock the query input is focused.
					view.focusTracker.isFocused = true;
					view.focusTracker.focusedElement = view.queryView.element;

					const spy = vi.spyOn( view.resultsView, 'focus' );

					view.keystrokes.press( keyEvtData );
					expect( keyEvtData.preventDefault ).toHaveBeenCalledOnce();
					expect( keyEvtData.stopPropagation ).toHaveBeenCalledOnce();
					expect( spy ).toHaveBeenCalledOnce();
				} );

				it( 'makes "shift + tab" focus the previous focusable item', () => {
					const keyEvtData = {
						keyCode: keyCodes.tab,
						shiftKey: true,
						preventDefault: vi.fn(),
						stopPropagation: vi.fn()
					};

					// Mock the results are focused.
					view.focusTracker.isFocused = true;
					view.focusTracker.focusedElement = filteredView.element;

					const spy = vi.spyOn( view.resultsView, 'focus' );

					view.keystrokes.press( keyEvtData );
					expect( keyEvtData.preventDefault ).toHaveBeenCalledOnce();
					expect( keyEvtData.stopPropagation ).toHaveBeenCalledOnce();
					expect( spy ).toHaveBeenCalledOnce();
				} );

				it( 'should allow adding extra views to the focus cycling logic', () => {
					const anotherFocusableView = new View();

					anotherFocusableView.setTemplate( {
						tag: 'div',
						attributes: {
							tabindex: -1
						}
					} );

					anotherFocusableView.focus = vi.fn();

					anotherFocusableView.render();

					view.focusTracker.add( anotherFocusableView );
					view.focusableChildren.add( anotherFocusableView );
					view.element.appendChild( anotherFocusableView.element );

					// Mock the query input is focused.
					view.focusTracker.isFocused = true;
					view.focusTracker.focusedElement = view.queryView.element;

					const keyEvtData = {
						keyCode: keyCodes.tab,
						shiftKey: true,
						preventDefault: vi.fn(),
						stopPropagation: vi.fn()
					};

					view.keystrokes.press( keyEvtData );
					expect( anotherFocusableView.focus ).toHaveBeenCalledOnce();
				} );
			} );

			it( 'intercepts the arrow* events and overrides the default toolbar behavior', () => {
				const keyEvtData = {
					stopPropagation: vi.fn()
				};

				keyEvtData.keyCode = keyCodes.arrowdown;
				view.keystrokes.press( keyEvtData );
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 1 );

				keyEvtData.keyCode = keyCodes.arrowup;
				view.keystrokes.press( keyEvtData );
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 2 );

				keyEvtData.keyCode = keyCodes.arrowleft;
				view.keystrokes.press( keyEvtData );
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 3 );

				keyEvtData.keyCode = keyCodes.arrowright;
				view.keystrokes.press( keyEvtData );
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 4 );
			} );
		} );

		it( 'should add #queryView and #resultsView to the #children view collection', () => {
			expect( view.children.map( child => child ) ).toEqual( [ view.queryView, view.resultsView ] );

			expect( view.element.firstChild ).toBe( view.queryView.element );
			expect( view.element.lastChild ).toBe( view.resultsView.element );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the #queryView', () => {
			const spy = vi.spyOn( view.queryView, 'focus' );

			view.focus();

			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'reset()', () => {
		it( 'resets the #queryView', () => {
			const spy = vi.spyOn( view.queryView, 'reset' );

			view.reset();

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'resets the search results', () => {
			const spy = vi.spyOn( view, 'search' );

			view.reset();

			expect( spy ).toHaveBeenCalledOnce();
			expect( spy ).toHaveBeenCalledWith( '' );
		} );

		it( 'resets the list scroll', () => {
			const list = view.filteredView;
			const spy = vi.spyOn( list.element, 'scrollTo' );

			view.reset();

			expect( spy ).toHaveBeenCalledOnce();
			expect( spy ).toHaveBeenCalledWith( 0, 0 );
		} );
	} );

	describe( 'search()', () => {
		it( 'should escape the query when creating a RegExp to avoid mismatches', () => {
			const spy = vi.spyOn( filteredView, 'filter' );

			view.search( 'foo[ar]' );
			expect( spy ).toHaveBeenCalledOnce();
			expect( spy ).toHaveBeenCalledWith( /foo\[ar\]/gi );

			view.search( 'foo/bar' );
			expect( spy ).toHaveBeenCalledTimes( 2 );
			expect( spy.mock.calls[ 1 ][ 0 ] ).toEqual( /foo\/bar/gi );
		} );

		it( 'should filter the #filteredView', () => {
			const spy = vi.spyOn( filteredView, 'filter' );

			view.search( 'foo' );

			expect( spy ).toHaveBeenCalledOnce();
			expect( spy ).toHaveBeenCalledWith( /foo/gi );
		} );

		it( 'should fire the #search event with the query and search stats', () => {
			filteredView.filter = () => {
				return {
					resultsCount: 1,
					totalItemsCount: 10
				};
			};

			return new Promise( resolve => {
				view.on( 'search', ( evt, data ) => {
					expect( data ).toEqual( {
						query: 'foo',
						resultsCount: 1,
						totalItemsCount: 10
					} );

					resolve();
				} );

				view.search( 'foo' );
			} );
		} );
	} );
} );
