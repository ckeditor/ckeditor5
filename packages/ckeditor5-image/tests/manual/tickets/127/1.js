/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Enter } from '@ckeditor/ckeditor5-enter';
import { Typing } from '@ckeditor/ckeditor5-typing';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Link } from '@ckeditor/ckeditor5-link';
import { Bold } from '@ckeditor/ckeditor5-basic-styles';
import { Image } from '../../../../src/image.js';
import { ImageCaption } from '../../../../src/imagecaption.js';
import { Undo } from '@ckeditor/ckeditor5-undo';
import { BalloonToolbar } from '@ckeditor/ckeditor5-ui';
import { ImageToolbar } from '../../../../src/imagetoolbar.js';

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
