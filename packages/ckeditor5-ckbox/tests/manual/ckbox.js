/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { ImageUpload, ImageInsert, PictureEditing } from '@ckeditor/ckeditor5-image';
import { LinkImageEditing, LinkImage } from '@ckeditor/ckeditor5-link';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { Autosave } from '@ckeditor/ckeditor5-autosave';
import { TOKEN_URL } from '../_utils/ckbox-config.js';
import { CKBox } from '../../src/ckbox.js';
import { CKBoxImageEdit } from '../../src/ckboximageedit.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			ArticlePluginSet, PictureEditing, ImageUpload, LinkImageEditing,
			ImageInsert, CloudServices, CKBox, LinkImage, CKBoxImageEdit, Autosave
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
