/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Typing } from '@ckeditor/ckeditor5-typing';
import { Paragraph } from '../../src/paragraph.js';
import { Undo } from '@ckeditor/ckeditor5-undo';
import { Enter } from '@ckeditor/ckeditor5-enter';
import { Clipboard } from '@ckeditor/ckeditor5-clipboard';
import { Link } from '@ckeditor/ckeditor5-link';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Typing,
			Paragraph,
			Undo,
			Enter,
			Clipboard,
			Link,
			Bold,
			Italic
		],
		toolbar: [ 'bold', 'italic', 'link', 'undo', 'redo' ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
