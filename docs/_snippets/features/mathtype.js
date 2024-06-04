/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document, console */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';
import { TOKEN_URL } from '@ckeditor/ckeditor5-ckbox/tests/_utils/ckbox-config.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { ImageInsert, ImageUpload, PictureEditing } from '@ckeditor/ckeditor5-image';
import MathType from '@wiris/mathtype-ckeditor5';
import { CKBox, CKBoxImageEdit } from '@ckeditor/ckeditor5-ckbox';

ClassicEditor
	.create( document.querySelector( '#mathtype-editor' ), {
		plugins: [
			ArticlePluginSet,
			CKBox,
			CKBoxImageEdit,
			PictureEditing,
			ImageUpload,
			ImageInsert,
			CloudServices,
			MathType
		],
		toolbar: {
			items: [
				'undo', 'redo', '|', 'heading',
				'|', 'bold', 'italic',
				'|', 'link', 'insertImage', 'insertTable', 'mediaEmbed', '|', 'MathType', 'ChemType',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
			]
		},
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
		ckbox: {
			tokenUrl: TOKEN_URL,
			forceDemoLabel: true,
			allowExternalImagesEditing: [ /^data:/, 'origin', /ckbox/ ]
		},
		image: {
			toolbar: [
				'imageStyle:inline',
				'imageStyle:wrapText',
				'imageStyle:breakText',
				'|',
				'toggleImageCaption',
				'imageTextAlternative',
				'|',
				'ckboxImageEdit'
			]
		},
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ]
		},
		cloudServices: CS_CONFIG
	} )

	.then( editor => {
		window.editor = editor;

		window.attachTourBalloon( {
			target: window.findToolbarItem( editor.ui.view.toolbar,
				item => item.label && item.label === 'Insert a math equation - MathType' ),
			text: 'Click to insert mathematical or chemical formulas.',
			editor
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
