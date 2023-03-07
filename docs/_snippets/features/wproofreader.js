/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';
import WProofreader from '@webspellchecker/wproofreader-ckeditor5/src/wproofreader';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

ClassicEditor
	.create( document.querySelector( '#snippet-wproofreader' ), {
		plugins: [ ArticlePluginSet, EasyImage, ImageUpload, CloudServices, WProofreader ],
		wproofreader: {
			serviceId: '1:Eebp63-lWHbt2-ASpHy4-AYUpy2-fo3mk4-sKrza1-NsuXy4-I1XZC2-0u2F54-aqYWd1-l3Qf14-umd',
			lang: 'auto',
			srcUrl: 'https://svc.webspellchecker.net/spellcheck31/wscbundle/wscbundle.js'
		},
		cloudServices: CS_CONFIG,
		toolbar: {
			items: [
				'undo', 'redo',
				'|', 'wproofreader',
				'|', 'heading',
				'|', 'bold', 'italic',
				'|', 'link', 'uploadImage', 'insertTable', 'mediaEmbed',
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
				'imageTextAlternative'
			]
		},
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ]
		}
	} )
	.then( editor => {
		window.editor = editor;

		window.attachTourBalloon( {
			target: window.findToolbarItem( editor.ui.view.toolbar,
				item => item.buttonView && item.buttonView.label && item.buttonView.label === 'WProofreader' ),
			text: 'Click for spell and grammar checking.',
			editor
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

// External source exclusion.
const metaElement = document.createElement( 'meta' );

metaElement.name = 'x-cke-crawler-ignore-patterns';
metaElement.content = JSON.stringify( {
	'request-failure': 'svc.webspellchecker.net',
	'console-error': [ 'Failed to load resources from' ]
} );

document.head.appendChild( metaElement );
