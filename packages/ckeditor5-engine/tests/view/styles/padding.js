/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import StylesMap, { StylesProcessor } from '../../../src/view/stylesmap.js';
import { addPaddingRules } from '../../../src/view/styles/padding.js';

describe( 'Padding styles normalization', () => {
	let styles;

	beforeEach( () => {
		const stylesProcessor = new StylesProcessor();
		addPaddingRules( stylesProcessor );
		styles = new StylesMap( stylesProcessor );
	} );

	it( 'should set all padding values (1 value defined)', () => {
		styles.setTo( 'padding:1px;' );

		expect( styles.getNormalized( 'padding' ) ).to.deep.equal( {
			top: '1px',
			right: '1px',
			bottom: '1px',
			left: '1px'
		} );
	} );

	it( 'should set all padding values (2 values defined)', () => {
		styles.setTo( 'padding:1px .34cm;' );

		expect( styles.getNormalized( 'padding' ) ).to.deep.equal( {
			top: '1px',
			right: '.34cm',
			bottom: '1px',
			left: '.34cm'
		} );
	} );

	it( 'should set all padding values (3 values defined)', () => {
		styles.setTo( 'padding:1px .34cm 90.1rem;' );

		expect( styles.getNormalized( 'padding' ) ).to.deep.equal( {
			top: '1px',
			right: '.34cm',
			bottom: '90.1rem',
			left: '.34cm'
		} );
	} );

	it( 'should set all padding values (4 values defined)', () => {
		styles.setTo( 'padding:1px .34cm 90.1rem thick;' );

		expect( styles.getNormalized( 'padding' ) ).to.deep.equal( {
			top: '1px',
			right: '.34cm',
			bottom: '90.1rem',
			left: 'thick'
		} );
	} );

	it( 'should output inline style (1 value defined)', () => {
		styles.setTo( 'padding:1px;' );

		expect( styles.toString() ).to.equal( 'padding:1px;' );
		expect( styles.getAsString( 'padding' ) ).to.equal( '1px' );
		expect( styles.getAsString( 'padding-top' ) ).to.equal( '1px' );
		expect( styles.getAsString( 'padding-right' ) ).to.equal( '1px' );
		expect( styles.getAsString( 'padding-bottom' ) ).to.equal( '1px' );
		expect( styles.getAsString( 'padding-left' ) ).to.equal( '1px' );
	} );

	it( 'should output inline style (2 values defined)', () => {
		styles.setTo( 'padding:1px .34cm;' );

		expect( styles.toString() ).to.equal( 'padding:1px .34cm;' );
		expect( styles.getAsString( 'padding' ) ).to.equal( '1px .34cm' );
		expect( styles.getAsString( 'padding-top' ) ).to.equal( '1px' );
		expect( styles.getAsString( 'padding-right' ) ).to.equal( '.34cm' );
		expect( styles.getAsString( 'padding-bottom' ) ).to.equal( '1px' );
		expect( styles.getAsString( 'padding-left' ) ).to.equal( '.34cm' );
	} );

	it( 'should output inline style (3 values defined)', () => {
		styles.setTo( 'padding:1px .34cm 90.1rem;' );

		expect( styles.toString() ).to.equal( 'padding:1px .34cm 90.1rem;' );
		expect( styles.getAsString( 'padding' ) ).to.equal( '1px .34cm 90.1rem' );
		expect( styles.getAsString( 'padding-top' ) ).to.equal( '1px' );
		expect( styles.getAsString( 'padding-right' ) ).to.equal( '.34cm' );
		expect( styles.getAsString( 'padding-bottom' ) ).to.equal( '90.1rem' );
		expect( styles.getAsString( 'padding-left' ) ).to.equal( '.34cm' );
	} );

	it( 'should output inline style (3 values defined, only last different)', () => {
		styles.setTo( 'padding:1px 1px 90.1rem;' );

		expect( styles.toString() ).to.equal( 'padding:1px 1px 90.1rem;' );
		expect( styles.getAsString( 'padding' ) ).to.equal( '1px 1px 90.1rem' );
		expect( styles.getAsString( 'padding-top' ) ).to.equal( '1px' );
		expect( styles.getAsString( 'padding-right' ) ).to.equal( '1px' );
		expect( styles.getAsString( 'padding-bottom' ) ).to.equal( '90.1rem' );
		expect( styles.getAsString( 'padding-left' ) ).to.equal( '1px' );
	} );

	it( 'should output inline style (4 values defined)', () => {
		styles.setTo( 'padding:1px .34cm 90.1rem thick;' );

		expect( styles.toString() ).to.equal( 'padding:1px .34cm 90.1rem thick;' );
		expect( styles.getAsString( 'padding' ) ).to.equal( '1px .34cm 90.1rem thick' );
		expect( styles.getAsString( 'padding-top' ) ).to.equal( '1px' );
		expect( styles.getAsString( 'padding-right' ) ).to.equal( '.34cm' );
		expect( styles.getAsString( 'padding-bottom' ) ).to.equal( '90.1rem' );
		expect( styles.getAsString( 'padding-left' ) ).to.equal( 'thick' );
	} );

	it( 'should output inline style (4 values defined, only last different)', () => {
		styles.setTo( 'padding:1px 1px 1px thick;' );

		expect( styles.toString() ).to.equal( 'padding:1px 1px 1px thick;' );
		expect( styles.getAsString( 'padding' ) ).to.equal( '1px 1px 1px thick' );
		expect( styles.getAsString( 'padding-top' ) ).to.equal( '1px' );
		expect( styles.getAsString( 'padding-right' ) ).to.equal( '1px' );
		expect( styles.getAsString( 'padding-bottom' ) ).to.equal( '1px' );
		expect( styles.getAsString( 'padding-left' ) ).to.equal( 'thick' );
	} );

	describe( 'padding-*', () => {
		it( 'should set proper padding', () => {
			styles.setTo( 'padding-top:1px;' );

			expect( styles.getNormalized( 'padding' ) ).to.deep.equal( { top: '1px' } );
			expect( styles.getNormalized( 'padding-top' ) ).to.equal( '1px' );
		} );

		it( 'should merge padding with padding shorthand', () => {
			styles.setTo( 'padding: 2em;padding-top:1px;' );

			expect( styles.getNormalized( 'padding' ) ).to.deep.equal( {
				top: '1px',
				right: '2em',
				bottom: '2em',
				left: '2em'
			} );
			expect( styles.getNormalized( 'padding-top' ) ).to.equal( '1px' );
			expect( styles.getNormalized( 'padding-right' ) ).to.equal( '2em' );
			expect( styles.getNormalized( 'padding-bottom' ) ).to.equal( '2em' );
			expect( styles.getNormalized( 'padding-left' ) ).to.equal( '2em' );
		} );

		it( 'should output padding-top', () => {
			styles.setTo( 'padding-top:1px;' );

			expect( styles.toString() ).to.equal( 'padding-top:1px;' );
			expect( styles.getAsString( 'padding-top' ) ).to.equal( '1px' );
		} );

		it( 'should output padding-right', () => {
			styles.setTo( 'padding-right:1px;' );

			expect( styles.toString() ).to.equal( 'padding-right:1px;' );
			expect( styles.getAsString( 'padding-right' ) ).to.equal( '1px' );
		} );

		it( 'should output padding-bottom', () => {
			styles.setTo( 'padding-bottom:1px;' );

			expect( styles.toString() ).to.equal( 'padding-bottom:1px;' );
			expect( styles.getAsString( 'padding-bottom' ) ).to.equal( '1px' );
		} );

		it( 'should output padding-left', () => {
			styles.setTo( 'padding-left:1px;' );

			expect( styles.toString() ).to.equal( 'padding-left:1px;' );
			expect( styles.getAsString( 'padding-left' ) ).to.equal( '1px' );
		} );
	} );
} );
