/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import {
	FONT_COLOR,
	FONT_BACKGROUND_COLOR,
	addColorSelectorToDropdown,
	renderDowncastElement
} from './../src/utils.js';
import { createDropdown, ColorSelectorView } from '@ckeditor/ckeditor5-ui';
import { Locale } from '@ckeditor/ckeditor5-utils';

describe( 'utils', () => {
	afterEach( () => {
		vi.restoreAllMocks();
	} );

	it( 'plugin names has proper values', () => {
		expect( FONT_COLOR ).to.equal( 'fontColor' );
		expect( FONT_BACKGROUND_COLOR ).to.equal( 'fontBackgroundColor' );
	} );

	describe( 'addColorSelectorToDropdown()', () => {
		it( 'should create dropdown with a color selector', () => {
			const locale = new Locale();
			const dropdown = createDropdown( locale );
			dropdown.render();

			addColorSelectorToDropdown( {
				dropdownView: dropdown,
				colors: [
					{
						label: 'Black',
						color: '#000',
						options: {
							hasBorder: false
						}
					},
					{
						label: 'White',
						color: '#FFFFFF',
						options: {
							hasBorder: true
						}
					}
				],
				columns: 2,
				removeButtonLabel: 'Remove Color'
			} );

			expect( dropdown.colorSelectorView ).to.be.instanceOf( ColorSelectorView );
			expect( dropdown.panelView.children.length ).to.equal( 1 );
			expect( dropdown.colorSelectorView.element ).to.equal( dropdown.panelView.children.first.element );
		} );
	} );

	describe( 'renderDowncastElement()', () => {
		it( 'should create function executes viewWriter with proper arguments', () => {
			const downcastViewConverterFn = renderDowncastElement( 'color' );
			const fake = vi.fn();
			const fakeViewWriter = { createAttributeElement: fake };

			downcastViewConverterFn( 'blue', { writer: fakeViewWriter } );

			expect( fake ).toHaveBeenCalledWith( 'span', { style: 'color:blue' }, { priority: 7 } );
		} );
	} );
} );
