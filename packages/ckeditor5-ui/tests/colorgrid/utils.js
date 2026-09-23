/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import {
	normalizeColorOptions,
	getLocalizedColorOptions,
	getLocalizedColorName
} from '../../src/colorgrid/utils.js';

describe( 'utils', () => {
	describe( 'normalizeColorOptions()', () => {
		it( 'should return normalized config object from string', () => {
			const normalizedOption = normalizeColorOptions( [ 'black' ] );

			expect( normalizedOption ).toEqual( [
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

			expect( normalizedOption ).toEqual( [
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

			expect( normalizedOption ).toEqual( [
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

			expect( normalizedOption ).toEqual( [
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

			expect( normalizedOption ).toEqual( [
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

	describe( 'getLocalizedColorName()', () => {
		const locale = {
			t: string => 'Localized:' + string
		};

		it( 'should translate a plain color name', () => {
			expect( getLocalizedColorName( locale, 'Red' ) ).toBe( 'Localized:Red' );
		} );

		it( 'should translate the hue of a shaded color name and keep the shade', () => {
			expect( getLocalizedColorName( locale, 'Amber 500' ) ).toBe( 'Localized:Amber 500' );
			expect( getLocalizedColorName( locale, 'Blue grey 700' ) ).toBe( 'Localized:Blue grey 700' );
		} );

		it( 'should return an unknown color name unchanged', () => {
			expect( getLocalizedColorName( locale, 'Unknown' ) ).toBe( 'Unknown' );
			expect( getLocalizedColorName( locale, 'Unknown 600' ) ).toBe( 'Unknown 600' );
			expect( getLocalizedColorName( locale, 'toString' ) ).toBe( 'toString' );
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
			] ) ).toEqual( [
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

		it( 'should localize the hue of a shaded color option and keep the shade', () => {
			expect( getLocalizedColorOptions( locale, [
				{
					color: 'hsl(1, 77%, 55%)',
					label: 'Red 600'
				},
				{
					color: 'hsl(199, 18%, 33%)',
					label: 'Blue grey 700'
				}
			] ) ).toEqual( [
				{
					color: 'hsl(1, 77%, 55%)',
					label: 'Localized:Red 600'
				},
				{
					color: 'hsl(199, 18%, 33%)',
					label: 'Localized:Blue grey 700'
				}
			] );
		} );

		it( 'should leave a shaded color option with an unknown hue untouched', () => {
			expect( getLocalizedColorOptions( locale, [
				{
					color: '#123456',
					label: 'Unknown 600'
				}
			] ) ).toEqual( [
				{
					color: '#123456',
					label: 'Unknown 600'
				}
			] );
		} );

		it( 'should leave labels matching inherited object properties untouched', () => {
			expect( getLocalizedColorOptions( locale, [
				{
					color: '#123456',
					label: 'toString'
				},
				{
					color: '#654321',
					label: 'constructor 500'
				}
			] ) ).toEqual( [
				{
					color: '#123456',
					label: 'toString'
				},
				{
					color: '#654321',
					label: 'constructor 500'
				}
			] );
		} );

		it( 'should leave color options with unknown labels untouched', () => {
			expect( getLocalizedColorOptions( locale, [
				{
					color: 'red',
					label: 'Red'
				},
				{
					color: 'unknown',
					label: 'Unknown'
				}
			] ) ).toEqual( [
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
