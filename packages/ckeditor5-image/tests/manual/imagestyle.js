/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global CKEditorInspector, document, console, window */

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

ClassicEditor
	.create( document.querySelector( '#editor-semantic' ), {
		cloudServices: CS_CONFIG,
		plugins: PLUGINS_CONFIG,
		toolbar: TOOLBAR_CONFIG,
		image: {
			styles: {
				arrangements: [ 'full', 'side' ],
				groups: []
			},
			toolbar: [
				'imageStyle:full',
				'imageStyle:side',
				'|',
				'toggleImageCaption',
				'imageTextAlternative'
			]
		}
	} )
	.then( editor => {
		window.editorSemantic = editor;

		CKEditorInspector.attach( { semantic: editor } );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

ClassicEditor
	.create( document.querySelector( '#editor-formatting' ), {
		cloudServices: CS_CONFIG,
		plugins: PLUGINS_CONFIG,
		toolbar: TOOLBAR_CONFIG,
		image: {
			styles: {
				arrangements: [ 'alignLeft', 'alignCenter', 'alignRight' ],
				groups: []
			},
			toolbar: [
				'imageStyle:alignLeft',
				'imageStyle:alignCenter',
				'imageStyle:alignRight',
				'|',
				'toggleImageCaption',
				'imageTextAlternative'
			]
		}
	} )
	.then( editor => {
		window.editorFormatting = editor;

		CKEditorInspector.attach( { formatting: editor } );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

ClassicEditor
	.create( document.querySelector( '#editor-inline' ), {
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
	} )
	.then( editor => {
		window.editorInline = editor;

		CKEditorInspector.attach( { inline: editor } );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
