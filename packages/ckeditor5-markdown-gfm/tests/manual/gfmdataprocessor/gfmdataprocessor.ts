/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ViewDocument, StylesProcessor, _stringifyView, _parseView, type ViewDocumentFragment } from '@ckeditor/ckeditor5-engine';

import { MarkdownGfmDataProcessor } from '../../../src/gfmdataprocessor.js';

const allowedTag = document.getElementById( 'allowed_tag_name' ) as HTMLInputElement;
const markdownTextArea = document.getElementById( 'markdown' ) as HTMLTextAreaElement;
const viewTextArea = document.getElementById( 'view' ) as HTMLTextAreaElement;
const dataProcessor = new MarkdownGfmDataProcessor( new ViewDocument( new StylesProcessor() ) );

document.getElementById( 'button_allow_tag' )!.addEventListener( 'click', addAllowedTag );
document.getElementById( 'button_to_view' )!.addEventListener( 'click', convertToView );
document.getElementById( 'button_to_md' )!.addEventListener( 'click', convertToMarkdown );

markdownTextArea!.value = '### Header 3\n\nTodo:\n\n* [ ] Test me';
convertToView();

function convertToView() {
	const markdown = markdownTextArea!.value;

	viewTextArea!.value = _stringifyView( dataProcessor.toView( markdown ) );
}

function convertToMarkdown() {
	const viewText = viewTextArea!.value;

	markdownTextArea!.value = dataProcessor.toData( _parseView( viewText ) as ViewDocumentFragment );
}

function addAllowedTag() {
	dataProcessor.keepHtml( allowedTag!.value as keyof HTMLElementTagNameMap );
	allowedTag!.value = '';
}
