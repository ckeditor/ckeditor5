/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console:false, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Link from '../../src/link';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Link, Typing, Paragraph, Clipboard, Undo, Enter ],
		toolbar: [ 'link', 'undo', 'redo' ],
		link: {
			decorators: [
				{
					mode: 'manual',
					label: 'Open in new window',
					attributes: {
						target: '_blank',
						rel: 'noopener noreferrer'
					}
				},
				{
					mode: 'manual',
					label: 'downloadable',
					attributes: {
						download: 'download'
					}
				},
				{
					mode: 'manual',
					label: 'gallery',
					attributes: {
						class: 'gallery'
					}
				}
			]
		}
	} )
	.then( editor => {
		window.getModelData = getModelData;
		window.editor = editor;
		window.model = editor.model;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
