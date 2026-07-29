/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { IconEraser, IconCheck, IconCancel } from '@ckeditor/ckeditor5-icons';
import { ColorSelectorView } from './../../src/colorselector/colorselectorview.js';
import { ColorTileView } from '../../src/colorgrid/colortileview.js';
import { FocusCycler } from '../../src/focuscycler.js';
import { ColorPickerView } from '../../src/colorpicker/colorpickerview.js';
import { ColorGridsFragmentView } from '../../src/colorselector/colorgridsfragmentview.js';

import { Collection, FocusTracker, KeystrokeHandler, keyCodes, env } from '@ckeditor/ckeditor5-utils';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { _setModelData } from '@ckeditor/ckeditor5-engine';

const colorDefinitions = [
	{
		color: '#000',
		label: 'Black',
		options: {
			hasBorder: false
		}
	},
	{
		color: 'rgb(255, 255, 255)',
		label: 'White',
		options: {
			hasBorder: true
		}
	},
	{
		color: 'red',
		label: 'Red',
		options: {
			hasBorder: false
		}
	}
];

describe( 'ColorSelectorView', () => {
	let locale, colorSelectorView;

	beforeEach( () => {
		locale = { t() {} };
		colorSelectorView = new ColorSelectorView( locale, {
			colors: colorDefinitions,
			columns: 5,
			removeButtonLabel: 'Remove color',
			documentColorsLabel: 'Document colors',
			documentColorsCount: 4,
			colorPickerViewConfig: {
				format: 'hsl'
			}
		} );
		// Grids rendering is deferred (https://github.com/ckeditor/ckeditor5/issues/6192) therefore render happens before appending grids.
		colorSelectorView.render();
		colorSelectorView._appendColorGridsFragment();

		document.body.appendChild( colorSelectorView.element );
	} );

	afterEach( () => {
		colorSelectorView.destroy();
		colorSelectorView.element.remove();
	} );

	describe( 'constructor()', () => {
		it( 'should store colors\' definitions', () => {
			expect( colorSelectorView.colorGridsFragmentView.colorDefinitions ).toBeInstanceOf( Array );
			expect( colorSelectorView.colorGridsFragmentView.colorDefinitions ).toEqual( colorDefinitions );
		} );

		it( 'should create focus tracker', () => {
			expect( colorSelectorView.focusTracker ).toBeInstanceOf( FocusTracker );
		} );

		it( 'should create keystroke handler', () => {
			expect( colorSelectorView.keystrokes ).toBeInstanceOf( KeystrokeHandler );
		} );

		it( 'should create observable for selected color', () => {
			expect( colorSelectorView.selectedColor ).toBeUndefined();

			colorSelectorView.set( 'selectedColor', 'white' );

			expect( colorSelectorView.selectedColor ).toBe( 'white' );
		} );

		it( 'should set label for the remove color button', () => {
			expect( colorSelectorView.colorGridsFragmentView._removeButtonLabel ).toBe( 'Remove color' );
		} );

		it( 'should set number of drawn columns', () => {
			expect( colorSelectorView.colorGridsFragmentView.columns ).toBe( 5 );
		} );

		it( 'should create collection of document colors', () => {
			expect( colorSelectorView.colorGridsFragmentView.documentColors ).toBeInstanceOf( Collection );
		} );

		it( 'should set maximum number of document colors', () => {
			expect( colorSelectorView.colorGridsFragmentView.documentColorsCount ).toBe( 4 );
		} );

		it( 'should create focus cycler', () => {
			expect( colorSelectorView._focusCycler ).toBeInstanceOf( FocusCycler );
		} );

		it( 'should apply correct classes', () => {
			expect( colorSelectorView.element.classList.contains( 'ck' ) ).toBe( true );
			expect( colorSelectorView.element.classList.contains( 'ck-color-selector' ) ).toBe( true );
		} );

		it( 'should have correct amount of children', () => {
			expect( colorSelectorView.colorGridsFragmentView.items.length ).toBe( 4 );
		} );

		it( 'should have 1 item', () => {
			expect( colorSelectorView.items.length ).toBe( 1 );
		} );
	} );

	describe( 'ColorSelectorView components', () => {
		beforeEach( () => {
			colorSelectorView._appendColorPickerFragment();
		} );

		describe( 'colorGridsFragmentView', () => {
			it( 'should have proper classname', () => {
				const colorSelector = colorSelectorView.colorGridsFragmentView;
				expect( colorSelector.element.classList.contains( 'ck-color-grids-fragment' ) ).toBe( true );
			} );
		} );

		describe( 'colorPickerFragmentView', () => {
			it( 'should have proper classname', () => {
				const colorPicker = colorSelectorView.colorPickerFragmentView;
				expect( colorPicker.element.classList.contains( 'ck-color-picker-fragment' ) ).toBe( true );
			} );
		} );

		describe( 'showColorGridsFragment()', () => {
			it( 'should do nothing if grids are already visible', () => {
				colorSelectorView.showColorGridsFragment();

				expect( colorSelectorView.colorGridsFragmentView.isVisible ).toBe( true );

				const gridsFocusSpy = vi.spyOn( colorSelectorView.colorGridsFragmentView, 'focus' );
				const isPickerVisibleSpy = vi.fn();
				const areGridsVisibleSpy = vi.fn();

				colorSelectorView.colorGridsFragmentView.on( 'change:isVisible', areGridsVisibleSpy );
				colorSelectorView.colorPickerFragmentView.on( 'change:isVisible', isPickerVisibleSpy );

				colorSelectorView.showColorGridsFragment();

				expect( areGridsVisibleSpy ).not.toHaveBeenCalled();
				expect( gridsFocusSpy ).not.toHaveBeenCalled();
				expect( isPickerVisibleSpy ).not.toHaveBeenCalled();
			} );

			it( 'should show the grids first, then focus them, then hide the picker', () => {
				colorSelectorView.showColorPickerFragment();

				const callOrder = [];
				const originalGridsFocus = colorSelectorView.colorGridsFragmentView.focus.bind( colorSelectorView.colorGridsFragmentView );

				vi.spyOn( colorSelectorView.colorGridsFragmentView, 'focus' ).mockImplementation( ( ...args ) => {
					callOrder.push( 'gridsFocus' );
					return originalGridsFocus( ...args );
				} );
				const areGridsVisibleSpy = vi.fn( () => callOrder.push( 'areGridsVisible' ) );
				const isPickerVisibleSpy = vi.fn( () => callOrder.push( 'isPickerVisible' ) );

				colorSelectorView.colorGridsFragmentView.on( 'change:isVisible', areGridsVisibleSpy );
				colorSelectorView.colorPickerFragmentView.on( 'change:isVisible', isPickerVisibleSpy );

				colorSelectorView.showColorGridsFragment();

				expect( callOrder ).toEqual( [ 'areGridsVisible', 'gridsFocus', 'isPickerVisible' ] );

				expect( colorSelectorView.colorGridsFragmentView.isVisible ).toBe( true );
				expect( colorSelectorView.colorPickerFragmentView.isVisible ).toBe( false );
			} );
		} );

		describe( 'showColorPickerFragment()', () => {
			it( 'should do nothing if the picker is already visible', () => {
				colorSelectorView.showColorPickerFragment();

				expect( colorSelectorView.colorPickerFragmentView.isVisible ).toBe( true );

				const pickerFocusSpy = vi.spyOn( colorSelectorView.colorPickerFragmentView, 'focus' );
				const isPickerVisibleSpy = vi.fn();
				const areGridsVisibleSpy = vi.fn();

				colorSelectorView.colorGridsFragmentView.on( 'change:isVisible', areGridsVisibleSpy );
				colorSelectorView.colorPickerFragmentView.on( 'change:isVisible', isPickerVisibleSpy );

				colorSelectorView.showColorPickerFragment();

				expect( areGridsVisibleSpy ).not.toHaveBeenCalled();
				expect( pickerFocusSpy ).not.toHaveBeenCalled();
				expect( isPickerVisibleSpy ).not.toHaveBeenCalled();
			} );

			it( 'should show the picker first, then focus it, then hide the grids', () => {
				const callOrder = [];
				const { colorPickerFragmentView } = colorSelectorView;
				const originalPickerFocus = colorPickerFragmentView.focus.bind( colorPickerFragmentView );

				vi.spyOn( colorSelectorView.colorPickerFragmentView, 'focus' ).mockImplementation( ( ...args ) => {
					callOrder.push( 'pickerFocus' );
					return originalPickerFocus( ...args );
				} );
				const isPickerVisibleSpy = vi.fn( () => callOrder.push( 'isPickerVisible' ) );
				const areGridsVisibleSpy = vi.fn( () => callOrder.push( 'areGridsVisible' ) );

				colorSelectorView.colorGridsFragmentView.on( 'change:isVisible', areGridsVisibleSpy );
				colorSelectorView.colorPickerFragmentView.on( 'change:isVisible', isPickerVisibleSpy );

				colorSelectorView.showColorPickerFragment();

				expect( callOrder ).toEqual( [ 'isPickerVisible', 'pickerFocus', 'areGridsVisible' ] );

				expect( colorSelectorView.colorGridsFragmentView.isVisible ).toBe( false );
				expect( colorSelectorView.colorPickerFragmentView.isVisible ).toBe( true );
			} );
		} );
	} );

	describe( '_appendColorGridsFragment()', () => {
		it( 'shouldn\'t duplicate views if called more than once', () => {
			colorSelectorView._appendColorGridsFragment();
			colorSelectorView._appendColorGridsFragment();
			expect( colorSelectorView.colorGridsFragmentView.items.length ).toBe( 4 );
		} );
	} );

	describe( 'appendUI()', () => {
		it( 'should call _appendColorGridsFragment()', () => {
			const spy = vi.spyOn( colorSelectorView, '_appendColorGridsFragment' );

			colorSelectorView.appendUI();

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should call _appendColorPickerFragment()', () => {
			const spy = vi.spyOn( colorSelectorView, '_appendColorPickerFragment' );

			colorSelectorView.appendUI();

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should not call _appendColorPickerFragment() when colorPickerViewConfig is not set', () => {
			const viewWithoutPicker = new ColorSelectorView( locale, {
				colors: colorDefinitions,
				columns: 5,
				removeButtonLabel: 'Remove color',
				documentColorsLabel: 'Document colors',
				documentColorsCount: 4
			} );

			viewWithoutPicker.render();
			viewWithoutPicker._appendColorGridsFragment();
			document.body.appendChild( viewWithoutPicker.element );

			const spy = vi.spyOn( viewWithoutPicker, '_appendColorPickerFragment' );

			viewWithoutPicker.appendUI();

			expect( spy ).not.toHaveBeenCalled();

			viewWithoutPicker.destroy();
			viewWithoutPicker.element.remove();
		} );
	} );

	describe( 'Document colors', () => {
		let editor, element, model;

		beforeEach( () => {
			element = document.createElement( 'div' );
			document.body.appendChild( element );

			return ClassicTestEditor
				.create( element, {
					plugins: [ Paragraph ]
				} )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
				} );
		} );

		afterEach( () => {
			element.remove();

			return editor.destroy();
		} );

		it( 'should call updateDocumentColors in colorGridsFragmentView', () => {
			const spy = vi.spyOn( colorSelectorView.colorGridsFragmentView, 'updateDocumentColors' );
			_setModelData( model,
				'<paragraph><$text testColor="gold">Bar</$text></paragraph>' +
				'<paragraph><$text testColor="rgb(10,20,30)">Foo</$text></paragraph>' +
				'<paragraph><$text testColor="gold">New Foo</$text></paragraph>' +
				'<paragraph><$text testColor="red">Old Foo</$text></paragraph>' +
				'<paragraph><$text testColor="#FFAACC">Baz</$text></paragraph>'
			);

			colorSelectorView.updateDocumentColors( model, 'testColor' );

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should call updateSelectedColors in colorGridsFragmentView', () => {
			const spy = vi.spyOn( colorSelectorView.colorGridsFragmentView, 'updateSelectedColors' );

			colorSelectorView.updateSelectedColors();

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should unset selected color', () => {
			_setModelData( model,
				'<paragraph><$text testColor="gold">Bar</$text></paragraph>' +
				'<paragraph><$text testColor="rgb(10,20,30)">Foo</$text></paragraph>' +
				'<paragraph><$text testColor="gold">New Foo</$text></paragraph>' +
				'<paragraph><$text testColor="red">Old Foo</$text></paragraph>' +
				'<paragraph><$text testColor="#FFAACC">Baz</$text></paragraph>'
			);

			colorSelectorView.updateDocumentColors( model, 'testColor' );

			colorSelectorView.colorGridsFragmentView.selectedColor = '#ff0000';
			colorSelectorView.updateSelectedColors();

			colorSelectorView.colorGridsFragmentView.documentColors.set( 'isEmpty', true );

			expect( colorSelectorView.colorGridsFragmentView.documentColorsGrid.selectedColor ).toBe( null );
		} );

		it( 'should has colors', () => {
			_setModelData( model,
				'<paragraph><$text testColor="gold">Bar</$text></paragraph>' +
				'<paragraph><$text testColor="rgb(10,20,30)">Foo</$text></paragraph>' +
				'<paragraph><$text testColor="gold">New Foo</$text></paragraph>' +
				'<paragraph><$text testColor="red">Old Foo</$text></paragraph>' +
				'<paragraph><$text testColor="#FFAACC">Baz</$text></paragraph>'
			);

			colorSelectorView.updateDocumentColors( model, 'testColor' );

			expect( colorSelectorView.colorGridsFragmentView.documentColors.hasColor( 'gold' ) ).toBe( true );
			expect( colorSelectorView.colorGridsFragmentView.documentColors.hasColor( 'rgb(10,20,30)' ) ).toBe( true );
			expect( colorSelectorView.colorGridsFragmentView.documentColors.hasColor( '#FFAACC' ) ).toBe( true );
			expect( colorSelectorView.colorGridsFragmentView.documentColors.hasColor( 'red' ) ).toBe( true );
			expect( colorSelectorView.colorGridsFragmentView.documentColors.hasColor( 'blue' ) ).toBe( false );
		} );
	} );

	describe( 'appendColorPicker()', () => {
		it( 'creates a color picker', () => {
			colorSelectorView._appendColorPickerFragment();

			expect( colorSelectorView.colorPickerFragmentView.colorPickerView ).toBeInstanceOf( ColorPickerView );
		} );

		it( 'shouldn\'t duplicate views if called more than once', () => {
			colorSelectorView._appendColorPickerFragment();
			colorSelectorView._appendColorPickerFragment();

			expect( colorSelectorView.colorPickerFragmentView.items.length ).toBe( 2 );
		} );

		it( 'should set selected color after changes in color picker', () => {
			colorSelectorView._appendColorPickerFragment();
			colorSelectorView.colorPickerFragmentView.colorPickerView.fire( 'colorSelected', { color: '#113322' } );

			expect( colorSelectorView.selectedColor ).toBe( '#113322' );
		} );

		it( 'should set the current color when color picker is created', () => {
			colorSelectorView.selectedColor = '#660000';
			colorSelectorView._appendColorPickerFragment();

			const colorPicker = colorSelectorView.colorPickerFragmentView.colorPickerView;

			expect( colorPicker.color, '`color` property value is incorrect' ).toBe( 'hsl(0, 100%, 20%)' );
			expect( colorPicker._hexColor, '`_hexColor` property value is incorrect' ).toBe( '#660000' );
		} );

		it( 'should propagate the selected color to color picker if it changes', () => {
			colorSelectorView.selectedColor = '#660000';
			colorSelectorView._appendColorPickerFragment();
			colorSelectorView.selectedColor = '#660055';

			const colorPicker = colorSelectorView.colorPickerFragmentView.colorPickerView;

			expect( colorPicker.color, '`color` property value is incorrect' ).toBe( 'hsl(310, 100%, 20%)' );
			expect( colorPicker._hexColor, '`_hexColor` property value is incorrect' ).toBe( '#660055' );
		} );

		it( 'should navigate forwards using the Tab key', () => {
			const keyEvtData = {
				keyCode: keyCodes.tab,
				preventDefault: vi.fn(),
				stopPropagation: vi.fn()
			};

			colorSelectorView._appendColorPickerFragment();

			colorSelectorView.colorGridsFragmentView.colorPickerButtonView.fire( 'execute' );

			// Mock the remove color button is focused.
			colorSelectorView.focusTracker.isFocused = true;
			colorSelectorView.focusTracker.focusedElement =
				colorSelectorView.colorPickerFragmentView.colorPickerView.slidersView.first.element;

			const spy = vi.spyOn( colorSelectorView.colorPickerFragmentView.colorPickerView.slidersView.get( 1 ), 'focus' );

			colorSelectorView.keystrokes.press( keyEvtData );
			expect( keyEvtData.preventDefault ).toHaveBeenCalledOnce();
			expect( keyEvtData.stopPropagation ).toHaveBeenCalledOnce();
			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should navigate backwards using the Shift+Tab key', () => {
			const keyEvtData = {
				keyCode: keyCodes.tab,
				shiftKey: true,
				preventDefault: vi.fn(),
				stopPropagation: vi.fn()
			};

			colorSelectorView._appendColorPickerFragment();

			colorSelectorView.colorGridsFragmentView.colorPickerButtonView.fire( 'execute' );

			// Mock the remove color button is focused.
			colorSelectorView.focusTracker.isFocused = true;
			colorSelectorView.focusTracker.focusedElement =
				colorSelectorView.colorPickerFragmentView.colorPickerView.slidersView.get( 1 ).element;

			const spy = vi.spyOn( colorSelectorView.colorPickerFragmentView.colorPickerView.slidersView.first, 'focus' );

			colorSelectorView.keystrokes.press( keyEvtData );
			expect( keyEvtData.preventDefault ).toHaveBeenCalledOnce();
			expect( keyEvtData.stopPropagation ).toHaveBeenCalledOnce();
			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should execute when color picker is focused and enter pressed', () => {
			// Focusing input and then the color picker breaks focus handling in the test
			// suite that uses a headless Chrome browser. It is a workaround for that, as
			// this deactivates focusing input before the color picker.
			env.isBlink = false;

			const keyEvtData = {
				keyCode: keyCodes.enter,
				preventDefault: vi.fn(),
				stopPropagation: vi.fn()
			};

			colorSelectorView._appendColorPickerFragment();

			colorSelectorView.colorGridsFragmentView.colorPickerButtonView.fire( 'execute' );

			// Mock the remove color button is focused.
			colorSelectorView.focusTracker.isFocused = true;
			colorSelectorView.focusTracker.focusedElement =
				colorSelectorView.colorPickerFragmentView.colorPickerView.slidersView.first.element;

			const spy = vi.fn();

			colorSelectorView.selectedColor = '#660055';
			colorSelectorView.on( 'execute', spy );

			colorSelectorView.keystrokes.press( keyEvtData );
			expect( keyEvtData.preventDefault ).toHaveBeenCalledOnce();
			expect( keyEvtData.stopPropagation ).toHaveBeenCalledOnce();
			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should not execute when color picker is focused, enter pressed and has incorrect value', () => {
			const keyEvtData = {
				keyCode: keyCodes.enter,
				preventDefault: vi.fn(),
				stopPropagation: vi.fn()
			};

			colorSelectorView._appendColorPickerFragment();

			colorSelectorView.colorGridsFragmentView.colorPickerButtonView.fire( 'execute' );

			// Mock the remove color button is focused.
			colorSelectorView.focusTracker.isFocused = true;
			colorSelectorView.focusTracker.focusedElement =
				colorSelectorView.colorPickerFragmentView.colorPickerView.slidersView.first.element;

			const spy = vi.fn();

			colorSelectorView.selectedColor = 'Foo Bar';
			colorSelectorView.on( 'execute', spy );

			colorSelectorView.keystrokes.press( keyEvtData );
			expect( spy ).not.toHaveBeenCalled();
		} );

		it( 'should stop propagation when use arrow keys', () => {
			const keyEvtData = {
				keyCode: keyCodes.arrowright,
				stopPropagation: vi.fn()
			};

			colorSelectorView._appendColorPickerFragment();

			colorSelectorView.focusTracker.focusedElement = colorSelectorView.colorGridsFragmentView.removeColorButtonView;
			colorSelectorView.focusTracker.isFocused = true;

			colorSelectorView.keystrokes.press( keyEvtData );
			expect( keyEvtData.stopPropagation ).toHaveBeenCalledOnce();
		} );

		it( 'should not throw when called before colorGridsFragmentView is rendered', () => {
			const view = new ColorSelectorView( locale, {
				colors: colorDefinitions,
				columns: 5,
				removeButtonLabel: 'Remove color',
				colorPickerViewConfig: {
					format: 'hsl'
				}
			} );

			view.render();
			document.body.appendChild( view.element );

			expect( () => view._appendColorPickerFragment() ).not.toThrow();
			expect( view.colorGridsFragmentView.colorPickerButtonView ).toBeUndefined();

			view.destroy();
			view.element.remove();
		} );

		it( 'should not throw when color picker is configured with hideInput', () => {
			const view = new ColorSelectorView( locale, {
				colors: colorDefinitions,
				columns: 5,
				removeButtonLabel: 'Remove color',
				colorPickerViewConfig: {
					format: 'hsl',
					hideInput: true
				}
			} );

			view.render();
			view._appendColorGridsFragment();
			document.body.appendChild( view.element );

			expect( () => view._appendColorPickerFragment() ).not.toThrow();

			view.destroy();
			view.element.remove();
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy the FocusTracker instance', () => {
			const destroySpy = vi.spyOn( colorSelectorView.focusTracker, 'destroy' );

			colorSelectorView.destroy();

			expect( destroySpy ).toHaveBeenCalledOnce();
		} );

		it( 'should destroy the KeystrokeHandler instance', () => {
			const destroySpy = vi.spyOn( colorSelectorView.keystrokes, 'destroy' );

			colorSelectorView.destroy();

			expect( destroySpy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'focus tracking', () => {
		it( 'should focus first child of colorSelectorView in DOM on focus()', () => {
			const spy = vi.spyOn( colorSelectorView._focusCycler, 'focusFirst' );

			colorSelectorView.focus();

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should focus the last child of colorSelectorView in DOM on focusLast()', () => {
			const spy = vi.spyOn( colorSelectorView._focusCycler, 'focusLast' );

			colorSelectorView.focusLast();

			expect( spy ).toHaveBeenCalledOnce();
		} );

		describe( 'navigation across table controls using Tab and Shift+Tab keys', () => {
			beforeEach( () => {
				// Needed for the document colors grid to show up in the view.
				colorSelectorView.colorGridsFragmentView.documentColors.add( {
					color: '#000000',
					label: 'Black',
					options: {
						hasBorder: false
					}
				} );
			} );

			it( 'should navigate forwards using the Tab key', () => {
				const keyEvtData = {
					keyCode: keyCodes.tab,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				};

				// Mock the remove color button is focused.
				colorSelectorView.focusTracker.isFocused = true;
				colorSelectorView.focusTracker.focusedElement = colorSelectorView.colorGridsFragmentView.removeColorButtonView.element;

				const spy = vi.spyOn( colorSelectorView.colorGridsFragmentView.staticColorsGrid, 'focus' );

				colorSelectorView.keystrokes.press( keyEvtData );
				expect( keyEvtData.preventDefault ).toHaveBeenCalledOnce();
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledOnce();
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'should navigate backwards using the Shift+Tab key', () => {
				const keyEvtData = {
					keyCode: keyCodes.tab,
					shiftKey: true,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				};

				// Mock the remove color button is focused.
				colorSelectorView.focusTracker.isFocused = true;
				colorSelectorView.focusTracker.focusedElement = colorSelectorView.colorGridsFragmentView.removeColorButtonView.element;

				const spy = vi.spyOn( colorSelectorView.colorGridsFragmentView.documentColorsGrid, 'focus' );

				colorSelectorView.keystrokes.press( keyEvtData );

				expect( keyEvtData.preventDefault ).toHaveBeenCalledOnce();
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledOnce();
				expect( spy ).toHaveBeenCalledOnce();
			} );
		} );
	} );

	describe( 'remove color button', () => {
		let removeButton;

		beforeEach( () => {
			removeButton = colorSelectorView.colorGridsFragmentView.items.first;
		} );

		it( 'should have proper class', () => {
			expect( removeButton.element.classList.contains( 'ck-color-selector__remove-color' ) ).toBe( true );
		} );

		it( 'should have proper settings', () => {
			expect( removeButton.withText ).toBe( true );
			expect( removeButton.icon ).toBe( IconEraser );
			expect( removeButton.label ).toBe( 'Remove color' );
		} );

		it( 'should execute event with "null" value', () => {
			const spy = vi.fn();
			colorSelectorView.on( 'execute', spy );

			removeButton.element.dispatchEvent( new Event( 'click' ) );

			expect( spy ).toHaveBeenCalledOnce();
			expect( spy.mock.calls[ 0 ][ 1 ] ).toEqual( { value: null, source: 'removeColorButton' } );
		} );
	} );

	describe( 'action bar', () => {
		let actionBar, saveButton, cancelButton, colorPickerView;

		beforeEach( () => {
			colorSelectorView._appendColorPickerFragment();
			actionBar = colorSelectorView.colorPickerFragmentView.actionBarView;
			colorPickerView = colorSelectorView.colorPickerFragmentView.colorPickerView;
			saveButton = colorSelectorView.colorPickerFragmentView.saveButtonView;
			cancelButton = colorSelectorView.colorPickerFragmentView.cancelButtonView;
		} );

		it( 'should have a proper class name', () => {
			expect( actionBar.element.classList.contains( 'ck-color-selector_action-bar' ) ).toBe( true );
		} );

		describe( 'save button', () => {
			it( 'should have a proper class name', () => {
				expect( saveButton.element.classList.contains( 'ck-button-save' ) ).toBe( true );
			} );

			it( 'should have proper settings', () => {
				expect( saveButton.withText ).toBe( false );
				expect( saveButton.icon ).toBe( IconCheck );
			} );

			it( 'should not fire "execute" event with incorrect value', () => {
				const spy = vi.fn();
				colorSelectorView.on( 'execute', spy );
				colorSelectorView.selectedColor = 'FooBar';

				saveButton.element.dispatchEvent( new Event( 'click' ) );

				expect( spy ).not.toHaveBeenCalled();
			} );

			it( 'should fire execute event with correct value', () => {
				const spy = vi.fn();
				colorSelectorView.on( 'execute', spy );
				colorSelectorView.selectedColor = '#ff0000';

				saveButton.element.dispatchEvent( new Event( 'click' ) );

				expect( spy ).toHaveBeenCalledOnce();
				expect( spy.mock.calls[ 0 ][ 1 ] ).toEqual( {
					value: '#ff0000',
					source: 'colorPickerSaveButton'
				} );
			} );

			it( 'should show error label on save with incorrect value', () => {
				const spy = vi.fn();

				colorSelectorView.on( 'execute', spy );
				colorSelectorView.selectedColor = 'FooBar';

				saveButton.element.dispatchEvent( new Event( 'click' ) );

				expect( colorPickerView.hexInputRow.inputView ).toBeDefined();
			} );
		} );

		describe( 'cancel button', () => {
			it( 'should have a proper CSS class name', () => {
				expect( cancelButton.element.classList.contains( 'ck-button-cancel' ) ).toBe( true );
			} );

			it( 'should have proper settings', () => {
				expect( cancelButton.withText ).toBe( false );
				expect( cancelButton.icon ).toBe( IconCancel );
			} );

			it( 'should fire "cancel" event', () => {
				const spy = vi.fn();

				colorSelectorView.colorPickerFragmentView.on( 'colorPicker:cancel', spy );

				cancelButton.element.dispatchEvent( new Event( 'click' ) );

				expect( spy ).toHaveBeenCalledOnce();
			} );
		} );
	} );

	describe( 'static colors grid', () => {
		let staticColorGridView;

		beforeEach( () => {
			staticColorGridView = colorSelectorView.colorGridsFragmentView.items.get( 1 );
		} );

		it( 'should have added 3 children from definition', () => {
			expect( staticColorGridView.items.length ).toBe( 3 );
		} );

		colorDefinitions.forEach( ( item, index ) => {
			it( `should dispatch event to parent element for color: ${ item.color }`, () => {
				const spy = vi.fn();
				colorSelectorView.on( 'execute', spy );

				staticColorGridView.items.get( index ).element.dispatchEvent( new Event( 'click' ) );

				expect( spy ).toHaveBeenCalledOnce();
				expect( spy.mock.calls[ 0 ][ 1 ] ).toEqual( {
					value: item.color,
					source: 'staticColorsGrid'
				} );
			} );
		} );
	} );

	describe( 'document colors', () => {
		const colorBlack = {
			color: '#000000',
			label: 'Black',
			options: {
				hasBorder: false
			}
		};
		const colorWhite = {
			color: '#FFFFFF',
			label: 'Black',
			options: {
				hasBorder: true
			}
		};
		const colorRed = {
			color: 'rgb(255,0,0)',
			options: {
				hasBorder: false
			}
		};
		const colorEmpty = {
			color: 'hsla(0,0%,0%,0)',
			options: {
				hasBorder: true
			}
		};

		describe( 'default checks', () => {
			let documentColorsGridView, documentColors;

			beforeEach( () => {
				documentColors = colorSelectorView.colorGridsFragmentView.documentColors;
				documentColorsGridView = colorSelectorView.colorGridsFragmentView.documentColorsGrid;
			} );

			describe( 'model manipulation', () => {
				it( 'should add item to document colors', () => {
					expect( documentColors.length ).toBe( 0 );

					documentColors.add( Object.assign( {}, colorBlack ) );

					expect( documentColors.length ).toBe( 1 );
					expect( documentColors.first.color ).toBe( '#000000' );
					expect( documentColors.first.label ).toBe( 'Black' );
					expect( documentColors.first.options.hasBorder ).toBe( false );
				} );

				it( 'should not add same item twice one after another', () => {
					expect( documentColors.length ).toBe( 0 );

					documentColors.add( Object.assign( {}, colorBlack ) );

					expect( documentColors.first ).toMatchObject( colorBlack );
					expect( documentColors.length ).toBe( 1 );

					documentColors.add( Object.assign( {}, colorBlack ) );

					expect( documentColors.first ).toMatchObject( colorBlack );
					expect( documentColors.length ).toBe( 1 );
				} );

				it( 'should not add item if it\'s present on the documentColor list', () => {
					expect( documentColors.length ).toBe( 0 );

					documentColors.add( Object.assign( {}, colorBlack ) );
					documentColors.add( Object.assign( {}, colorWhite ) );
					documentColors.add( Object.assign( {}, colorRed ) );

					expect( documentColors.length ).toBe( 3 );
					expect( documentColors.get( 0 ) ).toMatchObject( colorBlack );
					expect( documentColors.get( 1 ) ).toMatchObject( colorWhite );
					expect( documentColors.get( 2 ) ).toMatchObject( colorRed );

					documentColors.add( Object.assign( {}, colorBlack ) );

					expect( documentColors.length ).toBe( 3 );
					expect( documentColors.get( 0 ) ).toMatchObject( colorBlack );
					expect( documentColors.get( 1 ) ).toMatchObject( colorWhite );
					expect( documentColors.get( 2 ) ).toMatchObject( colorRed );
				} );

				it( 'should correctly add disabled colors', () => {
					expect( documentColors.length ).toBe( 0 );

					documentColors.add( Object.assign( {}, colorEmpty ) );

					expect( documentColors.length ).toBe( 1 );
					expect( documentColors.first.color ).toBe( 'hsla(0,0%,0%,0)' );
					expect( documentColors.first.options.hasBorder ).toBe( true );
				} );
			} );

			describe( 'events', () => {
				it( 'should delegate execute to parent', () => {
					const spy = vi.fn();
					colorSelectorView.on( 'execute', spy );

					documentColors.add( Object.assign( {}, colorBlack ) );
					documentColorsGridView.items.first.element.dispatchEvent( new Event( 'click' ) );

					expect( spy ).toHaveBeenCalledOnce();
					expect( spy.mock.calls[ 0 ][ 1 ] ).toEqual( {
						value: '#000000',
						source: 'documentColorsGrid'
					} );
				} );
			} );

			describe( 'binding', () => {
				it( 'should add new colorTile item when document colors model is updated', () => {
					let colorTile;

					expect( documentColors.length ).toBe( 0 );
					expect( documentColorsGridView.items.length ).toBe( 0 );

					documentColors.add( Object.assign( {}, colorBlack ) );
					expect( documentColors.length ).toBe( 1 );
					expect( documentColorsGridView.items.length ).toBe( 1 );

					colorTile = documentColorsGridView.items.first;
					expect( colorTile ).toBeInstanceOf( ColorTileView );
					expect( colorTile.label ).toBe( 'Black' );
					expect( colorTile.color ).toBe( '#000000' );
					expect( colorTile.hasBorder ).toBe( false );

					documentColors.add( Object.assign( {}, colorEmpty ) );
					colorTile = documentColorsGridView.items.get( 1 );
					expect( colorTile ).toBeInstanceOf( ColorTileView );
					expect( colorTile.color ).toBe( 'hsla(0,0%,0%,0)' );
					expect( colorTile.hasBorder ).toBe( true );
				} );
			} );
		} );

		describe( 'empty', () => {
			let colorSelectorView;
			beforeEach( () => {
				locale = { t() {} };
				colorSelectorView = new ColorSelectorView( locale, {
					colors: colorDefinitions,
					columns: 5,
					removeButtonLabel: 'Remove color',
					documentColorsCount: 0
				} );
				// Grids rendering is deferred (https://github.com/ckeditor/ckeditor5/issues/6192)
				// therefore render happens before appending grids.
				colorSelectorView.render();
				colorSelectorView._appendColorGridsFragment();
			} );

			afterEach( () => {
				colorSelectorView.destroy();
			} );

			it( 'should not add document colors grid to the view', () => {
				expect( colorSelectorView.colorGridsFragmentView.items.length ).toBe( 2 );
				expect( colorSelectorView.colorGridsFragmentView.documentColors.length ).toBe( 0 );
				expect( colorSelectorView.colorGridsFragmentView.documentColorsCount ).toBe( 0 );
			} );
		} );
	} );

	describe( '_addColorToDocumentColors', () => {
		it( 'should add custom color', () => {
			colorSelectorView.colorGridsFragmentView._addColorToDocumentColors( '#123456' );
			expect( colorSelectorView.colorGridsFragmentView.documentColors.get( 0 ) ).toMatchObject( {
				color: '#123456',
				label: '#123456',
				options: {
					hasBorder: false
				}
			} );
		} );

		it( 'should detect already define color based on color value and use', () => {
			colorSelectorView.colorGridsFragmentView._addColorToDocumentColors( 'rgb(255,255,255)' );
			// Color values are kept without spaces.
			expect( colorSelectorView.colorGridsFragmentView.documentColors.get( 0 ) ).toMatchObject( {
				color: 'rgb(255,255,255)'
			} );
		} );
	} );
} );

describe( 'ColorGridsFragmentView', () => {
	const locale = { t() {} };

	it( 'should not focus on render', () => {
		const colorGridsFragmentView = new ColorGridsFragmentView( locale, {
			colors: colorDefinitions,
			columns: 5,
			removeButtonLabel: 'Remove color',
			documentColorsLabel: 'Document colors',
			documentColorsCount: 4,
			focusTracker: new FocusTracker(),
			focusables: new Collection()
		} );

		const spy = vi.spyOn( colorGridsFragmentView, 'focus' );

		colorGridsFragmentView.render();

		expect( spy ).not.toHaveBeenCalled();

		colorGridsFragmentView.destroy();
		colorGridsFragmentView.element.remove();
	} );

	it( 'updateSelectedColors() should not throw when documentColorsGrid is not present', () => {
		const colorGridsFragmentView = new ColorGridsFragmentView( locale, {
			colors: colorDefinitions,
			columns: 5,
			removeButtonLabel: 'Remove color',
			documentColorsLabel: 'Document colors',
			documentColorsCount: 0,
			focusTracker: new FocusTracker(),
			focusables: new Collection()
		} );

		document.body.appendChild( colorGridsFragmentView.element || document.createElement( 'div' ) );
		colorGridsFragmentView.render();
		document.body.appendChild( colorGridsFragmentView.element );

		colorGridsFragmentView.selectedColor = '#000';

		expect( () => colorGridsFragmentView.updateSelectedColors() ).not.toThrow();
		expect( colorGridsFragmentView.documentColorsGrid ).toBeUndefined();

		colorGridsFragmentView.destroy();
		colorGridsFragmentView.element.remove();
	} );
} );
