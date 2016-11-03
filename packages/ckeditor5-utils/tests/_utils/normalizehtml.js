/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import HtmlDataProcessor from 'ckeditor5/engine/dataprocessor/htmldataprocessor.js';
import { stringify } from 'ckeditor5/engine/dev-utils/view.js';

/**
 * Parses given string of HTML and returns normalized HTML.
 *
 * @param {String} html HTML string to normalize.
 * @returns {String} Normalized HTML string.
 */
export default function normalizeHtml( html ) {
	const processor = new HtmlDataProcessor();
	const parsed = processor.toView( html );

	return stringify( parsed );
}
