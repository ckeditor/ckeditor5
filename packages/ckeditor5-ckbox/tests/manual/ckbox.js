/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload.js';
import ImageInsert from '@ckeditor/ckeditor5-image/src/imageinsert.js';
import LinkImageEditing from '@ckeditor/ckeditor5-link/src/linkimageediting.js';
import PictureEditing from '@ckeditor/ckeditor5-image/src/pictureediting.js';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices.js';
import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage.js';
import AutoSave from '@ckeditor/ckeditor5-autosave/src/autosave.js';
import { TOKEN_URL } from '../_utils/ckbox-config.js';
import CKBox from '../../src/ckbox.js';
import CKBoxImageEdit from '../../src/ckboximageedit.js';

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
				'imageStyle:wrapText',
				'|',
				'toggleImageCaption',
				'imageTextAlternative',
				'|',
				'ckboxImageEdit'
			]
		},
		ckbox: {
			tokenUrl: TOKEN_URL,
			forceDemoLabel: true,
			allowExternalImagesEditing: [ /^data:/, /^i.imgur.com\//, 'origin' ],
			downloadableFiles: asset => asset.data.extension !== 'pdf'
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
