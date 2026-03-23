/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

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

			expect( styles.toString() ).to.equal( 'background:rgba( hello, world );' );
		} );

		it( 'should normalize background', () => {
			styles.setTo( 'background:url("example.jpg") center #f00 repeat-y fixed border-box;' );

			const normalized = styles.getNormalized( 'background' );
			expect( normalized ).to.deep.equal( {
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
			expect( normalized ).to.deep.equal( {
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
			expect( normalized ).to.deep.equal( {
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
			expect( normalized ).to.deep.equal( {
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
			expect( normalized ).to.deep.equal( {
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
			expect( normalized ).to.deep.equal( {
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

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( {
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

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( {
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

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( {
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

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( {
				image: [ 'url("example.jpg")' ]
			} );
		} );

		it( 'should normalize with single gradient', () => {
			styles.setTo(
				'background-image: linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%);'
			);

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( {
				image: [ 'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%)' ]
			} );
		} );

		it( 'should normalize with none value', () => {
			styles.setTo( 'background-image: none;' );

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( {
				image: [ 'none' ]
			} );
		} );

		it( 'should normalize with mixed none and gradient', () => {
			styles.setTo(
				'background-image: none, linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%);'
			);

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( {
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

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( {
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

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( {
				image: [ 'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%)' ],
				color: '#f00'
			} );
		} );
	} );

	describe( 'background-color', () => {
		it( 'should normalize background-color', () => {
			styles.setTo( 'background-color:#f00;' );

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( { color: '#f00' } );
		} );

		it( 'should normalize background-color with rgb() value', () => {
			styles.setTo( 'background-color:rgba(253, 253, 119, 1);' );

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( { color: 'rgba(253, 253, 119, 1)' } );
		} );
	} );

	describe( 'background-repeat', () => {
		it( 'should normalize single value', () => {
			styles.setTo( 'background-repeat: repeat-x;' );

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( { repeat: [ 'repeat-x' ] } );
		} );

		it( 'should normalize multiple values', () => {
			styles.setTo( 'background-repeat: repeat-x, no-repeat;' );

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( { repeat: [ 'repeat-x', 'no-repeat' ] } );
		} );

		it( 'should normalize multiple values with spaces', () => {
			styles.setTo( 'background-repeat: repeat-x no-repeat, space;' );

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( { repeat: [ 'repeat-x no-repeat', 'space' ] } );
		} );
	} );

	describe( 'background-position', () => {
		it( 'should normalize single value', () => {
			styles.setTo( 'background-position: center;' );

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( { position: [ 'center' ] } );
		} );

		it( 'should normalize multiple values', () => {
			styles.setTo( 'background-position: center, top;' );

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( { position: [ 'center', 'top' ] } );
		} );

		it( 'should normalize multiple values with spaces', () => {
			styles.setTo( 'background-position: center, top left;' );

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( { position: [ 'center', 'top left' ] } );
		} );
	} );

	describe( 'background-size', () => {
		it( 'should normalize single value', () => {
			styles.setTo( 'background-size: contain;' );

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( { size: [ 'contain' ] } );
		} );

		it( 'should normalize multiple values', () => {
			styles.setTo( 'background-size: contain, cover;' );

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( { size: [ 'contain', 'cover' ] } );
		} );

		it( 'should normalize multiple values with spaces', () => {
			styles.setTo( 'background-size: contain, 50% 50%;' );

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( { size: [ 'contain', '50% 50%' ] } );
		} );
	} );

	describe( 'background-attachment', () => {
		it( 'should normalize single value', () => {
			styles.setTo( 'background-attachment: fixed;' );

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( { attachment: [ 'fixed' ] } );
		} );

		it( 'should normalize multiple values', () => {
			styles.setTo( 'background-attachment: scroll, fixed;' );

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( { attachment: [ 'scroll', 'fixed' ] } );
		} );

		it( 'should normalize multiple values with spaces', () => {
			styles.setTo( 'background-attachment: scroll, fixed, local;' );

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( { attachment: [ 'scroll', 'fixed', 'local' ] } );
		} );
	} );

	describe( 'background-origin', () => {
		it( 'should normalize single value', () => {
			styles.setTo( 'background-origin: padding-box;' );

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( { origin: [ 'padding-box' ] } );
		} );

		it( 'should normalize multiple values', () => {
			styles.setTo( 'background-origin: padding-box, border-box;' );

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( { origin: [ 'padding-box', 'border-box' ] } );
		} );

		it( 'should normalize content-box value', () => {
			styles.setTo( 'background-origin: content-box;' );

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( { origin: [ 'content-box' ] } );
		} );
	} );

	describe( 'background-clip', () => {
		it( 'should normalize single value', () => {
			styles.setTo( 'background-clip: border-box;' );

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( { clip: [ 'border-box' ] } );
		} );

		it( 'should normalize multiple values', () => {
			styles.setTo( 'background-clip: padding-box, border-box;' );

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( { clip: [ 'padding-box', 'border-box' ] } );
		} );

		it( 'should normalize text value', () => {
			styles.setTo( 'background-clip: text;' );

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( { clip: [ 'text' ] } );
		} );
	} );

	describe( 'serialization', () => {
		describe( 'shorthand', () => {
			it( 'should output inline background style', () => {
				styles.setTo( 'background:url("example.jpg") center #f00 repeat-y fixed border-box;' );

				expect( styles.toString() ).to.equal(
					'background:url("example.jpg") center repeat-y fixed border-box #f00;'
				);
			} );

			it( 'should output background size and position separated by slash', () => {
				styles.setTo( 'background: url("test.jpg") center / contain;' );

				expect( styles.toString() ).to.equal( 'background:url("test.jpg") center / contain;' );
			} );

			it( 'should output background size with default position when only size is non-default', () => {
				styles.setTo( 'background: url("test.jpg") 0% 0% / contain;' );

				expect( styles.toString() ).to.equal( 'background:url("test.jpg") 0% 0% / contain;' );
			} );

			it( 'should output default values', () => {
				styles.setTo( 'background: none repeat scroll 0% 0% #000;' );

				expect( styles.toString() ).to.equal( 'background:#000;' );
			} );

			it( 'should output origin and clip when a single box value is set in shorthand', () => {
				styles.setTo( 'background: red padding-box;' );

				expect( styles.toString() ).to.equal( 'background:padding-box red;' );
			} );

			it( 'should output both origin and clip when they differ in shorthand', () => {
				styles.setTo( 'background: red padding-box content-box;' );

				expect( styles.toString() ).to.equal( 'background:padding-box content-box red;' );
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

				expect( styles.toString() ).to.equal( '' );
			} );

			describe( 'layers', () => {
				it( 'should output inline background-image style with single gradient layer', () => {
					styles.setTo(
						'background: ' +
							'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%) ' +
							'center #f00 repeat-y fixed border-box;'
					);

					expect( styles.toString() ).to.equal(
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

					expect( styles.toString() ).to.equal(
						'background:linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%), ' +
						'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%) center repeat-y fixed #f00;'
					);
				} );

				it( 'should output inline background-image style with mixed layers', () => {
					styles.setTo(
						'background: url("example.jpg") repeat-y, ' +
							'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%) center #f00;'
					);

					expect( styles.toString() ).to.equal(
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

					expect( styles.toString() ).to.equal(
						'background:url("example.jpg") left top, ' +
						'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%) center right;'
					);
				} );
			} );
		} );

		describe( 'longhand', () => {
			it( 'should output background-color', () => {
				styles.setTo( 'background-color: #f00;' );

				expect( styles.toString() ).to.equal( 'background-color:#f00;' );
			} );

			it( 'should output background-image with URL', () => {
				styles.setTo( 'background-image: url("example.jpg");' );

				expect( styles.toString() ).to.equal( 'background-image:url("example.jpg");' );
			} );

			it( 'should output background-repeat', () => {
				styles.setTo( 'background-repeat: repeat-x;' );

				expect( styles.toString() ).to.equal( 'background-repeat:repeat-x;' );
			} );

			it( 'should output background-position', () => {
				styles.setTo( 'background-position: center;' );

				expect( styles.toString() ).to.equal( 'background-position:center;' );
			} );

			it( 'should output background-size', () => {
				styles.setTo( 'background-size: cover;' );

				expect( styles.toString() ).to.equal( 'background-size:cover;' );
			} );

			it( 'should output background-attachment', () => {
				styles.setTo( 'background-attachment: fixed;' );

				expect( styles.toString() ).to.equal( 'background-attachment:fixed;' );
			} );

			it( 'should output background-origin', () => {
				styles.setTo( 'background-origin: content-box;' );

				expect( styles.toString() ).to.equal( 'background-origin:content-box;' );
			} );

			it( 'should output background-clip', () => {
				styles.setTo( 'background-clip: text;' );

				expect( styles.toString() ).to.equal( 'background-clip:text;' );
			} );

			it( 'should output background-image combined with background-color', () => {
				styles.setTo(
					'background-image: linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%);' +
					'background-color: #f00;'
				);

				expect( styles.toString() ).to.equal(
					'background-color:#f00;' +
					'background-image:linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%);'
				);
			} );

			it( 'should output multiple longhand properties combined', () => {
				styles.setTo( 'background-color: #f00; background-repeat: no-repeat; background-position: center;' );

				expect( styles.toString() ).to.equal(
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

					expect( styles.toString() ).to.equal(
						'background-image:linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%);'
					);
				} );

				it( 'should output background-image with multiple gradients', () => {
					styles.setTo(
						'background-image: ' +
							'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%), ' +
							'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%);'
					);

					expect( styles.toString() ).to.equal(
						'background-image:' +
							'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%), ' +
							'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%);'
					);
				} );

				it( 'should output background-repeat with multiple layer values', () => {
					styles.setTo( 'background-repeat: no-repeat, repeat-x;' );

					expect( styles.toString() ).to.equal( 'background-repeat:no-repeat, repeat-x;' );
				} );

				it( 'should output background-position with multiple layer values', () => {
					styles.setTo( 'background-position: center, top left;' );

					expect( styles.toString() ).to.equal( 'background-position:center, top left;' );
				} );

				it( 'should output background-size with multiple layer values', () => {
					styles.setTo( 'background-size: contain, cover;' );

					expect( styles.toString() ).to.equal( 'background-size:contain, cover;' );
				} );

				it( 'should output background-attachment with multiple layer values', () => {
					styles.setTo( 'background-attachment: fixed, scroll;' );

					expect( styles.toString() ).to.equal( 'background-attachment:fixed, scroll;' );
				} );

				it( 'should output background-origin with multiple layer values', () => {
					styles.setTo( 'background-origin: padding-box, border-box;' );

					expect( styles.toString() ).to.equal( 'background-origin:padding-box, border-box;' );
				} );

				it( 'should output background-clip with multiple layer values', () => {
					styles.setTo( 'background-clip: border-box, padding-box;' );

					expect( styles.toString() ).to.equal( 'background-clip:border-box, padding-box;' );
				} );

				it( 'should output multiple longhand properties combined with multiple layer values', () => {
					styles.setTo(
						'background-image: url("example.jpg"), url("example2.jpg"); ' +
						'background-repeat: no-repeat, repeat-x; ' +
						'background-position: center, top left; ' +
						'background-size: contain, cover;'
					);

					expect( styles.toString() ).to.equal(
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

			expect( styles.getAsString( 'background-color' ) ).to.equal( '#f00' );
		} );

		it( 'should return background-color from background shorthand', () => {
			styles.setTo( 'background: #f00;' );

			expect( styles.getAsString( 'background-color' ) ).to.equal( '#f00' );
		} );

		it( 'should return background-image with URL', () => {
			styles.setTo( 'background-image: url("example.jpg");' );

			expect( styles.getAsString( 'background-image' ) ).to.equal( 'url("example.jpg")' );
		} );

		it( 'should return background-image with single gradient', () => {
			styles.setTo(
				'background-image: linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%);'
			);

			expect( styles.getAsString( 'background-image' ) ).to.equal(
				'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%)'
			);
		} );

		it( 'should return background-image with multiple gradients', () => {
			styles.setTo(
				'background-image: ' +
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%), ' +
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%);'
			);

			expect( styles.getAsString( 'background-image' ) ).to.equal(
				'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%), ' +
				'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%)'
			);
		} );

		it( 'should return background-image with mixed none and gradient', () => {
			styles.setTo(
				'background-image: none, linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%);'
			);

			expect( styles.getAsString( 'background-image' ) ).to.equal(
				'none, linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%)'
			);
		} );

		it( 'should return background-image from background shorthand with single layer', () => {
			styles.setTo( 'background: url("example.jpg") center #f00 repeat-y fixed border-box;' );

			expect( styles.getAsString( 'background-image' ) ).to.equal( 'url("example.jpg")' );
		} );

		it( 'should return background-image from background shorthand with multiple gradient layers', () => {
			styles.setTo(
				'background: ' +
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%), ' +
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%) center #f00 repeat-y fixed;'
			);

			expect( styles.getAsString( 'background-image' ) ).to.equal(
				'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%), ' +
				'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%)'
			);
		} );

		it( 'should return background-image from background shorthand with mixed URL and gradient layers', () => {
			styles.setTo(
				'background: url("example.jpg") repeat-y, ' +
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%) center #f00;'
			);

			expect( styles.getAsString( 'background-image' ) ).to.equal(
				'url("example.jpg"), linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%)'
			);
		} );

		it( 'should return background-image combined with background-color', () => {
			styles.setTo(
				'background-image: linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%);' +
				'background-color: #f00;'
			);

			expect( styles.getAsString( 'background-image' ) ).to.equal(
				'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%)'
			);
			expect( styles.getAsString( 'background-color' ) ).to.equal( '#f00' );
		} );

		it( 'should return background-repeat from single-layer background shorthand', () => {
			styles.setTo( 'background: url("example.jpg") repeat-x;' );

			expect( styles.getAsString( 'background-repeat' ) ).to.equal( 'repeat-x' );
		} );

		it( 'should return background-repeat from multiple-layer background shorthand', () => {
			styles.setTo(
				'background: ' +
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%), ' +
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%) center #f00 repeat-y fixed;'
			);

			expect( styles.getAsString( 'background-repeat' ) ).to.equal( 'repeat, repeat-y' );
		} );

		it( 'should return background-position from single-layer background shorthand', () => {
			styles.setTo( 'background: url("example.jpg") center;' );

			expect( styles.getAsString( 'background-position' ) ).to.equal( 'center' );
		} );

		it( 'should return background-position from multiple-layer background shorthand', () => {
			styles.setTo(
				'background: ' +
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%), ' +
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%) center #f00 repeat-y fixed;'
			);

			expect( styles.getAsString( 'background-position' ) ).to.equal( '0% 0%, center' );
		} );

		it( 'should return background-attachment from single-layer background shorthand', () => {
			styles.setTo( 'background: url("example.jpg") center #f00 repeat-y fixed border-box;' );

			expect( styles.getAsString( 'background-attachment' ) ).to.equal( 'fixed' );
		} );

		it( 'should return background-attachment from multiple-layer background shorthand', () => {
			styles.setTo(
				'background: ' +
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%), ' +
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%) center #f00 repeat-y fixed;'
			);

			expect( styles.getAsString( 'background-attachment' ) ).to.equal( 'scroll, fixed' );
		} );

		it( 'should return background-repeat from background-repeat longhand', () => {
			styles.setTo( 'background-repeat: repeat-x;' );

			expect( styles.getAsString( 'background-repeat' ) ).to.equal( 'repeat-x' );
		} );

		it( 'should return background-repeat from background-repeat longhand with multiple values', () => {
			styles.setTo( 'background-repeat: repeat-x, no-repeat;' );

			expect( styles.getAsString( 'background-repeat' ) ).to.equal( 'repeat-x, no-repeat' );
		} );

		it( 'should return background-position from background-position longhand', () => {
			styles.setTo( 'background-position: center;' );

			expect( styles.getAsString( 'background-position' ) ).to.equal( 'center' );
		} );

		it( 'should return background-position from background-position longhand with multiple values', () => {
			styles.setTo( 'background-position: center, top left;' );

			expect( styles.getAsString( 'background-position' ) ).to.equal( 'center, top left' );
		} );

		it( 'should return background-size from background-size longhand', () => {
			styles.setTo( 'background-size: cover, 50% 50%;' );

			expect( styles.getAsString( 'background-size' ) ).to.equal( 'cover, 50% 50%' );
		} );

		it( 'should return background-attachment from background-attachment longhand', () => {
			styles.setTo( 'background-attachment: fixed;' );

			expect( styles.getAsString( 'background-attachment' ) ).to.equal( 'fixed' );
		} );

		it( 'should return background-attachment from background-attachment longhand with multiple values', () => {
			styles.setTo( 'background-attachment: scroll, fixed;' );

			expect( styles.getAsString( 'background-attachment' ) ).to.equal( 'scroll, fixed' );
		} );

		it( 'should return background-origin from longhand', () => {
			styles.setTo( 'background-origin: content-box;' );

			expect( styles.getAsString( 'background-origin' ) ).to.equal( 'content-box' );
		} );

		it( 'should return background-origin from background shorthand', () => {
			styles.setTo( 'background: red padding-box;' );

			expect( styles.getAsString( 'background-origin' ) ).to.equal( 'padding-box' );
		} );

		it( 'should return background-clip from longhand', () => {
			styles.setTo( 'background-clip: text;' );

			expect( styles.getAsString( 'background-clip' ) ).to.equal( 'text' );
		} );

		it( 'should return background-clip from background shorthand', () => {
			styles.setTo( 'background: red padding-box content-box;' );

			expect( styles.getAsString( 'background-clip' ) ).to.equal( 'content-box' );
		} );

		it( 'should return background shorthand from single-layer background shorthand', () => {
			styles.setTo( 'background: url("example.jpg") center #f00 repeat-y fixed border-box;' );

			expect( styles.getAsString( 'background' ) ).to.equal( 'url("example.jpg") center repeat-y fixed border-box #f00' );
		} );

		it( 'should return background shorthand from multiple-layer background shorthand', () => {
			styles.setTo(
				'background: ' +
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%), ' +
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%) center #f00 repeat-y fixed;'
			);

			expect( styles.getAsString( 'background' ) ).to.equal(
				'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%), ' +
				'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%) center repeat-y fixed #f00'
			);
		} );

		it( 'should return background shorthand from background-image longhand', () => {
			styles.setTo(
				'background-image: linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%);'
			);

			expect( styles.getAsString( 'background' ) ).to.be.undefined;
		} );

		it( 'should return background shorthand combining background-image and background-color longhands', () => {
			styles.setTo(
				'background-image: linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%);' +
				'background-color: #f00;'
			);

			expect( styles.getAsString( 'background' ) ).to.be.undefined;
		} );

		it( 'should return background shorthand from mixed URL and gradient layers', () => {
			styles.setTo(
				'background: url("example.jpg") repeat-y, ' +
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%) center #f00;'
			);

			expect( styles.getAsString( 'background' ) ).to.equal(
				'url("example.jpg") repeat-y, ' +
				'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%) center #f00'
			);
		} );
	} );
} );
