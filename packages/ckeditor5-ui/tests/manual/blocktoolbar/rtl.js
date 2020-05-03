/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document, console:false, */

import BalloonEditor from '@ckeditor/ckeditor5-editor-balloon/src/ballooneditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import List from '@ckeditor/ckeditor5-list/src/list';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import HeadingButtonsUI from '@ckeditor/ckeditor5-heading/src/headingbuttonsui';
import ParagraphButtonUI from '@ckeditor/ckeditor5-paragraph/src/paragraphbuttonui';
import BlockToolbar from '../../../src/toolbar/block/blocktoolbar';

BalloonEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, List, Paragraph, Heading, Image, ImageCaption, HeadingButtonsUI, ParagraphButtonUI, BlockToolbar ],
		blockToolbar: [
			'paragraph', 'heading1', 'heading2', 'heading3', 'bulletedList', 'numberedList', 'paragraph',
			'heading1', 'heading2', 'heading3', 'bulletedList', 'numberedList', 'paragraph', 'heading1', 'heading2', 'heading3',
			'bulletedList', 'numberedList'
		],
		language: 'ar'
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
