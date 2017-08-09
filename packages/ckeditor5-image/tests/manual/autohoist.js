/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document, console, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import EssentialsPreset from '@ckeditor/ckeditor5-presets/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Image from '../../src/image';
import ImageCaption from '../../src/imagecaption';
import ImageToolbar from '../../src/imagetoolbar';
import ImageStyle from '../../src/imagestyle';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import List from '@ckeditor/ckeditor5-list/src/list';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			EssentialsPreset,
			Paragraph, Heading, Image, ImageToolbar,
			ImageCaption, ImageStyle, Bold, Italic, Heading, List
		],
		toolbar: [ 'headings', 'undo', 'redo', 'bold', 'italic', 'bulletedList', 'numberedList' ],
		image: {
			toolbar: [ 'imageStyleFull', 'imageStyleSide', '|', 'imageTextAlternative' ]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
