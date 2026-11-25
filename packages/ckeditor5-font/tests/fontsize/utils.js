/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import { normalizeOptions } from '../../src/fontsize/utils.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

describe( 'FontSizeEditing Utils', () => {
	describe( 'normalizeOptions()', () => {
		it( 'should discard unsupported values', () => {
			expect( normalizeOptions( [ () => {}, 'default', 'unknown' ] ) ).toEqual( [ { title: 'Default', model: undefined } ] );
		} );

		it( 'should pass through object definition', () => {
			expect( normalizeOptions( [ {
				title: 'My Size',
				model: 'my-size',
				view: { name: 'span', styles: 'font-size: 12em;', priority: 7 }
			} ] ) ).toEqual( [
				{
					title: 'My Size',
					model: 'my-size',
					view: { name: 'span', styles: 'font-size: 12em;', priority: 7 }
				}
			] );
		} );

		it( 'should normalize "model" value of object definition', () => {
			expect( normalizeOptions( [ {
				title: 'Two',
				model: '2.0EM',
				view: { name: 'span', classes: 'text-two', priority: 7 }
			} ] ) ).toEqual( [
				{
					title: 'Two',
					model: '2em',
					view: { name: 'span', classes: 'text-two', priority: 7 }
				}
			] );
		} );

		it( 'should not modify object definition passed in the configuration', () => {
			const option = {
				title: 'Two',
				model: '2.0em',
				view: { name: 'span', classes: 'text-two', priority: 7 }
			};

			normalizeOptions( [ option ] );

			expect( option.model ).toEqual( '2.0em' );
		} );

		describe( 'named presets', () => {
			it( 'should return defined presets', () => {
				expect( normalizeOptions( [ 'tiny', 'small', 'default', 'big', 'huge' ] ) ).toEqual( [
					{ title: 'Tiny', model: 'tiny', view: { name: 'span', classes: 'text-tiny', priority: 7 } },
					{ title: 'Small', model: 'small', view: { name: 'span', classes: 'text-small', priority: 7 } },
					{ title: 'Default', model: undefined },
					{ title: 'Big', model: 'big', view: { name: 'span', classes: 'text-big', priority: 7 } },
					{ title: 'Huge', model: 'huge', view: { name: 'span', classes: 'text-huge', priority: 7 } }
				] );
			} );

			it( 'should add "view" definition if missing', () => {
				const tinyOption = {
					title: 'Tiny',
					model: 'tiny'
				};

				expect( normalizeOptions( [ tinyOption ] ) ).toEqual( [
					{ title: 'Tiny', model: 'tiny', view: { name: 'span', classes: 'text-tiny', priority: 7 } }
				] );
			} );

			it( 'should add "view.priority" to returned definition if missing', () => {
				const tinyOption = {
					title: 'Tiny',
					model: 'tiny',
					view: {
						name: 'span',
						classes: 'text-tiny'
					}
				};

				expect( normalizeOptions( [ tinyOption ] ) ).toEqual( [
					{ title: 'Tiny', model: 'tiny', view: { name: 'span', classes: 'text-tiny', priority: 7 } }
				] );
			} );

			it( 'should not modify "view.priority" if already specified', () => {
				const tinyOption = {
					title: 'Tiny',
					model: 'tiny',
					view: {
						name: 'span',
						classes: 'text-tiny',
						priority: 10
					}
				};

				expect( normalizeOptions( [ tinyOption ] ) ).toEqual( [
					{ title: 'Tiny', model: 'tiny', view: { name: 'span', classes: 'text-tiny', priority: 10 } }
				] );
			} );
		} );

		describe( 'numerical presets', () => {
			it( 'should return generated presets', () => {
				expect( normalizeOptions( [ '10', '12', 'default', '14.1', 18.3 ] ) ).toEqual( [
					{ title: '10', model: '10px', view: { name: 'span', styles: { 'font-size': '10px' }, priority: 7 } },
					{ title: '12', model: '12px', view: { name: 'span', styles: { 'font-size': '12px' }, priority: 7 } },
					{ title: 'Default', model: undefined },
					{ title: '14.1', model: '14.1px', view: { name: 'span', styles: { 'font-size': '14.1px' }, priority: 7 } },
					{ title: '18.3', model: '18.3px', view: { name: 'span', styles: { 'font-size': '18.3px' }, priority: 7 } }
				] );
			} );

			it( 'should normalize generated presets', () => {
				expect( normalizeOptions( [ '10.0', '012', 14.50 ] ) ).toEqual( [
					{ title: '10.0', model: '10px', view: { name: 'span', styles: { 'font-size': '10px' }, priority: 7 } },
					{ title: '012', model: '12px', view: { name: 'span', styles: { 'font-size': '12px' }, priority: 7 } },
					{ title: '14.5', model: '14.5px', view: { name: 'span', styles: { 'font-size': '14.5px' }, priority: 7 } }
				] );
			} );

			it( 'should add "view" definition if missing', () => {
				const numericOption = {
					title: '18',
					model: '18px'
				};

				expect( normalizeOptions( [ numericOption ] ) ).toEqual( [
					{ title: '18', model: '18px', view: { name: 'span', styles: { 'font-size': '18px' }, priority: 7 } }
				] );
			} );

			it( 'should normalize "model" value if "view" definition is missing', () => {
				const numericOption = {
					title: 'Two',
					model: '2.0EM'
				};

				expect( normalizeOptions( [ numericOption ] ) ).toEqual( [
					{ title: 'Two', model: '2em', view: { name: 'span', styles: { 'font-size': '2em' }, priority: 7 } }
				] );
			} );

			it( 'should discard incomprehensible value', () => {
				const numericOption = {
					title: '18',
					model: 'unknown'
				};

				expect( normalizeOptions( [ numericOption ] ) ).toEqual( [] );
			} );

			it( 'should add "view.priority" to returned definition if missing', () => {
				const numericOption = {
					title: '18',
					model: '18px',
					view: {
						name: 'span',
						styles: { 'font-size': '18px' }
					}
				};

				expect( normalizeOptions( [ numericOption ] ) ).toEqual( [
					{ title: '18', model: '18px', view: { name: 'span', styles: { 'font-size': '18px' }, priority: 7 } }
				] );
			} );

			it( 'should not modify "view.priority" if already specified', () => {
				const numericOption = {
					title: '18',
					model: '18px',
					view: {
						name: 'span',
						styles: { 'font-size': '18px' },
						priority: 10
					}
				};

				expect( normalizeOptions( [ numericOption ] ) ).toEqual( [
					{ title: '18', model: '18px', view: { name: 'span', styles: { 'font-size': '18px' }, priority: 10 } }
				] );
			} );

			it( 'should throw an error if definition misses "model" value', () => {
				const definition = {
					title: '18'
				};

				expectToThrowCKEditorError( () => {
					normalizeOptions( [ definition ] );
				}, /font-size-invalid-definition/, null, definition );
			} );
		} );
	} );
} );
