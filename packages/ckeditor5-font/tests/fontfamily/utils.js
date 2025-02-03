/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { normalizeOptions } from '../../src/fontfamily/utils.js';

describe( 'FontFamily utils', () => {
	describe( 'normalizeOptions()', () => {
		it( 'should discard unsupported values', () => {
			expect( normalizeOptions( [ () => {}, 0, true ] ) ).to.deep.equal( [] );
		} );

		it( 'should pass through object definition', () => {
			expect( normalizeOptions( [
				'default',
				{
					title: 'Comic Sans',
					model: 'comic',
					view: {
						name: 'span',
						styles: {
							'font-family': 'Comic Sans'
						}
					}
				}
			] ) ).to.deep.equal( [
				{
					model: undefined,
					title: 'Default'
				},
				{
					title: 'Comic Sans',
					model: 'comic',
					view: {
						name: 'span',
						styles: {
							'font-family': 'Comic Sans'
						}
					}
				}
			] );
		} );

		describe( 'shorthand presets', () => {
			it( 'should return full preset from string presets', () => {
				expect( normalizeOptions( ( [
					'Arial',
					'"Comic Sans MS", sans-serif',
					'Lucida Console, \'Courier New\', Courier, monospace'
				] ) ) ).to.deep.equal( [
					{
						title: 'Arial',
						model: 'Arial',
						view: {
							name: 'span',
							styles: {
								'font-family': 'Arial'
							},
							priority: 7
						}
					},
					{
						title: 'Comic Sans MS',
						model: '\'Comic Sans MS\', sans-serif',
						view: {
							name: 'span',
							styles: {
								'font-family': '\'Comic Sans MS\', sans-serif'
							},
							priority: 7
						}
					},
					{
						title: 'Lucida Console',
						model: '\'Lucida Console\', \'Courier New\', Courier, monospace',
						view: {
							name: 'span',
							styles: {
								'font-family': '\'Lucida Console\', \'Courier New\', Courier, monospace'
							},
							priority: 7
						}
					}
				] );
			} );
		} );
	} );
} );
