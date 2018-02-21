/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import { TOKEN_URL } from '@ckeditor/ckeditor5-cloudservices/tests/_utils/cloudservices-config';
import './custom.css';

ClassicEditor
	.create( document.querySelector( '#snippet-classic-editor' ), {
		plugins: [ ArticlePluginSet, EasyImage ],
		toolbar: {
			items: [ 'headings', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo' ],
			viewportTopOffset: 60
		},
		image: {
			toolbar: [ 'imageStyleFull', 'imageStyleSide', '|', 'imageTextAlternative' ]
		},
		cloudServices: {
			tokenUrl: TOKEN_URL
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
