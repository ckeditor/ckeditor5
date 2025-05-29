/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ColorInputView from '../../src/ui/colorinputview.js';
import InputTextView from '@ckeditor/ckeditor5-ui/src/inputtext/inputtextview.js';
import ColorGridView from '@ckeditor/ckeditor5-ui/src/colorgrid/colorgridview.js';
import DropdownView from '@ckeditor/ckeditor5-ui/src/dropdown/dropdownview.js';
import { ButtonView, FocusCycler, ViewCollection } from '@ckeditor/ckeditor5-ui';
import { FocusTracker, KeystrokeHandler, keyCodes } from '@ckeditor/ckeditor5-utils';
import { global } from 'ckeditor5/src/utils.js';

const DEFAULT_COLORS = [
	{
		color: 'rgb(255,0,0)',
		label: 'Red',
		options: {}
	},
	{
		color: 'rgb(0,255,0)',
		label: 'Green',
		options: {
			hasBorder: true
		}
	},
	{
		color: 'rgb(0,0,255)',
		label: 'Blue',
		options: {}
	}
];

describe( 'ColorInputView', () => {
	let view, locale, colorGridView, removeColorButton, inputView, colorSelectorView;

	beforeEach( () => {
		locale = { t: val => val };
		view = new ColorInputView( locale, {
			colorDefinitions: DEFAULT_COLORS,
			columns: 5
		} );
		view.render();

		colorSelectorView = view.dropdownView.panelView.children.first;
		inputView = view.inputView;
		removeColorButton = colorSelectorView.colorGridsFragmentView.removeColorButtonView;
		colorGridView = colorSelectorView.colorGridsFragmentView.staticColorsGrid;
		document.body.appendChild( view.element );
	} );

	afterEach( () => {
		view.destroy();
		view.element.remove();
	} );

	describe( 'constructor()', () => {
		it( 'should set view#options', () => {
			expect( view.options ).to.deep.equal( {
				colorDefinitions: DEFAULT_COLORS,
				columns: 5
			} );
		} );

		it( 'should set view#locale', () => {
			expect( view.locale ).to.equal( locale );
		} );

		it( 'should set #isReadOnly', () => {
			expect( view.isReadOnly ).to.be.false;
		} );

		it( 'should set #isFocused', () => {
			expect( view.isFocused ).to.be.false;
		} );

		it( 'should set #isEmpty', () => {
			expect( view.isEmpty ).to.be.true;
		} );

		it( 'should have #isEmpty bound to the text input', () => {
			inputView.isEmpty = true;
			expect( view.isEmpty ).to.be.true;

			inputView.isEmpty = false;
			expect( view.isEmpty ).to.be.false;
		} );

		it( 'should have #isFocused bound to the text input', () => {
			inputView.isFocused = true;
			expect( view.isFocused ).to.be.true;

			inputView.isFocused = false;
			expect( view.isFocused ).to.be.false;
		} );

		it( 'should have #focusTracker', () => {
			expect( view.focusTracker ).to.be.instanceOf( FocusTracker );
		} );

		it( 'should have #_focusables', () => {
			expect( view._focusables ).to.be.instanceOf( ViewCollection );
		} );

		it( 'should have #keystrokes', () => {
			expect( view.keystrokes ).to.be.instanceOf( KeystrokeHandler );
		} );

		it( 'should have #focusCycler', () => {
			expect( view.focusCycler ).to.be.instanceOf( FocusCycler );
		} );

		describe( 'dropdown', () => {
			it( 'should be created', () => {
				expect( view.dropdownView ).to.be.instanceOf( DropdownView );
				expect( view.dropdownView.buttonView.element.classList.contains( 'ck-input-color__button' ) ).to.be.true;
				expect( view.dropdownView.buttonView.tooltip ).to.be.true;
				expect( view.dropdownView.buttonView.label ).to.equal( 'Color picker' );
			} );

			it( 'should bind #isEnabled to the view\'s #isReadOnly', () => {
				view.isReadOnly = false;
				expect( view.dropdownView.isEnabled ).to.be.true;

				view.isReadOnly = true;
				expect( view.dropdownView.isEnabled ).to.be.false;
			} );

			it( 'should have the color preview', () => {
				const preview = view.dropdownView.buttonView.children.first;

				expect( preview.element.classList.contains( 'ck' ) ).to.be.true;
				expect( preview.element.classList.contains( 'ck-input-color__button__preview' ) ).to.be.true;
			} );

			it( 'should display no-color preview when color is not set', () => {
				const preview = view.dropdownView.buttonView.children.first;
				const noColorPreview = preview.element.firstChild;

				view.value = 'hsl(0, 0, 50%)';

				expect( noColorPreview.classList.contains( 'ck-hidden' ) ).to.be.true;

				view.value = '';

				expect( noColorPreview.classList.contains( 'ck-hidden' ) ).to.be.false;
			} );

			it( 'should show color grids when dropdown is open', () => {
				const spy = sinon.spy( colorSelectorView, 'showColorGridsFragment' );
				const dropdown = view.dropdownView;

				dropdown.isOpen = true;

				sinon.assert.calledOnce( spy );

				dropdown.isOpen = false;

				sinon.assert.calledOnce( spy );
			} );

			it( 'should close dropdown when "save button" is pressed', () => {
				const dropdown = view.dropdownView;

				dropdown.isOpen = true;

				colorSelectorView.fire( 'execute', {
					source: 'colorPickerSaveButton'
				} );

				expect( dropdown.isOpen ).to.be.equal( false );
			} );

			it( 'should not not fire input event on submiting', () => {
				const spy = sinon.spy();

				view.on( 'input', spy );

				colorSelectorView.fire( 'execute', {
					source: 'colorPickerSaveButton'
				} );

				sinon.assert.notCalled( spy );
			} );

			it( 'should close dropdown and cancel changes when "cancel button" is pressed', () => {
				const dropdown = view.dropdownView;

				dropdown.isOpen = true;

				colorSelectorView.fire( 'colorPicker:cancel' );

				expect( dropdown.isOpen ).to.be.equal( false );
				expect( inputView.value ).to.be.equal( '' );
			} );

			it( 'should close dropdown and revert changes when "cancel button" is pressed', () => {
				const dropdown = view.dropdownView;
				const colorSelectorView = dropdown.panelView.children.first;

				view.value = '#ffaaff';
				dropdown.isOpen = true;

				// Open color picker by clicking on button "color picker".
				colorSelectorView.colorGridsFragmentView.colorPickerButtonView.fire( 'execute' );
				colorSelectorView.colorPickerFragmentView.colorPickerView.fire( 'colorSelected', { color: 'hsl( 250, 100%, 83% )' } );

				colorSelectorView.fire( 'colorPicker:cancel' );

				expect( view.value ).to.be.equal( '#ffaaff' );
			} );

			it( 'should have the remove color button', () => {
				const removeColorButton = view.dropdownView.panelView.children.first.colorGridsFragmentView.removeColorButtonView;

				expect( removeColorButton ).to.be.instanceOf( ButtonView );
				expect( removeColorButton.label ).to.equal( 'Remove color' );
			} );

			it( 'should remove color', () => {
				const dropdown = view.dropdownView;
				const colorSelectorView = dropdown.panelView.children.first;

				view.value = '#ffaaff';
				dropdown.isOpen = true;

				colorSelectorView.colorGridsFragmentView.removeColorButtonView.fire( 'execute' );

				expect( view.value ).to.be.equal( '' );
			} );

			describe( 'position', () => {
				let view;

				afterEach( () => {
					view.destroy();
				} );

				it( 'should be SouthWest in LTR', () => {
					locale.uiLanguageDirection = 'ltr';
					view = new ColorInputView( locale, {
						colorDefinitions: DEFAULT_COLORS,
						columns: 5
					} );
					view.render();

					expect( view.dropdownView.panelPosition ).to.equal( 'sw' );
				} );

				it( 'should be SouthEast in RTL', () => {
					locale.uiLanguageDirection = 'rtl';
					view = new ColorInputView( locale, {
						colorDefinitions: DEFAULT_COLORS,
						columns: 5
					} );
					view.render();

					expect( view.dropdownView.panelPosition ).to.equal( 'se' );
				} );
			} );
		} );

		describe( 'color grid', () => {
			it( 'should be an instance of ColorGridView', () => {
				expect( colorGridView ).to.be.instanceOf( ColorGridView );
			} );

			it( 'should set ColorInputView#value upon ColorTileView#execute', () => {
				expect( view.value ).to.equal( '' );

				view.dropdownView.isOpen = true;

				colorGridView.items.last.fire( 'execute' );

				expect( view.value ).to.equal( 'rgb(0,0,255)' );
			} );

			it( 'should set InputTextView#value to the selected color\'s label upon ColorTileView#execute', () => {
				expect( inputView.value ).to.equal( '' );

				view.dropdownView.isOpen = true;

				colorGridView.items.last.fire( 'execute' );

				expect( inputView.value ).to.equal( 'Blue' );
			} );

			it( 'should close the dropdown upon ColorTileView#execute', () => {
				view.dropdownView.isOpen = true;

				colorGridView.items.last.fire( 'execute' );

				expect( view.dropdownView.isOpen ).to.be.false;
			} );

			it( 'should fire the ColorInputView#input event upon ColorTileView#execute', () => {
				const spy = sinon.spy( view, 'fire' );

				view.dropdownView.isOpen = true;

				colorGridView.items.last.fire( 'execute' );

				sinon.assert.calledWithExactly( spy.lastCall, 'input' );
			} );

			it( 'should set #selectedColor to the #value upon dropdown opening', () => {
				view.value = 'rgb(0,255,0)';
				view.dropdownView.isOpen = true;

				expect( colorGridView.selectedColor ).to.equal( 'rgb(0,255,0)' );
			} );
		} );

		describe( 'remove color button', () => {
			it( 'should be created from the template', () => {
				expect( removeColorButton.element.classList.contains( 'ck-color-selector__remove-color' ) ).to.be.true;
				expect( removeColorButton.withText ).to.be.true;
				expect( removeColorButton.label ).to.equal( 'Remove color' );
			} );

			it( 'should set the empty #value upon #execute', () => {
				view.value = 'foo';

				view.dropdownView.isOpen = true;

				removeColorButton.fire( 'execute' );

				expect( view.value ).to.equal( '' );
			} );

			it( 'should close the #dropdownView upon #execute', () => {
				view.dropdownView.isOpen = true;

				removeColorButton.fire( 'execute' );

				expect( view.dropdownView.isOpen ).to.be.false;
			} );
		} );

		describe( 'text input', () => {
			it( 'should be created', () => {
				expect( inputView ).to.be.instanceOf( InputTextView );
			} );

			it( 'should have #value bound to the color input', () => {
				view.value = 'foo';
				expect( inputView.value ).to.equal( 'foo' );

				view.value = 'bar';
				expect( inputView.value ).to.equal( 'bar' );
			} );

			it(
				`when the color input value is set to one of defined colors, but with few additional white spaces,
				should use its label as the text input value`,
				() => {
					view.value = 'rgb(0,    255, 0)';
					expect( inputView.value ).to.equal( 'Green' );

					view.value = '   rgb( 255 0  0)    ';
					expect( inputView.value ).to.equal( 'Red' );

					view.value = ' 		  rgb(0,  0,  255 )';
					expect( inputView.value ).to.equal( 'Blue' );

					// Blindly stripping spaces may not work.
					// rgb(25 50 0) != rgb(255 0 0)
					view.value = ' 		  rgb(25 50  0)';
					expect( inputView.value ).to.equal( ' 		  rgb(25 50  0)' );
				}
			);

			it( `when the color input value is set to one of defined colors,
			should use its label as the text input value`, () => {
				view.value = 'rgb(0,255,0)';
				expect( inputView.value ).to.equal( 'Green' );

				view.value = 'rgb(255,0,0)';
				expect( inputView.value ).to.equal( 'Red' );
			} );

			it( 'should have #isReadOnly bound to the color input', () => {
				view.isReadOnly = true;
				expect( inputView.isReadOnly ).to.equal( true );

				view.isReadOnly = false;
				expect( inputView.isReadOnly ).to.equal( false );
			} );

			it( 'should set #value on #input event', () => {
				inputView.element.value = 'foo';
				inputView.fire( 'input' );

				expect( view.value ).to.equal( 'foo' );

				inputView.element.value = 'bar';
				inputView.fire( 'input' );

				expect( view.value ).to.equal( 'bar' );
			} );

			it(
				`when any defined color label is given as the text input #value (case-sensitive),
				should set the color as #value on #input event`,
				() => {
					inputView.element.value = 'Red';
					inputView.fire( 'input' );

					expect( view.value ).to.equal( 'rgb(255,0,0)' );

					inputView.element.value = 'Green';
					inputView.fire( 'input' );

					expect( view.value ).to.equal( 'rgb(0,255,0)' );

					inputView.element.value = 'blue';
					inputView.fire( 'input' );

					expect( view.value ).to.equal( 'blue' );
				}
			);

			it(
				`when any defined color label is given as the text input #value (case-sensitive),
				then a non-defined value is set to the color input,
				the latter value should be set to text input`,
				() => {
					inputView.element.value = 'Red';
					inputView.fire( 'input' );

					expect( view.value ).to.equal( 'rgb(255,0,0)' );

					view.value = 'rgb(0,0,255)';

					expect( view.value ).to.equal( 'rgb(0,0,255)' );
				}
			);

			it(
				`when any defined color value is given as the text input #value (case-sensitive),
				its value should be set to color and text inputs after input event`,
				() => {
					inputView.element.value = 'rgb(255,0,0)';
					inputView.fire( 'input' );

					expect( view.value ).to.equal( 'rgb(255,0,0)' );
					expect( inputView.element.value ).to.equal( 'rgb(255,0,0)' );
				}
			);

			it(
				`when any defined color value is given as the text input #value (case-sensitive),
				its label should be set to text inputs after blur event on input view input element`,
				() => {
					inputView.element.value = 'rgb(255,0,0)';

					inputView.fire( 'input' );

					expect( inputView.element.value ).to.equal( 'rgb(255,0,0)' );

					inputView.element.dispatchEvent( new Event( 'blur' ) );

					expect( inputView.element.value ).to.equal( 'Red' );
				}
			);

			it( 'should have #input event delegated to the color input', () => {
				const spy = sinon.spy();
				view.on( 'input', spy );

				inputView.fire( 'input' );
				sinon.assert.calledOnce( spy );
			} );
		} );

		it( 'should set the template', () => {
			expect( view.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-input-color' ) ).to.be.true;
			expect( view.element.firstChild ).to.equal( view.dropdownView.element );
			expect( view.element.lastChild ).to.equal( inputView.element );
		} );

		describe( 'options', () => {
			it( 'should pass the color definitions to the color grid', () => {
				const colorTiles = colorGridView.items.map( ( { color, hasBorder, label } ) => {
					return { color, hasBorder, label };
				} );

				expect( colorTiles ).to.deep.equal( [
					{
						color: 'rgb(255,0,0)',
						label: 'Red',
						hasBorder: undefined
					},
					{
						color: 'rgb(0,255,0)',
						label: 'Green',
						hasBorder: true
					},
					{
						color: 'rgb(0,0,255)',
						label: 'Blue',
						hasBorder: undefined
					}
				] );
			} );

			it( 'should pass the number of columns to the color grid', () => {
				expect( colorGridView.element.getAttribute( 'style' ) ).to.match( /repeat\(5/g );
			} );
		} );

		describe( 'defaultColorValue option', () => {
			let view, locale;

			beforeEach( () => {
				locale = { t: val => val };
				view = new ColorInputView( locale, {
					colorDefinitions: DEFAULT_COLORS,
					columns: 5,
					defaultColorValue: 'rgb(255,0,0)'
				} );
				view.render();
			} );

			afterEach( () => {
				view.destroy();
			} );

			describe( 'dropdown', () => {
				describe( 'Remove color / Restore default', () => {
					let removeColorButton;

					beforeEach( () => {
						removeColorButton = view.dropdownView.panelView.children.first.colorGridsFragmentView.removeColorButtonView;
					} );

					it( 'should replace "Remove color" with "Restore default"', () => {
						expect( removeColorButton ).to.be.instanceOf( ButtonView );
						expect( removeColorButton.label ).to.equal( 'Restore default' );
					} );

					it( 'should set the empty #value upon #execute', () => {
						view.value = 'foo';

						view.dropdownView.isOpen = true;

						removeColorButton.fire( 'execute' );

						expect( view.value ).to.equal( 'rgb(255,0,0)' );
					} );
				} );
			} );
		} );

		describe( 'keyboard navigation', () => {
			let view, locale, colorGridView;

			beforeEach( () => {
				locale = { t: val => val };
				view = new ColorInputView( locale, {
					colorDefinitions: DEFAULT_COLORS,
					columns: 2
				} );
				view.render();
				global.document.body.appendChild( view.element );

				colorGridView = view.dropdownView.panelView.children.first.colorGridsFragmentView.staticColorsGrid;
			} );

			afterEach( () => {
				view.element.remove();
				view.destroy();
			} );

			describe( 'activates keyboard navigation in the color input view', () => {
				it( 'so "tab" focuses the next focusable item', () => {
					const keyEvtData = {
						keyCode: keyCodes.tab,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					};

					view.dropdownView.isOpen = true;

					// Mock the remove color button view is focused.
					view.focusTracker.isFocused = true;
					view.focusTracker.focusedElement = view.inputView.element;

					// Spy the next view which in this case is the color grid view.
					const spy = sinon.spy( view.dropdownView.buttonView, 'focus' );

					view.keystrokes.press( keyEvtData );
					sinon.assert.calledOnce( keyEvtData.preventDefault );
					sinon.assert.calledOnce( keyEvtData.stopPropagation );
					sinon.assert.calledOnce( spy );
				} );

				it( 'so "shift + tab" focuses the previous focusable item', () => {
					const keyEvtData = {
						keyCode: keyCodes.tab,
						shiftKey: true,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					};

					view.dropdownView.isOpen = true;

					// Mock the remove color button view is focused.
					view.focusTracker.isFocused = true;
					view.focusTracker.focusedElement = view.inputView.element;

					// Spy the previous view which in this case is the color grid view.
					const spy = sinon.spy( view.dropdownView.buttonView, 'focus' );

					view.keystrokes.press( keyEvtData );
					sinon.assert.calledOnce( keyEvtData.preventDefault );
					sinon.assert.calledOnce( keyEvtData.stopPropagation );
					sinon.assert.calledOnce( spy );
				} );
			} );

			describe( 'keyboard navigation in the color input grid', () => {
				it( '"arrow right" should focus the next focusable color button', () => {
					const keyEvtData = {
						keyCode: keyCodes.arrowright,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					};

					view.dropdownView.isOpen = true;

					// Mock the first color button is focused.
					colorGridView.focusTracker.isFocused = true;
					colorGridView.focusTracker.focusedElement = colorGridView.items.first.element;

					const spy = sinon.spy( colorGridView.items.get( 1 ), 'focus' );

					colorGridView.keystrokes.press( keyEvtData );
					sinon.assert.calledOnce( keyEvtData.preventDefault );
					sinon.assert.calledOnce( keyEvtData.stopPropagation );
					sinon.assert.calledOnce( spy );
				} );

				it( '"arrow down" should focus the focusable color button in the second row', () => {
					const keyEvtData = {
						keyCode: keyCodes.arrowdown,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					};

					view.dropdownView.isOpen = true;

					// Mock the first color button is focused.
					colorGridView.focusTracker.isFocused = true;
					colorGridView.focusTracker.focusedElement = colorGridView.items.first.element;

					const spy = sinon.spy( colorGridView.items.get( 2 ), 'focus' );

					colorGridView.keystrokes.press( keyEvtData );
					sinon.assert.calledOnce( keyEvtData.preventDefault );
					sinon.assert.calledOnce( keyEvtData.stopPropagation );
					sinon.assert.calledOnce( spy );
				} );
			} );
		} );
	} );

	describe( 'focus()', () => {
		it( 'should focus the input', () => {
			const spy = sinon.spy( inputView, 'focus' );

			view.focus();

			sinon.assert.calledOnce( spy );
		} );

		it( 'should focus the dropdown button if the backwards direction was specified', () => {
			const spy = sinon.spy( view.dropdownView.buttonView, 'focus' );

			view.focus( -1 );

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'render()', () => {
		it( 'starts listening for #keystrokes coming from the #element of the panel view in the dropdown view', () => {
			const view = new ColorInputView( locale, {
				colorDefinitions: DEFAULT_COLORS,
				columns: 5
			} );

			const spy = sinon.spy( view.keystrokes, 'listenTo' );

			view.render();
			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, view.element );

			view.destroy();
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy the FocusTracker instance', () => {
			const destroySpy = sinon.spy( view.focusTracker, 'destroy' );

			view.destroy();

			sinon.assert.calledOnce( destroySpy );
		} );

		it( 'should destroy the KeystrokeHandler instance', () => {
			const destroySpy = sinon.spy( view.keystrokes, 'destroy' );

			view.destroy();

			sinon.assert.calledOnce( destroySpy );
		} );
	} );
} );
