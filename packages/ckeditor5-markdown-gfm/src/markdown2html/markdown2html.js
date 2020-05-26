/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import marked from 'marked';

// TODO: Implement the Renderer (if necessary).
// TODO: Delete the legacy lib/marked directory..
// import GFMRenderer from './lib/marked/renderer';

export default function markdown2html( markdown ) {
	return marked.parse( markdown, {
		gfm: true,
		breaks: true,
		tables: true,
		xhtml: true,
		headerIds: false
	} );
}
