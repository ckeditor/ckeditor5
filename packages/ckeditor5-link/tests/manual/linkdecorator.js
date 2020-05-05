/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console:false, window, document, CKEditorInspector */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Link from '../../src/link';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';

// Just to have nicely styles switchbutton;
import '@ckeditor/ckeditor5-theme-lark/theme/ckeditor5-ui/components/list/list.css';

window.editors = {};

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Link, Typing, Paragraph, Clipboard, Undo, Enter ],
		toolbar: [ 'link', 'undo', 'redo' ],
		link: {
			decorators: {
				isExternal: {
					mode: 'manual',
					label: 'Open in a new tab',
					attributes: {
						target: '_blank',
						rel: 'noopener noreferrer'
					}
				},
				isDownloadable: {
					mode: 'manual',
					label: 'Downloadable',
					attributes: {
						download: 'download'
					}
				},
				isGallery: {
					mode: 'manual',
					label: 'Gallery link',
					attributes: {
						class: 'gallery'
					}
				}
			}
		}
	} )
	.then( editor => {
		CKEditorInspector.attach( 'manual', editor );
		window.editors.manualDecorators = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

ClassicEditor
	.create( document.querySelector( '#editor2' ), {
		plugins: [ Link, Typing, Paragraph, Clipboard, Undo, Enter ],
		toolbar: [ 'link', 'undo', 'redo' ],
		link: {
			decorators: {
				isTelephone: {
					mode: 'automatic',
					callback: url => url.startsWith( 'tel:' ),
					attributes: {
						class: 'phone'
					}
				},
				isInternal: {
					mode: 'automatic',
					callback: url => url.startsWith( '#' ),
					attributes: {
						class: 'internal'
					}
				}
			},
			addTargetToExternalLinks: true
		}
	} )
	.then( editor => {
		CKEditorInspector.attach( 'automatic', editor );
		window.editors.automaticDecorators = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
