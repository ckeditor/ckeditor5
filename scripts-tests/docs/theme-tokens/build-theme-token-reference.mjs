/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { globSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { extractThemeTokens } from '../../../scripts/docs/theme-tokens/extract-theme-tokens.mjs';

const require = createRequire( import.meta.url );
const buildThemeTokenReference = require( '../../../scripts/docs/theme-tokens/build-theme-token-reference.cjs' );
const {
	THEME_PATH,
	LAYERS,
	createThemeTokenReference,
	collectDeclarations,
	resolve,
	simplifyCalc,
	evaluateCalc,
	getPairs,
	contrastRatio,
	formatRatio,
	getPreviewType,
	getReferencedTokens,
	collectAliases,
	getFollowedTokens,
	createFollowerIndex,
	getAllFollowers,
	splitDescription
} = buildThemeTokenReference;

const FIXTURES_PATH = fileURLToPath( new URL( './fixtures/theme/', import.meta.url ) );

// The foundation files that the introduction of the page promises, next to every semantic file.
const FOUNDATION_FILES = [ 'colors/_foundation.css' ];

const FIXTURE_LAYERS = [
	{
		title: 'Foundation',
		id: 'foundation',
		topics: [
			{ title: 'Colors', id: 'foundation-colors', files: [ 'colors/_foundation.css' ] }
		]
	},
	{
		title: 'Semantic',
		id: 'semantic',
		topics: [
			{ title: 'Surfaces', id: 'semantic-surfaces', files: [ 'colors/_semantic-surface.css' ] },
			{
				title: 'Shape',
				id: 'semantic-shape',
				files: [ '_semantic-shape.css' ],
				preview: [
					{ prefix: '--ck-border-radius-', type: 'radius' },
					{ prefix: '--ck-border-width-', type: 'line' },
					{ prefix: '--ck-border-', type: 'border' },
					{ prefix: '--ck-spacing-', type: 'bar' }
				]
			},
			{
				title: 'Typography',
				id: 'semantic-typography',
				files: [ '_semantic-typography.css' ],
				preview: [
					{ prefix: '--ck-font-weight-', type: 'font-weight' },
					{ prefix: '--ck-font-size-', type: 'font-size' },
					{ prefix: '--ck-color-focus-coordinates', type: 'hsl-channels' }
				]
			}
		]
	}
];

// A subset of the elements that the Markdown converter of the documentation website removes with their content:
// the ones the renderer uses on purpose, and the ones that would drop content if used by mistake.
const REMOVED_SELECTORS = [
	'button', 'form', '[aria-label]', '[role="presentation"]',
	'nav', 'header', '[aria-labelledby]', '.ck-content'
];

// The parts of the page that must not be in the Markdown.
const PARTS_OUT_OF_MARKDOWN = [
	'ck-token-ref__filter', 'ck-token-ref__copy', 'ck-token-ref__anchor', 'ck-token-ref__summary', 'ck-token-ref__preview',
	'ck-token-ref__pair-sample', 'ck-token-ref__value'
];

describe( 'buildThemeTokenReference()', () => {
	let html, tags, tokenIds;

	beforeAll( () => {
		html = getContent( buildThemeTokenReference() );
		tags = parseOpeningTags( html );
		tokenIds = tags.filter( tag => tag.classes.includes( 'ck-token-ref__token' ) ).map( tag => tag.attributes.id );
	} );

	function getListItem( name, label ) {
		return findListItem( html, name, label );
	}

	function getTokenHtml( name ) {
		return findTokenHtml( html, name );
	}

	// The theme files change often, so the tests on them check mostly what holds for every theme. The output itself is
	// checked on the fixture theme, in the tests of `createThemeTokenReference()`. Two kinds of tests are exceptions on
	// purpose: the ones that name the legacy names and the deprecated aliases of the theme, because only the theme has them,
	// and the one that requires a contrast for every pair, so that a color the builder cannot read does not land unnoticed.
	it( 'renders a row for every token of the files of the page, in their order', () => {
		const expectedIds = LAYERS.flatMap( layer => layer.topics ).flatMap( topic => topic.files ).flatMap( file =>
			extractThemeTokens( path.join( THEME_PATH, file ) ).tokens.map( token => token.name ) );

		expect( tokenIds.length ).toBeGreaterThan( 0 );
		expect( tokenIds ).toEqual( expectedIds );
	} );

	// The page promises the semantic tokens, but it lists only the files in `LAYERS`. When this test fails, add each missing
	// file to a topic of `LAYERS` in `scripts/docs/theme-tokens/build-theme-token-reference.cjs`.
	it( 'lists every semantic file and the promised foundation files of the theme', () => {
		const filesOnPage = new Set( LAYERS.flatMap( layer => layer.topics ).flatMap( topic => topic.files ) );
		// `LAYERS` uses slashes, and `globSync()` returns the separators of the system, such as backslashes on Windows.
		const semanticFiles = globSync( '**/_semantic-*.css', { cwd: THEME_PATH } ).map( file => file.split( path.sep ).join( '/' ) );

		expect( semanticFiles.length ).toBeGreaterThan( 0 );
		expect( [ ...semanticFiles, ...FOUNDATION_FILES ].filter( file => !filesOnPage.has( file ) ).sort() ).toEqual( [] );
	} );

	// A token declared with the same value in two files on the page would get two rows with the same id.
	it( 'gives every element on the page a unique id', () => {
		const ids = tags.map( tag => tag.attributes.id ).filter( Boolean );

		expect( new Set( ids ).size ).toBe( ids.length );
	} );

	// The naming guide leaves the `var()` chain out of the descriptions, because tools compute it in either direction.
	it( 'links every token to the tokens on the page that it follows and that follow it', () => {
		const declarations = collectDeclarations( THEME_PATH );
		const aliases = collectAliases( THEME_PATH );
		const tokens = LAYERS.flatMap( layer => layer.topics ).flatMap( topic => topic.files )
			.flatMap( file => extractThemeTokens( path.join( THEME_PATH, file ) ).tokens );
		const links = tokens.flatMap( token => getReferencedTokens( token.value, declarations )
			.filter( parent => tokenIds.includes( parent ) )
			.map( parent => ( { ...token, parent } ) ) );

		expect( links.length ).toBeGreaterThan( 0 );

		for ( const { name, parent } of links ) {
			expect( getListItem( parent, 'Followed by:' ) ).toContain( `<a href="#${ name }">` );
		}

		// An alias lists the same token under "Use instead", so it has no "Follows".
		for ( const token of tokens.filter( token => !token.deprecated ) ) {
			for ( const source of getFollowedTokens( token, declarations, aliases ).filter( source => tokenIds.includes( source ) ) ) {
				expect( getListItem( token.name, 'Follows:' ) ).toContain( `<a href="#${ source }">` );
			}
		}
	} );

	it( 'points "Follows" past the legacy names and the deprecated aliases to the tokens to override', () => {
		expect( getListItem( '--ck-layer-panel', 'Follows:' ) ).toBe(
			'<span class="ck-token-ref__label">Follows:</span> <code>--ck-z-overlay</code>'
		);
		expect( getListItem( '--ck-interactive-focus-border-color', 'Follows:' ) ).toBe(
			'<span class="ck-token-ref__label">Follows:</span> ' +
			'<a href="#--ck-color-interactive-focus-border"><code>--ck-color-interactive-focus-border</code></a>'
		);
	} );

	it( 'lists the tokens that follow a token through a deprecated alias, and gives the alias no "Follows"', () => {
		expect( getListItem( '--ck-color-interactive-focus-border', 'Followed by:' ) )
			.toContain( '<a href="#--ck-interactive-focus-border-color">' );
		expect( getListItem( '--ck-color-focus-border', 'Use instead:' ) ).toContain( '<a href="#--ck-color-interactive-focus-border">' );
		expect( getListItem( '--ck-color-focus-border', 'Follows:' ) ).toBe( '' );
	} );

	// The naming guide puts `@pair` on the background only and promises that tools show the pair on both tokens.
	it( 'shows every pair on its background and on its content token', () => {
		const backgrounds = LAYERS.flatMap( layer => layer.topics ).flatMap( topic => topic.files )
			.flatMap( file => extractThemeTokens( path.join( THEME_PATH, file ) ).tokens )
			.filter( token => token.pairs.length );

		expect( backgrounds.length ).toBeGreaterThan( 0 );

		for ( const { name, pairs } of backgrounds ) {
			for ( const foreground of pairs.filter( pair => tokenIds.includes( pair ) ) ) {
				expect( getTokenHtml( name ) ).toMatch( new RegExp( `Contrast pairs:[\\s\\S]*<a href="#${ foreground }">` ) );
				expect( getTokenHtml( foreground ) ).toMatch( new RegExp( `Used on:[\\s\\S]*<a href="#${ name }">` ) );
			}
		}
	} );

	// A color that the builder cannot read would hide the contrast of its pair, so it must be supported before it lands.
	it( 'computes the contrast of every pair', () => {
		expect( html ).toContain( 'ck-token-ref__pair' );
		expect( html ).not.toContain( 'contrast not computed' );
	} );

	it( 'renders every token name as text outside of a button', () => {
		for ( const id of tokenIds ) {
			expect( html ).toContain( `<code class="ck-token-ref__name b-inline-code">${ id }</code>` );
		}

		expect( html ).not.toMatch( /<button\b(?:(?!<\/button>)[\s\S])*<code/ );
	} );

	it( 'puts every token id on a div', () => {
		const elementsWithTokenId = tags.filter( tag => tag.attributes.id?.startsWith( '--ck-' ) );

		expect( elementsWithTokenId.map( tag => tag.name ) ).toEqual( tokenIds.map( () => 'div' ) );
	} );

	it( 'links only to the tokens on the page', () => {
		const targets = tags
			.map( tag => tag.attributes.href )
			.filter( href => href?.startsWith( '#--ck-' ) )
			.map( href => href.slice( 1 ) );

		expect( targets.length ).toBeGreaterThan( 0 );

		for ( const target of targets ) {
			expect( tokenIds ).toContain( target );
		}
	} );

	it( 'renders no table', () => {
		expect( tags.some( tag => tag.name === 'table' ) ).toBe( false );
	} );

	it( 'uses the elements that the converter removes only on the parts that must not be in the Markdown', () => {
		const removedContent = tags
			.filter( tag => REMOVED_SELECTORS.some( selector => matchesSelector( tag, selector ) ) )
			.filter( tag => !tag.classes.some( className => PARTS_OUT_OF_MARKDOWN.includes( className ) ) )
			.map( tag => tag.source );

		expect( removedContent ).toEqual( [] );
	} );

	it( 'adds a separator only before a description', () => {
		const rows = html.match( /<p class="ck-token-ref__row">[\s\S]*?<\/p>/g );

		expect( rows ).toHaveLength( tokenIds.length );
		expect( rows.some( row => !row.includes( 'ck-token-ref__description' ) ) ).toBe( true );

		for ( const row of rows ) {
			expect( row.includes( '<span class="ck-token-ref__sep">: </span>' ) ).toBe( row.includes( 'ck-token-ref__description' ) );
		}
	} );

	it( 'marks every deprecated token and links to the token to use instead, which is on the page too', () => {
		const deprecatedTokens = LAYERS.flatMap( layer => layer.topics ).flatMap( topic => topic.files )
			.flatMap( file => extractThemeTokens( path.join( THEME_PATH, file ) ).tokens )
			.filter( token => token.deprecated );

		expect( deprecatedTokens.length ).toBeGreaterThan( 0 );

		for ( const { name, deprecated } of deprecatedTokens ) {
			const token = getTokenHtml( name );

			expect( token ).toContain(
				'<span class="ck-token-ref__sep"> (</span><span class="ck-token-ref__deprecated">Deprecated</span>'
			);
			expect( token ).toContain( `<span class="ck-token-ref__label">Use instead:</span> <a href="#${ deprecated }">` );
		}
	} );

	it( 'renders the filter as a hidden form', () => {
		const filter = tags.find( tag => tag.classes.includes( 'ck-token-ref__filter' ) );

		expect( filter.name ).toBe( 'form' );
		expect( filter.attributes ).toHaveProperty( 'hidden' );
	} );
} );

describe( 'createThemeTokenReference()', () => {
	let html;

	beforeAll( () => {
		html = getContent( createThemeTokenReference( { themePath: FIXTURES_PATH, layers: FIXTURE_LAYERS } ) );
	} );

	function getToken( name ) {
		return findTokenHtml( html, name );
	}

	function getItem( name, label ) {
		return findListItem( html, name, label );
	}

	it( 'throws for a token listed twice on the page', () => {
		const layers = [ { topics: [ { files: [ 'colors/_semantic-surface.css', 'colors/_semantic-surface.css' ] } ] } ];

		expect( () => createThemeTokenReference( { themePath: FIXTURES_PATH, layers } ) ).toThrow(
			'--ck-color-surface-canvas is listed more than once on the page, so two rows would have the same id.'
		);
	} );

	function link( name ) {
		return `<a href="#${ name }"><code>${ name }</code></a>`;
	}

	function label( text ) {
		return `<span class="ck-token-ref__label">${ text }</span>`;
	}

	it( 'renders the layers and the topics in the given order, each topic with its sources and file descriptions', () => {
		const headings = Array.from( html.matchAll( /<h([23]) id="([^"]+)"/g ), ( [ , level, id ] ) => `h${ level } ${ id }` );

		expect( headings ).toEqual( [
			'h2 foundation', 'h3 foundation-colors',
			'h2 semantic', 'h3 semantic-surfaces', 'h3 semantic-shape', 'h3 semantic-typography'
		] );
		expect( html ).toContain(
			'<p class="ck-token-ref__source" data-topic-part="semantic-surfaces">Source: <code>colors/_semantic-surface.css</code></p>'
		);
		expect( html ).toContain(
			`<p data-topic-part="semantic-surfaces">The surfaces of the fixture theme. They use ${ link( '--ck-color-white' ) } ` +
			'from the foundation.</p>'
		);
	} );

	it( 'shows the first sentence of a description in the row and the rest in the details', () => {
		const token = getToken( '--ck-color-surface-canvas' );

		expect( token ).toContain( '<span class="ck-token-ref__description">The background of the page behind the editor.</span>' );
		expect( token ).toContain( '<p class="ck-token-ref__more">The other surfaces are composited over it.</p>' );
		expect( token ).toContain( 'Details · Full description · 1 contrast pair' );
	} );

	it( 'shows the resolved value in the row and the declared value in the details', () => {
		expect( getToken( '--ck-spacing-control' ) ).toContain( '<code title="4px">4px</code>' );
		expect( getItem( '--ck-spacing-control', 'Default:' ) )
			.toBe( `${ label( 'Default:' ) } <code>calc(var(--ck-spacing-base) / 2)</code>` );
		expect( getItem( '--ck-spacing-control', 'Resolves to:' ) ).toBe( `${ label( 'Resolves to:' ) } <code>4px</code>` );
		expect( getItem( '--ck-border-radius-control', 'Resolves to:' ) ).toBe( '' );
	} );

	it( 'lists the parts of the details in a fixed order', () => {
		const order = [ 'Use instead:', 'Default:', 'Resolves to:', 'Follows:', 'Followed by:', 'Contrast pairs:', 'Used on:' ];
		const names = Array.from( html.matchAll( /<div class="ck-token-ref__token" id="([^"]+)"/g ), match => match[ 1 ] );

		expect( names.length ).toBeGreaterThan( 0 );

		for ( const name of names ) {
			const labels = Array.from(
				getToken( name ).matchAll( /<span class="ck-token-ref__label">([^<]+)<\/span>/g ),
				match => match[ 1 ]
			);

			expect( labels ).toEqual( order.filter( text => labels.includes( text ) ) );
		}
	} );

	it( 'renders a pair with a sample of the content on the background, a link to the content token, and the ratio', () => {
		expect( getItem( '--ck-color-surface-canvas', 'Contrast pairs:' ) ).toBe(
			`${ label( 'Contrast pairs:' ) }<ul class="ck-token-ref__sublist"><li><span class="ck-token-ref__pair">` +
				'<span class="ck-token-ref__pair-sample" role="presentation" aria-hidden="true" ' +
					'style="background: hsl(0, 0%, 100%); color: hsl(0, 0%, 0%)">Aa</span>' +
				`${ link( '--ck-color-text-default' ) } 21.00:1` +
			'</span></li></ul>'
		);
	} );

	it( 'shows a ratio below a minimum without a verdict, and counts only the ratios that were not computed', () => {
		expect( getToken( '--ck-color-surface-overlay' ) ).toContain( `${ link( '--ck-color-text-subtle' ) } 1.39:1</span>` );
		expect( getToken( '--ck-color-surface-overlay' ) ).toContain(
			'<summary><span class="ck-token-ref__summary" role="presentation">Details · 2 contrast pairs</span></summary>'
		);

		expect( getToken( '--ck-color-surface-fallback' ) ).toContain( ' 3.76:1</span>' );
		expect( getToken( '--ck-color-surface-fallback' ) ).toContain(
			'<summary><span class="ck-token-ref__summary" role="presentation">Details · 1 contrast pair</span></summary>'
		);
		expect( html ).not.toMatch( /below \d|meets 3:1|ratio_low|ratio_limited/ );

		expect( getToken( '--ck-color-surface-unsupported' ) )
			.toContain( '<span class="ck-token-ref__ratio_none">contrast not computed</span>' );
		expect( getToken( '--ck-color-surface-unsupported' ) ).toContain(
			'Details · 1 contrast pair · <span class="ck-token-ref__ratio_none">1 not computed</span>'
		);
	} );

	it( 'lists on a content token the backgrounds that it is used on, and counts them as its pairs', () => {
		const backgrounds = Array.from(
			getItem( '--ck-color-text-default', 'Used on:' ).matchAll( /<a href="#([^"]+)">/g ),
			match => match[ 1 ]
		);

		expect( backgrounds ).toEqual( [
			'--ck-color-surface-canvas',
			'--ck-color-surface-overlay',
			'--ck-color-surface-fallback',
			'--ck-color-surface-mixed',
			'--ck-color-surface-unsupported'
		] );
		expect( getToken( '--ck-color-text-default' ) ).toContain( 'Details · 5 contrast pairs' );
	} );

	it( 'renders the preview of each type', () => {
		function preview( modifier, style, content = '' ) {
			const className = [ 'ck-token-ref__preview', modifier ].filter( Boolean ).join( ' ' );
			const styleAttribute = style ? ` style="${ style }"` : '';

			return `<span class="${ className }" role="presentation" aria-hidden="true"${ styleAttribute }>${ content }</span>`;
		}

		const previews = {
			'--ck-color-white': preview( '', 'background: hsl(0, 0%, 100%)' ),
			'--ck-shadow-raised': preview( 'ck-token-ref__preview_shadow',
				'box-shadow: 0 1px 2px hsla(0, 0%, 0%, 0.2), 0 2px 8px hsla(0, 0%, 0%, 0.1)' ),
			'--ck-border-control': preview( 'ck-token-ref__preview_plain', 'border: 1px solid hsl(0, 0%, 60%)' ),
			'--ck-motion-duration-short': preview( 'ck-token-ref__preview_plain', '', '120ms' ),
			'--ck-layer-panel': preview( 'ck-token-ref__preview_plain', '', '11' ),
			'--ck-border-radius-control': preview( 'ck-token-ref__preview_radius', 'border-radius: 4px' ),
			'--ck-border-width-control': preview( 'ck-token-ref__preview_plain', '',
				'<span class="ck-token-ref__line" style="height: 1px"></span>' ),
			'--ck-spacing-control': preview( 'ck-token-ref__preview_plain', '',
				'<span class="ck-token-ref__bar" style="width: 4px"></span>' ),
			'--ck-font-size-control': preview( 'ck-token-ref__preview_plain', '', '<span style="font-size: 14px">Aa</span>' ),
			'--ck-font-weight-strong': preview( 'ck-token-ref__preview_plain', '', '<span style="font-weight: 600">Aa</span>' ),
			'--ck-color-focus-coordinates': preview( '', 'background: hsl(220, 80%, 50%)' ),
			'--ck-motion-easing-default': preview( 'ck-token-ref__preview_none', '', '—' ),
			'--ck-font-size-toolbar': preview( 'ck-token-ref__preview_none', '', '—' )
		};

		for ( const [ name, expected ] of Object.entries( previews ) ) {
			expect( getToken( name ) ).toContain( `<span class="ck-token-ref__value" role="presentation">${ expected }<code title=` );
		}
	} );

	it( 'marks a deprecated token and names the token to use instead, which also replaces the alias in "Follows"', () => {
		expect( getToken( '--ck-color-surface-page' ) ).toContain(
			'<span class="ck-token-ref__sep"> (</span><span class="ck-token-ref__deprecated">Deprecated</span>' +
			'<span class="ck-token-ref__sep">)</span>'
		);
		expect( getItem( '--ck-color-surface-page', 'Use instead:' ) )
			.toBe( `${ label( 'Use instead:' ) } ${ link( '--ck-color-surface-canvas' ) }` );
		expect( getItem( '--ck-color-surface-page', 'Follows:' ) ).toBe( '' );
		expect( getItem( '--ck-color-surface-print', 'Follows:' ) )
			.toBe( `${ label( 'Follows:' ) } ${ link( '--ck-color-surface-canvas' ) }` );
	} );

	it( 'lists the tokens that a token follows on one line and the tokens that follow it one below another', () => {
		expect( getItem( '--ck-border-control', 'Follows:' ) ).toBe(
			`${ label( 'Follows:' ) } ${ link( '--ck-border-width-control' ) }, ${ link( '--ck-color-gray-500' ) }`
		);
		expect( getItem( '--ck-color-surface-fallback', 'Follows:' ) )
			.toBe( `${ label( 'Follows:' ) } ${ link( '--ck-color-blue-500' ) }` );
		expect( getItem( '--ck-color-white', 'Followed by:' ) ).toBe(
			`${ label( 'Followed by:' ) }<ul class="ck-token-ref__sublist">` +
				`<li>${ link( '--ck-color-surface-canvas' ) }</li>` +
				`<li>${ link( '--ck-color-surface-page' ) }</li>` +
				`<li>${ link( '--ck-color-surface-print' ) }</li>` +
			'</ul>'
		);
	} );

	it( 'gives the filter the visible text of a row and the text of its details', () => {
		const attributes = parseOpeningTags( getToken( '--ck-color-surface-page' ) )[ 0 ].attributes;

		expect( attributes[ 'data-visible' ] ).toBe(
			'--ck-color-surface-page deprecated an alias of `--ck-color-surface-canvas`. hsl(0, 0%, 100%)'
		);
		expect( attributes[ 'data-details' ] ).toBe(
			'--ck-color-surface-canvas var(--ck-color-surface-canvas) --ck-color-surface-print'
		);
	} );

	it( 'links only the names of the tokens on the page', () => {
		expect( getToken( '--ck-color-surface-fallback' ) ).toContain( 'because <code>--ck-color-undeclared</code> is not declared' );
		expect( getItem( '--ck-color-surface-canvas', 'Follows:' ) ).toBe( `${ label( 'Follows:' ) } ${ link( '--ck-color-white' ) }` );
	} );
} );

describe( 'collectDeclarations()', () => {
	let themePath;

	beforeEach( () => {
		themePath = mkdtempSync( path.join( tmpdir(), 'theme-tokens-' ) );
	} );

	afterEach( () => {
		rmSync( themePath, { recursive: true, force: true } );
	} );

	it( 'returns the root declarations of every file in the theme, also in subdirectories', () => {
		const declarations = collectDeclarations( FIXTURES_PATH );

		expect( declarations.get( '--ck-color-white' ) ).toBe( 'hsl(0, 0%, 100%)' );
		expect( declarations.get( '--ck-color-surface-canvas' ) ).toBe( 'var(--ck-color-white)' );
		expect( declarations.get( '--ck-motion-duration-short' ) ).toBe( '120ms' );
		expect( declarations.has( '--ck-color-surface-scoped' ) ).toBe( false );
	} );

	it( 'accepts a token declared in two files with the same value', () => {
		writeTheme( { 'a.css': ':root { --ck-x: 1px; }', 'b.css': ':root { --ck-x: 1px; }' } );

		expect( collectDeclarations( themePath ).get( '--ck-x' ) ).toBe( '1px' );
	} );

	it( 'throws for a token declared in two files with different values', () => {
		writeTheme( { 'a.css': ':root { --ck-x: 1px; }', 'nested/b.css': ':root { --ck-x: 2px; }' } );

		expect( () => collectDeclarations( themePath ) ).toThrow(
			'--ck-x is declared on :root with different values, so its default value is ambiguous.'
		);
	} );

	function writeTheme( files ) {
		for ( const [ file, source ] of Object.entries( files ) ) {
			mkdirSync( path.dirname( path.join( themePath, file ) ), { recursive: true } );
			writeFileSync( path.join( themePath, file ), source );
		}
	}
} );

describe( 'resolve()', () => {
	const declarations = new Map( [
		[ '--ck-a', 'var(--ck-b)' ],
		[ '--ck-b', '4px' ],
		[ '--ck-reset', 'initial' ],
		[ '--ck-loop-a', 'var(--ck-loop-b)' ],
		[ '--ck-loop-b', 'var(--ck-loop-a)' ]
	] );

	it( 'returns a value without `var()` unchanged', () => {
		expect( resolve( '1px solid red', declarations ) ).toBe( '1px solid red' );
	} );

	it( 'resolves a chain of `var()`', () => {
		expect( resolve( 'var(--ck-a)', declarations ) ).toBe( '4px' );
	} );

	it( 'resolves every `var()` in a value and keeps the text around them', () => {
		expect( resolve( 'calc(var(--ck-a) * 2) var(--ck-b)', declarations ) ).toBe( 'calc(4px * 2) 4px' );
	} );

	it( 'uses the fallback of an undeclared name, also a nested one with commas', () => {
		expect( resolve( 'var(--ck-none, var(--ck-none-either, rgb(0, 0, 0)))', declarations ) ).toBe( 'rgb(0, 0, 0)' );
	} );

	it( 'uses the fallback of a name declared as `initial`', () => {
		expect( resolve( 'var(--ck-reset, 2px)', declarations ) ).toBe( '2px' );
	} );

	it( 'returns an empty value for an undeclared name without a fallback', () => {
		expect( resolve( 'var(--ck-none)', declarations ) ).toBe( '' );
	} );

	it( 'stops at a cycle and leaves it unresolved', () => {
		expect( resolve( 'var(--ck-loop-a)', declarations ) ).toMatch( /^var\(--ck-loop-[ab]\)$/ );
	} );
} );

describe( 'simplifyCalc()', () => {
	it( 'replaces a `calc()` of one unit with its result', () => {
		expect( simplifyCalc( 'calc(8px / 2)' ) ).toBe( '4px' );
		expect( simplifyCalc( 'calc(1 + 10)' ) ).toBe( '11' );
	} );

	it( 'simplifies nested `calc()` from the innermost one', () => {
		expect( simplifyCalc( 'calc(calc(8px * 2) / 4)' ) ).toBe( '4px' );
	} );

	it( 'simplifies a `calc()` inside a longer value', () => {
		expect( simplifyCalc( '0 calc(2px * 2) red' ) ).toBe( '0 4px red' );
	} );

	it( 'rounds the result to three decimal places', () => {
		expect( simplifyCalc( 'calc(10px / 3)' ) ).toBe( '3.333px' );
	} );

	it( 'simplifies a `calc()` with a negative factor', () => {
		expect( simplifyCalc( 'calc(16px * -0.2 / 13)' ) ).toBe( '-0.246px' );
	} );

	it( 'keeps a `calc()` of mixed units or of other values', () => {
		expect( simplifyCalc( 'calc(100% - 8px)' ) ).toBe( 'calc(100% - 8px)' );
		expect( simplifyCalc( 'calc(var(--ck-x) * 2)' ) ).toBe( 'calc(var(--ck-x) * 2)' );
	} );
} );

describe( 'evaluateCalc()', () => {
	it( 'evaluates a plain number or a `calc()` of plain numbers', () => {
		expect( evaluateCalc( '7' ) ).toBe( 7 );
		expect( evaluateCalc( 'calc(calc(2 * 3) - 1)' ) ).toBe( 5 );
	} );

	it( 'returns null for a value with units or names', () => {
		expect( evaluateCalc( '8px' ) ).toBeNull();
		expect( evaluateCalc( 'calc(var(--ck-x) + 1)' ) ).toBeNull();
	} );

	it( 'applies the precedence of the operators and the parentheses', () => {
		expect( evaluateCalc( 'calc(1 + 2 * 3)' ) ).toBe( 7 );
		expect( evaluateCalc( 'calc(10 - 4 - 3)' ) ).toBe( 3 );
		expect( evaluateCalc( 'calc(12 / 3 / 2)' ) ).toBe( 2 );
		expect( evaluateCalc( 'calc((1 + 2) * 3)' ) ).toBe( 9 );
	} );

	it( 'evaluates the signs of numbers and decimals without a leading zero', () => {
		// The theme scales a size by a negative factor, such as `calc(var(--ck-font-size-normal) * -0.2 / 13)`.
		expect( evaluateCalc( 'calc(13 * -0.2 / 13)' ) ).toBeCloseTo( -0.2 );
		expect( evaluateCalc( 'calc(-1 * (2 + 3))' ) ).toBe( -5 );
		expect( evaluateCalc( 'calc(1 - -2)' ) ).toBe( 3 );
		expect( evaluateCalc( 'calc(+.5 * 4)' ) ).toBe( 2 );
	} );

	it( 'returns null for an invalid expression', () => {
		expect( evaluateCalc( 'calc(1 +)' ) ).toBeNull();
		expect( evaluateCalc( 'calc(1 2)' ) ).toBeNull();
		expect( evaluateCalc( 'calc((1 + 2)' ) ).toBeNull();
		expect( evaluateCalc( 'calc(1 + 2))' ) ).toBeNull();
		expect( evaluateCalc( '' ) ).toBeNull();
	} );

	it( 'returns null for a result that is not a finite number', () => {
		expect( evaluateCalc( 'calc(1 / 0)' ) ).toBeNull();
	} );
} );

describe( 'contrastRatio()', () => {
	const WHITE = 'hsl(0, 0%, 100%)';
	const BLACK = 'hsl(0, 0%, 0%)';

	it( 'returns the WCAG contrast ratio of two colors in either order', () => {
		expect( contrastRatio( BLACK, WHITE, WHITE ) ).toBeCloseTo( 21 );
		expect( contrastRatio( WHITE, BLACK, WHITE ) ).toBeCloseTo( 21 );
		expect( contrastRatio( WHITE, WHITE, WHITE ) ).toBeCloseTo( 1 );
	} );

	it( 'reads the space-separated syntax and an alpha in percent', () => {
		expect( contrastRatio( 'hsl(0 0% 0%)', 'hsl(0 0% 100% / 100%)', WHITE ) ).toBeCloseTo( 21 );
	} );

	it( 'composites a translucent background over the canvas', () => {
		const gray = contrastRatio( BLACK, 'hsl(0, 0%, 50%)', WHITE );

		expect( contrastRatio( BLACK, 'hsla(0, 0%, 0%, 0.5)', WHITE ) ).toBeCloseTo( gray );
		expect( contrastRatio( BLACK, 'hsl(0 0% 0% / 50%)', WHITE ) ).toBeCloseTo( gray );
	} );

	it( 'composites a translucent foreground over the background', () => {
		expect( contrastRatio( 'hsla(0, 0%, 0%, 0.5)', WHITE, WHITE ) ).toBeCloseTo( contrastRatio( 'hsl(0, 0%, 50%)', WHITE, WHITE ) );
	} );

	it( 'reads a color mixed with `transparent` in sRGB as the color with its alpha scaled', () => {
		expect( contrastRatio( WHITE, 'color-mix(in srgb, hsl(0, 0%, 0%) 10%, transparent)', WHITE ) )
			.toBeCloseTo( contrastRatio( WHITE, 'hsla(0, 0%, 0%, 0.1)', WHITE ) );
		expect( contrastRatio( WHITE, 'color-mix(in srgb, hsla(0, 0%, 0%, 0.5) 50%, transparent)', WHITE ) )
			.toBeCloseTo( contrastRatio( WHITE, 'hsla(0, 0%, 0%, 0.25)', WHITE ) );
	} );

	it( 'returns null when a color is in another format', () => {
		expect( contrastRatio( BLACK, '#ffffff', WHITE ) ).toBeNull();
		expect( contrastRatio( 'black', WHITE, WHITE ) ).toBeNull();
		expect( contrastRatio( BLACK, 'color-mix(in oklch, hsl(0, 0%, 0%) 10%, transparent)', WHITE ) ).toBeNull();
		expect( contrastRatio( BLACK, `color-mix(in srgb, ${ WHITE } 10%, ${ BLACK })`, WHITE ) ).toBeNull();
	} );

	it( 'returns null for a translucent background when the canvas is in another format', () => {
		expect( contrastRatio( BLACK, 'hsla(0, 0%, 100%, 0.5)', '#ffffff' ) ).toBeNull();
		expect( contrastRatio( BLACK, 'color-mix(in srgb, hsl(0, 0%, 100%) 50%, transparent)', '#ffffff' ) ).toBeNull();
		expect( contrastRatio( BLACK, WHITE, '#ffffff' ) ).toBeCloseTo( 21 );
	} );

	it( 'returns null when a color that matches the pattern is not a number', () => {
		expect( contrastRatio( BLACK, 'hsl(1.2.3 0% 50%)', WHITE ) ).toBeNull();
	} );
} );

describe( 'getPairs()', () => {
	it( 'simplifies a `calc()` in the content color, as in the background color', () => {
		const declarations = new Map( [ [ '--ck-color-text-x', 'hsl(0 0% calc(0% + 0%))' ] ] );
		const token = { name: '--ck-color-surface-x', value: 'hsl(0 0% calc(50% + 50%))', pairs: [ '--ck-color-text-x' ] };

		expect( getPairs( token, declarations, 'hsl(0 0% 100%)' ) ).toEqual( [ {
			background: '--ck-color-surface-x',
			backgroundColor: 'hsl(0 0% 100%)',
			foreground: '--ck-color-text-x',
			foregroundColor: 'hsl(0 0% 0%)',
			ratio: expect.closeTo( 21 )
		} ] );
	} );
} );

describe( 'formatRatio()', () => {
	it( 'formats a ratio with two decimal places', () => {
		expect( formatRatio( 21 ) ).toBe( '21.00:1' );
		expect( formatRatio( 4.5 ) ).toBe( '4.50:1' );
		expect( formatRatio( 3.761 ) ).toBe( '3.76:1' );
	} );

	it( 'rounds down, so a ratio just below a minimum never reads as the minimum', () => {
		expect( formatRatio( 2.996 ) ).toBe( '2.99:1' );
		expect( formatRatio( 4.497 ) ).toBe( '4.49:1' );
	} );

	it( 'does not round down a ratio that floating-point multiplication puts just below its hundredth', () => {
		expect( formatRatio( 1.15 ) ).toBe( '1.15:1' );
	} );
} );

describe( 'getPreviewType()', () => {
	describe( 'without rules', () => {
		it( 'recognizes a color by its value, whatever the name', () => {
			expect( getPreviewType( '--ck-any', 'hsl(0 0% 0% / .5)' ) ).toBe( 'color' );
			expect( getPreviewType( '--ck-any', 'color-mix(in srgb, hsl(0 0% 0%) 10%, transparent)' ) ).toBe( 'color' );
			expect( getPreviewType( '--ck-any', 'transparent' ) ).toBe( 'color' );
		} );

		it( 'does not take the channels of a color for a color', () => {
			expect( getPreviewType( '--ck-color-focus-coordinates', '227.7, 62.7%, 55.9%' ) ).toBe( 'none' );
		} );

		it( 'does not take a list of colors for one color', () => {
			expect( getPreviewType( '--ck-any', 'hsl(0 0% 0%), hsl(0 0% 100%)' ) ).toBe( 'none' );
		} );

		it( 'recognizes a shadow of one or more layers by its value', () => {
			expect( getPreviewType( '--ck-any', '0 0 0 3px hsl(0 0% 0% / .2)' ) ).toBe( 'shadow' );
			expect( getPreviewType( '--ck-any', 'inset 0 1px hsl(0 0% 0%), 0 16px 32px -4px hsl(0, 0%, 0%)' ) ).toBe( 'shadow' );
		} );

		it( 'recognizes a border by its value', () => {
			expect( getPreviewType( '--ck-focus-ring', '1px solid hsl(0 0% 0%)' ) ).toBe( 'border' );
		} );

		it( 'recognizes a duration by its value', () => {
			expect( getPreviewType( '--ck-any', '.2s' ) ).toBe( 'duration' );
			expect( getPreviewType( '--ck-any', '120ms' ) ).toBe( 'duration' );
		} );

		it( 'recognizes a plain number, such as a layer', () => {
			expect( getPreviewType( '--ck-layer-panel', '1000' ) ).toBe( 'number' );
			expect( getPreviewType( '--ck-layer-below', '-1' ) ).toBe( 'number' );
		} );

		it( 'gives no preview to a length, which needs a rule, or to other values', () => {
			expect( getPreviewType( '--ck-spacing-gap', '8px' ) ).toBe( 'none' );
			expect( getPreviewType( '--ck-transition-control', 'box-shadow .2s ease-in-out, border .2s ease-in-out' ) ).toBe( 'none' );
			expect( getPreviewType( '--ck-any', 'ease-in-out' ) ).toBe( 'none' );
		} );
	} );

	describe( 'with rules', () => {
		const rules = [
			{ prefix: '--ck-border-radius-', type: 'radius' },
			{ prefix: '--ck-border-', type: 'border' },
			{ type: 'bar' }
		];

		it( 'uses the first rule whose prefix the name starts with', () => {
			expect( getPreviewType( '--ck-border-radius-surface', '8px', rules ) ).toBe( 'radius' );
			expect( getPreviewType( '--ck-border-control', '1px solid hsl(0 0% 0%)', rules ) ).toBe( 'border' );
		} );

		it( 'uses a rule without a prefix for every other token', () => {
			expect( getPreviewType( '--ck-spacing-gap', '8px', rules ) ).toBe( 'bar' );
		} );

		it( 'wins over the type that the value would give', () => {
			expect( getPreviewType( '--ck-border-radius-none', '0', rules ) ).toBe( 'radius' );
			expect( getPreviewType( '--ck-font-weight-strong', '600', [ { type: 'font-weight' } ] ) ).toBe( 'font-weight' );
		} );

		it( 'gives no preview when the value does not fit the type of the rule', () => {
			expect( getPreviewType( '--ck-border-divider', '0', rules ) ).toBe( 'none' );
			expect( getPreviewType( '--ck-font-size-toolbar', 'inherit', [ { type: 'font-size' } ] ) ).toBe( 'none' );
			expect( getPreviewType( '--ck-width-dialog', 'min(400px, 90vw)', [ { type: 'bar' } ] ) ).toBe( 'none' );
			expect( getPreviewType( '--ck-font-weight-inherit', 'inherit', [ { type: 'font-weight' } ] ) ).toBe( 'none' );
		} );

		it( 'shows the channels of a color, in either syntax, only when a rule asks for it', () => {
			const channelRules = [ { prefix: '--ck-color-base-diff-', type: 'hsl-channels' } ];

			expect( getPreviewType( '--ck-color-base-diff-insertion', '157 80% 34%', channelRules ) ).toBe( 'hsl-channels' );
			expect( getPreviewType( '--ck-color-base-diff-comment', '227.7, 62.7%, 55.9%', channelRules ) ).toBe( 'hsl-channels' );
			expect( getPreviewType( '--ck-color-base-diff-comment', '227.7, 62.7%,55.9%', channelRules ) ).toBe( 'hsl-channels' );
			expect( getPreviewType( '--ck-color-base-diff-insertion', '157, 80% 34%', channelRules ) ).toBe( 'none' );
			expect( getPreviewType( '--ck-color-base-diff-insertion', 'hsl(157 80% 34%)', channelRules ) ).toBe( 'none' );
			expect( getPreviewType( '--ck-color-base-diff-insertion', '157 80% 34%' ) ).toBe( 'none' );
		} );

		it( 'accepts a radius of up to four lengths', () => {
			expect( getPreviewType( '--ck-border-radius-cut', '8px 0 8px 8px', rules ) ).toBe( 'radius' );
		} );

		it( 'turns the preview off with the `none` type', () => {
			expect( getPreviewType( '--ck-any', 'hsl(0 0% 0%)', [ { type: 'none' } ] ) ).toBe( 'none' );
		} );

		it( 'throws for an unknown type', () => {
			expect( () => getPreviewType( '--ck-any', '8px', [ { type: 'size' } ] ) ).toThrow(
				'The preview rule of --ck-any has an unknown type: size.'
			);
		} );
	} );
} );

describe( 'getReferencedTokens()', () => {
	const declarations = new Map( [
		[ '--ck-a', '1px' ],
		[ '--ck-b', 'red' ],
		[ '--ck-reset', 'initial' ]
	] );

	it( 'returns the declared names that a value reads, without repeats', () => {
		expect( getReferencedTokens( 'var(--ck-a) solid var(--ck-b)', declarations ) ).toEqual( [ '--ck-a', '--ck-b' ] );
		expect( getReferencedTokens( 'calc(var(--ck-a) * 2 + var(--ck-a))', declarations ) ).toEqual( [ '--ck-a' ] );
	} );

	it( 'reads the fallback of a name that is not declared, as a legacy bridge does by default', () => {
		expect( getReferencedTokens( 'var(--ck-legacy, var(--ck-a))', declarations ) ).toEqual( [ '--ck-a' ] );
		expect( getReferencedTokens( 'var(--ck-reset, var(--ck-b))', declarations ) ).toEqual( [ '--ck-b' ] );
	} );

	it( 'does not read the fallback of a declared name, which never takes effect', () => {
		expect( getReferencedTokens( 'var(--ck-a, var(--ck-b))', declarations ) ).toEqual( [ '--ck-a' ] );
	} );

	it( 'returns nothing for a value without declared names', () => {
		expect( getReferencedTokens( 'hsl(0 0% 0%)', declarations ) ).toEqual( [] );
		expect( getReferencedTokens( 'var(--ck-legacy)', declarations ) ).toEqual( [] );
	} );
} );

describe( 'collectAliases()', () => {
	let themePath;

	beforeEach( () => {
		themePath = mkdtempSync( path.join( tmpdir(), 'theme-tokens-' ) );
	} );

	afterEach( () => {
		rmSync( themePath, { recursive: true, force: true } );
	} );

	it( 'returns the deprecated tokens and the legacy foundation names that read one token', () => {
		writeFileSync( path.join( themePath, '_legacy-foundation-aliases.css' ), ':root { --ck-z-panel: var(--ck-z-overlay); }' );
		writeFileSync( path.join( themePath, '_semantic.css' ), [
			':root {',
			'\t--ck-new: 1px;',
			'\t/**\n\t * An alias of `--ck-new`.\n\t * @deprecated --ck-new\n\t */',
			'\t--ck-old: var(--ck-new);',
			'\t/**\n\t * A deprecated composite.\n\t * @deprecated --ck-new\n\t */',
			'\t--ck-old-composite: var(--ck-new) solid;',
			'}'
		].join( '\n' ) );
		writeFileSync( path.join( themePath, '_legacy-misc.css' ), ':root { --ck-color-upload-bar-background: var(--ck-new); }' );

		expect( Object.fromEntries( collectAliases( themePath ) ) ).toEqual( {
			'--ck-z-panel': '--ck-z-overlay',
			'--ck-old': '--ck-new'
		} );
	} );
} );

describe( 'getFollowedTokens()', () => {
	const declarations = new Map( [
		[ '--ck-z-overlay', '1000' ],
		[ '--ck-z-panel', 'var(--ck-z-overlay)' ],
		[ '--ck-z-legacy', 'var(--ck-z-panel)' ],
		[ '--ck-loop-a', 'var(--ck-loop-b)' ],
		[ '--ck-loop-b', 'var(--ck-loop-a)' ]
	] );
	const aliases = new Map( [
		[ '--ck-z-panel', '--ck-z-overlay' ],
		[ '--ck-z-legacy', '--ck-z-panel' ],
		[ '--ck-loop-a', '--ck-loop-b' ],
		[ '--ck-loop-b', '--ck-loop-a' ]
	] );

	it( 'returns the token that a chain of aliases leads to', () => {
		expect( getFollowedTokens( { value: 'var(--ck-z-legacy, var(--ck-z-base))' }, declarations, aliases ) )
			.toEqual( [ '--ck-z-overlay' ] );
	} );

	it( 'returns the tokens that are not aliases as they are, without repeats', () => {
		expect( getFollowedTokens( { value: 'calc(var(--ck-z-overlay) + var(--ck-z-panel))' }, declarations, aliases ) )
			.toEqual( [ '--ck-z-overlay' ] );
	} );

	it( 'stops at a cycle of aliases', () => {
		expect( getFollowedTokens( { value: 'var(--ck-loop-a)' }, declarations, aliases ) ).toEqual( [ '--ck-loop-a' ] );
	} );
} );

describe( 'getAllFollowers()', () => {
	const followerIndex = createFollowerIndex( new Map( [
		[ '--ck-base', 'hsl(0 0% 0%)' ],
		[ '--ck-role', 'var(--ck-base)' ],
		[ '--ck-alias', 'var(--ck-role)' ],
		[ '--ck-bridge', 'var(--ck-alias, var(--ck-other))' ],
		[ '--ck-other', '1px' ],
		[ '--ck-loop-a', 'var(--ck-loop-b)' ],
		[ '--ck-loop-b', 'var(--ck-loop-a)' ]
	] ) );

	it( 'returns the direct followers and the followers of the followers', () => {
		expect( getAllFollowers( '--ck-base', followerIndex ) ).toEqual( [ '--ck-role', '--ck-alias', '--ck-bridge' ] );
	} );

	it( 'does not count a token as a follower of a fallback that it never reads', () => {
		expect( getAllFollowers( '--ck-other', followerIndex ) ).toEqual( [] );
	} );

	it( 'returns nothing for a token without followers', () => {
		expect( getAllFollowers( '--ck-bridge', followerIndex ) ).toEqual( [] );
	} );

	it( 'stops at a cycle and does not count a token as its own follower', () => {
		expect( getAllFollowers( '--ck-loop-a', followerIndex ) ).toEqual( [ '--ck-loop-b' ] );
	} );
} );

describe( 'splitDescription()', () => {
	it( 'splits a description after its first sentence', () => {
		expect( splitDescription( 'The first sentence. The rest. And more.' ) ).toEqual( [ 'The first sentence.', 'The rest. And more.' ] );
	} );

	it( 'returns a description of one sentence as a whole', () => {
		expect( splitDescription( 'The only sentence.' ) ).toEqual( [ 'The only sentence.', '' ] );
		expect( splitDescription( '' ) ).toEqual( [ '', '' ] );
	} );

	it( 'does not split at a period inside inline code or inside a number', () => {
		expect( splitDescription( 'Use `a. b` for 1.5 times. The rest.' ) ).toEqual( [ 'Use `a. b` for 1.5 times.', 'The rest.' ] );
	} );
} );

/**
 * Returns the HTML of the row and the details of a token.
 */
function findTokenHtml( html, name ) {
	return html.match( new RegExp( `<div class="ck-token-ref__token" id="${ name }"[\\s\\S]*?</details></div>` ) )[ 0 ];
}

/**
 * Returns the labeled item in the details of a token, from its label to its end, or an empty string when it has none.
 * A group ends with its nested list.
 */
function findListItem( html, name, label ) {
	const tokenHtml = findTokenHtml( html, name );
	const start = tokenHtml.indexOf( `<span class="ck-token-ref__label">${ label }</span>` );

	if ( start === -1 ) {
		return '';
	}

	const item = tokenHtml.slice( start, tokenHtml.indexOf( '</li>', start ) );

	return item.includes( '<ul' ) ? tokenHtml.slice( start, tokenHtml.indexOf( '</ul>', start ) + 5 ) : item;
}

/**
 * Returns the content of the page, without the styles and the page script.
 */
function getContent( html ) {
	return html
		.replace( /<style>[\s\S]*?<\/style>/g, '' )
		.replace( /<script>[\s\S]*?<\/script>/g, '' );
}

/**
 * Returns the opening tags of the HTML. The renderer escapes the attribute values, so a value never holds `>`.
 */
function parseOpeningTags( html ) {
	return Array.from( html.matchAll( /<([a-z][a-z0-9]*)\b([^>]*)>/g ), ( [ source, name, attributeText ] ) => {
		const attributes = Object.fromEntries( Array.from(
			attributeText.matchAll( /([a-zA-Z-]+)(?:="([^"]*)")?/g ),
			( [ , attribute, value = '' ] ) => [ attribute, value ]
		) );

		return { source, name, attributes, classes: ( attributes.class || '' ).split( /\s+/ ).filter( Boolean ) };
	} );
}

/**
 * Checks a tag against a selector of one of the forms in `REMOVED_SELECTORS`: `name`, `.class`, `[attribute]`,
 * or `[attribute="value"]`.
 */
function matchesSelector( tag, selector ) {
	if ( selector.startsWith( '.' ) ) {
		return tag.classes.includes( selector.slice( 1 ) );
	}

	const attributeMatch = /^\[([a-z-]+)(?:="([^"]*)")?\]$/.exec( selector );

	if ( attributeMatch ) {
		const [ , attribute, value ] = attributeMatch;

		return attribute in tag.attributes && ( value === undefined || tag.attributes[ attribute ] === value );
	}

	return tag.name === selector;
}
