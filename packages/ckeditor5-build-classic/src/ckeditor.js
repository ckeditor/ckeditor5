/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// The editor creator to use.
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import Autolink from '@ckeditor/ckeditor5-link/src/autolink';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat';
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';

export default class ClassicEditor extends ClassicEditorBase {}

// Plugins to include in the build.
ClassicEditor.builtinPlugins = [
	Alignment,
	Autoformat,
	Autolink,
	Bold,
	Essentials,
	FontColor,
	FontFamily,
	FontSize,
	Italic,
	Link,
	List,
	Paragraph,
	RemoveFormat,
	TextTransformation,
	Underline,
];

// Editor configuration.
ClassicEditor.defaultConfig = {
	toolbar: {
		items: [
			'fontFamily',
			'fontSize',
			'fontColor',
			'|',
			'bold',
			'italic',
			'underline',
			'link',
			'|',
			'bulletedList',
			'numberedList',
			'|',
			'alignment:left',
			'alignment:center',
			'alignment:right',
		]
	},
	alignment: {
		options: [
			'left',
			'center',
			'right',
		]
	},
	// This value must be kept in sync with the language defined in webpack.config.js.
	language: 'en'
};
