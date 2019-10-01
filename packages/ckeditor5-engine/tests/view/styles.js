/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import StyleProxy from '../../src/view/styles';

describe( 'Styles', () => {
	let styles;

	beforeEach( () => {
		styles = new StyleProxy();
	} );

	describe( 'getStyleNames()', () => {
		it( 'should output custom style names', () => {
			styles.setStyle( 'foo: 2;bar: baz;foo-bar-baz:none;' );

			expect( styles.getStyleNames() ).to.deep.equal( [ 'bar', 'foo', 'foo-bar-baz' ] );
		} );

		it( 'should output full names for shorthand', () => {
			styles.setStyle( 'margin: 1px;margin-left: 2em;' );

			expect( styles.getStyleNames() ).to.deep.equal( [ 'margin' ] );
		} );
	} );

	describe( 'styles rules', () => {
		describe( 'border', () => {
			it( 'should parse border shorthand', () => {
				styles.setStyle( 'border:1px solid blue;' );

				expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
					top: { color: 'blue', style: 'solid', width: '1px' },
					right: { color: 'blue', style: 'solid', width: '1px' },
					bottom: { color: 'blue', style: 'solid', width: '1px' },
					left: { color: 'blue', style: 'solid', width: '1px' }
				} );
			} );

			it( 'should parse border shorthand with other shorthands', () => {
				styles.setStyle( 'border:1px solid blue;border-left:#665511 dashed 2.7em;border-top:7px dotted #ccc;' );

				expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
					top: { color: '#ccc', style: 'dotted', width: '7px' },
					right: { color: 'blue', style: 'solid', width: '1px' },
					bottom: { color: 'blue', style: 'solid', width: '1px' },
					left: { color: '#665511', style: 'dashed', width: '2.7em' }
				} );
			} );

			it( 'should output inline shorthand rules', () => {
				styles.setStyle( 'border:1px solid blue;' );

				expect( styles.getInlineStyle() ).to.equal( 'border:1px solid blue;' );
				expect( styles.getInlineProperty( 'border' ) ).to.equal( '1px solid blue' );
				expect( styles.getInlineProperty( 'border-top' ) ).to.equal( '1px solid blue' );
				expect( styles.getInlineProperty( 'border-right' ) ).to.equal( '1px solid blue' );
				expect( styles.getInlineProperty( 'border-bottom' ) ).to.equal( '1px solid blue' );
				expect( styles.getInlineProperty( 'border-left' ) ).to.equal( '1px solid blue' );
			} );

			it( 'should output inline shorthand rules', () => {
				styles.setStyle( 'border:1px solid blue;border-left:#665511 dashed 2.7em;border-top:7px dotted #ccc;' );

				expect( styles.getInlineStyle() ).to.equal(
					'border-top:7px dotted #ccc;border-right:1px solid blue;border-bottom:1px solid blue;border-left:2.7em dashed #665511;'
				);
				expect( styles.getInlineProperty( 'border' ) ).to.be.undefined;
				expect( styles.getInlineProperty( 'border-top' ) ).to.equal( '7px dotted #ccc' );
				expect( styles.getInlineProperty( 'border-right' ) ).to.equal( '1px solid blue' );
				expect( styles.getInlineProperty( 'border-bottom' ) ).to.equal( '1px solid blue' );
				expect( styles.getInlineProperty( 'border-left' ) ).to.equal( '2.7em dashed #665511' );
			} );

			it( 'should merge rules on insert other shorthand', () => {
				styles.setStyle( 'border:1px solid blue;' );
				styles.insertProperty( 'border-left', '#665511 dashed 2.7em' );
				styles.insertProperty( 'border-top', '7px dotted #ccc' );

				expect( styles.getInlineStyle() ).to.equal(
					'border-top:7px dotted #ccc;border-right:1px solid blue;border-bottom:1px solid blue;border-left:2.7em dashed #665511;'
				);
				expect( styles.getInlineProperty( 'border' ) ).to.be.undefined;
				expect( styles.getInlineProperty( 'border-top' ) ).to.equal( '7px dotted #ccc' );
				expect( styles.getInlineProperty( 'border-right' ) ).to.equal( '1px solid blue' );
				expect( styles.getInlineProperty( 'border-bottom' ) ).to.equal( '1px solid blue' );
				expect( styles.getInlineProperty( 'border-left' ) ).to.equal( '2.7em dashed #665511' );
			} );

			it( 'should output', () => {
				styles.setStyle( 'border:1px solid blue;' );
				styles.removeProperty( 'border-top' );

				expect( styles.getInlineStyle() ).to.equal(
					'border-right:1px solid blue;border-bottom:1px solid blue;border-left:1px solid blue;'
				);
				expect( styles.getInlineProperty( 'border' ) ).to.be.undefined;
				expect( styles.getInlineProperty( 'border-top' ) ).to.be.undefined;
				expect( styles.getInlineProperty( 'border-right' ) ).to.equal( '1px solid blue' );
				expect( styles.getInlineProperty( 'border-bottom' ) ).to.equal( '1px solid blue' );
				expect( styles.getInlineProperty( 'border-left' ) ).to.equal( '1px solid blue' );
			} );

			describe( 'border-color', () => {
				it( 'should set all border colors (1 value defined)', () => {
					styles.setStyle( 'border-color:cyan;' );

					expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
						top: { color: 'cyan' },
						left: { color: 'cyan' },
						bottom: { color: 'cyan' },
						right: { color: 'cyan' }
					} );
				} );

				it( 'should set all border colors (2 values defined)', () => {
					styles.setStyle( 'border-color:cyan magenta;' );

					expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
						top: { color: 'cyan' },
						right: { color: 'magenta' },
						bottom: { color: 'cyan' },
						left: { color: 'magenta' }
					} );
				} );

				it( 'should set all border colors (3 values defined)', () => {
					styles.setStyle( 'border-color:cyan magenta pink;' );

					expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
						top: { color: 'cyan' },
						right: { color: 'magenta' },
						bottom: { color: 'pink' },
						left: { color: 'magenta' }
					} );
				} );

				it( 'should set all border colors (4 values defined)', () => {
					styles.setStyle( 'border-color:cyan magenta pink beige;' );

					expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
						top: { color: 'cyan' },
						right: { color: 'magenta' },
						bottom: { color: 'pink' },
						left: { color: 'beige' }
					} );
				} );

				it( 'should merge with border shorthand', () => {
					styles.setStyle( 'border:1px solid blue;border-color:cyan black;' );

					expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
						top: { color: 'cyan', style: 'solid', width: '1px' },
						right: { color: 'black', style: 'solid', width: '1px' },
						bottom: { color: 'cyan', style: 'solid', width: '1px' },
						left: { color: 'black', style: 'solid', width: '1px' }
					} );
				} );
			} );

			describe( 'border-style', () => {
				it( 'should set all border styles (1 value defined)', () => {
					styles.setStyle( 'border-style:solid;' );

					expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
						top: { style: 'solid' },
						right: { style: 'solid' },
						bottom: { style: 'solid' },
						left: { style: 'solid' }
					} );
				} );

				it( 'should set all border styles (2 values defined)', () => {
					styles.setStyle( 'border-style:solid dotted;' );

					expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
						top: { style: 'solid' },
						right: { style: 'dotted' },
						bottom: { style: 'solid' },
						left: { style: 'dotted' }
					} );
				} );

				it( 'should set all border styles (3 values defined)', () => {
					styles.setStyle( 'border-style:solid dotted dashed;' );

					expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
						top: { style: 'solid' },
						right: { style: 'dotted' },
						bottom: { style: 'dashed' },
						left: { style: 'dotted' }
					} );
				} );

				it( 'should set all border styles (4 values defined)', () => {
					styles.setStyle( 'border-style:solid dotted dashed ridge;' );

					expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
						top: { style: 'solid' },
						right: { style: 'dotted' },
						bottom: { style: 'dashed' },
						left: { style: 'ridge' }
					} );
				} );
			} );

			describe( 'border-width', () => {
				it( 'should set all border widths (1 value defined)', () => {
					styles.setStyle( 'border-width:1px;' );

					expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
						top: { width: '1px' },
						right: { width: '1px' },
						bottom: { width: '1px' },
						left: { width: '1px' }
					} );
				} );

				it( 'should set all border widths (2 values defined)', () => {
					styles.setStyle( 'border-width:1px .34cm;' );

					expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
						top: { width: '1px' },
						right: { width: '.34cm' },
						bottom: { width: '1px' },
						left: { width: '.34cm' }
					} );
				} );

				it( 'should set all border widths (3 values defined)', () => {
					styles.setStyle( 'border-width:1px .34cm 90.1rem;' );

					expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
						top: { width: '1px' },
						right: { width: '.34cm' },
						bottom: { width: '90.1rem' },
						left: { width: '.34cm' }
					} );
				} );

				it( 'should set all border widths (4 values defined)', () => {
					styles.setStyle( 'border-width:1px .34cm 90.1rem thick;' );

					expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
						top: { width: '1px' },
						right: { width: '.34cm' },
						bottom: { width: '90.1rem' },
						left: { width: 'thick' }
					} );
				} );
			} );
		} );

		describe( 'margin', () => {
			it( 'should set all margins (1 value defined)', () => {
				styles.setStyle( 'margin:1px;' );

				expect( styles.getNormalized( 'margin' ) ).to.deep.equal( {
					top: '1px',
					right: '1px',
					bottom: '1px',
					left: '1px'
				} );
			} );

			it( 'should set all margins (2 values defined)', () => {
				styles.setStyle( 'margin:1px .34cm;' );

				expect( styles.getNormalized( 'margin' ) ).to.deep.equal( {
					top: '1px',
					right: '.34cm',
					bottom: '1px',
					left: '.34cm'
				} );
			} );

			it( 'should set all margins (3 values defined)', () => {
				styles.setStyle( 'margin:1px .34cm 90.1rem;' );

				expect( styles.getNormalized( 'margin' ) ).to.deep.equal( {
					top: '1px',
					right: '.34cm',
					bottom: '90.1rem',
					left: '.34cm'
				} );
			} );

			it( 'should set all margins (4 values defined)', () => {
				styles.setStyle( 'margin:1px .34cm 90.1rem thick;' );

				expect( styles.getNormalized( 'margin' ) ).to.deep.equal( {
					top: '1px',
					right: '.34cm',
					bottom: '90.1rem',
					left: 'thick'
				} );
			} );

			it( 'should output inline style (1 value defined)', () => {
				styles.setStyle( 'margin:1px;' );

				expect( styles.getInlineStyle() ).to.equal( 'margin:1px;' );
				expect( styles.getInlineProperty( 'margin' ) ).to.equal( '1px' );
				expect( styles.getInlineProperty( 'margin-top' ) ).to.equal( '1px' );
				expect( styles.getInlineProperty( 'margin-right' ) ).to.equal( '1px' );
				expect( styles.getInlineProperty( 'margin-bottom' ) ).to.equal( '1px' );
				expect( styles.getInlineProperty( 'margin-left' ) ).to.equal( '1px' );
			} );

			it( 'should output inline style (2 values defined)', () => {
				styles.setStyle( 'margin:1px .34cm;' );

				expect( styles.getInlineStyle() ).to.equal( 'margin:1px .34cm;' );
				expect( styles.getInlineProperty( 'margin' ) ).to.equal( '1px .34cm' );
				expect( styles.getInlineProperty( 'margin-top' ) ).to.equal( '1px' );
				expect( styles.getInlineProperty( 'margin-right' ) ).to.equal( '.34cm' );
				expect( styles.getInlineProperty( 'margin-bottom' ) ).to.equal( '1px' );
				expect( styles.getInlineProperty( 'margin-left' ) ).to.equal( '.34cm' );
			} );

			it( 'should output inline style (3 values defined)', () => {
				styles.setStyle( 'margin:1px .34cm 90.1rem;' );

				expect( styles.getInlineStyle() ).to.equal( 'margin:1px .34cm 90.1rem;' );
				expect( styles.getInlineProperty( 'margin' ) ).to.equal( '1px .34cm 90.1rem' );
				expect( styles.getInlineProperty( 'margin-top' ) ).to.equal( '1px' );
				expect( styles.getInlineProperty( 'margin-right' ) ).to.equal( '.34cm' );
				expect( styles.getInlineProperty( 'margin-bottom' ) ).to.equal( '90.1rem' );
				expect( styles.getInlineProperty( 'margin-left' ) ).to.equal( '.34cm' );
			} );

			it( 'should output inline style (3 values defined, only last different)', () => {
				styles.setStyle( 'margin:1px 1px 90.1rem;' );

				expect( styles.getInlineStyle() ).to.equal( 'margin:1px 1px 90.1rem;' );
				expect( styles.getInlineProperty( 'margin' ) ).to.equal( '1px 1px 90.1rem' );
				expect( styles.getInlineProperty( 'margin-top' ) ).to.equal( '1px' );
				expect( styles.getInlineProperty( 'margin-right' ) ).to.equal( '1px' );
				expect( styles.getInlineProperty( 'margin-bottom' ) ).to.equal( '90.1rem' );
				expect( styles.getInlineProperty( 'margin-left' ) ).to.equal( '1px' );
			} );

			it( 'should output inline style (4 values defined)', () => {
				styles.setStyle( 'margin:1px .34cm 90.1rem thick;' );

				expect( styles.getInlineStyle() ).to.equal( 'margin:1px .34cm 90.1rem thick;' );
				expect( styles.getInlineProperty( 'margin' ) ).to.equal( '1px .34cm 90.1rem thick' );
				expect( styles.getInlineProperty( 'margin-top' ) ).to.equal( '1px' );
				expect( styles.getInlineProperty( 'margin-right' ) ).to.equal( '.34cm' );
				expect( styles.getInlineProperty( 'margin-bottom' ) ).to.equal( '90.1rem' );
				expect( styles.getInlineProperty( 'margin-left' ) ).to.equal( 'thick' );
			} );

			it( 'should output inline style (4 values defined, only last different)', () => {
				styles.setStyle( 'margin:1px 1px 1px thick;' );

				expect( styles.getInlineStyle() ).to.equal( 'margin:1px 1px 1px thick;' );
				expect( styles.getInlineProperty( 'margin' ) ).to.equal( '1px 1px 1px thick' );
				expect( styles.getInlineProperty( 'margin-top' ) ).to.equal( '1px' );
				expect( styles.getInlineProperty( 'margin-right' ) ).to.equal( '1px' );
				expect( styles.getInlineProperty( 'margin-bottom' ) ).to.equal( '1px' );
				expect( styles.getInlineProperty( 'margin-left' ) ).to.equal( 'thick' );
			} );

			describe( 'margin-*', () => {
				it( 'should set proper margin', () => {
					styles.setStyle( 'margin-top:1px;' );

					expect( styles.getNormalized( 'margin' ) ).to.deep.equal( { top: '1px' } );
					expect( styles.getNormalized( 'margin-top' ) ).to.equal( '1px' );
				} );

				it( 'should set proper margin with margin shorthand', () => {
					styles.setStyle( 'margin: 2em;margin-top:1px;' );

					expect( styles.getNormalized( 'margin' ) ).to.deep.equal( {
						top: '1px',
						right: '2em',
						bottom: '2em',
						left: '2em'
					} );
					expect( styles.getNormalized( 'margin-top' ) ).to.equal( '1px' );
					expect( styles.getNormalized( 'margin-right' ) ).to.equal( '2em' );
					expect( styles.getNormalized( 'margin-bottom' ) ).to.equal( '2em' );
					expect( styles.getNormalized( 'margin-left' ) ).to.equal( '2em' );
				} );
			} );
		} );

		describe( 'padding', () => {
			it( 'should set all paddings (1 value defined)', () => {
				styles.setStyle( 'padding:1px;' );

				expect( styles.getNormalized( 'padding' ) ).to.deep.equal( {
					top: '1px',
					right: '1px',
					bottom: '1px',
					left: '1px'
				} );
			} );

			it( 'should set all paddings (2 values defined)', () => {
				styles.setStyle( 'padding:1px .34cm;' );

				expect( styles.getNormalized( 'padding' ) ).to.deep.equal( {
					top: '1px',
					right: '.34cm',
					bottom: '1px',
					left: '.34cm'
				} );
			} );

			it( 'should set all paddings (3 values defined)', () => {
				styles.setStyle( 'padding:1px .34cm 90.1rem;' );

				expect( styles.getNormalized( 'padding' ) ).to.deep.equal( {
					top: '1px',
					right: '.34cm',
					bottom: '90.1rem',
					left: '.34cm'
				} );
			} );

			it( 'should set all paddings (4 values defined)', () => {
				styles.setStyle( 'padding:1px .34cm 90.1rem thick;' );

				expect( styles.getNormalized( 'padding' ) ).to.deep.equal( {
					top: '1px',
					right: '.34cm',
					bottom: '90.1rem',
					left: 'thick'
				} );
			} );

			describe( 'padding-*', () => {
				it( 'should set proper padding', () => {
					styles.setStyle( 'padding-top:1px;' );

					expect( styles.getNormalized( 'padding' ) ).to.deep.equal( {
						top: '1px'
					} );
				} );

				it( 'should set proper padding with padding shorthand', () => {
					styles.setStyle( 'padding: 2em;padding-top:1px;' );

					expect( styles.getNormalized( 'padding' ) ).to.deep.equal( {
						top: '1px',
						right: '2em',
						bottom: '2em',
						left: '2em'
					} );
				} );
			} );
		} );

		describe( 'unknown rules', () => {
			it( 'should left rules untouched', () => {
				styles.setStyle( 'foo-bar:baz 1px abc;baz: 2px 3em;' );

				expect( styles.getInlineStyle() ).to.equal( 'baz:2px 3em;foo-bar:baz 1px abc;' );
				expect( styles.getInlineProperty( 'foo-bar' ) ).to.equal( 'baz 1px abc' );
				expect( styles.getInlineProperty( 'baz' ) ).to.equal( '2px 3em' );
			} );
		} );
	} );
} );
