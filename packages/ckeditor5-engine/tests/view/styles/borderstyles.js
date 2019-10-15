/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Styles from '../../../src/view/styles';

describe( 'Border styles normalization', () => {
	let styles;

	beforeEach( () => {
		styles = new Styles();
	} );

	it( 'should parse border shorthand', () => {
		styles.setStyle( 'border:1px solid blue;' );

		expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
			color: { top: 'blue', right: 'blue', bottom: 'blue', left: 'blue' },
			style: { top: 'solid', right: 'solid', bottom: 'solid', left: 'solid' },
			width: { top: '1px', right: '1px', bottom: '1px', left: '1px' }
		} );
	} );

	it( 'should parse border shorthand with only style', () => {
		styles.setStyle( 'border:solid;' );

		expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
			color: { top: undefined, right: undefined, bottom: undefined, left: undefined },
			style: { top: 'solid', right: 'solid', bottom: 'solid', left: 'solid' },
			width: { top: undefined, right: undefined, bottom: undefined, left: undefined }
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

	it( 'should parse border longhand', () => {
		styles.setStyle( 'border-color: #f00 #ba2;' +
			'border-style: solid;' +
			'border-width: 1px;' +
			'border-bottom-width: 2px;' +
			'border-right-style: dotted;' );

		expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
			color: { top: '#f00', right: '#ba2', bottom: '#f00', left: '#ba2' },
			style: { top: 'solid', right: 'dotted', bottom: 'solid', left: 'solid' },
			width: { top: '1px', right: '1px', bottom: '2px', left: '1px' }
		} );
	} );

	it( 'should output inline shorthand rules #1', () => {
		styles.setStyle( 'border:1px solid blue;' );

		expect( styles.getInlineStyle() ).to.equal(
			'border-top:1px solid blue;border-right:1px solid blue;border-bottom:1px solid blue;border-left:1px solid blue;'
		);
		expect( styles.getInlineProperty( 'border-color' ) ).to.equal( 'blue' );
		expect( styles.getInlineProperty( 'border-style' ) ).to.equal( 'solid' );
		expect( styles.getInlineProperty( 'border-width' ) ).to.equal( '1px' );
	} );

	it( 'should output only defined inline styles', () => {
		styles.insertProperty( 'border-color', { top: 'blue' } );

		expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
			color: { top: 'blue' }
		} );

		expect( styles.getInlineStyle( 'border' ) ).to.equal( 'border-top:blue;' );
		// TODO: expect( styles.hasProperty( 'border-top-color' ) ).to.be.true;
		// expect( styles.getInlineProperty( 'border-top-color' ) ).to.equal( 'blue' );
	} );

	it( 'should output inline shorthand rules #2', () => {
		styles.setStyle( 'border:1px solid blue;border-left:#665511 dashed 2.7em;border-top:7px dotted #ccc;' );

		expect( styles.getInlineStyle() ).to.equal(
			'border-top:7px dotted #ccc;border-right:1px solid blue;border-bottom:1px solid blue;border-left:2.7em dashed #665511;'
		);

		expect( styles.getInlineProperty( 'border' ) ).to.be.undefined;
		expect( styles.getInlineProperty( 'border-color' ) ).to.equal( '#ccc blue blue #665511' );
		expect( styles.getInlineProperty( 'border-style' ) ).to.equal( 'dotted solid solid dashed' );
		expect( styles.getInlineProperty( 'border-width' ) ).to.equal( '7px 1px 1px 2.7em' );
	} );

	it( 'should parse border + border-position(only color defined)', () => {
		styles.setStyle( 'border:1px solid blue;border-left:#665511;' );

		expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
			color: { top: 'blue', right: 'blue', bottom: 'blue', left: '#665511' },
			style: { top: 'solid', right: 'solid', bottom: 'solid', left: 'solid' },
			width: { top: '1px', right: '1px', bottom: '1px', left: '1px' }
		} );
	} );

	it( 'should parse border + border-position(only style defined)', () => {
		styles.setStyle( 'border:1px solid blue;border-left:ridge;' );

		expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
			color: { top: 'blue', right: 'blue', bottom: 'blue', left: 'blue' },
			style: { top: 'solid', right: 'solid', bottom: 'solid', left: 'ridge' },
			width: { top: '1px', right: '1px', bottom: '1px', left: '1px' }
		} );
	} );

	it( 'should parse border + border-position(only width defined)', () => {
		styles.setStyle( 'border:1px solid blue;border-left:1337px' );

		expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
			color: { top: 'blue', right: 'blue', bottom: 'blue', left: 'blue' },
			style: { top: 'solid', right: 'solid', bottom: 'solid', left: 'solid' },
			width: { top: '1px', right: '1px', bottom: '1px', left: '1337px' }
		} );
	} );

	it( 'should merge rules on insert other shorthand', () => {
		styles.setStyle( 'border:1px solid blue;' );
		styles.insertProperty( 'border-left', '#665511 dashed 2.7em' );
		styles.insertProperty( 'border-top', '7px dotted #ccc' );

		expect( styles.getInlineStyle() ).to.equal(
			'border-top:7px dotted #ccc;border-right:1px solid blue;border-bottom:1px solid blue;border-left:2.7em dashed #665511;'
		);
		expect( styles.getInlineProperty( 'border' ) ).to.be.undefined;
		expect( styles.getInlineProperty( 'border-color' ) ).to.equal( '#ccc blue blue #665511' );
		expect( styles.getInlineProperty( 'border-style' ) ).to.equal( 'dotted solid solid dashed' );
		expect( styles.getInlineProperty( 'border-width' ) ).to.equal( '7px 1px 1px 2.7em' );
	} );

	it( 'should output', () => {
		styles.setStyle( 'border:1px solid blue;' );
		styles.removeProperty( 'border-color' );

		expect( styles.getInlineStyle() ).to.equal(
			'border-top:1px solid;border-right:1px solid;border-bottom:1px solid;border-left:1px solid;'
		);

		expect( styles.getInlineProperty( 'border' ) ).to.be.undefined;
		expect( styles.getInlineProperty( 'border-color' ) ).to.be.undefined;
		expect( styles.getInlineProperty( 'border-style' ) ).to.equal( 'solid' );
		expect( styles.getInlineProperty( 'border-width' ) ).to.equal( '1px' );
		expect( styles.getInlineProperty( 'border-top' ) ).to.equal( '1px solid' );
		expect( styles.getInlineProperty( 'border-right' ) ).to.equal( '1px solid' );
		expect( styles.getInlineProperty( 'border-bottom' ) ).to.equal( '1px solid' );
		expect( styles.getInlineProperty( 'border-left' ) ).to.equal( '1px solid' );
	} );

	it( 'should output border with only style shorthand (style)', () => {
		styles.setStyle( 'border:solid;' );

		expect( styles.getInlineStyle() ).to.equal( 'border-top:solid;border-right:solid;border-bottom:solid;border-left:solid;' );
		expect( styles.getInlineProperty( 'border' ) ).to.be.undefined;
		expect( styles.getInlineProperty( 'border-color' ) ).to.be.undefined;
		expect( styles.getInlineProperty( 'border-style' ) ).to.equal( 'solid' );
		expect( styles.getInlineProperty( 'border-width' ) ).to.be.undefined;
		expect( styles.getInlineProperty( 'border-top' ) ).to.equal( 'solid' );
		expect( styles.getInlineProperty( 'border-right' ) ).to.equal( 'solid' );
		expect( styles.getInlineProperty( 'border-bottom' ) ).to.equal( 'solid' );
		expect( styles.getInlineProperty( 'border-left' ) ).to.equal( 'solid' );
	} );

	it( 'should output border with only style shorthand (color)', () => {
		styles.setStyle( 'border:#f00;' );

		expect( styles.getInlineStyle() ).to.equal( 'border-top:#f00;border-right:#f00;border-bottom:#f00;border-left:#f00;' );
		expect( styles.getInlineProperty( 'border' ) ).to.be.undefined;
		expect( styles.getInlineProperty( 'border-color' ) ).to.equal( '#f00' );
		expect( styles.getInlineProperty( 'border-style' ) ).to.be.undefined;
		expect( styles.getInlineProperty( 'border-width' ) ).to.be.undefined;
		expect( styles.getInlineProperty( 'border-top' ) ).to.equal( '#f00' );
		expect( styles.getInlineProperty( 'border-right' ) ).to.equal( '#f00' );
		expect( styles.getInlineProperty( 'border-bottom' ) ).to.equal( '#f00' );
		expect( styles.getInlineProperty( 'border-left' ) ).to.equal( '#f00' );
	} );

	it( 'should output border with only style shorthand (width)', () => {
		styles.setStyle( 'border:1px;' );

		expect( styles.getInlineStyle() ).to.equal( 'border-top:1px;border-right:1px;border-bottom:1px;border-left:1px;' );
		expect( styles.getInlineProperty( 'border' ) ).to.be.undefined;
		expect( styles.getInlineProperty( 'border-color' ) ).to.be.undefined;
		expect( styles.getInlineProperty( 'border-style' ) ).to.be.undefined;
		expect( styles.getInlineProperty( 'border-width' ) ).to.equal( '1px' );
		expect( styles.getInlineProperty( 'border-top' ) ).to.equal( '1px' );
		expect( styles.getInlineProperty( 'border-right' ) ).to.equal( '1px' );
		expect( styles.getInlineProperty( 'border-bottom' ) ).to.equal( '1px' );
		expect( styles.getInlineProperty( 'border-left' ) ).to.equal( '1px' );
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

	describe( 'border-* position', () => {
		it( 'should output all positions', () => {
			styles.setStyle(
				'border-top:none;' +
				'border-left:none;' +
				'border-bottom:dotted #FFC000 3.0pt;' +
				'border-right:dotted #FFC000 3.0pt;'
			);

			expect( styles.getInlineStyle() ).to.equal(
				'border-top:none;border-right:3.0pt dotted #FFC000;border-bottom:3.0pt dotted #FFC000;border-left:none;'
			);
			expect( styles.getInlineProperty( 'border-top' ) ).to.equal( 'none' );
			expect( styles.getInlineProperty( 'border-right' ) ).to.equal( '3.0pt dotted #FFC000' );
			expect( styles.getInlineProperty( 'border-bottom' ) ).to.equal( '3.0pt dotted #FFC000' );
			expect( styles.getInlineProperty( 'border-left' ) ).to.equal( 'none' );
		} );
	} );

	describe( 'getStyleNames() - border', () => {
		it( 'should set all border colors (1 value defined)', () => {
			styles.setStyle( '    border-color: deeppink deepskyblue;\n' +
				'    border-style: solid;\n' +
				'    border-width: 1px;\n' +
				'    border-bottom-width: 2px;\n' +
				'    border-right-style: dotted;' );

			expect( styles.getStyleNames() ).to.deep.equal( [
				'border-top',
				'border-right',
				'border-bottom',
				'border-left'
			] );
		} );
	} );
} );
