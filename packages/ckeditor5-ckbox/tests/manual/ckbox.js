/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload.js';
import LinkImageEditing from '@ckeditor/ckeditor5-link/src/linkimageediting.js';
import PictureEditing from '@ckeditor/ckeditor5-image/src/pictureediting.js';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices.js';
import { TOKEN_URL } from '../_utils/ckbox-config.js';
import CKBox from '../../src/ckbox.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, PictureEditing, ImageUpload, LinkImageEditing, CloudServices, CKBox ],
		toolbar: [
			'heading',
			'|',
			'bold',
			'italic',
			'link',
			'insertTable',
			'|',
			'undo',
			'redo',
			'|',
			'ckbox'
		],
		image: {
			toolbar: [
				'imageStyle:inline',
				'imageStyle:block',
				'imageStyle:side',
				'|',
				'toggleImageCaption',
				'imageTextAlternative'
			]
		},
		ckbox: {
			tokenUrl: TOKEN_URL
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
