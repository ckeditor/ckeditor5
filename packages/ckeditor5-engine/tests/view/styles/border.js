/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';

import { StylesMap, StylesProcessor } from '../../../src/view/stylesmap.js';
import { addBorderStylesRules } from '../../../src/view/styles/border.js';

describe( 'Border styles normalization', () => {
	let styles;

	beforeEach( () => {
		const stylesProcessor = new StylesProcessor();
		addBorderStylesRules( stylesProcessor );
		styles = new StylesMap( stylesProcessor );
	} );

	it( 'should parse border shorthand', () => {
		styles.setTo( 'border:1px solid blue;' );

		expect( styles.getNormalized( 'border' ) ).toEqual( {
			color: { top: 'blue', right: 'blue', bottom: 'blue', left: 'blue' },
			style: { top: 'solid', right: 'solid', bottom: 'solid', left: 'solid' },
			width: { top: '1px', right: '1px', bottom: '1px', left: '1px' }
		} );
	} );

	it( 'should parse border shorthand with only style', () => {
		styles.setTo( 'border:solid;' );

		expect( styles.getNormalized( 'border' ) ).toEqual( {
			color: { top: undefined, right: undefined, bottom: undefined, left: undefined },
			style: { top: 'solid', right: 'solid', bottom: 'solid', left: 'solid' },
			width: { top: undefined, right: undefined, bottom: undefined, left: undefined }
		} );
	} );

	it( 'should parse border shorthand with other shorthands', () => {
		styles.setTo( 'border:1px solid blue;border-left:#665511 dashed 2.7em;border-top:7px dotted #ccc;' );

		expect( styles.getNormalized( 'border' ) ).toEqual( {
			color: { top: '#ccc', right: 'blue', bottom: 'blue', left: '#665511' },
			style: { top: 'dotted', right: 'solid', bottom: 'solid', left: 'dashed' },
			width: { top: '7px', right: '1px', bottom: '1px', left: '2.7em' }
		} );
	} );

	it( 'should parse border longhand', () => {
		styles.setTo( 'border-color: #f00 #ba2;' +
			'border-style: solid;' +
			'border-width: 1px;' +
			'border-bottom-width: 2px;' +
			'border-right-style: dotted;' );

		expect( styles.getNormalized( 'border' ) ).toEqual( {
			color: { top: '#f00', right: '#ba2', bottom: '#f00', left: '#ba2' },
			style: { top: 'solid', right: 'dotted', bottom: 'solid', left: 'solid' },
			width: { top: '1px', right: '1px', bottom: '2px', left: '1px' }
		} );
	} );

	it( 'should output inline shorthand rules #1', () => {
		styles.setTo( 'border:1px solid blue;' );

		expect( styles.toString() ).toBe(
			'border:1px solid blue;'
		);
		expect( styles.getAsString( 'border-color' ) ).toBe( 'blue' );
		expect( styles.getAsString( 'border-style' ) ).toBe( 'solid' );
		expect( styles.getAsString( 'border-width' ) ).toBe( '1px' );
	} );

	it( 'should output only defined inline styles', () => {
		styles.set( 'border-color', { top: 'blue' } );

		expect( styles.getNormalized( 'border' ) ).toEqual( {
			color: { top: 'blue' }
		} );

		expect( styles.toString( 'border' ) ).toBe( 'border-top-color:blue;' );
		expect( styles.has( 'border-top-color' ) ).toBe( true );
		expect( styles.getAsString( 'border-top-color' ) ).toBe( 'blue' );
	} );

	it( 'should output inline shorthand rules #2', () => {
		styles.setTo( 'border:1px solid blue;border-left:#665511 dashed 2.7em;border-top:7px dotted #ccc;' );

		expect( styles.toString() ).toBe(
			'border-bottom:1px solid blue;' +
			'border-left:2.7em dashed #665511;' +
			'border-right:1px solid blue;' +
			'border-top:7px dotted #ccc;'
		);

		expect( styles.getAsString( 'border' ) ).toBeUndefined();
		expect( styles.getAsString( 'border-color' ) ).toBe( '#ccc blue blue #665511' );
		expect( styles.getAsString( 'border-style' ) ).toBe( 'dotted solid solid dashed' );
		expect( styles.getAsString( 'border-width' ) ).toBe( '7px 1px 1px 2.7em' );
	} );

	it( 'should parse border + border-position(only color defined)', () => {
		styles.setTo( 'border:1px solid blue;border-left:#665511;' );

		expect( styles.getNormalized( 'border' ) ).toEqual( {
			color: { top: 'blue', right: 'blue', bottom: 'blue', left: '#665511' },
			style: { top: 'solid', right: 'solid', bottom: 'solid', left: 'solid' },
			width: { top: '1px', right: '1px', bottom: '1px', left: '1px' }
		} );
	} );

	it( 'should parse border + border-position(only style defined)', () => {
		styles.setTo( 'border:1px solid blue;border-left:ridge;' );

		expect( styles.getNormalized( 'border' ) ).toEqual( {
			color: { top: 'blue', right: 'blue', bottom: 'blue', left: 'blue' },
			style: { top: 'solid', right: 'solid', bottom: 'solid', left: 'ridge' },
			width: { top: '1px', right: '1px', bottom: '1px', left: '1px' }
		} );
	} );

	it( 'should parse border + border-position(only width defined)', () => {
		styles.setTo( 'border:1px solid blue;border-left:1337px' );

		expect( styles.getNormalized( 'border' ) ).toEqual( {
			color: { top: 'blue', right: 'blue', bottom: 'blue', left: 'blue' },
			style: { top: 'solid', right: 'solid', bottom: 'solid', left: 'solid' },
			width: { top: '1px', right: '1px', bottom: '1px', left: '1337px' }
		} );
	} );

	it( 'should merge rules on insert other shorthand', () => {
		styles.setTo( 'border:1px solid blue;' );
		styles.set( 'border-left', '#665511 dashed 2.7em' );
		styles.set( 'border-top', '7px dotted #ccc' );

		expect( styles.toString() ).toBe(
			'border-bottom:1px solid blue;' +
			'border-left:2.7em dashed #665511;' +
			'border-right:1px solid blue;' +
			'border-top:7px dotted #ccc;'
		);
		expect( styles.getAsString( 'border' ) ).toBeUndefined();
		expect( styles.getAsString( 'border-color' ) ).toBe( '#ccc blue blue #665511' );
		expect( styles.getAsString( 'border-style' ) ).toBe( 'dotted solid solid dashed' );
		expect( styles.getAsString( 'border-width' ) ).toBe( '7px 1px 1px 2.7em' );
	} );

	it( 'should output single values if one shorthand is removed', () => {
		styles.setTo( 'border:1px solid blue;' );
		styles.remove( 'border-color' );

		expect( styles.toString() ).toBe(
			'border-style:solid;' +
			'border-width:1px;'
		);

		expect( styles.getAsString( 'border' ) ).toBeUndefined();
		expect( styles.getAsString( 'border-color' ) ).toBeUndefined();
		expect( styles.getAsString( 'border-style' ) ).toBe( 'solid' );
		expect( styles.getAsString( 'border-width' ) ).toBe( '1px' );
		expect( styles.getAsString( 'border-top-style' ) ).toBe( 'solid' );
		expect( styles.getAsString( 'border-top-width' ) ).toBe( '1px' );
		expect( styles.getAsString( 'border-right-style' ) ).toBe( 'solid' );
		expect( styles.getAsString( 'border-right-width' ) ).toBe( '1px' );
		expect( styles.getAsString( 'border-bottom-style' ) ).toBe( 'solid' );
		expect( styles.getAsString( 'border-bottom-width' ) ).toBe( '1px' );
		expect( styles.getAsString( 'border-left-style' ) ).toBe( 'solid' );
		expect( styles.getAsString( 'border-left-width' ) ).toBe( '1px' );

		// Merge into the single property is possible only if all (style, width, and color) values are specified.
		expect( styles.getAsString( 'border-top' ) ).toBe( undefined );
		expect( styles.getAsString( 'border-right' ) ).toBe( undefined );
		expect( styles.getAsString( 'border-bottom' ) ).toBe( undefined );
		expect( styles.getAsString( 'border-left' ) ).toBe( undefined );
	} );

	it( 'should output border with only style shorthand (style)', () => {
		styles.setTo( 'border:solid;' );

		expect( styles.toString() ).toBe( 'border-style:solid;' );
		expect( styles.getAsString( 'border' ) ).toBeUndefined();
		expect( styles.getAsString( 'border-color' ) ).toBeUndefined();
		expect( styles.getAsString( 'border-width' ) ).toBeUndefined();
		expect( styles.getAsString( 'border-style' ) ).toBe( 'solid' );

		// The "group" definition can be used only if all (style, width, and color) values are specified.
		expect( styles.getAsString( 'border-top' ) ).toBe( undefined );
		expect( styles.getAsString( 'border-right' ) ).toBe( undefined );
		expect( styles.getAsString( 'border-bottom' ) ).toBe( undefined );
		expect( styles.getAsString( 'border-left' ) ).toBe( undefined );
	} );

	it( 'should output border with only style shorthand (color)', () => {
		styles.setTo( 'border:#f00;' );

		expect( styles.toString() ).toBe( 'border-color:#f00;' );
		expect( styles.getAsString( 'border' ) ).toBeUndefined();
		expect( styles.getAsString( 'border-color' ) ).toBe( '#f00' );
		expect( styles.getAsString( 'border-style' ) ).toBeUndefined();
		expect( styles.getAsString( 'border-width' ) ).toBeUndefined();

		// The "group" definition can be used only if all (style, width, and color) values are specified.
		expect( styles.getAsString( 'border-top' ) ).toBe( undefined );
		expect( styles.getAsString( 'border-right' ) ).toBe( undefined );
		expect( styles.getAsString( 'border-bottom' ) ).toBe( undefined );
		expect( styles.getAsString( 'border-left' ) ).toBe( undefined );
	} );

	it( 'should output border with only style shorthand (width)', () => {
		styles.setTo( 'border:1px;' );

		expect( styles.toString() ).toBe( 'border-width:1px;' );
		expect( styles.getAsString( 'border' ) ).toBeUndefined();
		expect( styles.getAsString( 'border-color' ) ).toBeUndefined();
		expect( styles.getAsString( 'border-style' ) ).toBeUndefined();
		expect( styles.getAsString( 'border-width' ) ).toBe( '1px' );

		// The "group" definition can be used only if all (style, width, and color) values are specified.
		expect( styles.getAsString( 'border-top' ) ).toBe( undefined );
		expect( styles.getAsString( 'border-right' ) ).toBe( undefined );
		expect( styles.getAsString( 'border-bottom' ) ).toBe( undefined );
		expect( styles.getAsString( 'border-left' ) ).toBe( undefined );
	} );

	it( 'should properly remove border properties one by one', () => {
		styles.setTo( 'border:1px solid blue;' );

		// All properties are identical so they will be merged into the `border` definition.
		expect( styles.toString() ).toBe( 'border:1px solid blue;' );

		styles.remove( 'border-color' );

		expect( styles.toString() ).toBe(
			'border-style:solid;' +
			'border-width:1px;'
		);

		styles.remove( 'border-style' );

		expect( styles.toString() ).toBe(
			'border-width:1px;'
		);

		styles.remove( 'border-width' );

		expect( styles.isEmpty ).toBe( true );
		expect( styles.toString() ).toBe( '' );
	} );

	describe( 'normalized values getters', () => {
		it( 'should output border-*-color', () => {
			styles.setTo( 'border:1px solid #f00;' );

			[ 'top', 'right', 'bottom', 'left' ].forEach( position => {
				expect( styles.getNormalized( `border-${ position }-color` ) ).toBe( '#f00' );
			} );
		} );

		it( 'should output border-*-width', () => {
			styles.setTo( 'border:1px solid #f00;' );

			[ 'top', 'right', 'bottom', 'left' ].forEach( position => {
				expect( styles.getNormalized( `border-${ position }-width` ) ).toBe( '1px' );
			} );
		} );

		it( 'should output border-*-style', () => {
			styles.setTo( 'border:1px solid #f00;' );

			[ 'top', 'right', 'bottom', 'left' ].forEach( position => {
				expect( styles.getNormalized( `border-${ position }-style` ) ).toBe( 'solid' );
			} );
		} );
	} );

	describe( 'border reducers', () => {
		it( 'should output border-top', () => {
			styles.setTo( 'border:1px solid #f00' );

			expect( styles.getAsString( 'border-top' ) ).toBe( '1px solid #f00' );
		} );

		it( 'should output border-right', () => {
			styles.setTo( 'border:1px solid #f00' );

			expect( styles.getAsString( 'border-right' ) ).toBe( '1px solid #f00' );
		} );

		it( 'should output border-bottom', () => {
			styles.setTo( 'border:1px solid #f00' );

			expect( styles.getAsString( 'border-bottom' ) ).toBe( '1px solid #f00' );
		} );

		it( 'should output border-left', () => {
			styles.setTo( 'border:1px solid #f00' );

			expect( styles.getAsString( 'border-left' ) ).toBe( '1px solid #f00' );
		} );

		it( 'should output merged "border-style" property and the rest for particular borders', () => {
			styles.setTo(
				'border-top: 1px solid #aaa;' +
				'border-right:2px solid #bbb;' +
				'border-bottom:3px solid #ccc;' +
				'border-left:4px solid #ddd;'
			);

			// Assuming that `border-color` will be applied from outside (external CSS).
			styles.remove( 'border-color' );

			expect( styles.toString() ).toBe(
				'border-bottom-width:3px;' +
				'border-left-width:4px;' +
				'border-right-width:2px;' +
				// All borders use the same border-style, so it's merged into the single property.
				'border-style:solid;' +
				'border-top-width:1px;'
			);
		} );

		it( 'should output merged "border-color" property and the rest for particular borders', () => {
			styles.setTo(
				'border-top: 1px solid #aaa;' +
				'border-right:2px dotted #aaa;' +
				'border-bottom:3px dashed #aaa;' +
				'border-left:4px double #aaa;'
			);

			// Assuming that `border-width` will be applied from outside (external CSS).
			styles.remove( 'border-width' );

			expect( styles.toString() ).toBe(
				'border-bottom-style:dashed;' +
				// All borders use the same border-color, so it's merged into the single property.
				'border-color:#aaa;' +
				'border-left-style:double;' +
				'border-right-style:dotted;' +
				'border-top-style:solid;'
			);
		} );

		it( 'should output merged "border-width" property and the rest for particular borders', () => {
			styles.setTo(
				'border-top: 1px solid #aaa;' +
				'border-right:1px dotted #bbb;' +
				'border-bottom:1px dashed #ccc;' +
				'border-left:1px double #ddd;'
			);

			// Assuming that `border-style` will be applied from outside (external CSS).
			styles.remove( 'border-style' );

			expect( styles.toString() ).toBe(
				'border-bottom-color:#ccc;' +
				'border-left-color:#ddd;' +
				'border-right-color:#bbb;' +
				'border-top-color:#aaa;' +
				// All borders use the same border-width, so it's merged into the single property.
				'border-width:1px;'
			);
		} );
	} );

	describe( 'border-color', () => {
		it( 'should set all border colors (1 value defined)', () => {
			styles.setTo( 'border-color:cyan;' );

			expect( styles.getNormalized( 'border' ) ).toEqual( {
				color: {
					top: 'cyan',
					right: 'cyan',
					bottom: 'cyan',
					left: 'cyan'
				}
			} );
		} );

		it( 'should set all border colors (2 values defined)', () => {
			styles.setTo( 'border-color:cyan magenta;' );

			expect( styles.getNormalized( 'border' ) ).toEqual( {
				color: {
					top: 'cyan',
					right: 'magenta',
					bottom: 'cyan',
					left: 'magenta'
				}
			} );
		} );

		it( 'should set all border colors (3 values defined)', () => {
			styles.setTo( 'border-color:cyan magenta pink;' );

			expect( styles.getNormalized( 'border' ) ).toEqual( {
				color: {
					top: 'cyan',
					right: 'magenta',
					bottom: 'pink',
					left: 'magenta'
				}
			} );
		} );

		it( 'should set all border colors (4 values defined)', () => {
			styles.setTo( 'border-color:cyan magenta pink beige;' );

			expect( styles.getNormalized( 'border' ) ).toEqual( {
				color: {
					top: 'cyan',
					right: 'magenta',
					bottom: 'pink',
					left: 'beige'
				}
			} );
		} );

		it( 'should set all border colors (value with white spaces)', () => {
			styles.setTo(
				'border-color:   rgb(10 , 10,   10 )  rgba(100,    100,   100, .3   )' +
				'   rgb(  20%   20%  20% )    rgba(  255   255  255   /  .5 ) '
			);

			expect( styles.getNormalized( 'border' ) ).toEqual( {
				color: {
					top: 'rgb(10 , 10,   10 )',
					right: 'rgba(100,    100,   100, .3   )',
					bottom: 'rgb(  20%   20%  20% )',
					left: 'rgba(  255   255  255   /  .5 )'
				}
			} );
		} );

		it( 'should merge with border shorthand', () => {
			styles.setTo( 'border:1px solid blue;border-color:cyan black;' );

			expect( styles.getNormalized( 'border' ) ).toEqual( {
				color: { top: 'cyan', right: 'black', bottom: 'cyan', left: 'black' },
				style: { top: 'solid', right: 'solid', bottom: 'solid', left: 'solid' },
				width: { top: '1px', right: '1px', bottom: '1px', left: '1px' }
			} );
		} );

		it( 'should parse #RGB color value', () => {
			styles.setTo( 'border:#f00;' );

			expect( styles.getNormalized( 'border-color' ) ).toEqual( {
				top: '#f00',
				right: '#f00',
				bottom: '#f00',
				left: '#f00'
			} );
		} );

		it( 'should parse #RGBA color value', () => {
			styles.setTo( 'border:#f00A;' );

			expect( styles.getNormalized( 'border-color' ) ).toEqual( {
				top: '#f00A',
				right: '#f00A',
				bottom: '#f00A',
				left: '#f00A'
			} );
		} );

		it( 'should parse rgb() color value', () => {
			styles.setTo( 'border:rgb(0, 30%,35);' );

			expect( styles.getNormalized( 'border-color' ) ).toEqual( {
				top: 'rgb(0, 30%,35)',
				right: 'rgb(0, 30%,35)',
				bottom: 'rgb(0, 30%,35)',
				left: 'rgb(0, 30%,35)'
			} );
		} );

		it( 'should parse hsl() color value', () => {
			styles.setTo( 'border:hsl(0, 100%, 50%);' );

			expect( styles.getNormalized( 'border-color' ) ).toEqual( {
				top: 'hsl(0, 100%, 50%)',
				right: 'hsl(0, 100%, 50%)',
				bottom: 'hsl(0, 100%, 50%)',
				left: 'hsl(0, 100%, 50%)'
			} );
		} );
	} );

	describe( 'border-style', () => {
		it( 'should set all border styles (1 value defined)', () => {
			styles.setTo( 'border-style:solid;' );

			expect( styles.getNormalized( 'border' ) ).toEqual( {
				style: {
					top: 'solid',
					right: 'solid',
					bottom: 'solid',
					left: 'solid'
				}
			} );
		} );

		it( 'should set all border styles (2 values defined)', () => {
			styles.setTo( 'border-style:solid dotted;' );

			expect( styles.getNormalized( 'border' ) ).toEqual( {
				style: {
					top: 'solid',
					right: 'dotted',
					bottom: 'solid',
					left: 'dotted'
				}
			} );
		} );

		it( 'should set all border styles (3 values defined)', () => {
			styles.setTo( 'border-style:solid dotted dashed;' );

			expect( styles.getNormalized( 'border' ) ).toEqual( {
				style: {
					top: 'solid',
					right: 'dotted',
					bottom: 'dashed',
					left: 'dotted'
				}
			} );
		} );

		it( 'should set all border styles (4 values defined)', () => {
			styles.setTo( 'border-style:solid dotted dashed ridge;' );

			expect( styles.getNormalized( 'border' ) ).toEqual( {
				style: {
					top: 'solid',
					right: 'dotted',
					bottom: 'dashed',
					left: 'ridge'
				}
			} );
		} );

		it( 'should set all border styles (value with white spaces)', () => {
			styles.setTo( 'border-style:  solid   dotted   var( --dashed )   ridge ;' );

			expect( styles.getNormalized( 'border' ) ).toEqual( {
				style: {
					top: 'solid',
					right: 'dotted',
					bottom: 'var( --dashed )',
					left: 'ridge'
				}
			} );
		} );

		it( 'should parse none value', () => {
			styles.setTo( 'border:none;' );

			expect( styles.getNormalized( 'border-style' ) ).toEqual( {
				top: 'none',
				right: 'none',
				bottom: 'none',
				left: 'none'
			} );
		} );

		it( 'should parse line-style value', () => {
			styles.setTo( 'border:solid;' );

			expect( styles.getNormalized( 'border-style' ) ).toEqual( {
				top: 'solid',
				right: 'solid',
				bottom: 'solid',
				left: 'solid'
			} );
		} );

		it( 'should not parse non line-style value', () => {
			styles.setTo( 'border:blue' );

			expect( styles.getNormalized( 'border-style' ) ).toEqual( {
				top: undefined,
				right: undefined,
				bottom: undefined,
				left: undefined
			} );
		} );
	} );

	describe( 'border-width', () => {
		it( 'should set all border widths (1 value defined)', () => {
			styles.setTo( 'border-width:1px;' );

			expect( styles.getNormalized( 'border' ) ).toEqual( {
				width: {
					top: '1px',
					right: '1px',
					bottom: '1px',
					left: '1px'
				}
			} );
		} );

		it( 'should set all border widths (2 values defined)', () => {
			styles.setTo( 'border-width:1px .34cm;' );

			expect( styles.getNormalized( 'border' ) ).toEqual( {
				width: {
					top: '1px',
					right: '.34cm',
					bottom: '1px',
					left: '.34cm'
				}
			} );
		} );

		it( 'should set all border widths (3 values defined)', () => {
			styles.setTo( 'border-width:1px .34cm 90.1rem;' );

			expect( styles.getNormalized( 'border' ) ).toEqual( {
				width: {
					top: '1px',
					right: '.34cm',
					bottom: '90.1rem',
					left: '.34cm'
				}
			} );
		} );

		it( 'should set all border widths (4 values defined)', () => {
			styles.setTo( 'border-width:1px .34cm 90.1rem thick;' );

			expect( styles.getNormalized( 'border' ) ).toEqual( {
				width: {
					top: '1px',
					right: '.34cm',
					bottom: '90.1rem',
					left: 'thick'
				}
			} );
		} );

		it( 'should set all border widths (value with white spaces)', () => {
			styles.setTo( 'border-width:   1px    .34cm    90.1rem   var(--foo)  ;' );

			expect( styles.getNormalized( 'border' ) ).toEqual( {
				width: {
					top: '1px',
					right: '.34cm',
					bottom: '90.1rem',
					left: 'var(--foo)'
				}
			} );
		} );

		it( 'should parse px value', () => {
			styles.setTo( 'border:1px;' );

			expect( styles.getNormalized( 'border-width' ) ).toEqual( {
				top: '1px',
				right: '1px',
				bottom: '1px',
				left: '1px'
			} );
		} );

		it( 'should parse em value', () => {
			styles.setTo( 'border:1em;' );

			expect( styles.getNormalized( 'border-width' ) ).toEqual( {
				top: '1em',
				right: '1em',
				bottom: '1em',
				left: '1em'
			} );
		} );

		it( 'should parse thin value', () => {
			styles.setTo( 'border:thin' );

			expect( styles.getNormalized( 'border-width' ) ).toEqual( {
				top: 'thin',
				right: 'thin',
				bottom: 'thin',
				left: 'thin'
			} );
		} );

		it( 'should parse medium value', () => {
			styles.setTo( 'border:medium' );

			expect( styles.getNormalized( 'border-width' ) ).toEqual( {
				top: 'medium',
				right: 'medium',
				bottom: 'medium',
				left: 'medium'
			} );
		} );

		it( 'should parse thick value', () => {
			styles.setTo( 'border:thick' );

			expect( styles.getNormalized( 'border-width' ) ).toEqual( {
				top: 'thick',
				right: 'thick',
				bottom: 'thick',
				left: 'thick'
			} );
		} );
	} );

	describe( 'border-* position', () => {
		it( 'should output all positions', () => {
			styles.setTo(
				'border-top:none;' +
				'border-left:none;' +
				'border-bottom:dotted #FFC000 3.0pt;' +
				'border-right:dotted #FFC000 3.0pt;'
			);

			expect( styles.toString() ).toBe(
				'border-bottom:3.0pt dotted #FFC000;' +
				'border-left-style:none;' +
				'border-right:3.0pt dotted #FFC000;' +
				'border-top-style:none;'
			);
			expect( styles.getAsString( 'border-top-style' ) ).toBe( 'none' );
			expect( styles.getAsString( 'border-right' ) ).toBe( '3.0pt dotted #FFC000' );
			expect( styles.getAsString( 'border-bottom' ) ).toBe( '3.0pt dotted #FFC000' );
			expect( styles.getAsString( 'border-left-style' ) ).toBe( 'none' );
		} );

		it( 'should output nothing if no border style defined', () => {
			styles.setTo( 'color:blue;' );

			expect( styles.toString() ).toBe( 'color:blue;' );
			expect( styles.getAsString( 'border-top' ) ).toBeUndefined();
			expect( styles.getAsString( 'border-right' ) ).toBeUndefined();
			expect( styles.getAsString( 'border-bottom' ) ).toBeUndefined();
			expect( styles.getAsString( 'border-left' ) ).toBeUndefined();
		} );
	} );

	describe( 'getStyleNames() - border', () => {
		it( 'should set all border colors (1 value defined)', () => {
			styles.setTo( 'border-color: deeppink deepskyblue;' +
				'border-style: solid;' +
				'border-width: 1px;' +
				'border-bottom-width: 2px;' +
				'border-right-style: dotted;' );

			expect( styles.getStyleNames() ).toEqual( [
				'border-top',
				'border-right',
				'border-bottom',
				'border-left'
			] );
		} );
	} );
} );
