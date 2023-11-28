/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import ImageInsert from '@ckeditor/ckeditor5-image/src/imageinsert';
import LinkImageEditing from '@ckeditor/ckeditor5-link/src/linkimageediting';
import PictureEditing from '@ckeditor/ckeditor5-image/src/pictureediting';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';
import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage';
import AutoSave from '@ckeditor/ckeditor5-autosave/src/autosave';
import { TOKEN_URL } from '../_utils/ckbox-config';
import CKBox from '../../src/ckbox';
import CKBoxImageEdit from '../../src/ckboximageedit';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			ArticlePluginSet, PictureEditing, ImageUpload, LinkImageEditing,
			ImageInsert, CloudServices, CKBox, LinkImage, CKBoxImageEdit, AutoSave
		],
		toolbar: [
			'heading',
			'|',
			'bold',
			'italic',
			'link',
			'insertTable',
			'insertImage',
			'|',
			'undo',
			'redo',
			'|',
			'ckbox',
			'|',
			'ckboxImageEdit'
		],
		image: {
			toolbar: [
				'imageStyle:inline',
				'imageStyle:block',
				'imageStyle:side',
				'|',
				'toggleImageCaption',
				'imageTextAlternative',
				'|',
				'ckboxImageEdit'
			]
		},
		ckbox: {
			tokenUrl: TOKEN_URL,
			allowExternalImagesEditing: [ /^data:/, /^i.imgur.com\// ]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
