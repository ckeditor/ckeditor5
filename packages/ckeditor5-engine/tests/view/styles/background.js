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
		it( 'should normalize background', () => {
			styles.setTo( 'background:url("example.jpg") center #f00 repeat-y fixed border-box;' );

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( {
				attachment: [ 'fixed' ],
				image: [ 'url("example.jpg")' ],
				position: [ 'center' ],
				repeat: [ 'repeat-y' ],
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
				color: '#f00'
			} );
		} );

		it( 'should normalize multiple gradients', () => {
			styles.setTo(
				'background: ' +
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%), ' +
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%) ' +
						'center #f00 repeat-y fixed border-box;'
			);

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( {
				attachment: [ 'scroll', 'fixed' ],
				image: [
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%)',
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%)'
				],
				position: [ '0% 0%', 'center' ],
				repeat: [ 'repeat', 'repeat-y' ],
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
				repeat: []
			} );
		} );

		it( 'should normalize background with layers', () => {
			styles.setTo( 'background:url("test.jpg") repeat-y,#f00;' );

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( {
				attachment: [],
				image: [ 'url("test.jpg")', 'none' ],
				position: [],
				repeat: [ 'repeat-y', 'repeat' ],
				color: '#f00'
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
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%);'
			);

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( {
				image: [
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%)',
					'linear-gradient(90deg,rgba(161, 29, 125, 0.55) 0%, rgba(24, 33, 104, 0.75) 100%)'
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
	} );

	describe( 'background-position', () => {
		it( 'should normalize single value', () => {
			styles.setTo( 'background-position: center;' );

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( { position: [ 'center' ] } );
		} );

		it( 'should normalize multiple values', () => {
			styles.setTo( 'background-position: center, top left;' );

			expect( styles.getNormalized( 'background' ) ).to.deep.equal( { position: [ 'center', 'top left' ] } );
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
		} );
	} );

	describe( 'getAsString', () => {
		it( 'should output inline background style with plain color', () => {
			styles.setTo( 'background:#f00;' );

			expect( styles.toString() ).to.equal( 'background:#f00;' );
		} );

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
