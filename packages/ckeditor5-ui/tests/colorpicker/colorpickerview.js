/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals CustomEvent, document */

import ColorPickerView from './../../src/colorpicker/colorpickerview';
import 'vanilla-colorful/hex-color-picker.js';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { Locale } from '@ckeditor/ckeditor5-utils';

describe( 'ColorPickerView', () => {
	let locale, view, clock;

	beforeEach( () => {
		locale = new Locale();
		view = new ColorPickerView( locale, { format: 'hex' } );
		clock = sinon.useFakeTimers();
		view.render();
	} );

	afterEach( () => {
		view.destroy();
		clock.restore();
	} );

	testUtils.createSinonSandbox();

	describe( 'constructor()', () => {
		it( 'creates element from template', () => {
			expect( [ ...view.element.classList ] ).to.include( 'ck-color-picker', 'ck' );
		} );

		it( 'should create input', () => {
			const input = view.element.children[ 1 ].children[ 1 ];
			expect( [ ...input.classList ] ).to.include( 'color-picker-hex-input' );
		} );

		it( 'assigns a proper default format value', () => {
			const pickerView = new ColorPickerView( locale, {} );
			expect( pickerView._format ).to.equal( 'hsl' );
		} );
	} );

	describe( 'color text input field', () => {
		it( 'should get value updated if picker\'s state property was changed', () => {
			view.color = '#0000ff';

			clock.tick( 200 );

			expect( view.hexInputRow.children.get( 1 ).fieldView.value ).to.equal( '0000ff' );
		} );

		it( 'should update color property after getting an input', () => {
			view.hexInputRow.children.get( 1 ).fieldView.value = '#ff0000';
			view.hexInputRow.children.get( 1 ).fieldView.fire( 'input' );

			clock.tick( 200 );

			expect( view.color ).to.equal( '#ff0000' );
		} );

		it( 'should trim whitespace from the beginning of the string', () => {
			view.color = '#222222';

			view.hexInputRow.children.get( 1 ).isFocused = true;
			view.hexInputRow.children.get( 1 ).fieldView.value = '   000000';
			view.hexInputRow.children.get( 1 ).fieldView.fire( 'input' );

			clock.tick( 200 );

			expect( view.color ).to.equal( '#000000' );
		} );

		it( 'should trim whitespace from the end of the string', () => {
			view.color = '#222222';

			view.hexInputRow.children.get( 1 ).isFocused = true;
			view.hexInputRow.children.get( 1 ).fieldView.value = '000000   ';
			view.hexInputRow.children.get( 1 ).fieldView.fire( 'input' );

			clock.tick( 200 );

			expect( view.color ).to.equal( '#000000' );
		} );

		it( 'should trim whitespace from both the beginning and the end of the string', () => {
			view.color = '#222222';

			view.hexInputRow.children.get( 1 ).isFocused = true;
			view.hexInputRow.children.get( 1 ).fieldView.value = '   000000   ';
			view.hexInputRow.children.get( 1 ).fieldView.fire( 'input' );

			clock.tick( 200 );

			expect( view.color ).to.equal( '#000000' );
		} );

		it( 'should trim whitespace before the hash if it was passed', () => {
			view.color = '#222222';

			view.hexInputRow.children.get( 1 ).isFocused = true;
			view.hexInputRow.children.get( 1 ).fieldView.value = '   #000000';
			view.hexInputRow.children.get( 1 ).fieldView.fire( 'input' );

			clock.tick( 200 );

			expect( view.color ).to.equal( '#000000' );
		} );

		describe( 'should update color property', () => {
			describe( 'when hex color was passed', () => {
				describe( 'in 3-character format', () => {
					testColorUpdateFromInput( {
						name: 'with `#` at the beginning',
						inputValue: '#abc',
						expectedInput: '#abc',
						expectedColorProperty: '#abc'
					} );

					testColorUpdateFromInput( {
						name: 'without `#` at the beginning',
						inputValue: 'abc',
						expectedInput: 'abc',
						expectedColorProperty: '#abc'
					} );
				} );

				describe( 'in 4-character format', () => {
					testColorUpdateFromInput( {
						name: 'with `#` at the beginning',
						inputValue: '#abcd',
						expectedInput: '#abcd',
						expectedColorProperty: '#abcd'
					} );

					testColorUpdateFromInput( {
						name: 'without `#` at the beginning',
						inputValue: 'abcd',
						expectedInput: 'abcd',
						expectedColorProperty: '#abcd'
					} );
				} );

				describe( 'in 6-character format', () => {
					testColorUpdateFromInput( {
						name: 'with `#` at the beginning',
						inputValue: '#abcdef',
						expectedInput: '#abcdef',
						expectedColorProperty: '#abcdef'
					} );

					testColorUpdateFromInput( {
						name: 'without `#` at the beginning',
						inputValue: 'abcdef',
						expectedInput: 'abcdef',
						expectedColorProperty: '#abcdef'
					} );
				} );

				describe( 'in 8-character format', () => {
					testColorUpdateFromInput( {
						name: 'with `#` at the beginning',
						inputValue: '#abcdefab',
						expectedInput: '#abcdefab',
						expectedColorProperty: '#abcdefab'
					} );

					testColorUpdateFromInput( {
						name: 'without `#` at the beginning',
						inputValue: 'abcdefab',
						expectedInput: 'abcdefab',
						expectedColorProperty: '#abcdefab'
					} );
				} );
			} );
		} );

		describe( 'should not update color property', () => {
			it( 'during input editing when focused', () => {
				view.color = '#000000';

				view.hexInputRow.children.get( 1 ).isFocused = true;
				view.hexInputRow.children.get( 1 ).fieldView.value = '#ffffff';
				view.hexInputRow.children.get( 1 ).fieldView.fire( 'input' );

				view.color = '#aaaaaa';

				clock.tick( 200 );

				expect( view.hexInputRow.children.get( 1 ).fieldView.value ).to.equal( '#ffffff' );
			} );

			describe( 'when set incorrect color', () => {
				describe( 'wrong input length', () => {
					testColorUpdateFromInput( {
						name: '1 character',
						inputValue: 'f',
						expectedInput: 'f',
						expectedColorProperty: '#000000'
					} );

					testColorUpdateFromInput( {
						name: '2 characters',
						inputValue: 'ff',
						expectedInput: 'ff',
						expectedColorProperty: '#000000'
					} );

					testColorUpdateFromInput( {
						name: '5 characters',
						inputValue: 'ffaaa',
						expectedInput: 'ffaaa',
						expectedColorProperty: '#000000'
					} );

					testColorUpdateFromInput( {
						name: '7 characters',
						inputValue: 'ffaaaaa',
						expectedInput: 'ffaaaaa',
						expectedColorProperty: '#000000'
					} );

					testColorUpdateFromInput( {
						name: 'more than 8 characters',
						inputValue: 'ffaaffaaff',
						expectedInput: 'ffaaffaaff',
						expectedColorProperty: '#000000'
					} );
				} );

				describe( 'wrong color format', () => {
					testColorUpdateFromInput( {
						name: 'rgb',
						inputValue: 'rgb( 100, 100, 100 )',
						expectedInput: 'rgb( 100, 100, 100 )',
						expectedColorProperty: '#000000'
					} );

					testColorUpdateFromInput( {
						name: 'hsl',
						inputValue: 'hsl( 30, 75%, 60 % )',
						expectedInput: 'hsl( 30, 75%, 60 % )',
						expectedColorProperty: '#000000'
					} );

					testColorUpdateFromInput( {
						name: 'color name',
						inputValue: 'red',
						expectedInput: 'red',
						expectedColorProperty: '#000000'
					} );
				} );
			} );
		} );
	} );

	describe( 'render()', () => {
		it( 'should render color picker component', () => {
			expect( view.picker.tagName ).to.equal( document.createElement( 'hex-color-picker' ).tagName );
		} );

		it( 'should listen to 3rd party picker color change event', () => {
			const event = new CustomEvent( 'color-changed', {
				detail: {
					value: '#ff0000'
				}
			} );

			view.picker.dispatchEvent( event );

			clock.tick( 200 );

			expect( view.color ).to.equal( '#ff0000' );
		} );
	} );

	describe( 'focus()', () => {
		it( 'should focus slider', () => {
			const slider = view.slidersView.first;

			const spy = sinon.spy( slider.element, 'focus' );

			view.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'color property', () => {
		it( 'should be initialized with a proper value', () => {
			expect( view.color ).to.be.equal( '' );
		} );

		it( 'should be observable', () => {
			const observableSpy = testUtils.sinon.spy();

			view.on( 'change:color', observableSpy );

			view.color = '#ff0000';

			expect( observableSpy.callCount ).to.equal( 1 );
		} );

		describe( 'output format integration', () => {
			it( 'respects rgb output format', () => {
				view._format = 'rgb';
				view.color = '#001000';

				expect( view.color ).to.equal( 'rgb( 0, 16, 0 )' );
			} );

			it( 'respects hex output format', () => {
				view._format = 'hex';
				view.color = '#0000f1';

				expect( view.color ).to.equal( '#0000f1' );
			} );

			it( 'respects hsl output format', () => {
				view._format = 'hsl';
				view.color = '#3D9BFF';

				expect( view.color ).to.equal( 'hsl( 211, 100%, 62% )' );
			} );

			it( 'respects hwb output format', () => {
				view._format = 'hwb';
				view.color = '#5cb291';

				expect( view.color ).to.equal( 'hwb( 157, 36, 30 )' );
			} );

			it( 'respects lab output format', () => {
				view._format = 'lab';
				view.color = '#bfe972';

				expect( view.color ).to.equal( 'lab( 87% -32 53 )' );
			} );

			it( 'respects lch output format', () => {
				view._format = 'lch';
				view.color = '#be0909';

				expect( view.color ).to.equal( 'lch( 40% 81 39 )' );
			} );
		} );

		it( 'normalizes format for subsequent changes to the same color but in different format', () => {
			view.color = 'rgb( 255, 0, 0 )';

			// At one point color property (format conversion) was driven by _hexColor value **change**.
			// This was wrong because _hexColor is normalized, so if you set it to same color in one format
			// and then in another - there's no change in normalized color.
			// So _hexColor change event was not triggered, thus no format was enforced.
			view.color = 'red';

			expect( view.color ).to.equal( '#FF0000' );
		} );
	} );

	describe( '_hexColor property', () => {
		describe( 'follows the color property and', () => {
			it( 'reflects a hex value', () => {
				view.color = '#ff0000';

				expect( view._hexColor ).to.equal( '#ff0000' );
			} );

			it( 'forces hex value in a lowercased format', () => {
				view.color = '#0000FF';

				expect( view._hexColor ).to.equal( '#0000ff' );
			} );

			it( 'normalizes shorten hex value', () => {
				view.color = '#00F';

				expect( view._hexColor ).to.equal( '#0000ff' );
			} );

			it( 'properly converts rgb format', () => {
				view.color = 'rgb(0, 255, 0)';

				expect( view._hexColor ).to.equal( '#00ff00' );
			} );

			it( 'properly converts hsl format', () => {
				view.color = 'hsl(42, 100%, 52%)';

				expect( view._hexColor ).to.equal( '#ffb60a' );
			} );

			it( 'properly converts keyword format', () => {
				view.color = 'red';

				expect( view._hexColor ).to.equal( '#ff0000' );
			} );

			it( 'unfolds a shortened hex format', () => {
				view.color = '#00f';

				expect( view._hexColor ).to.equal( '#0000ff' );
			} );

			it( 'handles an empty value', () => {
				view.color = '#fff';
				view.color = '';

				expect( view._hexColor ).to.equal( '#000000' );
			} );

			it( 'gracefully handles an invalid value', () => {
				view.color = '#fff';
				view.color = 'lorem ipsum dolor';

				expect( view._hexColor ).to.equal( '#000000' );
			} );

			it( 'doesn\'t trigger multiple changes if changed to a same color in different format', () => {
				view._hexColor = '#00ff00';

				const observableSpy = sinon.spy();

				view.on( 'change:_hexColor', observableSpy );

				view.color = '#00ff00';

				expect( observableSpy.callCount, 'first attempt' ).to.equal( 0 );

				view.color = '#00FF00';

				expect( observableSpy.callCount, 'second attempt' ).to.equal( 0 );

				view.color = 'rgb(0, 255, 0)';

				expect( observableSpy.callCount, 'third attempt' ).to.equal( 0 );
			} );
		} );

		describe( 'propagation to the color property', () => {
			it( 'propagates a simple hex value change', () => {
				view._hexColor = '#f1e2a3';

				expect( view.color ).to.equal( '#f1e2a3' );
			} );
		} );
	} );

	describe( 'SliderView', () => {
		it( 'focuses the slider in DOM', () => {
			const slider = view.slidersView.first;

			const spy = sinon.spy( slider.element, 'focus' );

			slider.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );

	function testColorUpdateFromInput( options ) {
		it( options.name, () => {
			const fieldView = view.hexInputRow.children.get( 1 ).fieldView;
			view.color = '#000000';

			fieldView.isFocused = true;
			fieldView.value = options.inputValue;
			fieldView.fire( 'input' );

			clock.tick( 200 );

			expect( fieldView.value, 'Wrong input value' ).to.equal( options.expectedInput );
			expect( view.color, 'Wrong color property value' ).to.equal( options.expectedColorProperty );
		} );
	}
} );
