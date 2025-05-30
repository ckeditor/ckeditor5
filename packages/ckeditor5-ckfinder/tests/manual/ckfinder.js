/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import CKFinderUploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload.js';

import CKFinder from '../../src/ckfinder.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, ImageUpload, CKFinderUploadAdapter, CKFinder ],
		toolbar: [ 'heading', '|', 'undo', 'redo', 'ckfinder' ],
		image: {
			toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:wrapText', '|', 'imageTextAlternative' ]
		},
		ckfinder: {
			// eslint-disable-next-line @stylistic/max-len
			uploadUrl: 'https://ckeditor.com/apps/ckfinder/3.5.0/core/connector/php/connector.php?command=QuickUpload&type=Files&responseType=json'
		}
	} )
	.then( editor => {
		window.editor = editor;

		const button = document.querySelector( '#opener-method' );
		const label = document.querySelector( '#opener-method-label' );

		button.addEventListener( 'click', () => {
			const method = editor.config.get( 'ckfinder.openerMethod' );
			const isPopup = method === 'popup';

			const newMethod = isPopup ? 'modal' : 'popup';
			editor.config.set( 'ckfinder.openerMethod', newMethod );

			button.innerText = 'Switch to ' + ( isPopup ? 'popup' : 'modal' );
			label.innerText = newMethod;
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
