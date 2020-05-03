/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console:false, document, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet ],
		toolbar: [ 'undo', 'redo', 'link' ],
		link: {
			decorators: {
				isDownloadable: {
					mode: 'manual',
					label: 'Downloadable',
					attributes: {
						download: 'download'
					}
				}
			}
		}
	} )
	.then( newEditor => {
		window.editor = newEditor;
	} )
	.catch( err => console.error( err.stack ) );
