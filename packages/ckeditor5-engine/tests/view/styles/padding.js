/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';

import { StylesMap, StylesProcessor } from '../../../src/view/stylesmap.js';
import { addPaddingStylesRules } from '../../../src/view/styles/padding.js';

describe( 'Padding styles normalization', () => {
	let styles;

	beforeEach( () => {
		const stylesProcessor = new StylesProcessor();
		addPaddingStylesRules( stylesProcessor );
		styles = new StylesMap( stylesProcessor );
	} );

	it( 'should set all padding values (1 value defined)', () => {
		styles.setTo( 'padding:1px;' );

		expect( styles.getNormalized( 'padding' ) ).toEqual( {
			top: '1px',
			right: '1px',
			bottom: '1px',
			left: '1px'
		} );
	} );

	it( 'should set all padding values (2 values defined)', () => {
		styles.setTo( 'padding:1px .34cm;' );

		expect( styles.getNormalized( 'padding' ) ).toEqual( {
			top: '1px',
			right: '.34cm',
			bottom: '1px',
			left: '.34cm'
		} );
	} );

	it( 'should set all padding values (3 values defined)', () => {
		styles.setTo( 'padding:1px .34cm 90.1rem;' );

		expect( styles.getNormalized( 'padding' ) ).toEqual( {
			top: '1px',
			right: '.34cm',
			bottom: '90.1rem',
			left: '.34cm'
		} );
	} );

	it( 'should set all padding values (4 values defined)', () => {
		styles.setTo( 'padding:1px .34cm 90.1rem thick;' );

		expect( styles.getNormalized( 'padding' ) ).toEqual( {
			top: '1px',
			right: '.34cm',
			bottom: '90.1rem',
			left: 'thick'
		} );
	} );

	it( 'should output inline style (1 value defined)', () => {
		styles.setTo( 'padding:1px;' );

		expect( styles.toString() ).toBe( 'padding:1px;' );
		expect( styles.getAsString( 'padding' ) ).toBe( '1px' );
		expect( styles.getAsString( 'padding-top' ) ).toBe( '1px' );
		expect( styles.getAsString( 'padding-right' ) ).toBe( '1px' );
		expect( styles.getAsString( 'padding-bottom' ) ).toBe( '1px' );
		expect( styles.getAsString( 'padding-left' ) ).toBe( '1px' );
	} );

	it( 'should output inline style (2 values defined)', () => {
		styles.setTo( 'padding:1px .34cm;' );

		expect( styles.toString() ).toBe( 'padding:1px .34cm;' );
		expect( styles.getAsString( 'padding' ) ).toBe( '1px .34cm' );
		expect( styles.getAsString( 'padding-top' ) ).toBe( '1px' );
		expect( styles.getAsString( 'padding-right' ) ).toBe( '.34cm' );
		expect( styles.getAsString( 'padding-bottom' ) ).toBe( '1px' );
		expect( styles.getAsString( 'padding-left' ) ).toBe( '.34cm' );
	} );

	it( 'should output inline style (3 values defined)', () => {
		styles.setTo( 'padding:1px .34cm 90.1rem;' );

		expect( styles.toString() ).toBe( 'padding:1px .34cm 90.1rem;' );
		expect( styles.getAsString( 'padding' ) ).toBe( '1px .34cm 90.1rem' );
		expect( styles.getAsString( 'padding-top' ) ).toBe( '1px' );
		expect( styles.getAsString( 'padding-right' ) ).toBe( '.34cm' );
		expect( styles.getAsString( 'padding-bottom' ) ).toBe( '90.1rem' );
		expect( styles.getAsString( 'padding-left' ) ).toBe( '.34cm' );
	} );

	it( 'should output inline style (3 values defined, only last different)', () => {
		styles.setTo( 'padding:1px 1px 90.1rem;' );

		expect( styles.toString() ).toBe( 'padding:1px 1px 90.1rem;' );
		expect( styles.getAsString( 'padding' ) ).toBe( '1px 1px 90.1rem' );
		expect( styles.getAsString( 'padding-top' ) ).toBe( '1px' );
		expect( styles.getAsString( 'padding-right' ) ).toBe( '1px' );
		expect( styles.getAsString( 'padding-bottom' ) ).toBe( '90.1rem' );
		expect( styles.getAsString( 'padding-left' ) ).toBe( '1px' );
	} );

	it( 'should output inline style (4 values defined)', () => {
		styles.setTo( 'padding:1px .34cm 90.1rem thick;' );

		expect( styles.toString() ).toBe( 'padding:1px .34cm 90.1rem thick;' );
		expect( styles.getAsString( 'padding' ) ).toBe( '1px .34cm 90.1rem thick' );
		expect( styles.getAsString( 'padding-top' ) ).toBe( '1px' );
		expect( styles.getAsString( 'padding-right' ) ).toBe( '.34cm' );
		expect( styles.getAsString( 'padding-bottom' ) ).toBe( '90.1rem' );
		expect( styles.getAsString( 'padding-left' ) ).toBe( 'thick' );
	} );

	it( 'should output inline style (4 values defined, only last different)', () => {
		styles.setTo( 'padding:1px 1px 1px thick;' );

		expect( styles.toString() ).toBe( 'padding:1px 1px 1px thick;' );
		expect( styles.getAsString( 'padding' ) ).toBe( '1px 1px 1px thick' );
		expect( styles.getAsString( 'padding-top' ) ).toBe( '1px' );
		expect( styles.getAsString( 'padding-right' ) ).toBe( '1px' );
		expect( styles.getAsString( 'padding-bottom' ) ).toBe( '1px' );
		expect( styles.getAsString( 'padding-left' ) ).toBe( 'thick' );
	} );

	describe( 'padding-*', () => {
		it( 'should set proper padding', () => {
			styles.setTo( 'padding-top:1px;' );

			expect( styles.getNormalized( 'padding' ) ).toEqual( { top: '1px' } );
			expect( styles.getNormalized( 'padding-top' ) ).toBe( '1px' );
		} );

		it( 'should merge padding with padding shorthand', () => {
			styles.setTo( 'padding: 2em;padding-top:1px;' );

			expect( styles.getNormalized( 'padding' ) ).toEqual( {
				top: '1px',
				right: '2em',
				bottom: '2em',
				left: '2em'
			} );
			expect( styles.getNormalized( 'padding-top' ) ).toBe( '1px' );
			expect( styles.getNormalized( 'padding-right' ) ).toBe( '2em' );
			expect( styles.getNormalized( 'padding-bottom' ) ).toBe( '2em' );
			expect( styles.getNormalized( 'padding-left' ) ).toBe( '2em' );
		} );

		it( 'should output padding-top', () => {
			styles.setTo( 'padding-top:1px;' );

			expect( styles.toString() ).toBe( 'padding-top:1px;' );
			expect( styles.getAsString( 'padding-top' ) ).toBe( '1px' );
		} );

		it( 'should output padding-right', () => {
			styles.setTo( 'padding-right:1px;' );

			expect( styles.toString() ).toBe( 'padding-right:1px;' );
			expect( styles.getAsString( 'padding-right' ) ).toBe( '1px' );
		} );

		it( 'should output padding-bottom', () => {
			styles.setTo( 'padding-bottom:1px;' );

			expect( styles.toString() ).toBe( 'padding-bottom:1px;' );
			expect( styles.getAsString( 'padding-bottom' ) ).toBe( '1px' );
		} );

		it( 'should output padding-left', () => {
			styles.setTo( 'padding-left:1px;' );

			expect( styles.toString() ).toBe( 'padding-left:1px;' );
			expect( styles.getAsString( 'padding-left' ) ).toBe( '1px' );
		} );
	} );
} );
