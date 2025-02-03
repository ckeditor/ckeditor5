/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	FONT_COLOR,
	FONT_BACKGROUND_COLOR,
	addColorSelectorToDropdown,
	renderDowncastElement
} from './../src/utils.js';
import { createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { Locale } from '@ckeditor/ckeditor5-utils';
import { ColorSelectorView } from '@ckeditor/ckeditor5-ui';

describe( 'utils', () => {
	testUtils.createSinonSandbox();

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
			const fake = testUtils.sinon.fake();
			const fakeViewWriter = { createAttributeElement: fake };

			downcastViewConverterFn( 'blue', { writer: fakeViewWriter } );

			sinon.assert.calledWithExactly( fake, 'span', { style: 'color:blue' }, { priority: 7 } );
		} );
	} );
} );
