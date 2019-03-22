/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { FONT_COLOR, FONT_BACKGROUND_COLOR, normalizeOptions, addColorsToDropdown } from './../src/utils';
import { createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import ColorTableView from './../src/ui/colortableview';

describe( 'utils', () => {
	describe( 'color and background color related', () => {
		it( 'plugin names has proper values', () => {
			expect( FONT_COLOR ).to.equal( 'fontColor' );
			expect( FONT_BACKGROUND_COLOR ).to.equal( 'fontBackgroundColor' );
		} );

		it( 'normalizeOptions can produce the same output object', () => {
			const normalizedArray = normalizeOptions( [
				'black',
				{
					color: 'black'
				}, {
					color: 'black',
					label: 'Black'
				}, {
					color: 'black',
					label: 'Black',
					hasBorder: true
				}, {
					color: 'black',
					hasBorder: true
				}
			] );

			expect( normalizedArray ).to.deep.equal( [
				{
					model: 'black',
					label: 'black',
					hasBorder: false,
					view: {
						name: 'span',
						styles: {
							color: 'black'
						},
						priority: 5
					}
				}, {
					model: 'black',
					label: 'black',
					hasBorder: false,
					view: {
						name: 'span',
						styles: {
							color: 'black'
						},
						priority: 5
					}
				}, {
					model: 'black',
					label: 'Black',
					hasBorder: false,
					view: {
						name: 'span',
						styles: {
							color: 'black'
						},
						priority: 5
					}
				},
				{
					model: 'black',
					label: 'Black',
					hasBorder: true,
					view: {
						name: 'span',
						styles: {
							color: 'black'
						},
						priority: 5
					}
				},
				{
					model: 'black',
					label: 'black',
					hasBorder: true,
					view: {
						name: 'span',
						styles: {
							color: 'black'
						},
						priority: 5
					}
				},
			] );
		} );

		it( 'adding colors table to dropdown works', () => {
			const dropdown = createDropdown();
			dropdown.render();

			addColorsToDropdown( {
				dropdownView: dropdown,
				colors: [
					{
						label: 'Black',
						color: '#000',
						options: {
							hasBorder: false
						}
					}, {
						label: 'White',
						color: '#FFFFFF',
						options: {
							hasBorder: true
						}
					}
				],
				colorColumns: 2,
				removeButtonTooltip: 'Remove Color'
			} );

			expect( dropdown.colorTableView ).to.be.instanceOf( ColorTableView );
			expect( dropdown.panelView.children.length ).to.equal( 1 );
		} );
	} );
} );
