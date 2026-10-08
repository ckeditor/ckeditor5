/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { DecoupledEditor } from '@ckeditor/ckeditor5-editor-decoupled';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';

import { FullPage } from '../src/fullpage.js';

import { createEditorDomRoot, getShadowMode } from '@ckeditor/ckeditor5-ui/manual/_utils/shadow.js';

declare global {
	interface Window {
		editor: any;
	}
}

type DataVariant = 'a' | 'b' | 'noStyles';

const STAGE = document.getElementById( 'stage' )!;
const REPORT = document.getElementById( 'report' )!;
const DATA_VARIANT = document.getElementById( 'data-variant' ) as HTMLSelectElement;
const ALLOW_STYLES = document.getElementById( 'allow-styles' ) as HTMLInputElement;
const MOUNT_BUTTON = document.getElementById( 'mount' ) as HTMLButtonElement;

let editor: DecoupledEditor | null = null;
let mountRoot: HTMLElement | ShadowRoot | null = null;

// One `<style>` per entry, so a variant can show that all of them are picked up. The `<script>` confirms the rest
// of the `<head>` is preserved as data and never executed.
function buildPageData( label: string, styles: Array<string> ): string {
	return [
		'<!DOCTYPE html>',
		'<html>',
		'<head>',
		'	<title>Page title</title>',
		...styles.map( css => `	<style> ${ css } </style>` ),
		'	<script> alert( \'should not show this alert\' ); </script>',
		'</head>',
		'<body>',
		`	<h2>Variant ${ label }</h2>`,
		`	<p>Page content of variant ${ label }.</p>`,
		'</body>',
		'</html>'
	].join( '\n' );
}

// The variants differ in every declaration, so styles left over from previously loaded data show up in the content
// and not only in the report.
const PAGE_DATA: Record<DataVariant, string> = {
	a: buildPageData( 'A', [
		'h2 { color: green; font-size: 40px; }',
		'p { color: blue; }'
	] ),
	b: buildPageData( 'B', [
		'h2 { color: #b8860b; font-size: 20px; text-transform: uppercase; }',
		'p { color: purple; font-style: italic; }'
	] ),
	noStyles: buildPageData( 'without head styles', [] )
};

function sanitizeCss( rawCss: string ): { css: string; hasChanged: boolean } {
	return { css: rawCss, hasChanged: false };
}

// Everything that was already in the document when this module ran: the theme stylesheets injected by the test
// runner and this page's own styles. Identifying them by reference rather than by their attributes, because how
// the runner injects the theme is not something this page should depend on – and mistaking a theme stylesheet for
// a rendered one shows up as a phantom stranded style.
const KNOWN_STYLES = new Set( document.querySelectorAll( 'style' ) );

// Counts the `<style>` elements the feature rendered in the given root. The CSS itself is not reported: the point
// is where the styles are, and the content below shows what they do.
//
// The CKEditor inspector injects a `<style>` of its own after this module runs, so it is not in `KNOWN_STYLES` and
// has to be told apart by its attribute – otherwise it counts as a stray rendered style forever.
function countDataStyles( container: HTMLHeadElement | ShadowRoot | HTMLElement ): number {
	return Array.from( container.children )
		.filter( child =>
			child instanceof HTMLStyleElement &&
			!KNOWN_STYLES.has( child ) &&
			!( 'ckeInspector' in child.dataset )
		)
		.length;
}

function report(): void {
	const inShadow = !!mountRoot && mountRoot !== STAGE;

	let editable: string;

	if ( !editor ) {
		editable = 'none';
	} else if ( !mountRoot ) {
		editable = 'detached';
	} else if ( inShadow ) {
		editable = `mounted in the ${ getShadowMode() } shadow root`;
	} else {
		editable = 'mounted in the light DOM';
	}

	const lines = [
		`editor: ${ editor ? 'alive' : 'not created' }`,
		`editable: ${ editable }`,
		`allowRenderStylesFromHead: ${ ALLOW_STYLES.checked }`,
		`loaded data: variant ${ DATA_VARIANT.selectedOptions[ 0 ].text }`
	];

	// A `<style>` in a shadow root is invisible from the document, so anything counted in the head while the
	// editable lives in one missed its root. Before the mount, the head must be empty too.
	if ( inShadow ) {
		lines.push( `rendered in the shadow root: ${ countDataStyles( mountRoot! ) }` );
	}

	lines.push( `rendered in document.head: ${ countDataStyles( document.head ) }` );

	REPORT.textContent = lines.join( '\n' );
}

async function createEditor(): Promise<void> {
	await destroyEditor();

	// No source element: the editable is created by the editor but left out of the DOM. This is the documented
	// detached editor path and the case this page is about.
	editor = await DecoupledEditor.create( {
		plugins: [ ArticlePluginSet, SourceEditing, FullPage ],
		toolbar: [
			'sourceEditing', '|',
			'heading', '|', 'bold', 'italic', 'link', '|',
			'bulletedList', 'numberedList', '|',
			'undo', 'redo'
		],
		htmlSupport: {
			fullPage: {
				allowRenderStylesFromHead: ALLOW_STYLES.checked,
				sanitizeCss
			}
		},
		root: {
			initialData: PAGE_DATA[ DATA_VARIANT.value as DataVariant ]
		}
	} );

	window.editor = editor;

	MOUNT_BUTTON.disabled = false;

	report();

	// Nothing should be rendered while the editable is detached, so this second look is what makes that visible.
	await settle();

	report();
}

async function destroyEditor(): Promise<void> {
	if ( editor ) {
		await editor.destroy();

		editor = null;
	}

	// A decoupled editor does not take the toolbar and the editable out of the DOM – whoever put them there has to.
	// The shadow host of the previous run goes with them.
	STAGE.textContent = '';
	mountRoot = null;

	MOUNT_BUTTON.disabled = true;

	report();
}

async function mountEditable(): Promise<void> {
	if ( !editor || mountRoot ) {
		return;
	}

	mountRoot = createEditorDomRoot( STAGE );

	// A decoupled editor leaves placing both the toolbar and the editable to the integration.
	mountRoot.append( editor.ui.view.toolbar.element!, editor.ui.view.editable.element! );

	MOUNT_BUTTON.disabled = true;

	await settle();

	report();
}

function setData(): void {
	if ( editor ) {
		editor.setData( PAGE_DATA[ DATA_VARIANT.value as DataVariant ] );
		report();
	}
}

// The styles are rendered once the editable is connected to a document, which is reported asynchronously – hence
// a beat before every report, and the Refresh report button for a second look.
function settle(): Promise<void> {
	return new Promise( resolve => setTimeout( resolve, 250 ) );
}

// Every action touches the editor, so they are queued – two of them must not race for the same stage.
let queue = Promise.resolve();

function enqueue( action: () => Promise<void> ): void {
	queue = queue.then( action ).catch( err => console.error( err.stack ) );
}

DATA_VARIANT.addEventListener( 'change', setData );
document.getElementById( 'set-data' )!.addEventListener( 'click', setData );
document.getElementById( 'refresh-report' )!.addEventListener( 'click', report );
MOUNT_BUTTON.addEventListener( 'click', () => enqueue( mountEditable ) );
document.getElementById( 'create' )!.addEventListener( 'click', () => enqueue( createEditor ) );
document.getElementById( 'destroy' )!.addEventListener( 'click', () => enqueue( destroyEditor ) );

// Read while creating the editor, so it takes a new editor to apply.
ALLOW_STYLES.addEventListener( 'change', () => enqueue( createEditor ) );

enqueue( createEditor );
