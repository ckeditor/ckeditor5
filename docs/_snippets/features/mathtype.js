/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document, console */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import { EasyImage } from '@ckeditor/ckeditor5-easy-image';
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
			EasyImage,
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
