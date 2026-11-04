/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { ImageUpload, ImageInsert, PictureEditing } from '@ckeditor/ckeditor5-image';
import { LinkImageEditing, LinkImage } from '@ckeditor/ckeditor5-link';
import { Fullscreen } from '@ckeditor/ckeditor5-fullscreen';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { TOKEN_URL } from '../tests/_utils/ckbox-config.js';
import { CKBox, CKBoxImageEdit } from '../src/index.js';

import { createEditorDomRoot, getOverlayConfig } from '@ckeditor/ckeditor5-ui/manual/_utils/shadow.js';

const editorDomRoot = createEditorDomRoot( document.getElementById( 'mount' )!, {
	template: document.getElementById( 'editor-template' ) as HTMLTemplateElement
} );

ClassicEditor
	.create( {
		attachTo: editorDomRoot.querySelector( '#editor' ) as HTMLElement,
		plugins: [
			ArticlePluginSet, PictureEditing, ImageUpload, LinkImageEditing,
			ImageInsert, CloudServices, CKBox, LinkImage, CKBoxImageEdit,
			Fullscreen
		],
		toolbar: [
			'fullscreen',
			'|',
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
		},
		...getOverlayConfig()
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
