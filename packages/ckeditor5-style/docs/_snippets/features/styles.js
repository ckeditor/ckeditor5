/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document, setTimeout */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline';
import Style from '@ckeditor/ckeditor5-style/src/style';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport';
import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

ClassicEditor
	.create( document.querySelector( '#snippet-styles' ), {
		plugins: [
			ArticlePluginSet, EasyImage, ImageUpload, CloudServices,
			Code, CodeBlock, Strikethrough, HorizontalLine, GeneralHtmlSupport, Style
		],
		toolbar: {
			items: [
				'style',
				'|',
				'heading',
				'|',
				'bold',
				'italic',
				'strikethrough',
				'link',
				'|',
				'bulletedList',
				'numberedList',
				'|',
				'code',
				'codeBlock',
				'|',
				'uploadImage',
				'blockQuote',
				'horizontalLine'
			],
			shouldNotGroupWhenFull: true
		},
		style: {
			definitions: [
				{
					name: 'Red heading',
					element: 'h2',
					classes: [ 'red-heading' ]
				},
				{
					name: 'Large heading',
					element: 'h2',
					classes: [ 'large-heading' ]
				},
				{
					name: 'Rounded container',
					element: 'p',
					classes: [ 'rounded-container' ]
				},
				{
					name: 'Large preview',
					element: 'p',
					classes: [ 'large-preview' ]
				},
				{
					name: 'Bold table',
					element: 'table',
					classes: [ 'bold-table' ]
				},
				{
					name: 'Facncy table',
					element: 'table',
					classes: [ 'fancy-table' ]
				},
				{
					name: 'Colorfull cell',
					element: 'td',
					classes: [ 'colorful-cell' ]
				},
				{
					name: 'Vibrant code',
					element: 'pre',
					classes: [ 'vibrant-code' ]
				},
				{
					name: 'Marker',
					element: 'span',
					classes: [ 'marker' ]
				},
				{
					name: 'Typewriter',
					element: 'span',
					classes: [ 'typewriter' ]
				},
				{
					name: 'Deleted text',
					element: 'span',
					classes: [ 'deleted' ]
				},
				{
					name: 'Cited work',
					element: 'span',
					classes: [ 'cited', 'another-class' ]
				},
				{
					name: 'Small text',
					element: 'span',
					classes: [ 'small' ]
				},
				{
					name: 'Very long name of the style',
					element: 'span',
					classes: [ 'foo' ]
				}
			]
		},
		image: {
			toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|', 'toggleImageCaption', 'imageTextAlternative' ]
		},
		codeBlock: {
			languages: [
				{ language: 'css', label: 'CSS' },
				{ language: 'html', label: 'HTML' },
				{ language: 'javascript', label: 'JavaScript' },
				{ language: 'php', label: 'PHP' }
			]
		},
		cloudServices: CS_CONFIG,
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		}
	} )
	.then( editor => {
		window.editor = editor;

		const outputElement = document.querySelector( '#snippet-styles' );

		editor.model.document.on( 'change', () => {
			outputElement.innerText = editor.getData();
		} );

		// Set the initial data with delay so hightlight.js doesn't catch it.
		setTimeout( () => {
			outputElement.innerText = editor.getData();
		}, 500 );

		window.attachTourBalloon( {
			target: window.findToolbarItem( editor.ui.view.toolbar,
				item => item.buttonView && item.buttonView.label === 'Styles' ),
			text: 'Click to apply styles.',
			editor,
			tippyOptions: {
				placement: 'bottom-start'
			}
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
