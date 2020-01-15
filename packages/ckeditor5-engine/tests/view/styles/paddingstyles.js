/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import StylesMap, { StylesProcessor } from '../../../src/view/stylesmap';
import { addPaddingRules } from '../../../src/view/styles/padding';

describe( 'Padding styles normalization', () => {
	let styles;

	before( () => {
		const stylesProcessor = new StylesProcessor();
		StylesMap._setProcessor( stylesProcessor );
		addPaddingRules( stylesProcessor );
	} );

	beforeEach( () => {
		styles = new StylesMap();
	} );

	it( 'should set all paddings (1 value defined)', () => {
		styles.setTo( 'padding:1px;' );

		expect( styles.getNormalized( 'padding' ) ).to.deep.equal( {
			top: '1px',
			right: '1px',
			bottom: '1px',
			left: '1px'
		} );
	} );

	it( 'should set all paddings (2 values defined)', () => {
		styles.setTo( 'padding:1px .34cm;' );

		expect( styles.getNormalized( 'padding' ) ).to.deep.equal( {
			top: '1px',
			right: '.34cm',
			bottom: '1px',
			left: '.34cm'
		} );
	} );

	it( 'should set all paddings (3 values defined)', () => {
		styles.setTo( 'padding:1px .34cm 90.1rem;' );

		expect( styles.getNormalized( 'padding' ) ).to.deep.equal( {
			top: '1px',
			right: '.34cm',
			bottom: '90.1rem',
			left: '.34cm'
		} );
	} );

	it( 'should set all paddings (4 values defined)', () => {
		styles.setTo( 'padding:1px .34cm 90.1rem thick;' );

		expect( styles.getNormalized( 'padding' ) ).to.deep.equal( {
			top: '1px',
			right: '.34cm',
			bottom: '90.1rem',
			left: 'thick'
		} );
	} );

	describe( 'padding-*', () => {
		it( 'should set proper padding', () => {
			styles.setTo( 'padding-top:1px;' );

			expect( styles.getNormalized( 'padding' ) ).to.deep.equal( {
				top: '1px'
			} );
		} );

		it( 'should set proper padding with padding shorthand', () => {
			styles.setTo( 'padding: 2em;padding-top:1px;' );

			expect( styles.getNormalized( 'padding' ) ).to.deep.equal( {
				top: '1px',
				right: '2em',
				bottom: '2em',
				left: '2em'
			} );
		} );
	} );
} );
