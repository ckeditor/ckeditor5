/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import Document from '@ckeditor/ckeditor5-engine/src/view/document';
import { StylesProcessor } from '@ckeditor/ckeditor5-engine/src/view/stylesmap';
import { stringify, parse } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

import MarkdownDataProcessor from '../../../src/gfmdataprocessor';

const markdownTextArea = document.getElementById( 'markdown' );
const viewTextArea = document.getElementById( 'view' );
const dataProcessor = new MarkdownDataProcessor( new Document( new StylesProcessor() ) );

document.getElementById( 'button_to_view' ).addEventListener( 'click', convertToView );
document.getElementById( 'button_to_md' ).addEventListener( 'click', convertToMarkdown );

markdownTextArea.value = '### Header 3\n\nTodo:\n\n* [ ] Test me';
convertToView();

function convertToView() {
	const markdown = markdownTextArea.value;

	viewTextArea.value = stringify( dataProcessor.toView( markdown ) );
}

function convertToMarkdown() {
	const viewText = viewTextArea.value;

	markdownTextArea.value = dataProcessor.toData( parse( viewText ) );
}
