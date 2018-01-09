/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { normalizeOptions } from '../../src/fontfamily/utils';

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
						style: {
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
						style: {
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
							style: {
								'font-family': 'Arial'
							}
						},
						acceptsAlso: [
							{
								name: 'span',
								style: {
									'font-family': new RegExp( '("|\'|&qout;|\\W){0,2}Arial("|\'|&qout;|\\W){0,2}' )
								}
							}
						]
					},
					{
						title: 'Comic Sans MS',
						model: 'Comic Sans MS',
						view: {
							name: 'span',
							style: {
								'font-family': '\'Comic Sans MS\', sans-serif'
							}
						},
						acceptsAlso: [
							{
								name: 'span',
								style: {
									'font-family': new RegExp(
										'("|\'|&qout;|\\W){0,2}Comic Sans MS("|\'|&qout;|\\W){0,2},' +
										'("|\'|&qout;|\\W){0,2}sans-serif("|\'|&qout;|\\W){0,2}'
									)
								}
							}
						]
					},
					{
						title: 'Lucida Console',
						model: 'Lucida Console',
						view: {
							name: 'span',
							style: {
								'font-family': '\'Lucida Console\', \'Courier New\', Courier, monospace'
							}
						},
						acceptsAlso: [
							{
								name: 'span',
								style: {
									'font-family': new RegExp(
										'("|\'|&qout;|\\W){0,2}Lucida Console("|\'|&qout;|\\W){0,2},' +
										'("|\'|&qout;|\\W){0,2}Courier New("|\'|&qout;|\\W){0,2},' +
										'("|\'|&qout;|\\W){0,2}Courier("|\'|&qout;|\\W){0,2},' +
										'("|\'|&qout;|\\W){0,2}monospace("|\'|&qout;|\\W){0,2}'
									)
								}
							}
						]
					}
				] );
			} );
		} );
	} );
} );
