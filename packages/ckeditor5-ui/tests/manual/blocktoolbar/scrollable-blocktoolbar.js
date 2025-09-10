/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { BalloonEditor } from '@ckeditor/ckeditor5-editor-balloon';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { List } from '@ckeditor/ckeditor5-list';
import { Image, ImageCaption } from '@ckeditor/ckeditor5-image';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import { Paragraph, ParagraphButtonUI } from '@ckeditor/ckeditor5-paragraph';
import { Heading, HeadingButtonsUI } from '@ckeditor/ckeditor5-heading';
import { BlockToolbar } from '../../../src/toolbar/block/blocktoolbar.js';

createBlockButtonEditor( '#editor-scrollable-parent' ).then( editor => {
	window.editor = editor;
} );

createBlockButtonEditor( '#editor-scrollable' ).then( editor => {
	window.editor2 = editor;
} );

function createBlockButtonEditor( element ) {
	return BalloonEditor
		.create( document.querySelector( element ), {
			plugins: [
				Essentials, List, Paragraph, Heading, Image, ImageCaption,
				HeadingButtonsUI, ParagraphButtonUI, BlockToolbar, CodeBlock
			],
			blockToolbar: [
				'paragraph', 'heading1', 'heading2', 'heading3', 'bulletedList', 'numberedList', 'paragraph', 'codeBlock',
				'heading1', 'heading2', 'heading3', 'bulletedList', 'numberedList', 'paragraph', 'heading1', 'heading2', 'heading3',
				'bulletedList', 'numberedList'
			]
		} )
		.catch( err => {
			console.error( err.stack );
		} );
}
