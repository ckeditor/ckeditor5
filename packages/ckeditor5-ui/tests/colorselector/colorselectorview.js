/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { IconEraser, IconCheck, IconCancel } from '@ckeditor/ckeditor5-icons';
import ColorSelectorView from './../../src/colorselector/colorselectorview.js';
import ColorTileView from '../../src/colorgrid/colortileview.js';
import FocusCycler from '../../src/focuscycler.js';
import ColorPickerView from '../../src/colorpicker/colorpickerview.js';
import ColorGridsFragmentView from '../../src/colorselector/colorgridsfragmentview.js';

import Collection from '@ckeditor/ckeditor5-utils/src/collection.js';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker.js';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler.js';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { env } from '@ckeditor/ckeditor5-utils';

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
		// Grids rendering is deferred (#6192) therefore render happens before appending grids.
		colorSelectorView.render();
		colorSelectorView._appendColorGridsFragment();

		document.body.appendChild( colorSelectorView.element );
	} );

	afterEach( () => {
		colorSelectorView.destroy();
		colorSelectorView.element.remove();
	} );

	testUtils.createSinonSandbox();

	describe( 'constructor()', () => {
		it( 'should store colors\' definitions', () => {
			expect( colorSelectorView.colorGridsFragmentView.colorDefinitions ).to.be.instanceOf( Array );
			expect( colorSelectorView.colorGridsFragmentView.colorDefinitions ).to.deep.equal( colorDefinitions );
		} );

		it( 'should create focus tracker', () => {
			expect( colorSelectorView.focusTracker ).to.be.instanceOf( FocusTracker );
		} );

		it( 'should create keystroke handler', () => {
			expect( colorSelectorView.keystrokes ).to.be.instanceOf( KeystrokeHandler );
		} );

		it( 'should create observable for selected color', () => {
			expect( colorSelectorView.selectedColor ).to.be.undefined;

			colorSelectorView.set( 'selectedColor', 'white' );

			expect( colorSelectorView.selectedColor ).to.equal( 'white' );
		} );

		it( 'should set label for the remove color button', () => {
			expect( colorSelectorView.colorGridsFragmentView._removeButtonLabel ).to.equal( 'Remove color' );
		} );

		it( 'should set number of drawn columns', () => {
			expect( colorSelectorView.colorGridsFragmentView.columns ).to.equal( 5 );
		} );

		it( 'should create collection of document colors', () => {
			expect( colorSelectorView.colorGridsFragmentView.documentColors ).to.be.instanceOf( Collection );
		} );

		it( 'should set maximum number of document colors', () => {
			expect( colorSelectorView.colorGridsFragmentView.documentColorsCount ).to.equal( 4 );
		} );

		it( 'should create focus cycler', () => {
			expect( colorSelectorView._focusCycler ).to.be.instanceOf( FocusCycler );
		} );

		it( 'should apply correct classes', () => {
			expect( colorSelectorView.element.classList.contains( 'ck' ) ).to.be.true;
			expect( colorSelectorView.element.classList.contains( 'ck-color-selector' ) ).to.be.true;
		} );

		it( 'should have correct amount of children', () => {
			expect( colorSelectorView.colorGridsFragmentView.items.length ).to.equal( 4 );
		} );

		it( 'should have 1 item', () => {
			expect( colorSelectorView.items.length ).to.equal( 1 );
		} );
	} );

	describe( 'ColorSelectorView components', () => {
		beforeEach( () => {
			colorSelectorView._appendColorPickerFragment();
		} );

		describe( 'colorGridsFragmentView', () => {
			it( 'should have proper classname', () => {
				const colorSelector = colorSelectorView.colorGridsFragmentView;
				expect( colorSelector.element.classList.contains( 'ck-color-grids-fragment' ) ).to.be.true;
			} );
		} );

		describe( 'colorPickerFragmentView', () => {
			it( 'should have proper classname', () => {
				const colorPicker = colorSelectorView.colorPickerFragmentView;
				expect( colorPicker.element.classList.contains( 'ck-color-picker-fragment' ) ).to.be.true;
			} );
		} );

		describe( 'showColorGridsFragment()', () => {
			it( 'should do nothing if grids are already visible', () => {
				colorSelectorView.showColorGridsFragment();

				expect( colorSelectorView.colorGridsFragmentView.isVisible ).to.be.true;

				const gridsFocusSpy = sinon.spy( colorSelectorView.colorGridsFragmentView, 'focus' );
				const isPickerVisibleSpy = sinon.spy();
				const areGridsVisibleSpy = sinon.spy();

				colorSelectorView.colorGridsFragmentView.on( 'change:isVisible', areGridsVisibleSpy );
				colorSelectorView.colorPickerFragmentView.on( 'change:isVisible', isPickerVisibleSpy );

				colorSelectorView.showColorGridsFragment();

				sinon.assert.notCalled( areGridsVisibleSpy );
				sinon.assert.notCalled( gridsFocusSpy );
				sinon.assert.notCalled( isPickerVisibleSpy );
			} );

			it( 'should show the grids first, then focus them, then hide the picker', () => {
				colorSelectorView.showColorPickerFragment();

				const gridsFocusSpy = sinon.spy( colorSelectorView.colorGridsFragmentView, 'focus' );
				const isPickerVisibleSpy = sinon.spy();
				const areGridsVisibleSpy = sinon.spy();

				colorSelectorView.colorGridsFragmentView.on( 'change:isVisible', areGridsVisibleSpy );
				colorSelectorView.colorPickerFragmentView.on( 'change:isVisible', isPickerVisibleSpy );

				colorSelectorView.showColorGridsFragment();

				sinon.assert.callOrder( areGridsVisibleSpy, gridsFocusSpy, isPickerVisibleSpy );

				expect( colorSelectorView.colorGridsFragmentView.isVisible ).to.be.true;
				expect( colorSelectorView.colorPickerFragmentView.isVisible ).to.be.false;
			} );
		} );

		describe( 'showColorPickerFragment()', () => {
			it( 'should do nothing if the picker is already visible', () => {
				colorSelectorView.showColorPickerFragment();

				expect( colorSelectorView.colorPickerFragmentView.isVisible ).to.be.true;

				const pickerFocusSpy = sinon.spy( colorSelectorView.colorPickerFragmentView, 'focus' );
				const isPickerVisibleSpy = sinon.spy();
				const areGridsVisibleSpy = sinon.spy();

				colorSelectorView.colorGridsFragmentView.on( 'change:isVisible', areGridsVisibleSpy );
				colorSelectorView.colorPickerFragmentView.on( 'change:isVisible', isPickerVisibleSpy );

				colorSelectorView.showColorPickerFragment();

				sinon.assert.notCalled( areGridsVisibleSpy );
				sinon.assert.notCalled( pickerFocusSpy );
				sinon.assert.notCalled( isPickerVisibleSpy );
			} );

			it( 'should show the picker first, then focus it, then hide the grids', () => {
				const pickerFocusSpy = sinon.spy( colorSelectorView.colorPickerFragmentView, 'focus' );
				const isPickerVisibleSpy = sinon.spy();
				const areGridsVisibleSpy = sinon.spy();

				colorSelectorView.colorGridsFragmentView.on( 'change:isVisible', areGridsVisibleSpy );
				colorSelectorView.colorPickerFragmentView.on( 'change:isVisible', isPickerVisibleSpy );

				colorSelectorView.showColorPickerFragment();

				sinon.assert.callOrder( isPickerVisibleSpy, pickerFocusSpy, areGridsVisibleSpy );

				expect( colorSelectorView.colorGridsFragmentView.isVisible ).to.be.false;
				expect( colorSelectorView.colorPickerFragmentView.isVisible ).to.be.true;
			} );
		} );
	} );

	describe( '_appendColorGridsFragment()', () => {
		it( 'shouldn\'t duplicate views if called more than once', () => {
			colorSelectorView._appendColorGridsFragment();
			colorSelectorView._appendColorGridsFragment();
			expect( colorSelectorView.colorGridsFragmentView.items.length ).to.equal( 4 );
		} );
	} );

	describe( 'appendUI()', () => {
		it( 'should call _appendColorGridsFragment()', () => {
			const spy = sinon.spy( colorSelectorView, '_appendColorGridsFragment' );

			colorSelectorView.appendUI();

			sinon.assert.calledOnce( spy );
		} );

		it( 'should call _appendColorPickerFragment()', () => {
			const spy = sinon.spy( colorSelectorView, '_appendColorPickerFragment' );

			colorSelectorView.appendUI();

			sinon.assert.calledOnce( spy );
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
			const spy = sinon.spy( colorSelectorView.colorGridsFragmentView, 'updateDocumentColors' );
			setModelData( model,
				'<paragraph><$text testColor="gold">Bar</$text></paragraph>' +
				'<paragraph><$text testColor="rgb(10,20,30)">Foo</$text></paragraph>' +
				'<paragraph><$text testColor="gold">New Foo</$text></paragraph>' +
				'<paragraph><$text testColor="red">Old Foo</$text></paragraph>' +
				'<paragraph><$text testColor="#FFAACC">Baz</$text></paragraph>'
			);

			colorSelectorView.updateDocumentColors( model, 'testColor' );

			sinon.assert.calledOnce( spy );
		} );

		it( 'should call updateSelectedColors in colorGridsFragmentView', () => {
			const spy = sinon.spy( colorSelectorView.colorGridsFragmentView, 'updateSelectedColors' );

			colorSelectorView.updateSelectedColors();

			sinon.assert.calledOnce( spy );
		} );

		it( 'should unset selected color', () => {
			setModelData( model,
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

			expect( colorSelectorView.colorGridsFragmentView.documentColorsGrid.selectedColor ).to.equal( null );
		} );

		it( 'should has colors', () => {
			setModelData( model,
				'<paragraph><$text testColor="gold">Bar</$text></paragraph>' +
				'<paragraph><$text testColor="rgb(10,20,30)">Foo</$text></paragraph>' +
				'<paragraph><$text testColor="gold">New Foo</$text></paragraph>' +
				'<paragraph><$text testColor="red">Old Foo</$text></paragraph>' +
				'<paragraph><$text testColor="#FFAACC">Baz</$text></paragraph>'
			);

			colorSelectorView.updateDocumentColors( model, 'testColor' );

			expect( colorSelectorView.colorGridsFragmentView.documentColors.hasColor( 'gold' ) ).to.be.true;
			expect( colorSelectorView.colorGridsFragmentView.documentColors.hasColor( 'rgb(10,20,30)' ) ).to.be.true;
			expect( colorSelectorView.colorGridsFragmentView.documentColors.hasColor( '#FFAACC' ) ).to.be.true;
			expect( colorSelectorView.colorGridsFragmentView.documentColors.hasColor( 'red' ) ).to.be.true;
			expect( colorSelectorView.colorGridsFragmentView.documentColors.hasColor( 'blue' ) ).to.be.false;
		} );
	} );

	describe( 'appendColorPicker()', () => {
		it( 'creates a color picker', () => {
			colorSelectorView._appendColorPickerFragment();

			expect( colorSelectorView.colorPickerFragmentView.colorPickerView ).to.be.instanceOf( ColorPickerView );
		} );

		it( 'shouldn\'t duplicate views if called more than once', () => {
			colorSelectorView._appendColorPickerFragment();
			colorSelectorView._appendColorPickerFragment();

			expect( colorSelectorView.colorPickerFragmentView.items.length ).to.equal( 2 );
		} );

		it( 'should set selected color after changes in color picker', () => {
			colorSelectorView._appendColorPickerFragment();
			colorSelectorView.colorPickerFragmentView.colorPickerView.fire( 'colorSelected', { color: '#113322' } );

			expect( colorSelectorView.selectedColor ).to.equal( '#113322' );
		} );

		it( 'should set the current color when color picker is created', () => {
			colorSelectorView.selectedColor = '#660000';
			colorSelectorView._appendColorPickerFragment();

			const colorPicker = colorSelectorView.colorPickerFragmentView.colorPickerView;

			expect( colorPicker.color, '`color` property value is incorrect' ).to.equal( 'hsl(0, 100%, 20%)' );
			expect( colorPicker._hexColor, '`_hexColor` property value is incorrect' ).to.equal( '#660000' );
		} );

		it( 'should propagate the selected color to color picker if it changes', () => {
			colorSelectorView.selectedColor = '#660000';
			colorSelectorView._appendColorPickerFragment();
			colorSelectorView.selectedColor = '#660055';

			const colorPicker = colorSelectorView.colorPickerFragmentView.colorPickerView;

			expect( colorPicker.color, '`color` property value is incorrect' ).to.equal( 'hsl(310, 100%, 20%)' );
			expect( colorPicker._hexColor, '`_hexColor` property value is incorrect' ).to.equal( '#660055' );
		} );

		it( 'should navigate forwards using the Tab key', () => {
			const keyEvtData = {
				keyCode: keyCodes.tab,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};

			colorSelectorView._appendColorPickerFragment();

			colorSelectorView.colorGridsFragmentView.colorPickerButtonView.fire( 'execute' );

			// Mock the remove color button is focused.
			colorSelectorView.focusTracker.isFocused = true;
			colorSelectorView.focusTracker.focusedElement =
				colorSelectorView.colorPickerFragmentView.colorPickerView.slidersView.first.element;

			const spy = sinon.spy( colorSelectorView.colorPickerFragmentView.colorPickerView.slidersView.get( 1 ), 'focus' );

			colorSelectorView.keystrokes.press( keyEvtData );
			sinon.assert.calledOnce( keyEvtData.preventDefault );
			sinon.assert.calledOnce( keyEvtData.stopPropagation );
			sinon.assert.calledOnce( spy );
		} );

		it( 'should navigate backwards using the Shift+Tab key', () => {
			const keyEvtData = {
				keyCode: keyCodes.tab,
				shiftKey: true,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};

			colorSelectorView._appendColorPickerFragment();

			colorSelectorView.colorGridsFragmentView.colorPickerButtonView.fire( 'execute' );

			// Mock the remove color button is focused.
			colorSelectorView.focusTracker.isFocused = true;
			colorSelectorView.focusTracker.focusedElement =
				colorSelectorView.colorPickerFragmentView.colorPickerView.slidersView.get( 1 ).element;

			const spy = sinon.spy( colorSelectorView.colorPickerFragmentView.colorPickerView.slidersView.first, 'focus' );

			colorSelectorView.keystrokes.press( keyEvtData );
			sinon.assert.calledOnce( keyEvtData.preventDefault );
			sinon.assert.calledOnce( keyEvtData.stopPropagation );
			sinon.assert.calledOnce( spy );
		} );

		it( 'should execute when color picker is focused and enter pressed', () => {
			// Focusing input and then the color picker breaks focus handling in the test
			// suite that uses a headless Chrome browser. It is a workaround for that, as
			// this deactivates focusing input before the color picker.
			env.isBlink = false;

			const keyEvtData = {
				keyCode: keyCodes.enter,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};

			colorSelectorView._appendColorPickerFragment();

			colorSelectorView.colorGridsFragmentView.colorPickerButtonView.fire( 'execute' );

			// Mock the remove color button is focused.
			colorSelectorView.focusTracker.isFocused = true;
			colorSelectorView.focusTracker.focusedElement =
				colorSelectorView.colorPickerFragmentView.colorPickerView.slidersView.first.element;

			const spy = sinon.spy();

			colorSelectorView.selectedColor = '#660055';
			colorSelectorView.on( 'execute', spy );

			colorSelectorView.keystrokes.press( keyEvtData );
			sinon.assert.calledOnce( keyEvtData.preventDefault );
			sinon.assert.calledOnce( keyEvtData.stopPropagation );
			sinon.assert.calledOnce( spy );
		} );

		it( 'should not execute when color picker is focused, enter pressed and has incorrect value', () => {
			const keyEvtData = {
				keyCode: keyCodes.enter,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};

			colorSelectorView._appendColorPickerFragment();

			colorSelectorView.colorGridsFragmentView.colorPickerButtonView.fire( 'execute' );

			// Mock the remove color button is focused.
			colorSelectorView.focusTracker.isFocused = true;
			colorSelectorView.focusTracker.focusedElement =
				colorSelectorView.colorPickerFragmentView.colorPickerView.slidersView.first.element;

			const spy = sinon.spy();

			colorSelectorView.selectedColor = 'Foo Bar';
			colorSelectorView.on( 'execute', spy );

			colorSelectorView.keystrokes.press( keyEvtData );
			sinon.assert.notCalled( spy );
		} );

		it( 'should stop propagation when use arrow keys', () => {
			const keyEvtData = {
				keyCode: keyCodes.arrowright,
				stopPropagation: sinon.spy()
			};

			colorSelectorView._appendColorPickerFragment();

			colorSelectorView.focusTracker.focusedElement = colorSelectorView.colorGridsFragmentView.removeColorButtonView;
			colorSelectorView.focusTracker.isFocused = true;

			colorSelectorView.keystrokes.press( keyEvtData );
			sinon.assert.calledOnce( keyEvtData.stopPropagation );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy the FocusTracker instance', () => {
			const destroySpy = sinon.spy( colorSelectorView.focusTracker, 'destroy' );

			colorSelectorView.destroy();

			sinon.assert.calledOnce( destroySpy );
		} );

		it( 'should destroy the KeystrokeHandler instance', () => {
			const destroySpy = sinon.spy( colorSelectorView.keystrokes, 'destroy' );

			colorSelectorView.destroy();

			sinon.assert.calledOnce( destroySpy );
		} );
	} );

	describe( 'focus tracking', () => {
		it( 'should focus first child of colorSelectorView in DOM on focus()', () => {
			const spy = sinon.spy( colorSelectorView._focusCycler, 'focusFirst' );

			colorSelectorView.focus();

			sinon.assert.calledOnce( spy );
		} );

		it( 'should focus the last child of colorSelectorView in DOM on focusLast()', () => {
			const spy = sinon.spy( colorSelectorView._focusCycler, 'focusLast' );

			colorSelectorView.focusLast();

			sinon.assert.calledOnce( spy );
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
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				// Mock the remove color button is focused.
				colorSelectorView.focusTracker.isFocused = true;
				colorSelectorView.focusTracker.focusedElement = colorSelectorView.colorGridsFragmentView.removeColorButtonView.element;

				const spy = sinon.spy( colorSelectorView.colorGridsFragmentView.staticColorsGrid, 'focus' );

				colorSelectorView.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );
				sinon.assert.calledOnce( spy );
			} );

			it( 'should navigate backwards using the Shift+Tab key', () => {
				const keyEvtData = {
					keyCode: keyCodes.tab,
					shiftKey: true,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				// Mock the remove color button is focused.
				colorSelectorView.focusTracker.isFocused = true;
				colorSelectorView.focusTracker.focusedElement = colorSelectorView.colorGridsFragmentView.removeColorButtonView.element;

				const spy = sinon.spy( colorSelectorView.colorGridsFragmentView.documentColorsGrid, 'focus' );

				colorSelectorView.keystrokes.press( keyEvtData );

				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );
				sinon.assert.calledOnce( spy );
			} );
		} );
	} );

	describe( 'remove color button', () => {
		let removeButton;

		beforeEach( () => {
			removeButton = colorSelectorView.colorGridsFragmentView.items.first;
		} );

		it( 'should have proper class', () => {
			expect( removeButton.element.classList.contains( 'ck-color-selector__remove-color' ) ).to.be.true;
		} );

		it( 'should have proper settings', () => {
			expect( removeButton.withText ).to.be.true;
			expect( removeButton.icon ).to.equal( IconEraser );
			expect( removeButton.label ).to.equal( 'Remove color' );
		} );

		it( 'should execute event with "null" value', () => {
			const spy = sinon.spy();
			colorSelectorView.on( 'execute', spy );

			removeButton.element.dispatchEvent( new Event( 'click' ) );

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWith( spy, sinon.match.any, { value: null, source: 'removeColorButton' } );
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
			expect( actionBar.element.classList.contains( 'ck-color-selector_action-bar' ) ).to.be.true;
		} );

		describe( 'save button', () => {
			it( 'should have a proper class name', () => {
				expect( saveButton.element.classList.contains( 'ck-button-save' ) ).to.be.true;
			} );

			it( 'should have proper settings', () => {
				expect( saveButton.withText ).to.be.false;
				expect( saveButton.icon ).to.equal( IconCheck );
			} );

			it( 'should not fire "execute" event with incorrect value', () => {
				const spy = sinon.spy();
				colorSelectorView.on( 'execute', spy );
				colorSelectorView.selectedColor = 'FooBar';

				saveButton.element.dispatchEvent( new Event( 'click' ) );

				expect( spy ).not.to.be.called;
			} );

			it( 'should fire execute event with correct value', () => {
				const spy = sinon.spy();
				colorSelectorView.on( 'execute', spy );
				colorSelectorView.selectedColor = '#ff0000';

				saveButton.element.dispatchEvent( new Event( 'click' ) );

				sinon.assert.calledOnce( spy );
				sinon.assert.calledWith( spy, sinon.match.any, {
					value: '#ff0000',
					source: 'colorPickerSaveButton'
				} );
			} );

			it( 'should show error label on save with incorrect value', () => {
				const spy = sinon.spy();

				colorSelectorView.on( 'execute', spy );
				colorSelectorView.selectedColor = 'FooBar';

				saveButton.element.dispatchEvent( new Event( 'click' ) );

				expect( colorPickerView.hexInputRow.inputView.errorText ).to.be.string;
			} );
		} );

		describe( 'cancel button', () => {
			it( 'should have a proper CSS class name', () => {
				expect( cancelButton.element.classList.contains( 'ck-button-cancel' ) ).to.be.true;
			} );

			it( 'should have proper settings', () => {
				expect( cancelButton.withText ).to.be.false;
				expect( cancelButton.icon ).to.equal( IconCancel );
			} );

			it( 'should fire "cancel" event', () => {
				const spy = sinon.spy();

				colorSelectorView.colorPickerFragmentView.on( 'colorPicker:cancel', spy );

				cancelButton.element.dispatchEvent( new Event( 'click' ) );

				sinon.assert.calledOnce( spy );
			} );
		} );
	} );

	describe( 'static colors grid', () => {
		let staticColorGridView;

		beforeEach( () => {
			staticColorGridView = colorSelectorView.colorGridsFragmentView.items.get( 1 );
		} );

		it( 'should have added 3 children from definition', () => {
			expect( staticColorGridView.items.length ).to.equal( 3 );
		} );

		colorDefinitions.forEach( ( item, index ) => {
			it( `should dispatch event to parent element for color: ${ item.color }`, () => {
				const spy = sinon.spy();
				colorSelectorView.on( 'execute', spy );

				staticColorGridView.items.get( index ).element.dispatchEvent( new Event( 'click' ) );

				sinon.assert.calledOnce( spy );
				sinon.assert.calledWith( spy, sinon.match.any, {
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
					expect( documentColors.length ).to.equal( 0 );

					documentColors.add( Object.assign( {}, colorBlack ) );

					expect( documentColors.length ).to.equal( 1 );
					expect( documentColors.first.color ).to.equal( '#000000' );
					expect( documentColors.first.label ).to.equal( 'Black' );
					expect( documentColors.first.options.hasBorder ).to.be.false;
				} );

				it( 'should not add same item twice one after another', () => {
					expect( documentColors.length ).to.equal( 0 );

					documentColors.add( Object.assign( {}, colorBlack ) );

					expect( documentColors.first ).to.own.include( colorBlack );
					expect( documentColors.length ).to.equal( 1 );

					documentColors.add( Object.assign( {}, colorBlack ) );

					expect( documentColors.first ).to.own.include( colorBlack );
					expect( documentColors.length ).to.equal( 1 );
				} );

				it( 'should not add item if it\'s present on the documentColor list', () => {
					expect( documentColors.length ).to.equal( 0 );

					documentColors.add( Object.assign( {}, colorBlack ) );
					documentColors.add( Object.assign( {}, colorWhite ) );
					documentColors.add( Object.assign( {}, colorRed ) );

					expect( documentColors.length ).to.equal( 3 );
					expect( documentColors.get( 0 ) ).to.own.include( colorBlack );
					expect( documentColors.get( 1 ) ).to.own.include( colorWhite );
					expect( documentColors.get( 2 ) ).to.own.include( colorRed );

					documentColors.add( Object.assign( {}, colorBlack ) );

					expect( documentColors.length ).to.equal( 3 );
					expect( documentColors.get( 0 ) ).to.own.include( colorBlack );
					expect( documentColors.get( 1 ) ).to.own.include( colorWhite );
					expect( documentColors.get( 2 ) ).to.own.include( colorRed );
				} );

				it( 'should correctly add disabled colors', () => {
					expect( documentColors.length ).to.equal( 0 );

					documentColors.add( Object.assign( {}, colorEmpty ) );

					expect( documentColors.length ).to.equal( 1 );
					expect( documentColors.first.color ).to.equal( 'hsla(0,0%,0%,0)' );
					expect( documentColors.first.options.hasBorder ).to.be.true;
				} );
			} );

			describe( 'events', () => {
				it( 'should delegate execute to parent', () => {
					const spy = sinon.spy();
					colorSelectorView.on( 'execute', spy );

					documentColors.add( Object.assign( {}, colorBlack ) );
					documentColorsGridView.items.first.element.dispatchEvent( new Event( 'click' ) );

					sinon.assert.calledOnce( spy );
					sinon.assert.calledWith( spy, sinon.match.any, {
						value: '#000000',
						source: 'documentColorsGrid'
					} );
				} );
			} );

			describe( 'binding', () => {
				it( 'should add new colorTile item when document colors model is updated', () => {
					let colorTile;

					expect( documentColors.length ).to.equal( 0 );
					expect( documentColorsGridView.items.length ).to.equal( 0 );

					documentColors.add( Object.assign( {}, colorBlack ) );
					expect( documentColors.length ).to.equal( 1 );
					expect( documentColorsGridView.items.length ).to.equal( 1 );

					colorTile = documentColorsGridView.items.first;
					expect( colorTile ).to.be.instanceOf( ColorTileView );
					expect( colorTile.label ).to.equal( 'Black' );
					expect( colorTile.color ).to.equal( '#000000' );
					expect( colorTile.hasBorder ).to.be.false;

					documentColors.add( Object.assign( {}, colorEmpty ) );
					colorTile = documentColorsGridView.items.get( 1 );
					expect( colorTile ).to.be.instanceOf( ColorTileView );
					expect( colorTile.color ).to.equal( 'hsla(0,0%,0%,0)' );
					expect( colorTile.hasBorder ).to.be.true;
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
				// Grids rendering is deferred (#6192) therefore render happens before appending grids.
				colorSelectorView.render();
				colorSelectorView._appendColorGridsFragment();
			} );

			afterEach( () => {
				colorSelectorView.destroy();
			} );

			it( 'should not add document colors grid to the view', () => {
				expect( colorSelectorView.colorGridsFragmentView.items.length ).to.equal( 2 );
				expect( colorSelectorView.colorGridsFragmentView.documentColors.length ).to.equal( 0 );
				expect( colorSelectorView.colorGridsFragmentView.documentColorsCount ).to.equal( 0 );
			} );
		} );
	} );

	describe( '_addColorToDocumentColors', () => {
		it( 'should add custom color', () => {
			colorSelectorView.colorGridsFragmentView._addColorToDocumentColors( '#123456' );
			expect( colorSelectorView.colorGridsFragmentView.documentColors.get( 0 ) ).to.deep.include( {
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
			expect( colorSelectorView.colorGridsFragmentView.documentColors.get( 0 ) ).to.deep.include( {
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

		const spy = sinon.spy( colorGridsFragmentView, 'focus' );

		colorGridsFragmentView.render();

		sinon.assert.notCalled( spy );

		colorGridsFragmentView.destroy();
		colorGridsFragmentView.element.remove();
	} );
} );
