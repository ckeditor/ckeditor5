/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import {
	normalizeColorOptions,
	getLocalizedColorOptions
} from '@ckeditor/ckeditor5-ui/src/colorgrid/utils';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'utils', () => {
	testUtils.createSinonSandbox();

	describe( 'normalizeColorOptions()', () => {
		it( 'should return normalized config object from string', () => {
			const normalizedOption = normalizeColorOptions( [ 'black' ] );

			expect( normalizedOption ).to.deep.equal( [
				{
					model: 'black',
					label: 'black',
					hasBorder: false,
					view: {
						name: 'span',
						styles: {
							color: 'black'
						}
					}
				}
			] );
		} );

		it( 'should return normalized config object from object( color )', () => {
			const normalizedOption = normalizeColorOptions( [ { color: 'black' } ] );

			expect( normalizedOption ).to.deep.equal( [
				{
					model: 'black',
					label: 'black',
					hasBorder: false,
					view: {
						name: 'span',
						styles: {
							color: 'black'
						}
					}
				}
			] );
		} );

		it( 'should return normalized config object from object( color, label )', () => {
			const normalizedOption = normalizeColorOptions( [
				{
					color: 'black',
					label: 'Black'
				}
			] );

			expect( normalizedOption ).to.deep.equal( [
				{
					model: 'black',
					label: 'Black',
					hasBorder: false,
					view: {
						name: 'span',
						styles: {
							color: 'black'
						}
					}
				}
			] );
		} );

		it( 'should return normalized config object from object( color, label, hasBorder )', () => {
			const normalizedOption = normalizeColorOptions( [
				{
					color: 'black',
					label: 'Black',
					hasBorder: true
				}
			] );

			expect( normalizedOption ).to.deep.equal( [
				{
					model: 'black',
					label: 'Black',
					hasBorder: true,
					view: {
						name: 'span',
						styles: {
							color: 'black'
						}
					}
				}
			] );
		} );

		it( 'should return normalized config object from object( color, hasBorder )', () => {
			const normalizedOption = normalizeColorOptions( [
				{
					color: 'black',
					hasBorder: true
				}
			] );

			expect( normalizedOption ).to.deep.equal( [
				{
					model: 'black',
					label: 'black',
					hasBorder: true,
					view: {
						name: 'span',
						styles: {
							color: 'black'
						}
					}
				}
			] );
		} );
	} );

	describe( 'getLocalizedColorOptions()', () => {
		const locale = {
			t: string => 'Localized:' + string
		};

		it( 'should return localized color options', () => {
			expect( getLocalizedColorOptions( locale, [
				{
					color: 'red',
					label: 'Red'
				},
				{
					color: 'blue',
					label: 'Blue'
				}
			] ) ).to.deep.equal( [
				{
					color: 'red',
					label: 'Localized:Red'
				},
				{
					color: 'blue',
					label: 'Localized:Blue'
				}
			] );
		} );

		it( 'should omit unknown color options', () => {
			expect( getLocalizedColorOptions( locale, [
				{
					color: 'red',
					label: 'Red'
				},
				{
					color: 'unknown',
					label: 'Unknown'
				}
			] ) ).to.deep.equal( [
				{
					color: 'red',
					label: 'Localized:Red'
				},
				{
					color: 'unknown',
					label: 'Unknown'
				}
			] );
		} );
	} );
} );
