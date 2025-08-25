/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Enter } from '@ckeditor/ckeditor5-enter';
import { Typing } from '@ckeditor/ckeditor5-typing';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Image, ImageCaption, ImageToolbar, ImageStyle, ImageUpload } from '@ckeditor/ckeditor5-image';
import { Undo } from '@ckeditor/ckeditor5-undo';
import { Clipboard } from '@ckeditor/ckeditor5-clipboard';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { List } from '@ckeditor/ckeditor5-list';
import { CKFinderUploadAdapter } from '../../src/uploadadapter.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		plugins: [
			Enter, Typing, Paragraph, Heading, Undo, Bold, Italic, Heading, List, Image, ImageToolbar, Clipboard,
			ImageCaption, ImageStyle, ImageUpload, CKFinderUploadAdapter
		],
		toolbar: [ 'heading', '|', 'undo', 'redo', 'bold', 'italic', 'bulletedList', 'numberedList', 'uploadImage' ],
		ckfinder: {
			// eslint-disable-next-line @stylistic/max-len
			uploadUrl: 'https://cksource.com/weuy2g4ryt278ywiue/core/connector/php/connector.php?command=QuickUpload&type=Files&responseType=json'
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
