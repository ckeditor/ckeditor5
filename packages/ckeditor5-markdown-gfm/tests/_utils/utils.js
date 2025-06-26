/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { MarkdownGfmDataProcessor } from '../../src/gfmdataprocessor.js';
import { _stringifyView } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';
import { ViewDocument } from '@ckeditor/ckeditor5-engine/src/view/document.js';
import { StylesProcessor } from '@ckeditor/ckeditor5-engine/src/view/stylesmap.js';

/**
 * Tests MarkdownGfmDataProcessor.
 *
 * @param {String} markdown Markdown to be processed to view.
 * @param {String} viewString Expected view structure.
 * @param {String} [normalizedMarkdown] When converting back to the markdown it might be different than provided input
 * @param {Object} [options] Additional options.
 * @param {Function} [options.setup] A function that receives the data processor instance before its execution.
 * markdown string (which will be used if this parameter is not provided).
 * @returns {module:engine/view/documentfragment~ViewDocumentFragment}
 */
export function testDataProcessor( markdown, viewString, normalizedMarkdown, options ) {
	const viewDocument = new ViewDocument( new StylesProcessor() );

	const dataProcessor = new MarkdownGfmDataProcessor( viewDocument );

	if ( options && options.setup ) {
		options.setup( dataProcessor );
	}

	const viewFragment = dataProcessor.toView( markdown );
	const html = cleanHtml( _stringifyView( viewFragment ) );

	// Check if view has correct data.
	expect( JSON.stringify( html ) ).to.equal( JSON.stringify( viewString ) );

	// Check if converting back gives the same result.
	const normalized = typeof normalizedMarkdown !== 'undefined' ? normalizedMarkdown : markdown;

	expect( JSON.stringify( cleanMarkdown( dataProcessor.toData( viewFragment ) ) ) ).to.equal( JSON.stringify( normalized ) );

	return viewFragment;
}

function cleanHtml( html ) {
	// Space between table elements.
	html = html.replace( /(th|td|tr)>\s+<(\/?(?:th|td|tr))/g, '$1><$2' );
	return html;
}

function cleanMarkdown( markdown ) {
	// Trim spaces at the end of the lines.
	markdown = markdown.replace( / +$/gm, '' );
	// Trim linebreak at the very beginning.
	markdown = markdown.replace( /^\s+/g, '' );
	return markdown;
}
