/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import {
	FONT_COLOR,
	FONT_BACKGROUND_COLOR,
	addColorTableToDropdown,
	renderDowncastElement
} from './../src/utils';
import { createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import ColorTableView from './../src/ui/colortableview';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'utils', () => {
	testUtils.createSinonSandbox();

	it( 'plugin names has proper values', () => {
		expect( FONT_COLOR ).to.equal( 'fontColor' );
		expect( FONT_BACKGROUND_COLOR ).to.equal( 'fontBackgroundColor' );
	} );

	describe( 'addColorTableToDropdown()', () => {
		it( 'should create dropdown with color table', () => {
			const dropdown = createDropdown();
			dropdown.render();

			addColorTableToDropdown( {
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
				removeButtonTooltip: 'Remove Color'
			} );

			expect( dropdown.colorTableView ).to.be.instanceOf( ColorTableView );
			expect( dropdown.panelView.children.length ).to.equal( 1 );
			expect( dropdown.colorTableView.element ).to.equal( dropdown.panelView.children.first.element );
		} );
	} );

	describe( 'renderDowncastElement()', () => {
		it( 'should create function executes viewWriter with proper arguments', () => {
			const downcastViewConverterFn = renderDowncastElement( 'color' );
			const fake = testUtils.sinon.fake();
			const fakeViewWriter = { createAttributeElement: fake };

			downcastViewConverterFn( 'blue', fakeViewWriter );

			sinon.assert.calledWithExactly( fake, 'span', { style: 'color:blue' }, { priority: 7 } );
		} );
	} );
} );
