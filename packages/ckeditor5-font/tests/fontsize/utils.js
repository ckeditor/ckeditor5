/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { normalizeOptions, FONT_SIZE_PRESET_UNITS } from '../../src/fontsize/utils';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

describe( 'FontSizeEditing Utils', () => {
	describe( 'normalizeOptions()', () => {
		it( 'should discard unsupported values', () => {
			expect( normalizeOptions( [ () => {}, 'default', 'unknown' ] ) ).to.deep.equal( [ { title: 'Default', model: undefined } ] );
		} );

		it( 'should pass through object definition', () => {
			expect( normalizeOptions( [ {
				title: 'My Size',
				model: 'my-size',
				view: { name: 'span', styles: 'font-size: 12em;', priority: 7 }
			} ] ) ).to.deep.equal( [
				{
					title: 'My Size',
					model: 'my-size',
					view: { name: 'span', styles: 'font-size: 12em;', priority: 7 }
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

			it( 'should return defined presets with units in model values if disableValueMatching=true', () => {
				const options = normalizeOptions( [ 'tiny', 'small', 'default', 'big', 'huge' ], { disableValueMatching: true } );

				expect( options ).to.deep.equal( [
					{ title: 'Tiny', model: '0.7em', view: { name: 'span', classes: 'text-tiny', priority: 7 } },
					{ title: 'Small', model: '0.85em', view: { name: 'span', classes: 'text-small', priority: 7 } },
					{ title: 'Default', model: undefined },
					{ title: 'Big', model: '1.4em', view: { name: 'span', classes: 'text-big', priority: 7 } },
					{ title: 'Huge', model: '1.8em', view: { name: 'span', classes: 'text-huge', priority: 7 } }
				] );
			} );

			it( 'should add "view" definition if missing', () => {
				const tinyOption = {
					title: 'Tiny',
					model: 'tiny'
				};

				expect( normalizeOptions( [ tinyOption ] ) ).to.deep.equal( [
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

				expect( normalizeOptions( [ tinyOption ] ) ).to.deep.equal( [
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

				expect( normalizeOptions( [ tinyOption ] ) ).to.deep.equal( [
					{ title: 'Tiny', model: 'tiny', view: { name: 'span', classes: 'text-tiny', priority: 10 } }
				] );
			} );
		} );

		describe( 'numerical presets', () => {
			it( 'should return generated presets', () => {
				expect( normalizeOptions( [ '10', '12', 'default', '14.1', 18.3 ] ) ).to.deep.equal( [
					{ title: '10', model: '10px', view: { name: 'span', styles: { 'font-size': '10px' }, priority: 7 } },
					{ title: '12', model: '12px', view: { name: 'span', styles: { 'font-size': '12px' }, priority: 7 } },
					{ title: 'Default', model: undefined },
					{ title: '14.1', model: '14.1px', view: { name: 'span', styles: { 'font-size': '14.1px' }, priority: 7 } },
					{ title: '18.3', model: '18.3px', view: { name: 'span', styles: { 'font-size': '18.3px' }, priority: 7 } }
				] );
			} );

			it( 'should add "view" definition if missing', () => {
				const numericOption = {
					title: '18',
					model: '18px'
				};

				expect( normalizeOptions( [ numericOption ] ) ).to.deep.equal( [
					{ title: '18', model: '18px', view: { name: 'span', styles: { 'font-size': '18px' }, priority: 7 } }
				] );
			} );

			it( 'should discard incomprehensible value', () => {
				const numericOption = {
					title: '18',
					model: 'unknown'
				};

				expect( normalizeOptions( [ numericOption ] ) ).to.deep.equal( [] );
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

				expect( normalizeOptions( [ numericOption ] ) ).to.deep.equal( [
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

				expect( normalizeOptions( [ numericOption ] ) ).to.deep.equal( [
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

	describe( 'FONT_SIZE_PRESET_UNITS', () => {
		it( 'provides default values', () => {
			expect( Object.keys( FONT_SIZE_PRESET_UNITS ).length ).to.equal( 4 );
		} );
	} );
} );
