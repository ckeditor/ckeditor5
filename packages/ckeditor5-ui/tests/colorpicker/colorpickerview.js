/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals CustomEvent, document */

import ColorPickerView from './../../src/colorpicker/colorpickerview';
import 'vanilla-colorful/hex-color-picker.js';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'ColorGridView', () => {
	let locale, view, clock;

	beforeEach( () => {
		locale = { t() {} };
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
			expect( view.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-color-picker' ) ).to.be.true;
		} );

		it( 'should create input', () => {
			const input = view.element.children[ 1 ];
			expect( input.classList.contains( 'color-picker-hex-input' ) ).to.be.true;
		} );
	} );

	describe( 'render()', () => {
		it( 'should render color picker component', () => {
			const view = new ColorPickerView( locale );
			view.render();

			expect( view.picker.tagName ).to.equal( document.createElement( 'hex-color-picker' ).tagName );

			view.destroy();
		} );

		it( 'should update color state in input after changes in color picker', () => {
			const view = new ColorPickerView( locale );
			view.render();

			const event = new CustomEvent( 'color-changed', {
				detail: {
					value: '#ff0000'
				}
			} );

			view.picker.dispatchEvent( event );

			clock.tick( 200 );

			expect( view.input.element.value ).to.equal( '#ff0000' );

			view.destroy();
		} );

		it( 'should update color picker state after changes in input', async () => {
			const view = new ColorPickerView( locale );
			view.render();

			view.input.element.value = '#ff0000';
			view.input.fire( 'input' );

			clock.tick( 200 );

			expect( view.getColor() ).to.equal( '#ff0000' );
			view.destroy();
		} );
	} );

	describe( 'setColor()', () => {
		it( 'should set color on color picker', () => {
			const view = new ColorPickerView( locale );
			view.render();

			view.setColor( '#ff0000' );

			expect( view.picker.color ).to.equal( '#ff0000' );

			view.destroy();
		} );
	} );

	describe( 'getColor()', () => {
		it( 'should get current color from color picker component', () => {
			const view = new ColorPickerView( locale );
			view.render();

			view.setColor( '#ff0000' );

			expect( view.getColor() ).to.equal( '#ff0000' );

			view.destroy();
		} );
	} );
} );
