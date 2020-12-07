/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// The editor creator to use.
import DecoupledEditorBase from '@ckeditor/ckeditor5-editor-decoupled/src/decouplededitor';
import { Paragraph } from 'ckeditor5/src/paragraph';
import { Clipboard } from 'ckeditor5/src/clipboard';
import { Enter, ShiftEnter } from 'ckeditor5/src/enter';
import { Typing } from 'ckeditor5/src/typing';
import { Undo } from 'ckeditor5/src/undo';
import { SelectAll } from 'ckeditor5/src/selectall';

export default class DecoupledEditor extends DecoupledEditorBase {}

// Plugins to include in the build.
DecoupledEditor.builtinPlugins = [
	Clipboard,
	Enter,
	Paragraph,
	SelectAll,
	ShiftEnter,
	Typing,
	Undo
];

// Editor configuration.
DecoupledEditor.defaultConfig = {
	toolbar: {
		items: [
			'undo',
			'redo'
		]
	},
	// This value must be kept in sync with the language defined in webpack.config.js.
	language: 'en'
};
