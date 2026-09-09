/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';

import { FullPage } from '../src/fullpage.js';

import {
	createEditorDomRoot,
	getOverlayConfig,
	getShadowMode
} from '@ckeditor/ckeditor5-ui/manual/_utils/shadow.js';

declare global {
	interface Window {
		editor: any;
	}
}

type DataVariant = 'a' | 'b' | 'noStyles';

const MOUNT = document.getElementById( 'mount' )!;
const REPORT = document.getElementById( 'report' )!;

const DATA_VARIANT_SELECT = document.getElementById( 'data-variant' ) as HTMLSelectElement;
const ALLOW_STYLES_INPUT = document.getElementById( 'allow-styles' ) as HTMLInputElement;
const SANITIZE_INPUT = document.getElementById( 'sanitize-css' ) as HTMLInputElement;

const SET_DATA_BUTTON = document.getElementById( 'set-data' ) as HTMLButtonElement;
const RESTART_BUTTON = document.getElementById( 'restart' ) as HTMLButtonElement;
const DESTROY_BUTTON = document.getElementById( 'destroy' ) as HTMLButtonElement;
const REFRESH_BUTTON = document.getElementById( 'refresh-report' ) as HTMLButtonElement;

// The root the editor currently lives in: the `#mount` element in the light DOM, or a shadow root. Kept in a
// variable rather than read from the DOM, because a closed root cannot be reached through `host.shadowRoot`.
let editorDomRoot: HTMLElement | ShadowRoot;
let editorInstance: ClassicEditor | null = null;

/**
 * Full page data with the given `<head>` styles – one `<style>` element per entry, so a variant can check that all
 * of them are picked up, not just the first. The `<script>` and the comment are there to confirm that the rest of
 * the `<head>` is preserved as data and never executed.
 */
function buildPageData( label: string, styles: Array<string> ): string {
	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<!DOCTYPE html>',
		'<html>',
		'<head>',
		'	<title>Page title</title>',
		'	<meta name="robots" content="noindex, nofollow" />',
		...styles.map( css => `	<style> ${ css } </style>` ),
		'	<script> alert( \'should not show this alert\' ); </script>',
		'	<!-- some comment -->',
		'</head>',
		'<body style="margin:0 !important; padding:0 !important;">',
		`	<h2>Variant ${ label }</h2>`,
		`	<p>Page content of variant ${ label }.</p>`,
		'</body>',
		'</html>'
	].join( '\n' );
}

// The variants differ in every declaration they set, so a leftover `<style>` from the previously loaded data is
// visible in the content and not only in the report below. `body` rules are included on purpose: inside a shadow
// root they match nothing (there is no `<body>` there), while in the light DOM they restyle the whole page.
const PAGE_DATA: Record<DataVariant, string> = {
	a: buildPageData( 'A', [
		'h2 { color: green; font-size: 40px; }',
		'p { color: blue; } body { background: #ffecec; }'
	] ),
	b: buildPageData( 'B', [
		'h2 { color: #b8860b; font-size: 20px; text-transform: uppercase; }',
		'p { color: purple; font-style: italic; } body { background: #eaeaff; }'
	] ),
	noStyles: buildPageData( 'without head styles', [] )
};

/**
 * A deliberately crude sanitizer: it drops `background` declarations and nothing else. That is enough to tell at a
 * glance whether the CSS that reached the DOM went through it – variant backgrounds stop applying in the light DOM.
 * A real integration needs a CSS parser here; see the Full page HTML feature documentation.
 */
function sanitizeCss( rawCss: string ): { css: string; hasChanged: boolean } {
	const css = rawCss.replace( /background[\w-]*\s*:[^;}]*;?/g, '' );

	return {
		css,
		hasChanged: css !== rawCss
	};
}

/**
 * Where the Full page feature renders the `<style>` elements it builds from the data: straight into the shadow
 * root when the editable lives in one, and into `document.head` otherwise.
 */
function styleContainer(): HTMLHeadElement | ShadowRoot {
	return editorDomRoot === MOUNT ? document.head : editorDomRoot as ShadowRoot;
}

/**
 * The `<style>` elements of `container` that the feature could have rendered there. The theme styles forwarded by
 * the manual-test runner, this page's own styles and the CKEditor inspector's are told apart by their attributes;
 * everything else that is a direct child came from the data.
 */
function renderedStyles( container: HTMLHeadElement | ShadowRoot ): Array<HTMLStyleElement> {
	return Array.from( container.children ).filter( ( child ): child is HTMLStyleElement =>
		child.tagName === 'STYLE' &&
		!( child as HTMLElement ).dataset.viteDevId &&
		!( 'manualPage' in ( child as HTMLElement ).dataset ) &&
		!( 'ckeInspector' in ( child as HTMLElement ).dataset )
	);
}

function describeStyles( styles: Array<HTMLStyleElement> ): Array<string> {
	return styles.map( ( style, index ) => {
		const css = ( style.textContent || '' ).replace( /\s+/g, ' ' ).trim();

		return `  ${ index + 1 }. ${ css.length > 70 ? css.slice( 0, 70 ) + '…' : css }`;
	} );
}

function refreshReport(): void {
	const shadowMode = getShadowMode();
	const container = styleContainer();
	const rendered = renderedStyles( container );

	// `querySelectorAll` does not pierce shadow roots, so a `<style>` injected into one is invisible from the
	// document. In the shadow modes the head should therefore stay empty of data styles – anything counted here
	// is a style that missed its target root.
	const strayInHead = shadowMode === 'none' ? [] : renderedStyles( document.head );

	REPORT.textContent = [
		`editor: ${ editorInstance ? 'alive' : 'destroyed' }`,
		`editable root: ${ shadowMode === 'none' ? 'light DOM' : shadowMode + ' shadow root' }`,
		`allowRenderStylesFromHead: ${ ALLOW_STYLES_INPUT.checked }`,
		`loaded data: variant ${ DATA_VARIANT_SELECT.selectedOptions[ 0 ].text }`,
		'',
		`data <style> in ${ container === document.head ? 'document.head' : 'the shadow root' }: ${ rendered.length }`,
		...describeStyles( rendered ),
		`data <style> stranded in document.head: ${ strayInHead.length }`,
		...describeStyles( strayInHead )
	].join( '\n' );
}

async function restart(): Promise<void> {
	if ( editorInstance ) {
		await editorInstance.destroy();

		editorInstance = null;
	}

	editorDomRoot = createEditorDomRoot( MOUNT );

	const editorElement = editorDomRoot.appendChild( document.createElement( 'div' ) );

	editorInstance = await ClassicEditor.create( {
		attachTo: editorElement,
		...getOverlayConfig(),
		plugins: [
			ArticlePluginSet,
			SourceEditing,
			FullPage
		],
		toolbar: [
			'sourceEditing', '|',
			'heading', '|', 'bold', 'italic', 'link', '|',
			'bulletedList', 'numberedList', '|',
			'blockQuote', 'insertTable', '|',
			'undo', 'redo'
		],
		htmlSupport: {
			fullPage: {
				allowRenderStylesFromHead: ALLOW_STYLES_INPUT.checked,

				// Left out when unchecked, so the feature falls back to its own pass-through function and logs the
				// `css-full-page-provide-sanitize-function` warning – which is the point of that variant.
				...( SANITIZE_INPUT.checked ? { sanitizeCss } : {} )
			}
		},
		initialData: PAGE_DATA[ DATA_VARIANT_SELECT.value as DataVariant ]
	} );

	window.editor = editorInstance;

	refreshReport();
}

/**
 * Every control rebuilds the editor, so the restarts are queued – switching two of them quickly must not leave two
 * editors racing for the same root.
 */
let pendingRestart = Promise.resolve();

function scheduleRestart(): void {
	pendingRestart = pendingRestart
		.then( () => restart() )
		.catch( err => console.error( err.stack ) );
}

// Loading data into a live editor is the interesting path: the feature has to drop the styles of the previous
// document before rendering the new ones, wherever it put them.
function setData(): void {
	if ( !editorInstance ) {
		return;
	}

	editorInstance.setData( PAGE_DATA[ DATA_VARIANT_SELECT.value as DataVariant ] );

	refreshReport();
}

DATA_VARIANT_SELECT.addEventListener( 'change', setData );
SET_DATA_BUTTON.addEventListener( 'click', setData );

// Both are read while creating the editor, so they take a restart to apply.
ALLOW_STYLES_INPUT.addEventListener( 'change', scheduleRestart );
SANITIZE_INPUT.addEventListener( 'change', scheduleRestart );

RESTART_BUTTON.addEventListener( 'click', scheduleRestart );

DESTROY_BUTTON.addEventListener( 'click', () => {
	pendingRestart = pendingRestart
		.then( async () => {
			if ( !editorInstance ) {
				return;
			}

			await editorInstance.destroy();

			editorInstance = null;

			refreshReport();
		} )
		.catch( err => console.error( err.stack ) );
} );

REFRESH_BUTTON.addEventListener( 'click', refreshReport );

scheduleRestart();
