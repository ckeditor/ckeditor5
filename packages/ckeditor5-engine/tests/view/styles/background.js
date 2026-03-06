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

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( {
				attachment: [ 'fixed' ],
				image: [ 'url("example.jpg")' ],
				position: [ 'center' ],
				repeat: [ 'repeat-y' ],
				size: [],
				color: '#f00'
			} );
		} );

		it( 'should normalize background with gradient', () => {
			styles.setTo(
				'background: ' +
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%) ' +
					'center #f00 repeat-y fixed border-box;'
			);

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( {
				attachment: [ 'fixed' ],
				image: [ 'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%)' ],
				position: [ 'center' ],
				repeat: [ 'repeat-y' ],
				size: [],
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

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( {
				attachment: [ undefined, 'fixed' ],
				image: [
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%)',
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%)'
				],
				position: [ undefined, 'center' ],
				repeat: [ undefined, 'repeat-y' ],
				size: [],
				color: '#f00'
			} );
		} );

		it( 'should normalize background (color with spaces)', () => {
			styles.setTo( 'background:url("example.jpg") center rgb(253, 253, 119) repeat-y fixed border-box;' );

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( {
				attachment: [ 'fixed' ],
				image: [ 'url("example.jpg")' ],
				position: [ 'center' ],
				repeat: [ 'repeat-y' ],
				size: [],
				color: 'rgb(253, 253, 119)'
			} );
		} );

		it( 'should normalize background (color only with spaces)', () => {
			styles.setTo( 'background: rgb(253, 253, 119);' );

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( {
				attachment: [],
				color: 'rgb(253, 253, 119)',
				image: [],
				position: [],
				size: [],
				repeat: []
			} );
		} );

		it( 'should normalize background with layers', () => {
			styles.setTo( 'background:url("test.jpg") repeat-y,#f00;' );

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( {
				attachment: [],
				image: [ 'url("test.jpg")', undefined ],
				position: [],
				repeat: [ 'repeat-y', undefined ],
				size: [],
				color: '#f00'
			} );
		} );

		it( 'should preserve default values that are explicit set in background shorthand', () => {
			styles.setTo( 'background: none repeat scroll 0% 0% #000;' );

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( {
				attachment: [ 'scroll' ],
				image: [ 'none' ],
				position: [ '0% 0%' ],
				repeat: [ 'repeat' ],
				size: [],
				color: '#000'
			} );
		} );

		it( 'should preserve background size written using percentage value', () => {
			styles.setTo( 'background: 0% 0%;' );

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( {
				attachment: [],
				image: [],
				position: [ '0% 0%' ],
				repeat: [],
				size: [],
				color: undefined
			} );
		} );

		it( 'should preserve background size and background position separated by slash', () => {
			styles.setTo( 'background: url("test.jpg") center / contain;' );

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( {
				attachment: [],
				image: [ 'url("test.jpg")' ],
				position: [ 'center' ],
				repeat: [],
				size: [ 'contain' ],
				color: undefined
			} );
		} );

		it( 'should preserve background size and background position separated by slash (digits)', () => {
			styles.setTo( 'background: url("test.jpg") 0% 0% / 50% 50%;' );

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( {
				attachment: [],
				image: [ 'url("test.jpg")' ],
				position: [ '0% 0%' ],
				repeat: [],
				size: [ '50% 50%' ],
				color: undefined
			} );
		} );

		it( 'should preserve background size and background position separated by slash (mixed)', () => {
			styles.setTo( 'background: url("test.jpg") center / 50% 50%;' );

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( {
				attachment: [],
				image: [ 'url("test.jpg")' ],
				position: [ 'center' ],
				repeat: [],
				size: [ '50% 50%' ],
				color: undefined
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
			styles.setTo( 'background-repeat: repeat-x, no-repeat, space;' );

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( { repeat: [ 'repeat-x', 'no-repeat', 'space' ] } );
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

	describe( 'serialization', () => {
		it( 'should output inline background style', () => {
			styles.setTo( 'background:url("example.jpg") center #f00 repeat-y fixed border-box;' );

			expect( styles.toString() ).to.equal(
				'background:url("example.jpg") center repeat-y fixed #f00;'
			);
		} );

		it( 'should output inline style for background-image with single gradient', () => {
			styles.setTo(
				'background-image: linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%);'
			);

			expect( styles.toString() ).to.equal(
				'background:linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%);'
			);
		} );

		it( 'should output inline style for background-image with multiple gradients', () => {
			styles.setTo(
				'background-image: ' +
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%), ' +
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%);'
			);

			expect( styles.toString() ).to.equal(
				'background:linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%), ' +
				'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, #182168 100%);'
			);
		} );

		it( 'should output inline style for background-image combined with background-color', () => {
			styles.setTo(
				'background-image: linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%);' +
				'background-color: #f00;'
			);

			expect( styles.toString() ).to.equal(
				'background:linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%) #f00;'
			);
		} );

		it( 'should output inline background style for background-color longhand only', () => {
			styles.setTo( 'background-color: #f00;' );

			expect( styles.toString() ).to.equal( 'background:#f00;' );
		} );

		it( 'should output background size and position separated by slash', () => {
			styles.setTo( 'background: url("test.jpg") center / contain;' );

			expect( styles.toString() ).to.equal( 'background:url("test.jpg") center / contain;' );
		} );

		it( 'should output background size alone', () => {
			styles.setTo( 'background-size: cover' );

			expect( styles.toString() ).to.equal( 'background:0% 0% / cover;' );
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
						'center repeat-y fixed #f00;'
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

		it( 'should return background shorthand from single-layer background shorthand', () => {
			styles.setTo( 'background: url("example.jpg") center #f00 repeat-y fixed border-box;' );

			expect( styles.getAsString( 'background' ) ).to.equal( 'url("example.jpg") center repeat-y fixed #f00' );
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

			expect( styles.getAsString( 'background' ) ).to.equal(
				'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%)'
			);
		} );

		it( 'should return background shorthand combining background-image and background-color longhands', () => {
			styles.setTo(
				'background-image: linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%);' +
				'background-color: #f00;'
			);

			expect( styles.getAsString( 'background' ) ).to.equal(
				'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%) #f00'
			);
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
