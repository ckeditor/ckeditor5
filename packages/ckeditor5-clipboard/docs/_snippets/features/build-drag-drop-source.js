/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

//
// Editors and default plugins.
//

import { ClassicEditor as ClassicEditorBase } from '@ckeditor/ckeditor5-editor-classic';
import { BalloonEditor as BalloonEditorBase } from '@ckeditor/ckeditor5-editor-balloon';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { CKBox, CKBoxImageEdit } from '@ckeditor/ckeditor5-ckbox';
import { Heading } from '@ckeditor/ckeditor5-heading';
import {
	Image,
	ImageInsert,
	ImageCaption,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	PictureEditing,
	ImageResize,
	AutoImage
} from '@ckeditor/ckeditor5-image';
import { Indent } from '@ckeditor/ckeditor5-indent';
import { Link, LinkImage } from '@ckeditor/ckeditor5-link';
import { List } from '@ckeditor/ckeditor5-list';
import { MediaEmbed } from '@ckeditor/ckeditor5-media-embed';
import { PasteFromOffice } from '@ckeditor/ckeditor5-paste-from-office';
import { Table, TableToolbar } from '@ckeditor/ckeditor5-table';
import { TextTransformation } from '@ckeditor/ckeditor5-typing';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { Font } from '@ckeditor/ckeditor5-font';
import { HorizontalLine } from '@ckeditor/ckeditor5-horizontal-line';

import { TOKEN_URL } from '@ckeditor/ckeditor5-ckbox/tests/_utils/ckbox-config.js';

//
// Plugins for specific scenarios.
//

import {
	DragDrop,
	DragDropBlockToolbar
} from '@ckeditor/ckeditor5-clipboard';
import { BlockToolbar } from '@ckeditor/ckeditor5-ui';
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
	language: 'en',
	licenseKey: 'GPL'
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
