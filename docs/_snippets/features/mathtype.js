/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document, console */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import MathType from '@wiris/mathtype-ckeditor5';
import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

ClassicEditor
	.create( document.querySelector( '#mathtype-editor' ), {
		plugins: [
			ArticlePluginSet,
			EasyImage,
			MathType
		],
		toolbar: {
			items: [
				'heading',
				'|',
				'bold',
				'italic',
				'bulletedList',
				'numberedList',
				'|',
				'outdent',
				'indent',
				'|',
				'MathType',
				'ChemType',
				'|',
				'blockQuote',
				'link',
				'mediaEmbed',
				'insertTable',
				'|',
				'undo',
				'redo'
			],
			viewportTopOffset: window.getViewportTopOffsetConfig()
		},
		image: {
			styles: [
				'full',
				'alignLeft',
				'alignRight'
			],
			toolbar: [
				'imageStyle:alignLeft',
				'imageStyle:full',
				'imageStyle:alignRight',
				'|',
				'imageTextAlternative'
			]
		},
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ]
		},
		cloudServices: CS_CONFIG
	} )
	.catch( err => {
		console.error( err.stack );
	} );
