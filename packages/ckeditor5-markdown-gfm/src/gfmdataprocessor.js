/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import marked from './lib/marked/marked.js';
import toMarkdown from './lib/to-markdown/to-markdown.js';
import HtmlDataProcessor from '../engine/dataprocessor/htmldataprocessor.js';
import GFMRenderer from './lib/marked/renderer.js';
import converters from './lib/to-markdown/converters.js';

export default class GFMDataProcessor extends HtmlDataProcessor {
	constructor() {
		super();
	}

	toView( data ) {
		const html = marked.parse( data, {
			gfm: true,
			breaks: true,
			tables: true,
			xhtml: true,
			renderer: new GFMRenderer()
		} );

		return super.toView( html );
	}

	toData( viewFragment ) {
		const html = super.toData( viewFragment );

		return toMarkdown( html, { gfm: true, converters } );
	}
}

