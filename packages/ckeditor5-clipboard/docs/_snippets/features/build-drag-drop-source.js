/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	ClassicEditor as ClassicEditorBase,
	BalloonEditor as BalloonEditorBase,
	Essentials,
	Alignment,
	Autoformat,
	Bold,
	Italic,
	BlockQuote,
	CKBox,
	CKBoxImageEdit,
	Heading,
	Image,
	ImageInsert,
	ImageCaption,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	PictureEditing,
	ImageResize,
	AutoImage,
	Indent,
	Link,
	LinkImage,
	List,
	MediaEmbed,
	PasteFromOffice,
	Table,
	TableToolbar,
	TextTransformation,
	CloudServices,
	Font,
	HorizontalLine,
	DragDrop,
	DragDropBlockToolbar,
	BlockToolbar
} from 'ckeditor5';

import {
	TOKEN_URL,
	getViewportTopOffsetConfig
} from '@snippets/index.js';

import { HCardEditing } from './hcard.js';

const defaultPlugins = [
	Essentials,
	Autoformat,
	Alignment,
	Bold,
	Italic,
	BlockQuote,
	CKBox,
	CKBoxImageEdit,
	CloudServices,
	Heading,
	Image,
	ImageInsert,
	ImageCaption,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	ImageResize,
	AutoImage,
	LinkImage,
	Indent,
	Link,
	List,
	MediaEmbed,
	PasteFromOffice,
	PictureEditing,
	Table,
	TableToolbar,
	TextTransformation,
	Font,
	HorizontalLine
];

const defaultToolbar = {
	items: [
		'undo',
		'redo',
		'|',
		'heading',
		'|',
		'bold',
		'italic',
		'|',
		'link',
		'insertImage',
		'insertTable',
		'mediaEmbed',
		'horizontalLine',
		'|',
		'bulletedList',
		'numberedList',
		'outdent',
		'indent'
	]
};

const defaultConfig = {
	toolbar: defaultToolbar,
	image: {
		toolbar: [
			'imageStyle:inline',
			'imageStyle:block',
			'imageStyle:wrapText',
			'|',
			'toggleImageCaption',
			'imageTextAlternative',
			'|',
			'ckboxImageEdit'
		]
	},
	table: {
		contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ]
	},
	ui: {
		viewportOffset: {
			top: getViewportTopOffsetConfig()
		}
	},
	ckbox: {
		tokenUrl: TOKEN_URL,
		allowExternalImagesEditing: [ /^data:/, 'origin', /ckbox/ ],
		forceDemoLabel: true
	},
	fontFamily: {
		supportAllValues: true
	},
	fontSize: {
		options: [ 10, 12, 14, 'default', 18, 20, 22 ],
		supportAllValues: true
	},
	language: 'en'
};

export class DragDropEditor extends ClassicEditorBase {
	static builtinPlugins = [
		...defaultPlugins,
		HCardEditing
	];

	static defaultConfig = defaultConfig;
}

export class ClassicEditorExperimental extends ClassicEditorBase {
	static builtinPlugins = [
		...defaultPlugins,
		DragDrop
	];

	static defaultConfig = defaultConfig;
}

export class BalloonEditorExperimental extends BalloonEditorBase {
	static builtinPlugins = [
		...defaultPlugins,
		DragDrop,
		DragDropBlockToolbar,
		BlockToolbar
	];

	static defaultConfig = {
		...defaultConfig,
		toolbar: undefined,
		balloonToolbar: undefined,
		blockToolbar: defaultToolbar
	};
}
