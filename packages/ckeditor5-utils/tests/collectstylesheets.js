/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { collectStylesheets } from '../src/collectstylesheets.js';

describe( 'collectStylesheets', () => {
	let styleSheetsMock;

	beforeEach( () => {
		styleSheetsMock = [
			{
				ownerNode: {
					hasAttribute: name => name === 'data-cke'
				},
				cssRules: [
					{ cssText: ':root { --variable1: white; }' },
					{ cssText: '.ck-content { color: black }' },
					{ cssText: '.some-styles { color: red }' }
				]
			},
			{
				ownerNode: {
					hasAttribute: name => name === 'data-cke'
				},
				cssRules: [
					{ cssText: ':root { --variable2: blue; }' },
					{ cssText: '.ck-content { background: white }' }
				]
			},
			{
				ownerNode: {
					hasAttribute: () => false
				},
				cssRules: [
					{ cssText: 'h2 { color: black }' }
				]
			}
		];

		vi.spyOn( document, 'styleSheets', 'get' ).mockImplementation( () => styleSheetsMock );
	} );

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	it( 'should not return any styles if no paths to stylesheets provided', async () => {
		expect( await collectStylesheets( undefined ) ).toBe( '' );
	} );

	it( 'should log into the console when ".ck-content" styles are missing', async () => {
		styleSheetsMock = [ {
			ownerNode: {
				hasAttribute: name => name === 'data-cke'
			},
			cssRules: [
				{ cssText: ':root { --variable: white; }' }
			]
		} ];

		const consoleSpy = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

		await collectStylesheets( [ 'EDITOR_STYLES' ] );

		expect( consoleSpy ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should get ".ck-content" styles when "EDITOR_STYLES" token is provided', async () => {
		const consoleSpy = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

		vi.spyOn( window, 'fetch' ).mockResolvedValue( new Response( '.custom { color: blue; }' ) );

		const styles = await collectStylesheets( [ './custom.css', 'EDITOR_STYLES' ] );

		expect( consoleSpy ).not.toHaveBeenCalled();

		expect( styles.length > 0 ).toBe( true );
		expect( styles.indexOf( '.ck-content' ) !== -1 ).toBe( true );
	} );

	it( 'should get styles from multiple stylesheets with data-cke attribute', async () => {
		const styles = await collectStylesheets( [ 'EDITOR_STYLES' ] );

		expect( styles ).toContain( ':root { --variable1: white; }' );
		expect( styles ).toContain( ':root { --variable2: blue; }' );
		expect( styles ).toContain( '.ck-content { color: black }' );
		expect( styles ).toContain( '.ck-content { background: white }' );
	} );

	it( 'should collect all :root styles from stylesheets with data-cke attribute', async () => {
		const styles = await collectStylesheets( [ 'EDITOR_STYLES' ] );

		expect( styles ).toContain( '--variable1: white' );
		expect( styles ).toContain( '--variable2: blue' );
	} );

	it( 'should fetch stylesheets from the provided paths and return concat result', async () => {
		vi.spyOn( window, 'fetch' )
			.mockResolvedValueOnce( new Response( '.first { color: green; }' ) )
			.mockResolvedValueOnce( new Response( '.second { color: red; }' ) );

		const styles = await collectStylesheets( [ './first.css', './second.css' ] );

		expect( styles ).toBe( '.first { color: green; } .second { color: red; }' );
	} );
} );
