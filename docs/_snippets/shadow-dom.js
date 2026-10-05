/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { createElement, defineCustomElement, readCssRules, whenLoaded, whenPageLoaded } from './shared-helpers.js';

/**
 * `<snippet-shadow-root layers="editor snippets">` moves its content into an open shadow root with a copy of the page
 * styles stripped down to the listed cascade layers (all layers without the attribute). Unlayered page styles never reach it.
 * Wait for `host.stylesLoaded` before creating the editor inside.
 *
 * The style sheets are reloaded (from the cache) and stripped, not copied via `cssText`, because there a shorthand with
 * `var()` loses its value once a longhand overrides part of it. The content is moved, not slotted, because slotted
 * content stays in the light DOM, where the page styles reach it.
 */
class SnippetShadowRootElement extends HTMLElement {
	connectedCallback() {
		// Moving the element to another root connects it again.
		if ( this.shadowRoot ) {
			return;
		}

		this.attachShadow( { mode: 'open' } ).append( ...this.childNodes );

		const layerNames = this.getAttribute( 'layers' )?.match( /\S+/g );

		/** @member {Promise<void>} Resolves once the styles of the shadow root are in place. */
		this.stylesLoaded = whenPageLoaded().then( () => addLayeredPageStylesToShadowRoot( this.shadowRoot, layerNames ) );
	}
}

defineCustomElement( 'snippet-shadow-root', SnippetShadowRootElement );

/**
 * Creates a `<snippet-shadow-root>` at the end of `<body>` and returns its shadow root, for `config.ui.overlayContainer`.
 * Wait for `host.stylesLoaded` before creating the editor, and remove the `host` when the editor is destroyed.
 *
 * @param {Object} [options]
 * @param {String} [options.className] Classes for the host, for example to override CSS variables on it.
 * @param {Array.<String>} [options.layers] The layers to keep. Defaults to all of them.
 * @returns {ShadowRoot}
 */
export function createSnippetShadowRootElement( { className = '', layers } = {} ) {
	const host = createElement( 'snippet-shadow-root', { className } );

	if ( layers ) {
		host.setAttribute( 'layers', layers.join( ' ' ) );
	}

	return document.body.appendChild( host ).shadowRoot;
}

/**
 * Adds to the shadow root a copy of every page style sheet, with only the rules of the wanted cascade layers left in it.
 *
 * The copies stay in the shadow root for good – they are its styles, so removing them would remove the styles too.
 *
 * @param {ShadowRoot} shadowRoot
 * @param {Array.<String>|null|undefined} layerNames The layers to keep. All of them when there is no list.
 * @returns {Promise<void>} Resolves once every copy is loaded and stripped.
 */
async function addLayeredPageStylesToShadowRoot( shadowRoot, layerNames ) {
	const isWantedLayer = createWantedLayerFilter( layerNames );

	const hostStyle = createElement( 'style', { textContent: ':host { display: block; }' } );
	const copies = Array.from( document.styleSheets ).filter( isEditableStyleSheet ).map( createStyleSheetCopy );

	shadowRoot.prepend( hostStyle, ...copies );

	await Promise.all( copies.map( async copy => {
		// After an error there is no sheet, and nothing is deleted.
		await whenLoaded( copy );

		// The code after `await` runs as a microtask right after `load`, so the browser never renders the full copy.
		deleteRulesOutsideWantedLayers( copy.sheet, isWantedLayer );
	} ) );
}

/**
 * Returns a function telling whether a cascade layer is one of the listed ones or nested in one of them:
 * `editor` matches `editor` and `editor.ui`, but not `editorial`.
 *
 * @param {Array.<String>|null|undefined} layerNames With no list, every layer matches.
 * @returns {Function} `( layerName: String ) => Boolean`
 */
function createWantedLayerFilter( layerNames ) {
	return layerName => !layerNames || layerNames.some( listedName => `${ layerName }.`.startsWith( `${ listedName }.` ) );
}

/**
 * Tells whether a page style sheet can be copied and stripped later: it comes from a `<link>` or `<style>` element
 * and its rules can be read. The rules of a cross-origin style sheet cannot, so it would be copied in full.
 *
 * @param {CSSStyleSheet} styleSheet
 * @returns {Boolean}
 */
function isEditableStyleSheet( styleSheet ) {
	return styleSheet.ownerNode instanceof HTMLElement && readCssRules( styleSheet ).length > 0;
}

/**
 * Creates a not-yet-inserted element that loads the same styles as the page style sheet: a `<link>` with the same URL
 * (so the relative URLs inside resolve as on the page, and the file comes from the cache), or a `<style>` with
 * the same text.
 *
 * @param {CSSStyleSheet} styleSheet
 * @returns {HTMLLinkElement|HTMLStyleElement}
 */
function createStyleSheetCopy( styleSheet ) {
	const copy = styleSheet.href ?
		createElement( 'link', { rel: 'stylesheet', href: styleSheet.href } ) :
		createElement( 'style', { textContent: styleSheet.ownerNode.textContent } );

	copy.media = styleSheet.media.mediaText;

	return copy;
}

/**
 * Deletes from the style sheet, in place, every rule outside the wanted cascade layers – the unlayered rules
 * and the other layers. Goes into the style sheets imported without a layer, as they may hold layers too.
 *
 * @param {CSSStyleSheet|null} styleSheet
 * @param {Function} isWantedLayer See `createWantedLayerFilter()`.
 */
function deleteRulesOutsideWantedLayers( styleSheet, isWantedLayer ) {
	const rules = readCssRules( styleSheet );

	// Backwards, so deleting a rule does not shift the ones still to visit.
	for ( let index = rules.length - 1; index >= 0; index-- ) {
		const rule = rules[ index ];

		if ( rule instanceof CSSImportRule && rule.layerName === null ) {
			deleteRulesOutsideWantedLayers( rule.styleSheet, isWantedLayer );
		} else if ( !isRuleToKeep( rule, isWantedLayer ) ) {
			styleSheet.deleteRule( index );
		}
	}
}

/**
 * Tells whether a top-level rule stays in the stripped style sheet:
 *
 * * `@layer editor { … }` and `@import url( … ) layer( editor )` – when the layer is wanted,
 * * `@layer a, b;` – always, so the layers keep the same order as on the page,
 * * `@namespace` – always, as it styles nothing and cannot be deleted while other rules follow it.
 *
 * @param {CSSRule} rule
 * @param {Function} isWantedLayer See `createWantedLayerFilter()`.
 * @returns {Boolean}
 */
function isRuleToKeep( rule, isWantedLayer ) {
	return rule instanceof CSSLayerStatementRule || rule instanceof CSSNamespaceRule ||
		rule instanceof CSSLayerBlockRule && isWantedLayer( rule.name ) ||
		rule instanceof CSSImportRule && isWantedLayer( rule.layerName );
}
