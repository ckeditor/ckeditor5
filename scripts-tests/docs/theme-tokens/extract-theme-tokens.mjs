/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { extractThemeTokens } from '../../../scripts/docs/theme-tokens/extract-theme-tokens.mjs';

const FIXTURES_PATH = fileURLToPath( new URL( './fixtures/theme/', import.meta.url ) );

describe( 'extractThemeTokens()', () => {
	const surface = extractThemeTokens( FIXTURES_PATH + 'colors/_semantic-surface.css' );
	const shape = extractThemeTokens( FIXTURES_PATH + '_semantic-shape.css' );

	function getToken( result, name ) {
		return result.tokens.find( token => token.name === name );
	}

	it( 'returns the doc comment before the first root rule as the file description, without the license header', () => {
		expect( surface.description ).toBe( 'The surfaces of the fixture theme. They use `--ck-color-white` from the foundation.' );
	} );

	it( 'returns the tokens of the root rules in the order of the file', () => {
		expect( surface.tokens.map( token => token.name ) ).toEqual( [
			'--ck-color-surface-canvas',
			'--ck-color-surface-overlay',
			'--ck-color-surface-raised',
			'--ck-color-surface-fallback',
			'--ck-color-text-default',
			'--ck-color-text-subtle',
			'--ck-color-surface-mixed',
			'--ck-color-surface-unsupported',
			'--ck-color-surface-page',
			'--ck-color-surface-print'
		] );
	} );

	it( 'skips the tokens of other selectors and of at-rules', () => {
		expect( getToken( surface, '--ck-color-surface-scoped' ) ).toBeUndefined();
		expect( getToken( surface, '--ck-color-surface-nested' ) ).toBeUndefined();
		expect( shape.tokens.filter( token => token.name === '--ck-motion-duration-short' ) ).toEqual( [
			expect.objectContaining( { value: '120ms' } )
		] );
	} );

	it( 'returns the declared value, the line, the description, and the pairs of a token', () => {
		expect( getToken( surface, '--ck-color-surface-overlay' ) ).toEqual( {
			name: '--ck-color-surface-overlay',
			value: 'hsla(0, 0%, 0%, 0.5)',
			line: 22,
			description: 'A translucent surface that dims the content below it, such as `--ck-color-surface-canvas`.',
			pairs: [ '--ck-color-text-default', '--ck-color-text-subtle' ],
			deprecated: null
		} );
	} );

	it( 'returns the token that the `@deprecated` tag names, and keeps the tag out of the description', () => {
		expect( getToken( surface, '--ck-color-surface-page' ) ).toMatchObject( {
			description: 'An alias of `--ck-color-surface-canvas`.',
			pairs: [],
			deprecated: '--ck-color-surface-canvas'
		} );
	} );

	it( 'joins a multi-line value into one line', () => {
		expect( getToken( shape, '--ck-shadow-raised' ).value ).toBe( '0 1px 2px hsla(0, 0%, 0%, 0.2), 0 2px 8px hsla(0, 0%, 0%, 0.1)' );
	} );

	it( 'keeps the description when a plain comment is between the doc comment and the declaration', () => {
		expect( getToken( surface, '--ck-color-text-default' ).description ).toBe( 'The color of the text on the surfaces.' );
	} );

	it( 'returns no description for a token with only a plain comment, even after the doc comment of another token', () => {
		expect( getToken( surface, '--ck-color-surface-raised' ) ).toMatchObject( { description: null, pairs: [], deprecated: null } );
		expect( getToken( shape, '--ck-spacing-control-large' ) ).toMatchObject( { description: null, pairs: [], deprecated: null } );
	} );

	describe( 'tags', () => {
		let directory;

		beforeEach( () => {
			directory = mkdtempSync( path.join( tmpdir(), 'theme-token-tags-' ) );
		} );

		afterEach( () => {
			rmSync( directory, { recursive: true, force: true } );
		} );

		function extractSource( source ) {
			const filePath = path.join( directory, 'tokens.css' );

			writeFileSync( filePath, source );

			return extractThemeTokens( filePath );
		}

		it( 'reads a tag followed by a tab, as the token docs check does', () => {
			const { tokens } = extractSource( [
				':root, :host {',
				'\t/**',
				'\t * A surface.',
				'\t *',
				'\t * @pair\t--ck-color-text-x',
				'\t * @deprecated\t--ck-color-surface-y',
				'\t */',
				'\t--ck-color-surface-x: hsl(0, 0%, 100%);',
				'}'
			].join( '\n' ) );

			expect( tokens[ 0 ] ).toMatchObject( { pairs: [ '--ck-color-text-x' ], deprecated: '--ck-color-surface-y' } );
		} );

		it( 'gives no pair and no successor for a tag without a name, and ignores a longer tag name', () => {
			const { tokens } = extractSource( [
				':root, :host {',
				'\t/**',
				'\t * A surface.',
				'\t *',
				'\t * @pair',
				'\t * @pair-foo --ck-color-text-x',
				'\t * @deprecated',
				'\t */',
				'\t--ck-color-surface-x: hsl(0, 0%, 100%);',
				'}'
			].join( '\n' ) );

			expect( tokens[ 0 ] ).toMatchObject( { description: 'A surface.', pairs: [], deprecated: null } );
		} );
	} );
} );
