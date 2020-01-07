/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { normalizeOptions } from '../../src/fontsize/utils';

describe( 'FontSizeEditing Utils', () => {
	describe( 'normalizeOptions()', () => {
		it( 'should discard unsupported values', () => {
			expect( normalizeOptions( [ () => {}, 'default', 'unknown' ] ) ).to.deep.equal( [ { title: 'Default', model: undefined } ] );
		} );

		it( 'should pass through object definition', () => {
			expect( normalizeOptions( [ {
				title: 'My Size',
				model: 'my-size',
				view: { name: 'span', styles: 'font-size: 12em;' }
			} ] ) ).to.deep.equal( [
				{
					title: 'My Size',
					model: 'my-size',
					view: { name: 'span', styles: 'font-size: 12em;' }
				}
			] );
		} );

		describe( 'named presets', () => {
			it( 'should return defined presets', () => {
				expect( normalizeOptions( [ 'tiny', 'small', 'default', 'big', 'huge' ] ) ).to.deep.equal( [
					{ title: 'Tiny', model: 'tiny', view: { name: 'span', classes: 'text-tiny', priority: 7 } },
					{ title: 'Small', model: 'small', view: { name: 'span', classes: 'text-small', priority: 7 } },
					{ title: 'Default', model: undefined },
					{ title: 'Big', model: 'big', view: { name: 'span', classes: 'text-big', priority: 7 } },
					{ title: 'Huge', model: 'huge', view: { name: 'span', classes: 'text-huge', priority: 7 } }
				] );
			} );
		} );

		describe( 'numerical presets', () => {
			it( 'should return generated presets', () => {
				expect( normalizeOptions( [ '10', 12, 'default', '14.1', 18.3 ] ) ).to.deep.equal( [
					{ title: '10', model: 10, view: { name: 'span', styles: { 'font-size': '10px' }, priority: 7 } },
					{ title: '12', model: 12, view: { name: 'span', styles: { 'font-size': '12px' }, priority: 7 } },
					{ title: 'Default', model: undefined },
					{ title: '14.1', model: 14.1, view: { name: 'span', styles: { 'font-size': '14.1px' }, priority: 7 } },
					{ title: '18.3', model: 18.3, view: { name: 'span', styles: { 'font-size': '18.3px' }, priority: 7 } }
				] );
			} );
		} );
	} );
} );
