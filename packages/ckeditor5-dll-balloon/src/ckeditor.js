/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// The editor creator to use.

import { BalloonEditor as BalloonEditorBase } from '@ckeditor/ckeditor5-editor-balloon/ballooneditor';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph/paragraph';
import { Clipboard } from '@ckeditor/ckeditor5-clipboard/clipboard';
import { Enter, ShiftEnter } from '@ckeditor/ckeditor5-enter/enter';
import { Typing } from '@ckeditor/ckeditor5-typing/typing';
import { Undo } from '@ckeditor/ckeditor5-undo/undo';
import { SelectAll } from '@ckeditor/ckeditor5-select-all/selectall';

export default class BalloonEditor extends BalloonEditorBase {}

// Plugins to include in the build.
BalloonEditor.builtinPlugins = [
	Clipboard,
	Enter,
	SelectAll,
	ShiftEnter,
	Typing,
	Undo,
	Paragraph
];

// Editor configuration.
BalloonEditor.defaultConfig = {
	toolbar: {
		items: [
			'undo',
			'redo'
		]
	},
	// This value must be kept in sync with the language defined in webpack.config.js.
	language: 'en'
};
