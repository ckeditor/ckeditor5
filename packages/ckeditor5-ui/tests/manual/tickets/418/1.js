/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { List } from '@ckeditor/ckeditor5-list';
import { Paragraph, ParagraphButtonUI } from '@ckeditor/ckeditor5-paragraph';
import { Heading, HeadingButtonsUI } from '@ckeditor/ckeditor5-heading';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { Link } from '@ckeditor/ckeditor5-link';

import { BlockToolbar } from '../../../../src/toolbar/block/blocktoolbar.js';
import { BalloonToolbar } from '../../../../src/toolbar/balloon/balloontoolbar.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Essentials,
			List,
			Paragraph,
			Heading,
			HeadingButtonsUI,
			ParagraphButtonUI,
			Bold,
			Italic,
			Link,
			BlockToolbar,
			BalloonToolbar
		],
		blockToolbar: [ 'paragraph', 'heading1', 'heading2', 'heading3', 'bulletedList', 'numberedList' ],
		balloonToolbar: [ 'bold', 'italic', 'link' ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
