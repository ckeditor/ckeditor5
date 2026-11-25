/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * Renders the tokens of the theme files in `LAYERS` as a list of token rows for the `{@exec …}` expression of the theme
 * token reference guide.
 *
 * The documentation website also publishes the page as Markdown for AI agents. Its converter reads the built HTML,
 * before the page script runs, and removes some elements together with their content, such as `button`, `form`,
 * `nav`, `header`, and the elements with `aria-label`, `aria-labelledby`, or `role="presentation"`. The renderer uses
 * them only on the parts that must not be in the Markdown: the filter, the copy button, the anchor link, the summary
 * text, the previews, and the value in a row. That value is the resolved one, and without the layout of the page it would
 * read as the declared one, so the Markdown gets both values with labels from the details. A label for content uses
 * a visible heading instead. The converter keeps an `id` only on a heading or a `div`, so every token `id` is on a `div`.
 * The test of this file keeps the selectors of the converter that matter here in `REMOVED_SELECTORS`.
 */

const path = require( 'node:path' );
const { globSync, readFileSync } = require( 'node:fs' );
const { transformSync } = require( 'esbuild' );
const { extractThemeTokens } = require( './extract-theme-tokens.mjs' );

const THEME_PATH = path.join( __dirname, '..', '..', '..', 'packages', 'ckeditor5-ui', 'theme', 'globals' );

// The `preview` of a topic sets the preview type of its tokens, as described in `getPreviewType()`.
const LAYERS = [
	{
		title: 'Foundation',
		id: 'foundation',
		topics: [
			{
				title: 'Colors',
				id: 'foundation-colors',
				files: [ 'colors/_foundation.css' ],
				// The diff and comment seeds hold the channels only, because the theme reads them as `hsl(var(…) / 20%)`.
				preview: [
					{ prefix: '--ck-color-base-diff-', type: 'hsl-channels' },
					{ prefix: '--ck-color-base-comment', type: 'hsl-channels' }
				]
			},
			{
				title: 'Spacing',
				id: 'foundation-spacing',
				files: [ '_spacing.css' ],
				preview: 'bar'
			},
			{
				title: 'Shape',
				id: 'foundation-shape',
				files: [ '_rounded.css', '_border.css', '_shadow.css' ],
				// `getPreviewType()` takes the first rule that matches, so a specific rule comes before a general one.
				preview: [
					// The radius is `0` on `:root` and set by `.ck-rounded-corners`, so a square preview would mislead.
					{ prefix: '--ck-radius-corners', type: 'none' },
					{ prefix: '--ck-radius-', type: 'radius' },
					{ prefix: '--ck-border-width-', type: 'line' }
				]
			},
			{
				title: 'Typography',
				id: 'foundation-typography',
				files: [ '_fonts.css' ],
				preview: [
					// A unitless line height would pass the font size check of the last rule.
					{ prefix: '--ck-line-height-', type: 'number' },
					{ prefix: '--ck-font-weight-', type: 'font-weight' },
					{ prefix: '--ck-font-family', type: 'font-family' },
					{ type: 'font-size' }
				]
			},
			{
				title: 'Sizes',
				id: 'foundation-sizes',
				files: [ '_width.css' ],
				// The bar of the preview is too short for the widths of panels.
				preview: [ { prefix: '--ck-width-', type: 'none' } ]
			},
			{
				title: 'Layers',
				id: 'foundation-layers',
				files: [ '_zindex.css' ]
			},
			{
				title: 'Motion',
				id: 'foundation-motion',
				files: [ '_transition.css' ]
			},
			{
				title: 'Focus and states',
				id: 'foundation-focus-and-states',
				files: [ '_focus.css', '_disabled.css' ],
				preview: [ { prefix: '--ck-focus-shadow-spread', type: 'bar' } ]
			}
		]
	},
	{
		title: 'Semantic',
		id: 'semantic',
		topics: [
			{
				title: 'Surfaces and borders',
				id: 'semantic-surfaces-and-borders',
				files: [ 'colors/_semantic-surface.css', '_semantic-surface.css' ]
			},
			{
				title: 'Text',
				id: 'semantic-text',
				files: [ 'colors/_semantic-text.css' ]
			},
			{
				title: 'Interactive states',
				id: 'semantic-interactive',
				files: [ 'colors/_semantic-interactive.css', '_semantic-interactive.css' ],
				preview: [
					{ prefix: '--ck-color-interactive-focus-border-coordinates', type: 'hsl-channels' },
					{ prefix: '--ck-color-focus-border-coordinates', type: 'hsl-channels' }
				]
			},
			{
				title: 'Feedback',
				id: 'semantic-feedback',
				files: [ 'colors/_semantic-feedback.css' ]
			},
			{
				title: 'Changes',
				id: 'semantic-changes',
				files: [ 'colors/_semantic-diff.css' ]
			},
			{
				title: 'Typography',
				id: 'semantic-typography',
				files: [ '_semantic-typography.css' ],
				preview: [
					{ prefix: '--ck-font-weight-', type: 'font-weight' },
					{ type: 'font-size' }
				]
			},
			{
				title: 'Shape',
				id: 'semantic-shape',
				files: [ '_semantic-shape.css' ],
				preview: [
					{ prefix: '--ck-border-radius-', type: 'radius' },
					{ prefix: '--ck-border-width-', type: 'line' },
					{ prefix: '--ck-border-', type: 'border' }
				]
			},
			{
				title: 'Spacing',
				id: 'semantic-spacing',
				files: [ '_semantic-spacing.css' ],
				preview: 'bar'
			},
			{
				title: 'Sizes',
				id: 'semantic-sizes',
				files: [ '_semantic-width.css', '_semantic-layout.css' ],
				// The widths are capped with `min()`, so only the sizes get a bar.
				preview: [ { prefix: '--ck-size-', type: 'bar' } ]
			},
			{
				title: 'Layers',
				id: 'semantic-layers',
				files: [ '_semantic-layer.css' ]
			},
			{
				title: 'Motion',
				id: 'semantic-motion',
				files: [ '_semantic-motion.css' ]
			}
		]
	}
];

// The values that the previews recognize.
const LENGTH = /^-?[\d.]+(px|r?em|%|v[wh])?$/;
const DURATION = /^[\d.]+m?s$/;
const COLOR_KEYWORD = /^(#[\da-f]{3,8}|transparent|currentcolor)$/i;
const COLOR_FUNCTION = /^(hsla?|rgba?|hwb|lab|lch|oklab|oklch|color|color-mix)\(/i;
const BORDER = /^([\d.]+[a-z]*)\s+(solid|dashed|dotted|double)\s+(.+)$/;
// The `inset` keyword can come first or last, as in `0 2px 10px hsl(0 0% 0% / .05) inset`.
const SHADOW = /^(inset\s+)?(-?[\d.]+[a-z]*\s+){2,4}(.+?)(\s+inset)?$/;
// The hue, saturation, and lightness of a color without `hsl()`, such as `157 80% 34%`, for a token read as `hsl(var(…) / 20%)`.
// Both separators are commas or both are spaces, because `hsl()` does not accept a mix.
const HSL_CHANNELS = /^[\d.]+(deg)?(\s*,\s*[\d.]+%\s*,\s*|\s+[\d.]+%\s+)[\d.]+%$/;

// The values that each type of a preview can show. A topic rule can also turn the preview off with `none`.
const PREVIEW_VALUE_CHECKS = {
	color: value => isColor( value ),
	shadow: value => isShadow( value ),
	border: value => isBorder( value ),
	duration: value => DURATION.test( value ),
	'hsl-channels': value => HSL_CHANNELS.test( value ),
	number: value => evaluateCalc( value ) !== null,
	radius: value => value.split( /\s+/ ).every( part => LENGTH.test( part ) ),
	line: value => LENGTH.test( value ),
	bar: value => LENGTH.test( value ),
	'font-size': value => LENGTH.test( value ),
	'font-weight': value => /^\d+$/.test( value ),
	// The value goes into a `style` attribute, so a value that is not resolved or that would end the declaration gets
	// no preview.
	'font-family': value => value !== '' && !/var\(|;/.test( value ),
	none: () => true
};

let renderedTokens = new Set();

// The filter is hidden until the page script shows it, so the page works without the script. It is a `form`, so the
// Markdown converter removes it with its text.
const FILTER =
	'<form class="ck-token-ref__filter" role="search" aria-label="Filter tokens" hidden>' +
		'<label for="ck-token-ref-filter">Filter tokens</label>' +
		'<input class="ck-token-ref__filter-input" id="ck-token-ref-filter" type="search" autocomplete="off" spellcheck="false" ' +
			'placeholder="Name, description, or value, for example: surface overlay">' +
		'<span class="ck-token-ref__count"></span>' +
		'<span class="ck-token-ref__status" role="status"></span>' +
		'<p class="ck-token-ref__empty" hidden>No tokens match the filter.</p>' +
	'</form>';

const COPY_ICON =
	'<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">' +
		'<rect x="5" y="5" width="9" height="9" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
		'<path d="M11 3.5V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h.5" fill="none" stroke="currentColor" ' +
			'stroke-width="1.5"/>' +
	'</svg>';

module.exports = function buildThemeTokenReference() {
	return createThemeTokenReference( { themePath: THEME_PATH, layers: LAYERS } );
};

// The helpers are exported for the tests.
Object.assign( module.exports, {
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
} );

/**
 * Renders the tokens of the given layers, read from the theme files in the given directory. The tests use it with
 * fixture files, so that changes in the theme do not change their output.
 */
function createThemeTokenReference( { themePath, layers } ) {
	const declarations = collectDeclarations( themePath );
	const canvas = resolve( 'var(--ck-color-surface-canvas)', declarations );
	const pageTokens = layers.flatMap( layer => layer.topics ).flatMap( topic => topic.files )
		.flatMap( file => extractThemeTokens( path.join( themePath, file ) ).tokens );
	const pageTokenNames = new Set();

	// A row has the name of its token as its `id`, so a token in two files of the page, even with the same value, would
	// give two rows with the same `id`. A topic can join two files, so a token moved between them can stay in both.
	for ( const token of pageTokens ) {
		if ( pageTokenNames.has( token.name ) ) {
			throw new Error( `${ token.name } is listed more than once on the page, so two rows would have the same id.` );
		}

		pageTokenNames.add( token.name );
	}

	const context = {
		themePath,
		declarations,
		canvas,
		pairsByForeground: groupPairsByForeground( pageTokens, declarations, canvas ),
		followerIndex: createFollowerIndex( declarations ),
		aliases: collectAliases( themePath )
	};

	// Only the tokens rendered on the page get links. Other names, such as legacy names, stay plain code.
	renderedTokens = new Set( pageTokens.map( token => token.name ) );

	// The output is inserted into Markdown, so it must not contain line breaks followed by indentation.
	return `<style>${ getPageAsset( 'theme-token-reference.css', 'css' ) }</style>` +
		( '<div class="ck-token-ref">' + FILTER + layers.map( layer => (
			`<h2 id="${ layer.id }" data-layer-part="${ layer.id }">${ escape( layer.title ) }</h2>` +
			layer.topics.map( topic => renderTopic( topic, layer, context ) ).join( '' )
		) ).join( '' ) + '</div>' ).replace( /\n\s*/g, ' ' ) +
		`<script>${ getPageAsset( 'theme-token-reference-page.js', 'js' ) }</script>`;
}

/**
 * Returns a file of the page, the styles or the browser script, minified to one line, so Markdown does not turn
 * its lines into paragraphs.
 */
function getPageAsset( fileName, loader ) {
	const source = readFileSync( path.join( __dirname, fileName ), 'utf-8' );

	return transformSync( source, { loader, minify: true, legalComments: 'none' } ).code.trim();
}

/**
 * Renders a topic as one block per file: the source, the description of the file, and its rows. A scale describes its
 * steps only in the description of its file, so the description must stand right above the rows of that file.
 */
function renderTopic( topic, layer, context ) {
	const topicPart = `data-topic-part="${ topic.id }"`;

	return `<h3 id="${ topic.id }" ${ topicPart }>${ escape( topic.title ) }</h3>` + topic.files.map( file => {
		const { description, tokens } = extractThemeTokens( path.join( context.themePath, file ) );
		// The id of a block holds a slash and a dot, so it is used only as the value of an attribute, never as an `id`.
		const fileId = `${ topic.id }/${ file }`;
		// Only the file hides the block. With the topic as well, a topic with matching rows in one file would show the
		// blocks of its other files again.
		const part = `data-file-part="${ escape( fileId ) }"`;

		return (
			`<p class="ck-token-ref__source" ${ part }>Source: <code>${ escape( file ) }</code></p>` +
			( description ? `<p ${ part }>${ formatText( description ) }</p>` : '' ) +
			`<ul class="ck-token-ref__list" ${ part }>` +
				tokens.map( token => (
					`<li class="ck-token-ref__item">${ renderToken( { ...token, file }, { topic, layer, fileId }, context ) }</li>`
				) ).join( '' ) +
			'</ul>'
		);
	} ).join( '' );
}

/**
 * Returns the contrast pairs that a background token names with `@pair`, with their colors and contrast ratios.
 */
function getPairs( token, declarations, canvas ) {
	const backgroundColor = simplifyCalc( resolve( token.value, declarations ) );

	return token.pairs.map( foreground => {
		const foregroundColor = simplifyCalc( resolve( `var(${ foreground })`, declarations ) );

		return {
			background: token.name,
			backgroundColor,
			foreground,
			foregroundColor,
			ratio: contrastRatio( foregroundColor, backgroundColor, canvas )
		};
	} );
}

/**
 * Returns the pairs of the given tokens grouped by their content token. The naming guide puts `@pair` on the background
 * only and promises that tools show the pair on both tokens, so the content token lists the backgrounds that it is
 * used on.
 */
function groupPairsByForeground( tokens, declarations, canvas ) {
	const pairsByForeground = new Map();

	for ( const pair of tokens.flatMap( token => getPairs( token, declarations, canvas ) ) ) {
		pairsByForeground.set( pair.foreground, [ ...( pairsByForeground.get( pair.foreground ) || [] ), pair ] );
	}

	return pairsByForeground;
}

/**
 * Renders a labeled list of token names on one line, or nothing when there are none. The names on the page are links.
 */
function renderTokenList( label, names ) {
	if ( !names.length ) {
		return '';
	}

	return `<li><span class="ck-token-ref__label">${ label }</span> ${ names.map( name => formatTokenName( name ) ).join( ', ' ) }</li>`;
}

/**
 * Renders a labeled group of the details with one item below another, such as the contrast pairs, or nothing when it
 * has no items.
 */
function renderGroup( label, items ) {
	if ( !items.length ) {
		return '';
	}

	return (
		`<li class="ck-token-ref__meta-group"><span class="ck-token-ref__label">${ label }</span>` +
			`<ul class="ck-token-ref__sublist">${ items.map( item => `<li>${ item }</li>` ).join( '' ) }</ul>` +
		'</li>'
	);
}

/**
 * Renders a pair as seen from one of its tokens: a sample of the content on the background, a link to the other
 * token, and the contrast ratio.
 */
function renderPair( pair, otherToken ) {
	return (
		'<span class="ck-token-ref__pair">' +
			'<span class="ck-token-ref__pair-sample" role="presentation" aria-hidden="true" ' +
				`style="background: ${ escape( pair.backgroundColor ) }; color: ${ escape( pair.foregroundColor ) }">Aa</span>` +
			`${ formatTokenName( otherToken ) } ${ renderRatio( pair.ratio ) }` +
		'</span>'
	);
}

function renderToken( token, { topic, layer, fileId }, { declarations, canvas, pairsByForeground, followerIndex, aliases } ) {
	const resolved = simplifyCalc( resolve( token.value, declarations ) );
	const followers = new Set( getAllFollowers( token.name, followerIndex ) );
	const dependencies = {
		// The parent of an alias is the token to use instead, which the details already name.
		follows: token.deprecated ? [] : getFollowedTokens( token, declarations, aliases ),
		// Only the tokens on the page are listed, in the order of the page.
		followedBy: [ ...renderedTokens ].filter( name => followers.has( name ) )
	};
	const ownPairs = getPairs( token, declarations, canvas );
	const usedOnPairs = pairsByForeground.get( token.name ) || [];
	const notComputedCount = [ ...ownPairs, ...usedOnPairs ].filter( ( { ratio } ) => ratio === null ).length;
	const pairs = {
		own: ownPairs.map( pair => renderPair( pair, pair.foreground ) ),
		usedOn: usedOnPairs.map( pair => renderPair( pair, pair.background ) )
	};

	// The filter matches the visible text of the row and the text of its details, without their labels. A match only in
	// the details opens them.
	const [ summary, more ] = splitDescription( token.description || '' );
	const visibleText = [ token.name, token.deprecated && 'deprecated', summary, resolved ]
		.filter( Boolean ).join( ' ' ).toLowerCase();
	const detailsText = [
		more, token.deprecated, token.value, ...token.pairs, ...usedOnPairs.map( pair => pair.background ),
		...dependencies.follows, ...dependencies.followedBy
	].filter( Boolean ).join( ' ' ).toLowerCase();

	return (
		`<div class="ck-token-ref__token" id="${ escape( token.name ) }" data-name="${ escape( token.name ) }" ` +
			`data-topic="${ topic.id }" data-layer="${ layer.id }" data-file="${ escape( fileId ) }" ` +
			`data-visible="${ escape( visibleText ) }" data-details="${ escape( detailsText ) }">` +
			'<p class="ck-token-ref__row">' +
				'<span class="ck-token-ref__head">' +
					`<code class="ck-token-ref__name b-inline-code">${ escape( token.name ) }</code>` +
					`<button type="button" class="ck-token-ref__copy" data-name="${ escape( token.name ) }" ` +
						`aria-label="Copy ${ escape( token.name ) }" title="Copy ${ escape( token.name ) }">` +
						`${ COPY_ICON }<span class="ck-token-ref__copied" aria-hidden="true">Copied</span>` +
					'</button>' +
					`<a class="ck-token-ref__anchor" href="#${ escape( token.name ) }" ` +
						`aria-label="Link to ${ escape( token.name ) }">#</a>` +
					// The parentheses are hidden like the separator, so the Markdown reads "`--ck-name` (Deprecated): …".
					( token.deprecated ?
						'<span class="ck-token-ref__sep"> (</span>' +
						'<span class="ck-token-ref__deprecated">Deprecated</span>' +
						'<span class="ck-token-ref__sep">)</span>' :
						'' ) +
				'</span>' +
				// A token without a description, such as a step of a scale, gets no separator, so no colon is left.
				( summary ?
					'<span class="ck-token-ref__sep">: </span>' +
					`<span class="ck-token-ref__description">${ formatText( summary ) }</span>` :
					'' ) +
				'<span class="ck-token-ref__value" role="presentation">' +
					renderPreview( token.name, resolved, getPreviewRules( topic ) ) +
					`<code title="${ escape( resolved ) }">${ escape( resolved || '—' ) }</code>` +
				'</span>' +
			'</p>' +
			renderDetails( token, more, resolved, { pairs, notComputedCount, dependencies } ) +
		'</div>'
	);
}

/**
 * Renders a contrast ratio without a verdict. A `@pair` does not tell what its content is, such as text, an icon, or
 * a decoration, so the page cannot tell which minimum applies, and the guide gives the minimums instead.
 */
function renderRatio( ratio ) {
	return ratio === null ? '<span class="ck-token-ref__ratio_none">contrast not computed</span>' : formatRatio( ratio );
}

/**
 * Formats a contrast ratio with two decimal places, rounded down. WCAG does not round the ratios, so a ratio of 4.497
 * fails 4.5:1, and the page must not show it as 4.50:1. The small epsilon keeps a floating-point error, such as
 * `1.15 * 100 = 114.99999999999999`, from rounding a ratio down by one more hundredth.
 */
function formatRatio( ratio ) {
	return `${ ( Math.floor( ratio * 100 + 1e-9 ) / 100 ).toFixed( 2 ) }:1`;
}

/**
 * Splits a description into its first sentence, which the row shows, and the rest, which the details show. The first
 * sentence ends at the first period followed by a space outside of inline code. Doc comments use no abbreviations, such
 * as "e.g.", which would end it too early; nothing checks it yet.
 */
function splitDescription( text ) {
	let isInCode = false;

	for ( let i = 0; i < text.length; i++ ) {
		if ( text[ i ] === '`' ) {
			isInCode = !isInCode;
		} else if ( !isInCode && text[ i ] === '.' && /\s/.test( text[ i + 1 ] || '' ) ) {
			return [ text.slice( 0, i + 1 ), text.slice( i + 2 ).trim() ];
		}
	}

	return [ text, '' ];
}

/**
 * Renders the collapsed details of a token: the rest of the description, the values, and the contrast pairs. The summary
 * tells that the description continues, and keeps the number of contrast pairs and of the ratios that were not computed
 * visible.
 */
function renderDetails( token, more, resolved, { pairs, notComputedCount, dependencies } ) {
	const summary = [ 'Details' ];

	if ( more ) {
		summary.push( 'Full description' );
	}

	const pairCount = pairs.own.length + pairs.usedOn.length;

	if ( pairCount ) {
		summary.push( `${ pairCount } contrast ${ pairCount === 1 ? 'pair' : 'pairs' }` );
	}

	if ( notComputedCount ) {
		summary.push( `<span class="ck-token-ref__ratio_none">${ notComputedCount } not computed</span>` );
	}

	return (
		'<details class="ck-token-ref__details">' +
			`<summary><span class="ck-token-ref__summary" role="presentation">${ summary.join( ' · ' ) }</span></summary>` +
			( more ? `<p class="ck-token-ref__more">${ formatText( more ) }</p>` : '' ) +
			'<ul class="ck-token-ref__meta">' +
				( token.deprecated ?
					`<li><span class="ck-token-ref__label">Use instead:</span> ${ formatTokenName( token.deprecated ) }</li>` :
					'' ) +
				`<li><span class="ck-token-ref__label">Default:</span> <code>${ escape( token.value ) }</code></li>` +
				( resolved !== token.value ?
					`<li><span class="ck-token-ref__label">Resolves to:</span> <code>${ escape( resolved || '—' ) }</code></li>` :
					'' ) +
				renderTokenList( 'Follows:', dependencies.follows ) +
				// A foundation color can have many followers, so they are a group, like the pairs.
				renderGroup( 'Followed by:', dependencies.followedBy.map( name => formatTokenName( name ) ) ) +
				renderGroup( 'Contrast pairs:', pairs.own ) +
				renderGroup( 'Used on:', pairs.usedOn ) +
			'</ul>' +
		'</details>'
	);
}

/**
 * Returns the type of the preview of a token.
 *
 * The rules of the topic come first, because only they can tell what a length is for: `8px` can be a radius, a gap,
 * or a font size. A rule matches the tokens that start with its prefix, a rule without a prefix matches every token of
 * the topic, and the first rule that matches wins. A type that needs a length is used only for a value that is one,
 * so `inherit` or `min(400px, 90vw)` gets no preview.
 *
 * Without a matching rule, the type comes from the value: a color, a shadow, a border, a duration, or a plain number.
 */
function getPreviewType( name, resolved, rules = [] ) {
	const rule = rules.find( ( { prefix = '' } ) => name.startsWith( prefix ) );

	if ( rule ) {
		if ( !Object.hasOwn( PREVIEW_VALUE_CHECKS, rule.type ) ) {
			throw new Error( `The preview rule of ${ name } has an unknown type: ${ rule.type }.` );
		}

		return PREVIEW_VALUE_CHECKS[ rule.type ]( resolved ) ? rule.type : 'none';
	}

	if ( isColor( resolved ) ) {
		return 'color';
	}

	if ( isShadow( resolved ) ) {
		return 'shadow';
	}

	if ( isBorder( resolved ) ) {
		return 'border';
	}

	if ( DURATION.test( resolved ) ) {
		return 'duration';
	}

	return evaluateCalc( resolved ) === null ? 'none' : 'number';
}

/**
 * Checks whether the value is one color. A color function must end the value, so a list such as `hsl(…), hsl(…)` is not
 * taken for one color.
 */
function isColor( value ) {
	const functionMatch = COLOR_FUNCTION.exec( value );

	if ( functionMatch ) {
		return findClosingParenthesis( value, functionMatch[ 0 ].length - 1 ) === value.length - 1;
	}

	return COLOR_KEYWORD.test( value );
}

function isShadow( value ) {
	return splitTopLevel( value ).every( part => {
		const match = SHADOW.exec( part );

		return !!match && isColor( match[ 3 ] );
	} );
}

function isBorder( value ) {
	const match = BORDER.exec( value );

	return !!match && isColor( match[ 3 ] );
}

/**
 * Splits a value at the commas outside of parentheses, such as the layers of a shadow.
 */
function splitTopLevel( value ) {
	const parts = [];
	let rest = value;

	for ( let comma = findTopLevelComma( rest ); comma !== -1; comma = findTopLevelComma( rest ) ) {
		parts.push( rest.slice( 0, comma ).trim() );
		rest = rest.slice( comma + 1 );
	}

	return [ ...parts, rest.trim() ];
}

/**
 * Returns the preview rules of a topic. A topic with one kind of tokens can set its `preview` to a type instead of rules.
 */
function getPreviewRules( topic ) {
	if ( !topic.preview ) {
		return [];
	}

	return typeof topic.preview === 'string' ? [ { type: topic.preview } ] : topic.preview;
}

function renderPreview( name, resolved, rules ) {
	const value = escape( resolved );

	switch ( getPreviewType( name, resolved, rules ) ) {
		case 'color':
			return renderPreviewBox( '', `background: ${ value }` );
		case 'shadow':
			return renderPreviewBox( 'ck-token-ref__preview_shadow', `box-shadow: ${ value }` );
		case 'hsl-channels':
			return renderPreviewBox( '', `background: hsl(${ value })` );
		case 'border':
			return renderPreviewBox( 'ck-token-ref__preview_plain', `border: ${ value }` );
		case 'duration':
			return renderPreviewBox( 'ck-token-ref__preview_plain', '', value );
		case 'number':
			return renderPreviewBox( 'ck-token-ref__preview_plain', '', String( evaluateCalc( resolved ) ) );
		case 'radius':
			return renderPreviewBox( 'ck-token-ref__preview_radius', `border-radius: ${ value }` );
		case 'line':
			return renderPreviewBox( 'ck-token-ref__preview_plain', '',
				`<span class="ck-token-ref__line" style="height: ${ value }"></span>` );
		case 'bar':
			return renderPreviewBox( 'ck-token-ref__preview_plain', '',
				`<span class="ck-token-ref__bar" style="width: ${ value }"></span>` );
		case 'font-size':
			return renderPreviewBox( 'ck-token-ref__preview_plain', '', `<span style="font-size: ${ value }">Aa</span>` );
		case 'font-weight':
			return renderPreviewBox( 'ck-token-ref__preview_plain', '', `<span style="font-weight: ${ value }">Aa</span>` );
		case 'font-family':
			return renderPreviewBox( 'ck-token-ref__preview_plain', '', `<span style="font-family: ${ value }">Aa</span>` );
		default:
			return renderPreviewBox( 'ck-token-ref__preview_none', '', '—' );
	}
}

/**
 * Renders the box of a preview. It is a decoration that repeats the value next to it, so it is hidden from screen
 * readers and from the Markdown.
 */
function renderPreviewBox( modifier, style, content = '' ) {
	const className = [ 'ck-token-ref__preview', modifier ].filter( Boolean ).join( ' ' );
	const styleAttribute = style ? ` style="${ style }"` : '';

	return `<span class="${ className }" role="presentation" aria-hidden="true"${ styleAttribute }>${ content }</span>`;
}

/**
 * Replaces each innermost `calc()` of numbers with one unit, such as `calc(8px / 2)` or `calc(1 + 1)`, with its result.
 */
function simplifyCalc( value ) {
	let previous;

	do {
		previous = value;
		value = value.replace( /calc\(([^()]*)\)/g, ( match, expression ) => {
			const units = new Set( [ ...expression.matchAll( /[\d.]+([a-z%]*)/g ) ].map( unit => unit[ 1 ] ).filter( Boolean ) );

			if ( units.size > 1 || !/^[\d\s+\-*/.a-z%]+$/.test( expression ) ) {
				return match;
			}

			const [ unit = '' ] = units;
			const number = evaluateCalc( expression.replace( /([\d.]+)[a-z%]+/g, '$1' ) );

			return number === null ? match : `${ Math.round( number * 1000 ) / 1000 }${ unit }`;
		} );
	} while ( value !== previous );

	return value;
}

/**
 * Evaluates a `calc()` of plain numbers, such as the resolved value of a layer, or returns `null`.
 *
 * It reads `+`, `-`, `*`, `/`, parentheses, and the signs of numbers, such as `16 * -0.2`, which is all the theme uses.
 * Anything else, an incomplete expression, or a result that is not a finite number, such as after a division by zero,
 * gives `null`.
 */
function evaluateCalc( value ) {
	const tokens = value.replace( /calc\(/g, '(' ).match( /\d*\.?\d+|\S/g ) || [];
	let position = 0;

	const result = readSum();

	return position === tokens.length && Number.isFinite( result ) ? result : null;

	// A sum is one or more products joined with `+` or `-`.
	function readSum() {
		let sum = readProduct();

		while ( tokens[ position ] === '+' || tokens[ position ] === '-' ) {
			const operator = tokens[ position++ ];
			const operand = readProduct();

			sum = operator === '+' ? sum + operand : sum - operand;
		}

		return sum;
	}

	// A product is one or more factors joined with `*` or `/`.
	function readProduct() {
		let product = readFactor();

		while ( tokens[ position ] === '*' || tokens[ position ] === '/' ) {
			const operator = tokens[ position++ ];
			const operand = readFactor();

			product = operator === '*' ? product * operand : product / operand;
		}

		return product;
	}

	// A factor is a number, a sum in parentheses, or a factor with a sign. An invalid factor gives `NaN`, which
	// makes the whole result `NaN`.
	function readFactor() {
		const token = tokens[ position++ ];

		if ( token === '-' ) {
			return -readFactor();
		}

		if ( token === '+' ) {
			return readFactor();
		}

		if ( token === '(' ) {
			const sum = readSum();

			return tokens[ position++ ] === ')' ? sum : NaN;
		}

		return /^\d*\.?\d+$/.test( token ) ? Number( token ) : NaN;
	}
}

/**
 * Collects the `:root` declarations of every theme file, so that `var()` chains can be resolved.
 */
function collectDeclarations( themePath ) {
	const declarations = new Map();

	for ( const file of globSync( '**/*.css', { cwd: themePath } ) ) {
		for ( const token of extractThemeTokens( path.join( themePath, file ) ).tokens ) {
			if ( declarations.has( token.name ) && declarations.get( token.name ) !== token.value ) {
				throw new Error( `${ token.name } is declared on :root with different values, so its default value is ambiguous.` );
			}

			declarations.set( token.name, token.value );
		}
	}

	return declarations;
}

/**
 * Replaces every `var(--name, fallback)` in the value with the declared value of `--name`, or with the fallback when
 * the name is not declared, as the browser does in the default theme.
 */
function resolve( value, declarations, depth = 0 ) {
	if ( depth > 20 ) {
		return value;
	}

	let result = '';
	let index = 0;

	while ( index < value.length ) {
		const start = value.indexOf( 'var(', index );

		if ( start === -1 ) {
			result += value.slice( index );
			break;
		}

		result += value.slice( index, start );

		const end = findClosingParenthesis( value, start + 3 );
		const inner = value.slice( start + 4, end );
		const comma = findTopLevelComma( inner );
		const name = ( comma === -1 ? inner : inner.slice( 0, comma ) ).trim();
		const fallback = comma === -1 ? '' : inner.slice( comma + 1 ).trim();
		const declared = declarations.get( name );

		result += resolve( declared !== undefined && declared !== 'initial' ? declared : fallback, declarations, depth + 1 );
		index = end + 1;
	}

	return result.trim();
}

/**
 * Returns the names of the tokens that a value reads in the default theme, without repeats. It reads `var()` the way
 * `resolve()` does: the name when it is declared, or else the names in the fallback. A legacy bridge such as
 * `var(--ck-old, var(--ck-new))` reads only one of its two names, so overriding the other one would not change the value.
 */
function getReferencedTokens( value, declarations ) {
	const names = [];

	for ( let start = value.indexOf( 'var(' ); start !== -1; start = value.indexOf( 'var(', start + 1 ) ) {
		const end = findClosingParenthesis( value, start + 3 );
		const inner = value.slice( start + 4, end );
		const comma = findTopLevelComma( inner );
		const name = ( comma === -1 ? inner : inner.slice( 0, comma ) ).trim();
		const declared = declarations.get( name );

		if ( declared !== undefined && declared !== 'initial' ) {
			names.push( name );
		} else if ( comma !== -1 ) {
			names.push( ...getReferencedTokens( inner.slice( comma + 1 ), declarations ) );
		}

		start = end;
	}

	return [ ...new Set( names ) ];
}

/**
 * Returns the aliases of the theme, as a map from an alias to the token that it reads. An alias is a token marked with
 * `@deprecated`, or a legacy name in `_legacy-foundation-aliases.css`, whose value is a single `var()`.
 */
function collectAliases( themePath ) {
	const aliases = new Map();

	for ( const file of globSync( '**/*.css', { cwd: themePath } ) ) {
		const isAliasFile = path.basename( file ) === '_legacy-foundation-aliases.css';

		for ( const token of extractThemeTokens( path.join( themePath, file ) ).tokens ) {
			const target = /^var\((--[\w-]+)\)$/.exec( token.value );

			if ( target && ( token.deprecated || isAliasFile ) ) {
				aliases.set( token.name, target[ 1 ] );
			}
		}
	}

	return aliases;
}

/**
 * Returns the tokens that a token follows, as the details show them. An alias in between is skipped, so the details
 * never suggest overriding a name that the theme keeps only for compatibility.
 */
function getFollowedTokens( token, declarations, aliases ) {
	return [ ...new Set( getReferencedTokens( token.value, declarations ).map( name => {
		const seen = new Set();

		while ( aliases.has( name ) && !seen.has( name ) ) {
			seen.add( name );
			name = aliases.get( name );
		}

		return name;
	} ) ) ];
}

/**
 * Returns the tokens that read each token directly, as a map from a token to its followers.
 */
function createFollowerIndex( declarations ) {
	const followers = new Map();

	for ( const [ name, value ] of declarations ) {
		for ( const parent of getReferencedTokens( value, declarations ) ) {
			followers.set( parent, [ ...( followers.get( parent ) || [] ), name ] );
		}
	}

	return followers;
}

/**
 * Returns every token that follows the given token, directly or through other tokens, so that overriding the given
 * token changes all of them in the default theme. A cycle in the theme does not loop.
 */
function getAllFollowers( name, followerIndex ) {
	const found = new Set();
	const queue = [ name ];

	while ( queue.length ) {
		for ( const follower of followerIndex.get( queue.shift() ) || [] ) {
			if ( follower !== name && !found.has( follower ) ) {
				found.add( follower );
				queue.push( follower );
			}
		}
	}

	return [ ...found ];
}

function findClosingParenthesis( text, openIndex ) {
	let depth = 0;

	for ( let i = openIndex; i < text.length; i++ ) {
		if ( text[ i ] === '(' ) {
			depth++;
		} else if ( text[ i ] === ')' && --depth === 0 ) {
			return i;
		}
	}

	return text.length - 1;
}

function findTopLevelComma( text ) {
	let depth = 0;

	for ( let i = 0; i < text.length; i++ ) {
		if ( text[ i ] === '(' ) {
			depth++;
		} else if ( text[ i ] === ')' ) {
			depth--;
		} else if ( text[ i ] === ',' && depth === 0 ) {
			return i;
		}
	}

	return -1;
}

/**
 * Returns the WCAG contrast ratio of two colors, or `null` when a color cannot be parsed without a browser.
 * A translucent background is composited over the canvas, so it gives `null` too when the canvas cannot be parsed.
 */
function contrastRatio( foreground, background, canvas ) {
	const canvasColor = parseColor( canvas );
	const backgroundColor = composite( parseColor( background ), canvasColor );
	const foregroundColor = composite( parseColor( foreground ), backgroundColor );

	if ( !foregroundColor || !backgroundColor ) {
		return null;
	}

	const [ lighter, darker ] = [ luminance( foregroundColor ), luminance( backgroundColor ) ].sort( ( a, b ) => b - a );
	const ratio = ( lighter + 0.05 ) / ( darker + 0.05 );

	// The pattern of a color can still accept a value that is not a number, such as `1.2.3`.
	return Number.isFinite( ratio ) ? ratio : null;
}

/**
 * Parses an `hsl()` color, or the translucent version of a color that the theme writes as
 * `color-mix(in srgb, <color> N%, transparent)`. Mixing with `transparent` keeps the channels of the color and scales its
 * alpha by N%. Other colors return `null`.
 */
function parseColor( value ) {
	const mix = /^color-mix\(\s*in\s+srgb\s*,\s*(.+?)\s+([\d.]+)%\s*,\s*transparent\s*\)$/.exec( value || '' );

	if ( !mix ) {
		return parseHsl( value );
	}

	const color = parseColor( mix[ 1 ] );

	return color && { rgb: color.rgb, alpha: color.alpha * Number( mix[ 2 ] ) / 100 };
}

function parseHsl( value ) {
	const match = /^hsla?\(\s*([\d.]+)[\s,]+([\d.]+)%[\s,]+([\d.]+)%\s*(?:[/,]\s*([\d.]+)(%?))?\s*\)$/.exec( value || '' );

	if ( !match ) {
		return null;
	}

	const [ hue, saturation, lightness ] = [ Number( match[ 1 ] ), Number( match[ 2 ] ) / 100, Number( match[ 3 ] ) / 100 ];
	const alpha = match[ 4 ] === undefined ? 1 : Number( match[ 4 ] ) / ( match[ 5 ] ? 100 : 1 );
	const chroma = ( 1 - Math.abs( 2 * lightness - 1 ) ) * saturation;
	const toChannel = n => {
		const k = ( n + hue / 30 ) % 12;

		return lightness - chroma / 2 * Math.max( -1, Math.min( k - 3, 9 - k, 1 ) );
	};

	return { rgb: [ toChannel( 0 ), toChannel( 8 ), toChannel( 4 ) ], alpha };
}

function composite( color, below ) {
	if ( !color ) {
		return null;
	}

	if ( color.alpha >= 1 ) {
		return color;
	}

	// Without the color below, a translucent color has no known result, and it must not count as opaque.
	if ( !below ) {
		return null;
	}

	return { rgb: color.rgb.map( ( channel, i ) => channel * color.alpha + below.rgb[ i ] * ( 1 - color.alpha ) ), alpha: 1 };
}

function luminance( { rgb } ) {
	const [ r, g, b ] = rgb.map( c => c <= 0.03928 ? c / 12.92 : ( ( c + 0.055 ) / 1.055 ) ** 2.4 );

	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function formatText( text ) {
	return escape( text )
		.replace( /`(--ck-[\w-]+)`/g, ( match, name ) => formatTokenName( name ) )
		.replace( /`([^`]+)`/g, '<code>$1</code>' );
}

function formatTokenName( name ) {
	const code = `<code>${ escape( name ) }</code>`;

	return renderedTokens.has( name ) ? `<a href="#${ escape( name ) }">${ code }</a>` : code;
}

function escape( text ) {
	return String( text ).replace( /&/g, '&amp;' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' ).replace( /"/g, '&quot;' );
}
