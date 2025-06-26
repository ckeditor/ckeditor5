/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ViewDocument } from '@ckeditor/ckeditor5-engine/src/view/document.js';
import { StylesProcessor } from '@ckeditor/ckeditor5-engine/src/view/stylesmap.js';
import { _stringifyView, _parseView } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';

import { MarkdownGfmDataProcessor } from '../../../src/gfmdataprocessor.js';

const allowedTag = document.getElementById( 'allowed_tag_name' );
const markdownTextArea = document.getElementById( 'markdown' );
const viewTextArea = document.getElementById( 'view' );
const dataProcessor = new MarkdownGfmDataProcessor( new ViewDocument( new StylesProcessor() ) );

document.getElementById( 'button_allow_tag' ).addEventListener( 'click', addAllowedTag );
document.getElementById( 'button_to_view' ).addEventListener( 'click', convertToView );
document.getElementById( 'button_to_md' ).addEventListener( 'click', convertToMarkdown );

markdownTextArea.value = '### Header 3\n\nTodo:\n\n* [ ] Test me';
convertToView();

function convertToView() {
	const markdown = markdownTextArea.value;

	viewTextArea.value = _stringifyView( dataProcessor.toView( markdown ) );
}

function convertToMarkdown() {
	const viewText = viewTextArea.value;

	markdownTextArea.value = dataProcessor.toData( _parseView( viewText ) );
}

function addAllowedTag() {
	dataProcessor.keepHtml( allowedTag.value );
	allowedTag.value = '';
}
