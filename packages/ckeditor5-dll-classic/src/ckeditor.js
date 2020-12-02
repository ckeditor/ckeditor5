/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// The editor creator to use.
import { ClassicEditor as ClassicEditorBase } from '@ckeditor/ckeditor5-dll/classiceditor';

import { Paragraph } from '@ckeditor/ckeditor5-dll/paragraph';
import { Clipboard } from '@ckeditor/ckeditor5-dll/clipboard';
import { Enter, ShiftEnter } from '@ckeditor/ckeditor5-dll/enter';
import { Typing } from '@ckeditor/ckeditor5-dll/typing';
import { Undo } from '@ckeditor/ckeditor5-dll/undo';
import { SelectAll } from '@ckeditor/ckeditor5-dll/selectall';

export default class ClassicEditor extends ClassicEditorBase {}

// Plugins to include in the build.
ClassicEditor.builtinPlugins = [
	Clipboard,
	Enter,
	SelectAll,
	ShiftEnter,
	Typing,
	Undo,
	Paragraph
];

// Editor configuration.
ClassicEditor.defaultConfig = {
	toolbar: {
		items: [
			'undo',
			'redo'
		]
	},
	// This value must be kept in sync with the language defined in webpack.config.js.
	language: 'en'
};
