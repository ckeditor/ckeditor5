/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ListPropertiesView } from '../../../src/listproperties/ui/listpropertiesview.js';

import {
	ButtonView,
	CollapsibleView,
	FocusCycler,
	LabeledFieldView,
	SwitchButtonView,
	View,
	ViewCollection
} from '@ckeditor/ckeditor5-ui';

import {
	FocusTracker,
	KeystrokeHandler,
	keyCodes
} from '@ckeditor/ckeditor5-utils';

describe( 'ListPropertiesView', () => {
	let view, locale;

	beforeEach( () => {
		locale = { t: text => text };
		view = new ListPropertiesView( locale, {
			enabledProperties: {
				styles: true,
				startIndex: true,
				reversed: true
			},
			styleButtonViews: [
				new ButtonView( locale ),
				new ButtonView( locale ),
				new ButtonView( locale ),
				new ButtonView( locale ),
				new ButtonView( locale )
			],
			styleGridAriaLabel: 'Foo'
		} );

		view.render();
		document.body.appendChild( view.element );
	} );

	afterEach( () => {
		view.element.remove();
		view.destroy();
	} );

	describe( 'constructor()', () => {
		describe( 'template', () => {
			it( 'should create an #element from the template', () => {
				expect( view.element.tagName ).toBe( 'DIV' );
				expect( view.element.classList.contains( 'ck' ) ).toBe( true );
				expect( view.element.classList.contains( 'ck-list-properties' ) ).toBe( true );
				expect( view.element.classList.contains( 'ck-list-properties_with-numbered-properties' ) ).toBe( true );
			} );

			describe( 'when styles, start index, and reversed properties are enabled', () => {
				it( 'should use collapsible to host property fields', () => {
					expect( view.children.first ).toBe( view.stylesView );
					expect( view.children.last ).toBeInstanceOf( CollapsibleView );
					expect( view.children.last.label ).toBe( 'List properties' );
					expect( view.children.last.isCollapsed ).toBe( true );
					expect( view.children.last.children.first ).toBe( view.startIndexFieldView );
					expect( view.children.last.children.last ).toBe( view.reversedSwitchButtonView );
				} );

				it( 'should keep the collapsible button enabled as longs as either start index or reversed field is enabled', () => {
					const collapsibleView = view.children.last;

					expect( collapsibleView.buttonView.isEnabled, 'A' ).toBe( true );

					view.startIndexFieldView.isEnabled = false;
					view.reversedSwitchButtonView.isEnabled = true;
					expect( collapsibleView.buttonView.isEnabled, 'B' ).toBe( true );

					view.startIndexFieldView.isEnabled = true;
					view.reversedSwitchButtonView.isEnabled = false;
					expect( collapsibleView.buttonView.isEnabled, 'C' ).toBe( true );

					view.startIndexFieldView.isEnabled = true;
					view.reversedSwitchButtonView.isEnabled = true;
					expect( collapsibleView.buttonView.isEnabled, 'D' ).toBe( true );

					view.startIndexFieldView.isEnabled = false;
					view.reversedSwitchButtonView.isEnabled = false;
					expect( collapsibleView.buttonView.isEnabled, 'E' ).toBe( false );
				} );

				it( 'should automatically collapse the collapsible when its button gets gets disabled', () => {
					const collapsibleView = view.children.last;

					collapsibleView.isCollapsed = false;

					view.startIndexFieldView.isEnabled = false;
					view.reversedSwitchButtonView.isEnabled = true;
					expect( collapsibleView.isCollapsed, 'A' ).toBe( false );

					view.startIndexFieldView.isEnabled = true;
					view.reversedSwitchButtonView.isEnabled = false;
					expect( collapsibleView.isCollapsed, 'B' ).toBe( false );

					view.startIndexFieldView.isEnabled = false;
					view.reversedSwitchButtonView.isEnabled = false;
					expect( collapsibleView.isCollapsed, 'C' ).toBe( true );

					// It should work only one way. It should not uncollapse when property fields get enabled.
					view.startIndexFieldView.isEnabled = true;
					view.reversedSwitchButtonView.isEnabled = true;
					expect( collapsibleView.isCollapsed, 'D' ).toBe( true );
				} );
			} );

			describe( 'when styles are disabled but start index and reversed properties are enabled', () => {
				it( 'should have no #stylesView and get a specific CSS class', () => {
					const view = new ListPropertiesView( locale, {
						enabledProperties: {
							startIndex: true,
							reversed: true
						},
						styleButtonViews: [],
						styleGridAriaLabel: 'Foo'
					} );

					view.render();

					expect( view.stylesView ).toBeNull();
					expect( view.element.classList.contains( 'ck-list-properties_without-styles' ) ).toBe( true );

					view.destroy();
				} );

				it( 'should not use CollapsibleView for #startIndexFieldView and #reversedSwitchButtonView', () => {
					const view = new ListPropertiesView( locale, {
						enabledProperties: {
							startIndex: true,
							reversed: true
						},
						styleButtonViews: [],
						styleGridAriaLabel: 'Foo'
					} );

					view.render();

					expect( view.children.first ).toBe( view.startIndexFieldView );
					expect( view.children.last ).toBe( view.reversedSwitchButtonView );

					view.destroy();
				} );
			} );

			describe( 'when only styles property is enabled', () => {
				it( 'should not have no #startIndexFieldView, no #reversedSwitchButtonView, and no specific CSS class', () => {
					const view = new ListPropertiesView( locale, {
						enabledProperties: {
							styles: true
						},
						styleButtonViews: [
							new ButtonView( locale )
						],
						styleGridAriaLabel: 'Foo'
					} );

					view.render();

					expect( view.startIndexFieldView ).toBeNull();
					expect( view.reversedSwitchButtonView ).toBeNull();
					expect( view.children.first ).toBe( view.stylesView );
					expect( view.children.last ).toBe( view.stylesView );
					expect( view.element.classList.contains( 'ck-list-properties_with-numbered-properties' ) ).toBe( false );

					view.destroy();
				} );
			} );

			describe( 'when only start index property is enabled', () => {
				it( 'should not have no #stylesView, no #reversedSwitchButtonView', () => {
					const view = new ListPropertiesView( locale, {
						enabledProperties: {
							startIndex: true
						},
						styleButtonViews: [],
						styleGridAriaLabel: 'Foo'
					} );

					view.render();

					expect( view.stylesView ).toBeNull();
					expect( view.startIndexFieldView ).toBeInstanceOf( LabeledFieldView );
					expect( view.reversedSwitchButtonView ).toBeNull();
					expect( view.children.first ).toBe( view.startIndexFieldView );
					expect( view.children.last ).toBe( view.startIndexFieldView );
					expect( view.element.classList.contains( 'ck-list-properties_with-numbered-properties' ) ).toBe( true );

					view.destroy();
				} );
			} );

			describe( 'when only reversed property is enabled', () => {
				it( 'should not have no #stylesView, no #startIndexFieldView', () => {
					const view = new ListPropertiesView( locale, {
						enabledProperties: {
							reversed: true
						},
						styleButtonViews: [],
						styleGridAriaLabel: 'Foo'
					} );

					view.render();

					expect( view.stylesView ).toBeNull();
					expect( view.startIndexFieldView ).toBeNull();
					expect( view.reversedSwitchButtonView ).toBeInstanceOf( SwitchButtonView );
					expect( view.children.first ).toBe( view.reversedSwitchButtonView );
					expect( view.children.last ).toBe( view.reversedSwitchButtonView );
					expect( view.element.classList.contains( 'ck-list-properties_with-numbered-properties' ) ).toBe( true );

					view.destroy();
				} );
			} );
		} );

		it( 'should have a #children collection', () => {
			expect( view.children ).toBeInstanceOf( ViewCollection );
		} );

		it( 'should have #stylesView', () => {
			expect( view.stylesView ).toBeInstanceOf( View );
		} );

		it( 'should have #startIndexFieldView', () => {
			expect( view.startIndexFieldView ).toBeInstanceOf( LabeledFieldView );
		} );

		it( 'should have #reversedSwitchButtonView', () => {
			expect( view.reversedSwitchButtonView ).toBeInstanceOf( SwitchButtonView );
		} );

		it( 'should have #focusTracker', () => {
			expect( view.focusTracker ).toBeInstanceOf( FocusTracker );
		} );

		it( 'should have #keystrokes', () => {
			expect( view.keystrokes ).toBeInstanceOf( KeystrokeHandler );
		} );

		it( 'should have #focusables', () => {
			expect( view.focusables ).toBeInstanceOf( ViewCollection );
		} );

		it( 'should have #focusCycler', () => {
			expect( view.focusCycler ).toBeInstanceOf( FocusCycler );
		} );

		describe( '#stylesView', () => {
			describe( 'template', () => {
				it( 'should create an element from the template', () => {
					expect( view.stylesView.element.tagName ).toBe( 'DIV' );
					expect( view.stylesView.element.classList.contains( 'ck' ) ).toBe( true );
					expect( view.stylesView.element.classList.contains( 'ck-list-styles-list' ) ).toBe( true );
					expect( view.stylesView.element.getAttribute( 'aria-label' ) ).toBe( 'Foo' );
				} );

				it( 'should popupate the view with style buttons', () => {
					expect( view.stylesView.children.length ).toBe( 5 );
					expect( view.stylesView.children.get( 0 ) ).toBeInstanceOf( ButtonView );
					expect( view.stylesView.children.get( 1 ) ).toBeInstanceOf( ButtonView );
					expect( view.stylesView.element.firstChild.classList.contains( 'ck-button' ) ).toBe( true );
					expect( view.stylesView.element.lastChild.classList.contains( 'ck-button' ) ).toBe( true );
				} );
			} );
		} );

		describe( '#startIndexFieldView', () => {
			it( 'should have basic properties', () => {
				expect( view.startIndexFieldView.label ).toBe( 'Start at' );
				expect( view.startIndexFieldView.class ).toBe( 'ck-numbered-list-properties__start-index' );
				expect( view.startIndexFieldView.fieldView.min ).toBe( 0 );
				expect( view.startIndexFieldView.fieldView.step ).toBe( 1 );
				expect( view.startIndexFieldView.fieldView.value ).toBe( 1 );
				expect( view.startIndexFieldView.fieldView.inputMode ).toBe( 'numeric' );
			} );
		} );

		describe( '#reversedSwitchButtonView', () => {
			it( 'should have basic properties', () => {
				expect( view.reversedSwitchButtonView.withText ).toBe( true );
				expect( view.reversedSwitchButtonView.label ).toBe( 'Reversed order' );
				expect( view.reversedSwitchButtonView.class ).toBe( 'ck-numbered-list-properties__reversed-order' );
			} );
		} );
	} );

	describe( 'render()', () => {
		describe( 'focus cycling, tracking and keyboard support', () => {
			describe( 'when styles and all numbered list properties are enabled', () => {
				it( 'should register child views in #focusables', () => {
					expect( view.focusables.map( f => f ) ).toEqual( expect.arrayContaining( [
						view.children.first,
						view.children.last.buttonView,
						view.startIndexFieldView,
						view.reversedSwitchButtonView
					] ) );
				} );

				it( 'should register child views\' #element in #focusTracker', () => {
					const view = new ListPropertiesView( locale, {
						enabledProperties: {
							styles: true,
							startIndex: true,
							reversed: true
						},
						styleButtonViews: [
							new ButtonView( locale ),
							new ButtonView( locale )
						],
						styleGridAriaLabel: 'Foo'
					} );

					const spyView = vi.spyOn( view.focusTracker, 'add' );

					view.render();

					expect( spyView.mock.calls[ 0 ][ 0 ] ).toBe( view.children.first.element );
					expect( spyView.mock.calls[ 1 ][ 0 ] ).toBe( view.children.last.buttonView.element );
					expect( spyView.mock.calls[ 2 ][ 0 ] ).toBe( view.startIndexFieldView.element );
					expect( spyView.mock.calls[ 3 ][ 0 ] ).toBe( view.reversedSwitchButtonView.element );

					view.destroy();
				} );

				it( 'should register style view\'s items in style view\'s focus tracker', () => {
					const view = new ListPropertiesView( locale, {
						enabledProperties: {
							styles: true,
							startIndex: true,
							reversed: true
						},
						styleButtonViews: [
							new ButtonView( locale ),
							new ButtonView( locale )
						],
						styleGridAriaLabel: 'Foo'
					} );

					const spyStylesView = vi.spyOn( view.stylesView.focusTracker, 'add' );

					view.render();

					expect( spyStylesView.mock.calls[ 0 ][ 0 ] ).toBe( view.stylesView.children.first.element );
					expect( spyStylesView.mock.calls[ 1 ][ 0 ] ).toBe( view.stylesView.children.last.element );

					view.destroy();
				} );
			} );

			describe( 'when styles grid is disabled', () => {
				it( 'should register child views in #focusables', () => {
					const view = new ListPropertiesView( locale, {
						enabledProperties: {
							startIndex: true,
							reversed: true
						},
						styleButtonViews: [],
						styleGridAriaLabel: 'Foo'
					} );

					view.render();

					expect( view.focusables.map( f => f ) ).toEqual( expect.arrayContaining( [
						view.startIndexFieldView,
						view.reversedSwitchButtonView
					] ) );

					view.destroy();
				} );

				it( 'should register child views\' #element in #focusTracker', () => {
					const view = new ListPropertiesView( locale, {
						enabledProperties: {
							startIndex: true,
							reversed: true
						},
						styleButtonViews: [],
						styleGridAriaLabel: 'Foo'
					} );

					const spy = vi.spyOn( view.focusTracker, 'add' );

					view.render();

					expect( spy.mock.calls[ 0 ][ 0 ] ).toBe( view.startIndexFieldView.element );
					expect( spy.mock.calls[ 1 ][ 0 ] ).toBe( view.reversedSwitchButtonView.element );

					view.destroy();
				} );
			} );

			it( 'starts listening for #keystrokes coming from #element', () => {
				const view = new ListPropertiesView( locale, {
					enabledProperties: {
						styles: true,
						startIndex: true,
						reversed: true
					},
					styleButtonViews: [
						new ButtonView( locale ),
						new ButtonView( locale )
					],
					styleGridAriaLabel: 'Foo'
				} );

				const spy = vi.spyOn( view.keystrokes, 'listenTo' );

				view.render();
				expect( spy ).toHaveBeenCalledOnce();
				expect( spy ).toHaveBeenCalledWith( view.element );

				view.destroy();
			} );

			describe( 'activates keyboard navigation in the properties view', () => {
				it( 'so "tab" focuses the next focusable item', () => {
					const keyEvtData = {
						keyCode: keyCodes.tab,
						preventDefault: vi.fn(),
						stopPropagation: vi.fn()
					};

					// Mock the styles view is focused.
					view.focusTracker.isFocused = true;
					view.focusTracker.focusedElement = view.children.first.element;

					// Spy the next view which in this case is the ListProperties button
					const spy = vi.spyOn( view.children.last.buttonView, 'focus' );

					view.keystrokes.press( keyEvtData );
					expect( keyEvtData.preventDefault ).toHaveBeenCalledOnce();
					expect( keyEvtData.stopPropagation ).toHaveBeenCalledOnce();
					expect( spy ).toHaveBeenCalledOnce();
				} );

				it( 'so "shift + tab" focuses the previous focusable item', () => {
					const keyEvtData = {
						keyCode: keyCodes.tab,
						shiftKey: true,
						preventDefault: vi.fn(),
						stopPropagation: vi.fn()
					};

					// Mock the styles view is focused.
					view.focusTracker.isFocused = true;
					view.focusTracker.focusedElement = view.children.first.element;
					view.children.last.isCollapsed = false;

					// Spy the previous view which in this case is the Reversed order switch button
					const spy = vi.spyOn( view.reversedSwitchButtonView, 'focus' );

					view.keystrokes.press( keyEvtData );
					expect( keyEvtData.preventDefault ).toHaveBeenCalledOnce();
					expect( keyEvtData.stopPropagation ).toHaveBeenCalledOnce();
					expect( spy ).toHaveBeenCalledOnce();
				} );

				describe( 'keyboard navigation in the styles grid', () => {
					it( '"arrow right" should focus the next focusable style button', () => {
						const keyEvtData = {
							keyCode: keyCodes.arrowright,
							preventDefault: vi.fn(),
							stopPropagation: vi.fn()
						};

						// Mock the first style button is focused.
						view.stylesView.focusTracker.isFocused = true;
						view.stylesView.focusTracker.focusedElement = view.stylesView.children.first.element;

						const spy = vi.spyOn( view.stylesView.children.get( 1 ), 'focus' );

						view.stylesView.keystrokes.press( keyEvtData );
						expect( keyEvtData.preventDefault ).toHaveBeenCalledOnce();
						expect( keyEvtData.stopPropagation ).toHaveBeenCalledOnce();
						expect( spy ).toHaveBeenCalledOnce();
					} );

					it( '"arrow down" should focus the focusable style button in the second row', () => {
						const keyEvtData = {
							keyCode: keyCodes.arrowdown,
							preventDefault: vi.fn(),
							stopPropagation: vi.fn()
						};

						// Set explicit grid layout so the headless browser can compute geometry.
						// Use explicit pixel values — repeat() notation resolves to 2 tokens when split by space,
						// making numberOfColumns always 2 regardless of the actual column count.
						view.stylesView.element.style.gridTemplateColumns = '1px 1px 1px 1px';

						// Mock the first style button is focused.
						view.stylesView.focusTracker.isFocused = true;
						view.stylesView.focusTracker.focusedElement = view.stylesView.children.first.element;

						const spy = vi.spyOn( view.stylesView.children.get( 4 ), 'focus' );

						view.stylesView.keystrokes.press( keyEvtData );
						expect( keyEvtData.preventDefault ).toHaveBeenCalledOnce();
						expect( keyEvtData.stopPropagation ).toHaveBeenCalledOnce();
						expect( spy ).toHaveBeenCalledOnce();
					} );

					// https://github.com/ckeditor/ckeditor5/issues/12340
					it( 'should work regardless of the geometry of the grid', () => {
						view.stylesView.element.style.gridTemplateColumns = 'repeat(2, 1fr)';

						const keyEvtData = {
							keyCode: keyCodes.arrowdown,
							preventDefault: vi.fn(),
							stopPropagation: vi.fn()
						};

						// Mock the first style button is focused.
						view.stylesView.focusTracker.isFocused = true;
						view.stylesView.focusTracker.focusedElement = view.stylesView.children.first.element;

						const spy = vi.spyOn( view.stylesView.children.get( 2 ), 'focus' );

						view.stylesView.keystrokes.press( keyEvtData );
						expect( keyEvtData.preventDefault ).toHaveBeenCalledOnce();
						expect( keyEvtData.stopPropagation ).toHaveBeenCalledOnce();
						expect( spy ).toHaveBeenCalledOnce();
					} );
				} );
			} );

			it( 'intercepts the arrow* events and overrides the default (parent) toolbar behavior', () => {
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
	} );

	describe( 'focus()', () => {
		it( 'should focus the first button in #stylesView (when present)', () => {
			const spy = vi.spyOn( view.stylesView.children.first, 'focus' );

			view.focus();

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should focus the #startIndexFieldView when there are no style buttons', () => {
			const view = new ListPropertiesView( locale, {
				enabledProperties: {
					startIndex: true,
					reversed: true
				},
				styleButtonViews: [],
				styleGridAriaLabel: 'Foo'
			} );

			view.render();
			document.body.appendChild( view.element );

			const spy = vi.spyOn( view.startIndexFieldView, 'focus' );

			view.focus();
			expect( spy ).toHaveBeenCalledOnce();

			view.element.remove();
			view.destroy();
		} );

		it( 'should focus the #reversedSwitchButtonView if no #stylesView and no #startIndexFieldView', () => {
			const view = new ListPropertiesView( locale, {
				enabledProperties: {
					reversed: true
				},
				styleButtonViews: [],
				styleGridAriaLabel: 'Foo'
			} );

			view.render();
			document.body.appendChild( view.element );

			const spy = vi.spyOn( view.reversedSwitchButtonView, 'focus' );

			view.focus();
			expect( spy ).toHaveBeenCalledOnce();

			view.element.remove();
			view.destroy();
		} );

		it( 'should focus first active button if present in the styles view', () => {
			const view = new ListPropertiesView( locale, {
				enabledProperties: {
					styles: true,
					startIndex: true,
					reversed: true
				},
				styleButtonViews: [
					new ButtonView( locale ),
					new ButtonView( locale ),
					new ButtonView( locale )
				],
				styleGridAriaLabel: 'Foo'
			} );

			view.render();
			document.body.appendChild( view.element );

			view.stylesView.children.get( 1 ).isOn = true;

			const spy = vi.spyOn( view.stylesView.children.get( 1 ), 'focus' );

			view.focus();
			expect( spy ).toHaveBeenCalledOnce();

			view.element.remove();
			view.destroy();
		} );
	} );

	describe( 'focusLast()', () => {
		it( 'should focus the #reversedSwitchButtonView when present and visible', () => {
			const spy = vi.spyOn( view.reversedSwitchButtonView, 'focus' );

			view.children.last.isCollapsed = false;
			view.focusLast();

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should focus the collapse button when numbered list properies are collapsed', () => {
			const spy = vi.spyOn( view.children.last.buttonView, 'focus' );

			view.children.last.isCollapsed = true;
			view.focusLast();

			expect( spy ).toHaveBeenCalledOnce();
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

	describe( 'DOM bindings', () => {
		describe( 'styles view', () => {
			it( 'should delegate #execute to the properties view', () => {
				const spy = vi.fn();

				view.on( 'execute', spy );
				view.stylesView.children.get( 0 ).fire( 'execute' );

				expect( spy ).toHaveBeenCalledOnce();
			} );
		} );

		describe( '#startIndexFieldView', () => {
			it( 'should fire #listStart upon #input', () => {
				const spy = vi.fn();
				view.on( 'listStart', spy );

				view.startIndexFieldView.fieldView.value = '123';
				view.startIndexFieldView.fieldView.fire( 'input' );

				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'should not fire #listStart upon #input if the field is empty', () => {
				const spy = vi.fn();
				view.on( 'listStart', spy );

				view.startIndexFieldView.fieldView.value = '';
				view.startIndexFieldView.fieldView.fire( 'input' );

				expect( spy ).not.toHaveBeenCalled();
			} );

			it( 'should not fire #listStart upon #input but display an error if the field is invalid', () => {
				const spy = vi.fn();
				view.on( 'listStart', spy );

				view.startIndexFieldView.fieldView.value = '-5';
				view.startIndexFieldView.fieldView.fire( 'input' );

				expect( spy ).not.toHaveBeenCalled();
				expect( view.startIndexFieldView.errorText ).toBe( 'Start index must be greater than 0.' );
			} );

			it( 'should not fire #listStart upon #input but display an error if the numeric value is NaN', () => {
				const spy = vi.fn();
				view.on( 'listStart', spy );

				view.startIndexFieldView.fieldView.value = '3e';
				view.startIndexFieldView.fieldView.fire( 'input' );

				expect( spy ).not.toHaveBeenCalled();
				expect( view.startIndexFieldView.errorText ).toBe( 'Invalid start index value.' );
			} );

			it( 'should hide an error and proceed to fire #listStart when previously invalid value gets corrected', () => {
				const spy = vi.fn();
				view.on( 'listStart', spy );

				// Check for error.
				view.startIndexFieldView.fieldView.value = '3e';
				view.startIndexFieldView.fieldView.fire( 'input' );

				expect( spy ).not.toHaveBeenCalled();
				expect( view.startIndexFieldView.errorText ).toBe( 'Invalid start index value.' );

				// And revert to valid state (clear error).
				view.startIndexFieldView.fieldView.value = '32';
				view.startIndexFieldView.fieldView.fire( 'input' );

				expect( spy ).toHaveBeenCalledOnce();
				expect( view.startIndexFieldView.errorText ).toBeNull();
			} );
		} );

		describe( '#reversedSwitchButtonView', () => {
			it( 'should fire #listReversed when executed', () => {
				const spy = vi.fn();
				view.on( 'listReversed', spy );

				view.reversedSwitchButtonView.fire( 'execute' );

				expect( spy ).toHaveBeenCalledOnce();
			} );
		} );
	} );
} );
