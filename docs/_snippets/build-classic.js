/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/*
 * This is a JavaScript version of CKEditor 5 Classic build.
 * It is used for all snippets used in the documentation to avoid importing a build source from the `src/` directory.
 * See: https://github.com/ckeditor/ckeditor5/issues/13552 to learn why it is a problem.
 */

// The editor creator to use.
import {
	ClassicEditor as ClassicEditorBase, Essentials, Autoformat, Bold, Italic, BlockQuote, CKBox, EasyImage, Heading,
	Image, ImageCaption, ImageStyle, ImageToolbar, ImageUpload, PictureEditing, Indent, Link, List, MediaEmbed,
	Paragraph, PasteFromOffice, Table, TableToolbar, TextTransformation, CloudServices
} from 'ckeditor5';

export default class ClassicEditor extends ClassicEditorBase {
	static builtinPlugins = [
		Essentials,
		Autoformat,
		Bold,
		Italic,
		BlockQuote,
		CloudServices,
		EasyImage,
		Heading,
		Image,
		ImageCaption,
		ImageStyle,
		ImageToolbar,
		ImageUpload,
		CKBox,
		Indent,
		Link,
		List,
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
				'|', 'bold', 'italic',
				'|', 'link', 'uploadImage', 'insertTable', 'blockQuote', 'mediaEmbed',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
			]
		},
		image: {
			toolbar: [
				'imageStyle:inline',
				'imageStyle:block',
				'imageStyle:wrapText',
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
		// This value must be kept in sync with the language defined in webpack.config.js.
		language: 'en'
	};
}
