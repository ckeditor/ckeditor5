/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import TextTransformation from '../../src/texttransformation';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, TextTransformation ],
		toolbar: [
			'heading',
			'|', 'bulletedList', 'numberedList', 'blockQuote',
			'|', 'bold', 'italic', 'link',
			'|', 'insertTable',
			'|', 'undo', 'redo'
		],
		image: {
			toolbar: [ 'imageStyle:block', 'imageStyle:side', '|', 'imageTextAlternative' ]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
