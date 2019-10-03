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

		it( 'should output full names for known style names', () => {
			styles.setStyle( 'margin: 1px;margin-left: 2em;' );

			expect( styles.getStyleNames() ).to.deep.equal( [ 'margin-top', 'margin-right', 'margin-bottom', 'margin-left' ] );
		} );
	} );

	describe( 'styles rules', () => {
		describe( 'border', () => {
			it( 'should parse border shorthand', () => {
				styles.setStyle( 'border:1px solid blue;' );

				expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
					color: { top: 'blue', right: 'blue', bottom: 'blue', left: 'blue' },
					style: { top: 'solid', right: 'solid', bottom: 'solid', left: 'solid' },
					width: { top: '1px', right: '1px', bottom: '1px', left: '1px' }
				} );
			} );

			it( 'should parse border shorthand with other shorthands', () => {
				styles.setStyle( 'border:1px solid blue;border-left:#665511 dashed 2.7em;border-top:7px dotted #ccc;' );

				expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
					color: { top: '#ccc', right: 'blue', bottom: 'blue', left: '#665511' },
					style: { top: 'dotted', right: 'solid', bottom: 'solid', left: 'dashed' },
					width: { top: '7px', right: '1px', bottom: '1px', left: '2.7em' }
				} );
			} );

			it( 'should output inline shorthand rules #1', () => {
				styles.setStyle( 'border:1px solid blue;' );

				expect( styles.getInlineStyle() ).to.equal( 'border-color:blue;border-style:solid;border-width:1px;' );
				expect( styles.getInlineProperty( 'border-color' ) ).to.equal( 'blue' );
				expect( styles.getInlineProperty( 'border-style' ) ).to.equal( 'solid' );
				expect( styles.getInlineProperty( 'border-width' ) ).to.equal( '1px' );
			} );

			it.only( 'should output inline shorthand rules #2', () => {
				styles.setStyle( 'border:1px solid blue;border-left:#665511 dashed 2.7em;border-top:7px dotted #ccc;' );

				expect( styles.getInlineStyle() ).to.equal(
					'border-color:#ccc blue blue #665511;border-style:dotted solid solid dashed;border-width:7px 1px 1px 2.7em;'
				);
				// todo expect( styles.getInlineProperty( 'border' ) ).to.be.undefined;
				expect( styles.getInlineProperty( 'border-color' ) ).to.equal( '#ccc blue blue #665511' );
				expect( styles.getInlineProperty( 'border-style' ) ).to.equal( 'dotted solid solid dashed' );
				expect( styles.getInlineProperty( 'border-width' ) ).to.equal( '7px 1px 1px 2.7em' );
			} );

			it( 'should merge rules on insert other shorthand', () => {
				styles.setStyle( 'border:1px solid blue;' );
				styles.insertProperty( 'border-left', '#665511 dashed 2.7em' );
				styles.insertProperty( 'border-top', '7px dotted #ccc' );

				expect( styles.getInlineStyle() ).to.equal(
					'border-color:#ccc blue blue #665511;border-style:dotted solid solid dashed;border-width:7px 1px 1px 2.7em;'
				);
				// expect( styles.getInlineProperty( 'border' ) ).to.be.undefined;
				expect( styles.getInlineProperty( 'border-color' ) ).to.equal( '#ccc blue blue #665511' );
				expect( styles.getInlineProperty( 'border-style' ) ).to.equal( 'dotted solid solid dashed' );
				expect( styles.getInlineProperty( 'border-width' ) ).to.equal( '7px 1px 1px 2.7em' );
			} );

			it( 'should output', () => {
				styles.setStyle( 'border:1px solid blue;' );
				styles.removeProperty( 'border-color' );

				expect( styles.getInlineStyle() ).to.equal(
					'border-style:solid;border-width:1px;'
				);

				// expect( styles.getInlineProperty( 'border' ) ).to.be.undefined;
				expect( styles.getInlineProperty( 'border-color' ) ).to.be.undefined;
				expect( styles.getInlineProperty( 'border-style' ) ).to.equal( 'solid' );
				expect( styles.getInlineProperty( 'border-width' ) ).to.equal( '1px' );
			} );

			describe( 'border-color', () => {
				it( 'should set all border colors (1 value defined)', () => {
					styles.setStyle( 'border-color:cyan;' );

					expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
						color: {
							top: 'cyan',
							right: 'cyan',
							bottom: 'cyan',
							left: 'cyan'
						}
					} );
				} );

				it( 'should set all border colors (2 values defined)', () => {
					styles.setStyle( 'border-color:cyan magenta;' );

					expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
						color: {
							top: 'cyan',
							right: 'magenta',
							bottom: 'cyan',
							left: 'magenta'
						}
					} );
				} );

				it( 'should set all border colors (3 values defined)', () => {
					styles.setStyle( 'border-color:cyan magenta pink;' );

					expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
						color: {
							top: 'cyan',
							right: 'magenta',
							bottom: 'pink',
							left: 'magenta'
						}
					} );
				} );

				it( 'should set all border colors (4 values defined)', () => {
					styles.setStyle( 'border-color:cyan magenta pink beige;' );

					expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
						color: {
							top: 'cyan',
							right: 'magenta',
							bottom: 'pink',
							left: 'beige'
						}
					} );
				} );

				it( 'should merge with border shorthand', () => {
					styles.setStyle( 'border:1px solid blue;border-color:cyan black;' );

					expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
						color: { top: 'cyan', right: 'black', bottom: 'cyan', left: 'black' },
						style: { top: 'solid', right: 'solid', bottom: 'solid', left: 'solid' },
						width: { top: '1px', right: '1px', bottom: '1px', left: '1px' }
					} );
				} );
			} );

			describe( 'border-style', () => {
				it( 'should set all border styles (1 value defined)', () => {
					styles.setStyle( 'border-style:solid;' );

					expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
						style: {
							top: 'solid',
							right: 'solid',
							bottom: 'solid',
							left: 'solid'
						}
					} );
				} );

				it( 'should set all border styles (2 values defined)', () => {
					styles.setStyle( 'border-style:solid dotted;' );

					expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
						style: {
							top: 'solid',
							right: 'dotted',
							bottom: 'solid',
							left: 'dotted'
						}
					} );
				} );

				it( 'should set all border styles (3 values defined)', () => {
					styles.setStyle( 'border-style:solid dotted dashed;' );

					expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
						style: {
							top: 'solid',
							right: 'dotted',
							bottom: 'dashed',
							left: 'dotted'
						}
					} );
				} );

				it( 'should set all border styles (4 values defined)', () => {
					styles.setStyle( 'border-style:solid dotted dashed ridge;' );

					expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
						style: {
							top: 'solid',
							right: 'dotted',
							bottom: 'dashed',
							left: 'ridge'
						}
					} );
				} );
			} );

			describe( 'border-width', () => {
				it( 'should set all border widths (1 value defined)', () => {
					styles.setStyle( 'border-width:1px;' );

					expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
						width: {
							top: '1px',
							right: '1px',
							bottom: '1px',
							left: '1px'
						}
					} );
				} );

				it( 'should set all border widths (2 values defined)', () => {
					styles.setStyle( 'border-width:1px .34cm;' );

					expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
						width: {
							top: '1px',
							right: '.34cm',
							bottom: '1px',
							left: '.34cm'
						}
					} );
				} );

				it( 'should set all border widths (3 values defined)', () => {
					styles.setStyle( 'border-width:1px .34cm 90.1rem;' );

					expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
						width: {
							top: '1px',
							right: '.34cm',
							bottom: '90.1rem',
							left: '.34cm'
						}
					} );
				} );

				it( 'should set all border widths (4 values defined)', () => {
					styles.setStyle( 'border-width:1px .34cm 90.1rem thick;' );

					expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
						width: {
							top: '1px',
							right: '.34cm',
							bottom: '90.1rem',
							left: 'thick'
						}
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

				expect( styles.getInlineStyle() ).to.equal( 'margin-top:1px;margin-right:1px;margin-bottom:1px;margin-left:1px;' );
				// expect( styles.getInlineProperty( 'margin' ) ).to.equal( '1px' );
				expect( styles.getInlineProperty( 'margin-top' ) ).to.equal( '1px' );
				expect( styles.getInlineProperty( 'margin-right' ) ).to.equal( '1px' );
				expect( styles.getInlineProperty( 'margin-bottom' ) ).to.equal( '1px' );
				expect( styles.getInlineProperty( 'margin-left' ) ).to.equal( '1px' );
			} );

			it( 'should output inline style (2 values defined)', () => {
				styles.setStyle( 'margin:1px .34cm;' );

				expect( styles.getInlineStyle() ).to.equal( 'margin-top:1px;margin-right:.34cm;margin-bottom:1px;margin-left:.34cm;' );
				// expect( styles.getInlineProperty( 'margin' ) ).to.equal( '1px .34cm' );
				expect( styles.getInlineProperty( 'margin-top' ) ).to.equal( '1px' );
				expect( styles.getInlineProperty( 'margin-right' ) ).to.equal( '.34cm' );
				expect( styles.getInlineProperty( 'margin-bottom' ) ).to.equal( '1px' );
				expect( styles.getInlineProperty( 'margin-left' ) ).to.equal( '.34cm' );
			} );

			it( 'should output inline style (3 values defined)', () => {
				styles.setStyle( 'margin:1px .34cm 90.1rem;' );

				expect( styles.getInlineStyle() ).to.equal( 'margin-top:1px;margin-right:.34cm;margin-bottom:90.1rem;margin-left:.34cm;' );
				// expect( styles.getInlineProperty( 'margin' ) ).to.equal( '1px .34cm 90.1rem' );
				expect( styles.getInlineProperty( 'margin-top' ) ).to.equal( '1px' );
				expect( styles.getInlineProperty( 'margin-right' ) ).to.equal( '.34cm' );
				expect( styles.getInlineProperty( 'margin-bottom' ) ).to.equal( '90.1rem' );
				expect( styles.getInlineProperty( 'margin-left' ) ).to.equal( '.34cm' );
			} );

			it( 'should output inline style (3 values defined, only last different)', () => {
				styles.setStyle( 'margin:1px 1px 90.1rem;' );

				expect( styles.getInlineStyle() ).to.equal( 'margin-top:1px;margin-right:1px;margin-bottom:90.1rem;margin-left:1px;' );
				// expect( styles.getInlineProperty( 'margin' ) ).to.equal( '1px 1px 90.1rem' );
				expect( styles.getInlineProperty( 'margin-top' ) ).to.equal( '1px' );
				expect( styles.getInlineProperty( 'margin-right' ) ).to.equal( '1px' );
				expect( styles.getInlineProperty( 'margin-bottom' ) ).to.equal( '90.1rem' );
				expect( styles.getInlineProperty( 'margin-left' ) ).to.equal( '1px' );
			} );

			it( 'should output inline style (4 values defined)', () => {
				styles.setStyle( 'margin:1px .34cm 90.1rem thick;' );

				expect( styles.getInlineStyle() ).to.equal( 'margin-top:1px;margin-right:.34cm;margin-bottom:90.1rem;margin-left:thick;' );
				// expect( styles.getInlineProperty( 'margin' ) ).to.equal( '1px .34cm 90.1rem thick' );
				expect( styles.getInlineProperty( 'margin-top' ) ).to.equal( '1px' );
				expect( styles.getInlineProperty( 'margin-right' ) ).to.equal( '.34cm' );
				expect( styles.getInlineProperty( 'margin-bottom' ) ).to.equal( '90.1rem' );
				expect( styles.getInlineProperty( 'margin-left' ) ).to.equal( 'thick' );
			} );

			it( 'should output inline style (4 values defined, only last different)', () => {
				styles.setStyle( 'margin:1px 1px 1px thick;' );

				expect( styles.getInlineStyle() ).to.equal( 'margin-top:1px;margin-right:1px;margin-bottom:1px;margin-left:thick;' );
				// expect( styles.getInlineProperty( 'margin' ) ).to.equal( '1px 1px 1px thick' );
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
