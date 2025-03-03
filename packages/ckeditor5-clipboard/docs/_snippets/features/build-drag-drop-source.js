/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals window */

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

import { TOKEN_URL } from '@ckeditor/ckeditor5-ckbox/tests/_utils/ckbox-config.js';
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
			top: window.getViewportTopOffsetConfig()
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

class ClassicEditor extends ClassicEditorBase {}
ClassicEditor.builtinPlugins = [ ...defaultPlugins, HCardEditing ];
ClassicEditor.defaultConfig = defaultConfig;

class ClassicEditorExperimental extends ClassicEditorBase {}
ClassicEditorExperimental.builtinPlugins = [
	...defaultPlugins,
	DragDrop
];
ClassicEditorExperimental.defaultConfig = defaultConfig;

class BalloonEditorExperimental extends BalloonEditorBase {}
BalloonEditorExperimental.builtinPlugins = [
	...defaultPlugins,
	DragDrop,
	DragDropBlockToolbar,
	BlockToolbar
];

BalloonEditorExperimental.defaultConfig = {
	...defaultConfig,
	blockToolbar: defaultToolbar
};

// Remove not needed toolbars.
delete BalloonEditorExperimental.defaultConfig.toolbar;
delete BalloonEditorExperimental.defaultConfig.balloonToolbar;

window.ClassicEditor = ClassicEditor;
window.ClassicEditorExperimental = ClassicEditorExperimental;
window.BalloonEditorExperimental = BalloonEditorExperimental;
