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

// Just to have nicely styles switchbutton;
import '@ckeditor/ckeditor5-theme-lark/theme/ckeditor5-ui/components/list/list.css';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Link, Typing, Paragraph, Clipboard, Undo, Enter ],
		toolbar: [ 'link', 'undo', 'redo' ],
		link: {
			decorators: {
				IxExternal: {
					mode: 'manual',
					label: 'Open in new window',
					attributes: {
						target: '_blank',
						rel: 'noopener noreferrer'
					}
				},
				IsDownloadable: {
					mode: 'manual',
					label: 'Downloadable',
					attributes: {
						download: 'download'
					}
				},
				IsGallery: {
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
		if ( !window.editors ) {
			window.editors = {};
		}
		window.editor = editor;
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
				IsTelephone: {
					mode: 'automatic',
					callback: url => url.startsWith( 'tel:' ),
					attributes: {
						class: 'phone'
					}
				},
				IsInternal: {
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
		if ( !window.editors ) {
			window.editors = {};
		}
		window.editors.automaticDecorators = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
