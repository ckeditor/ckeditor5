/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals window */

import {
	ClassicEditor as ClassicEditorBase,
	BalloonEditor as BalloonEditorBase,
	Essentials,
	CKFinderUploadAdapter,
	Autoformat,
	Bold,
	Italic,
	BlockQuote,
	CKBox,
	CKBoxImageEdit,
	Heading,
	Image,
	ImageCaption,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	ImageInsert,
	PictureEditing,
	Indent,
	Link,
	List,
	MediaEmbed,
	Paragraph,
	PasteFromOffice,
	Table,
	TableToolbar,
	TextTransformation,
	CloudServices,
	WordCount
} from 'ckeditor5';

export class BalloonEditor extends BalloonEditorBase {
}

const builtinPlugins = [
	Essentials,
	CKFinderUploadAdapter,
	Autoformat,
	Bold,
	Italic,
	BlockQuote,
	CKBox,
	CKBoxImageEdit,
	CloudServices,
	Heading,
	Image,
	ImageCaption,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	ImageInsert,
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

BalloonEditor.builtinPlugins = builtinPlugins.slice();

BalloonEditor.defaultConfig = {
	toolbar: {
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
			'insertImage',
			'ckbox',
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

class ClassicEditor extends ClassicEditorBase {
}

ClassicEditor.builtinPlugins = builtinPlugins.slice();

ClassicEditor.defaultConfig = {
	toolbar: {
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
			'insertImage',
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

ClassicEditor.builtinPlugins.push( WordCount );
BalloonEditor.builtinPlugins.push( WordCount );

window.ClassicEditor = ClassicEditor;
window.BalloonEditor = BalloonEditor;
