/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/adoptglobalstylesheet
 */

/**
 * The stylesheet text already adopted into a document, so the same rules are adopted once no matter how many
 * editors ask for them, or how many times.
 */
const adoptedStyleSheets = new WeakMap<Document, Set<string>>();

/**
 * Ships a stylesheet that has to reach the light DOM, whatever tree the editor itself lives in.
 *
 * For the few rules that a shadow-scoped theme stylesheet cannot express, because they style nodes no shadow
 * root can contain: the `<html>` and `<body>` elements, or third-party UI mounted in `document.body`. Anything
 * that styles the editor UI belongs in a theme stylesheet instead, where an integrator can see and override it.
 *
 * Safe to call from any number of editors sharing a document, and at any time: the same stylesheet text is
 * adopted once per document. The stylesheet then stays for the lifetime of the document, inert unless the
 * classes it targets are present.
 *
 * @param doc The document to adopt the stylesheet into.
 * @param css The stylesheet text. Pass a constant – repeated calls with the same text are a no-op.
 */
export function adoptGlobalStyleSheet( doc: Document, css: string ): void {
	const adopted = adoptedStyleSheets.get( doc ) || new Set<string>();

	adoptedStyleSheets.set( doc, adopted );

	if ( adopted.has( css ) ) {
		return;
	}

	adopted.add( css );

	// The stylesheet must be constructed in the realm of the document it is adopted into, or the assignment
	// throws – they differ for an editor inside an iframe.
	const styleSheet = new doc.defaultView!.CSSStyleSheet();

	styleSheet.replaceSync( css );

	doc.adoptedStyleSheets.push( styleSheet );
}
