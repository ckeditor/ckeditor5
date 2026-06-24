/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';

import { StylesMap, StylesProcessor } from '../../../src/view/stylesmap.js';
import { addBackgroundStylesRules } from '../../../src/view/styles/background.js';

describe( 'Background styles normalization', () => {
	let styles;

	beforeEach( () => {
		const stylesProcessor = new StylesProcessor();
		addBackgroundStylesRules( stylesProcessor );
		styles = new StylesMap( stylesProcessor );
	} );

	describe( 'background shorthand', () => {
		it( 'should preserve incorrect background value', () => {
			styles.setTo( 'background: rgba( hello, world )' );

			expect( styles.toString() ).toBe( 'background:rgba( hello, world );' );
		} );

		it( 'should normalize background', () => {
			styles.setTo( 'background:url("example.jpg") center #f00 repeat-y fixed border-box;' );

			const normalized = styles.getNormalized( 'background' );
			expect( normalized ).toEqual( {
				attachment: [ 'fixed' ],
				image: [ 'url("example.jpg")' ],
				position: [ 'center' ],
				repeat: [ 'repeat-y' ],
				size: [ 'auto' ],
				origin: [ 'border-box' ],
				clip: [ 'border-box' ],
				color: '#f00'
			} );
		} );

		it( 'should normalize background with gradient', () => {
			styles.setTo(
				'background: ' +
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%) ' +
					'center #f00 repeat-y fixed border-box;'
			);

			const normalized = styles.getNormalized( 'background' );
			expect( normalized ).toEqual( {
				attachment: [ 'fixed' ],
				image: [ 'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%)' ],
				position: [ 'center' ],
				repeat: [ 'repeat-y' ],
				size: [ 'auto' ],
				origin: [ 'border-box' ],
				clip: [ 'border-box' ],
				color: '#f00'
			} );
		} );

		it( 'should normalize multiple gradients', () => {
			styles.setTo(
				'background: ' +
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%), ' +
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%) ' +
					'center #f00 repeat-y fixed border-box;'
			);

			const normalized = styles.getNormalized( 'background' );
			expect( normalized ).toEqual( {
				attachment: [ 'scroll', 'fixed' ],
				color: '#f00',
				image: [
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%)',
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%)'
				],
				position: [ '0% 0%', 'center' ],
				repeat: [ 'repeat', 'repeat-y' ],
				size: [ 'auto', 'auto' ],
				origin: [ 'padding-box', 'border-box' ],
				clip: [ 'border-box', 'border-box' ]
			} );
		} );

		it( 'should normalize background (color with spaces)', () => {
			styles.setTo( 'background:url("example.jpg") center rgb(253, 253, 119) repeat-y fixed border-box;' );

			const normalized = styles.getNormalized( 'background' );
			expect( normalized ).toEqual( {
				attachment: [ 'fixed' ],
				image: [ 'url("example.jpg")' ],
				position: [ 'center' ],
				repeat: [ 'repeat-y' ],
				size: [ 'auto' ],
				origin: [ 'border-box' ],
				clip: [ 'border-box' ],
				color: 'rgb(253, 253, 119)'
			} );
		} );

		it( 'should normalize background (color only with spaces)', () => {
			styles.setTo( 'background: rgb(253, 253, 119);' );

			const normalized = styles.getNormalized( 'background' );
			expect( normalized ).toEqual( {
				attachment: [ 'scroll' ],
				clip: [ 'border-box' ],
				color: 'rgb(253, 253, 119)',
				image: [ 'none' ],
				origin: [ 'padding-box' ],
				position: [ '0% 0%' ],
				repeat: [ 'repeat' ],
				size: [ 'auto' ]
			} );
		} );

		it( 'should normalize background with layers', () => {
			styles.setTo( 'background:url("test.jpg") repeat-y,#f00;' );

			const normalized = styles.getNormalized( 'background' );
			expect( normalized ).toEqual( {
				attachment: [ 'scroll', 'scroll' ],
				clip: [ 'border-box', 'border-box' ],
				color: '#f00',
				image: [ 'url("test.jpg")', 'none' ],
				origin: [ 'padding-box', 'padding-box' ],
				position: [ '0% 0%', '0% 0%' ],
				repeat: [ 'repeat-y', 'repeat' ],
				size: [ 'auto', 'auto' ]
			} );
		} );

		it( 'should preserve background position written using percentage value', () => {
			styles.setTo( 'background: 10% 20%;' );

			const normalized = styles.getNormalized( 'background' );
			expect( normalized ).to.have.property( 'position' ).that.deep.equals( [ '10% 20%' ] );
		} );

		it( 'should preserve background size and background position separated by slash', () => {
			styles.setTo( 'background: url("test.jpg") center / contain;' );

			expect( styles.getNormalized( 'background' ) ).toEqual( {
				attachment: [ 'scroll' ],
				image: [ 'url("test.jpg")' ],
				position: [ 'center' ],
				repeat: [ 'repeat' ],
				size: [ 'contain' ],
				origin: [ 'padding-box' ],
				clip: [ 'border-box' ]
			} );
		} );

		it( 'should preserve background size and background position separated by slash (digits)', () => {
			styles.setTo( 'background: url("test.jpg") 30% 30% / 50% 50%;' );

			expect( styles.getNormalized( 'background' ) ).toEqual( {
				attachment: [ 'scroll' ],
				image: [ 'url("test.jpg")' ],
				position: [ '30% 30%' ],
				repeat: [ 'repeat' ],
				size: [ '50% 50%' ],
				origin: [ 'padding-box' ],
				clip: [ 'border-box' ]
			} );
		} );

		it( 'should preserve background size and background position separated by slash (mixed)', () => {
			styles.setTo( 'background: url("test.jpg") center / 50% 50%;' );

			expect( styles.getNormalized( 'background' ) ).toEqual( {
				attachment: [ 'scroll' ],
				image: [ 'url("test.jpg")' ],
				position: [ 'center' ],
				repeat: [ 'repeat' ],
				size: [ '50% 50%' ],
				origin: [ 'padding-box' ],
				clip: [ 'border-box' ]
			} );
		} );
	} );

	describe( 'background-image', () => {
		it( 'should normalize with URL', () => {
			styles.setTo( 'background-image: url("example.jpg");' );

			expect( styles.getNormalized( 'background' ) ).toEqual( {
				image: [ 'url("example.jpg")' ]
			} );
		} );

		it( 'should normalize with single gradient', () => {
			styles.setTo(
				'background-image: linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%);'
			);

			expect( styles.getNormalized( 'background' ) ).toEqual( {
				image: [ 'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%)' ]
			} );
		} );

		it( 'should normalize with none value', () => {
			styles.setTo( 'background-image: none;' );

			expect( styles.getNormalized( 'background' ) ).toEqual( {
				image: [ 'none' ]
			} );
		} );

		it( 'should normalize with mixed none and gradient', () => {
			styles.setTo(
				'background-image: none, linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%);'
			);

			expect( styles.getNormalized( 'background' ) ).toEqual( {
				image: [
					'none',
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%)'
				]
			} );
		} );

		it( 'should normalize with multiple gradients', () => {
			styles.setTo(
				'background-image: ' +
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%), ' +
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%);'
			);

			expect( styles.getNormalized( 'background' ) ).toEqual( {
				image: [
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%)',
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%)'
				]
			} );
		} );

		it( 'should normalize combined with background-color', () => {
			styles.setTo(
				'background-image: linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%);' +
				'background-color: #f00;'
			);

			expect( styles.getNormalized( 'background' ) ).toEqual( {
				image: [ 'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%)' ],
				color: '#f00'
			} );
		} );
	} );

	describe( 'background-color', () => {
		it( 'should normalize background-color', () => {
			styles.setTo( 'background-color:#f00;' );

			expect( styles.getNormalized( 'background' ) ).toEqual( { color: '#f00' } );
		} );

		it( 'should normalize background-color with rgb() value', () => {
			styles.setTo( 'background-color:rgba(253, 253, 119, 1);' );

			expect( styles.getNormalized( 'background' ) ).toEqual( { color: 'rgba(253, 253, 119, 1)' } );
		} );
	} );

	describe( 'background-repeat', () => {
		it( 'should normalize single value', () => {
			styles.setTo( 'background-repeat: repeat-x;' );

			expect( styles.getNormalized( 'background' ) ).toEqual( { repeat: [ 'repeat-x' ] } );
		} );

		it( 'should normalize multiple values', () => {
			styles.setTo( 'background-repeat: repeat-x, no-repeat;' );

			expect( styles.getNormalized( 'background' ) ).toEqual( { repeat: [ 'repeat-x', 'no-repeat' ] } );
		} );

		it( 'should normalize multiple values with spaces', () => {
			styles.setTo( 'background-repeat: repeat-x no-repeat, space;' );

			expect( styles.getNormalized( 'background' ) ).toEqual( { repeat: [ 'repeat-x no-repeat', 'space' ] } );
		} );
	} );

	describe( 'background-position', () => {
		it( 'should normalize single value', () => {
			styles.setTo( 'background-position: center;' );

			expect( styles.getNormalized( 'background' ) ).toEqual( { position: [ 'center' ] } );
		} );

		it( 'should normalize multiple values', () => {
			styles.setTo( 'background-position: center, top;' );

			expect( styles.getNormalized( 'background' ) ).toEqual( { position: [ 'center', 'top' ] } );
		} );

		it( 'should normalize multiple values with spaces', () => {
			styles.setTo( 'background-position: center, top left;' );

			expect( styles.getNormalized( 'background' ) ).toEqual( { position: [ 'center', 'top left' ] } );
		} );
	} );

	describe( 'background-size', () => {
		it( 'should normalize single value', () => {
			styles.setTo( 'background-size: contain;' );

			expect( styles.getNormalized( 'background' ) ).toEqual( { size: [ 'contain' ] } );
		} );

		it( 'should normalize multiple values', () => {
			styles.setTo( 'background-size: contain, cover;' );

			expect( styles.getNormalized( 'background' ) ).toEqual( { size: [ 'contain', 'cover' ] } );
		} );

		it( 'should normalize multiple values with spaces', () => {
			styles.setTo( 'background-size: contain, 50% 50%;' );

			expect( styles.getNormalized( 'background' ) ).toEqual( { size: [ 'contain', '50% 50%' ] } );
		} );
	} );

	describe( 'background-attachment', () => {
		it( 'should normalize single value', () => {
			styles.setTo( 'background-attachment: fixed;' );

			expect( styles.getNormalized( 'background' ) ).toEqual( { attachment: [ 'fixed' ] } );
		} );

		it( 'should normalize multiple values', () => {
			styles.setTo( 'background-attachment: scroll, fixed;' );

			expect( styles.getNormalized( 'background' ) ).toEqual( { attachment: [ 'scroll', 'fixed' ] } );
		} );

		it( 'should normalize multiple values with spaces', () => {
			styles.setTo( 'background-attachment: scroll, fixed, local;' );

			expect( styles.getNormalized( 'background' ) ).toEqual( { attachment: [ 'scroll', 'fixed', 'local' ] } );
		} );
	} );

	describe( 'background-origin', () => {
		it( 'should normalize single value', () => {
			styles.setTo( 'background-origin: padding-box;' );

			expect( styles.getNormalized( 'background' ) ).toEqual( { origin: [ 'padding-box' ] } );
		} );

		it( 'should normalize multiple values', () => {
			styles.setTo( 'background-origin: padding-box, border-box;' );

			expect( styles.getNormalized( 'background' ) ).toEqual( { origin: [ 'padding-box', 'border-box' ] } );
		} );

		it( 'should normalize content-box value', () => {
			styles.setTo( 'background-origin: content-box;' );

			expect( styles.getNormalized( 'background' ) ).toEqual( { origin: [ 'content-box' ] } );
		} );
	} );

	describe( 'background-clip', () => {
		it( 'should normalize single value', () => {
			styles.setTo( 'background-clip: border-box;' );

			expect( styles.getNormalized( 'background' ) ).toEqual( { clip: [ 'border-box' ] } );
		} );

		it( 'should normalize multiple values', () => {
			styles.setTo( 'background-clip: padding-box, border-box;' );

			expect( styles.getNormalized( 'background' ) ).toEqual( { clip: [ 'padding-box', 'border-box' ] } );
		} );

		it( 'should normalize text value', () => {
			styles.setTo( 'background-clip: text;' );

			expect( styles.getNormalized( 'background' ) ).toEqual( { clip: [ 'text' ] } );
		} );
	} );

	describe( 'serialization', () => {
		describe( 'shorthand', () => {
			it( 'should serialize to shorthand when image is set', () => {
				styles.setTo( 'background: url("test.png") no-repeat center / cover fixed content-box padding-box;' );

				expect( styles.toString() ).toBe(
					'background:url("test.png") center / cover no-repeat fixed content-box padding-box;'
				);
			} );

			it( 'should serialize shorthand with all longhand properties set across multiple layers', () => {
				styles.setTo(
					'background:' +
					'url("a.png") top left / 100px 200px no-repeat fixed content-box padding-box,' +
					'url("b.png") bottom right / 50px 50px repeat scroll border-box content-box red;'
				);

				expect( styles.toString() ).toBe(
					'background:' +
					'url("a.png") top left / 100px 200px no-repeat fixed content-box padding-box, ' +
					'url("b.png") bottom right / 50px 50px border-box content-box red;'
				);
			} );

			it( 'should serialize single-layer background value without commas via splitByTopLevelCommas', () => {
				styles.setTo( 'background: url("single.png") center no-repeat fixed border-box;' );

				expect( styles.toString() ).toBe(
					'background:url("single.png") center no-repeat fixed border-box;'
				);
			} );

			it( 'should output inline background style', () => {
				styles.setTo( 'background:url("example.jpg") center #f00 repeat-y fixed border-box;' );

				expect( styles.toString() ).toBe(
					'background:url("example.jpg") center repeat-y fixed border-box #f00;'
				);
			} );

			it( 'should output background size and position separated by slash', () => {
				styles.setTo( 'background: url("test.jpg") center / contain;' );

				expect( styles.toString() ).toBe( 'background:url("test.jpg") center / contain;' );
			} );

			it( 'should output background size with default position when only size is non-default', () => {
				styles.setTo( 'background: url("test.jpg") 0% 0% / contain;' );

				expect( styles.toString() ).toBe( 'background:url("test.jpg") 0% 0% / contain;' );
			} );

			it( 'should output default values', () => {
				styles.setTo( 'background: none repeat scroll 0% 0% #000;' );

				expect( styles.toString() ).toBe( 'background:#000;' );
			} );

			it( 'should output origin and clip when a single box value is set in shorthand', () => {
				styles.setTo( 'background: red padding-box;' );

				expect( styles.toString() ).toBe( 'background:padding-box red;' );
			} );

			it( 'should output both origin and clip when they differ in shorthand', () => {
				styles.setTo( 'background: red padding-box content-box;' );

				expect( styles.toString() ).toBe( 'background:padding-box content-box red;' );
			} );

			it( 'should not output background when all properties are removed', () => {
				styles.setTo( 'background:url("example.jpg") center #f00 repeat-y fixed border-box;' );

				styles.remove( 'background-attachment' );
				styles.remove( 'background-image' );
				styles.remove( 'background-position' );
				styles.remove( 'background-repeat' );
				styles.remove( 'background-size' );
				styles.remove( 'background-origin' );
				styles.remove( 'background-clip' );
				styles.remove( 'background-color' );

				expect( styles.toString() ).toBe( '' );
			} );

			it( 'should return undefined background shorthand when all layer values are at their defaults', () => {
				styles.setTo( 'background: none;' );

				expect( styles.getAsString( 'background' ) ).toBeUndefined();
			} );

			it( 'should handle background-image longhand with a trailing comma', () => {
				styles.setTo( 'background-image: url("a.png"),;' );

				expect( styles.getAsString( 'background-image' ) ).toBe( 'url("a.png")' );
			} );

			it( 'should serialize shorthand skipping second layer when image array is shorter than repeat array', () => {
				styles.setTo( 'background: url("a.png") no-repeat scroll padding-box border-box; background-repeat: no-repeat, repeat;' );

				expect( styles.getAsString( 'background' ) ).toBe( 'url("a.png") no-repeat' );
			} );

			it( 'should serialize shorthand skipping second layer properties when repeat array is shorter than image array', () => {
				styles.setTo( 'background: no-repeat scroll padding-box border-box; background-image: url("a.png"), url("b.png");' );

				expect( styles.getAsString( 'background' ) ).toBe( 'url("a.png") no-repeat, url("b.png")' );
			} );

			describe( 'layers', () => {
				it( 'should output inline background-image style with single gradient layer', () => {
					styles.setTo(
						'background: ' +
							'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%) ' +
							'center #f00 repeat-y fixed border-box;'
					);

					expect( styles.toString() ).toBe(
						'background:linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%) ' +
							'center repeat-y fixed border-box #f00;'
					);
				} );

				it( 'should output inline background-image style with multiple gradient layers', () => {
					styles.setTo(
						'background: ' +
							'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%), ' +
							'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%) center #f00 repeat-y fixed;'
					);

					expect( styles.toString() ).toBe(
						'background:linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%), ' +
						'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%) center repeat-y fixed #f00;'
					);
				} );

				it( 'should output inline background-image style with mixed layers', () => {
					styles.setTo(
						'background: url("example.jpg") repeat-y, ' +
							'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%) center #f00;'
					);

					expect( styles.toString() ).toBe(
						'background:url("example.jpg") repeat-y, ' +
						'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%) center #f00;'
					);
				} );

				it( 'should output multiple layers containing spaces in position fields', () => {
					styles.setTo(
						'background: ' +
							'url("example.jpg") left top, ' +
							'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%) center right;'
					);

					expect( styles.toString() ).toBe(
						'background:url("example.jpg") left top, ' +
						'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%) center right;'
					);
				} );
			} );
		} );

		describe( 'longhand', () => {
			it( 'should output background-color', () => {
				styles.setTo( 'background-color: #f00;' );

				expect( styles.toString() ).toBe( 'background-color:#f00;' );
			} );

			it( 'should output background-image with URL', () => {
				styles.setTo( 'background-image: url("example.jpg");' );

				expect( styles.toString() ).toBe( 'background-image:url("example.jpg");' );
			} );

			it( 'should output background-repeat', () => {
				styles.setTo( 'background-repeat: repeat-x;' );

				expect( styles.toString() ).toBe( 'background-repeat:repeat-x;' );
			} );

			it( 'should output background-position', () => {
				styles.setTo( 'background-position: center;' );

				expect( styles.toString() ).toBe( 'background-position:center;' );
			} );

			it( 'should output background-size', () => {
				styles.setTo( 'background-size: cover;' );

				expect( styles.toString() ).toBe( 'background-size:cover;' );
			} );

			it( 'should output background-attachment', () => {
				styles.setTo( 'background-attachment: fixed;' );

				expect( styles.toString() ).toBe( 'background-attachment:fixed;' );
			} );

			it( 'should output background-origin', () => {
				styles.setTo( 'background-origin: content-box;' );

				expect( styles.toString() ).toBe( 'background-origin:content-box;' );
			} );

			it( 'should output background-clip', () => {
				styles.setTo( 'background-clip: text;' );

				expect( styles.toString() ).toBe( 'background-clip:text;' );
			} );

			it( 'should output background-image combined with background-color', () => {
				styles.setTo(
					'background-image: linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%);' +
					'background-color: #f00;'
				);

				expect( styles.toString() ).toBe(
					'background-color:#f00;' +
					'background-image:linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%);'
				);
			} );

			it( 'should output multiple longhand properties combined', () => {
				styles.setTo( 'background-color: #f00; background-repeat: no-repeat; background-position: center;' );

				expect( styles.toString() ).toBe(
					'background-color:#f00;' +
					'background-position:center;' +
					'background-repeat:no-repeat;'
				);
			} );

			describe( 'layers', () => {
				it( 'should output background-image with single gradient', () => {
					styles.setTo(
						'background-image: linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%);'
					);

					expect( styles.toString() ).toBe(
						'background-image:linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%);'
					);
				} );

				it( 'should output background-image with multiple gradients', () => {
					styles.setTo(
						'background-image: ' +
							'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%), ' +
							'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%);'
					);

					expect( styles.toString() ).toBe(
						'background-image:' +
							'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%), ' +
							'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%);'
					);
				} );

				it( 'should output background-repeat with multiple layer values', () => {
					styles.setTo( 'background-repeat: no-repeat, repeat-x;' );

					expect( styles.toString() ).toBe( 'background-repeat:no-repeat, repeat-x;' );
				} );

				it( 'should output background-position with multiple layer values', () => {
					styles.setTo( 'background-position: center, top left;' );

					expect( styles.toString() ).toBe( 'background-position:center, top left;' );
				} );

				it( 'should output background-size with multiple layer values', () => {
					styles.setTo( 'background-size: contain, cover;' );

					expect( styles.toString() ).toBe( 'background-size:contain, cover;' );
				} );

				it( 'should output background-attachment with multiple layer values', () => {
					styles.setTo( 'background-attachment: fixed, scroll;' );

					expect( styles.toString() ).toBe( 'background-attachment:fixed, scroll;' );
				} );

				it( 'should output background-origin with multiple layer values', () => {
					styles.setTo( 'background-origin: padding-box, border-box;' );

					expect( styles.toString() ).toBe( 'background-origin:padding-box, border-box;' );
				} );

				it( 'should output background-clip with multiple layer values', () => {
					styles.setTo( 'background-clip: border-box, padding-box;' );

					expect( styles.toString() ).toBe( 'background-clip:border-box, padding-box;' );
				} );

				it( 'should output multiple longhand properties combined with multiple layer values', () => {
					styles.setTo(
						'background-image: url("example.jpg"), url("example2.jpg"); ' +
						'background-repeat: no-repeat, repeat-x; ' +
						'background-position: center, top left; ' +
						'background-size: contain, cover;'
					);

					expect( styles.toString() ).toBe(
						'background-image:url("example.jpg"), url("example2.jpg");' +
						'background-position:center, top left;' +
						'background-repeat:no-repeat, repeat-x;' +
						'background-size:contain, cover;'
					);
				} );
			} );
		} );
	} );

	describe( 'getAsString', () => {
		it( 'should return background-color from longhand', () => {
			styles.setTo( 'background-color: #f00;' );

			expect( styles.getAsString( 'background-color' ) ).toBe( '#f00' );
		} );

		it( 'should return background-color from background shorthand', () => {
			styles.setTo( 'background: #f00;' );

			expect( styles.getAsString( 'background-color' ) ).toBe( '#f00' );
		} );

		it( 'should return background-image with URL', () => {
			styles.setTo( 'background-image: url("example.jpg");' );

			expect( styles.getAsString( 'background-image' ) ).toBe( 'url("example.jpg")' );
		} );

		it( 'should return background-image with single gradient', () => {
			styles.setTo(
				'background-image: linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%);'
			);

			expect( styles.getAsString( 'background-image' ) ).toBe(
				'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%)'
			);
		} );

		it( 'should return background-image with multiple gradients', () => {
			styles.setTo(
				'background-image: ' +
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%), ' +
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%);'
			);

			expect( styles.getAsString( 'background-image' ) ).toBe(
				'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%), ' +
				'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%)'
			);
		} );

		it( 'should return background-image with mixed none and gradient', () => {
			styles.setTo(
				'background-image: none, linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%);'
			);

			expect( styles.getAsString( 'background-image' ) ).toBe(
				'none, linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%)'
			);
		} );

		it( 'should return background-image from background shorthand with single layer', () => {
			styles.setTo( 'background: url("example.jpg") center #f00 repeat-y fixed border-box;' );

			expect( styles.getAsString( 'background-image' ) ).toBe( 'url("example.jpg")' );
		} );

		it( 'should return background-image from background shorthand with multiple gradient layers', () => {
			styles.setTo(
				'background: ' +
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%), ' +
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%) center #f00 repeat-y fixed;'
			);

			expect( styles.getAsString( 'background-image' ) ).toBe(
				'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%), ' +
				'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%)'
			);
		} );

		it( 'should return background-image from background shorthand with mixed URL and gradient layers', () => {
			styles.setTo(
				'background: url("example.jpg") repeat-y, ' +
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%) center #f00;'
			);

			expect( styles.getAsString( 'background-image' ) ).toBe(
				'url("example.jpg"), linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%)'
			);
		} );

		it( 'should return background-image combined with background-color', () => {
			styles.setTo(
				'background-image: linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%);' +
				'background-color: #f00;'
			);

			expect( styles.getAsString( 'background-image' ) ).toBe(
				'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%)'
			);
			expect( styles.getAsString( 'background-color' ) ).toBe( '#f00' );
		} );

		it( 'should return background-repeat from single-layer background shorthand', () => {
			styles.setTo( 'background: url("example.jpg") repeat-x;' );

			expect( styles.getAsString( 'background-repeat' ) ).toBe( 'repeat-x' );
		} );

		it( 'should return background-repeat from multiple-layer background shorthand', () => {
			styles.setTo(
				'background: ' +
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%), ' +
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%) center #f00 repeat-y fixed;'
			);

			expect( styles.getAsString( 'background-repeat' ) ).toBe( 'repeat, repeat-y' );
		} );

		it( 'should return background-position from single-layer background shorthand', () => {
			styles.setTo( 'background: url("example.jpg") center;' );

			expect( styles.getAsString( 'background-position' ) ).toBe( 'center' );
		} );

		it( 'should return background-position from multiple-layer background shorthand', () => {
			styles.setTo(
				'background: ' +
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%), ' +
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%) center #f00 repeat-y fixed;'
			);

			expect( styles.getAsString( 'background-position' ) ).toBe( '0% 0%, center' );
		} );

		it( 'should return background-attachment from single-layer background shorthand', () => {
			styles.setTo( 'background: url("example.jpg") center #f00 repeat-y fixed border-box;' );

			expect( styles.getAsString( 'background-attachment' ) ).toBe( 'fixed' );
		} );

		it( 'should return background-attachment from multiple-layer background shorthand', () => {
			styles.setTo(
				'background: ' +
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%), ' +
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%) center #f00 repeat-y fixed;'
			);

			expect( styles.getAsString( 'background-attachment' ) ).toBe( 'scroll, fixed' );
		} );

		it( 'should return background-repeat from background-repeat longhand', () => {
			styles.setTo( 'background-repeat: repeat-x;' );

			expect( styles.getAsString( 'background-repeat' ) ).toBe( 'repeat-x' );
		} );

		it( 'should return background-repeat from background-repeat longhand with multiple values', () => {
			styles.setTo( 'background-repeat: repeat-x, no-repeat;' );

			expect( styles.getAsString( 'background-repeat' ) ).toBe( 'repeat-x, no-repeat' );
		} );

		it( 'should return background-position from background-position longhand', () => {
			styles.setTo( 'background-position: center;' );

			expect( styles.getAsString( 'background-position' ) ).toBe( 'center' );
		} );

		it( 'should return background-position from background-position longhand with multiple values', () => {
			styles.setTo( 'background-position: center, top left;' );

			expect( styles.getAsString( 'background-position' ) ).toBe( 'center, top left' );
		} );

		it( 'should return background-size from background-size longhand', () => {
			styles.setTo( 'background-size: cover, 50% 50%;' );

			expect( styles.getAsString( 'background-size' ) ).toBe( 'cover, 50% 50%' );
		} );

		it( 'should return background-attachment from background-attachment longhand', () => {
			styles.setTo( 'background-attachment: fixed;' );

			expect( styles.getAsString( 'background-attachment' ) ).toBe( 'fixed' );
		} );

		it( 'should return background-attachment from background-attachment longhand with multiple values', () => {
			styles.setTo( 'background-attachment: scroll, fixed;' );

			expect( styles.getAsString( 'background-attachment' ) ).toBe( 'scroll, fixed' );
		} );

		it( 'should return background-origin from longhand', () => {
			styles.setTo( 'background-origin: content-box;' );

			expect( styles.getAsString( 'background-origin' ) ).toBe( 'content-box' );
		} );

		it( 'should return background-origin from background shorthand', () => {
			styles.setTo( 'background: red padding-box;' );

			expect( styles.getAsString( 'background-origin' ) ).toBe( 'padding-box' );
		} );

		it( 'should return background-clip from longhand', () => {
			styles.setTo( 'background-clip: text;' );

			expect( styles.getAsString( 'background-clip' ) ).toBe( 'text' );
		} );

		it( 'should return background-clip from background shorthand', () => {
			styles.setTo( 'background: red padding-box content-box;' );

			expect( styles.getAsString( 'background-clip' ) ).toBe( 'content-box' );
		} );

		it( 'should return background shorthand from single-layer background shorthand', () => {
			styles.setTo( 'background: url("example.jpg") center #f00 repeat-y fixed border-box;' );

			expect( styles.getAsString( 'background' ) ).toBe( 'url("example.jpg") center repeat-y fixed border-box #f00' );
		} );

		it( 'should return background shorthand from multiple-layer background shorthand', () => {
			styles.setTo(
				'background: ' +
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%), ' +
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%) center #f00 repeat-y fixed;'
			);

			expect( styles.getAsString( 'background' ) ).toBe(
				'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%), ' +
				'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%) center repeat-y fixed #f00'
			);
		} );

		it( 'should return background shorthand from background-image longhand', () => {
			styles.setTo(
				'background-image: linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%);'
			);

			expect( styles.getAsString( 'background' ) ).toBeUndefined();
		} );

		it( 'should return background shorthand combining background-image and background-color longhands', () => {
			styles.setTo(
				'background-image: linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%);' +
				'background-color: #f00;'
			);

			expect( styles.getAsString( 'background' ) ).toBeUndefined();
		} );

		it( 'should return background shorthand from mixed URL and gradient layers', () => {
			styles.setTo(
				'background: url("example.jpg") repeat-y, ' +
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%) center #f00;'
			);

			expect( styles.getAsString( 'background' ) ).toBe(
				'url("example.jpg") repeat-y, ' +
				'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%) center #f00'
			);
		} );
	} );
} );
