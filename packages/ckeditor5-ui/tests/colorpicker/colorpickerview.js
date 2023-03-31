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
		view = new ColorPickerView( locale );
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
			const input = view.element.children[ 1 ];
			expect( [ ...input.classList ] ).to.include( 'color-picker-hex-input' );
		} );
	} );

	describe( 'render()', () => {
		it( 'should render color picker component', () => {
			expect( view.picker.tagName ).to.equal( document.createElement( 'hex-color-picker' ).tagName );
		} );

		it( 'should update color state in input after changes in color picker', () => {
			const event = new CustomEvent( 'color-changed', {
				detail: {
					value: '#ff0000'
				}
			} );

			view.picker.dispatchEvent( event );

			clock.tick( 200 );

			expect( view.input.fieldView.value ).to.equal( '#ff0000' );
		} );
	} );

	it( 'should update color property after changes in input', () => {
		view.input.fieldView.value = '#ff0000';
		view.input.fieldView.fire( 'input' );

		clock.tick( 200 );

		expect( view.color ).to.equal( '#ff0000' );
	} );

	describe( 'color property', () => {
		it( 'should be initialized with a proper value', () => {
			expect( view.color ).to.be.equal( '' );
		} );

		it( 'should be observable', () => {
			const observableSpy = testUtils.sinon.spy();

			view.on( 'change:color', observableSpy );

			view.color = '#ff0000';

			sinon.assert.calledOnce( observableSpy );
		} );
	} );

	describe( '#setColor()', () => {
		const pickerOutputFormats = [ 'hex', 'rgb', 'hsl', 'hwb', 'lab', 'lch' ];
		const testColors = {
			hex: '#E64C4C',
			hsl: 'hsl(0, 75%, 60%)'
			// rgb: '',
			// hwb: '',
			// lab: '',
			// lch: ''
		};

		pickerOutputFormats.forEach( format => {
			describe( `when picker output is set to ${ format }`, () => {
				for ( const color in testColors ) {
					describe( `and color is in ${ color } format`, () => {
						let view;

						beforeEach( () => {
							view = new ColorPickerView( locale, format );
							view.render();
						} );

						it( 'should set hex color on component', () => {
							view.setColor( 'hsl(0, 75%, 60%)' );

							expect( view.color ).to.equal( '#E64C4C' );
						} );

						it( 'should set hex color on picker', () => {
							view.setColor( 'hsl(0, 75%, 60%)' );

							expect( view.element.firstChild.getAttribute( 'color' ) ).to.equal( '#E64C4C' );
						} );

						it( 'should set hex color in input', () => {
							view.setColor( 'hsl(0, 75%, 60%)' );

							expect( view.input.fieldView.value ).to.equal( '#E64C4C' );
						} );
					} );
				}
			} );
		} );
	} );

	describe( '#_debouncePickerEvent()', () => {
		const pickerOutputFormats = [ 'hex', 'rgb', 'hsl', 'hwb', 'lab', 'lch' ];

		pickerOutputFormats.forEach( format => {
			describe( `when picker output is set to ${ format }`, () => {
				let view;

				beforeEach( () => {
					view = new ColorPickerView( locale, format );
					view.render();
				} );

				it( 'should fire change event with color in the configured format', () => {
					const spy = sinon.spy();
					view.on( 'change', spy );
					// const spy = sinon.spy;

					view._debouncePickerEvent( '#E64C4C' );

					// expect( spy.)
				} );
			} );
		} );
	} );
} );
