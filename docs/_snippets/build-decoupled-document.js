/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/*
 * This is a JavaScript version of CKEditor 5 Decoupled Document build.
 * It is used for all snippets used in the documentation to avoid importing a build source from the `src/` directory.
 * See: https://github.com/ckeditor/ckeditor5/issues/13552 to learn why it is a problem.
 */

// The editor creator to use.
import {
	DecoupledEditor as DecoupledEditorBase,
	Essentials,
	Alignment,
	FontSize,
	FontFamily,
	FontColor,
	FontBackgroundColor,
	Autoformat,
	Bold,
	Italic,
	Strikethrough,
	Underline,
	BlockQuote,
	CKBox,
	EasyImage,
	Heading,
	Image,
	ImageCaption,
	ImageResize,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	PictureEditing,
	Indent,
	IndentBlock,
	Link,
	List,
	ListProperties,
	MediaEmbed,
	Paragraph,
	PasteFromOffice,
	Table,
	TableToolbar,
	TextTransformation,
	CloudServices
} from 'ckeditor5';

export default class DecoupledEditor extends DecoupledEditorBase {
	static builtinPlugins = [
		Essentials,
		Alignment,
		FontSize,
		FontFamily,
		FontColor,
		FontBackgroundColor,
		Autoformat,
		Bold,
		Italic,
		Strikethrough,
		Underline,
		BlockQuote,
		CKBox,
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
		toolbar: {
			items: [
				'undo', 'redo',
				'|', 'heading',
				'|', 'fontfamily', 'fontsize', 'fontColor', 'fontBackgroundColor',
				'|', 'bold', 'italic', 'underline', 'strikethrough',
				'|', 'link', 'uploadImage', 'insertTable', 'blockQuote', 'mediaEmbed',
				'|', 'alignment',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
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
		},
		// This value must be kept in sync with the language defined in webpack.config.js.
		language: 'en'
	};
}
