/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import EasyImage from '../../src/easyimage';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';

import getToken from '../_utils/gettoken';

getToken()
	.then( tokenUrl => {
		return ClassicEditor
			.create( document.querySelector( '#editor' ), {
				cloudServices: {
					tokenUrl
				},
				plugins: [ ArticlePluginSet, EasyImage ],
				toolbar: [ 'headings', 'undo', 'redo', 'insertImage' ],
				image: {
					toolbar: [ 'imageStyleFull', 'imageStyleSide', '|', 'imageTextAlternative' ]
				}
			} )
			.then( editor => {
				window.editor = editor;
			} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
