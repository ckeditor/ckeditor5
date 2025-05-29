/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import List from '@ckeditor/ckeditor5-list/src/list.js';
import { Paragraph, ParagraphButtonUI } from '@ckeditor/ckeditor5-paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import HeadingButtonsUI from '@ckeditor/ckeditor5-heading/src/headingbuttonsui.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic.js';
import Link from '@ckeditor/ckeditor5-link/src/link.js';

import BlockToolbar from '../../../../src/toolbar/block/blocktoolbar.js';
import BalloonToolbar from '../../../../src/toolbar/balloon/balloontoolbar.js';

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
