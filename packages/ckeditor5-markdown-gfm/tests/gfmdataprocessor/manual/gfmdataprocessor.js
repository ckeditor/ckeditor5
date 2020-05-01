/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import MarkdownDataProcessor from '../../../src/gfmdataprocessor';
import { stringify, parse } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

const markdownTextArea = document.getElementById( 'markdown' );
const viewTextArea = document.getElementById( 'view' );
const dataProcessor = new MarkdownDataProcessor();

document.getElementById( 'button_to_view' ).addEventListener( 'click', convertToView );
document.getElementById( 'button_to_md' ).addEventListener( 'click', convertToMarkdown );

markdownTextArea.value = '### Header\n\nFoo bar baz biz.';
convertToView();

function convertToView() {
	const markdown = markdownTextArea.value;

	viewTextArea.value = stringify( dataProcessor.toView( markdown ) );
}

function convertToMarkdown() {
	const viewText = viewTextArea.value;

	markdownTextArea.value = dataProcessor.toData( parse( viewText ) );
}
