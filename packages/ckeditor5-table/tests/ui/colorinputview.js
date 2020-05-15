/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global Event */

import ColorInputView from '../../src/ui/colorinputview';
import InputTextView from '@ckeditor/ckeditor5-ui/src/inputtext/inputtextview';
import ColorGridView from '@ckeditor/ckeditor5-ui/src/colorgrid/colorgridview';
import DropdownView from '@ckeditor/ckeditor5-ui/src/dropdown/dropdownview';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

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
	let view, locale, colorGridView, removeColorButton, inputView;

	beforeEach( () => {
		locale = { t: val => val };
		view = new ColorInputView( locale, {
			colorDefinitions: DEFAULT_COLORS,
			columns: 5
		} );
		view.render();

		inputView = view._inputView;
		removeColorButton = view._dropdownView.panelView.children.first;
		colorGridView = view._dropdownView.panelView.children.last;
	} );

	afterEach( () => {
		view.destroy();
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

		it( 'should set #hasError', () => {
			expect( view.hasError ).to.be.false;
		} );

		describe( 'dropdown', () => {
			it( 'should be created', () => {
				expect( view._dropdownView ).to.be.instanceOf( DropdownView );
				expect( view._dropdownView.buttonView.element.classList.contains( 'ck-input-color__button' ) ).to.be.true;
				expect( view._dropdownView.buttonView.tooltip ).to.equal( 'Color picker' );
			} );

			it( 'should bind #isEnabled to the view\'s #isReadOnly', () => {
				view.isReadOnly = false;
				expect( view._dropdownView.isEnabled ).to.be.true;

				view.isReadOnly = true;
				expect( view._dropdownView.isEnabled ).to.be.false;
			} );

			it( 'should have the color preview', () => {
				const preview = view._dropdownView.buttonView.children.first;

				expect( preview.element.classList.contains( 'ck' ) ).to.be.true;
				expect( preview.element.classList.contains( 'ck-input-color__button__preview' ) ).to.be.true;
			} );

			it( 'should display no-color preview when color is not set', () => {
				const preview = view._dropdownView.buttonView.children.first;
				const noColorPreview = preview.element.firstChild;

				view.value = 'hsl(0, 0, 50%)';

				expect( noColorPreview.classList.contains( 'ck-hidden' ) ).to.be.true;

				view.value = '';

				expect( noColorPreview.classList.contains( 'ck-hidden' ) ).to.be.false;
			} );

			it( 'should have the remove color button', () => {
				expect( view._dropdownView.panelView.children.first ).to.be.instanceOf( ButtonView );
			} );

			describe( 'position', () => {
				it( 'should be SouthWest in LTR', () => {
					locale.uiLanguageDirection = 'ltr';
					view = new ColorInputView( locale, {
						colorDefinitions: DEFAULT_COLORS,
						columns: 5
					} );
					view.render();

					expect( view._dropdownView.panelPosition ).to.equal( 'sw' );
				} );

				it( 'should be SouthEast in RTL', () => {
					locale.uiLanguageDirection = 'rtl';
					view = new ColorInputView( locale, {
						colorDefinitions: DEFAULT_COLORS,
						columns: 5
					} );
					view.render();

					expect( view._dropdownView.panelPosition ).to.equal( 'se' );
				} );
			} );
		} );

		describe( 'color grid', () => {
			it( 'should be an instance of ColorGridView', () => {
				expect( colorGridView ).to.be.instanceOf( ColorGridView );
			} );

			it( 'should set ColorInputView#value upon ColorTileView#execute', () => {
				expect( view.value ).to.equal( '' );

				colorGridView.items.last.fire( 'execute' );

				expect( view.value ).to.equal( 'rgb(0,0,255)' );
			} );

			it( 'should set InputTextView#value to the selected color\'s label upon ColorTileView#execute', () => {
				expect( inputView.value ).to.equal( '' );

				colorGridView.items.last.fire( 'execute' );

				expect( inputView.value ).to.equal( 'Blue' );
			} );

			it( 'should close the dropdown upon ColorTileView#execute', () => {
				view._dropdownView.isOpen = true;

				colorGridView.items.last.fire( 'execute' );

				expect( view._dropdownView.isOpen ).to.be.false;
			} );

			it( 'should fire the ColorInputView#input event upon ColorTileView#execute', () => {
				const spy = sinon.spy( view, 'fire' );

				colorGridView.items.last.fire( 'execute' );

				sinon.assert.calledWithExactly( spy.lastCall, 'input' );
			} );

			it( 'should have #selectedColor bound to the #value', () => {
				view.value = 'rgb(0,255,0)';
				expect( colorGridView.selectedColor ).to.equal( 'rgb(0,255,0)' );

				view.value = 'rgb(0,0,255)';
				expect( colorGridView.selectedColor ).to.equal( 'rgb(0,0,255)' );
			} );
		} );

		describe( 'remove color button', () => {
			it( 'should be created from the template', () => {
				expect( removeColorButton.element.classList.contains( 'ck-input-color__remove-color' ) ).to.be.true;
				expect( removeColorButton.withText ).to.be.true;
				expect( removeColorButton.label ).to.equal( 'Remove color' );
			} );

			it( 'should set the empty #value upon #execute', () => {
				view.value = 'foo';

				removeColorButton.fire( 'execute' );

				expect( view.value ).to.equal( '' );
			} );

			it( 'should close the #_dropdownView upon #execute', () => {
				view._dropdownView.isOpen = true;

				removeColorButton.fire( 'execute' );

				expect( view._dropdownView.isOpen ).to.be.false;
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

			it( 'should have #hasError bound to the color input', () => {
				view.hasError = true;
				expect( inputView.hasError ).to.equal( true );

				view.hasError = false;
				expect( inputView.hasError ).to.equal( false );
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
			expect( view.element.firstChild ).to.equal( inputView.element );
			expect( view.element.lastChild ).to.equal( view._dropdownView.element );
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

		describe( 'template bindings', () => {
			it( 'should bind the element class to #hasError', () => {
				expect( view.element.classList.contains( 'ck-error' ) ).to.be.false;

				view.hasError = true;
				expect( view.element.classList.contains( 'ck-error' ) ).to.be.true;
			} );

			it( 'should bind element id to #id', () => {
				expect( view.element.id ).to.equal( '' );

				view.id = 'foo';
				expect( view.element.id ).to.equal( 'foo' );
			} );

			it( 'should bind the "aria-invalid" attribute to #hasError', () => {
				expect( view.element.getAttribute( 'aria-invalid' ) ).to.be.null;

				view.hasError = true;
				expect( view.element.getAttribute( 'aria-invalid' ) ).to.equal( 'true' );
			} );

			it( 'should bind the "aria-describedby" attribute to #ariaDescribedById', () => {
				expect( view.element.getAttribute( 'aria-describedby' ) ).to.be.null;

				view.ariaDescribedById = 'foo';
				expect( view.element.getAttribute( 'aria-describedby' ) ).to.equal( 'foo' );
			} );
		} );
	} );

	describe( 'focus()', () => {
		it( 'should focus the input', () => {
			const spy = sinon.spy( inputView, 'focus' );

			view.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );
} );
