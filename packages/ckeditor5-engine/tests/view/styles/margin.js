/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';

import { StylesMap, StylesProcessor } from '../../../src/view/stylesmap.js';
import { addMarginStylesRules } from '../../../src/view/styles/margin.js';

describe( 'Margin styles normalizer', () => {
	let styles;

	beforeEach( () => {
		const stylesProcessor = new StylesProcessor();
		addMarginStylesRules( stylesProcessor );
		styles = new StylesMap( stylesProcessor );
	} );

	it( 'should set all margins (1 value defined)', () => {
		styles.setTo( 'margin:1px;' );

		expect( styles.getNormalized( 'margin' ) ).toEqual( {
			top: '1px',
			right: '1px',
			bottom: '1px',
			left: '1px'
		} );
	} );

	it( 'should set all margins (2 values defined)', () => {
		styles.setTo( 'margin:1px .34cm;' );

		expect( styles.getNormalized( 'margin' ) ).toEqual( {
			top: '1px',
			right: '.34cm',
			bottom: '1px',
			left: '.34cm'
		} );
	} );

	it( 'should set all margins (3 values defined)', () => {
		styles.setTo( 'margin:1px .34cm 90.1rem;' );

		expect( styles.getNormalized( 'margin' ) ).toEqual( {
			top: '1px',
			right: '.34cm',
			bottom: '90.1rem',
			left: '.34cm'
		} );
	} );

	it( 'should set all margins (4 values defined)', () => {
		styles.setTo( 'margin:1px .34cm 90.1rem thick;' );

		expect( styles.getNormalized( 'margin' ) ).toEqual( {
			top: '1px',
			right: '.34cm',
			bottom: '90.1rem',
			left: 'thick'
		} );
	} );

	it( 'should output inline style (1 value defined)', () => {
		styles.setTo( 'margin:1px;' );

		expect( styles.toString() ).toBe( 'margin:1px;' );
		expect( styles.getAsString( 'margin' ) ).toBe( '1px' );
		expect( styles.getAsString( 'margin-top' ) ).toBe( '1px' );
		expect( styles.getAsString( 'margin-right' ) ).toBe( '1px' );
		expect( styles.getAsString( 'margin-bottom' ) ).toBe( '1px' );
		expect( styles.getAsString( 'margin-left' ) ).toBe( '1px' );
	} );

	it( 'should output inline style (2 values defined)', () => {
		styles.setTo( 'margin:1px .34cm;' );

		expect( styles.toString() ).toBe( 'margin:1px .34cm;' );
		expect( styles.getAsString( 'margin' ) ).toBe( '1px .34cm' );
		expect( styles.getAsString( 'margin-top' ) ).toBe( '1px' );
		expect( styles.getAsString( 'margin-right' ) ).toBe( '.34cm' );
		expect( styles.getAsString( 'margin-bottom' ) ).toBe( '1px' );
		expect( styles.getAsString( 'margin-left' ) ).toBe( '.34cm' );
	} );

	it( 'should output inline style (3 values defined)', () => {
		styles.setTo( 'margin:1px .34cm 90.1rem;' );

		expect( styles.toString() ).toBe( 'margin:1px .34cm 90.1rem;' );
		expect( styles.getAsString( 'margin' ) ).toBe( '1px .34cm 90.1rem' );
		expect( styles.getAsString( 'margin-top' ) ).toBe( '1px' );
		expect( styles.getAsString( 'margin-right' ) ).toBe( '.34cm' );
		expect( styles.getAsString( 'margin-bottom' ) ).toBe( '90.1rem' );
		expect( styles.getAsString( 'margin-left' ) ).toBe( '.34cm' );
	} );

	it( 'should output inline style (3 values defined, only last different)', () => {
		styles.setTo( 'margin:1px 1px 90.1rem;' );

		expect( styles.toString() ).toBe( 'margin:1px 1px 90.1rem;' );
		expect( styles.getAsString( 'margin' ) ).toBe( '1px 1px 90.1rem' );
		expect( styles.getAsString( 'margin-top' ) ).toBe( '1px' );
		expect( styles.getAsString( 'margin-right' ) ).toBe( '1px' );
		expect( styles.getAsString( 'margin-bottom' ) ).toBe( '90.1rem' );
		expect( styles.getAsString( 'margin-left' ) ).toBe( '1px' );
	} );

	it( 'should output inline style (4 values defined)', () => {
		styles.setTo( 'margin:1px .34cm 90.1rem thick;' );

		expect( styles.toString() ).toBe( 'margin:1px .34cm 90.1rem thick;' );
		expect( styles.getAsString( 'margin' ) ).toBe( '1px .34cm 90.1rem thick' );
		expect( styles.getAsString( 'margin-top' ) ).toBe( '1px' );
		expect( styles.getAsString( 'margin-right' ) ).toBe( '.34cm' );
		expect( styles.getAsString( 'margin-bottom' ) ).toBe( '90.1rem' );
		expect( styles.getAsString( 'margin-left' ) ).toBe( 'thick' );
	} );

	it( 'should output inline style (4 values defined, only last different)', () => {
		styles.setTo( 'margin:1px 1px 1px thick;' );

		expect( styles.toString() ).toBe( 'margin:1px 1px 1px thick;' );
		expect( styles.getAsString( 'margin' ) ).toBe( '1px 1px 1px thick' );
		expect( styles.getAsString( 'margin-top' ) ).toBe( '1px' );
		expect( styles.getAsString( 'margin-right' ) ).toBe( '1px' );
		expect( styles.getAsString( 'margin-bottom' ) ).toBe( '1px' );
		expect( styles.getAsString( 'margin-left' ) ).toBe( 'thick' );
	} );

	describe( 'margin-*', () => {
		it( 'should set proper margin', () => {
			styles.setTo( 'margin-top:1px;' );

			expect( styles.getNormalized( 'margin' ) ).toEqual( { top: '1px' } );
			expect( styles.getNormalized( 'margin-top' ) ).toBe( '1px' );
		} );

		it( 'should merge margin with margin shorthand', () => {
			styles.setTo( 'margin: 2em;margin-top:1px;' );

			expect( styles.getNormalized( 'margin' ) ).toEqual( {
				top: '1px',
				right: '2em',
				bottom: '2em',
				left: '2em'
			} );
			expect( styles.getNormalized( 'margin-top' ) ).toBe( '1px' );
			expect( styles.getNormalized( 'margin-right' ) ).toBe( '2em' );
			expect( styles.getNormalized( 'margin-bottom' ) ).toBe( '2em' );
			expect( styles.getNormalized( 'margin-left' ) ).toBe( '2em' );
		} );

		it( 'should output margin-top', () => {
			styles.setTo( 'margin-top:1px;' );

			expect( styles.toString() ).toBe( 'margin-top:1px;' );
			expect( styles.getAsString( 'margin-top' ) ).toBe( '1px' );
		} );

		it( 'should output margin-right', () => {
			styles.setTo( 'margin-right:1px;' );

			expect( styles.toString() ).toBe( 'margin-right:1px;' );
			expect( styles.getAsString( 'margin-right' ) ).toBe( '1px' );
		} );

		it( 'should output margin-bottom', () => {
			styles.setTo( 'margin-bottom:1px;' );

			expect( styles.toString() ).toBe( 'margin-bottom:1px;' );
			expect( styles.getAsString( 'margin-bottom' ) ).toBe( '1px' );
		} );

		it( 'should output margin-left', () => {
			styles.setTo( 'margin-left:1px;' );

			expect( styles.toString() ).toBe( 'margin-left:1px;' );
			expect( styles.getAsString( 'margin-left' ) ).toBe( '1px' );
		} );
	} );
} );
