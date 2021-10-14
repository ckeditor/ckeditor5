/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import { stringify } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import { StylesProcessor } from '@ckeditor/ckeditor5-engine/src/view/stylesmap';
import Document from '@ckeditor/ckeditor5-engine/src/view/document';

/**
 * Parses given string of HTML and returns normalized HTML.
 *
 * @param {String} html HTML string to normalize.
 * @param {Object} [options] DOM to View conversion options. See {@link module:engine/view/domconverter~DomConverter#domToView} options.
 * @returns {String} Normalized HTML string.
 */
export default function normalizeHtml( html, options = {} ) {
	const processor = new HtmlDataProcessor( new Document( new StylesProcessor() ) );
	const domFragment = processor._toDom( html );
	const viewFragment = processor.domConverter.domToView( domFragment, options );

	return stringify( viewFragment );
}
