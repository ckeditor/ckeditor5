/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document, console:false */

import BalloonEditor from '@ckeditor/ckeditor5-editor-balloon/src/ballooneditor.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import List from '@ckeditor/ckeditor5-list/src/list.js';
import Image from '@ckeditor/ckeditor5-image/src/image.js';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption.js';
import { Paragraph, ParagraphButtonUI } from '@ckeditor/ckeditor5-paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import HeadingButtonsUI from '@ckeditor/ckeditor5-heading/src/headingbuttonsui.js';
import BlockToolbar from '../../../src/toolbar/block/blocktoolbar.js';

createBlockButtonEditor( '#editor-scrollable-parent' ).then( editor => {
	window.editor = editor;
} );

createBlockButtonEditor( '#editor-scrollable' ).then( editor => {
	window.editor2 = editor;
} );

function createBlockButtonEditor( element ) {
	return BalloonEditor
		.create( document.querySelector( element ), {
			plugins: [ Essentials, List, Paragraph, Heading, Image, ImageCaption, HeadingButtonsUI, ParagraphButtonUI, BlockToolbar ],
			blockToolbar: [
				'paragraph', 'heading1', 'heading2', 'heading3', 'bulletedList', 'numberedList', 'paragraph',
				'heading1', 'heading2', 'heading3', 'bulletedList', 'numberedList', 'paragraph', 'heading1', 'heading2', 'heading3',
				'bulletedList', 'numberedList'
			]
		} )
		.catch( err => {
			console.error( err.stack );
		} );
}
