/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import StyleProxy from '../../src/view/styles';

describe( 'Styles', () => {
	let styleProxy;

	beforeEach( () => {
		styleProxy = new StyleProxy();
	} );

	describe( 'styles rules', () => {
		describe( 'border', () => {
			it( 'should parse border shorthand', () => {
				styleProxy.setStyle( 'border:1px solid blue;' );

				expect( styleProxy.getModel( 'border' ) ).to.deep.equal( {
					bottom: {
						color: 'blue',
						style: 'solid',
						width: '1px'
					},
					left: {
						color: 'blue',
						style: 'solid',
						width: '1px'
					},
					right: {
						color: 'blue',
						style: 'solid',
						width: '1px'
					},
					top: {
						color: 'blue',
						style: 'solid',
						width: '1px'
					}
				} );
			} );

			it( 'should parse border shorthand with other shorthands', () => {
				styleProxy.setStyle( 'border:1px solid blue;border-left:#665511 dashed 2.7em;border-top:7px dotted #ccc;' );

				expect( styleProxy.getModel( 'border' ) ).to.deep.equal( {
					bottom: {
						color: 'blue',
						style: 'solid',
						width: '1px'
					},
					left: {
						color: '#665511',
						style: 'dashed',
						width: '2.7em'
					},
					right: {
						color: 'blue',
						style: 'solid',
						width: '1px'
					},
					top: {
						color: '#ccc',
						style: 'dotted',
						width: '7px'
					}
				} );
			} );

			it( 'should output inline shorthand rules', () => {
				styleProxy.setStyle( 'border:1px solid blue;' );

				expect( styleProxy.getInlineStyle() ).to.equal( 'border:1px solid blue;' );
				expect( styleProxy.getInlineRule( 'border' ) ).to.equal( '1px solid blue' );
				expect( styleProxy.getInlineRule( 'border-top' ) ).to.equal( '1px solid blue' );
				expect( styleProxy.getInlineRule( 'border-right' ) ).to.equal( '1px solid blue' );
				expect( styleProxy.getInlineRule( 'border-bottom' ) ).to.equal( '1px solid blue' );
				expect( styleProxy.getInlineRule( 'border-left' ) ).to.equal( '1px solid blue' );
			} );

			it( 'should output inline shorthand rules', () => {
				styleProxy.setStyle( 'border:1px solid blue;border-left:#665511 dashed 2.7em;border-top:7px dotted #ccc;' );

				expect( styleProxy.getInlineStyle() ).to.equal(
					'border-top:7px dotted #ccc;border-right:1px solid blue;border-bottom:1px solid blue;border-left:2.7em dashed #665511;'
				);
				expect( styleProxy.getInlineRule( 'border' ) ).to.be.undefined;
				expect( styleProxy.getInlineRule( 'border-top' ) ).to.equal( '7px dotted #ccc' );
				expect( styleProxy.getInlineRule( 'border-right' ) ).to.equal( '1px solid blue' );
				expect( styleProxy.getInlineRule( 'border-bottom' ) ).to.equal( '1px solid blue' );
				expect( styleProxy.getInlineRule( 'border-left' ) ).to.equal( '2.7em dashed #665511' );
			} );

			it( 'should merge rules on insert other shorthand', () => {
				styleProxy.setStyle( 'border:1px solid blue;' );
				styleProxy.insertRule( 'border-left', '#665511 dashed 2.7em' );
				styleProxy.insertRule( 'border-top', '7px dotted #ccc' );

				expect( styleProxy.getInlineStyle() ).to.equal(
					'border-top:7px dotted #ccc;border-right:1px solid blue;border-bottom:1px solid blue;border-left:2.7em dashed #665511;'
				);
				expect( styleProxy.getInlineRule( 'border' ) ).to.be.undefined;
				expect( styleProxy.getInlineRule( 'border-top' ) ).to.equal( '7px dotted #ccc' );
				expect( styleProxy.getInlineRule( 'border-right' ) ).to.equal( '1px solid blue' );
				expect( styleProxy.getInlineRule( 'border-bottom' ) ).to.equal( '1px solid blue' );
				expect( styleProxy.getInlineRule( 'border-left' ) ).to.equal( '2.7em dashed #665511' );
			} );

			it( 'should output', () => {
				styleProxy.setStyle( 'border:1px solid blue;' );
				styleProxy.removeRule( 'border-top' );

				expect( styleProxy.getInlineStyle() ).to.equal(
					'border-right:1px solid blue;border-bottom:1px solid blue;border-left:1px solid blue;'
				);
				expect( styleProxy.getInlineRule( 'border' ) ).to.be.undefined;
				expect( styleProxy.getInlineRule( 'border-top' ) ).to.be.undefined;
				expect( styleProxy.getInlineRule( 'border-right' ) ).to.equal( '1px solid blue' );
				expect( styleProxy.getInlineRule( 'border-bottom' ) ).to.equal( '1px solid blue' );
				expect( styleProxy.getInlineRule( 'border-left' ) ).to.equal( '1px solid blue' );
			} );

			describe( 'border-color', () => {
				it( 'should set all border colors (1 value defined)', () => {
					styleProxy.setStyle( 'border-color:cyan;' );

					expect( styleProxy.getModel( 'border' ) ).to.deep.equal( {
						top: { color: 'cyan' },
						left: { color: 'cyan' },
						bottom: { color: 'cyan' },
						right: { color: 'cyan' }
					} );
				} );

				it( 'should set all border colors (2 values defined)', () => {
					styleProxy.setStyle( 'border-color:cyan magenta;' );

					expect( styleProxy.getModel( 'border' ) ).to.deep.equal( {
						top: { color: 'cyan' },
						right: { color: 'magenta' },
						bottom: { color: 'cyan' },
						left: { color: 'magenta' }
					} );
				} );

				it( 'should set all border colors (3 values defined)', () => {
					styleProxy.setStyle( 'border-color:cyan magenta pink;' );

					expect( styleProxy.getModel( 'border' ) ).to.deep.equal( {
						top: { color: 'cyan' },
						right: { color: 'magenta' },
						bottom: { color: 'pink' },
						left: { color: 'magenta' }
					} );
				} );

				it( 'should set all border colors (4 values defined)', () => {
					styleProxy.setStyle( 'border-color:cyan magenta pink beige;' );

					expect( styleProxy.getModel( 'border' ) ).to.deep.equal( {
						top: { color: 'cyan' },
						right: { color: 'magenta' },
						bottom: { color: 'pink' },
						left: { color: 'beige' }
					} );
				} );

				it( 'should merge with border shorthand', () => {
					styleProxy.setStyle( 'border:1px solid blue;border-color:cyan black;' );

					expect( styleProxy.getModel( 'border' ) ).to.deep.equal( {
						top: { color: 'cyan', style: 'solid', width: '1px' },
						right: { color: 'black', style: 'solid', width: '1px' },
						bottom: { color: 'cyan', style: 'solid', width: '1px' },
						left: { color: 'black', style: 'solid', width: '1px' }
					} );
				} );
			} );

			describe( 'border-style', () => {
				it( 'should set all border styles (1 value defined)', () => {
					styleProxy.setStyle( 'border-style:solid;' );

					expect( styleProxy.getModel( 'border' ) ).to.deep.equal( {
						top: { style: 'solid' },
						left: { style: 'solid' },
						bottom: { style: 'solid' },
						right: { style: 'solid' }
					} );
				} );

				it( 'should set all border styles (2 values defined)', () => {
					styleProxy.setStyle( 'border-style:solid dotted;' );

					expect( styleProxy.getModel( 'border' ) ).to.deep.equal( {
						top: { style: 'solid' },
						right: { style: 'dotted' },
						bottom: { style: 'solid' },
						left: { style: 'dotted' }
					} );
				} );

				it( 'should set all border styles (3 values defined)', () => {
					styleProxy.setStyle( 'border-style:solid dotted dashed;' );

					expect( styleProxy.getModel( 'border' ) ).to.deep.equal( {
						top: { style: 'solid' },
						right: { style: 'dotted' },
						bottom: { style: 'dashed' },
						left: { style: 'dotted' }
					} );
				} );

				it( 'should set all border styles (4 values defined)', () => {
					styleProxy.setStyle( 'border-style:solid dotted dashed ridge;' );

					expect( styleProxy.getModel( 'border' ) ).to.deep.equal( {
						top: { style: 'solid' },
						right: { style: 'dotted' },
						bottom: { style: 'dashed' },
						left: { style: 'ridge' }
					} );
				} );
			} );

			describe( 'border-width', () => {
				it( 'should set all border widths (1 value defined)', () => {
					styleProxy.setStyle( 'border-width:1px;' );

					expect( styleProxy.getModel( 'border' ) ).to.deep.equal( {
						top: { width: '1px' },
						left: { width: '1px' },
						bottom: { width: '1px' },
						right: { width: '1px' }
					} );
				} );

				it( 'should set all border widths (2 values defined)', () => {
					styleProxy.setStyle( 'border-width:1px .34cm;' );

					expect( styleProxy.getModel( 'border' ) ).to.deep.equal( {
						top: { width: '1px' },
						right: { width: '.34cm' },
						bottom: { width: '1px' },
						left: { width: '.34cm' }
					} );
				} );

				it( 'should set all border widths (3 values defined)', () => {
					styleProxy.setStyle( 'border-width:1px .34cm 90.1rem;' );

					expect( styleProxy.getModel( 'border' ) ).to.deep.equal( {
						top: { width: '1px' },
						right: { width: '.34cm' },
						bottom: { width: '90.1rem' },
						left: { width: '.34cm' }
					} );
				} );

				it( 'should set all border widths (4 values defined)', () => {
					styleProxy.setStyle( 'border-width:1px .34cm 90.1rem thick;' );

					expect( styleProxy.getModel( 'border' ) ).to.deep.equal( {
						top: { width: '1px' },
						right: { width: '.34cm' },
						bottom: { width: '90.1rem' },
						left: { width: 'thick' }
					} );
				} );
			} );
		} );

		describe( 'unknown rules', () => {
			it( 'should left rules untouched', () => {
				styleProxy.setStyle( 'foo-bar:baz 1px abc;baz: 2px 3em;' );

				expect( styleProxy.getInlineStyle() ).to.equal( 'baz:2px 3em;foo-bar:baz 1px abc;' );
				expect( styleProxy.getInlineRule( 'foo-bar' ) ).to.equal( 'baz 1px abc' );
				expect( styleProxy.getInlineRule( 'baz' ) ).to.equal( '2px 3em' );
			} );
		} );
	} );
} );
