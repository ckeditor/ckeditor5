/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

/* config { "type": "DLL" } */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

const { CKEditor5 } = window;
const { ClassicEditor } = CKEditor5.editorClassic;
const { Essentials } = CKEditor5.essentials;
const { UploadAdapter } = CKEditor5.adapterCkfinder;
const { Autoformat } = CKEditor5.autoformat;
const { Bold, Italic } = CKEditor5.basicStyles;
const { BlockQuote } = CKEditor5.blockQuote;
const { CKFinder } = CKEditor5.ckfinder;
const { CloudServices } = CKEditor5.cloudServices;
const { EasyImage } = CKEditor5.easyImage;
const { Heading } = CKEditor5.heading;
const { Image, ImageCaption, ImageStyle, ImageUpload, ImageToolbar, ImageInsert, AutoImage } = CKEditor5.image;
const { Indent } = CKEditor5.indent;
const { Link } = CKEditor5.link;
const { List } = CKEditor5.list;
const { MediaEmbed } = CKEditor5.mediaEmbed;
const { Paragraph } = CKEditor5.paragraph;
const { PasteFromOffice } = CKEditor5.pasteFromOffice;
const { Table, TableToolbar } = CKEditor5.table;
const { TextTransformation } = CKEditor5.typing;

ClassicEditor
	.create( document.querySelector( '#snippet-dll-builds-demo' ), {
		plugins: [
			Essentials,
			UploadAdapter,
			Autoformat,
			Bold,
			Italic,
			BlockQuote,
			CKFinder,
			CloudServices,
			EasyImage,
			Heading,
			Image,
			ImageCaption,
			ImageStyle,
			ImageToolbar,
			ImageUpload,
			ImageInsert,
			AutoImage,
			Indent,
			Link,
			List,
			MediaEmbed,
			Paragraph,
			PasteFromOffice,
			Table,
			TableToolbar,
			TextTransformation
		],
		toolbar: {
			viewportTopOffset: window.getViewportTopOffsetConfig(),
			items: [
				'heading',
				'|',
				'bold',
				'italic',
				'link',
				'bulletedList',
				'numberedList',
				'|',
				'outdent',
				'indent',
				'|',
				'uploadImage',
				'blockQuote',
				'insertTable',
				'mediaEmbed',
				'undo',
				'redo'
			]
		},
		image: {
			toolbar: [
				'imageStyle:inline',
				'imageStyle:block',
				'imageStyle:side',
				'|',
				'toggleImageCaption',
				'imageTextAlternative'
			]
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		},
		cloudServices: CS_CONFIG
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err );
	} );
