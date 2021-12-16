/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global CKEditorInspector, document, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';
import ImageUpload from '../../src/imageupload';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

const TOOLBAR_CONFIG = [
	'heading',
	'|',
	'bold',
	'italic',
	'link',
	'bulletedList',
	'numberedList',
	'blockQuote',
	'uploadImage',
	'insertTable',
	'mediaEmbed',
	'undo',
	'redo'
];

const PLUGINS_CONFIG = [
	ArticlePluginSet,
	CloudServices,
	ImageUpload,
	EasyImage
];

startEditors();

async function startEditors() {
	window.editorSemantic = await ClassicEditor.create( document.querySelector( '#editor-semantic' ), {
		cloudServices: CS_CONFIG,
		plugins: PLUGINS_CONFIG,
		toolbar: TOOLBAR_CONFIG,
		image: {
			toolbar: [
				'imageStyle:inline',
				'imageStyle:block',
				'imageStyle:side',
				'|',
				'toggleImageCaption',
				'imageTextAlternative'
			]
		}
	} );

	window.editorFormatting = await ClassicEditor.create( document.querySelector( '#editor-formatting' ), {
		cloudServices: CS_CONFIG,
		plugins: PLUGINS_CONFIG,
		toolbar: TOOLBAR_CONFIG,
		image: {
			toolbar: [
				'imageStyle:inline',
				'imageStyle:wrapText',
				'imageStyle:breakText',
				'|',
				'toggleImageCaption',
				'imageTextAlternative'
			]
		}
	} );

	window.editorWithDropdown = await ClassicEditor.create( document.querySelector( '#editor-with-dropdown' ), {
		cloudServices: CS_CONFIG,
		plugins: PLUGINS_CONFIG,
		toolbar: TOOLBAR_CONFIG,
		image: {
			toolbar: [
				{
					name: 'imageStyle:inlineImages',
					title: 'Inline image',
					defaultItem: 'imageStyle:inline',
					items: [ 'imageStyle:inline', 'imageStyle:alignLeft', 'imageStyle:alignRight' ]
				}, {
					name: 'imageStyle:blockImages',
					title: 'Block image',
					defaultItem: 'imageStyle:block',
					items: [ 'imageStyle:alignBlockLeft', 'imageStyle:block', 'imageStyle:alignBlockRight' ]
				},
				'|',
				'toggleImageCaption'
			]
		}
	} );

	CKEditorInspector.attach( {
		semantic: window.editorSemantic,
		formatting: window.editorFormatting,
		withDropdown: window.editorWithDropdown
	} );
}

