/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	DecoupledEditor, Essentials, Alignment, FontSize, FontFamily, FontColor, FontBackgroundColor,
	CKFinderUploadAdapter, Autoformat, Bold, Italic, Strikethrough, Underline, BlockQuote, CKBox,
	CKFinder, EasyImage, Heading, Image, ImageCaption, ImageResize, ImageStyle, ImageToolbar,
	ImageUpload, PictureEditing, Indent, IndentBlock, Link, List, ListProperties, MediaEmbed,
	Paragraph, PasteFromOffice, Table, TableToolbar, TextTransformation, CloudServices
} from 'ckeditor5';

import './mini-inspector.css';

export class MiniInspectorEditor extends DecoupledEditor {
	static builtinPlugins = [
		Essentials,
		Alignment,
		FontSize,
		FontFamily,
		FontColor,
		FontBackgroundColor,
		CKFinderUploadAdapter,
		Autoformat,
		Bold,
		Italic,
		Strikethrough,
		Underline,
		BlockQuote,
		CKBox,
		CKFinder,
		CloudServices,
		EasyImage,
		Heading,
		Image,
		ImageCaption,
		ImageResize,
		ImageStyle,
		ImageToolbar,
		ImageUpload,
		Indent,
		IndentBlock,
		Link,
		List,
		ListProperties,
		MediaEmbed,
		Paragraph,
		PasteFromOffice,
		PictureEditing,
		Table,
		TableToolbar,
		TextTransformation
	];

	static defaultConfig = {
		removePlugins: [
			'CKBox'
		],
		toolbar: {
			items: [
				'heading',
				'|',
				'fontfamily',
				'fontsize',
				'fontColor',
				'fontBackgroundColor',
				'|',
				'bold',
				'italic',
				'underline',
				'strikethrough',
				'|',
				'alignment',
				'|',
				'numberedList',
				'bulletedList',
				'|',
				'outdent',
				'indent',
				'|',
				'link',
				'blockquote',
				'uploadImage',
				'insertTable',
				'mediaEmbed',
				'|',
				'undo',
				'redo'
			]
		},
		image: {
			resizeUnit: 'px',
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
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		},
		list: {
			properties: {
				styles: true,
				startIndex: true,
				reversed: true
			}
		}
	};
}
