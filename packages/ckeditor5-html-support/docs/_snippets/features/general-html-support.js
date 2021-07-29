/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';

import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport';

import './general-html-support.css';

ClassicEditor
	.create( document.querySelector( '#snippet-general-html-support' ), {
		plugins: [
			ArticlePluginSet,
			Code,
			EasyImage,
			ImageUpload,
			CloudServices,
			SourceEditing,
			GeneralHtmlSupport
		],
		toolbar: {
			items: [
				'heading',
				'|',
				'bold',
				'italic',
				'code',
				'bulletedList',
				'numberedList',
				'|',
				'outdent',
				'indent',
				'|',
				'blockQuote',
				'link',
				'mediaEmbed',
				'insertTable',
				'|',
				'undo',
				'redo',
				'|',
				'sourceEditing'
			],
			viewportTopOffset: window.getViewportTopOffsetConfig()
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
		},
		cloudServices: CS_CONFIG,

		htmlSupport: {
			allow: [
				// Enables all HTML features.
				{
					name: /.*/,
					attributes: true,
					classes: true,
					styles: true
				}
			]
		}
	} )
	.then( editor => {
		window.editor = editor;

		window.attachTourBalloon( {
			target: window.findToolbarItem( editor.ui.view.toolbar,
				item => item.label && item.label === 'Source' ),
			text: 'Switch to the source mode to check out the source of the content and play with it.',
			editor,
			tippyOptions: {
				placement: 'bottom-end'
			}
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
