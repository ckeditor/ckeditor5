/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Enter from '@ckeditor/ckeditor5-enter/src/enter.js';
import Typing from '@ckeditor/ckeditor5-typing/src/typing.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Link from '@ckeditor/ckeditor5-link/src/link.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import Image from '../../../../src/image.js';
import ImageCaption from '../../../../src/imagecaption.js';
import Undo from '@ckeditor/ckeditor5-undo/src/undo.js';
import BalloonToolbar from '@ckeditor/ckeditor5-ui/src/toolbar/balloon/balloontoolbar.js';
import ImageToolbar from '../../../../src/imagetoolbar.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		plugins: [ Enter, Typing, Paragraph, Link, Bold, Image, Undo, ImageToolbar, BalloonToolbar, ImageCaption ],
		toolbar: [ 'bold', 'undo', 'redo' ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
