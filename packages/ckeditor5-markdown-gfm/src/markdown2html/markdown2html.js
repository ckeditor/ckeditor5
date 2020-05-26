/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import marked from 'marked';

export default function markdown2html( markdown ) {
	return marked.parse( markdown, {
		gfm: true,
		breaks: true,
		tables: true,
		xhtml: true,
		headerIds: false
	} );
}

export { marked };

// Overrides.

// Disable the autolink rule in the lexer (point it to a regex that always fail).
marked.InlineLexer.rules.breaks.autolink = /^\b$/;
marked.InlineLexer.rules.breaks.url = /^\b$/;
